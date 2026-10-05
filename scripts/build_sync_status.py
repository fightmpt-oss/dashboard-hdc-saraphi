"""Build data/sync_status.json — per-table data freshness for the
"OpenData MoPH" menu status banner (row counts + HDC compile dates + ok),
in the spirit of ncd.in.th's admin report list.

Sources (all local, offline step):
- saraphi_complete_master.json  → the 20+ curated main indicators; raw
  snapshots data/s_<table>_<year>.json provide rows + date_com
- ncd_service_plan_master.json  → 36 NCD reports; refresh_ncd_data.py stores
  per-report sync_info {year: {saraphi_rows, date_com}}
- pcc_2569_master.json          → 4 PCC 2569 KPIs (from Excel R.1, no raw API
  snapshots — marked source: xlsx)
"""
import json
import os
import sys
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from saraphi_config import SARAPHI_UNITS  # noqa: F401 (config sanity check)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
YEARS = ["2569", "2568", "2567"]


def raw_stats(table):
    """Per-year stats from data/s_<table>_<year>.json raw snapshots."""
    out = {}
    for y in YEARS:
        path = os.path.join(DATA, f"{table}_{y}.json")
        if not os.path.exists(path):
            continue
        try:
            with open(path, encoding="utf-8") as f:
                rows = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue
        dates = [str(r.get("date_com") or "") for r in rows if r.get("date_com")]
        out[y] = {"saraphi_rows": len(rows), "date_com": max(dates) if dates else ""}
    return out


def load_catalog_urls():
    """source_table → HDC report URL (จากแคตตาล็อก OpenData) สำหรับปุ่มเทียบ HDC"""
    path = os.path.join(DATA, "moph_catalog.json")
    urls = {}
    try:
        with open(path, encoding="utf-8") as f:
            cat = json.load(f)
        items = cat if isinstance(cat, list) else cat.get("data") or []
        for it in items:
            st = it.get("source_table")
            oid = it.get("opendata_id")
            if st and oid and st not in urls:
                urls[st] = f"https://hdc.moph.go.th/cmi/public/standard-report-detail/{oid}"
    except (json.JSONDecodeError, OSError):
        pass

    # Explicit manual mapping for reports whose opendata_id is not in catalog
    from saraphi_config import STATIC_HDC_URLS
    for st, u in STATIC_HDC_URLS.items():
        urls[st] = u

    # Auto-extract from raw snapshot files if id is a 32-char hex string
    import glob, re
    for path in glob.glob(os.path.join(DATA, "s_*_2569.json")):
        tbl = os.path.basename(path).replace("_2569.json", "")
        if tbl not in urls:
            try:
                with open(path, encoding="utf-8") as f:
                    rows = json.load(f)
                if rows and isinstance(rows, list):
                    rid = rows[0].get("id")
                    if rid and re.match(r"^[0-9a-f]{32}$", str(rid)):
                        urls[tbl] = f"https://hdc.moph.go.th/cmi/public/standard-report-detail/{rid}"
            except Exception:
                pass
    return urls


def main():
    catalog_urls = load_catalog_urls()
    with open(os.path.join(DATA, "saraphi_complete_master.json"), encoding="utf-8") as f:
        main_master = json.load(f)
    with open(os.path.join(DATA, "ncd_service_plan_master.json"), encoding="utf-8") as f:
        ncd_master = json.load(f)

    tables = []

    # 1) Main curated indicators (raw API snapshots)
    seen_tables = set()
    for ind_id, ind in main_master.get("indicators", {}).items():
        table = ind.get("table")
        if not table or table in seen_tables or table.startswith("MeData"):
            continue
        seen_tables.add(table)
        years = raw_stats(table)
        tables.append({
            "id": ind_id,
            "table": table,
            "label": ind.get("name"),
            "group": ind.get("domain_label") or ind.get("domain"),
            "source": "opendata",
            "years": years,
            "hdc_url": catalog_urls.get(table),
            "ok": bool(years),
        })

    # 2) NCD Service Plan reports (sync_info written by refresh_ncd_data.py)
    for rep in ncd_master.get("reports", []):
        info = rep.get("sync_info") or {}
        years = {y: {"saraphi_rows": v.get("saraphi_rows", 0), "date_com": v.get("date_com", "")}
                 for y, v in info.items()}
        tables.append({
            "id": rep.get("id"),
            "table": rep.get("table_name"),
            "label": rep.get("name"),
            "group": f"Service Plan NCDs ({rep.get('category')})",
            "source": "opendata",
            "years": years,
            "hdc_url": rep.get("hdc_url"),
            "ok": bool(years),
        })

    # 3) PCC 2569 KPIs (from Excel R.1 — no per-year raw snapshots)
    pcc_path = os.path.join(DATA, "pcc_2569_master.json")
    if os.path.exists(pcc_path):
        with open(pcc_path, encoding="utf-8") as f:
            pcc = json.load(f)
        updated = (pcc.get("metadata") or {}).get("updated_at") or (pcc.get("metadata") or {}).get("generated_at") or ""
        for k in ("kpi1", "kpi2", "kpi3", "kpi4"):
            d = (pcc.get("saraphi_district") or {}).get(k) or {}
            tables.append({
                "id": f"pcc69_{k}",
                "table": "PCC_69_R.1",
                "label": f"งบ PCC 2569 {k.upper()}",
                "group": "งบ PCC 2569 (P4P)",
                "source": "xlsx",
                "years": {"2569": {"saraphi_rows": len(pcc.get("units") or {}), "date_com": updated}},
                "hdc_url": None,
                "ok": bool(d),
            })

    ok_count = sum(1 for t in tables if t["ok"])
    status = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "pipeline_ok": ok_count == len(tables),
        "masters": {
            "saraphi_complete_master": (main_master.get("metadata") or {}).get("generated_at"),
            "ncd_service_plan_master": ncd_master.get("last_updated"),
            "ncd_total_reports": len(ncd_master.get("reports", [])),
        },
        "counts": {"tables": len(tables), "ok": ok_count},
        "tables": tables,
    }

    out_path = os.path.join(DATA, "sync_status.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(status, f, ensure_ascii=False, indent=2)
    print(f"Saved {out_path}: {len(tables)} tables ({ok_count} ok)")


if __name__ == "__main__":
    main()

"""Refresh ALL Service Plan NCD reports (the active registry) from the live
OpenData MoPH API and rewrite data/ncd_service_plan_master.json.

Nightly automation for .github/workflows/auto-fetch.yml (Task 3 of
docs/HANDOVER_ZAI_NCD_INTEGRATION.md). Replaces the one-off
extract_all_ncd_service_plan.py:

- Registry-driven: iterates the reports already stored in the master,
  deduplicated by table_name (HDC's own catalog lists s_ht_control twice
  under report_id 146/430 — the duplicate is dropped) so only active tables
  with real data are fetched.
- Dispatch by report type:
  * s_dm_control / s_ht_control / s_dm_hba1c → reuse the enrichment modules:
    their fetch_year_data() already aggregates the HDC 20/21-column schemas
    and writes raw snapshots to data/ for build_saraphi_master.py
  * s_dm_screen_risk / s_ht_screen_risk → reuse enrich_risk_screening_data
  * s_dm_hypo → dedicated aggregation (its columns are REVERSED vs other
    tables — see patch_ncd_hypo.py); raw snapshots written for the same reason
  * everything else → generic dual-group aggregation over the 14 units:
      Typearea:  target / result / result1 / result2
      ChronicFU: target_1 / result_1 / result1_1 / result2_1
- Network: shared fetch_opendata_rows (paginated, 429/5xx backoff, fail-loud),
  ~1s pause between tables. Exits 1 if any report/year failed (the master is
  still saved with all successful updates first so CI commits the progress).
"""
import importlib
import json
import os
import sys
import time
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from saraphi_config import SARAPHI_UNITS, fetch_opendata_rows

import enrich_dm_control_master_data as dm_mod
import enrich_ht_control_master_data as ht_mod
import enrich_hba1c_master_data as hba1c_mod
import enrich_risk_screening_data as risk_mod
import patch_ncd_hypo as hypo_mod

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MASTER_PATH = os.path.join(ROOT, "data", "ncd_service_plan_master.json")
YEARS = ["2569", "2568", "2567"]

# ตารางที่ build_saraphi_master.py อ่าน — ต้องเขียน raw snapshot ทิ้งไว้เสมอ
RAW_SNAPSHOT_TABLES = {"s_dm_hypo"}

# ประเภทที่ delegate ไปโมดูลเฉพาะทาง (HDC 20/21 คอลัมน์ + risk screening)
def _ht_year(year):
    # enrich_ht_control.fetch_year_data returns (units_data, district_data)
    units_data, district_data = ht_mod.fetch_year_data(year)
    return {"units": units_data, "district": district_data}


DELEGATED = {
    "s_dm_control": dm_mod.fetch_year_data,
    "s_ht_control": _ht_year,
    "s_dm_hba1c": hba1c_mod.fetch_year_data,
}


def _clean_int(v):
    if v is None:
        return 0
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


def _write_raw_snapshot(table, year, rows):
    if table not in RAW_SNAPSHOT_TABLES:
        return
    out = os.path.join(ROOT, "data", f"{table}_{year}.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False)
    print(f"    wrote raw snapshot {out} ({len(rows)} rows)")


def _sum_fields(rows, keys):
    out = {k: 0 for k in keys}
    for r in rows:
        for k in keys:
            out[k] += _clean_int(r.get(k))
    return out


def _unit_saraphi_rows(rows):
    return [r for r in rows if r.get("hospcode") in SARAPHI_UNITS]


def _rate(num, den):
    return round(num * 100.0 / den, 2) if den > 0 else 0.0


def build_year_object(table, rows, has_fu):
    """Generic dual-group aggregation for the 14 units (registry schema)."""
    year_obj = {"district": {}, "units": {}}
    for hc, meta in SARAPHI_UNITS.items():
        u_rows = [r for r in rows if r.get("hospcode") == hc]
        s = _sum_fields(u_rows, ["target", "result", "result1", "result2",
                                 "target_1", "result_1", "result1_1", "result2_1"])
        year_obj["units"][hc] = {
            "hospcode": hc,
            "name": meta["name"],
            "subdistrict": meta["subdistrict"],
            "target": s["target"], "result": s["result"],
            "rate": _rate(s["result"], s["target"]),
            "result1": s["result1"], "result2": s["result2"],
            "target_fu": s["target_1"], "result_fu": s["result_1"],
            "rate_fu": _rate(s["result_1"], s["target_1"]),
            "result1_fu": s["result1_1"], "result2_fu": s["result2_1"],
        }

    units = year_obj["units"].values()
    t = {
        "target": sum(u["target"] for u in units),
        "result": sum(u["result"] for u in units),
        "result1": sum(u["result1"] for u in units),
        "result2": sum(u["result2"] for u in units),
        "target_1": sum(u["target_fu"] for u in units),
        "result_1": sum(u["result_fu"] for u in units),
        "result1_1": sum(u["result1_fu"] for u in units),
        "result2_1": sum(u["result2_fu"] for u in units),
    }
    district = {
        "target": t["target"], "result": t["result"],
        "rate": _rate(t["result"], t["target"]),
        "result1": t["result1"], "result2": t["result2"],
        "target_fu": t["target_1"], "result_fu": t["result_1"],
        "rate_fu": _rate(t["result_1"], t["target_1"]),
        "result1_fu": t["result1_1"], "result2_fu": t["result2_1"],
    }
    if has_fu:
        district["has_fu"] = True
    year_obj["district"] = district
    return year_obj


def _rows_stats(rows):
    """Fetch stats for the sync status page (row count + HDC compile date)."""
    dates = [str(r.get("date_com") or "") for r in rows if r.get("date_com")]
    return {"saraphi_rows": len(rows), "date_com": max(dates) if dates else ""}


def _raw_file_stats(table, year):
    """Stats from a raw snapshot a delegated enrichment module just wrote."""
    path = os.path.join(ROOT, "data", f"{table}_{year}.json")
    if not os.path.exists(path):
        return {"saraphi_rows": 0, "date_com": ""}
    try:
        with open(path, encoding="utf-8") as f:
            return _rows_stats(json.load(f))
    except (json.JSONDecodeError, OSError):
        return {"saraphi_rows": 0, "date_com": ""}


def refresh():
    only_tables = None
    if "--only-table" in sys.argv:
        idx = sys.argv.index("--only-table")
        only_tables = set(sys.argv[idx + 1].split(","))

    with open(MASTER_PATH, "r", encoding="utf-8") as f:
        master = json.load(f)

    reports = master.get("reports", [])

    # Dedupe by table_name (keep first) — s_ht_control is listed twice in
    # HDC's own catalog (report_id 146 / 430) with identical data.
    seen = set()
    registry = []
    dropped = []
    for rep in reports:
        tn = rep.get("table_name")
        if tn in seen:
            dropped.append(f"{rep.get('id')}({tn})")
            continue
        seen.add(tn)
        registry.append(rep)
    if dropped:
        print(f"Deduplicated by table_name, dropped: {', '.join(dropped)}")

    if only_tables:
        to_refresh = [r for r in registry if r.get("table_name") in only_tables]
        print(f"--only-table filter: refreshing {len(to_refresh)} report(s)")
    else:
        to_refresh = registry

    # Normalize category names ('เบาหวาน (DM)' → 'DM') for consistent counts
    CATEGORY_NORMALIZE = {"เบาหวาน (DM)": "DM", "ความดันโลหิตสูง (HT)": "HT"}
    for rep in registry:
        cat = rep.get("category")
        if cat in CATEGORY_NORMALIZE:
            rep["category"] = CATEGORY_NORMALIZE[cat]

    failures = []
    print(f"Refreshing {len(to_refresh)} NCD reports for years {', '.join(YEARS)} ...\n")
    for i, rep in enumerate(to_refresh, 1):
        table = rep["table_name"]
        print(f"[{i}/{len(registry)}] {rep['id']} — {table} ({rep.get('name', '')[:46]})")
        try:
            years_data = {}
            sync_info = {}
            for y in YEARS:
                if table in DELEGATED:
                    years_data[y] = DELEGATED[table](y)
                    sync_info[y] = _raw_file_stats(table, y)
                elif table in ("s_dm_screen_risk", "s_ht_screen_risk"):
                    risk_type = rep.get("risk_type") or ("ht" if "ht" in table else "dm")
                    rows = risk_mod.fetch_table_rows(table, y)
                    years_data[y] = risk_mod.aggregate_risk_data(rows, risk_type)
                    sync_info[y] = _rows_stats(rows)
                elif table == "s_dm_hypo":
                    rows = fetch_opendata_rows(table, y)
                    _write_raw_snapshot(table, y, rows)
                    years_data[y] = hypo_mod.build_year(y)
                    sync_info[y] = _rows_stats(rows)
                else:
                    rows = fetch_opendata_rows(table, y)
                    years_data[y] = build_year_object(table, rows, bool(rep.get("has_fu")))
                    sync_info[y] = _rows_stats(rows)
            rep["years"] = years_data
            rep["sync_info"] = sync_info
            d = years_data["2569"]["district"]
            print(f"    2569 district: rate={d.get('rate')} | fu={d.get('rate_fu')} | rows={sync_info['2569']['saraphi_rows']}")
        except Exception as e:
            print(f"    ERROR: {type(e).__name__}: {e}")
            failures.append(f"{rep['id']}({table})")
        time.sleep(1.0)

    master["reports"] = registry
    master["total_reports"] = len(registry)
    master["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    with open(MASTER_PATH, "w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)
    print(f"\nSaved {MASTER_PATH} ({len(registry)} reports)")

    if failures:
        print(f"\nREFRESH FINISHED WITH FAILURES ({len(failures)}): {', '.join(failures)}")
        sys.exit(1)
    print("\nNCD REFRESH OK — all reports updated")


if __name__ == "__main__":
    refresh()

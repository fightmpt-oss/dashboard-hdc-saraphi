"""Build data/overview_master.json — the unified registry behind the
"ภาพรวมตัวชี้วัด" page (ncd.in.th-style dashboard-over-tables view).

Merges every indicator that has real data into one schema:
  {
    "groups": [ {key, label, icon, sort} ],          # budget-domain groups
    "indicators": [
      { "id", "name", "table", "group", "unit",
        "goal_pct": 80.0 | null,                     # null = ยังไม่ตั้งเป้า
        "higher_is_better": true,
        "show_pct": true,
        "years": { "2569": {
            "district": { "num": , "den": , "rate":  },
            "units":   { "<hospcode>": { "num": , "den": , "rate": } }
        }, ... }
      }, ...
    ],
    "metadata": { "generated_at", "source_masters", "counts" }
  }

Numbers are baked in the SAME convention as the dashboard views:
primary cohort = Typearea 1,3 with a ChronicFU fallback when the primary
group has no data (e.g. รพ.สารภี), so the frontend never re-derives cohorts.

Offline step — reads only local master files (run after fetch/build steps).
"""
import json
import os
import sys
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")

GROUPS = [
    {"key": "overview_elderly", "label": "ผู้สูงอายุ & NCDs", "icon": "👵", "sort": 1},
    {"key": "overview_mch", "label": "อนามัยแม่และเด็ก", "icon": "👶", "sort": 2},
    {"key": "overview_ppb", "label": "งบ PPB (Workload)", "icon": "🎯", "sort": 3},
    {"key": "overview_pcc", "label": "งบ PCC (HDC PCC 1-4)", "icon": "💰", "sort": 4},
    {"key": "overview_pcc2569", "label": "งบ PCC 2569 (P4P)", "icon": "✨", "sort": 5},
    {"key": "overview_ttm", "label": "แพทย์แผนไทย & ยาสมุนไพร", "icon": "🌿", "sort": 6},
    {"key": "overview_ncd", "label": "Service Plan NCDs", "icon": "❤️", "sort": 7},
]

DOMAIN_TO_GROUP = {
    "elderly": "overview_elderly",
    "mch": "overview_mch",
    "ppb": "overview_ppb",
    "pcc": "overview_pcc",
    "pcc_2569": "overview_pcc2569",
    "ttm": "overview_ttm",
}

# ตัวชี้วัดที่ "ยิ่งน้อยยิ่งดี"
LOWER_IS_BETTER = {"pcc_complication", "s_dm_hypo"}


def _int(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


def _rate(num, den):
    return round(num * 100.0 / den, 2) if den > 0 else 0.0


def _scope_with_fallback(scope, fu_keys):
    """Primary num/den/rate with a ChronicFU fallback when the primary
    group is empty. fu_keys = (num_key, den_key, rate_key) of the entry."""
    num = _int(scope.get("num"))
    den = _int(scope.get("den"))
    rate = scope.get("rate")
    if den == 0 and num == 0:
        fu_num = _int(scope.get(fu_keys[0]))
        fu_den = _int(scope.get(fu_keys[1]))
        if fu_num != 0 or fu_den != 0:
            num, den = fu_num, fu_den
            rate = scope.get(fu_keys[2])
    rate_f = float(rate) if isinstance(rate, (int, float)) else None
    return {"num": num, "den": den, "rate": rate_f}


def load_catalog_urls():
    """source_table → HDC report URL สำหรับปุ่มเทียบ HDC รายแถว"""
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
    return urls


def from_main_master(master, catalog_urls):
    """24 curated indicators from saraphi_complete_master.json."""
    out = []
    for ind_id, ind in master.get("indicators", {}).items():
        domain = ind.get("domain")
        group = DOMAIN_TO_GROUP.get(domain)
        if not group:
            continue
        entry = {
            "id": ind_id,
            "name": ind.get("name"),
            "table": ind.get("table"),
            "group": group,
            "unit": ind.get("unit") or "",
            "goal_pct": ind.get("target") if ind.get("target") else None,
            "higher_is_better": ind_id not in LOWER_IS_BETTER,
            "show_pct": (ind.get("unit") == "%"),
            "hdc_url": catalog_urls.get(ind.get("table")),
            "years": {},
        }
        for yr, yd in (ind.get("years") or {}).items():
            if not isinstance(yd, dict):
                continue
            dist = _scope_with_fallback(yd, ("fu_num", "fu_den", "fu_rate"))
            units = {}
            for u in yd.get("units") or []:
                us = _scope_with_fallback(u, ("fu_num", "fu_den", "fu_rate"))
                units[u["hospcode"]] = us
            entry["years"][yr] = {"district": dist, "units": units}
        out.append(entry)
    return out


def from_ncd_master(master):
    """36 Service Plan NCD reports."""
    out = []
    for rep in master.get("reports", []):
        lower = rep.get("lower_is_better") is True or rep.get("table_name") == "s_dm_hypo"
        entry = {
            "id": rep.get("id"),
            "name": rep.get("name"),
            "table": rep.get("table_name"),
            "group": "overview_ncd",
            "unit": "%",
            "goal_pct": rep.get("kpi_target"),
            "higher_is_better": not lower,
            "show_pct": True,
            "hdc_url": rep.get("hdc_url"),
            "years": {},
        }
        for yr, yd in (rep.get("years") or {}).items():
            has_fu = bool(rep.get("has_fu"))

            def convert(scope):
                if scope is None:
                    return {"num": 0, "den": 0, "rate": None}
                num = _int(scope.get("result"))
                den = _int(scope.get("target"))
                rate = scope.get("rate")
                if den == 0 and num == 0 and has_fu:
                    fu_num = _int(scope.get("result_fu"))
                    fu_den = _int(scope.get("target_fu"))
                    if fu_num != 0 or fu_den != 0:
                        num, den, rate = fu_num, fu_den, scope.get("rate_fu")
                rate_f = float(rate) if isinstance(rate, (int, float)) else None
                if den == 0 and num == 0:
                    rate_f = None
                return {"num": num, "den": den, "rate": rate_f}

            entry["years"][yr] = {
                "district": convert(yd.get("district")),
                "units": {hc: convert(u) for hc, u in (yd.get("units") or {}).items()},
            }
        out.append(entry)
    return out


def from_pcc2569_master(master):
    """4 KPI งบ PCC 2569 (virtual indicators built at runtime by app.js —
    bake them into the overview so the page covers every real indicator).
    goal_pct = ค่าเป้าหมายล่างของช่วงดาวตามประกาศ (ตัวเต็มดูในแผงงบ PCC 2569)."""
    goals = [("kpi1", 56.0, "KPI 1: ปชก. UC อายุ ≥35 ปี ที่ไม่เคยเป็น DM ได้ตรวจคัดกรองน้ำตาล"),
             ("kpi2", 35.0, "KPI 2: กลุ่มเสี่ยง Pre-DM กลับมามีระดับน้ำตาลปกติ"),
             ("kpi3", 57.0, "KPI 3: ปชก. UC อายุ ≥35 ปี ที่ไม่เคยเป็น HT ได้ตรวจคัดกรองความดัน"),
             ("kpi4", 6.3, "KPI 4: คัดกรองพบความดันสูงและได้รับวินิจฉัยเป็นผู้ป่วย HT รายใหม่")]
    district = master.get("saraphi_district") or {}
    units = master.get("units") or {}
    out = []
    for key, goal, name in goals:
        d = district.get(key) or {}
        entry = {
            "id": f"pcc69_{key}",
            "name": name,
            "table": "PCC_69_R.1",
            "group": "overview_pcc2569",
            "unit": "%",
            "goal_pct": goal,
            "higher_is_better": True,
            "show_pct": True,
            "hdc_url": None,
            "years": {
                "2569": {
                    "district": {"num": _int(d.get("a")), "den": _int(d.get("b")), "rate": d.get("rate")},
                    "units": {hc: {"num": _int(u.get(key, {}).get("a")),
                                   "den": _int(u.get(key, {}).get("b")),
                                   "rate": u.get(key, {}).get("rate")}
                              for hc, u in units.items()},
                }
            },
        }
        out.append(entry)
    return out


def main():
    with open(os.path.join(DATA, "saraphi_complete_master.json"), encoding="utf-8") as f:
        main_master = json.load(f)
    with open(os.path.join(DATA, "ncd_service_plan_master.json"), encoding="utf-8") as f:
        ncd_master = json.load(f)
    pcc2569_path = os.path.join(DATA, "pcc_2569_master.json")
    pcc2569_master = {}
    if os.path.exists(pcc2569_path):
        with open(pcc2569_path, encoding="utf-8") as f:
            pcc2569_master = json.load(f)

    indicators = from_main_master(main_master, load_catalog_urls()) + from_ncd_master(ncd_master)
    if pcc2569_master:
        indicators += from_pcc2569_master(pcc2569_master)

    with_target = sum(1 for i in indicators if i["goal_pct"])
    overview = {
        "metadata": {
            "title": "ภาพรวมตัวชี้วัดทั้งหมด อำเภอสารภี",
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source_masters": ["saraphi_complete_master.json", "ncd_service_plan_master.json"],
            "counts": {
                "indicators": len(indicators),
                "with_target": with_target,
                "groups": len(GROUPS),
            },
        },
        "groups": GROUPS,
        "indicators": indicators,
    }

    out_path = os.path.join(DATA, "overview_master.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(overview, f, ensure_ascii=False, indent=2)
    print(f"Saved {out_path}")
    print(f"  indicators: {len(indicators)} (with target: {with_target})")
    from collections import Counter
    print("  by group:", dict(Counter(i["group"] for i in indicators)))


if __name__ == "__main__":
    main()

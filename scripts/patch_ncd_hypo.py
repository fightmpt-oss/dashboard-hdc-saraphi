"""Rebuild the ncd_02 (s_dm_hypo) entry in data/ncd_service_plan_master.json
from the raw snapshots in data/s_dm_hypo_<year>.json.

Fixes three defects of the previous extraction:
1. Cohort labels were swapped: in s_dm_hypo the raw columns are REVERSED
   relative to s_dm_control (verified per-unit):
       s_dm_hypo.target   == s_dm_control.target1  (กลุ่ม ChronicFU)
       s_dm_hypo.target_1 == s_dm_control.target   (กลุ่ม Typearea 1,3)
   The old extract labeled raw `target_1` as "target_fu" and used raw
   `target` (ChronicFU) as the headline — inconsistent with ncd_dm_control
   whose headline is the Typearea group.
2. District totals included hospcode 11999 and any other 5019 code; the
   dashboard scope is the 14 health units.
3. Unit names came from a stale local SARAPHI_MAP copy (06015 was listed as
   "บ้านปากกอง") — now imported from scripts/saraphi_config.py.

Run AFTER refresh/enrichers have produced the raw snapshots.
"""
import json
import os
import sys
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from saraphi_config import SARAPHI_UNITS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT, "data")
YEARS = ["2567", "2568", "2569"]


def clean_int(v):
    if v is None:
        return 0
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


def build_year(year):
    path = os.path.join(DATA_DIR, f"s_dm_hypo_{year}.json")
    with open(path, "r", encoding="utf-8") as f:
        rows = json.load(f)

    units_agg = {hc: {"num": 0, "den": 0, "fu_num": 0, "fu_den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc not in units_agg:
            continue
        # main = Typearea 1,3 (raw target_1/result_1) — see module docstring
        units_agg[hc]["num"] += clean_int(r.get('result_1'))
        units_agg[hc]["den"] += clean_int(r.get('target_1'))
        # fu = ChronicFU (raw target/result)
        units_agg[hc]["fu_num"] += clean_int(r.get('result'))
        units_agg[hc]["fu_den"] += clean_int(r.get('target'))

    units = {}
    tot = {"num": 0, "den": 0, "fu_num": 0, "fu_den": 0}
    for hc, d in units_agg.items():
        rate = round(d["num"] * 100.0 / d["den"], 2) if d["den"] > 0 else 0.0
        fu_rate = round(d["fu_num"] * 100.0 / d["fu_den"], 2) if d["fu_den"] > 0 else 0.0
        tot["num"] += d["num"]; tot["den"] += d["den"]
        tot["fu_num"] += d["fu_num"]; tot["fu_den"] += d["fu_den"]
        units[hc] = {
            'hospcode': hc,
            'name': SARAPHI_UNITS[hc]['name'],
            'subdistrict': SARAPHI_UNITS[hc]['subdistrict'],
            'target': d["den"], 'result': d["num"], 'rate': rate,
            'result1': 0, 'result2': 0,
            'target_fu': d["fu_den"], 'result_fu': d["fu_num"], 'rate_fu': fu_rate,
            'result1_fu': 0, 'result2_fu': 0,
        }

    dist_rate = round(tot["num"] * 100.0 / tot["den"], 2) if tot["den"] > 0 else 0.0
    dist_fu_rate = round(tot["fu_num"] * 100.0 / tot["fu_den"], 2) if tot["fu_den"] > 0 else 0.0
    district = {
        'target': tot["den"], 'result': tot["num"], 'rate': dist_rate,
        'result1': 0, 'result2': 0,
        'target_fu': tot["fu_den"], 'result_fu': tot["fu_num"], 'rate_fu': dist_fu_rate,
        'result1_fu': 0, 'result2_fu': 0,
        'has_fu': True,
    }
    return {'units': units, 'district': district}


def main():
    master_path = os.path.join(DATA_DIR, "ncd_service_plan_master.json")
    with open(master_path, "r", encoding="utf-8") as f:
        master = json.load(f)

    target = None
    for rep in master.get('reports', []):
        if rep.get('table_name') == 's_dm_hypo' or rep.get('id') == 'ncd_02':
            target = rep
            break
    if target is None:
        print("ERROR: ncd_02 (s_dm_hypo) not found in master json!")
        sys.exit(1)

    for yr in YEARS:
        target['years'][yr] = build_year(yr)
        d = target['years'][yr]['district']
        print(f"  {yr}: Typearea {d['result']}/{d['target']} = {d['rate']}% | "
              f"ChronicFU {d['result_fu']}/{d['target_fu']} = {d['rate_fu']}%")

    target['has_fu'] = True
    master['last_updated'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)
    print(f"Saved {master_path}")


if __name__ == "__main__":
    main()

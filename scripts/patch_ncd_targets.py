"""Backfill kpi_target for Service Plan NCD reports whose targets this
dashboard already uses in the PCC view (scripts/saraphi_config.py KPI_TARGETS):

- ncd_55 (s_dm_hba1c)  → 70.0  (HbA1c ตรวจปีละอย่างน้อย 1 ครั้ง, เกณฑ์ ≥ 70%)
- ncd_02 (s_dm_hypo)   → 5.0 + lower_is_better: true (ภาวะแทรกซ้อนเฉียบพลัน,
                          ยิ่งน้อยยิ่งดี, เกณฑ์ ≤ 5%)

Only targets with an in-repo precedent are filled. The remaining reports stay
without kpi_target and the summary cards will show them as "ยังไม่ตั้งเป้า"
until the owner defines official targets for them (same as ncd.in.th admin).
Idempotent: running again changes nothing.
"""
import json
import os
import sys
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MASTER = os.path.join(ROOT, "data", "ncd_service_plan_master.json")

BACKFILL = {
    # keyed by table_name (stable) — report ids changed during cleanup (ncd_55 → ncd_36 etc.)
    "s_dm_hba1c": {"kpi_target": 70.0},
    "s_dm_hypo": {"kpi_target": 5.0, "lower_is_better": True},
}


def main():
    with open(MASTER, "r", encoding="utf-8") as f:
        master = json.load(f)

    changed = 0
    for rep in master.get("reports", []):
        rules = BACKFILL.get(rep.get("table_name"))
        if not rules:
            continue
        for key, value in rules.items():
            if rep.get(key) != value:
                print(f"  {rep['id']} ({rep.get('table_name')}): {key} {rep.get(key)!r} -> {value!r}")
                rep[key] = value
                changed += 1

    if changed:
        master["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        with open(MASTER, "w", encoding="utf-8") as f:
            json.dump(master, f, ensure_ascii=False, indent=2)
        print(f"Saved {MASTER} ({changed} field changes)")
    else:
        print("Nothing to change (already backfilled)")


if __name__ == "__main__":
    main()

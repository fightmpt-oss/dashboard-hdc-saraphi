"""Run the full data refresh pipeline in the correct order.

One command for both local use and CI (.github/workflows/auto-fetch.yml).
The order matches README "แหล่งข้อมูล & ความถี่การอัปเดต":

  fetch_pcc     → scripts/refresh_pcc_data.py        (4 PCC tables, live API)
  fetch_ttm     → fetch_all_saraphi_data.py          (TTM tables, live API)
  fetch_rest    → fetch_additional_kpis.py           (PPB/elderly/MCH, live API)
  fetch_ncd     → scripts/refresh_ncd_data.py        (all Service Plan NCD
                  reports from the live API — delegates the HDC 20/21-col
                  tables and risk screening to the enrichment modules and
                  aggregates the rest with the 14-unit scope)
  build_master  → scripts/build_saraphi_master.py    (offline)
  build_pcc     → scripts/build_pcc_2569_master.py   (offline, needs openpyxl)
  build_ttm4    → scripts/build_ttm4_cache.py --write
  build_overview → scripts/build_overview_master.py  (offline, 64-indicator page)
  build_sync    → scripts/build_sync_status.py       (offline, freshness status)

Notes:
- สปสช. MeData (Playwright) is NOT part of this pipeline — run it manually via
  update_nhso_data.bat or scripts/server.py.
- Any step failing aborts the pipeline with a non-zero exit (fail loudly).

Usage:
  python scripts/run_pipeline.py                # run everything
  python scripts/run_pipeline.py --dry-run      # print the plan only
  python scripts/run_pipeline.py --only fetch_ncd,build_master
"""
import argparse
import subprocess
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

import os

SCRIPTS = os.path.dirname(os.path.abspath(__file__))

STEPS = [
    ("fetch_pcc", [sys.executable, "scripts/refresh_pcc_data.py"]),
    ("fetch_ttm", [sys.executable, "fetch_all_saraphi_data.py"]),
    ("fetch_rest", [sys.executable, "fetch_additional_kpis.py"]),
    ("fetch_ncd", [sys.executable, "scripts/refresh_ncd_data.py"]),
    ("build_master", [sys.executable, "scripts/build_saraphi_master.py"]),
    ("build_pcc", [sys.executable, "scripts/build_pcc_2569_master.py"]),
    ("build_ttm4", [sys.executable, "scripts/build_ttm4_cache.py", "--write"]),
    ("build_overview", [sys.executable, "scripts/build_overview_master.py"]),
    ("build_sync", [sys.executable, "scripts/build_sync_status.py"]),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="print the plan without running")
    parser.add_argument("--only", default="", help="comma-separated step names to run")
    args = parser.parse_args()

    selected = {s.strip() for s in args.only.split(",") if s.strip()}
    plan = [(name, cmd) for name, cmd in STEPS if not selected or name in selected]
    unknown = selected - {name for name, _ in STEPS}
    if unknown:
        print(f"Unknown steps: {', '.join(sorted(unknown))}")
        print("Available:", ", ".join(name for name, _ in STEPS))
        sys.exit(2)

    if args.dry_run:
        print("Pipeline plan:")
        for name, cmd in plan:
            print(f"  {name:13s} → {' '.join(cmd[1:])}")
        return

    failures = []
    for i, (name, cmd) in enumerate(plan, 1):
        print(f"\n[{i}/{len(plan)}] ▶ {name}: {' '.join(cmd[1:])}", flush=True)
        t0 = time.time()
        code = subprocess.call(cmd, cwd=os.path.dirname(SCRIPTS))
        print(f"[{i}/{len(plan)}] ✔ {name} finished in {time.time() - t0:.0f}s (exit {code})")
        if code != 0:
            failures.append(name)
            break
        if i < len(plan):
            time.sleep(3)  # be gentle with the OpenData API between steps

    if failures:
        print(f"\nPIPELINE FAILED at: {failures[0]}")
        sys.exit(1)
    print("\nPIPELINE OK — all steps finished")


if __name__ == "__main__":
    main()

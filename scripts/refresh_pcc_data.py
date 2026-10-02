"""Refresh raw HDC OpenData snapshots for the 4 PCC indicator tables.

Fixes applied vs the old root fetchers:
- No skip-if-exists: existing files are always overwritten so snapshots stay consistent.
- Paginated fetching (offset/limit 1000) instead of a single request.
- Fails loudly on HTTP/API errors: nothing is written unless every table/year succeeds.
- "No data" (API ok but zero Saraphi rows) is reported explicitly and still written as [].

Usage: python scripts/refresh_pcc_data.py [--tables s_dm_control,s_ht_control,...]
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT_DIR, "data")
API_URL = "https://opendata.moph.go.th/api/report_data"
YEARS = ["2567", "2568", "2569"]
DEFAULT_TABLES = ["s_dm_control", "s_ht_control", "s_dm_hba1c", "s_dm_hypo"]
PAGE_LIMIT = 1000
AREACODE_PREFIX = "5019"


def fetch_table_year(table, year):
    """Fetch all rows for a table/year in province 50, paginated. Raises on error."""
    rows = []
    offset = 0
    while True:
        body = json.dumps({
            "tableName": table,
            "year": year,
            "province": "50",
            "type": "json",
            "offset": offset,
            "limit": PAGE_LIMIT,
        }).encode("utf-8")
        req = urllib.request.Request(
            API_URL,
            data=body,
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            method="POST",
        )
        last_err = None
        for attempt in range(1, 4):
            try:
                with urllib.request.urlopen(req, timeout=60) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                last_err = None
                break
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
                last_err = e
                print(f"    attempt {attempt} failed: {type(e).__name__}: {e}")
                time.sleep(2 * attempt)
        if last_err is not None:
            raise RuntimeError(f"{table}/{year} offset={offset}: API failed after 3 attempts: {last_err}")

        if isinstance(payload, dict):
            page = payload.get("data") or []
        else:
            page = payload or []
        if not isinstance(page, list):
            raise RuntimeError(f"{table}/{year}: unexpected API payload type {type(page).__name__}")
        rows.extend(page)
        if len(page) < PAGE_LIMIT:
            break
        offset += PAGE_LIMIT
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tables", default=",".join(DEFAULT_TABLES))
    args = parser.parse_args()
    tables = [t.strip() for t in args.tables.split(",") if t.strip()]

    failures = []
    snapshot = {}
    for table in tables:
        for year in YEARS:
            print(f"Fetching {table} {year} ...")
            try:
                rows = fetch_table_year(table, year)
            except RuntimeError as e:
                print(f"  ERROR: {e}")
                failures.append((table, year, str(e)))
                continue
            saraphi = [r for r in rows if str(r.get("areacode") or "").startswith(AREACODE_PREFIX)]
            comp_dates = sorted({str(r.get("date_com") or "")[:8] for r in saraphi if r.get("date_com")})
            print(f"  province rows={len(rows)}, saraphi rows={len(saraphi)}, date_com={comp_dates[-1] if comp_dates else '-'}")
            snapshot[(table, year)] = saraphi

    if failures:
        print("\nABORT: no file written because these table/year fetches failed:")
        for t, y, msg in failures:
            print(f"  - {t} {y}: {msg}")
        sys.exit(1)

    for (table, year), rows in snapshot.items():
        path = os.path.join(DATA_DIR, f"{table}_{year}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False)
        print(f"WROTE {path} ({len(rows)} rows)")

    print("\nDone. All tables refreshed from a single consistent snapshot.")


if __name__ == "__main__":
    main()

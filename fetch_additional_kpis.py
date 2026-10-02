import urllib.request, json, time, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts"))
from saraphi_config import fetch_opendata_rows

output_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"))
os.makedirs(output_dir, exist_ok=True)

tables_to_fetch = [
    # TTM
    's_ttm3', 's_ttm8',
    # PCC
    's_dm_hba1c', 's_dm_control', 's_ht_control', 's_dm_hypo',
    # PPB
    's_kpi_height614', 's_kpi_dental63', 's_kpi_dental64', 's_2q_adl_test',
    # Elderly & MCH
    's_aged9', 's_ageing', 's_kpi_food', 's_nutrition_11'
    # (ถอดออก: s_dm_complication / s_child0_5_pshyche_develop_workload /
    #  s_anc12ga / s_kpi_height05 — ไม่มีตัวชี้วัดไหนใช้ข้อมูลเหล่านี้)
]

years = ['2567', '2568', '2569']

failures = []
for tbl in tables_to_fetch:
    for y in years:
        # No skip-if-exists: always refresh (เดิมข้ามไฟล์เก่า ทำให้ข้อมูลไม่มีวันอัปเดต)
        print(f"Fetching {tbl} {y} ...")
        try:
            all_rows = fetch_opendata_rows(tbl, y)
        except Exception as e:
            print(f"  ERROR fetching {tbl} {y}: {e}")
            failures.append((tbl, y, str(e)))
            continue
        target_file = os.path.join(output_dir, f"{tbl}_{y}.json")
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(all_rows, f, ensure_ascii=False, indent=2)
        print(f"  Fetched {tbl} {y}: {len(all_rows)} Saraphi rows")
        time.sleep(0.3)

if failures:
    print("\nFAILED table/year fetches (existing files were left untouched):")
    for t, y, msg in failures:
        print(f"  - {t} {y}: {msg}")
    sys.exit(1)

print("Batch fetch finished successfully!")

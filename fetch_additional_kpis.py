import urllib.request, json, time, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts"))
from saraphi_config import fetch_opendata_rows

output_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"))
os.makedirs(output_dir, exist_ok=True)

tables_to_fetch = [
    # TTM (ที่เหลือจาก fetch_all_saraphi_data)
    's_ttm3', 's_ttm8',
    # PPB
    's_childdev_specialpp', 's_kpi_height614', 's_kpi_dental63', 's_kpi_dental64', 's_2q_adl_test',
    # Elderly & MCH
    's_aged9', 's_ageing', 's_kpi_food', 's_nutrition_11', 's_childdev_specialpp48'
    # (หมายเหตุ: PCC s_dm_control/s_ht_control/s_dm_hba1c/s_dm_hypo ดึงแล้วใน step 1 fetch_pcc ไม่ต้องดึงซ้ำ)
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
        time.sleep(1.0)

if failures:
    print("\nFAILED table/year fetches (existing files were left untouched):")
    for t, y, msg in failures:
        print(f"  - {t} {y}: {msg}")
    sys.exit(1)

print("Batch fetch finished successfully!")

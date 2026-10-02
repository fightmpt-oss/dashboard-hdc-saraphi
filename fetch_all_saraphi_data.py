import urllib.request, json, time, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts"))
from saraphi_config import fetch_opendata_rows

output_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"))
os.makedirs(output_dir, exist_ok=True)

indicators = ['s_ttm7', 's_ttm10', 's_ttm32', 's_ttm2', 's_ttm34', 's_ttm4', 's_common_diseases_thai_drug']
years = ['2567', '2568', '2569']

failures = []
for t in indicators:
    for y in years:
        # No skip-if-exists: files are always refreshed so snapshots stay consistent
        # (เดิมข้ามไฟล์เก่า ทำให้ re-run ไม่มีวันอัปเดตข้อมูล และไฟล์ว่างไม่ถูกดึงใหม่)
        print(f"Fetching {t} {y} ...")
        try:
            all_rows = fetch_opendata_rows(t, y)
        except Exception as e:
            print(f"  ERROR fetching {t} {y}: {e}")
            failures.append((t, y, str(e)))
            continue
        target_file = os.path.join(output_dir, f"{t}_{y}.json")
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(all_rows, f, ensure_ascii=False, indent=2)
        print(f"  Saved {t} {y}: {len(all_rows)} Saraphi rows")
        time.sleep(0.3)

if failures:
    print("\nFAILED table/year fetches (existing files were left untouched):")
    for t, y, msg in failures:
        print(f"  - {t} {y}: {msg}")
    sys.exit(1)

print("Data fetch completed!")

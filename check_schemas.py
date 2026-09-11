import json

tables = ['s_dm_hba1c', 's_dm_control', 's_ht_control', 's_kpi_height614', 's_kpi_dental63', 's_kpi_dental64', 's_2q_adl_test', 's_ttm3', 's_ttm8']

for t in tables:
    fname = f"d:\\PROJECTS\\Dashboard HDC Saraphi\\data\\{t}_2568.json"
    with open(fname, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"\n=== {t} (total {len(data)} rows) ===")
    if data:
        print("Sample keys:", list(data[0].keys()))
        print("Sample row:", data[0])

import urllib.request, json, time, os

url = 'https://opendata.moph.go.th/api/report_data'
output_dir = r"d:\PROJECTS\Dashboard HDC Saraphi\data"
os.makedirs(output_dir, exist_ok=True)

tables_to_fetch = [
    # TTM
    's_ttm3', 's_ttm8',
    # PCC
    's_dm_hba1c', 's_dm_control', 's_ht_control', 's_dm_hypo', 's_dm_complication',
    # PPB
    's_child0_5_pshyche_develop_workload', 's_kpi_height614', 's_kpi_dental63', 's_kpi_dental64', 's_2q_adl_test',
    # Elderly & MCH
    's_aged9', 's_ageing', 's_anc12ga', 's_kpi_food', 's_nutrition_11', 's_kpi_height05'
]

years = ['2567', '2568', '2569']

for tbl in tables_to_fetch:
    for y in years:
        target_file = os.path.join(output_dir, f"{tbl}_{y}.json")
        if os.path.exists(target_file):
            continue
            
        offset = 0
        all_rows = []
        total = 0
        while True:
            payload = json.dumps({
                'tableName': tbl,
                'year': str(y),
                'province': '50',
                'type': 'json',
                'offset': offset,
                'limit': 1000
            }).encode('utf-8')
            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    res = json.loads(resp.read().decode('utf-8'))
            except Exception as e:
                # Table might not exist for that specific year or bad request
                break
                
            total = int(res.get('total', 0))
            data = res.get('data', [])
            if not data:
                break
            for r in data:
                if str(r.get('areacode', '')).startswith('5019'):
                    all_rows.append(r)
            offset += len(data)
            if offset >= total or total == 0:
                break
            time.sleep(0.15)
            
        print(f"Fetched {tbl} {y}: {len(all_rows)} Saraphi rows (total CM was {total})")
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(all_rows, f, ensure_ascii=False, indent=2)

print("Batch fetch finished successfully!")

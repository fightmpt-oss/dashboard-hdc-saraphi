import urllib.request, json, time

url = 'https://opendata.moph.go.th/api/report_data'

test_tables = [
    # PCC
    's_dm_hba1c', 's_dm_control', 's_ht_control', 's_dm_hypo', 's_dm_complication',
    # PPB
    's_child0_5_pshyche_develop_coverage', 's_kpi_height614', 's_kpi_dental63', 's_kpi_dental64', 's_2q_adl_test', 's_aged9',
    # Elderly & MCH
    's_ageing', 's_anc12ga', 's_kpi_food',
    # TTM
    's_ttm8', 's_ttm7', 's_ttm4'
]

results = {}
for tbl in test_tables:
    payload = json.dumps({'tableName': tbl, 'year': '2568', 'province': '50', 'type': 'json', 'offset': 0, 'limit': 1000}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            total = int(data.get('total', 0))
            rows = data.get('data', [])
            saraphi = [r for r in rows if str(r.get('areacode', '')).startswith('5019')]
            print(f"[{tbl}] Status: {resp.status} | CM Total: {total} | Sample Saraphi in first page: {len(saraphi)}")
            results[tbl] = {'status': resp.status, 'total': total, 'saraphi_sample': len(saraphi)}
    except Exception as e:
        print(f"[{tbl}] Error: {e}")
        results[tbl] = {'error': str(e)}
    time.sleep(0.2)

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\test_table_availability.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

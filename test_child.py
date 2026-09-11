import urllib.request, json

url = 'https://opendata.moph.go.th/api/report_data'

for tbl in ['s_child0_5_pshyche_develop_workload', 's_child_develop', 's_child_develop_dspm', 's_kpi_child_develop']:
    payload = json.dumps({'tableName': tbl, 'year': '2568', 'province': '50', 'type': 'json', 'offset': 0, 'limit': 10}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[{tbl}] Status: {resp.status} | Total: {data.get('total')}")
    except Exception as e:
        print(f"[{tbl}] Error: {e}")

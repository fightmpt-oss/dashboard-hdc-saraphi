import urllib.request, json, time

url = 'https://opendata.moph.go.th/api/report_data'

def fetch_saraphi_year(year):
    print(f"\n--- Fetching s_ttm4 for Year {year} ---")
    offset = 0
    saraphi_rows = []
    total = 0
    while True:
        payload = json.dumps({
            'tableName': 's_ttm4',
            'year': str(year),
            'province': '50',
            'type': 'json',
            'offset': offset,
            'limit': 1000
        }).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            res = json.loads(resp.read().decode('utf-8'))
        total = int(res.get('total', 0))
        data = res.get('data', [])
        if not data:
            break
        for r in data:
            if str(r.get('areacode', '')).startswith('5019'):
                saraphi_rows.append(r)
        print(f"Offset {offset}/{total}: fetched {len(data)} rows (Saraphi cumulative: {len(saraphi_rows)})")
        offset += len(data)
        if offset >= total:
            break
        time.sleep(0.3)
    return saraphi_rows

saraphi_all = {}
for y in ['2567', '2568', '2569']:
    rows = fetch_saraphi_year(y)
    saraphi_all[y] = rows
    print(f"Total Saraphi records for {y}: {len(rows)}")

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\saraphi_s_ttm4_3years.json", "w", encoding="utf-8") as f:
    json.dump(saraphi_all, f, ensure_ascii=False, indent=2)

print("\nSaved to saraphi_s_ttm4_3years.json")

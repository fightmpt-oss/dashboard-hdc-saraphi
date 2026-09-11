import urllib.request, json, time, os

url = 'https://opendata.moph.go.th/api/report_data'
output_dir = r"d:\PROJECTS\Dashboard HDC Saraphi\data"
os.makedirs(output_dir, exist_ok=True)

indicators = ['s_ttm7', 's_ttm10', 's_ttm32', 's_ttm2', 's_ttm34', 's_ttm4', 's_common_diseases_thai_drug']
years = ['2567', '2568', '2569']

def fetch_indicator_year(table, year):
    target_file = os.path.join(output_dir, f"{table}_{year}.json")
    if os.path.exists(target_file):
        print(f"Already exists: {target_file}")
        return
        
    offset = 0
    all_rows = []
    total = 0
    while True:
        payload = json.dumps({
            'tableName': table,
            'year': str(year),
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
            print(f"Error fetching {table} {year} offset {offset}: {e}")
            break
            
        total = int(res.get('total', 0))
        data = res.get('data', [])
        if not data:
            break
        for r in data:
            if str(r.get('areacode', '')).startswith('5019'):
                all_rows.append(r)
        offset += len(data)
        if offset >= total:
            break
        time.sleep(0.2)
        
    print(f"Saved {table} {year}: {len(all_rows)} Saraphi rows (total CM was {total})")
    with open(target_file, "w", encoding="utf-8") as f:
        json.dump(all_rows, f, ensure_ascii=False, indent=2)

for t in indicators:
    for y in years:
        fetch_indicator_year(t, y)

print("Data fetch completed!")

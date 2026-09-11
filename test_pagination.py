import urllib.request, json

url = 'https://opendata.moph.go.th/api/report_data'

def fetch_page(offset=0):
    payload = json.dumps({
        'tableName': 's_ttm4',
        'year': '2568',
        'province': '50',
        'type': 'json',
        'offset': offset,
        'limit': 1000
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

for off in [0, 1000, 2000, 3000, 4000]:
    res = fetch_page(off)
    data = res.get('data', [])
    areacodes = set(r.get('areacode', '')[:4] for r in data)
    print(f"Offset {off}: {len(data)} rows | areacodes prefixes: {sorted(list(areacodes))[:5]}")
    saraphi = [r for r in data if r.get('areacode', '').startswith('5019')]
    print(f"  -> Saraphi (5019) rows: {len(saraphi)}")
    if saraphi:
        hospcodes = set(r.get('hospcode') for r in saraphi)
        print(f"  -> Saraphi hospcodes: {hospcodes}")

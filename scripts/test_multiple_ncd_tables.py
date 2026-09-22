import urllib.request
import json

test_tables = ['s_dm_screen', 's_ht_screen', 's_kpi_cvd_risk', 's_dm_ckd', 's_ht_visit']
years = ['2569', '2568', '2567']

print(f"{'Table':<20} {'Year':<6} {'Total Prov':>10} {'Saraphi Rows':>14} {'Hospcodes Found':>16}")
print("-" * 70)

for tbl in test_tables:
    for yr in years:
        url = 'https://opendata.moph.go.th/api/report_data'
        payload = {
            'tableName': tbl,
            'year': yr,
            'province': '50',
            'type': 'json',
            'offset': 0,
            'limit': 5000
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as res:
                data = json.loads(res.read().decode('utf-8'))
                rows = data.get('data', [])
                saraphi = [r for r in rows if str(r.get('areacode', '')).startswith('5019')]
                hospcodes = set(r.get('hospcode') for r in saraphi if r.get('hospcode'))
                print(f"{tbl:<20} {yr:<6} {len(rows):>10,d} {len(saraphi):>14,d} {len(hospcodes):>16,d}")
        except Exception as e:
            print(f"{tbl:<20} {yr:<6} ERROR: {e}")

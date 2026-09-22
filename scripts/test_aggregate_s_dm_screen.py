import urllib.request
import json
from collections import defaultdict

url = 'https://opendata.moph.go.th/api/report_data'
payload = {'tableName': 's_dm_screen', 'year': '2569', 'province': '50', 'type': 'json', 'offset': 0, 'limit': 5000}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as res:
    rows = json.loads(res.read().decode('utf-8')).get('data', [])

saraphi = [r for r in rows if str(r.get('areacode', '')).startswith('5019')]

by_unit = defaultdict(lambda: {'target': 0, 'result': 0, 'result1': 0, 'result2': 0, 'result3': 0, 'result4': 0})

for r in saraphi:
    h = r.get('hospcode')
    by_unit[h]['target'] += int(r.get('target') or 0)
    by_unit[h]['result'] += int(r.get('result') or 0)
    by_unit[h]['result1'] += int(r.get('result1') or 0)
    by_unit[h]['result2'] += int(r.get('result2') or 0)
    by_unit[h]['result3'] += int(r.get('result3') or 0)
    by_unit[h]['result4'] += int(r.get('result4') or 0)

tot_target = sum(u['target'] for u in by_unit.values())
tot_result = sum(u['result'] for u in by_unit.values())
tot_rate = (tot_result / tot_target * 100) if tot_target > 0 else 0

print(f"{'Hospcode':<10} {'Target (B)':>12} {'Result (A)':>12} {'Rate %':>10}")
print("-" * 48)
for h, u in sorted(by_unit.items()):
    rate = (u['result'] / u['target'] * 100) if u['target'] > 0 else 0
    print(f"{h:<10} {u['target']:>12,d} {u['result']:>12,d} {rate:>9.2f}%")
print("=" * 48)
print(f"{'TOTAL':<10} {tot_target:>12,d} {tot_result:>12,d} {tot_rate:>9.2f}%")

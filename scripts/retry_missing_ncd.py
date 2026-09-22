import json
import time
import urllib.request
from collections import defaultdict

MASTER_FILE = 'data/ncd_service_plan_master.json'

with open(MASTER_FILE, encoding='utf-8') as f:
    master = json.load(f)

SARAPHI_MAP = {
    '11135': {'name': 'รพ.สารภี', 'subdistrict': 'สารภี'},
    '06014': {'name': 'รพ.สต.บ้านยางเนิ้ง', 'subdistrict': 'ยางเนิ้ง'},
    '06015': {'name': 'รพ.สต.บ้านปากกอง', 'subdistrict': 'สารภี'},
    '06016': {'name': 'รพ.สต.บ้านศรีสองเมือง', 'subdistrict': 'ไชยสถาน'},
    '06017': {'name': 'รพ.สต.บ้านหัวดง', 'subdistrict': 'ขัวมุง'},
    '06018': {'name': 'รพ.สต.บ้านหนองแฝก', 'subdistrict': 'หนองแฝก'},
    '06020': {'name': 'รพ.สต.บ้านแคว (ท่ากว้าง)', 'subdistrict': 'ท่ากว้าง'},
    '06021': {'name': 'รพ.สต.บ้านสันต้นกอก', 'subdistrict': 'ดอนแก้ว'},
    '06022': {'name': 'รพ.สต.บ้านบวกครกเหนือ', 'subdistrict': 'ท่าวังตาล'},
    '06023': {'name': 'รพ.สต.บ้านป่าสา', 'subdistrict': 'สันทราย'},
    '06024': {'name': 'รพ.สต.บ้านศรีคำชมภู', 'subdistrict': 'ป่าบง'},
    '13994': {'name': 'รพ.สต.บ้านท่าต้นกวาว', 'subdistrict': 'ชมภู'},
    '14461': {'name': 'รพ.สต.บ้านหนองผึ้ง', 'subdistrict': 'หนองผึ้ง'},
    '99758': {'name': 'ศสม.สารภี', 'subdistrict': 'สารภี'}
}

# Find unique table-year pairs where target == 0 and result == 0
missing_pairs = set()
for r in master['reports']:
    tbl = r['table_name']
    for yr in ['2569', '2568', '2567']:
        d = r['years'].get(yr, {}).get('district', {})
        if d.get('target', 0) == 0 and d.get('result', 0) == 0:
            missing_pairs.add((tbl, yr))

print(f"Total missing table-year pairs to retry: {len(missing_pairs)}")

URL = 'https://opendata.moph.go.th/api/report_data'

def fetch_sync(table, year):
    payload = {
        'tableName': table,
        'year': str(year),
        'province': '50',
        'type': 'json',
        'offset': 0,
        'limit': 5000
    }
    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as res:
            if res.status in (200, 201):
                data = json.loads(res.read().decode('utf-8'))
                rows = data.get('data', [])
                saraphi = [row for row in rows if str(row.get('areacode', '')).startswith('5019')]
                return saraphi
    except Exception as e:
        print(f"  Error {table} ({year}): {e}")
    return None

def aggregate_saraphi(rows):
    units_acc = defaultdict(lambda: {'target': 0, 'result': 0, 'result1': 0, 'result2': 0})
    for r in rows:
        h = str(r.get('hospcode') or '').strip()
        if len(h) > 5 and h.startswith('0'):
            h = h[-5:]
        elif len(h) < 5 and h:
            h = h.zfill(5)
        units_acc[h]['target'] += float(r.get('target') or 0)
        units_acc[h]['result'] += float(r.get('result') or 0)
        units_acc[h]['result1'] += float(r.get('result1') or 0)
        units_acc[h]['result2'] += float(r.get('result2') or 0)
        
    units = {}
    for code, meta in SARAPHI_MAP.items():
        u = units_acc.get(code, {'target': 0, 'result': 0, 'result1': 0, 'result2': 0})
        t = round(u['target'])
        res = round(u['result'])
        rate = round((res / t * 100), 2) if t > 0 else 0.0
        units[code] = {
            'hospcode': code,
            'name': meta['name'],
            'subdistrict': meta['subdistrict'],
            'target': t,
            'result': res,
            'rate': rate,
            'result1': round(u['result1']),
            'result2': round(u['result2'])
        }
    for code, u in units_acc.items():
        if code not in units and code:
            t = round(u['target'])
            res = round(u['result'])
            rate = round((res / t * 100), 2) if t > 0 else 0.0
            units[code] = {
                'hospcode': code,
                'name': f"หน่วยบริการ {code}",
                'subdistrict': 'สารภี',
                'target': t,
                'result': res,
                'rate': rate,
                'result1': round(u['result1']),
                'result2': round(u['result2'])
            }
    dist_t = sum(u['target'] for u in units.values())
    dist_res = sum(u['result'] for u in units.values())
    dist_rate = round((dist_res / dist_t * 100), 2) if dist_t > 0 else 0.0
    return {
        'district': {'target': dist_t, 'result': dist_res, 'rate': dist_rate},
        'units': units
    }

repaired_count = 0
for idx, (tbl, yr) in enumerate(sorted(missing_pairs), 1):
    print(f"[{idx}/{len(missing_pairs)}] Retrying {tbl} ({yr})...", flush=True)
    rows = fetch_sync(tbl, yr)
    if rows is not None:
        agg = aggregate_saraphi(rows)
        # Update in master for all reports sharing this table
        for r in master['reports']:
            if r['table_name'] == tbl:
                r['years'][yr] = agg
        if agg['district']['target'] > 0 or agg['district']['result'] > 0:
            repaired_count += 1
            print(f"    -> OK! Target: {agg['district']['target']:,}, Result: {agg['district']['result']:,}")
        else:
            print("    -> Returned 0 rows (table might have no data for this year)")
    time.sleep(1.0) # gentle 1.0s delay between calls

print(f"\nRepaired: {repaired_count} / {len(missing_pairs)}")

with open(MASTER_FILE, 'w', encoding='utf-8') as f:
    json.dump(master, f, ensure_ascii=False, indent=2)

print("Saved updated master file.")

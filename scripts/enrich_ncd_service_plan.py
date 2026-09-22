import asyncio
import aiohttp
import json
import os
import sys
import time
from collections import defaultdict

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

URL = 'https://opendata.moph.go.th/api/report_data'
YEARS = ['2569', '2568', '2567']

async def fetch_table_year(session, sem, table, year, max_retries=5):
    payload = {
        'tableName': table,
        'year': str(year),
        'province': '50',
        'type': 'json',
        'offset': 0,
        'limit': 5000
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Type': 'application/json'
    }
    async with sem:
        for attempt in range(max_retries):
            try:
                async with session.post(URL, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=40)) as res:
                    if res.status in (200, 201):
                        data = await res.json()
                        rows = data.get('data', [])
                        saraphi_rows = [r for r in rows if str(r.get('areacode', '')).startswith('5019')]
                        await asyncio.sleep(0.3)
                        return table, year, saraphi_rows, None
                    elif res.status == 429:
                        wait_sec = (attempt + 1) * 3
                        # print(f"  [429 Throttled] {table} ({year}) -> backing off {wait_sec}s...")
                        await asyncio.sleep(wait_sec)
                    else:
                        if attempt == max_retries - 1:
                            return table, year, [], f"HTTP {res.status}"
                        await asyncio.sleep(2.0)
            except Exception as e:
                if attempt == max_retries - 1:
                    return table, year, [], str(e)
                await asyncio.sleep(2.0)
    return table, year, [], "Exceeded max retries"

def aggregate_saraphi(rows):
    units_acc = defaultdict(lambda: {
        'target': 0, 'result': 0, 'result1': 0, 'result2': 0,
        'target_fu': 0, 'result_fu': 0, 'result1_fu': 0, 'result2_fu': 0
    })
    
    for r in rows:
        h = str(r.get('hospcode') or '').strip()
        if len(h) > 5 and h.startswith('0'):
            h = h[-5:]
        elif len(h) < 5 and h:
            h = h.zfill(5)
            
        t = float(r.get('target') or 0)
        res = float(r.get('result') or 0)
        t_fu = float(r.get('target_1') or 0)
        res_fu = float(r.get('result_1') or 0)
        
        units_acc[h]['target'] += t
        units_acc[h]['result'] += res
        units_acc[h]['result1'] += float(r.get('result1') or 0)
        units_acc[h]['result2'] += float(r.get('result2') or 0)
        
        units_acc[h]['target_fu'] += t_fu
        units_acc[h]['result_fu'] += res_fu
        units_acc[h]['result1_fu'] += float(r.get('result1_1') or 0)
        units_acc[h]['result2_fu'] += float(r.get('result2_1') or 0)
        
    units = {}
    for code, meta in SARAPHI_MAP.items():
        u_data = units_acc.get(code, {
            'target': 0, 'result': 0, 'result1': 0, 'result2': 0,
            'target_fu': 0, 'result_fu': 0, 'result1_fu': 0, 'result2_fu': 0
        })
        t = round(u_data['target'])
        res = round(u_data['result'])
        rate = round((res / t * 100), 2) if t > 0 else 0.0
        
        t_fu = round(u_data['target_fu'])
        res_fu = round(u_data['result_fu'])
        rate_fu = round((res_fu / t_fu * 100), 2) if t_fu > 0 else 0.0
        
        units[code] = {
            'hospcode': code,
            'name': meta['name'],
            'subdistrict': meta['subdistrict'],
            'target': t,
            'result': res,
            'rate': rate,
            'result1': round(u_data['result1']),
            'result2': round(u_data['result2']),
            'target_fu': t_fu,
            'result_fu': res_fu,
            'rate_fu': rate_fu,
            'result1_fu': round(u_data['result1_fu']),
            'result2_fu': round(u_data['result2_fu'])
        }
        
    for code, u_data in units_acc.items():
        if code not in units and code:
            t = round(u_data['target'])
            res = round(u_data['result'])
            rate = round((res / t * 100), 2) if t > 0 else 0.0
            t_fu = round(u_data['target_fu'])
            res_fu = round(u_data['result_fu'])
            rate_fu = round((res_fu / t_fu * 100), 2) if t_fu > 0 else 0.0
            units[code] = {
                'hospcode': code,
                'name': f"หน่วยบริการ {code}",
                'subdistrict': 'สารภี',
                'target': t,
                'result': res,
                'rate': rate,
                'result1': round(u_data['result1']),
                'result2': round(u_data['result2']),
                'target_fu': t_fu,
                'result_fu': res_fu,
                'rate_fu': rate_fu,
                'result1_fu': round(u_data['result1_fu']),
                'result2_fu': round(u_data['result2_fu'])
            }

    dist_t = sum(u['target'] for u in units.values())
    dist_res = sum(u['result'] for u in units.values())
    dist_res1 = sum(u['result1'] for u in units.values())
    dist_res2 = sum(u['result2'] for u in units.values())
    dist_rate = round((dist_res / dist_t * 100), 2) if dist_t > 0 else 0.0

    dist_t_fu = sum(u['target_fu'] for u in units.values())
    dist_res_fu = sum(u['result_fu'] for u in units.values())
    dist_res1_fu = sum(u['result1_fu'] for u in units.values())
    dist_res2_fu = sum(u['result2_fu'] for u in units.values())
    dist_rate_fu = round((dist_res_fu / dist_t_fu * 100), 2) if dist_t_fu > 0 else 0.0
    has_fu = (dist_t_fu > 0 or dist_res_fu > 0)

    return {
        'district': {
            'target': dist_t,
            'result': dist_res,
            'rate': dist_rate,
            'result1': dist_res1,
            'result2': dist_res2,
            'target_fu': dist_t_fu,
            'result_fu': dist_res_fu,
            'rate_fu': dist_rate_fu,
            'result1_fu': dist_res1_fu,
            'result2_fu': dist_res2_fu,
            'has_fu': has_fu
        },
        'units': units
    }

async def main():
    master_file = 'data/ncd_service_plan_master.json'
    if not os.path.exists(master_file):
        print(f"Error: {master_file} not found!")
        return

    with open(master_file, encoding='utf-8') as f:
        master_data = json.load(f)

    # Find tasks that are missing or 0 across years
    needed = []
    for r in master_data['reports']:
        tbl = r['table_name']
        for yr in YEARS:
            d = r['years'].get(yr, {}).get('district', {})
            # If target==0 and result==0 and target_fu==0, it's candidate to fetch
            if (d.get('target', 0) == 0 and d.get('result', 0) == 0 and d.get('target_fu', 0) == 0):
                needed.append((tbl, yr))

    # Deduplicate needed (table, year) pairs
    needed = sorted(list(set(needed)))
    print(f"Found {len(needed)} (table, year) pairs that need fetching/enrichment.")

    if not needed:
        print("All tables and years already have data! Done.")
        return

    sem = asyncio.Semaphore(2) # polite concurrency of 2
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_table_year(session, sem, tbl, yr) for tbl, yr in needed]
        results = await asyncio.gather(*tasks)

    fetched_data = defaultdict(dict)
    err_count = 0
    success_count = 0
    for tbl, yr, rows, err in results:
        if err:
            err_count += 1
            print(f"  [ERROR] {tbl} ({yr}): {err}")
        else:
            success_count += 1
            fetched_data[tbl][yr] = aggregate_saraphi(rows)

    print(f"Fetch completed: {success_count} succeeded, {err_count} failed.")

    # Merge into master_data
    for r in master_data['reports']:
        tbl = r['table_name']
        if tbl in fetched_data:
            for yr, agg in fetched_data[tbl].items():
                # Only overwrite if new data has non-zero or previous was 0
                prev_d = r['years'].get(yr, {}).get('district', {})
                if (prev_d.get('target', 0) == 0 and prev_d.get('result', 0) == 0 and prev_d.get('target_fu', 0) == 0):
                    r['years'][yr] = agg
        
        # Recalculate has_fu
        has_any_fu = any(r['years'].get(yr, {}).get('district', {}).get('has_fu', False) for yr in YEARS)
        r['has_fu'] = has_any_fu

    master_data['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')

    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, ensure_ascii=False, indent=2)

    print(f"Updated {master_file} successfully!")

if __name__ == '__main__':
    asyncio.run(main())

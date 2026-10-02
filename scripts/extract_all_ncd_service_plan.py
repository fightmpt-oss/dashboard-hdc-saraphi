import asyncio
import aiohttp
import json
import os
import sys
import time
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from saraphi_config import SARAPHI_UNITS

SARAPHI_MAP = {hc: {'name': u['name'], 'subdistrict': u['subdistrict']} for hc, u in SARAPHI_UNITS.items()}

URL = 'https://opendata.moph.go.th/api/report_data'
YEARS = ['2569', '2568', '2567']

def classify_category(name, table):
    name_lower = (name or '').lower()
    table_lower = (table or '').lower()
    
    if 'ไต' in name_lower or 'ckd' in table_lower or 'egfr' in table_lower:
        return 'CKD'
    elif 'cvd' in table_lower or 'หัวใจ' in name_lower or 'หลอดเลือด' in name_lower:
        return 'CVD'
    elif 'เบาหวาน' in name_lower or 'dm' in table_lower or 'hba1c' in table_lower:
        return 'DM'
    elif 'ความดัน' in name_lower or 'ht' in table_lower or 'bp' in table_lower:
        return 'HT'
    else:
        return 'SCREEN'

async def fetch_table_year(session, sem, table, year, max_retries=3):
    payload = {
        'tableName': table,
        'year': str(year),
        'province': '50',
        'type': 'json',
        'offset': 0,
        'limit': 5000
    }
    async with sem:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Content-Type': 'application/json'}
        for attempt in range(max_retries):
            try:
                async with session.post(URL, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=35)) as res:
                    if res.status in (200, 201):
                        data = await res.json()
                        rows = data.get('data', [])
                        # Filter Saraphi district: areacode starts with 5019
                        saraphi_rows = [r for r in rows if str(r.get('areacode', '')).startswith('5019')]
                        return table, year, saraphi_rows, None
                    else:
                        if attempt == max_retries - 1:
                            return table, year, [], f"HTTP {res.status}"
            except Exception as e:
                if attempt == max_retries - 1:
                    return table, year, [], str(e)
            await asyncio.sleep(1.5)
    return table, year, [], "Unknown Error"

def aggregate_saraphi(rows):
    """Aggregate rows by hospcode and district total for both Typearea and ChronicFU."""
    units_acc = defaultdict(lambda: {
        'target': 0, 'result': 0, 'result1': 0, 'result2': 0, 'result3': 0, 'result4': 0,
        'target_fu': 0, 'result_fu': 0, 'result1_fu': 0, 'result2_fu': 0, 'result3_fu': 0, 'result4_fu': 0
    })
    
    for r in rows:
        h = str(r.get('hospcode') or '').strip()
        # Clean hospcode to 5 digits if needed
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
        units_acc[h]['result3'] += float(r.get('result3') or 0)
        units_acc[h]['result4'] += float(r.get('result4') or 0)
        
        units_acc[h]['target_fu'] += t_fu
        units_acc[h]['result_fu'] += res_fu
        units_acc[h]['result1_fu'] += float(r.get('result1_1') or 0)
        units_acc[h]['result2_fu'] += float(r.get('result2_1') or 0)
        units_acc[h]['result3_fu'] += float(r.get('result3_1') or 0)
        units_acc[h]['result4_fu'] += float(r.get('result4_1') or 0)
        
    # Build complete units dictionary ensuring all standard 14 Saraphi units exist
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
        
    # Also add any other hospcode in Saraphi if present (e.g. 11999, 14550)
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

    # District Totals
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
    print("==================================================================", flush=True)
    print("Starting Extraction of NCD Service Plan Reports (OpenData MoPH)", flush=True)
    print("==================================================================", flush=True)
    
    # 1. Load 70 catalog reports
    catalog_path = 'data/ncd_service_plan_catalog.json'
    if not os.path.exists(catalog_path):
        print(f"Error: {catalog_path} not found!")
        return
        
    with open(catalog_path, encoding='utf-8') as f:
        catalog = json.load(f)
        
    print(f"Loaded {len(catalog)} reports from catalog.")
    
    # Unique tables
    unique_tables = sorted(list(set(r.get('source_table') for r in catalog if r.get('source_table'))))
    print(f"Found {len(unique_tables)} unique tables.")
    
    # 2. Fetch all unique tables x 3 years
    sem = asyncio.Semaphore(5) # max 5 concurrent requests
    raw_data = defaultdict(dict) # raw_data[table][year] = aggregated
    
    t0 = time.time()
    async with aiohttp.ClientSession() as session:
        tasks = []
        for tbl in unique_tables:
            for yr in YEARS:
                tasks.append(fetch_table_year(session, sem, tbl, yr))
                
        print(f"Dispatching {len(tasks)} requests (5 concurrent)...", flush=True)
        results = await asyncio.gather(*tasks)
        
    elapsed = time.time() - t0
    print(f"Finished fetching {len(results)} requests in {elapsed:.2f}s ({len(results)/elapsed:.1f} req/s).", flush=True)
    
    # Process results into raw_data
    err_count = 0
    for tbl, yr, rows, err in results:
        if err:
            err_count += 1
            print(f"  [WARN] {tbl} ({yr}): {err}", flush=True)
        raw_data[tbl][yr] = aggregate_saraphi(rows)
        
    print(f"Data aggregation complete! Errors: {err_count}")
    
    # 3. Build comprehensive NCD Service Plan Master Dataset
    master_reports = []
    
    for idx, item in enumerate(catalog, 1):
        tbl = item.get('source_table')
        name = item.get('report_name')
        od_id = item.get('opendata_id')
        rid = item.get('report_id')
        category = classify_category(name, tbl)
        
        report_obj = {
            'id': f"ncd_{idx:02d}",
            'report_id': rid,
            'table_name': tbl,
            'name': name,
            'category': category,
            'opendata_id': od_id,
            'hdc_url': f"https://hdc.moph.go.th/cmi/public/standard-report-detail/{od_id}" if od_id else "",
            'opendata_url': f"https://opendata.moph.go.th/th/services/summary-table/b2b59e64c4e6c92d4b1ec16a599d882b",
            'has_fu': False,
            'years': {}
        }
        
        tbl_data = raw_data.get(tbl, {})
        has_any_fu = False
        for yr in YEARS:
            yr_data = tbl_data.get(yr, {
                'district': {'target': 0, 'result': 0, 'rate': 0.0, 'result1': 0, 'result2': 0, 'target_fu': 0, 'result_fu': 0, 'rate_fu': 0.0, 'result1_fu': 0, 'result2_fu': 0, 'has_fu': False},
                'units': {code: {'hospcode': code, 'name': meta['name'], 'subdistrict': meta['subdistrict'], 'target': 0, 'result': 0, 'rate': 0.0, 'result1': 0, 'result2': 0, 'target_fu': 0, 'result_fu': 0, 'rate_fu': 0.0, 'result1_fu': 0, 'result2_fu': 0} for code, meta in SARAPHI_MAP.items()}
            })
            if yr_data.get('district', {}).get('has_fu'):
                has_any_fu = True
            report_obj['years'][yr] = yr_data
            
        report_obj['has_fu'] = has_any_fu
        master_reports.append(report_obj)
        
    # 4. Save to master JSON file
    output_dir = 'data'
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'ncd_service_plan_master.json')
    
    output_data = {
        'last_updated': time.strftime('%Y-%m-%d %H:%M:%S'),
        'total_reports': len(master_reports),
        'years': YEARS,
        'categories': {
            'ALL': 'ทั้งหมด (70 รายงาน)',
            'DM': 'โรคเบาหวาน (Diabetes)',
            'HT': 'ความดันโลหิตสูง (Hypertension)',
            'CVD': 'หลอดเลือดหัวใจ (CVD)',
            'CKD': 'โรคไตเรื้อรัง (CKD)',
            'SCREEN': 'คัดกรอง & ปัจจัยเสี่ยง (Screening)'
        },
        'reports': master_reports
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    file_size_kb = os.path.getsize(output_file) / 1024
    print(f"\n==================================================================", flush=True)
    print(f"SUCCESS: Saved {len(master_reports)} NCD reports to {output_file} ({file_size_kb:.1f} KB)", flush=True)
    print(f"==================================================================", flush=True)
    
    # Print sample stats for s_dm_screen
    dm_screen = next((r for r in master_reports if r['table_name'] == 's_dm_screen'), None)
    if dm_screen:
        print("\nSample Report Verification (s_dm_screen):")
        for yr in YEARS:
            d = dm_screen['years'][yr]['district']
            print(f"  Year {yr}: Target (B) = {d['target']:,} | Result (A) = {d['result']:,} | Rate = {d['rate']:.2f}%")

if __name__ == '__main__':
    asyncio.run(main())

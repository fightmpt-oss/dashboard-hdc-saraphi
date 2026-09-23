import urllib.request
import json
import os
import sys
import time
from collections import defaultdict

SARAPHI_MAP = {
    '11135': {'name': 'รพ.สารภี', 'subdistrict': 'สารภี'},
    '06014': {'name': 'รพ.สต.บ้านยางเนิ้ง', 'subdistrict': 'ยางเนิ้ง'},
    '06015': {'name': 'รพ.สต.บ้านพญาชมภู', 'subdistrict': 'ชมภู'},
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

NEW_INDICATORS = [
    {
        'table_name': 's_dm_screen_risk',
        'report_name': 'ประชากร 35 ปีขึ้นไปได้รับการคัดกรอง และเสี่ยงต่อโรคเบาหวาน',
        'category': 'DM',
        'opendata_id': '323a75335033c5976566d99f5ad53b33',
        'risk_type': 'dm',
        'criteria': {
            'normal': 'น้ำตาลในเลือด 70 - <100 มิลลิกรัมเปอร์เซ็นต์',
            'risk': 'น้ำตาลในเลือด 100 - <126 มิลลิกรัมเปอร์เซ็นต์',
            'high_risk': 'น้ำตาลในเลือด มากกว่าหรือเท่ากับ 126 มิลลิกรัมเปอร์เซ็นต์',
            'out_of_bounds': 'น้ำตาลในเลือด < 70 มิลลิกรัมเปอร์เซ็นต์'
        }
    },
    {
        'table_name': 's_ht_screen_risk',
        'report_name': 'ประชากร 35 ปีขึ้นไปได้รับการคัดกรอง และเสี่ยงต่อโรคความดันโลหิตสูง',
        'category': 'HT',
        'opendata_id': '6833128a5d76a6afcae3e4a6af0e718c',
        'risk_type': 'ht',
        'criteria': {
            'normal': 'กลุ่มเสี่ยง = 0 (ความดันปกติ)',
            'risk': 'กลุ่มเสี่ยง = 1 (กลุ่มเสี่ยง)',
            'high_risk': 'กลุ่มเสี่ยง = 2 (สงสัยป่วย)',
            'ill_doctor': 'กลุ่มเสี่ยง = 3 (ป่วย ส่งพบแพทย์)',
            'out_of_bounds': 'อื่นๆ ที่ไม่เข้าเกณฑ์ข้างต้น'
        }
    }
]

def fetch_table_rows(table, year, max_retries=3):
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
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(URL, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=35) as res:
                if res.status in (200, 201):
                    data = json.loads(res.read().decode('utf-8'))
                    rows = data.get('data', [])
                    return [r for r in rows if str(r.get('areacode', '')).startswith('5019')]
        except Exception as e:
            print(f"  [Attempt {attempt+1}] Error fetching {table} ({year}): {e}")
            time.sleep(2)
    return []

def aggregate_risk_data(rows, risk_type):
    by_hosp = defaultdict(lambda: {
        'target': 0, 'result': 0, 'normal': 0, 'risk': 0, 'high_risk': 0, 'ill_doctor': 0, 'out_of_bounds': 0
    })

    for r in rows:
        h = str(r.get('hospcode') or '').strip()
        if len(h) > 5 and h.startswith('0'):
            h = h[-5:]
        elif len(h) < 5 and h:
            h = h.zfill(5)
            
        t = int(r.get('target') or 0)
        res = int(r.get('result') or 0)
        norm = int(r.get('normal') or 0)
        risk = int(r.get('risk') or 0)
        high = int(r.get('high_risk') or 0)
        ill_doc = int(r.get('ill_1') or 0) if risk_type == 'ht' else 0

        by_hosp[h]['target'] += t
        by_hosp[h]['result'] += res
        by_hosp[h]['normal'] += norm
        by_hosp[h]['risk'] += risk
        by_hosp[h]['high_risk'] += high
        by_hosp[h]['ill_doctor'] += ill_doc

    units = {}
    for code, meta in SARAPHI_MAP.items():
        u = by_hosp.get(code, {
            'target': 0, 'result': 0, 'normal': 0, 'risk': 0, 'high_risk': 0, 'ill_doctor': 0
        })
        t = u['target']
        res = u['result']
        norm = u['normal']
        risk = u['risk']
        high = u['high_risk']
        ill_doc = u['ill_doctor']
        
        # Calculate out of bounds
        if risk_type == 'ht':
            oob = max(0, res - (norm + risk + high + ill_doc))
        else:
            oob = max(0, res - (norm + risk + high))

        rate = round((res / t * 100), 2) if t > 0 else 0.0
        norm_rate = round((norm / res * 100), 2) if res > 0 else 0.0
        risk_rate = round((risk / res * 100), 2) if res > 0 else 0.0
        high_rate = round((high / res * 100), 2) if res > 0 else 0.0
        ill_rate = round((ill_doc / res * 100), 2) if res > 0 else 0.0
        oob_rate = round((oob / res * 100), 2) if res > 0 else 0.0

        units[code] = {
            'hospcode': code,
            'name': meta['name'],
            'subdistrict': meta['subdistrict'],
            'target': t,
            'result': res,
            'rate': rate,
            'normal': norm,
            'normal_rate': norm_rate,
            'risk': risk,
            'risk_rate': risk_rate,
            'high_risk': high,
            'high_risk_rate': high_rate,
            'ill_doctor': ill_doc,
            'ill_doctor_rate': ill_rate,
            'out_of_bounds': oob,
            'out_of_bounds_rate': oob_rate,
            # Compatibility fields for generic views
            'result1': norm,
            'result2': risk,
            'target_fu': 0,
            'result_fu': 0,
            'rate_fu': 0.0,
            'result1_fu': 0,
            'result2_fu': 0
        }

    # District Totals from ALL Saraphi records
    dist_t = sum(u['target'] for u in by_hosp.values())
    dist_res = sum(u['result'] for u in by_hosp.values())
    dist_norm = sum(u['normal'] for u in by_hosp.values())
    dist_risk = sum(u['risk'] for u in by_hosp.values())
    dist_high = sum(u['high_risk'] for u in by_hosp.values())
    dist_ill = sum(u['ill_doctor'] for u in by_hosp.values())
    if risk_type == 'ht':
        dist_oob = max(0, dist_res - (dist_norm + dist_risk + dist_high + dist_ill))
    else:
        dist_oob = max(0, dist_res - (dist_norm + dist_risk + dist_high))

    dist_rate = round((dist_res / dist_t * 100), 2) if dist_t > 0 else 0.0
    dist_norm_rate = round((dist_norm / dist_res * 100), 2) if dist_res > 0 else 0.0
    dist_risk_rate = round((dist_risk / dist_res * 100), 2) if dist_res > 0 else 0.0
    dist_high_rate = round((dist_high / dist_res * 100), 2) if dist_res > 0 else 0.0
    dist_ill_rate = round((dist_ill / dist_res * 100), 2) if dist_res > 0 else 0.0
    dist_oob_rate = round((dist_oob / dist_res * 100), 2) if dist_res > 0 else 0.0

    return {
        'district': {
            'target': dist_t,
            'result': dist_res,
            'rate': dist_rate,
            'normal': dist_norm,
            'normal_rate': dist_norm_rate,
            'risk': dist_risk,
            'risk_rate': dist_risk_rate,
            'high_risk': dist_high,
            'high_risk_rate': dist_high_rate,
            'ill_doctor': dist_ill,
            'ill_doctor_rate': dist_ill_rate,
            'out_of_bounds': dist_oob,
            'out_of_bounds_rate': dist_oob_rate,
            'result1': dist_norm,
            'result2': dist_risk,
            'target_fu': 0,
            'result_fu': 0,
            'rate_fu': 0.0,
            'result1_fu': 0,
            'result2_fu': 0,
            'has_fu': False
        },
        'units': units
    }

def main():
    print("==================================================================")
    print("Enriching Service Plan NCD with s_dm_screen_risk & s_ht_screen_risk")
    print("==================================================================")

    master_path = 'data/ncd_service_plan_master.json'
    catalog_path = 'data/ncd_service_plan_catalog.json'

    with open(master_path, encoding='utf-8') as f:
        master_data = json.load(f)

    with open(catalog_path, encoding='utf-8') as f:
        catalog_data = json.load(f)

    existing_reports = master_data.get('reports', [])
    existing_tables = set(r['table_name'] for r in existing_reports)

    # 1. Update Catalog
    cat_tables = set(c.get('source_table') for c in catalog_data)
    for ind in NEW_INDICATORS:
        tbl = ind['table_name']
        if tbl not in cat_tables:
            catalog_entry = {
                'id': 900 + len(catalog_data),
                'report_id': 275 if ind['risk_type'] == 'dm' else 276,
                'report_name': ind['report_name'],
                'cat_id': '6966b0664b89805a484d7ac96c6edc48',
                'source_table': tbl,
                'main_report_id': '73daf277928bc32a1b3c8e772192543c',
                'category_name': f"ข้อมูลเพื่อตอบสนอง Service Plan สาขาโรคไม่ติดต่อ ({ind['category']})",
                'main_report_name': 'ข้อมูลตอบสนอง Service Plan',
                'opendata_id': ind['opendata_id'],
                'view_count': 500,
                'last_synced_at': time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                'created_at': '2026-05-22T09:10:00.000Z',
                'updated_at': time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                'cat_name': f"ข้อมูลเพื่อตอบสนอง Service Plan สาขาโรคไม่ติดต่อ ({ind['category']})"
            }
            catalog_data.append(catalog_entry)
            print(f"Added {tbl} to catalog.")

    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog_data, f, ensure_ascii=False, indent=2)

    # 2. Fetch and aggregate data for new indicators
    new_report_objs = []
    for ind in NEW_INDICATORS:
        tbl = ind['table_name']
        print(f"\nProcessing {ind['report_name']} ({tbl})...")
        
        years_data = {}
        for yr in YEARS:
            print(f"  Fetching year {yr}...")
            rows = fetch_table_rows(tbl, yr)
            print(f"    Fetched {len(rows)} Saraphi rows.")
            aggregated = aggregate_risk_data(rows, ind['risk_type'])
            years_data[yr] = aggregated

        # Build report object
        report_id_str = f"ncd_risk_{ind['risk_type']}"
        report_obj = {
            'id': report_id_str,
            'report_id': 275 if ind['risk_type'] == 'dm' else 276,
            'table_name': tbl,
            'name': ind['report_name'],
            'category': ind['category'],
            'opendata_id': ind['opendata_id'],
            'hdc_url': f"https://hdc.moph.go.th/cmi/public/standard-report-detail/{ind['opendata_id']}",
            'opendata_url': "https://opendata.moph.go.th/th/services/summary-table/b2b59e64c4e6c92d4b1ec16a599d882b",
            'has_fu': False,
            'is_risk_screen': True,
            'risk_type': ind['risk_type'],
            'criteria': ind['criteria'],
            'years': years_data
        }
        new_report_objs.append(report_obj)

    # 3. Merge into master_data
    # Remove existing ones if previously added
    existing_reports = [r for r in existing_reports if r['table_name'] not in [ind['table_name'] for ind in NEW_INDICATORS]]
    
    # Insert new reports in appropriate positions:
    # DM risk right after s_dm_screen (or at top of DM)
    # HT risk right after s_ht_screen (or at top of HT)
    updated_reports = []
    dm_inserted = False
    ht_inserted = False

    dm_obj = next(r for r in new_report_objs if r['risk_type'] == 'dm')
    ht_obj = next(r for r in new_report_objs if r['risk_type'] == 'ht')

    for r in existing_reports:
        updated_reports.append(r)
        if r.get('table_name') == 's_dm_screen' and not dm_inserted:
            updated_reports.append(dm_obj)
            dm_inserted = True
        elif r.get('table_name') == 's_ht_screen' and not ht_inserted:
            updated_reports.append(ht_obj)
            ht_inserted = True

    if not dm_inserted:
        updated_reports.append(dm_obj)
    if not ht_inserted:
        updated_reports.append(ht_obj)

    # Re-index ids
    for idx, r in enumerate(updated_reports, 1):
        if not r.get('is_risk_screen'):
            r['id'] = f"ncd_{idx:02d}"
        else:
            r['id'] = f"ncd_risk_{r['risk_type']}"

    master_data['reports'] = updated_reports
    master_data['total_reports'] = len(updated_reports)
    master_data['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')

    with open(master_path, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, ensure_ascii=False, indent=2)

    print(f"\nSUCCESS: Master data updated with {len(updated_reports)} reports.")

    # 4. Verify 2569 figures against screenshots
    print("\n--- Verification against HDC screenshots (2569) ---")
    for r in [dm_obj, ht_obj]:
        d2569 = r['years']['2569']['district']
        u06014 = r['years']['2569']['units']['06014']
        u06017 = r['years']['2569']['units']['06017']
        u06020 = r['years']['2569']['units']['06020']

        print(f"\n{r['name']} ({r['table_name']}):")
        print(f"  District Total: Target={d2569['target']:,} | Screen={d2569['result']:,} ({d2569['rate']}%) | Norm={d2569['normal']:,} ({d2569['normal_rate']}%) | Risk={d2569['risk']:,} ({d2569['risk_rate']}%)")
        print(f"  06014 (ยางเนิ้ง): Target={u06014['target']:,} | Screen={u06014['result']:,} ({u06014['rate']}%) | Norm={u06014['normal']:,} ({u06014['normal_rate']}%) | Risk={u06014['risk']:,} ({u06014['risk_rate']}%) | HighRisk={u06014['high_risk']:,} ({u06014['high_risk_rate']}%) | OOB={u06014['out_of_bounds']:,} ({u06014['out_of_bounds_rate']}%)")
        print(f"  06017 (หัวดง): Target={u06017['target']:,} | Screen={u06017['result']:,} ({u06017['rate']}%) | Norm={u06017['normal']:,} ({u06017['normal_rate']}%) | Risk={u06017['risk']:,} ({u06017['risk_rate']}%) | HighRisk={u06017['high_risk']:,} ({u06017['high_risk_rate']}%) | OOB={u06017['out_of_bounds']:,} ({u06017['out_of_bounds_rate']}%)")
        print(f"  06020 (บ้านแคว): Target={u06020['target']:,} | Screen={u06020['result']:,} ({u06020['rate']}%) | Norm={u06020['normal']:,} ({u06020['normal_rate']}%) | Risk={u06020['risk']:,} ({u06020['risk_rate']}%) | HighRisk={u06020['high_risk']:,} ({u06020['high_risk_rate']}%) | OOB={u06020['out_of_bounds']:,} ({u06020['out_of_bounds_rate']}%)")

if __name__ == '__main__':
    main()

# -*- coding: utf-8 -*-
"""
enrich_ht_control_master_data.py
Fetches s_ht_control (2e3813337b6b5377c2f68affe247d5f9) from OpenData MOPH API for years 2569, 2568, 2567.
Enriches data/ncd_service_plan_master.json and data/ncd_service_plan_catalog.json with full 20-column HDC schema:
  Typearea 1,3: B1, D1, bp_1x_1, bp_ge2_1, rate_bp_ge2_1, A1, rate1, C1, rate_c1
  ChronicFU: B2, fu_ge2_2, D2, bp_1x_2, bp_ge2_2, rate_bp_ge2_2, A2, rate2, C2, rate_c2
KPI Target: 60.0%
"""
import urllib.request
import json
import os
import sys
from collections import defaultdict

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

URL = 'https://opendata.moph.go.th/api/report_data'
YEARS = ['2569', '2568', '2567']

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

def fetch_year_data(year):
    payload = {
        'tableName': 's_ht_control',
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
    req = urllib.request.Request(URL, data=json.dumps(payload).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode('utf-8'))
        rows = data.get('data', [])
        saraphi = [r for r in rows if str(r.get('areacode', '')).startswith('5019')]

    # Raw field aggregation per unit
    raw_units = defaultdict(lambda: {
        'target': 0, 'result': 0, 'bp': 0, 'target1': 0, 'result1': 0,
        'bp1': 0, 'target2': 0, 'no_bp_d': 0, 'no_bp_f': 0, 'bp1_d': 0,
        'bp1_f': 0, 'result_bp1_d': 0, 'result_bp1_f': 0
    })
    raw_dist = {
        'target': 0, 'result': 0, 'bp': 0, 'target1': 0, 'result1': 0,
        'bp1': 0, 'target2': 0, 'no_bp_d': 0, 'no_bp_f': 0, 'bp1_d': 0,
        'bp1_f': 0, 'result_bp1_d': 0, 'result_bp1_f': 0
    }

    for r in saraphi:
        h = r.get('hospcode')
        if not h or h == '11999': continue
        for k in raw_dist.keys():
            v = int(r.get(k) or 0) if r.get(k) is not None else 0
            raw_units[h][k] += v
            raw_dist[k] += v

    units_data = {}
    for h, meta in SARAPHI_MAP.items():
        u = raw_units[h]
        b1 = u['target']
        d1 = u['no_bp_d']
        bp_1x_1 = u['bp1_d']
        bp_ge2_1 = u['bp']
        rate_bp_ge2_1 = round(bp_ge2_1 / b1 * 100, 2) if b1 > 0 else 0.0
        a1 = u['result_bp1_d']
        rate1 = round(a1 / b1 * 100, 2) if b1 > 0 else 0.0
        c1 = u['result']
        rate_c1 = round(c1 / b1 * 100, 2) if b1 > 0 else 0.0

        b2 = u['target1']
        fu_ge2_2 = u['target2'] or u['bp1']
        d2 = u['no_bp_f']
        bp_1x_2 = u['bp1_f']
        bp_ge2_2 = u['bp1']
        rate_bp_ge2_2 = round(bp_ge2_2 / b2 * 100, 2) if b2 > 0 else 0.0
        a2 = u['result_bp1_f']
        rate2 = round(a2 / b2 * 100, 2) if b2 > 0 else 0.0
        c2 = u['result1']
        rate_c2 = round(c2 / b2 * 100, 2) if b2 > 0 else 0.0

        units_data[h] = {
            'hospcode': h,
            'name': meta['name'],
            'subdistrict': meta['subdistrict'],
            # Standard fields
            'target': b1,
            'result': a1,
            'rate': rate1,
            'target_fu': b2,
            'result_fu': a2,
            'rate_fu': rate2,
            # Extended HDC fields
            'b1': b1,
            'd1': d1,
            'bp_1x_1': bp_1x_1,
            'bp_ge2_1': bp_ge2_1,
            'rate_bp_ge2_1': rate_bp_ge2_1,
            'a1': a1,
            'rate1': rate1,
            'c1': c1,
            'rate_c1': rate_c1,
            'b2': b2,
            'fu_ge2_2': fu_ge2_2,
            'd2': d2,
            'bp_1x_2': bp_1x_2,
            'bp_ge2_2': bp_ge2_2,
            'rate_bp_ge2_2': rate_bp_ge2_2,
            'a2': a2,
            'rate2': rate2,
            'c2': c2,
            'rate_c2': rate_c2
        }

    # District aggregation
    dB1 = raw_dist['target']
    dD1 = raw_dist['no_bp_d']
    d_bp_1x_1 = raw_dist['bp1_d']
    d_bp_ge2_1 = raw_dist['bp']
    d_rate_bp_ge2_1 = round(d_bp_ge2_1 / dB1 * 100, 2) if dB1 > 0 else 0.0
    dA1 = raw_dist['result_bp1_d']
    d_rate1 = round(dA1 / dB1 * 100, 2) if dB1 > 0 else 0.0
    dC1 = raw_dist['result']
    d_rate_c1 = round(dC1 / dB1 * 100, 2) if dB1 > 0 else 0.0

    dB2 = raw_dist['target1']
    d_fu_ge2_2 = raw_dist['target2'] or raw_dist['bp1']
    dD2 = raw_dist['no_bp_f']
    d_bp_1x_2 = raw_dist['bp1_f']
    d_bp_ge2_2 = raw_dist['bp1']
    d_rate_bp_ge2_2 = round(d_bp_ge2_2 / dB2 * 100, 2) if dB2 > 0 else 0.0
    dA2 = raw_dist['result_bp1_f']
    d_rate2 = round(dA2 / dB2 * 100, 2) if dB2 > 0 else 0.0
    dC2 = raw_dist['result1']
    d_rate_c2 = round(dC2 / dB2 * 100, 2) if dB2 > 0 else 0.0

    district_data = {
        'target': dB1,
        'result': dA1,
        'rate': d_rate1,
        'target_fu': dB2,
        'result_fu': dA2,
        'rate_fu': d_rate2,
        'has_fu': True,
        'b1': dB1,
        'd1': dD1,
        'bp_1x_1': d_bp_1x_1,
        'bp_ge2_1': d_bp_ge2_1,
        'rate_bp_ge2_1': d_rate_bp_ge2_1,
        'a1': dA1,
        'rate1': d_rate1,
        'c1': dC1,
        'rate_c1': d_rate_c1,
        'b2': dB2,
        'fu_ge2_2': d_fu_ge2_2,
        'd2': dD2,
        'bp_1x_2': d_bp_1x_2,
        'bp_ge2_2': d_bp_ge2_2,
        'rate_bp_ge2_2': d_rate_bp_ge2_2,
        'a2': dA2,
        'rate2': d_rate2,
        'c2': dC2,
        'rate_c2': d_rate_c2
    }

    return units_data, district_data

def main():
    print("=========================================================")
    print("Fetching s_ht_control from OpenData MOPH API (2569, 2568, 2567)...")
    print("=========================================================")

    all_years = {}
    for yr in YEARS:
        print(f"Fetching Year {yr}...")
        u_data, d_data = fetch_year_data(yr)
        all_years[yr] = {
            'units': u_data,
            'district': d_data
        }
        print(f"  Year {yr} District Totals:")
        print(f"    Typearea 1,3: B1={d_data['b1']}, A1={d_data['a1']}, rate1={d_data['rate1']}%, C1={d_data['c1']}, rate_c1={d_data['rate_c1']}%")
        print(f"    ChronicFU:    B2={d_data['b2']}, A2={d_data['a2']}, rate2={d_data['rate2']}%, C2={d_data['c2']}, rate_c2={d_data['rate_c2']}%")

    # 1. Update data/ncd_service_plan_master.json
    master_path = os.path.join('data', 'ncd_service_plan_master.json')
    with open(master_path, 'r', encoding='utf-8') as f:
        master = json.load(f)

    # Check if ncd_ht_control exists, or add it
    report_entry = None
    for r in master['reports']:
        if r.get('id') == 'ncd_ht_control' or r.get('table_name') == 's_ht_control':
            report_entry = r
            break

    if not report_entry:
        report_entry = {
            'id': 'ncd_ht_control',
            'report_id': 146,
            'table_name': 's_ht_control',
            'name': 'ร้อยละผู้ป่วยโรคความดันโลหิตสูงที่ควบคุมความดันโลหิตได้ดี',
            'category': 'ความดันโลหิตสูง (HT)',
            'opendata_id': '2e3813337b6b5377c2f68affe247d5f9',
            'hdc_url': 'https://hdc.moph.go.th/cmi/public/standard-report-detail/2e3813337b6b5377c2f68affe247d5f9',
            'opendata_url': 'https://opendata.moph.go.th/api/report_data',
            'has_fu': True,
            'is_ht_control': True,
            'kpi_target': 60.0,
            'years': {}
        }
        master['reports'].insert(1, report_entry) # Put right after ncd_dm_control or at top
        print("Created new report entry 'ncd_ht_control' in master.")
    else:
        report_entry['id'] = 'ncd_ht_control'
        report_entry['report_id'] = 146
        report_entry['table_name'] = 's_ht_control'
        report_entry['name'] = 'ร้อยละผู้ป่วยโรคความดันโลหิตสูงที่ควบคุมความดันโลหิตได้ดี'
        report_entry['category'] = 'ความดันโลหิตสูง (HT)'
        report_entry['opendata_id'] = '2e3813337b6b5377c2f68affe247d5f9'
        report_entry['hdc_url'] = 'https://hdc.moph.go.th/cmi/public/standard-report-detail/2e3813337b6b5377c2f68affe247d5f9'
        report_entry['has_fu'] = True
        report_entry['is_ht_control'] = True
        report_entry['kpi_target'] = 60.0
        print("Updated existing report entry 'ncd_ht_control' in master.")

    report_entry['years'] = all_years

    # Also update ncd_18 if present so both work seamlessly
    for r in master['reports']:
        if r.get('id') == 'ncd_18':
            r['table_name'] = 's_ht_control'
            r['name'] = 'ร้อยละผู้ป่วยโรคความดันโลหิตสูงที่ควบคุมความดันโลหิตได้ดี'
            r['category'] = 'ความดันโลหิตสูง (HT)'
            r['opendata_id'] = '2e3813337b6b5377c2f68affe247d5f9'
            r['hdc_url'] = 'https://hdc.moph.go.th/cmi/public/standard-report-detail/2e3813337b6b5377c2f68affe247d5f9'
            r['has_fu'] = True
            r['is_ht_control'] = True
            r['kpi_target'] = 60.0
            r['years'] = all_years
            print("Also updated ncd_18 to point to s_ht_control HDC data.")
            break

    with open(master_path, 'w', encoding='utf-8') as f:
        json.dump(master, f, ensure_ascii=False, indent=2)
    print(f"Saved {master_path} successfully.")

    # 2. Update data/ncd_service_plan_catalog.json
    cat_path = os.path.join('data', 'ncd_service_plan_catalog.json')
    with open(cat_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    # Check if s_ht_control exists in catalog
    cat_entry = None
    for c in catalog:
        if c.get('source_table') == 's_ht_control' or c.get('opendata_id') == '2e3813337b6b5377c2f68affe247d5f9':
            cat_entry = c
            break

    if not cat_entry:
        cat_entry = {
            "id": 637,
            "report_id": 146,
            "report_name": "ร้อยละผู้ป่วยโรคความดันโลหิตสูงที่ควบคุมความดันโลหิตได้ดี",
            "cat_id": "b2b59e64c4e6c92d4b1ec16a599d882b",
            "source_table": "s_ht_control",
            "main_report_id": "02e752187c7282ebc9315123aa1cabbe",
            "category_name": "ความดันโลหิตสูง (HT)",
            "main_report_name": "ข้อมูลตอบสนอง Service Plan",
            "opendata_id": "2e3813337b6b5377c2f68affe247d5f9",
            "view_count": 650,
            "last_synced_at": "2026-09-24T22:00:00.000Z",
            "created_at": "2026-05-22T09:10:07.000Z",
            "updated_at": "2026-09-24T22:00:00.000Z",
            "cat_name": "ข้อมูลตอบสนอง Service Plan สาขาโรคไม่ติดต่อ (NCD DM,HT,CVD)"
        }
        catalog.insert(1, cat_entry)
        print("Added s_ht_control entry to catalog.")
    else:
        cat_entry['source_table'] = 's_ht_control'
        cat_entry['report_name'] = 'ร้อยละผู้ป่วยโรคความดันโลหิตสูงที่ควบคุมความดันโลหิตได้ดี'
        cat_entry['category_name'] = 'ความดันโลหิตสูง (HT)'
        print("Updated s_ht_control entry in catalog.")

    with open(cat_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    print(f"Saved {cat_path} successfully.")

    print("\nENRICHMENT FINISHED SUCCESSFULLY!")

if __name__ == '__main__':
    main()

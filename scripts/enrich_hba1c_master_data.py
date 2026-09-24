# -*- coding: utf-8 -*-
import urllib.request
import json
import os
import sys
from collections import defaultdict

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
        'tableName': 's_dm_hba1c',
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

    units = defaultdict(lambda: {'b1': 0, 'a1': 0, 'a3': 0, 'b2': 0, 'a2': 0, 'a4': 0})
    for r in saraphi:
        h = r.get('hospcode')
        if not h: continue
        units[h]['b1'] += int(r.get('target') or 0)
        units[h]['a1'] += int(r.get('result') or 0)
        units[h]['a3'] += int(r.get('result_2') or 0)
        if r.get('target1') is not None:
            units[h]['b2'] += int(r.get('target1') or 0)
        if r.get('result1') is not None:
            units[h]['a2'] += int(r.get('result1') or 0)
        if r.get('result1_2') is not None:
            units[h]['a4'] += int(r.get('result1_2') or 0)

    # Calculate rates and format for 14 units
    formatted_units = {}
    tot_b1, tot_a1, tot_a3 = 0, 0, 0
    tot_b2, tot_a2, tot_a4 = 0, 0, 0

    for code, meta in SARAPHI_MAP.items():
        u = units.get(code, {'b1': 0, 'a1': 0, 'a3': 0, 'b2': 0, 'a2': 0, 'a4': 0})
        b1, a1, a3 = u['b1'], u['a1'], u['a3']
        b2, a2, a4 = u['b2'], u['a2'], u['a4']
        rate1 = round((a1 / b1 * 100), 2) if b1 > 0 else 0.0
        rate3 = round((a3 / b1 * 100), 2) if b1 > 0 else 0.0
        rate2 = round((a2 / b2 * 100), 2) if b2 > 0 else 0.0
        rate4 = round((a4 / b2 * 100), 2) if b2 > 0 else 0.0

        tot_b1 += b1
        tot_a1 += a1
        tot_a3 += a3
        tot_b2 += b2
        tot_a2 += a2
        tot_a4 += a4

        formatted_units[code] = {
            'hospcode': code,
            'name': meta['name'],
            'subdistrict': meta['subdistrict'],
            # Standard NCD keys
            'target': b1,
            'result': a1,
            'rate': rate1,
            'result1': a3,
            'result2': 0,
            'target_fu': b2,
            'result_fu': a2,
            'rate_fu': rate2,
            'result1_fu': a4,
            'result2_fu': 0,
            # Explicit HbA1c keys matching HDC table
            'b1': b1,
            'a1': a1,
            'rate1': rate1,
            'a3': a3,
            'rate3': rate3,
            'b2': b2,
            'a2': a2,
            'rate2': rate2,
            'a4': a4,
            'rate4': rate4
        }

    tot_rate1 = round((tot_a1 / tot_b1 * 100), 2) if tot_b1 > 0 else 0.0
    tot_rate3 = round((tot_a3 / tot_b1 * 100), 2) if tot_b1 > 0 else 0.0
    tot_rate2 = round((tot_a2 / tot_b2 * 100), 2) if tot_b2 > 0 else 0.0
    tot_rate4 = round((tot_a4 / tot_b2 * 100), 2) if tot_b2 > 0 else 0.0

    district_summary = {
        'target': tot_b1,
        'result': tot_a1,
        'rate': tot_rate1,
        'result1': tot_a3,
        'result2': 0,
        'target_fu': tot_b2,
        'result_fu': tot_a2,
        'rate_fu': tot_rate2,
        'result1_fu': tot_a4,
        'result2_fu': 0,
        'has_fu': True,
        'b1': tot_b1,
        'a1': tot_a1,
        'rate1': tot_rate1,
        'a3': tot_a3,
        'rate3': tot_rate3,
        'b2': tot_b2,
        'a2': tot_a2,
        'rate2': tot_rate2,
        'a4': tot_a4,
        'rate4': tot_rate4
    }

    return {
        'district': district_summary,
        'units': formatted_units
    }

def main():
    print("==================================================================")
    print("Enriching s_dm_hba1c Data in ncd_service_plan_master.json")
    print("==================================================================")
    
    ncd_path = r'd:\PROJECTS\Dashboard HDC Saraphi\data\ncd_service_plan_master.json'
    with open(ncd_path, 'r', encoding='utf-8') as f:
        master = json.load(f)

    # Locate report ncd_55 (s_dm_hba1c)
    target_report = None
    for rep in master.get('reports', []):
        if rep.get('table_name') == 's_dm_hba1c' or rep.get('id') == 'ncd_55':
            target_report = rep
            break

    if not target_report:
        print("ERROR: Report s_dm_hba1c not found in master json!")
        return

    print(f"Found report: {target_report['id']} - {target_report['name']}")
    target_report['has_fu'] = True
    target_report['has_hba1c'] = True
    target_report['hba1c_details'] = {
        'typearea': {
            'target_label': 'จำนวนผู้ป่วย (B1)',
            'a1_label': 'ได้รับการตรวจ HbA1c อย่างน้อย 1 ครั้ง/ปี (A1)',
            'rate1_label': 'ร้อยละ [A1/B1] x 100',
            'a3_label': 'ได้รับการตรวจ HbA1c อย่างน้อย 2 ครั้ง/ปี (A3)',
            'rate3_label': 'ร้อยละ [A3/B1] x 100'
        },
        'chronicfu': {
            'target_label': 'จำนวนผู้ป่วย (B2)',
            'a2_label': 'ได้รับการตรวจ HbA1c อย่างน้อย 1 ครั้ง/ปี (A2)',
            'rate2_label': 'ร้อยละ [A2/B2] x 100',
            'a4_label': 'ได้รับการตรวจ HbA1c อย่างน้อย 2 ครั้ง/ปี (A4)',
            'rate4_label': 'ร้อยละ [A4/B2] x 100'
        }
    }

    for yr in YEARS:
        print(f"Fetching s_dm_hba1c for Year {yr} ...")
        yr_data = fetch_year_data(yr)
        target_report['years'][yr] = yr_data
        print(f"  Year {yr}: District B1={yr_data['district']['b1']}, A1={yr_data['district']['a1']} ({yr_data['district']['rate1']}%) | B2={yr_data['district']['b2']}, A2={yr_data['district']['a2']} ({yr_data['district']['rate2']}%)")

    # Save enriched master json
    with open(ncd_path, 'w', encoding='utf-8') as f:
        json.dump(master, f, ensure_ascii=False, indent=2)

    print(f"\nSuccessfully updated {ncd_path}!")

if __name__ == '__main__':
    main()

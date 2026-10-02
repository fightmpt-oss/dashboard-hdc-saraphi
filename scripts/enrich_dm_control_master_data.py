# -*- coding: utf-8 -*-
import urllib.request
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone
sys.stdout.reconfigure(encoding='utf-8')

URL = 'https://opendata.moph.go.th/api/report_data'
YEARS = ['2569', '2568', '2567']

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from saraphi_config import SARAPHI_UNITS, fetch_opendata_rows

SARAPHI_MAP = {hc: {'name': u['name'], 'subdistrict': u['subdistrict']} for hc, u in SARAPHI_UNITS.items()}

def _write_raw_snapshot(table, year, rows):
    """Persist fetched rows to data/s_<table>_<year>.json so that
    build_saraphi_master.py aggregates the SAME snapshot as this view."""
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
    out = os.path.join(data_dir, f'{table}_{year}.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False)
    print(f'  wrote raw snapshot {out} ({len(rows)} rows)')


def fetch_year_data(year):
    saraphi = fetch_opendata_rows('s_dm_control', year)
    _write_raw_snapshot('s_dm_control', year, saraphi)

    units = defaultdict(lambda: {
        'b1': 0, 'hba1c1': 0, 'a1': 0, 't_com1': 0, 'h_com1': 0, 'r_com1': 0,
        'b2': 0, 'hba1c2': 0, 'a2': 0, 't_com2': 0, 'h_com2': 0, 'r_com2': 0,
    })
    dist = {
        'b1': 0, 'hba1c1': 0, 'a1': 0, 't_com1': 0, 'h_com1': 0, 'r_com1': 0,
        'b2': 0, 'hba1c2': 0, 'a2': 0, 't_com2': 0, 'h_com2': 0, 'r_com2': 0,
    }

    for r in saraphi:
        h = r.get('hospcode')
        # เขตรั้งสโคปให้ตรงกับ dashboard หลัก: 14 หน่วยบริการเท่านั้น
        if not h or h == '11999' or h not in SARAPHI_MAP: continue
        b1 = int(r.get('target') or 0)
        hba1c1 = int(r.get('hba1c') or 0)
        a1 = int(r.get('result') or 0)
        t_com1 = int(r.get('target_com') or 0)
        h_com1 = int(r.get('hba1c_com') or 0)
        r_com1 = int(r.get('result_com') or 0)

        b2 = int(r.get('target1') or 0) if r.get('target1') is not None else 0
        hba1c2 = int(r.get('hba1c1') or 0) if r.get('hba1c1') is not None else 0
        a2 = int(r.get('result1') or 0) if r.get('result1') is not None else 0
        t_com2 = int(r.get('target_com1') or 0) if r.get('target_com1') is not None else 0
        h_com2 = int(r.get('hba1c_com1') or 0) if r.get('hba1c_com1') is not None else 0
        r_com2 = int(r.get('result_com1') or 0) if r.get('result_com1') is not None else 0

        units[h]['b1'] += b1
        units[h]['hba1c1'] += hba1c1
        units[h]['a1'] += a1
        units[h]['t_com1'] += t_com1
        units[h]['h_com1'] += h_com1
        units[h]['r_com1'] += r_com1

        units[h]['b2'] += b2
        units[h]['hba1c2'] += hba1c2
        units[h]['a2'] += a2
        units[h]['t_com2'] += t_com2
        units[h]['h_com2'] += h_com2
        units[h]['r_com2'] += r_com2

        dist['b1'] += b1
        dist['hba1c1'] += hba1c1
        dist['a1'] += a1
        dist['t_com1'] += t_com1
        dist['h_com1'] += h_com1
        dist['r_com1'] += r_com1

        dist['b2'] += b2
        dist['hba1c2'] += hba1c2
        dist['a2'] += a2
        dist['t_com2'] += t_com2
        dist['h_com2'] += h_com2
        dist['r_com2'] += r_com2

    units_data = {}
    for h, info in SARAPHI_MAP.items():
        u = units[h]
        d1 = max(0, u['b1'] - u['t_com1'])
        h1 = max(0, u['hba1c1'] - u['h_com1'])
        c1 = max(0, u['a1'] - u['r_com1'])
        rate1 = round(u['a1'] * 100.0 / u['b1'], 2) if u['b1'] > 0 else 0.0
        rate_hba1c1 = round(u['hba1c1'] * 100.0 / u['b1'], 2) if u['b1'] > 0 else 0.0
        rate_c1 = round(c1 * 100.0 / d1, 2) if d1 > 0 else 0.0

        d2 = max(0, u['b2'] - u['t_com2'])
        h2 = max(0, u['hba1c2'] - u['h_com2'])
        c2 = max(0, u['a2'] - u['r_com2'])
        rate2 = round(u['a2'] * 100.0 / u['b2'], 2) if u['b2'] > 0 else 0.0
        rate_hba1c2 = round(u['hba1c2'] * 100.0 / u['b2'], 2) if u['b2'] > 0 else 0.0
        rate_c2 = round(c2 * 100.0 / d2, 2) if d2 > 0 else 0.0

        units_data[h] = {
            'hospcode': h,
            'name': info['name'],
            'subdistrict': info['subdistrict'],
            # Standard NCD dashboard interface
            'target': u['b1'],
            'result': u['a1'],
            'rate': rate1,
            'target_fu': u['b2'],
            'result_fu': u['a2'],
            'rate_fu': rate2,
            # Detailed HDC s_dm_control fields
            'b1': u['b1'],
            'hba1c1': u['hba1c1'],
            'rate_hba1c1': rate_hba1c1,
            'a1': u['a1'],
            'rate1': rate1,
            'd1': d1,
            'hba1c_no_com1': h1,
            'c1': c1,
            'rate_c1': rate_c1,
            'b2': u['b2'],
            'hba1c2': u['hba1c2'],
            'rate_hba1c2': rate_hba1c2,
            'a2': u['a2'],
            'rate2': rate2,
            'd2': d2,
            'hba1c_no_com2': h2,
            'c2': c2,
            'rate_c2': rate_c2
        }

    # District total
    d_d1 = max(0, dist['b1'] - dist['t_com1'])
    d_h1 = max(0, dist['hba1c1'] - dist['h_com1'])
    d_c1 = max(0, dist['a1'] - dist['r_com1'])
    d_rate1 = round(dist['a1'] * 100.0 / dist['b1'], 2) if dist['b1'] > 0 else 0.0
    d_rate_hba1c1 = round(dist['hba1c1'] * 100.0 / dist['b1'], 2) if dist['b1'] > 0 else 0.0
    d_rate_c1 = round(d_c1 * 100.0 / d_d1, 2) if d_d1 > 0 else 0.0

    d_d2 = max(0, dist['b2'] - dist['t_com2'])
    d_h2 = max(0, dist['hba1c2'] - dist['h_com2'])
    d_c2 = max(0, dist['a2'] - dist['r_com2'])
    d_rate2 = round(dist['a2'] * 100.0 / dist['b2'], 2) if dist['b2'] > 0 else 0.0
    d_rate_hba1c2 = round(dist['hba1c2'] * 100.0 / dist['b2'], 2) if dist['b2'] > 0 else 0.0
    d_rate_c2 = round(d_c2 * 100.0 / d_d2, 2) if d_d2 > 0 else 0.0

    district_data = {
        'target': dist['b1'],
        'result': dist['a1'],
        'rate': d_rate1,
        'target_fu': dist['b2'],
        'result_fu': dist['a2'],
        'rate_fu': d_rate2,
        'has_fu': True,
        # Detailed HDC s_dm_control fields
        'b1': dist['b1'],
        'hba1c1': dist['hba1c1'],
        'rate_hba1c1': d_rate_hba1c1,
        'a1': dist['a1'],
        'rate1': d_rate1,
        'd1': d_d1,
        'hba1c_no_com1': d_h1,
        'c1': d_c1,
        'rate_c1': d_rate_c1,
        'b2': dist['b2'],
        'hba1c2': dist['hba1c2'],
        'rate_hba1c2': d_rate_hba1c2,
        'a2': dist['a2'],
        'rate2': d_rate2,
        'd2': d_d2,
        'hba1c_no_com2': d_h2,
        'c2': d_c2,
        'rate_c2': d_rate_c2
    }

    return {
        'units': units_data,
        'district': district_data
    }

def main():
    print("Fetching s_dm_control for 3 years (2569, 2568, 2567)...")
    years_data = {}
    for yr in YEARS:
        print(f"  Fetching FY {yr}...")
        years_data[yr] = fetch_year_data(yr)

    # 1. Update data/ncd_service_plan_catalog.json
    cat_path = 'data/ncd_service_plan_catalog.json'
    with open(cat_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    cat_entry = {
        'id': 636,
        'report_id': 143,
        'report_name': 'ร้อยละผู้ป่วยโรคเบาหวานที่ควบคุมระดับน้ำตาลได้ดี',
        'cat_id': 'b2b59e64c4e6c92d4b1ec16a599d882b',
        'source_table': 's_dm_control',
        'main_report_id': '02e752187c7282ebc9315123aa1cabbe',
        'category_name': 'เบาหวาน (DM)',
        'main_report_name': 'ข้อมูลตอบสนอง Service Plan',
        'opendata_id': '137a726340e4dfde7bbbc5d8aeee3ac3',
        'view_count': 640,
        'last_synced_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        'created_at': '2026-05-22T09:10:07.000Z',
        'updated_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        'cat_name': 'ข้อมูลตอบสนอง Service Plan สาขาโรคไม่ติดต่อ (NCD DM,HT,CVD)'
    }
    existing_cat = [c for c in catalog if c.get('source_table') == 's_dm_control']
    if not existing_cat:
        catalog.append(cat_entry)
        with open(cat_path, 'w', encoding='utf-8') as f:
            json.dump(catalog, f, ensure_ascii=False, indent=2)
        print(f"Added s_dm_control to {cat_path} (total: {len(catalog)})")

    # 2. Update data/ncd_service_plan_master.json
    master_path = 'data/ncd_service_plan_master.json'
    with open(master_path, 'r', encoding='utf-8') as f:
        master = json.load(f)

    report_obj = {
        'id': 'ncd_dm_control',
        'report_id': 143,
        'table_name': 's_dm_control',
        'name': 'ร้อยละผู้ป่วยโรคเบาหวานที่ควบคุมระดับน้ำตาลได้ดี',
        'category': 'เบาหวาน (DM)',
        'opendata_id': '137a726340e4dfde7bbbc5d8aeee3ac3',
        'hdc_url': 'https://hdc.moph.go.th/cmi/public/standard-report-detail/137a726340e4dfde7bbbc5d8aeee3ac3',
        'opendata_url': 'https://opendata.moph.go.th/api/report_data',
        'has_fu': True,
        'is_dm_control': True,
        'kpi_target': 40.0,
        'years': years_data
    }

    # Check if report already exists in master.reports
    reports = master.get('reports', [])
    found_idx = -1
    for i, r in enumerate(reports):
        if r.get('id') == 'ncd_dm_control' or r.get('table_name') == 's_dm_control':
            found_idx = i
            break

    if found_idx >= 0:
        reports[found_idx] = report_obj
        print(f"Updated existing ncd_dm_control at index {found_idx}")
    else:
        # Insert after ncd_55 (s_dm_hba1c)
        hba1c_idx = -1
        for i, r in enumerate(reports):
            if r.get('table_name') == 's_dm_hba1c':
                hba1c_idx = i
                break
        if hba1c_idx >= 0:
            reports.insert(hba1c_idx + 1, report_obj)
            print(f"Inserted ncd_dm_control right after s_dm_hba1c at index {hba1c_idx + 1}")
        else:
            reports.append(report_obj)
            print(f"Appended ncd_dm_control to reports")

    master['reports'] = reports
    master['total_reports'] = len(reports)
    master['last_updated'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    with open(master_path, 'w', encoding='utf-8') as f:
        json.dump(master, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved {master_path} with {len(reports)} reports!")

    # หมายเหตุ: ไม่แตะ data/saraphi_complete_master.json (pcc_dm_control) —
    # build_saraphi_master.py เป็นผู้สร้างฝ่ายเดียว (dual-group Typearea/ChronicFU)

if __name__ == '__main__':
    main()

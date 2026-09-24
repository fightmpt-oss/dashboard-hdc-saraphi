# -*- coding: utf-8 -*-
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Load Master Data
with open('data/ncd_service_plan_master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# List of zero/empty/duplicate reports to DELETE
delete_ids = {
    'ncd_01', 'ncd_03', 'ncd_11', 'ncd_15', 'ncd_16', 'ncd_17', 'ncd_18', 'ncd_19',
    'ncd_24', 'ncd_26', 'ncd_27', 'ncd_28', 'ncd_30', 'ncd_32', 'ncd_38', 'ncd_40',
    'ncd_49', 'ncd_50', 'ncd_51', 'ncd_52', 'ncd_56', 'ncd_57', 'ncd_58', 'ncd_59',
    'ncd_60', 'ncd_61', 'ncd_62', 'ncd_63', 'ncd_64', 'ncd_65', 'ncd_66', 'ncd_67',
    'ncd_68', 'ncd_69', 'ncd_70', 'ncd_71', 'ncd_72'
}

remaining_reports = []
for r in master['reports']:
    if r['id'] in delete_ids:
        continue

    # Normalize category
    cat_str = str(r.get('category', '')).upper()
    if 'DM' in cat_str or 'เบาหวาน' in cat_str:
        r['category'] = 'DM'
    elif 'HT' in cat_str or 'ความดัน' in cat_str:
        r['category'] = 'HT'
    elif 'CVD' in cat_str or 'หัวใจ' in cat_str:
        r['category'] = 'CVD'
    elif 'CKD' in cat_str or 'ไต' in cat_str:
        r['category'] = 'CKD'

    remaining_reports.append(r)

master['reports'] = remaining_reports
master['total_reports'] = len(remaining_reports)

# Count by category
dm_count = sum(1 for r in remaining_reports if r['category'] == 'DM')
ht_count = sum(1 for r in remaining_reports if r['category'] == 'HT')
cvd_count = sum(1 for r in remaining_reports if r['category'] == 'CVD')
ckd_count = sum(1 for r in remaining_reports if r['category'] == 'CKD')

master['categories'] = {
    'ALL': f'ทั้งหมด ({len(remaining_reports)} รายงาน)',
    'DM': f'โรคเบาหวาน ({dm_count} รายงาน)',
    'HT': f'ความดันโลหิตสูง ({ht_count} รายงาน)',
    'CVD': f'หลอดเลือดหัวใจ ({cvd_count} รายงาน)',
    'CKD': f'โรคไตเรื้อรัง ({ckd_count} รายงาน)'
}

# Save updated master
with open('data/ncd_service_plan_master.json', 'w', encoding='utf-8') as f:
    json.dump(master, f, ensure_ascii=False, indent=2)

print(f"Updated data/ncd_service_plan_master.json:")
print(f"  Total Active Reports: {len(remaining_reports)}")
print(f"  DM: {dm_count}")
print(f"  HT: {ht_count}")
print(f"  CVD: {cvd_count}")
print(f"  CKD: {ckd_count}")

# 2. Update Catalog
with open('data/ncd_service_plan_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

active_tables = set(r['table_name'] for r in remaining_reports)

seen_tables = set()
updated_catalog = []
for item in catalog:
    t = item.get('source_table')
    if t in active_tables and t not in seen_tables:
        seen_tables.add(t)
        updated_catalog.append(item)

# Also ensure s_ht_control and s_dm_control are in catalog
for r in remaining_reports:
    t = r['table_name']
    if t not in seen_tables:
        seen_tables.add(t)
        updated_catalog.append({
            'source_table': t,
            'report_name': r['name'],
            'category_name': f"ข้อมูลเพื่อตอบสนอง Service Plan ({r['category']})",
            'opendata_id': r.get('opendata_id', '')
        })

with open('data/ncd_service_plan_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(updated_catalog, f, ensure_ascii=False, indent=2)

print(f"\nUpdated data/ncd_service_plan_catalog.json:")
print(f"  Total Catalog Items: {len(updated_catalog)}")

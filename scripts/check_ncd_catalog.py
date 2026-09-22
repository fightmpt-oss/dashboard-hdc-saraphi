import json

with open('data/moph_catalog.json', encoding='utf-8') as f:
    cat = json.load(f)

print('Total items in catalog:', len(cat))

b2b_reports = [r for r in cat if r.get('cat_id') == 'b2b59e64c4e6c92d4b1ec16a599d882b']
print('Reports with cat_id b2b59e64c4e6c92d4b1ec16a599d882b:', len(b2b_reports))

if b2b_reports:
    print("\nFirst 15 reports:")
    for idx, r in enumerate(b2b_reports[:15], 1):
        print(f"{idx:<2}. table: {r.get('source_table'):<25} | opendata_id: {r.get('opendata_id'):<34} | name: {r.get('report_name')}")
else:
    # search by keyword in report_name or category_name
    kw_reports = [r for r in cat if 'เบาหวาน' in (r.get('report_name') or '') or 'ความดัน' in (r.get('report_name') or '') or 's_dm' in (r.get('source_table') or '')]
    print(f"Reports matching DM/HT keywords: {len(kw_reports)}")
    for idx, r in enumerate(kw_reports[:15], 1):
        print(f"{idx:<2}. cat_id: {r.get('cat_id')} | table: {r.get('source_table')} | name: {r.get('report_name')}")

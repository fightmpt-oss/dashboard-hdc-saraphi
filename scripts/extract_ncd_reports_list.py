import json

with open('data/moph_catalog.json', encoding='utf-8') as f:
    cat = json.load(f)

# Find all reports with cat_id = b2b59e64c4e6c92d4b1ec16a599d882b
ncd_reports = [r for r in cat if r.get('cat_id') == 'b2b59e64c4e6c92d4b1ec16a599d882b']

print(f"Total NCD Service Plan reports found: {len(ncd_reports)}")

# Save to a dedicated file
with open('data/ncd_service_plan_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(ncd_reports, f, ensure_ascii=False, indent=2)

print("Saved to data/ncd_service_plan_catalog.json")

# Let's inspect fields in these reports
tables = [r.get('source_table') for r in ncd_reports]
print("Unique tables count:", len(set(tables)))
print("None or empty tables:", sum(1 for t in tables if not t))

# Print first 20 tables and report names
for idx, r in enumerate(ncd_reports[:20], 1):
    print(f"{idx:2d}. [{r.get('source_table')}] {r.get('report_name')}")

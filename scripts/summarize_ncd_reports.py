import json

with open('data/ncd_service_plan_catalog.json', encoding='utf-8') as f:
    reports = json.load(f)

print(f"Total reports: {len(reports)}")

lines = ["# NCD Service Plan Reports (70 Reports)\n"]
lines.append("| # | Report ID | Source Table | Report Name | HDC Report Link | OpenData ID |")
lines.append("|---|---|---|---|---|---|")

for idx, r in enumerate(reports, 1):
    rid = r.get('report_id')
    tbl = r.get('source_table')
    name = r.get('report_name')
    od_id = r.get('opendata_id')
    hdc_link = f"https://hdc.moph.go.th/cmi/public/standard-report-detail/{od_id}" if od_id else "-"
    lines.append(f"| {idx} | {rid} | `{tbl}` | {name} | [{od_id[:8]}...]({hdc_link}) | `{od_id}` |")

with open('data/ncd_reports_summary.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("Saved report summary to data/ncd_reports_summary.md")

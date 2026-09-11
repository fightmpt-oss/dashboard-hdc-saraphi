import json

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\all_moph_reports_catalog.json", "r", encoding="utf-8") as f:
    reports = json.load(f)

for r in reports:
    name = r.get("report_name", "")
    src = r.get("source_table", "")
    if "พัฒนาการ" in name and any(k in name for k in ["0-5", "เด็ก", "สมวัย", "dspm"]):
        print(f"[{src}] {name}")

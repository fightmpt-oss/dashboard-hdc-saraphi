import json

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\all_moph_reports_catalog.json", "r", encoding="utf-8") as f:
    reports = json.load(f)

ncd_reports = [r for r in reports if "โรคไม่ติดต่อ" in (r.get("cat_name") or "")]
print(f"Total NCD reports: {len(ncd_reports)}")
for r in ncd_reports:
    name = r.get("report_name", "")
    src = r.get("source_table", "")
    if any(k in name for k in ["ควบคุม", "hba1c", "ความดัน", "เบาหวาน", "แทรกซ้อน", "admit", "เสี่ยง"]):
        print(f"  [{src}] {name}")

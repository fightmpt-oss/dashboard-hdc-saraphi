import json

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\meta_data.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

print("=== MAIN REPORTS (หมวดหมู่หลัก) ===")
for mr in meta.get("main_reports", []):
    print(f"ID: {mr.get('main_report_id') or mr.get('id')} -> {mr.get('main_report_name') or mr.get('name')}")

print("\n=== CATEGORIES (หมวดหมู่ย่อย) ===")
for c in meta.get("categories", []):
    print(f"ID: {c.get('cat_id') or c.get('id')} | MainID: {c.get('main_report_id')} -> {c.get('category_name') or c.get('name')}")

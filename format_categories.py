import json, sys

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\meta_data.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\categories_utf8.txt", "w", encoding="utf-8") as out:
    out.write("=== หมวดหมู่หลัก (Main Reports) ===\n")
    for mr in meta.get("main_reports", []):
        mid = mr.get("main_report_id") or mr.get("id")
        mname = mr.get("main_report_name") or mr.get("name")
        out.write(f"[{mid}] {mname}\n")
        
    out.write("\n=== หมวดหมู่ย่อย (Categories) ===\n")
    for c in meta.get("categories", []):
        cid = c.get("cat_id") or c.get("id")
        cname = c.get("category_name") or c.get("name")
        out.write(f"[{cid}] {cname}\n")

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\categories_utf8.txt", "r", encoding="utf-8") as f:
    print(f.read()[:2000])

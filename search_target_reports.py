import json

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\all_moph_reports_catalog.json", "r", encoding="utf-8") as f:
    reports = json.load(f)

print(f"Loaded {len(reports)} reports from catalog.")

keywords = {
    "PCC - DM HbA1c": ["hba1c", "a1c"],
    "PCC - DM Control": ["เบาหวาน", "ควบคุมได้"],
    "PCC - HT Control": ["ความดัน", "ควบคุมได้"],
    "PCC - Admit Complications": ["admit", "แทรกซ้อน", "complication"],
    "PPB - Child Development (0-5)": ["พัฒนาการ", "0-5"],
    "PPB - Weight Height (6-12)": ["ชั่งน้ำหนัก", "ส่วนสูง", "6-12", "โภชนาการ"],
    "PPB - Fluoride (4-12)": ["ฟลูออไรด์", "เคลือบฟลูออไรด์"],
    "PPB - Sealant (6-12)": ["เคลือบหลุมร่องฟัน", "หลุมร่องฟัน"],
    "PPB - Depression 60+": ["ซึมเศร้า", "60 ปี", "2q", "9q"],
    "ANC - Maternal Child": ["ฝากครรภ์", "anc", "12 สัปดาห์", "5 ครั้ง"],
    "Elderly - ผู้สูงอายุ": ["ผู้สูงอายุ", "adl", "ติดเตียง", "ติดบ้าน"],
    "TTM - นวด อบ ประคบ": ["นวด", "อบ", "ประคบ", "พอกเข่า"]
}

found = {}
for key, terms in keywords.items():
    found[key] = []
    for r in reports:
        name = (r.get('report_name') or '').lower()
        src = (r.get('source_table') or '').lower()
        cat = (r.get('cat_name') or '').lower()
        match = any(t.lower() in name or t.lower() in src or t.lower() in cat for t in terms)
        if match:
            found[key].append({
                'source_table': r.get('source_table'),
                'report_name': r.get('report_name'),
                'cat_name': r.get('cat_name')
            })

for k, v in found.items():
    print(f"\n=== {k} ({len(v)} matches) ===")
    for item in v[:5]:
        print(f"  [{item['source_table']}] {item['report_name']}")

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\matched_indicators.json", "w", encoding="utf-8") as f:
    json.dump(found, f, ensure_ascii=False, indent=2)

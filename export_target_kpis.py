import json

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\all_moph_reports_catalog.json", "r", encoding="utf-8") as f:
    reports = json.load(f)

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\target_kpi_findings.txt", "w", encoding="utf-8") as out:
    out.write("=== TARGET KPI IN OPEN DATA MOPH ===\n\n")
    
    # 1. PCC 4 Indicators
    out.write("--- 1. งบ PCC (4 ตัวชี้วัด) ---\n")
    pcc_tables = ['s_dm_hba1c', 's_dm_control', 's_ht_control', 's_ncd_bp', 's_dm_complication', 's_dmht_admit']
    for r in reports:
        src = r.get('source_table') or ''
        name = r.get('report_name') or ''
        if any(src.startswith(p) for p in ['s_dm_', 's_ht_', 's_ncd_']) and any(w in name for w in ['HbA1c', 'ควบคุม', 'แทรกซ้อน', 'admit', 'BP']):
            out.write(f"  [{src}] {name} (ID: {r.get('opendata_id')})\n")
            
    # 2. PPB 5 Indicators
    out.write("\n--- 2. งบ PPB (5 ตัวชี้วัดตามภาพ) ---\n")
    out.write("1) พัฒนาการเด็ก 0-5 ปี\n")
    out.write("2) ชั่งน้ำหนัก-ส่วนสูง 6-12 ปี\n")
    out.write("3) เคลือบฟลูออไรด์ 4-12 ปี\n")
    out.write("4) เคลือบหลุมร่องฟัน 6-12 ปี\n")
    out.write("5) คัดกรองซึมเศร้า 60 ปีขึ้นไป\n")
    for r in reports:
        src = r.get('source_table') or ''
        name = r.get('report_name') or ''
        if any(w in name for w in ['พัฒนาการ', 'ชั่งน้ำหนัก', 'ส่วนสูง', 'ฟลูออไรด์', 'หลุมร่องฟัน', 'ซึมเศร้า']):
            out.write(f"  [{src}] {name}\n")
            
    # 3. ผู้สูงอายุ
    out.write("\n--- 3. ผู้สูงอายุ (Elderly) ---\n")
    for r in reports:
        src = r.get('source_table') or ''
        name = r.get('report_name') or ''
        if 'สูงอายุ' in name or 'ADL' in name or src.startswith('s_aged'):
            out.write(f"  [{src}] {name}\n")

    # 4. อนามัยแม่และเด็ก
    out.write("\n--- 4. อนามัยแม่และเด็ก (MCH) ---\n")
    for r in reports:
        src = r.get('source_table') or ''
        name = r.get('report_name') or ''
        if any(w in name for w in ['ฝากครรภ์', 'ANC', 'คลอด', 'มารดา', 'ทารก', 'นมแม่']):
            out.write(f"  [{src}] {name}\n")

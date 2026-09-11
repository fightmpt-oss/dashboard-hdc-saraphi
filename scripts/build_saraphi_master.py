import json
import os

data_dir = r"d:\PROJECTS\Dashboard HDC Saraphi\data"
out_file = os.path.join(data_dir, "saraphi_complete_master.json")

SARAPHI_UNITS = {
    '06014': {'name': 'รพ.สต.บ้านยางเนิ้ง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านยางเนิ้ง', 'subdistrict': 'ยางเนิ้ง', 'type': 'รพ.สต.'},
    '06015': {'name': 'รพ.สต.บ้านพญาชมภู', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านพญาชมภู', 'subdistrict': 'ชมภู', 'type': 'รพ.สต.'},
    '06016': {'name': 'รพ.สต.บ้านศรีสองเมือง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านศรีสองเมือง', 'subdistrict': 'ไชยสถาน', 'type': 'รพ.สต.'},
    '06017': {'name': 'รพ.สต.บ้านหัวดง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหัวดง', 'subdistrict': 'ขัวมุง', 'type': 'รพ.สต.'},
    '06018': {'name': 'รพ.สต.บ้านหนองแฝก', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองแฝก', 'subdistrict': 'หนองแฝก', 'type': 'รพ.สต.'},
    '06020': {'name': 'รพ.สต.บ้านแคว (ท่ากว้าง)', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านแคว ตำบลท่ากว้าง', 'subdistrict': 'ท่ากว้าง', 'type': 'รพ.สต.'},
    '06021': {'name': 'รพ.สต.บ้านสันต้นกอก', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านสันต้นกอก', 'subdistrict': 'ดอนแก้ว', 'type': 'รพ.สต.'},
    '06022': {'name': 'รพ.สต.บ้านบวกครกเหนือ', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านบวกครกเหนือ', 'subdistrict': 'ท่าวังตาล', 'type': 'รพ.สต.'},
    '06023': {'name': 'รพ.สต.บ้านป่าเส้า', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านป่าเส้า', 'subdistrict': 'สันทราย', 'type': 'รพ.สต.'},
    '06024': {'name': 'รพ.สต.บ้านศรีคำชมภู', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านศรีคำชมภู', 'subdistrict': 'ป่าบง', 'type': 'รพ.สต.'},
    '11135': {'name': 'โรงพยาบาลสารภี', 'full_name': 'โรงพยาบาลสารภี (แม่ข่าย)', 'subdistrict': 'สารภี', 'type': 'รพช.'},
    '13994': {'name': 'รพ.สต.บ้านท่าต้นกวาว', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านท่าต้นกวาว', 'subdistrict': 'ชมภู', 'type': 'รพ.สต.'},
    '14461': {'name': 'รพ.สต.บ้านหนองผึ้ง', 'full_name': 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองผึ้ง', 'subdistrict': 'หนองผึ้ง', 'type': 'รพ.สต.'},
    '99758': {'name': 'ศสม.สารภี', 'full_name': 'ศูนย์สุขภาพชุมชนตำบลสารภี', 'subdistrict': 'สารภี', 'type': 'ศสม.'}
}

HERB_NAMES = {
    "410000000479150020182750": "ฟ้าทะลายโจรแคปซูล 500 mg",
    "410000000100000020110665": "ขมิ้นชันแคปซูล 500 mg",
    "410000000109150020182737": "ขมิ้นชันแคปซูล",
    "410000000109150020182742": "ขมิ้นชันแคปซูล 500 mg",
    "410000000190000094510665": "ยาชงรางจืด",
    "410000000239140020182758": "เถาวัลย์เปรียงแคปซูล",
    "410000000239150020182750": "เถาวัลย์เปรียงแคปซูล 500 mg",
    "410000000380000041911197": "ยาน้ำพญายอ 60 ml",
    "410000000389300550282750": "ครีมพญายอ 5 g",
    "410000000389401050382758": "ครีมพญายอ 10 g",
    "410000000459601440182737": "ไพลครีม 30 g",
    "410000000479135020182737": "ฟ้าทะลายโจรแคปซูล",
    "410000000499140020182750": "มะขามแขกแคปซูล 400 mg",
    "410000000499145020182737": "มะขามแขกแคปซูล 450 mg",
    "410000000619201034111135": "ชาชงหญ้าดอกขาว",
    "410000000649200234110671": "ชาชงหญ้าหนวดแมว",
    "410000000649200234182758": "ชาชงหญ้าหนวดแมว",
    "420000011779404094782758": "ยาน้ำแก้ไอผสมมะขามป้อม 120 ml",
    "420000001559402594781053": "ยาน้ำมะขามป้อม",
    "420000001930000040611170": "ยาบัวบก 20g",
    "420000002169140020182758": "เพชรสังฆาตแคปซูล",
    "420000002379150020182742": "ยาธาตุบรรจบแคปซูล 500 mg",
    "420000002939500594711135": "ยาน้ำธาตุอบเชย 120 ml",
    "420000004119150020182748": "เพชรสังฆาตแคปซูล 500 mg",
    "420000003969120020382755": "ยาประสะมะแว้ง ลูกกลอน",
    "420000003969120021582750": "ยาประสะมะแว้ง",
    "420000004489220044211197": "ลูกประคบสมุนไพร 200g",
    "420000004919150020182750": "ยาตรีผลาแคปซูล 500 mg",
    "420000005179201594582742": "ยาหอมนวโกฐ 15 g",
    "420000005649138020182750": "รางจืดแคปซูล",
    "420000006979150020182750": "ดอกคำฝอยแคปซูล",
    "420000007839140020182758": "รางจืดแคปซูล",
    "420000008179140020182737": "รางจืดแคปซูล",
    "420000010169210094111135": "ยาประสะไพล",
    "420000010349500794782770": "ยาน้ำแก้ไอผสมมะขามป้อม 60 ml",
    "420000014769207894511452": "ยาต้มศุขไสยาศน์ (กัญชาแผนไทย)",
    "420000014869150020111452": "น้ำมันกัญชา 500 mg",
    "420000016869220044211135": "ลูกประคบสมุนไพรสด 200g",
    "400000000120000000400000": "ขมิ้นชันผง",
    "420000002369125020110919": "ยาธาตุบรรจบ (ยาผง/เม็ด)",
    "420000001580000094782755": "ยาแก้ไอมะขามป้อม",
    "420000004489220044211119": "ลูกประคบสมุนไพรสด",
    "410000000499130020382750": "มะขามแขกแคปซูล",
    "410000000459301440182750": "ครีมไพล",
    "420000004489220044282750": "ลูกประคบสมุนไพรแห้ง",
    "420000014759500494782770": "ยาศุขไสยาศน์ (ตำรับกัญชาแผนไทย)",
    "420000004489215044211135": "ลูกประคบสมุนไพร 150g",
    "410000000109150020182748": "ขมิ้นชันแคปซูล 500 mg",
    "420000004129150020182750": "เพชรสังฆาตแคปซูล",
    "420000001540000094711170": "ยาประสะมะแว้ง",
    "420000001550000094710665": "ยาหอมเทพจิตร",
    "420000002939500494711135": "ยาน้ำธาตุอบเชย",
    "410000000479135020182755": "ฟ้าทะลายโจรแคปซูล 350 mg",
    "420000004489220044282770": "ลูกประคบสมุนไพร",
    "410000000109150020111197": "ขมิ้นชันแคปซูล",
    "410000000389301840182758": "ครีมพญายอ",
    "420000001589502094782737": "ยาแก้ไอมะขามป้อม",
    "410000000450000040111144": "น้ำมันไพล",
    "420000002930000002311170": "ยาธาตุอบเชย"
}

def clean_num(v):
    if v is None: return 0.0
    try: return float(v)
    except: return 0.0

def load_json(name):
    path = os.path.join(data_dir, name)
    if not os.path.exists(path): return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

master = {
    "metadata": {
        "title": "ระบบสารสนเทศสุขภาพและยาสมุนไพร อำเภอสารภี จังหวัดเชียงใหม่ (HDC Saraphi Health Dashboard)",
        "district": "อำเภอสารภี",
        "province": "จังหวัดเชียงใหม่ (50)",
        "source": "Open Data by MoPH (กระทรวงสาธารณสุข)",
        "years": ["2567", "2568", "2569"],
        "units": SARAPHI_UNITS
    },
    "indicators": {}
}

years = ["2567", "2568", "2569"]

# ----------------------------------------------------
# 1. TTM Indicators (8 indicators)
# ----------------------------------------------------
# 1.1 s_ttm7
master["indicators"]["ttm_val"] = {
    "code": "TTM-1",
    "name": "ร้อยละมูลค่าการใช้ยาสมุนไพร (OPD)",
    "table": "s_ttm7",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "มูลค่าการใช้ยาสมุนไพรเทียบกับมูลค่ายาทั้งหมดของผู้ป่วยนอก",
    "target": 5.0,
    "unit": "%",
    "num_label": "มูลค่ายาสมุนไพร (บาท)",
    "den_label": "มูลค่ายาทั้งหมด (บาท)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm7_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            num = clean_num(r.get('thai') or 0.0)
            den = clean_num(r.get('total') or 0.0)
            rate = round((num / den * 100), 2) if den > 0 else 0.0
            tot_num += num; tot_den += den
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": round(num, 2), "den": round(den, 2), "rate": rate, "pass": rate >= 5.0
            })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ttm_val"]["years"][y] = {
        "num": round(tot_num, 2), "den": round(tot_den, 2), "rate": dist_rate, "pass": dist_rate >= 5.0, "units": unit_data
    }

# 1.2 s_ttm10
master["indicators"]["ttm_ed"] = {
    "code": "TTM-2",
    "name": "การจ่ายยาสมุนไพรตามบัญชียาหลักแห่งชาติ (ED)",
    "table": "s_ttm10",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "สัดส่วนการจ่ายยาสมุนไพรในบัญชียาหลักแห่งชาติ (ED Ratio)",
    "target": 80.0,
    "unit": "%",
    "num_label": "ในบัญชียาหลัก (ครั้ง)",
    "den_label": "จ่ายสมุนไพรทั้งหมด (ครั้ง)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm10_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            num = sum(int(clean_num(r.get(f'ed_vs_q{q}') or 0)) for q in range(1, 5))
            den = sum(int(clean_num(r.get(f'total_vs_q{q}') or 0)) for q in range(1, 5))
            rate = round((num / den * 100), 2) if den > 0 else 0.0
            tot_num += num; tot_den += den
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": int(num), "den": int(den), "rate": rate, "pass": rate >= 80.0
            })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ttm_ed"]["years"][y] = {
        "num": int(tot_num), "den": int(tot_den), "rate": dist_rate, "pass": dist_rate >= 80.0, "units": unit_data
    }

# 1.3 s_ttm32
master["indicators"]["ttm_rx"] = {
    "code": "TTM-3",
    "name": "สัดส่วนการสั่งใช้ยาสมุนไพรเทียบกับสั่งยาทั้งหมด (Prescription)",
    "table": "s_ttm32",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "ร้อยละของการสั่งใช้ยาสมุนไพรเทียบกับจำนวนการสั่งยาทั้งหมด",
    "target": 15.0,
    "unit": "%",
    "num_label": "สั่งใช้สมุนไพร (ครั้ง)",
    "den_label": "สั่งยาทั้งหมด (ครั้ง)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm32_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            num = int(clean_num(r.get('result') or 0))
            den = int(clean_num(r.get('target') or 0))
            rate = round((num / den * 100), 2) if den > 0 else 0.0
            tot_num += num; tot_den += den
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": int(num), "den": int(den), "rate": rate, "pass": rate >= 15.0
            })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ttm_rx"]["years"][y] = {
        "num": int(tot_num), "den": int(tot_den), "rate": dist_rate, "pass": dist_rate >= 15.0, "units": unit_data
    }

# 1.4 s_ttm34
master["indicators"]["ttm_service"] = {
    "code": "TTM-4",
    "name": "ร้อยละผู้ป่วยนอกได้รับบริการแพทย์แผนไทย (OPD Coverage)",
    "table": "s_ttm34",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "ร้อยละผู้ป่วยนอกได้รับบริการแพทย์แผนไทยและการแพทย์ทางเลือก",
    "target": 20.0,
    "unit": "%",
    "num_label": "รับบริการแผนไทย (คน)",
    "den_label": "ผู้ป่วยนอกทั้งหมด (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm34_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            num = sum(int(clean_num(r.get(f'tm_service_q{q}') or 0)) for q in range(1, 5))
            den = sum(int(clean_num(r.get(f'op_service_q{q}') or 0)) for q in range(1, 5))
            rate = round((num / den * 100), 2) if den > 0 else 0.0
            tot_num += num; tot_den += den
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": int(num), "den": int(den), "rate": rate, "pass": rate >= 20.0
            })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ttm_service"]["years"][y] = {
        "num": int(tot_num), "den": int(tot_den), "rate": dist_rate, "pass": dist_rate >= 20.0, "units": unit_data
    }

# 1.5 s_ttm2
master["indicators"]["ttm_cases"] = {
    "code": "TTM-5",
    "name": "OPD ปริมาณการจ่ายยาสมุนไพร (จำนวนครั้ง/คน)",
    "table": "s_ttm2",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "จำนวนผู้ป่วยและจำนวนครั้งที่ได้รับยาสมุนไพร",
    "target": 1.2,
    "unit": "ครั้ง/คน",
    "num_label": "ครั้งการจ่ายยาสมุนไพร",
    "den_label": "ผู้ป่วยที่ได้รับยา (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm2_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            num = sum(int(clean_num(r.get(f'result2q{q}') or 0)) for q in range(1, 5))
            den = sum(int(clean_num(r.get(f'result1q{q}') or 0)) for q in range(1, 5))
            rate = round((num / den), 2) if den > 0 else 0.0
            tot_num += num; tot_den += den
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": int(num), "den": int(den), "rate": rate, "pass": rate >= 1.2
            })
    dist_rate = round((tot_num / tot_den), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ttm_cases"]["years"][y] = {
        "num": int(tot_num), "den": int(tot_den), "rate": dist_rate, "pass": dist_rate >= 1.2, "units": unit_data
    }

# 1.6 s_common_diseases_thai_drug
master["indicators"]["ttm_common_dis"] = {
    "code": "TTM-6",
    "name": "การใช้ยาสมุนไพรในกลุ่มโรคพบบ่อย (Common Diseases)",
    "table": "s_common_diseases_thai_drug",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "ร้อยละของผู้ป่วยโรคพบบ่อยที่ได้รับยาสมุนไพร (ทางเดินหายใจ, กล้ามเนื้อ ฯลฯ)",
    "target": 20.0,
    "unit": "%",
    "num_label": "ได้รับยาสมุนไพร (คน)",
    "den_label": "ผู้ป่วยโรคพบบ่อย (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_common_diseases_thai_drug_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            num = int(clean_num(r.get('times_year') or 0))
            den = int(clean_num(r.get('times_year_diag') or 0))
            rate = round((num / den * 100), 2) if den > 0 else 0.0
            tot_num += num; tot_den += den
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": int(num), "den": int(den), "rate": rate, "pass": rate >= 20.0
            })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ttm_common_dis"]["years"][y] = {
        "num": int(tot_num), "den": int(tot_den), "rate": dist_rate, "pass": dist_rate >= 20.0, "units": unit_data
    }

# 1.7 s_ttm3
master["indicators"]["ttm_age_sex"] = {
    "code": "TTM-7",
    "name": "การจ่ายยาสมุนไพรตามอายุและเพศ",
    "table": "s_ttm3",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "สัดส่วนการจ่ายยาสมุนไพรจำแนกตามช่วงอายุและเพศเทียบกับการรับบริการแผนไทย (HDC 1.3)",
    "target": 50.0,
    "unit": "%",
    "num_label": "ครั้งจ่ายยาสมุนไพร",
    "den_label": "ครั้งรับบริการแผนไทย",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm3_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            num = sum(int(clean_num(r.get(f'vs_s1q{q}') or 0)) for q in range(1, 5))
            den = sum(int(clean_num(r.get(f'vs_s2q{q}') or 0)) for q in range(1, 5))
            rate = round((num / den * 100), 2) if den > 0 else 0.0
            tot_num += num; tot_den += den
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": int(num), "den": int(den), "rate": rate, "pass": rate >= 50.0
            })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ttm_age_sex"]["years"][y] = {
        "num": int(tot_num), "den": int(tot_den), "rate": dist_rate, "pass": dist_rate >= 50.0, "units": unit_data
    }

# 1.8 s_ttm8
master["indicators"]["ttm_massage"] = {
    "code": "TTM-8",
    "name": "บริการหัตถการแพทย์แผนไทย นวด อบ ประคบ (ครั้ง)",
    "table": "s_ttm8",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "จำนวนครั้งการให้บริการหัตถการแพทย์แผนไทย นวด อบ ประคบ พอกเข่า",
    "target": 100,
    "unit": "ครั้ง",
    "num_label": "นวด อบ ประคบ รวม",
    "den_label": "ผู้รับบริการหัตถการ",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm8_{y}.json")
    unit_data = []
    tot_num = 0.0; tot_den = 0.0
    for r in rows:
        hcode = r.get('hospcode')
        if hcode in SARAPHI_UNITS:
            nod = clean_num(r.get('nod_in_all_q1', 0)) + clean_num(r.get('nod_in_all_q2', 0)) + clean_num(r.get('nod_in_all_q3', 0)) + clean_num(r.get('nod_in_all_q4', 0))
            obb = clean_num(r.get('obb_in_all_q1', 0)) + clean_num(r.get('obb_in_all_q2', 0)) + clean_num(r.get('obb_in_all_q3', 0)) + clean_num(r.get('obb_in_all_q4', 0))
            cop = clean_num(r.get('cop_in_all_q1', 0)) + clean_num(r.get('cop_in_all_q2', 0)) + clean_num(r.get('cop_in_all_q3', 0)) + clean_num(r.get('cop_in_all_q4', 0))
            total_hat = nod + obb + cop
            vs = clean_num(r.get('vs_in_all_q1', 0)) + clean_num(r.get('vs_in_all_q2', 0)) + clean_num(r.get('vs_in_all_q3', 0)) + clean_num(r.get('vs_in_all_q4', 0))
            tot_num += total_hat; tot_den += vs
            unit_data.append({
                "hospcode": hcode,
                "name": SARAPHI_UNITS[hcode]["name"],
                "subdistrict": SARAPHI_UNITS[hcode]["subdistrict"],
                "num": int(total_hat), "den": int(vs), "nod": int(nod), "obb": int(obb), "cop": int(cop),
                "rate": int(total_hat), "pass": total_hat > 0
            })
    unit_data.sort(key=lambda x: x['num'], reverse=True)
    master["indicators"]["ttm_massage"]["years"][y] = {
        "num": int(tot_num), "den": int(tot_den), "rate": int(tot_num), "pass": True, "units": unit_data
    }

# 1.9 s_ttm4 (Top Herbs)
master["indicators"]["ttm_top_herbs"] = {
    "code": "TTM-9",
    "name": "OPD-อันดับการใช้ยาสมุนไพรและมูลค่ายา (DIDSTD)",
    "table": "s_ttm4",
    "domain": "ttm",
    "domain_label": "🌿 แพทย์แผนไทย & ยาสมุนไพร",
    "desc": "อันดับและการกระจายการใช้ยาสมุนไพรรายรายการยา 24 หลัก จำนวนครั้ง และมูลค่าเงินบาท",
    "target": 0,
    "unit": "บาท",
    "num_label": "มูลค่าการใช้ยา (บาท)",
    "den_label": "จำนวนครั้งที่สั่งจ่าย",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ttm4_{y}.json")
    drug_stats = {}
    tot_val = 0.0; tot_visits = 0; tot_amount = 0
    unit_totals = {hc: {"num": 0.0, "den": 0, "drugs": {}} for hc in SARAPHI_UNITS}
    for r in rows:
        did = str(r.get('didstd', '')).strip()
        hcode = r.get('hospcode')
        if not did: continue
        val = clean_num(r.get('pri_all') or r.get('pri_uc'))
        vs = int(clean_num(r.get('vs_all') or r.get('vs_uc')))
        am = int(clean_num(r.get('am_all') or r.get('am_uc')))
        tot_val += val; tot_visits += vs; tot_amount += am
        dname = HERB_NAMES.get(did, f"รหัสยา {did[:12]}...")
        if did not in drug_stats:
            drug_stats[did] = {"didstd": did, "name": dname, "val": 0.0, "visits": 0, "amount": 0}
        drug_stats[did]["val"] += val
        drug_stats[did]["visits"] += vs
        drug_stats[did]["amount"] += am
        if hcode in unit_totals:
            unit_totals[hcode]["num"] += val
            unit_totals[hcode]["den"] += vs
            if did not in unit_totals[hcode]["drugs"]:
                unit_totals[hcode]["drugs"][did] = {"name": dname, "val": 0.0, "visits": 0}
            unit_totals[hcode]["drugs"][did]["val"] += val
            unit_totals[hcode]["drugs"][did]["visits"] += vs
    sorted_drugs = sorted(drug_stats.values(), key=lambda x: x['val'], reverse=True)
    unit_data = []
    for hc, udata in unit_totals.items():
        top_u_drugs = sorted(udata["drugs"].values(), key=lambda x: x['val'], reverse=True)[:5]
        unit_data.append({
            "hospcode": hc,
            "name": SARAPHI_UNITS[hc]["name"],
            "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": round(udata["num"], 2),
            "den": udata["den"],
            "rate": round(udata["num"], 2),
            "top_drugs": top_u_drugs,
            "pass": udata["num"] > 0
        })
    unit_data.sort(key=lambda x: x['num'], reverse=True)
    master["indicators"]["ttm_top_herbs"]["years"][y] = {
        "num": round(tot_val, 2), "den": tot_visits, "rate": round(tot_val, 2),
        "total_amount": tot_amount, "top_herbs": sorted_drugs[:20], "units": unit_data
    }

# ----------------------------------------------------
# 2. งบ PCC (4 Indicators)
# ----------------------------------------------------
# 2.1 DM HbA1c
master["indicators"]["pcc_dm_hba1c"] = {
    "code": "PCC-1",
    "name": "DM ได้รับการตรวจ HbA1c อย่างน้อยปีละ 1 ครั้ง",
    "table": "s_dm_hba1c",
    "domain": "pcc",
    "domain_label": "💰 งบ PCC (4 ตัวชี้วัด)",
    "desc": "ร้อยละของผู้ป่วยโรคเบาหวานได้รับการตรวจ HbA1c อย่างน้อยปีละ 1 ครั้ง",
    "target": 80.0,
    "unit": "%",
    "num_label": "ตรวจ HbA1c (คน)",
    "den_label": "ผู้ป่วยเบาหวาน (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_dm_hba1c_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('hba1c') or r.get('result1')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target') or r.get('target1')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 80.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["pcc_dm_hba1c"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 80.0, "units": unit_data
    }

# 2.2 DM ควบคุมได้ดี
master["indicators"]["pcc_dm_control"] = {
    "code": "PCC-2",
    "name": "DM ควบคุมระดับน้ำตาลได้ดี (HbA1c < 7%)",
    "table": "s_dm_control",
    "domain": "pcc",
    "domain_label": "💰 งบ PCC (4 ตัวชี้วัด)",
    "desc": "ร้อยละของผู้ป่วยโรคเบาหวานที่ควบคุมระดับน้ำตาลได้ดีตามเกณฑ์",
    "target": 40.0,
    "unit": "%",
    "num_label": "ควบคุมได้ดี (คน)",
    "den_label": "ผู้ป่วยเบาหวาน (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_dm_control_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('result1')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target') or r.get('target1')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 40.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["pcc_dm_control"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 40.0, "units": unit_data
    }

# 2.3 HT ควบคุมได้ดี
master["indicators"]["pcc_ht_control"] = {
    "code": "PCC-3",
    "name": "HT ควบคุมความดันโลหิตได้ดี (<140/90 mmHg)",
    "table": "s_ht_control",
    "domain": "pcc",
    "domain_label": "💰 งบ PCC (4 ตัวชี้วัด)",
    "desc": "ร้อยละของผู้ป่วยโรคความดันโลหิตสูงที่ควบคุมความดันโลหิตได้ดีตามเกณฑ์",
    "target": 50.0,
    "unit": "%",
    "num_label": "ควบคุมได้ดี (คน)",
    "den_label": "ผู้ป่วยความดันโลหิตสูง (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ht_control_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('bp') or r.get('result1')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target') or r.get('target1')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 50.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["pcc_ht_control"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 50.0, "units": unit_data
    }

# 2.4 DM/HT ภาวะแทรกซ้อน (s_dm_hypo)
master["indicators"]["pcc_complication"] = {
    "code": "PCC-4",
    "name": "DM/HT ภาวะแทรกซ้อนเฉียบพลัน/Admit (ยิ่งน้อยยิ่งดี)",
    "table": "s_dm_hypo",
    "domain": "pcc",
    "domain_label": "💰 งบ PCC (4 ตัวชี้วัด)",
    "desc": "ร้อยละของการเกิดภาวะแทรกซ้อนเฉียบพลันในผู้ป่วยเบาหวานและความดัน",
    "target": 5.0,
    "unit": "%",
    "num_label": "เกิดภาวะแทรกซ้อน (คน)",
    "den_label": "ผู้ป่วยทั้งหมด (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_dm_hypo_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('hypo') or r.get('result1')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target') or r.get('target1')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate <= 5.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'])
    master["indicators"]["pcc_complication"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate <= 5.0, "units": unit_data
    }

# ----------------------------------------------------
# 3. งบ PPB (5 Indicators)
# ----------------------------------------------------
# 3.1 ตรวจพัฒนาการเด็ก 0-5 ปี (s_childdev_specialpp)
master["indicators"]["ppb_child_develop"] = {
    "code": "PPB-1",
    "name": "เด็ก 0-5 ปี คัดกรองพัฒนาการตามช่วงอายุ (DSPM/SpecialPP)",
    "table": "s_childdev_specialpp",
    "domain": "ppb",
    "domain_label": "🎯 งบ PPB (5 ตัวชี้วัด)",
    "desc": "ร้อยละของเด็กอายุ 9, 18, 30, 42 และ 60 เดือน ได้รับการคัดกรองพัฒนาการด้วยเครื่องมือ DSPM ตามเกณฑ์ specialpp",
    "target": 85.0,
    "unit": "%",
    "num_label": "ได้รับการคัดกรอง (คน)",
    "den_label": "เด็กตามช่วงอายุ (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_childdev_specialpp_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc == '11999': hc = '11135'
        if hc in unit_agg:
            n = sum(int(clean_num(r.get(f'result_{m}', 0))) for m in [9, 18, 30, 42, 60])
            d = sum(int(clean_num(r.get(f'target_{m}', 0))) for m in [9, 18, 30, 42, 60])
            if d == 0:
                n = int(clean_num(r.get('result') or r.get('screen') or 0))
                d = int(clean_num(r.get('target') or r.get('pop') or 0))
            unit_agg[hc]["num"] += n
            unit_agg[hc]["den"] += d
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 85.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ppb_child_develop"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 85.0, "units": unit_data
    }

# 3.2 เด็ก 6-12 ปี ชั่งน้ำหนักวัดส่วนสูง
master["indicators"]["ppb_weight_height"] = {
    "code": "PPB-2",
    "name": "เด็ก 6-12 ปี ชั่งน้ำหนักวัดส่วนสูง (สูงดีสมส่วน)",
    "table": "s_kpi_height614",
    "domain": "ppb",
    "domain_label": "🎯 งบ PPB (5 ตัวชี้วัด)",
    "desc": "ร้อยละของเด็กอายุ 6-12 ปี ได้รับการตรวจชั่งน้ำหนักวัดส่วนสูงและมีเกณฑ์สูงดีสมส่วน",
    "target": 65.0,
    "unit": "%",
    "num_label": "สูงดีสมส่วน (คน)",
    "den_label": "เด็กที่ได้รับการชั่ง/วัด (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_kpi_height614_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            n = int(clean_num(r.get('resultq1', 0))) + int(clean_num(r.get('resultq2', 0)))
            d = int(clean_num(r.get('targetq1', 0))) + int(clean_num(r.get('targetq2', 0)))
            if n == 0 and 'result' in r: n = int(clean_num(r.get('result')))
            if d == 0 and 'target' in r: d = int(clean_num(r.get('target')))
            unit_agg[hc]["num"] += n
            unit_agg[hc]["den"] += d
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 65.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ppb_weight_height"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 65.0, "units": unit_data
    }

# 3.3 เด็ก 4-12 ปี เคลือบฟลูออไรด์
master["indicators"]["ppb_fluoride"] = {
    "code": "PPB-3",
    "name": "ทันตกรรมป้องกัน เด็ก 4-12 ปี ได้รับการเคลือบฟลูออไรด์",
    "table": "s_kpi_dental63",
    "domain": "ppb",
    "domain_label": "🎯 งบ PPB (5 ตัวชี้วัด)",
    "desc": "ร้อยละของเด็กอายุ 4-12 ปี ได้รับการเคลือบ/ทา ฟลูออไรด์ป้องกันฟันผุ",
    "target": 50.0,
    "unit": "%",
    "num_label": "เคลือบฟลูออไรด์ (คน)",
    "den_label": "เด็กเป้าหมาย 4-12 ปี (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_kpi_dental63_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 50.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ppb_fluoride"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 50.0, "units": unit_data
    }

# 3.4 เด็ก 6-12 ปี เคลือบหลุมร่องฟัน
master["indicators"]["ppb_sealant"] = {
    "code": "PPB-4",
    "name": "ทันตกรรมป้องกัน เด็ก 6-12 ปี ได้รับการเคลือบหลุมร่องฟัน",
    "table": "s_kpi_dental64",
    "domain": "ppb",
    "domain_label": "🎯 งบ PPB (5 ตัวชี้วัด)",
    "desc": "ร้อยละของเด็กอายุ 6-12 ปี ได้รับการเคลือบหลุมร่องฟันกรามแท้ป้องกันฟันผุ",
    "target": 30.0,
    "unit": "%",
    "num_label": "เคลือบหลุมร่องฟัน (คน)",
    "den_label": "เด็กเป้าหมาย 6-12 ปี (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_kpi_dental64_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 30.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ppb_sealant"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 30.0, "units": unit_data
    }

# 3.5 ผู้สูงอายุ 60 ปีขึ้นไป คัดกรองซึมเศร้า
master["indicators"]["ppb_depression"] = {
    "code": "PPB-5",
    "name": "ผู้สูงอายุ 60 ปีขึ้นไป ได้รับการคัดกรองโรคซึมเศร้า (2Q)",
    "table": "s_2q_adl_test",
    "domain": "ppb",
    "domain_label": "🎯 งบ PPB (5 ตัวชี้วัด)",
    "desc": "ร้อยละของผู้สูงอายุ 60 ปีขึ้นไปได้รับการประเมินและคัดกรองภาวะซึมเศร้า (2Q)",
    "target": 80.0,
    "unit": "%",
    "num_label": "คัดกรองซึมเศร้าแล้ว (คน)",
    "den_label": "ผู้สูงอายุเป้าหมาย 60+ (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_2q_adl_test_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('1B0280')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 80.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["ppb_depression"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 80.0, "units": unit_data
    }

# ----------------------------------------------------
# 4. ผู้สูงอายุ (Elderly Care)
# ----------------------------------------------------
# 4.1 คัดกรอง 9 ด้าน (s_aged9)
master["indicators"]["elderly_screen9"] = {
    "code": "ELD-1",
    "name": "การคัดกรองผู้สูงอายุ 9 ด้าน (Basic Screen STEP1)",
    "table": "s_aged9",
    "domain": "elderly",
    "domain_label": "👵 ผู้สูงอายุ & NCDs",
    "desc": "ร้อยละของผู้สูงอายุได้รับการคัดกรองสุขภาพ 9 ด้าน",
    "target": 80.0,
    "unit": "%",
    "num_label": "คัดกรอง 9 ด้าน (คน)",
    "den_label": "ผู้สูงอายุทั้งหมด (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_aged9_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('result1')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target') or r.get('target1')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 80.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["elderly_screen9"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 80.0, "units": unit_data
    }

# 4.2 ADL ผู้สูงอายุ (s_ageing)
master["indicators"]["elderly_adl"] = {
    "code": "ELD-2",
    "name": "การประเมิน ADL ผู้สูงอายุ (ติดสังคม ติดบ้าน ติดเตียง)",
    "table": "s_ageing",
    "domain": "elderly",
    "domain_label": "👵 ผู้สูงอายุ & NCDs",
    "desc": "จำนวนผู้สูงอายุได้รับการประเมินความสามารถในการทำกิจวัตรประจำวัน (ADL)",
    "target": 80.0,
    "unit": "%",
    "num_label": "ประเมิน ADL แล้ว (คน)",
    "den_label": "ผู้สูงอายุทั้งหมด (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_ageing_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('adl_all') or r.get('result1')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target') or r.get('pop') or r.get('target1')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 80.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["elderly_adl"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 80.0, "units": unit_data
    }

# ----------------------------------------------------
# 5. อนามัยแม่และเด็ก (MCH)
# ----------------------------------------------------
# 5.1 ฝากครรภ์ครั้งแรก <= 12 สัปดาห์
master["indicators"]["mch_anc12"] = {
    "code": "MCH-1",
    "name": "หญิงตั้งครรภ์ฝากครรภ์ครั้งแรกเมื่ออายุครรภ์ ≤ 12 สัปดาห์",
    "table": "s_anc12ga",
    "domain": "mch",
    "domain_label": "👶 อนามัยแม่และเด็ก",
    "desc": "ร้อยละของหญิงตั้งครรภ์ได้รับการฝากครรภ์ครั้งแรกก่อนหรือเท่ากับ 12 สัปดาห์",
    "target": 80.0,
    "unit": "%",
    "num_label": "ฝากครรภ์ ≤12 สัปดาห์ (คน)",
    "den_label": "หญิงตั้งครรภ์ทั้งหมด (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_anc12ga_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('target') or r.get('result') or 0))
            unit_agg[hc]["den"] += int(clean_num(r.get('total') or r.get('anc_all') or 0))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 80.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["mch_anc12"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 80.0, "units": unit_data
    }

# 5.2 นมแม่อย่างเดียว 6 เดือน
master["indicators"]["mch_breastfeeding"] = {
    "code": "MCH-2",
    "name": "เด็กแรกเกิด - 6 เดือน กินนมแม่อย่างเดียว",
    "table": "s_kpi_food",
    "domain": "mch",
    "domain_label": "👶 อนามัยแม่และเด็ก",
    "desc": "ร้อยละของเด็กแรกเกิด - ต่ำกว่า 6 เดือน กินนมแม่อย่างเดียวตามเกณฑ์",
    "target": 50.0,
    "unit": "%",
    "num_label": "กินนมแม่อย่างเดียว (คน)",
    "den_label": "เด็กอายุต่ำกว่า 6 เดือน (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_kpi_food_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            unit_agg[hc]["num"] += int(clean_num(r.get('result') or r.get('breast_milk') or r.get('result1')))
            unit_agg[hc]["den"] += int(clean_num(r.get('target') or r.get('target1')))
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 50.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["mch_breastfeeding"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 50.0, "units": unit_data
    }

# 5.3 โภชนาการเด็ก 0-5 ปี
master["indicators"]["mch_child_nutrition"] = {
    "code": "MCH-3",
    "name": "โภชนาการเด็ก 0-5 ปี (น้ำหนักตามเกณฑ์ส่วนสูง)",
    "table": "s_nutrition_11",
    "domain": "mch",
    "domain_label": "👶 อนามัยแม่และเด็ก",
    "desc": "ร้อยละของเด็กอายุ 0-5 ปี มีน้ำหนักตามเกณฑ์ส่วนสูง (สมส่วน)",
    "target": 70.0,
    "unit": "%",
    "num_label": "เด็กสมส่วน (คน)",
    "den_label": "เด็กที่ได้รับการชั่ง/วัด (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_nutrition_11_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc in unit_agg:
            num = sum(int(clean_num(r.get(f'result3_q{q}') or 0)) for q in range(1, 5))
            den = sum(int(clean_num(r.get(f'target1_q{q}') or 0)) for q in range(1, 5))
            unit_agg[hc]["num"] += num
            unit_agg[hc]["den"] += den
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 70.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["mch_child_nutrition"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 70.0, "units": unit_data
    }

# 5.4 คัดกรองพัฒนาการเด็กปฐมวัยตามช่วงอายุ (s_childdev_specialpp)
master["indicators"]["mch_childdev"] = {
    "code": "MCH-4",
    "name": "การคัดกรองพัฒนาการเด็กปฐมวัยตามช่วงอายุ (DSPM)",
    "table": "s_childdev_specialpp",
    "domain": "mch",
    "domain_label": "👶 อนามัยแม่และเด็ก",
    "desc": "ร้อยละของเด็กอายุ 9, 18, 30, 42 และ 60 เดือน ได้รับการคัดกรองพัฒนาการ (เกณฑ์ สธ. ≥ 85.0%)",
    "target": 85.0,
    "unit": "%",
    "num_label": "ได้รับการคัดกรอง (คน)",
    "den_label": "เด็กตามช่วงอายุ (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_childdev_specialpp_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc == '11999': hc = '11135'
        if hc in unit_agg:
            n = sum(int(clean_num(r.get(f'result_{m}', 0))) for m in [9, 18, 30, 42, 60])
            d = sum(int(clean_num(r.get(f'target_{m}', 0))) for m in [9, 18, 30, 42, 60])
            if d == 0:
                n = int(clean_num(r.get('result') or r.get('screen') or 0))
                d = int(clean_num(r.get('target') or r.get('pop') or 0))
            unit_agg[hc]["num"] += n
            unit_agg[hc]["den"] += d
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 85.0
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["mch_childdev"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 85.0, "units": unit_data
    }

# 5.5 เด็กพัฒนาการสงสัยล่าช้าได้รับการติดตามประเมินซ้ำ (s_childdev_specialpp48)
master["indicators"]["mch_childdev_follow"] = {
    "code": "MCH-5",
    "name": "เด็กพัฒนาการสงสัยล่าช้าได้รับการติดตามประเมินซ้ำ (TEDA4I/DAIM)",
    "table": "s_childdev_specialpp48",
    "domain": "mch",
    "domain_label": "👶 อนามัยแม่และเด็ก",
    "desc": "ร้อยละของเด็กอายุ 9, 18, 30, 42 เดือน ที่พบพัฒนาการสงสัยล่าช้าได้รับการติดตามและกระตุ้นพัฒนาการ (เกณฑ์ สธ. ≥ 85.0%)",
    "target": 85.0,
    "unit": "%",
    "num_label": "ได้รับการติดตามประเมินซ้ำ (คน)",
    "den_label": "เด็กที่สงสัยล่าช้า (คน)",
    "years": {}
}
for y in years:
    rows = load_json(f"s_childdev_specialpp48_{y}.json")
    unit_agg = {hc: {"num": 0, "den": 0} for hc in SARAPHI_UNITS}
    for r in rows:
        hc = r.get('hospcode')
        if hc == '11999': hc = '11135'
        if hc in unit_agg:
            n = sum(int(clean_num(r.get(f'result_{m}', 0))) for m in [9, 18, 30, 42, 60])
            d = sum(int(clean_num(r.get(f'target_{m}', 0))) for m in [9, 18, 30, 42, 60])
            if d == 0:
                n = int(clean_num(r.get('result') or r.get('follow') or 0))
                d = int(clean_num(r.get('target') or 0))
            unit_agg[hc]["num"] += n
            unit_agg[hc]["den"] += d
    unit_data = []
    tot_num = 0; tot_den = 0
    for hc, d in unit_agg.items():
        rate = round((d["num"] / d["den"] * 100), 2) if d["den"] > 0 else 0.0
        tot_num += d["num"]; tot_den += d["den"]
        unit_data.append({
            "hospcode": hc, "name": SARAPHI_UNITS[hc]["name"], "subdistrict": SARAPHI_UNITS[hc]["subdistrict"],
            "num": d["num"], "den": d["den"], "rate": rate, "pass": rate >= 85.0 or (d["den"] == 0 and d["num"] == 0)
        })
    dist_rate = round((tot_num / tot_den * 100), 2) if tot_den > 0 else 0.0
    unit_data.sort(key=lambda x: x['rate'], reverse=True)
    master["indicators"]["mch_childdev_follow"]["years"][y] = {
        "num": tot_num, "den": tot_den, "rate": dist_rate, "pass": dist_rate >= 85.0, "units": unit_data
    }

# Save Complete Master Data
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(master, f, ensure_ascii=False, indent=2)

print(f"Master data built successfully! Total indicators: {len(master['indicators'])}")
print(f"Saved to: {out_file}")

import json
import os

DATA_DIR = 'data/nhso'

SARAPHI_MAP = {
    '11135': 'รพ.สารภี',
    '06014': 'รพ.สต.บ้านยางเนิ้ง',
    '06015': 'รพ.สต.บ้านปากกอง',
    '06016': 'รพ.สต.บ้านศรีสองเมือง',
    '06017': 'รพ.สต.บ้านหัวดง',
    '06018': 'รพ.สต.บ้านหนองแฝก',
    '06020': 'รพ.สต.บ้านแคว (ท่ากว้าง)',
    '06021': 'รพ.สต.บ้านสันต้นกอก',
    '06022': 'รพ.สต.บ้านบวกครกเหนือ',
    '06023': 'รพ.สต.บ้านป่าสา',
    '06024': 'รพ.สต.บ้านศรีคำชมภู',
    '13994': 'รพ.สต.บ้านท่าต้นกวาว',
    '14461': 'รพ.สต.บ้านหนองผึ้ง',
    '99758': 'ศสม.สารภี'
}

def audit():
    print("="*90)
    print("  รายงานตรวจสอบข้อมูลตัวชี้วัด สปสช. (MeData) ทั้งหมดของอำเภอสารภี ทุกปีงบประมาณ")
    print("="*90)

    # 1. MENU 3: บริการหัตถการแพทย์แผนไทย (Point & บาท)
    print("\n" + "-"*90)
    print("  [1] เมนู 3: บริการหัตถการแพทย์แผนไทย (ME-03) — MeData Sheet 3")
    print("-"*90)
    proc_file = os.path.join(DATA_DIR, 'nhso_procedure_types.json')
    if os.path.exists(proc_file):
        with open(proc_file, encoding='utf-8') as f:
            pdata = json.load(f).get('data', {})
        for yr in ['2569', '2568', '2567']:
            if yr in pdata:
                yd = pdata[yr]
                tot = yd.get('districtTotal', 0)
                tot_b = yd.get('districtTotalBath', tot)
                u_tot = sum(u.get('totalPoint', 0) for u in yd.get('units', {}).values())
                diff = u_tot - tot
                print(f"  ปีงบ {yr}: ยอดรวมอำเภอ = {tot:>10,d} Point ({tot_b:>12,.2f} บาท) | ผลรวม 14 หน่วย = {u_tot:>10,d} Point (Diff: {diff})")
                
                # Check procedures
                procs = yd.get('districtProcedures', {})
                p_tot = sum(procs.values())
                print(f"         ผลรวมรายหัตถการ ({len(procs)} รายการ) = {p_tot:>10,d} Point (Diff: {p_tot - tot})")
                
                # Top units
                u_sorted = sorted(yd.get('units', {}).items(), key=lambda x: x[1].get('totalPoint', 0), reverse=True)
                top3 = [f"{SARAPHI_MAP.get(k, k)}: {v.get('totalPoint', 0):,}" for k, v in u_sorted[:3]]
                print(f"         Top 3 หน่วยบริการ: {', '.join(top3)}")

    # 2. MENU 4: ยาสมุนไพร 55 รายการ (Point & บาท)
    print("\n" + "-"*90)
    print("  [2] เมนู 4: ยาสมุนไพร 55 รายการ (ME-04) — MeData Sheet 4")
    print("-"*90)
    h55_file = os.path.join(DATA_DIR, 'nhso_herb55_monthly.json')
    if os.path.exists(h55_file):
        with open(h55_file, encoding='utf-8') as f:
            h55 = json.load(f).get('data', {})
        for yr in ['2569', '2568', '2567']:
            if yr in h55:
                yd = h55[yr]
                tot = yd.get('districtTotalPoint', 0)
                tot_b = yd.get('districtTotalBath', tot)
                u_tot = sum(u.get('totalPoint', 0) for u in yd.get('units', {}).values())
                diff = u_tot - tot
                print(f"  ปีงบ {yr}: ยอดรวมอำเภอ = {tot:>10,d} Point ({tot_b:>12,.2f} บาท) | ผลรวม 14 หน่วย = {u_tot:>10,d} Point (Diff: {diff})")
                
                # Monthly sum check
                m_tot = sum(m.get('districtPoint', 0) for m in yd.get('months', {}).values())
                print(f"         ผลรวมรายเดือน ({len(yd.get('months', {}))} เดือน) = {m_tot:>10,d} Point (Diff: {m_tot - tot})")
                
                # Top units
                u_sorted = sorted(yd.get('units', {}).items(), key=lambda x: x[1].get('totalPoint', 0), reverse=True)
                top3 = [f"{SARAPHI_MAP.get(k, k)}: {v.get('totalPoint', 0):,}" for k, v in u_sorted[:3]]
                print(f"         Top 3 หน่วยบริการ: {', '.join(top3)}")

    # 3. MENU 5: ยาสมุนไพร 9 รายการ (Fee Schedule 60 บ./ครั้ง)
    print("\n" + "-"*90)
    print("  [3] เมนู 5: ยาสมุนไพร 9 รายการ (ME-05) — MeData Sheet 5")
    print("-"*90)
    h9_file = os.path.join(DATA_DIR, 'nhso_herb9_monthly.json')
    if os.path.exists(h9_file):
        with open(h9_file, encoding='utf-8') as f:
            h9 = json.load(f).get('data', {})
        for yr in ['2569', '2568', '2567']:
            if yr in h9:
                yd = h9[yr]
                tot_c = yd.get('districtTotalCount', 0)
                tot_b = yd.get('districtTotalBath', tot_c * 60)
                u_tot_c = sum(u.get('totalCount', 0) for u in yd.get('units', {}).values())
                u_tot_b = sum(u.get('totalBath', u.get('totalCount', 0)*60) for u in yd.get('units', {}).values())
                print(f"  ปีงบ {yr}: ยอดรวมอำเภอ = {tot_c:>10,d} ครั้ง ({tot_b:>12,.2f} บาท) | ผลรวม 14 หน่วย = {u_tot_c:>10,d} ครั้ง / {u_tot_b:>12,.2f} บ.")
                
                # Monthly sum check
                m_tot = sum(m.get('districtCount', 0) for m in yd.get('months', {}).values())
                print(f"         ผลรวมรายเดือน ({len(yd.get('months', {}))} เดือน) = {m_tot:>10,d} ครั้ง (Diff: {m_tot - tot_c})")
                
                # Herbs check
                h_tot = sum(yd.get('districtHerbs', {}).values())
                print(f"         ผลรวมรายชนิดยา ({len(yd.get('districtHerbs', {}))} รายการ) = {h_tot:>10,d} ครั้ง (Diff: {h_tot - tot_c})")
                
                # Top units
                u_sorted = sorted(yd.get('units', {}).items(), key=lambda x: x[1].get('totalCount', 0), reverse=True)
                top3 = [f"{SARAPHI_MAP.get(k, k)}: {v.get('totalCount', 0):,} ครั้ง" for k, v in u_sorted[:3]]
                print(f"         Top 3 หน่วยบริการ: {', '.join(top3)}")

    # 4. MENU 6: ยาสมุนไพร 32 รายการ (จ่ายตามจริง/Point)
    print("\n" + "-"*90)
    print("  [4] เมนู 6: ยาสมุนไพร 32 รายการ (ME-06) — MeData Sheet 6")
    print("-"*90)
    h32_file = os.path.join(DATA_DIR, 'nhso_herb32_monthly.json')
    if os.path.exists(h32_file):
        with open(h32_file, encoding='utf-8') as f:
            h32 = json.load(f).get('data', {})
        for yr in ['2569', '2568', '2567']:
            if yr in h32:
                yd = h32[yr]
                tot_c = yd.get('districtTotalCount', 0)
                tot_b = yd.get('districtTotalBath', 0)
                u_tot_c = sum(u.get('totalCount', 0) for u in yd.get('units', {}).values())
                u_tot_b = sum(u.get('totalBath', 0) for u in yd.get('units', {}).values())
                print(f"  ปีงบ {yr}: ยอดรวมอำเภอ = {tot_c:>10,d} ครั้ง ({tot_b:>12,.2f} บาท) | ผลรวม 14 หน่วย = {u_tot_c:>10,d} ครั้ง / {u_tot_b:>12,.2f} บ.")
                
                m_tot_c = sum(m.get('districtCount', 0) for m in yd.get('months', {}).values())
                m_tot_b = sum(m.get('districtBath', 0) for m in yd.get('months', {}).values())
                print(f"         ผลรวมรายเดือน ({len(yd.get('months', {}))} เดือน) = {m_tot_c:>10,d} ครั้ง / {m_tot_b:>12,.2f} บ.")
                
                h_tot_c = sum(yd.get('districtHerbs', {}).values())
                h_tot_b = sum(yd.get('districtHerbsPay', {}).values())
                print(f"         ผลรวมรายชนิดยา ({len(yd.get('districtHerbs', {}))} รายการ) = {h_tot_c:>10,d} ครั้ง / {h_tot_b:>12,.2f} บ.")
                
                u_sorted = sorted(yd.get('units', {}).items(), key=lambda x: x[1].get('totalCount', 0), reverse=True)
                top3 = [f"{SARAPHI_MAP.get(k, k)}: {v.get('totalCount', 0):,} ครั้ง ({v.get('totalBath', 0):,.2f} บ.)" for k, v in u_sorted[:3]]
                print(f"         Top 3 หน่วยบริการ: {', '.join(top3)}")

    # 5. MENU 9: Error Codes (การปฏิเสธการจ่ายชดเชย)
    print("\n" + "-"*90)
    print("  [5] เมนู 9: Error Codes ปฏิเสธการจ่าย (ME-09) — MeData Sheet 9")
    print("-"*90)
    err_file = os.path.join(DATA_DIR, 'nhso_error_codes.json')
    if os.path.exists(err_file):
        with open(err_file, encoding='utf-8') as f:
            err = json.load(f)
        for yr in ['2569', '2568', '2567']:
            if yr in err:
                yd = err[yr]
                h_err = yd.get('herbs', {})
                p_err = yd.get('procedures', {})
                h_cnt = h_err.get('total_error_count', 0)
                p_cnt = p_err.get('total_error_count', 0)
                print(f"  ปีงบ {yr}: Error ยาสมุนไพร = {h_cnt:>6,d} รายการ ({len(h_err.get('error_codes', {}))} รหัส) | Error หัตถการ = {p_cnt:>6,d} รายการ ({len(p_err.get('error_codes', {}))} รหัส)")
                
                # Top error codes for herbs
                top_herbs_err = sorted(h_err.get('error_codes', {}).items(), key=lambda x: x[1].get('count', 0), reverse=True)
                if top_herbs_err:
                    top_codes_str = ', '.join([f"{k} ({v.get('count',0)} รายการ)" for k, v in top_herbs_err[:3]])
                    print(f"         Top Error ยาสมุนไพร: {top_codes_str}")

    # 6. OVERVIEW: สรุปภาพรวมกองทุนแพทย์แผนไทย 4 เมนู
    print("\n" + "="*90)
    print("  [6] ภาพรวมกองทุนแพทย์แผนไทย สปสช. (ยอดชดเชยรวม 4 เมนู)")
    print("="*90)
    for yr in ['2569', '2568']:
        s3_b = pdata.get(yr, {}).get('districtTotalBath', pdata.get(yr, {}).get('districtTotal', 0)) if os.path.exists(proc_file) else 0
        s4_b = h55.get(yr, {}).get('districtTotalBath', h55.get(yr, {}).get('districtTotalPoint', 0)) if os.path.exists(h55_file) else 0
        s5_b = h9.get(yr, {}).get('districtTotalBath', h9.get(yr, {}).get('districtTotalCount', 0)*60) if os.path.exists(h9_file) else 0
        s6_b = h32.get(yr, {}).get('districtTotalBath', 0) if os.path.exists(h32_file) else 0
        tot_all_b = s3_b + s4_b + s5_b + s6_b
        print(f"\n  ปีงบประมาณ {yr}:")
        print(f"    - เมนู 3 (หัตถการ):         {s3_b:>12,.2f} บาท")
        print(f"    - เมนู 4 (ยาสมุนไพร 55):     {s4_b:>12,.2f} บาท")
        print(f"    - เมนู 5 (ยาสมุนไพร 9):      {s5_b:>12,.2f} บาท")
        print(f"    - เมนู 6 (ยาสมุนไพร 32):     {s6_b:>12,.2f} บาท")
        print(f"    {'='*45}")
        print(f"    รวมงบชดเชยทั้งสิ้น 4 เมนู:   {tot_all_b:>12,.2f} บาท")

audit()

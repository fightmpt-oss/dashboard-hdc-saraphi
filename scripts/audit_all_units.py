import json

with open('data/nhso/nhso_herb32_monthly.json', encoding='utf-8') as f:
    h32 = json.load(f)['data']

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

for yr in ['2569', '2568']:
    ydata = h32[yr]
    print(f"\n{'='*85}")
    print(f"  รายงานตรวจสอบความถูกต้องของข้อมูลทุกหน่วยบริการ ยาสมุนไพร 32 รายการ ปีงบ {yr}")
    print(f"{'='*85}")
    print(f"{'#':<3} {'รหัส':<6} {'ชื่อหน่วยบริการ':<24} {'จำนวนครั้ง':>10} {'ชดเชยจริง (บาท)':>18} {'เฉลี่ย/ครั้ง':>12} {'สัดส่วน%':>10}")
    print(f"{'-'*85}")
    
    units = ydata.get('units', {})
    sorted_units = sorted(units.items(), key=lambda x: x[1].get('totalCount', 0), reverse=True)
    
    tot_cnt = 0
    tot_bath = 0
    dist_cnt = ydata.get('districtTotalCount', 0)
    dist_bath = ydata.get('districtTotalBath', 0)
    
    for idx, (code, u) in enumerate(sorted_units, 1):
        name = SARAPHI_MAP.get(code, u.get('name', code))
        cnt = u.get('totalCount', 0)
        bath = u.get('totalBath', 0)
        tot_cnt += cnt
        tot_bath += bath
        avg = bath / cnt if cnt > 0 else 0
        pct = (bath / dist_bath * 100) if dist_bath > 0 else 0
        print(f"{idx:<3} {code:<6} {name:<24} {cnt:>10,d} {bath:>18,.2f} {avg:>12.2f} {pct:>9.2f}%")
    
    print(f"{'-'*85}")
    avg_dist = tot_bath / tot_cnt if tot_cnt > 0 else 0
    print(f"    {'รวมทุกหน่วยบริการ':<27} {tot_cnt:>10,d} {tot_bath:>18,.2f} {avg_dist:>12.2f} {'100.00%':>10}")
    print(f"    {'ยอดอำเภอจากระบบ':<27} {dist_cnt:>10,d} {dist_bath:>18,.2f}")
    diff_c = tot_cnt - dist_cnt
    diff_b = tot_bath - dist_bath
    status = "ตรงกัน 100% ถูกต้องสมบูรณ์" if diff_c == 0 and abs(diff_b) < 0.01 else "พบผลต่าง!"
    print(f"    สถานะการตรวจสอบ: {status} (Diff ครั้ง: {diff_c}, Diff บาท: {diff_b:.2f})")

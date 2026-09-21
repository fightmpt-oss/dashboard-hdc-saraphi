import json

with open('data/nhso/nhso_herb32_monthly.json', encoding='utf-8') as f:
    h32 = json.load(f)['data']['2569']

months = h32['months']
units = h32['units']

print(f"\n{'='*80}")
print("  ตรวจสอบความสอดคล้องรายเดือน ปีงบ 2569 (12 เดือน)")
print(f"{'='*80}")
print(f"{'เดือน':<18} {'จำนวนครั้ง (District)':>20} {'ยอดเงินบาท (District)':>22} {'ผลรวม Units (ครั้ง/บาท)':>22}")
print(f"{'-'*80}")

all_m_cnt = 0
all_m_bath = 0

for m_name, m_data in months.items():
    dist_c = m_data.get('districtCount', 0)
    dist_b = m_data.get('districtBath', 0)
    all_m_cnt += dist_c
    all_m_bath += dist_b
    
    # Sum across units for this month
    u_c = sum(u.get('monthly', {}).get(m_name, {}).get('count', 0) for u in units.values())
    u_b = sum(u.get('monthly', {}).get(m_name, {}).get('pay', 0) for u in units.values())
    
    diff_str = "[OK]" if (u_c == dist_c and abs(u_b - dist_b) < 0.01) else f"DIFF! ({u_c-dist_c}, {u_b-dist_b})"
    print(f"{m_name:<18} {dist_c:>15,d} cnt {dist_b:>17,.2f} B.  {u_c:>6,d} / {u_b:>9,.2f} B. {diff_str}")

print(f"{'-'*80}")
print(f"{'รวมทั้งปีงบ 2569':<18} {all_m_cnt:>15,d} ครั้ง {all_m_bath:>17,.2f} บ.")
print(f"{'ยอดรวมอำเภอ':<18} {h32['districtTotalCount']:>15,d} ครั้ง {h32['districtTotalBath']:>17,.2f} บ.")
print(f"ผลการตรวจสอบ: {'ตรงกัน 100% สมบูรณ์' if all_m_cnt == h32['districtTotalCount'] and all_m_bath == h32['districtTotalBath'] else 'พบผลต่าง'}")

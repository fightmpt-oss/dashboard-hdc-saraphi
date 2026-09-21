import json

with open('data/nhso/nhso_herb32_monthly.json', encoding='utf-8') as f:
    h32 = json.load(f)['data']['2569']

herbs_cnt = h32['districtHerbs']
herbs_pay = h32['districtHerbsPay']

print(f"\n{'='*95}")
print("  ตรวจสอบชนิดยาสมุนไพร 32 รายการ ปีงบ 2569 (14 ชนิดยาที่มีการสั่งใช้)")
print(f"{'='*95}")

sorted_herbs = sorted(herbs_cnt.items(), key=lambda x: x[1], reverse=True)
tot_c = 0
tot_b = 0

for idx, (h_name, cnt) in enumerate(sorted_herbs, 1):
    pay = herbs_pay.get(h_name, 0)
    tot_c += cnt
    tot_b += pay
    avg = pay / cnt if cnt > 0 else 0
    pct_c = (cnt / h32['districtTotalCount'] * 100)
    pct_b = (pay / h32['districtTotalBath'] * 100)
    print(f"{idx:<2}. {h_name:<40} : {cnt:>6,d} cnt ({pct_c:>5.1f}%) | {pay:>10,.2f} B. ({pct_b:>5.1f}%) | avg: {avg:>6.2f} B.")

print(f"{'-'*95}")
print(f"รวม 14 ชนิดยา: {tot_c:>6,d} ครั้ง | {tot_b:>10,.2f} บาท")
print(f"ยอดรวมอำเภอ : {h32['districtTotalCount']:>6,d} ครั้ง | {h32['districtTotalBath']:>10,.2f} บาท")
print(f"ผลต่าง: ครั้ง = {tot_c - h32['districtTotalCount']}, บาท = {tot_b - h32['districtTotalBath']:.2f}")

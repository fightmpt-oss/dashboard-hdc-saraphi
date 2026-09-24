# -*- coding: utf-8 -*-
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/ncd_service_plan_master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

reports = master.get('reports', [])
print(f"Total reports in master: {len(reports)}")

all_zero = []
zero_in_2569 = []
has_data_2569 = []

for idx, r in enumerate(reports):
    rid = r.get('id', '')
    tname = r.get('table_name', '')
    cat = r.get('category', '')
    name = r.get('name', '')
    years = r.get('years', {})

    d69 = years.get('2569', {}).get('district', {})
    t69 = d69.get('target', 0) or d69.get('b1', 0) or 0
    r69 = d69.get('result', 0) or d69.get('a1', 0) or 0

    d68 = years.get('2568', {}).get('district', {})
    t68 = d68.get('target', 0) or d68.get('b1', 0) or 0
    r68 = d68.get('result', 0) or d68.get('a1', 0) or 0

    d67 = years.get('2567', {}).get('district', {})
    t67 = d67.get('target', 0) or d67.get('b1', 0) or 0
    r67 = d67.get('result', 0) or d67.get('a1', 0) or 0

    sum_all = t69 + r69 + t68 + r68 + t67 + r67

    # Check units in 2569 just in case district is 0 but units have data
    u69_sum = 0
    for ucode, udata in years.get('2569', {}).get('units', {}).items():
        u69_sum += udata.get('target', 0) or udata.get('b1', 0) or udata.get('result', 0) or udata.get('a1', 0) or 0

    if sum_all == 0 and u69_sum == 0:
        all_zero.append((idx + 1, rid, tname, cat, name))
    elif t69 == 0 and r69 == 0 and u69_sum == 0:
        zero_in_2569.append((idx + 1, rid, tname, cat, name, t68, r68, t67, r67))
    else:
        has_data_2569.append((idx + 1, rid, tname, cat, name, t69, r69))

print("\n==================================================")
print(f"1. ALL ZERO IN ALL YEARS (2567, 2568, 2569): {len(all_zero)}")
print("==================================================")
for item in all_zero:
    print(f"  {item[0]:2d}. [{item[3]}] {item[1]:15s} ({item[2]:22s}): {item[4]}")

print("\n==================================================")
print(f"2. ZERO IN 2569 (has old data in 2568/2567): {len(zero_in_2569)}")
print("==================================================")
for item in zero_in_2569:
    print(f"  {item[0]:2d}. [{item[3]}] {item[1]:15s} ({item[2]:22s}) [2568: {item[5]}/{item[6]}, 2567: {item[7]}/{item[8]}]: {item[4]}")

print("\n==================================================")
print(f"3. HAS DATA IN 2569 (ACTIVE): {len(has_data_2569)}")
print("==================================================")
for item in has_data_2569:
    print(f"  {item[0]:2d}. [{item[3]}] {item[1]:15s} ({item[2]:22s}) [2569: {item[5]}/{item[6]}]: {item[4]}")

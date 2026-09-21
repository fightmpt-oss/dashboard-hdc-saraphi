import json

MASTER_PATH = 'data/nhso/nhso_saraphi_master.json'
H32_PATH = 'data/nhso/nhso_herb32_monthly.json'

with open(MASTER_PATH, encoding='utf-8') as f:
    master = json.load(f)

with open(H32_PATH, encoding='utf-8') as f:
    h32_data = json.load(f)['data']['2569']

h32_units = h32_data['units']
dist_h32_bath = h32_data['districtTotalBath'] # 312,425.00
dist_h32_cnt = h32_data['districtTotalCount'] # 4,836

agg = master.get('aggregated', {})
dist_tot = agg.get('district_total', {})

# Update district_total
dist_tot['sheet6_herb32_count'] = dist_h32_cnt
dist_tot['sheet6_herb32_bath'] = dist_h32_bath

# Recalculate total_bath
s3_bath = dist_tot.get('sheet3_service_bath', 0)
s4_bath = dist_tot.get('sheet4_herb55_bath', 0)
s5_bath = dist_tot.get('sheet5_herb9_bath', 0)
s6_bath = dist_h32_bath

dist_tot['total_bath'] = round(s3_bath + s4_bath + s5_bath + s6_bath)

print("Updated Aggregated District Total:")
print(f"  - Sheet 3 (หัตถการ): {s3_bath:,.2f} บ.")
print(f"  - Sheet 4 (ยา 55):   {s4_bath:,.2f} บ.")
print(f"  - Sheet 5 (ยา 9):    {s5_bath:,.2f} บ.")
print(f"  - Sheet 6 (ยา 32):   {s6_bath:,.2f} บ.")
print(f"  - รวมทั้งสิ้น (total_bath): {dist_tot['total_bath']:,.2f} บ.")

# Update units
units = agg.get('units', {})
for code, u in units.items():
    u_h32 = h32_units.get(code, {})
    u_cnt = u_h32.get('totalCount', 0)
    u_bath = u_h32.get('totalBath', 0)
    
    u['sheet6_herb32_count'] = u_cnt
    u['sheet6_herb32_bath'] = round(u_bath)
    
    u_s3 = u.get('sheet3_service_bath', 0)
    u_s4 = u.get('sheet4_herb55_bath', 0)
    u_s5 = u.get('sheet5_herb9_bath', 0)
    u['total_bath'] = round(u_s3 + u_s4 + u_s5 + u['sheet6_herb32_bath'])

print(f"\nUpdated {len(units)} units in aggregated.")
print("Sample 06020:", units.get('06020'))
print("Sample 11135:", units.get('11135'))

# Save master
with open(MASTER_PATH, 'w', encoding='utf-8') as f:
    json.dump(master, f, ensure_ascii=False, indent=2)

print("\nSuccessfully saved to nhso_saraphi_master.json")

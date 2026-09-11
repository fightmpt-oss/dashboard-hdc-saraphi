import json

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\saraphi_s_ttm4_3years.json", "r", encoding="utf-8") as f:
    data = json.load(f)

hospcodes = set()
didstds = set()

for y, rows in data.items():
    print(f"Year {y}: {len(rows)} records")
    for r in rows:
        hospcodes.add(r['hospcode'])
        didstds.add(r['didstd'])

print(f"\nUnique Hospcodes in Saraphi: {len(hospcodes)}")
print("Hospcodes:", sorted(list(hospcodes)))

print(f"\nUnique didstd (drugs): {len(didstds)}")
print("Sample didstd:", list(didstds)[:10])

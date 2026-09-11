import json, pymysql

with open(r"D:\Dashboard Takwang\config.json", "r", encoding="utf-8") as f:
    cfg = json.load(f)

conn = pymysql.connect(
    host=cfg.get("host", "127.0.0.1"),
    port=int(cfg.get("port", 3306)),
    user=cfg.get("user", "root"),
    password=cfg.get("password", ""),
    database=cfg.get("database", "jhcisdb"),
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\data\s_ttm4_2568.json", "r", encoding="utf-8") as f:
    ttm4 = json.load(f)

all_didstds = sorted(list(set(r['didstd'] for r in ttm4 if r.get('didstd'))))

with conn.cursor() as cur:
    cur.execute("SELECT drugcode24, drugname, drugnamethai, druggenericname FROM cdrug WHERE drugcode24 IS NOT NULL AND drugcode24 != ''")
    rows = cur.fetchall()

db_drugs = {r['drugcode24']: (r['drugname'] or r['drugnamethai'] or r['druggenericname']) for r in rows}

matched = 0
drug_map = {}
for code in all_didstds:
    name = db_drugs.get(code)
    if name:
        matched += 1
        drug_map[code] = name

print(f"Total didstds in Saraphi: {len(all_didstds)}, Matched in JHCIS cdrug: {matched}")
with open(r"d:\PROJECTS\Dashboard HDC Saraphi\data\drug_names_map.json", "w", encoding="utf-8") as f:
    json.dump(drug_map, f, ensure_ascii=False, indent=2)

for c in list(drug_map.keys())[:10]:
    print(f"  {c} -> {drug_map[c]}")

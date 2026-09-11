import json, pymysql

with open(r"D:\Dashboard Takwang\config.json", "r", encoding="utf-8") as f:
    cfg = json.load(f)

conn = pymysql.connect(
    host=cfg['host'],
    port=int(cfg['port']),
    user=cfg['user'],
    password=cfg['password'],
    database=cfg['database'],
    charset='tis620',
    cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cur:
    cur.execute("SELECT drugcode24, drugname, drugnamethai, druggenericname FROM cdrug WHERE drugcode24 IS NOT NULL AND drugcode24 != ''")
    rows = cur.fetchall()

drug_dict = {}
for r in rows:
    code = r['drugcode24'].strip()
    name = (r['drugname'] or r['drugnamethai'] or r['druggenericname'] or '').strip()
    if code and name:
        drug_dict[code] = name

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\data\drug_master_tis620.json", "w", encoding="utf-8") as f:
    json.dump(drug_dict, f, ensure_ascii=False, indent=2)

print(f"Loaded {len(drug_dict)} drugs with TIS-620 successfully!")

import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def check_table(t):
    url = f"https://opendata.moph.go.th/api/report_schema/{t}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data and len(data) > 0:
                cols = [c['COLUMN_NAME'] for c in data]
                return cols
    except:
        pass
    return None

print("Checking s_ttm 1..20:")
valid_ttm = {}
for i in range(1, 25):
    tname = f"s_ttm{i}"
    cols = check_table(tname)
    if cols:
        print(f"FOUND {tname}: {cols[:6]}...")
        valid_ttm[tname] = cols

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\valid_ttm_tables.json", "w", encoding="utf-8") as f:
    json.dump(valid_ttm, f, ensure_ascii=False, indent=2)

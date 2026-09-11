import urllib.request, json

url = "https://opendata.moph.go.th/api/report_schema/s_ttm4"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode('utf-8'))

print("Schema for s_ttm4:")
for col in data:
    name = col.get('COLUMN_NAME')
    ctype = col.get('COLUMN_TYPE')
    comment = col.get('COLUMN_COMMENT', '')
    print(f"  {name:15} | {ctype:15} | {comment}")

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\s_ttm4_schema.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== 1. MAIN REPORTS ===")
main_reports = get_json("https://opendata.moph.go.th/opendata_api/reports/main-reports")
print(f"Total main reports: {len(main_reports)}")
for r in main_reports:
    print(f" - ID: {r.get('id')}, Name: {r.get('name')}")

print("\n=== 2. ALL CATEGORIES ===")
categories = get_json("https://opendata.moph.go.th/opendata_api/reports/categories")
print(f"Total categories: {len(categories)}")
for c in categories[:15]:
    print(f" - ID: {c.get('id')}, MainID: {c.get('main_report_id')}, Name: {c.get('name')}")


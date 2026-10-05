import urllib.request
import re
import json

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f"Error: {e}"

print("=== Fetching index / dashboard ===")
index_html = fetch("https://www.ncd.in.th/?year=2569")
with open("scripts/ncd_in_th_index.html", "w", encoding="utf-8") as f:
    f.write(index_html)
print(f"index.html saved, len={len(index_html)}")

print("=== Fetching admin.html ===")
admin_html = fetch("https://www.ncd.in.th/admin.html")
with open("scripts/ncd_in_th_admin.html", "w", encoding="utf-8") as f:
    f.write(admin_html)
print(f"admin.html saved, len={len(admin_html)}")

print("=== Fetching app.js ===")
app_js = fetch("https://www.ncd.in.th/app.js")
with open("scripts/ncd_in_th_app.js", "w", encoding="utf-8") as f:
    f.write(app_js)
print(f"app.js saved, len={len(app_js)}")

# Analyze APIs in index and admin
for name, content in [("index", index_html), ("admin", admin_html), ("app", app_js)]:
    apis = re.findall(r'(/api/[a-zA-Z0-9_\-/\?=&]+)', content)
    print(f"APIs in {name}:", sorted(list(set(apis))))

# Also search for public data endpoints
public_reports = fetch("https://www.ncd.in.th/api/reports?year=2569")
print(f"/api/reports?year=2569 length: {len(public_reports)}")
if public_reports.startswith("{") or public_reports.startswith("["):
    try:
        data = json.loads(public_reports)
        if isinstance(data, list):
            print(f"Public reports list count: {len(data)}")
            if len(data) > 0:
                print("First report sample:", json.dumps(data[0], ensure_ascii=False, indent=2)[:300])
        elif isinstance(data, dict):
            print("Public reports dict keys:", list(data.keys()))
    except Exception as e:
        print("JSON parse error:", e)

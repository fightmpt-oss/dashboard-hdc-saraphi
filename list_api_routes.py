import re
import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://opendata.moph.go.th/main-es2015.574d89f3cbe8eddceebd.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    content = resp.read().decode('utf-8', errors='ignore')

api_routes = re.findall(r'["\'](opendata_api/[^"\']+)["\']', content)
print("Unique opendata_api routes:")
for r in sorted(list(set(api_routes))):
    print(" ", r)

hdc_routes = re.findall(r'["\'](api/[^"\']+)["\']', content)
print("\nUnique api/ routes:")
for r in sorted(list(set(hdc_routes))):
    print(" ", r)

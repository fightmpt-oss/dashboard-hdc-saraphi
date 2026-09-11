import re
import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://opendata.moph.go.th/7-es2015.6670f77217ce36fe68d5.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
    chunk7 = resp.read().decode('utf-8', errors='ignore')

# Find all api_hdc_url calls
matches = [m.start() for m in re.finditer(r'api_hdc_url', chunk7)]
print(f"api_hdc_url calls in chunk 7: {len(matches)}")
for idx in matches:
    print("---")
    print(chunk7[max(0, idx-100):min(len(chunk7), idx+250)])

# Also search for "report" or "category" or "sub_category"
cat_matches = re.findall(r'["\'](api/[^"\']+|opendata_api/[^"\']+)["\']', chunk7)
print("Endpoints in chunk 7:", sorted(list(set(cat_matches))))

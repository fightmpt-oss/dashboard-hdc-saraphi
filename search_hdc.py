import re
import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://opendata.moph.go.th/main-es2015.574d89f3cbe8eddceebd.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    content = resp.read().decode('utf-8', errors='ignore')

matches = [m.start() for m in re.finditer(r'api_hdc_url', content)]
for idx in matches:
    print("--- api_hdc_url ---")
    print(content[max(0, idx-100):min(len(content), idx+300)])

# Also search for "report_data"
rep_matches = [m.start() for m in re.finditer(r'report_data', content)]
print(f"\nreport_data matches: {len(rep_matches)}")
for idx in rep_matches:
    print("--- report_data ---")
    print(content[max(0, idx-100):min(len(content), idx+300)])

import re
import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://opendata.moph.go.th/main-es2015.574d89f3cbe8eddceebd.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    content = resp.read().decode('utf-8', errors='ignore')

# find occurrences of requestGet, requestPost
matches = [m.start() for m in re.finditer(r'request(?:Get|Post)\(', content)]
print(f"Found {len(matches)} request calls")
for idx in matches[:15]:
    start = max(0, idx - 50)
    end = min(len(content), idx + 150)
    print("--- CALL ---")
    print(content[start:end])

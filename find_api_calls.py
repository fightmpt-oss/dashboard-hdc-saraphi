import re

with open("d:\\PROJECTS\\Dashboard HDC Saraphi\\analyze_bundle.py", "r") as f:
    pass

# Read main js directly from memory or fetch again
import urllib.request, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://opendata.moph.go.th/main-es2015.574d89f3cbe8eddceebd.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    content = resp.read().decode('utf-8', errors='ignore')

# Find occurrences of "https://opendata.moph.go.th/api"
matches = [m.start() for m in re.finditer(r'https://opendata\.moph\.go\.th/api', content)]
print(f"Found {len(matches)} matches")
for idx in matches:
    start = max(0, idx - 100)
    end = min(len(content), idx + 200)
    print("--- SNIPPET ---")
    print(content[start:end])


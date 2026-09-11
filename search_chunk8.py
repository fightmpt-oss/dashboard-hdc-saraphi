import re

with open("d:\\PROJECTS\\Dashboard HDC Saraphi\\check_getmain.py", "r") as f:
    pass

import urllib.request, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req8 = urllib.request.Request("https://opendata.moph.go.th/8-es2015.d4290ed1a4afcd98f2f6.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req8, context=ctx, timeout=15) as resp:
    chunk8 = resp.read().decode('utf-8', errors='ignore')

matches8 = [m.start() for m in re.finditer(r'api_hdc_url', chunk8)]
print(f"api_hdc_url in chunk 8: {len(matches8)}")
for idx in matches8:
    print("--- 8 ---")
    print(chunk8[max(0, idx-100):min(len(chunk8), idx+200)])

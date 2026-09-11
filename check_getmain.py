import re
import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://opendata.moph.go.th/6-es2015.4c1860494517b6829b50.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
    chunk6 = resp.read().decode('utf-8', errors='ignore')

idx = chunk6.find("getMainReport")
if idx != -1:
    print("Found getMainReport in chunk 6:")
    print(chunk6[max(0, idx-100):min(len(chunk6), idx+300)])
else:
    print("Not in chunk 6")

idx8 = -1
req8 = urllib.request.Request("https://opendata.moph.go.th/8-es2015.d4290ed1a4afcd98f2f6.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req8, context=ctx, timeout=15) as resp:
    chunk8 = resp.read().decode('utf-8', errors='ignore')
idx8 = chunk8.find("getMainReport")
if idx8 != -1:
    print("Found getMainReport in chunk 8:")
    print(chunk8[max(0, idx8-100):min(len(chunk8), idx8+300)])
else:
    print("Not in chunk 8")

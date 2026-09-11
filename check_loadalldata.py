import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req8 = urllib.request.Request("https://opendata.moph.go.th/8-es2015.d4290ed1a4afcd98f2f6.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req8, context=ctx, timeout=15) as resp:
    chunk8 = resp.read().decode('utf-8', errors='ignore')

idx = chunk8.find("loadAllData()")
print(chunk8[idx:idx+2500])

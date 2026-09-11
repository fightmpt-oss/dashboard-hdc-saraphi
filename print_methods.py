import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://opendata.moph.go.th/7-es2015.6670f77217ce36fe68d5.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
    chunk7 = resp.read().decode('utf-8', errors='ignore')

idx = chunk7.find("getMainReport()")
print(chunk7[idx:idx+2500])

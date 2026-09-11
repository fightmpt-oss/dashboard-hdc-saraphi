import os, re

files = [f for f in os.listdir("d:\\PROJECTS\\Dashboard HDC Saraphi") if f.endswith(".js")]
print("JS files:", files)

# Search in the chunks we downloaded or download them to disk
import urllib.request, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

chunks = ['0', '2', '6', '7', '8', '9', '10']
hashes = {
    '0': 'e7ffa49060d4dda6fbb7',
    '2': '65a24f5a7c91b2e5c3b8',
    '6': '4c1860494517b6829b50',
    '7': '6670f77217ce36fe68d5',
    '8': 'd4290ed1a4afcd98f2f6',
    '9': '64e2ecc2704863615da3',
    '10': 'c2b415a80bec33659865'
}

for cid, chash in hashes.items():
    fname = f"{cid}-es2015.{chash}.js"
    path = f"d:\\PROJECTS\\Dashboard HDC Saraphi\\{fname}"
    if not os.path.exists(path):
        req = urllib.request.Request(f"https://opendata.moph.go.th/{fname}", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            with open(path, "wb") as f:
                f.write(resp.read())
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    ttm_matches = re.findall(r's_[a-z0-9_]+', text)
    if ttm_matches:
        unique_tables = sorted(list(set(ttm_matches)))
        print(f"Tables matching s_* in {fname}: {len(unique_tables)}")
        print("Sample:", unique_tables[:10])

import re
import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://opendata.moph.go.th/runtime-es2015.e30bbf85790e53741bdf.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    runtime = resp.read().decode('utf-8', errors='ignore')

# find chunk names/hashes
chunks = re.findall(r'(\d+|[a-zA-Z0-9_-]+):"([a-f0-9]+)"', runtime)
print("Chunks in runtime:", chunks[:10])

# Also check how script names are formatted
print("Runtime snippet:", runtime[:500])

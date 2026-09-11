import urllib.request, json

url = "https://opendata.moph.go.th/api/report_schema/s_ttm4"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as resp:
    raw = resp.read()

# try different decodings
for enc in ['tis-620', 'cp874']:
    try:
        decoded = raw.decode(enc)
        print(f"Decoded with {enc}:", decoded[:200])
    except Exception as e:
        pass

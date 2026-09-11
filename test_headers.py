import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://opendata.moph.go.th/opendata_api/reports/main-reports",
    "https://opendata.moph.go.th/api/report_schema/s_ttm4",
    "https://opendata.moph.go.th/api/report_year/s_ttm4",
]

for url in urls:
    print("\nTesting URL:", url)
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://opendata.moph.go.th/',
            'Origin': 'https://opendata.moph.go.th',
            'Accept': 'application/json, text/plain, */*'
        })
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            print("Status:", resp.status)
            print("Snippet:", data[:200])
    except urllib.error.HTTPError as e:
        print("HTTPError:", e.code, e.reason)
        try:
            print("Error body:", e.read().decode('utf-8')[:200])
        except:
            pass
    except Exception as e:
        print("Error:", e)

import urllib.request, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_api(url, post_data=None):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json'
    }
    req = urllib.request.Request(url, data=json.dumps(post_data).encode('utf-8') if post_data else None, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = resp.read().decode('utf-8', errors='ignore')
            print(f"[{resp.status}] {url} -> Length: {len(data)}, Snippet: {data[:150]}")
            return data
    except urllib.error.HTTPError as e:
        print(f"[HTTP {e.code}] {url}")
    except Exception as e:
        print(f"[ERR] {url} -> {e}")

test_api("https://opendata.moph.go.th/api/report_schema/s_ttm4")
test_api("https://opendata.moph.go.th/api/report_year/s_ttm4")
test_api("https://opendata.moph.go.th/api/reportById/s_ttm4")
test_api("https://opendata.moph.go.th/api/report_template/s_ttm4/2568")

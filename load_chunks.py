import re
import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

chunks = [('0', 'e7ffa49060d4dda6fbb7'), ('2', '65a24f5a7c91b2e5c3b8'), ('6', '4c1860494517b6829b50'), ('7', '6670f77217ce36fe68d5'), ('8', 'd4290ed1a4afcd98f2f6'), ('9', '64e2ecc2704863615da3'), ('10', 'c2b415a80bec33659865')]

for cid, chash in chunks:
    filename = f"{cid}-es2015.{chash}.js"
    url = f"https://opendata.moph.go.th/{filename}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            print(f"Loaded {filename}, size: {len(content)}")
            # search for report_data or api or endpoints
            endpoints = re.findall(r'["\'](/api/[^"\']+|api/[^"\']+|opendata_api/[^"\']+)["\']', content)
            if endpoints:
                print(f"  Endpoints in {filename}:", set(endpoints))
            # search for Thai keywords or table names
            tables = re.findall(r'tableName\s*:\s*["\']([^"\']+)["\']', content)
            if tables:
                print(f"  Table names in {filename}:", tables[:5])
            # search for api_hdc_url or similar
            if 'report_data' in content:
                print(f"  FOUND report_data in {filename}!")
                idx = content.find('report_data')
                print("  Snippet:", content[max(0, idx-100):min(len(content), idx+200)])
    except Exception as e:
        print(f"Error {filename}: {e}")

import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request("https://opendata.moph.go.th/main-es2015.574d89f3cbe8eddceebd.js", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
    content = resp.read().decode('utf-8', errors='ignore')

print("Main bundle length:", len(content))
# Search for API endpoints
endpoints = re.findall(r'["\'](/api/[^"\']+)["\']', content)
print("Endpoints found:", sorted(list(set(endpoints))))

# Search for https://opendata.moph.go.th endpoints
full_endpoints = re.findall(r'["\'](https?://[^"\']*(?:api|report|category)[^"\']*)["\']', content)
print("Full endpoints:", sorted(list(set(full_endpoints))))

# Search for categories or reports
with open("d:\\PROJECTS\\Dashboard HDC Saraphi\\main_bundle_sample.txt", "w", encoding="utf-8") as f:
    for ep in sorted(list(set(endpoints + full_endpoints))):
        f.write(ep + "\n")

import urllib.request
import json
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_url(url, post_data=None):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    if post_data:
        headers['Content-Type'] = 'application/json'
        req = urllib.request.Request(url, data=json.dumps(post_data).encode('utf-8'), headers=headers)
    else:
        req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        return resp.read().decode('utf-8', errors='ignore')

# 1. Test HTML of homepage
html = fetch_url('https://opendata.moph.go.th/')
print(f"Homepage fetched, length: {len(html)}")

# Find scripts
scripts = re.findall(r'src=["\']([^"\']+\.js[^"\']*)["\']', html)
print("Scripts found:", scripts)

matches = re.findall(r'(https?://[^\s"\'<>]+|/[a-zA-Z0-9_\-\./]+(?:api|swagger|report|category)[^\s"\'<>]*)', html, re.IGNORECASE)
print("Matches in HTML:", list(set(matches))[:20])

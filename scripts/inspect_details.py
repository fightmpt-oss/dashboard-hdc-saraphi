import urllib.request
import json

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'error': str(e)}

ref = fetch_json('https://www.ncd.in.th/api/ref')
print('=== REF ===')
if isinstance(ref, dict):
    for k, v in ref.items():
        if isinstance(v, list):
            print(f'ref[{k}]: list len={len(v)}')
            if v:
                print(f'  sample {k}[0]: {v[0]}')
        else:
            print(f'ref[{k}]: {v}')
else:
    print('Ref:', ref)

dash = fetch_json('https://www.ncd.in.th/api/dashboard?year=2569')
print('\n=== DASHBOARD ===')
if isinstance(dash, dict):
    for k, v in dash.items():
        if isinstance(v, list):
            print(f'dash[{k}]: list len={len(v)}')
            if v:
                print(f'  sample {k}[0]: {json.dumps(v[0], ensure_ascii=False)[:300]}')
        elif isinstance(v, dict):
            print(f'dash[{k}]: dict keys={list(v.keys())[:10]}')
        else:
            print(f'dash[{k}]: {v}')
else:
    print('Dash:', dash)

# Check settings / sync logic from admin.html
with open('scripts/ncd_in_th_admin.html', 'r', encoding='utf-8') as f:
    admin_content = f.read()

# Let's search for how settings and sync work in admin.html
print('\n=== SYNC / SETTINGS IN ADMIN.HTML ===')
import re
sync_blocks = [line for line in admin_content.split('\n') if any(w in line for w in ['sync', 'cron', 'auto', 'opendata', 'moph', 'provid', 'settings'])]
print(f'Found {len(sync_blocks)} lines mentioning sync/auto/opendata')
for l in sync_blocks[:25]:
    print('  ', l.strip()[:140])

import urllib.request
import json
import re

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'error': str(e)}

ref = fetch_json('https://www.ncd.in.th/api/ref')
dash = fetch_json('https://www.ncd.in.th/api/dashboard?year=2569')

with open('scripts/ncd_in_th_admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()

# Let's inspect javascript functions in admin_html
# Specifically viewSync, viewSettings, startSync, saveSettings
sections = {}
for m in re.finditer(r'(async\s+function|function)\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{', admin_html):
    fn_name = m.group(2)
    start = m.start()
    # Find matching brace
    depth = 0
    end = start
    for i in range(m.end() - 1, len(admin_html)):
        if admin_html[i] == '{': depth += 1
        elif admin_html[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    sections[fn_name] = admin_html[start:end]

analysis = {
    'ref_keys': list(ref.keys()) if isinstance(ref, dict) else [],
    'dash_keys': list(dash.keys()) if isinstance(dash, dict) else [],
    'categories': dash.get('categories', []),
    'reports_summary': {
        'total': len(dash.get('reports', [])),
        'sample_report': dash.get('reports', [])[0] if dash.get('reports') else None
    },
    'settings_fn': sections.get('viewSettings', ''),
    'sync_fn': sections.get('viewSync', ''),
    'start_sync_fn': sections.get('startSync', ''),
    'report_form_fn': sections.get('reportForm', '')
}

with open('scripts/ncd_in_th_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(analysis, f, ensure_ascii=False, indent=2)

print("Saved analysis to scripts/ncd_in_th_analysis.json")

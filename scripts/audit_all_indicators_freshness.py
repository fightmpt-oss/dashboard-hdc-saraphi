import os
import sys
import json
import time
import urllib.request
import urllib.error

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
DATA_DIR = os.path.join(ROOT, 'data')
API_URL = "https://opendata.moph.go.th/api/report_data"

def get_live_date_com(table, year="2569"):
    body = json.dumps({
        "tableName": table,
        "year": str(year),
        "province": "50",
        "type": "json",
        "offset": 0,
        "limit": 5
    }).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        method="POST"
    )
    for attempt in range(1, 4):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            page = payload.get("data") or [] if isinstance(payload, dict) else (payload or [])
            if page and isinstance(page[0], dict):
                return str(page[0].get("date_com") or "NO_DATE")
            return "EMPTY_OR_NO_DATA"
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(3 * attempt)
            else:
                return f"HTTP_{e.code}"
        except Exception as e:
            time.sleep(2)
    return "TIMEOUT_OR_ERROR"

def audit():
    print("=== FAST AUDIT: CHECKING LIVE OPENDATA MOPH VS LOCAL DATA ===")
    with open(os.path.join(DATA_DIR, 'sync_status.json'), encoding='utf-8') as f:
        sync_status = json.load(f)

    tables_map = {}
    for t in sync_status.get('tables', []):
        tbl = t.get('table')
        if not tbl:
            continue
        y69 = t.get('years', {}).get('2569', {})
        tables_map[tbl] = {
            'label': t.get('label'),
            'group': t.get('group'),
            'source': t.get('source'),
            'local_date_com': y69.get('date_com', ''),
            'local_rows': y69.get('saraphi_rows', 0),
            'hdc_url': t.get('hdc_url')
        }

    results = []
    total = len(tables_map)
    for i, (tbl, info) in enumerate(tables_map.items(), 1):
        if info['source'] != 'opendata':
            results.append({
                'table': tbl,
                'label': info['label'],
                'group': info['group'],
                'source': info['source'],
                'local_date': info['local_date_com'],
                'live_date': 'N/A',
                'status': 'special_source',
                'note': 'ไฟล์พิเศษ (Excel สสจ. / MeData สปสช.)'
            })
            continue

        live_dt = get_live_date_com(tbl, '2569')
        local_dt = str(info['local_date_com'])

        if live_dt.startswith(('HTTP_', 'TIMEOUT_', 'EMPTY_')):
            status = 'api_issue'
            note = f'OpenData API ส่งสถานะ {live_dt}'
        elif not local_dt:
            status = 'missing_local'
            note = 'ไม่มี snapshot 2569 ในระบบ'
        elif live_dt > local_dt:
            status = 'needs_update'
            note = f'มีข้อมูลใหม่บน OpenData! (HDC: {live_dt} vs ท้องถิ่น: {local_dt})'
        elif live_dt == local_dt:
            status = 'up_to_date'
            note = f'เป็นปัจจุบันตรงกับ OpenData ({local_dt})'
        else:
            status = 'local_newer'
            note = f'ข้อมูลท้องถิ่นใหม่กว่าหรือเท่ากัน ({local_dt})'

        print(f"[{i}/{total}] {tbl:28s} | Local: {local_dt:14s} | Live: {live_dt:14s} | {status}")
        results.append({
            'table': tbl,
            'label': info['label'],
            'group': info['group'],
            'source': 'opendata',
            'local_date': local_dt,
            'live_date': live_dt,
            'status': status,
            'note': note,
            'hdc_url': info.get('hdc_url')
        })
        time.sleep(0.4)

    out_file = os.path.join(DATA_DIR, 'full_indicators_audit.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("\n=== AUDIT COMPLETED ===")
    by_status = {}
    for r in results:
        by_status.setdefault(r['status'], []).append(r)

    for st, items in by_status.items():
        print(f"\nStatus: {st.upper()} ({len(items)} tables)")
        for it in items:
            print(f"  * {it['table']:25s} | {it['label'][:35]:35s} | Local: {it['local_date']} -> Live: {it['live_date']}")

if __name__ == '__main__':
    audit()

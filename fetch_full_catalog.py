import json, time
from playwright.sync_api import sync_playwright

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with open(r"d:\PROJECTS\Dashboard HDC Saraphi\meta_data.json", "r", encoding="utf-8") as f:
    meta = json.load(f)

categories = meta.get("categories", [])

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        executable_path=chrome_path,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
    )
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://opendata.moph.go.th/", wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    
    all_reports = []
    print(f"Fetching reports for {len(categories)} categories with polite delay...")
    for idx, cat in enumerate(categories):
        cid = cat.get('cat_id') or cat.get('id')
        cname = cat.get('category_name') or cat.get('name')
        
        js = f"""
        async () => {{
            const r = await fetch('https://opendata.moph.go.th/opendata_api/reports/categorie/by-category-id/{cid}');
            if (r.status === 200) return await r.json();
            return [];
        }}
        """
        try:
            reps = page.evaluate(js)
            if reps and isinstance(reps, list):
                for r in reps:
                    r['cat_id'] = cid
                    r['cat_name'] = cname
                    all_reports.append(r)
                print(f"[{idx+1}/{len(categories)}] {cname}: {len(reps)} reports")
            else:
                print(f"[{idx+1}/{len(categories)}] {cname}: 0 reports (or rate-limited)")
        except Exception as e:
            print(f"Error {cname}: {e}")
        time.sleep(0.4)
        
    print(f"\nTotal reports across all categories: {len(all_reports)}")
    with open(r"d:\PROJECTS\Dashboard HDC Saraphi\all_moph_reports_catalog.json", "w", encoding="utf-8") as f:
        json.dump(all_reports, f, ensure_ascii=False, indent=2)
        
    browser.close()

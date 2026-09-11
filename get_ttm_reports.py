from playwright.sync_api import sync_playwright
import json

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        executable_path=chrome_path,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
    )
    page = browser.new_page()
    page.goto("https://opendata.moph.go.th/", wait_until="domcontentloaded")
    page.wait_for_timeout(2000)
    
    js = """
    async () => {
        const catId = '30bc6364fc06a33a7802e16bc596ac3b'; // แพทย์แผนไทย
        const r = await fetch(`https://opendata.moph.go.th/opendata_api/reports/categorie/by-category-id/${catId}`);
        if (r.status === 200) {
            return { status: 200, data: await r.json() };
        } else {
            return { status: r.status, text: await r.text() };
        }
    }
    """
    res = page.evaluate(js)
    print("Status:", res.get("status"))
    if res.get("status") == 200:
        reports = res.get("data", [])
        print(f"Success! Found {len(reports)} reports in แพทย์แผนไทย:")
        for rep in reports:
            print(f" - [{rep.get('source_table')}] {rep.get('report_name')}")
        with open(r"d:\PROJECTS\Dashboard HDC Saraphi\ttm_reports.json", "w", encoding="utf-8") as f:
            json.dump(reports, f, ensure_ascii=False, indent=2)
    else:
        print("Response:", res.get("text"))
    browser.close()

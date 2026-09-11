import json
import time
from playwright.sync_api import sync_playwright

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        executable_path=chrome_path,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
    )
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    print("Navigating...")
    page.goto("https://opendata.moph.go.th/", wait_until="domcontentloaded", timeout=45000)
    page.wait_for_timeout(3000)
    
    # Evaluate fetch inside page
    js_fetch = """
    async () => {
        const results = {};
        try {
            const rMain = await fetch('https://opendata.moph.go.th/opendata_api/reports/main-reports');
            results.main_reports = await rMain.json();
        } catch (e) {
            results.main_reports_error = e.toString();
        }
        try {
            const rCat = await fetch('https://opendata.moph.go.th/opendata_api/reports/categories');
            results.categories = await rCat.json();
        } catch (e) {
            results.categories_error = e.toString();
        }
        return results;
    }
    """
    res = page.evaluate(js_fetch)
    print("Main reports count:", len(res.get("main_reports", [])))
    print("Categories count:", len(res.get("categories", [])))
    if "main_reports_error" in res:
        print("Main reports error:", res["main_reports_error"])
    if "categories_error" in res:
        print("Categories error:", res["categories_error"])
        
    with open(r"d:\PROJECTS\Dashboard HDC Saraphi\meta_data.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)
        
    browser.close()

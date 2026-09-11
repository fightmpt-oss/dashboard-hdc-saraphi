import json
import time
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
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    print("Navigating to establish session...")
    page.goto("https://opendata.moph.go.th/", wait_until="domcontentloaded", timeout=45000)
    page.wait_for_timeout(3000)
    
    # We pass the category list to evaluate and fetch all reports
    js_fetch_reports = """
    async (cats) => {
        const allReports = [];
        for (const cat of cats) {
            const cid = cat.cat_id || cat.id;
            try {
                const res = await fetch(`https://opendata.moph.go.th/opendata_api/reports/categorie/by-category-id/${cid}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        allReports.push({
                            cat_id: cid,
                            cat_name: cat.category_name || cat.name,
                            main_report_id: cat.main_report_id,
                            ...item
                        });
                    });
                }
            } catch (e) {
                console.error("Error cat:", cid, e);
            }
        }
        return allReports;
    }
    """
    print(f"Fetching reports for {len(categories)} categories...")
    reports = page.evaluate(js_fetch_reports, categories)
    print(f"Total reports fetched: {len(reports)}")
    
    with open(r"d:\PROJECTS\Dashboard HDC Saraphi\all_reports.json", "w", encoding="utf-8") as f:
        json.dump(reports, f, ensure_ascii=False, indent=2)
        
    browser.close()

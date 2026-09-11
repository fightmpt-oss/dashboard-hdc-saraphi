import time
from playwright.sync_api import sync_playwright

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        executable_path=chrome_path,
        args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
    )
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://opendata.moph.go.th/", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)
    
    # Wait a moment for rate limit to clear
    for wait_sec in [5, 10, 15]:
        print(f"Waiting {wait_sec}s...")
        page.wait_for_timeout(wait_sec * 1000)
        res = page.evaluate("""
        async () => {
            const catId = '30bc6364fc06a33a7802e16bc596ac3b';
            const r = await fetch(`https://opendata.moph.go.th/opendata_api/reports/categorie/by-category-id/${catId}`);
            const t = await r.text();
            return { status: r.status, body: t.substring(0, 300) };
        }
        """)
        print("Status:", res['status'])
        if res['status'] == 200:
            print("SUCCESS! Body preview:", res['body'])
            break
        else:
            print("Failed:", res['body'])
    browser.close()

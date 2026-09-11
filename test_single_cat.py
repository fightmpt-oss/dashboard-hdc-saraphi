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
    
    js = """
    async () => {
        const catId = '30bc6364fc06a33a7802e16bc596ac3b';
        // Test endpoint 1
        const r1 = await fetch(`https://opendata.moph.go.th/opendata_api/reports/categorie/by-category-id/${catId}`);
        const t1 = await r1.text();
        return { status: r1.status, body: t1.substring(0, 500) };
    }
    """
    res = page.evaluate(js)
    print("Result:", res)
    browser.close()

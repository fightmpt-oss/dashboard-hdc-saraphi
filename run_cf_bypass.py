import json
import time
from playwright.sync_api import sync_playwright

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        executable_path=chrome_path,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--window-size=1280,800'
        ]
    )
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 800}
    )
    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    captured_data = {}
    def handle_response(response):
        url = response.url
        if "opendata_api" in url or "/api/" in url:
            try:
                ct = response.headers.get("content-type", "")
                if "json" in ct:
                    data = response.json()
                    captured_data[url] = data
                    print(f"Captured: {url} -> {type(data)} ({len(data) if isinstance(data, (list, dict)) else ''})")
            except Exception as e:
                pass

    page.on("response", handle_response)
    print("Navigating...")
    page.goto("https://opendata.moph.go.th/", wait_until="domcontentloaded", timeout=45000)
    
    # Wait until title is NOT 'Just a moment...'
    for i in range(20):
        t = page.title()
        print(f"[{i}] Title: {t}")
        if "Just a moment" not in t:
            print("Passed Cloudflare!")
            break
        page.wait_for_timeout(1000)
        
    print("Waiting 10 seconds on real site...")
    page.wait_for_timeout(10000)
    print("Final title:", page.title())
    
    # Save captured APIs
    with open(r"d:\PROJECTS\Dashboard HDC Saraphi\captured_apis.json", "w", encoding="utf-8") as f:
        json.dump(captured_data, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(captured_data)} API responses to captured_apis.json")
    
    # Also grab cookies / headers
    cookies = context.cookies()
    with open(r"d:\PROJECTS\Dashboard HDC Saraphi\cookies.json", "w", encoding="utf-8") as f:
        json.dump(cookies, f, ensure_ascii=False, indent=2)
        
    browser.close()

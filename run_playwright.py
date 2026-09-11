import json
import time
from playwright.sync_api import sync_playwright

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=chrome_path)
    page = browser.new_page()
    
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
                print(f"Error parsing response from {url}: {e}")

    page.on("response", handle_response)
    print("Navigating with domcontentloaded...")
    page.goto("https://opendata.moph.go.th/", wait_until="domcontentloaded", timeout=45000)
    print("Loaded DOM! Waiting 10 seconds for Angular to load data...")
    page.wait_for_timeout(10000)
    print("Page title:", page.title())
    
    # Let us see what selectors exist or clicks we can perform
    # For example click category dropdown or find category list
    with open(r"d:\PROJECTS\Dashboard HDC Saraphi\captured_apis.json", "w", encoding="utf-8") as f:
        json.dump(captured_data, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(captured_data)} API responses to captured_apis.json")
    browser.close()

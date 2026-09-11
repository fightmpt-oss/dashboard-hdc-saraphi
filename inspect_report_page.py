import json
from playwright.sync_api import sync_playwright

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, executable_path=chrome_path, args=['--disable-blink-features=AutomationControlled', '--no-sandbox'])
    page = browser.new_page()
    # Go to s_ttm4 report page directly:
    # URL structure: https://opendata.moph.go.th/report/30bc6364fc06a33a7802e16bc596ac3b/s_ttm4/8d38925724b0bbb4b11844b18df088e4
    page.goto("https://opendata.moph.go.th/report/30bc6364fc06a33a7802e16bc596ac3b/s_ttm4/8d38925724b0bbb4b11844b18df088e4", wait_until="domcontentloaded")
    print("Waiting 5s on report page...")
    page.wait_for_timeout(5000)
    
    # Check table headers and sample rows rendered in DOM
    table_headers = page.eval_on_selector_all("table th", "elements => elements.map(e => e.innerText.trim())")
    print("Table headers rendered:", table_headers)
    
    sample_rows = page.eval_on_selector_all("table tbody tr", "elements => elements.slice(0, 5).map(e => e.innerText.trim())")
    print("Sample rows rendered:")
    for r in sample_rows:
        print(" ", r.replace('\n', ' | '))
        
    browser.close()

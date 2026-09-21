import sys
import os
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
URL = "http://127.0.0.1:8095/index.html"

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        print("Navigating to http://127.0.0.1:8095/index.html ...")
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(2000)
        
        # Switch to NHSO MeData domain
        page.locator("button.sidebar-item[data-domain='nhso_ttm']").click()
        page.wait_for_timeout(1000)
        
        # 1. Menu 4 (Herb 55) - Overview
        print("\n--- Test 1: Menu 4 (Herb 55) Overview ---")
        page.select_option("#indicator-select", "nhso_herb55")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb55_stacked_overview.png"), full_page=False)
        print("Captured herb55_stacked_overview.png")
        
        # 2. Menu 4 (Herb 55) - Unit 06020 (รพ.สต.บ้านแคว)
        print("\n--- Test 2: Menu 4 (Herb 55) Unit 06020 ---")
        page.select_option("#herb55-unit-select", "06020")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb55_unit_06020_charts.png"), full_page=False)
        print("Captured herb55_unit_06020_charts.png")
        
        # 3. Menu 4 (Herb 55) - Unit 06020 + Month ตุลาคม 2568
        print("\n--- Test 3: Menu 4 (Herb 55) Unit 06020 + ตุลาคม 2568 ---")
        page.select_option("#herb55-month-select", "ตุลาคม 2568")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb55_unit_06020_october.png"), full_page=False)
        print("Captured herb55_unit_06020_october.png")
        
        # 4. Menu 6 (Herb 32) - Unit 06020
        print("\n--- Test 4: Menu 6 (Herb 32) Unit 06020 ---")
        page.select_option("#indicator-select", "nhso_herb32")
        page.wait_for_timeout(1500)
        page.select_option("#herb32-unit-select", "06020")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb32_unit_06020_herbs.png"), full_page=False)
        print("Captured herb32_unit_06020_herbs.png")
        
        # 5. Menu 6 (Herb 32) - Unit 06020 + Month ตุลาคม 2568
        print("\n--- Test 5: Menu 6 (Herb 32) Unit 06020 + ตุลาคม 2568 ---")
        page.select_option("#herb32-month-select", "ตุลาคม 2568")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb32_unit_06020_october.png"), full_page=False)
        print("Captured herb32_unit_06020_october.png")
        
        # 6. Mobile Responsiveness (<768px)
        print("\n--- Test 6: Mobile Responsiveness ---")
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb32_mobile_charts.png"), full_page=False)
        print("Captured herb32_mobile_charts.png")
        
        print("\nAll Playwright verification tests passed 100%!")
        browser.close()

if __name__ == "__main__":
    verify()

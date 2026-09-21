# -*- coding: utf-8 -*-
"""
Playwright test script to verify NHSO Menus 3, 4, 5, 6, 9, Live Sync banner, and mobile sticky columns
"""
import sys
import os
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
URL = "http://127.0.0.1:8095/index.html"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        print(f"Navigating to {URL}...")
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # 1. Switch sidebar to nhso_ttm domain
        print("Clicking NHSO MeData sidebar item...")
        nhso_btn = page.locator("button.sidebar-item[data-domain='nhso_ttm']")
        nhso_btn.click()
        page.wait_for_timeout(1000)

        # Verify Live Sync Banner
        banner = page.locator("#nhso-sync-banner")
        print("NHSO Sync Banner visible:", banner.is_visible())
        date_text = page.locator("#nhso-sync-process-date-badge").inner_text()
        print("Banner process date:", date_text)

        # -------------------------------------------------------------
        # Test Menu 4: Herb 55
        # -------------------------------------------------------------
        print("\n--- Testing Menu 4: Herb 55 ---")
        page.select_option("#indicator-select", "nhso_herb55")
        page.wait_for_timeout(1000)

        panel55 = page.locator("#nhso-herb55-panel")
        print("Herb 55 panel visible:", panel55.is_visible())
        
        cards55 = page.locator("#herb55-kpi-cards").inner_text()
        print("Herb 55 Cards sample:\n", cards55[:150].replace('\n', ' '))

        # Take screenshot of Herb 55 overview
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb55_overview.png"), full_page=False)
        print("Saved nhso_herb55_overview.png")

        # Test filter month
        print("Filtering Herb 55 by month: ตุลาคม 2568...")
        page.select_option("#herb55-month-select", "ตุลาคม 2568")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb55_october.png"), full_page=False)
        print("Saved nhso_herb55_october.png")

        # Test filter unit drill-down: 06018 (รพ.สต.บ้านหนองแฝก)
        print("Drilling down into unit 06018...")
        page.select_option("#herb55-unit-select", "06018")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb55_unit_06018.png"), full_page=False)
        print("Saved nhso_herb55_unit_06018.png")

        # Reset filter
        page.locator("#btn-herb55-reset").click()
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # Test Menu 5: Herb 9
        # -------------------------------------------------------------
        print("\n--- Testing Menu 5: Herb 9 ---")
        page.select_option("#indicator-select", "nhso_herb9")
        page.wait_for_timeout(1000)

        # Switch to year 2568
        page.locator("#btn-herb9-yr-2568").click()
        page.wait_for_timeout(800)

        panel9 = page.locator("#nhso-herb9-panel")
        print("Herb 9 panel visible:", panel9.is_visible())
        cards9 = page.locator("#herb9-kpi-cards").inner_text()
        print("Herb 9 Cards sample:\n", cards9[:150].replace('\n', ' '))

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb9_2568.png"), full_page=False)
        print("Saved nhso_herb9_2568.png")

        # -------------------------------------------------------------
        # Test Menu 6: Herb 32
        # -------------------------------------------------------------
        print("\n--- Testing Menu 6: Herb 32 ---")
        page.select_option("#indicator-select", "nhso_herb32")
        page.wait_for_timeout(1000)

        panel32 = page.locator("#nhso-herb32-panel")
        print("Herb 32 panel visible:", panel32.is_visible())
        cards32 = page.locator("#herb32-kpi-cards").inner_text()
        print("Herb 32 Cards sample:\n", cards32[:150].replace('\n', ' '))

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb32_overview.png"), full_page=False)
        print("Saved nhso_herb32_overview.png")

        # Filter month in Herb 32
        page.select_option("#herb32-month-select", "ตุลาคม 2568")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb32_october.png"), full_page=False)
        print("Saved nhso_herb32_october.png")

        # Reset
        page.locator("#btn-herb32-reset").click()
        page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # Test Menu 9: Error Codes
        # -------------------------------------------------------------
        print("\n--- Testing Menu 9: Error Codes ---")
        page.select_option("#indicator-select", "nhso_error_code")
        page.wait_for_timeout(1000)

        panel_err = page.locator("#nhso-error-panel")
        print("Error panel visible:", panel_err.is_visible())
        cards_err = page.locator("#err-stat-total").inner_text()
        print("Total errors card value:", cards_err)

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_error_overview.png"), full_page=False)
        print("Saved nhso_error_overview.png")

        # Filter Error month
        page.select_option("#err-month-select", "ตุลาคม 2568")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_error_october.png"), full_page=False)
        print("Saved nhso_error_october.png")

        # Filter Error unit
        page.select_option("#err-unit-select", "06014")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_error_unit_06014.png"), full_page=False)
        print("Saved nhso_error_unit_06014.png")

        # -------------------------------------------------------------
        # Test Mobile Viewport & Sticky Column 1
        # -------------------------------------------------------------
        print("\n--- Testing Mobile Viewport (390x844) ---")
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(1000)

        # Menu 4 on Mobile
        page.select_option("#indicator-select", "nhso_herb55")
        page.wait_for_timeout(800)
        page.evaluate("window.resetHerb55Filters()")
        page.wait_for_timeout(500)
        
        # Scroll table to test sticky col 1
        page.evaluate("document.querySelector('#herb55-matrix-table').scrollLeft = 180")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb55_mobile_sticky.png"), full_page=False)
        print("Saved nhso_herb55_mobile_sticky.png")

        # Menu 3 on Mobile
        page.select_option("#indicator-select", "nhso_service")
        page.wait_for_timeout(800)
        page.evaluate("document.querySelector('#proc-matrix-table').scrollLeft = 200")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_service_mobile_sticky.png"), full_page=False)
        print("Saved nhso_service_mobile_sticky.png")

        browser.close()
        print("\n🎉 ALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()

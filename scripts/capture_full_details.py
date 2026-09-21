# -*- coding: utf-8 -*-
import sys
import os
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
URL = "http://127.0.0.1:8095/index.html"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Desktop details (1440 x 900)
        page = browser.new_page(viewport={"width": 1440, "height": 1100})
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(2000)

        # Switch to NHSO MeData
        page.locator("button.sidebar-item[data-domain='nhso_ttm']").click()
        page.wait_for_timeout(1000)

        # --- Menu 4: Herb 55 ---
        page.select_option("#indicator-select", "nhso_herb55")
        page.wait_for_timeout(800)
        # Scroll to chart & table
        table_card = page.locator("#herb55-matrix-table")
        table_card.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb55_table_detail.png"), full_page=False)
        print("Captured nhso_herb55_table_detail.png")

        # --- Menu 6: Herb 32 ---
        page.select_option("#indicator-select", "nhso_herb32")
        page.wait_for_timeout(800)
        table_card32 = page.locator("#herb32-matrix-table")
        table_card32.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb32_table_detail.png"), full_page=False)
        print("Captured nhso_herb32_table_detail.png")

        # --- Menu 9: Error Codes ---
        page.select_option("#indicator-select", "nhso_error_code")
        page.wait_for_timeout(800)
        chart_err = page.locator("#err-chart-card")
        chart_err.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_error_chart_detail.png"), full_page=False)
        print("Captured nhso_error_chart_detail.png")

        table_err = page.locator("#err-matrix-tbody")
        table_err.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_error_table_detail.png"), full_page=False)
        print("Captured nhso_error_table_detail.png")

        # 2. Mobile Viewport (390 x 844)
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(1000)

        # Scroll to Herb 55 table and scroll horizontally
        page.select_option("#indicator-select", "nhso_herb55")
        page.wait_for_timeout(800)
        page.locator("#herb55-matrix-table").scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        # Scroll table container to the right
        page.evaluate("document.querySelector('#herb55-matrix-table').parentElement.scrollLeft = 160")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_herb55_mobile_table_scrolled.png"), full_page=False)
        print("Captured nhso_herb55_mobile_table_scrolled.png")

        # Scroll to Error table and scroll horizontally
        page.select_option("#indicator-select", "nhso_error_code")
        page.wait_for_timeout(800)
        page.locator("#err-matrix-thead-tr").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.evaluate("document.querySelector('#err-matrix-thead-tr').closest('.overflow-x-auto').scrollLeft = 140")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "nhso_error_mobile_table_scrolled.png"), full_page=False)
        print("Captured nhso_error_mobile_table_scrolled.png")

        browser.close()
        print("Done capturing details.")

if __name__ == "__main__":
    run()

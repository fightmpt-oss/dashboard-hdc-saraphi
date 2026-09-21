import sys
import os
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
URL = "http://127.0.0.1:8095/index.html"

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1100})
        
        print("1. กำลังเปิดหน้าเว็บ...")
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(2000)
        
        # Switch to NHSO MeData domain
        print("2. สลับไปแถบ สปสช. MeData...")
        page.locator("button.sidebar-item[data-domain='nhso_ttm']").click()
        page.wait_for_timeout(1000)
        
        # Switch to Menu 5 (Herb 9)
        print("3. เลือก เมนู 5: ยาสมุนไพร 9 รายการ...")
        page.select_option("#indicator-select", "nhso_herb9")
        page.wait_for_timeout(1500)
        
        # Switch to year 2568 (which has rich data)
        print("4. สลับไปปีงบ 2568...")
        page.evaluate("window.switchHerb9Year('2568')")
        page.wait_for_timeout(1500)
        
        # Capture Legend Box & Filter & KPI
        print("5. บันทึกภาพกล่องคำอธิบาย HERB1-9...")
        legend = page.locator("#herb9-legend-container")
        legend.scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb9_legend_opened.png"), full_page=False)
        print("  -> บันทึก herb9_legend_opened.png สำเร็จ")
        
        # Test Collapse
        print("6. ทดสอบคลิกเพื่อปิด/ย่อ กล่องคำอธิบาย...")
        page.click("#herb9-legend-header-title")
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb9_legend_collapsed.png"), full_page=False)
        print("  -> บันทึก herb9_legend_collapsed.png สำเร็จ")
        
        # Test Re-open
        print("7. ทดสอบคลิกเพื่อเปิดกลับมา...")
        page.click("#herb9-legend-header-title")
        page.wait_for_timeout(600)
        
        # Test clicking Herb1 in Legend to filter
        print("8. ทดสอบคลิก 'Herb1 = ฟ้าทะลายโจร' เพื่อกรอง...")
        page.click("#btn-legend-herb1")
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb9_filtered_herb1.png"), full_page=False)
        print("  -> บันทึก herb9_filtered_herb1.png สำเร็จ")
        
        # Reset to all herbs
        print("9. แสดงทุกชนิดยา และเลื่อนดูกราฟจำแนกชนิดยา...")
        page.evaluate("window.switchHerb9Item('all')")
        page.wait_for_timeout(1000)
        charts = page.locator("#herb9-breakdown-chart")
        charts.scroll_into_view_if_needed()
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb9_charts_with_names.png"), full_page=False)
        print("  -> บันทึก herb9_charts_with_names.png สำเร็จ")
        
        # Test Single Unit drilldown: รพ.สารภี (11135)
        print("10. เจาะลึก รพ.สารภี (11135)...")
        page.evaluate("window.switchHerb9Unit('11135')")
        page.wait_for_timeout(1200)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb9_unit_11135_charts.png"), full_page=False)
        print("  -> บันทึก herb9_unit_11135_charts.png สำเร็จ")
        
        # Table with badges
        tbl = page.locator("#nhso-herb9-panel table")
        tbl.scroll_into_view_if_needed()
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "herb9_unit_11135_table.png"), full_page=False)
        print("  -> บันทึก herb9_unit_11135_table.png สำเร็จ")
        
        browser.close()
        print("\n=== การทดสอบเสร็จสมบูรณ์ 100% ===")

if __name__ == "__main__":
    verify()

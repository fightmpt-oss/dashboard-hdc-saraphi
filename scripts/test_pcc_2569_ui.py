import time
from playwright.sync_api import sync_playwright

def test_full_pcc_2569():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("Navigating to http://localhost:8089/ ...")
        page.goto("http://localhost:8089/", wait_until="load", timeout=15000)
        time.sleep(2)

        # 1. Click parent PCC to expand
        print("Clicking #sidebar-parent-pcc ...")
        page.locator("#sidebar-parent-pcc").click()
        time.sleep(1)

        # 2. Click subitem 2569
        pcc69_btn = page.locator('button[data-domain="pcc_2569"]')
        print(f"pcc69_btn visible: {pcc69_btn.is_visible()}")
        pcc69_btn.click()
        time.sleep(1.5)

        # 3. Verify Budget Overview mode
        total_pay = page.locator("#pcc69-card-total-pay").inner_text().strip()
        print(f"Total Budget Card: {total_pay} (expected ~98,029.85 บ.)")
        assert "98,029.85" in total_pay, f"Unexpected total pay: {total_pay}"

        # 4. Click View: KPI 1 (DM)
        print("Testing View KPI 1...")
        page.locator("#btn-pcc69-view-kpi1").click()
        time.sleep(1)
        h2 = page.locator("#pcc69-chart2-heading").inner_text()
        print(f"KPI 1 Chart2 heading: {h2}")

        # 5. Click View: KPI 2 (Pre-DM)
        print("Testing View KPI 2...")
        page.locator("#btn-pcc69-view-kpi2").click()
        time.sleep(1)
        h2_kpi2 = page.locator("#pcc69-chart2-heading").inner_text()
        print(f"KPI 2 Chart2 heading: {h2_kpi2}")

        # 6. Click View: KPI 3 (HT)
        print("Testing View KPI 3...")
        page.locator("#btn-pcc69-view-kpi3").click()
        time.sleep(1)

        # 7. Click View: KPI 4 (New HT Diag)
        print("Testing View KPI 4...")
        page.locator("#btn-pcc69-view-kpi4").click()
        time.sleep(1)

        # 8. Return to Budget Overview
        page.locator("#btn-pcc69-view-budget").click()
        time.sleep(1)

        # 9. Test toggle criteria box
        print("Testing criteria box toggle...")
        criteria_btn = page.locator("button:has-text('หลักเกณฑ์ราชกิจจาฯ')")
        criteria_btn.click()
        time.sleep(0.5)
        criteria_box = page.locator("#pcc69-criteria-box")
        print(f"Criteria box visible: {criteria_box.is_visible()}")
        assert criteria_box.is_visible(), "Criteria box should be visible after toggle!"
        criteria_btn.click()
        time.sleep(0.5)
        print(f"Criteria box visible after close: {criteria_box.is_visible()}")
        assert not criteria_box.is_visible(), "Criteria box should be hidden after close!"

        # 10. Check table sorting
        print("Testing sort buttons...")
        page.locator("#btn-pcc69-sort-rate_desc").click()
        time.sleep(0.5)
        page.locator("#btn-pcc69-sort-code").click()
        time.sleep(0.5)
        page.locator("#btn-pcc69-sort-budget_desc").click()
        time.sleep(0.5)

        # 11. Test selecting a unit (e.g. 06015 รพ.สต.บ้านพญาชมพู)
        print("Testing unit selection...")
        unit_select = page.locator("#unit-select")
        unit_select.select_option("06015")
        time.sleep(1)
        unit_badge = page.locator("#pcc69-unit-badge")
        print(f"Unit badge text: {unit_badge.inner_text().strip()}")
        assert "พญาชมพู" in unit_badge.inner_text(), "Unit badge should show พญาชมพู"

        # Check unit total pay: 23,132.54 บ.
        unit_tot = page.locator("#pcc69-card-total-pay").inner_text().strip()
        print(f"Unit 06015 total pay: {unit_tot} (expected 23,132.54 บ.)")
        assert "23,132.54" in unit_tot, f"Unexpected unit total pay: {unit_tot}"

        # Return to all units
        unit_select.select_option("all")
        time.sleep(1)

        # Take final screenshot
        page.screenshot(path="C:/Users/Acer/.gemini/antigravity/brain/1d1dc2c1-0794-4595-82b5-1b0becaf4b50/pcc_2569_all_views_passed.png", full_page=False)
        print("Screenshot saved to pcc_2569_all_views_passed.png")

        print("\nConsole Errors:", [e for e in console_errors if "404" not in e])
        assert len([e for e in console_errors if "404" not in e]) == 0, "No JS runtime errors allowed!"

        browser.close()
        print("\nALL PCC 2569 TESTS PASSED 100%!")

if __name__ == "__main__":
    test_full_pcc_2569()

import sys
import time
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        print("Navigating to http://localhost:8089/ ...")
        page.goto("http://localhost:8089/", wait_until="networkidle")

        # Click on Service Plan NCD sidebar button
        print("Clicking Service Plan NCD button...")
        ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
        ncd_btn.wait_for(state="visible", timeout=10000)
        ncd_btn.click()

        # Wait for NCD panel to become visible
        page.wait_for_selector("#service-plan-ncd-panel", state="visible", timeout=10000)
        time.sleep(1.5)

        # 1. Check sidebar badge
        sidebar_badge = page.locator("#ncd-sidebar-badge").inner_text().strip()
        print(f"Sidebar badge: '{sidebar_badge}' (expected '37')")
        assert sidebar_badge == "37", f"Sidebar badge mismatch: {sidebar_badge}"

        # 2. Check header badge
        header_badge = page.locator("#ncd-report-count-badge").inner_text().strip()
        print(f"Header badge: '{header_badge}' (expected '37 รายงานมาตรฐาน HDC')")
        assert "37" in header_badge, f"Header badge mismatch: {header_badge}"

        # 3. Check category pills
        pill_all = page.locator('#ncd-category-pills button[data-cat="ALL"]').inner_text().strip()
        pill_dm = page.locator('#ncd-category-pills button[data-cat="DM"]').inner_text().strip()
        pill_ht = page.locator('#ncd-category-pills button[data-cat="HT"]').inner_text().strip()
        pill_cvd = page.locator('#ncd-category-pills button[data-cat="CVD"]').inner_text().strip()
        pill_ckd = page.locator('#ncd-category-pills button[data-cat="CKD"]').inner_text().strip()

        print(f"Pills found: ALL='{pill_all}', DM='{pill_dm}', HT='{pill_ht}', CVD='{pill_cvd}', CKD='{pill_ckd}'")
        assert "37" in pill_all, f"Pill ALL mismatch: {pill_all}"
        assert "17" in pill_dm, f"Pill DM mismatch: {pill_dm}"
        assert "14" in pill_ht, f"Pill HT mismatch: {pill_ht}"
        assert "1" in pill_cvd, f"Pill CVD mismatch: {pill_cvd}"
        assert "5" in pill_ckd, f"Pill CKD mismatch: {pill_ckd}"

        # 4. Check dropdown options under ALL
        select = page.locator("#ncd-report-select")
        options_all = select.locator("option").all_inner_texts()
        print(f"Dropdown options count (ALL): {len(options_all)} (expected 37)")
        assert len(options_all) == 37, f"ALL count mismatch: {len(options_all)}"

        # Verify s_ht_control_new and s_ht_control_new1 are absent
        all_text = " ".join(options_all)
        assert "s_ht_control_new1" not in all_text, "s_ht_control_new1 still found in options!"
        assert "s_ht_control_new" not in all_text, "s_ht_control_new still found in options!"
        print("PASS: Deprecated 0-data reports (s_ht_control_new/new1) are NOT present.")

        # 5. Click DM
        page.locator('#ncd-category-pills button[data-cat="DM"]').click()
        time.sleep(0.5)
        options_dm = select.locator("option").all_inner_texts()
        print(f"Dropdown options count (DM): {len(options_dm)} (expected 17)")
        assert len(options_dm) == 17, f"DM count mismatch: {len(options_dm)}"

        # 6. Click HT
        page.locator('#ncd-category-pills button[data-cat="HT"]').click()
        time.sleep(0.5)
        options_ht = select.locator("option").all_inner_texts()
        print(f"Dropdown options count (HT): {len(options_ht)} (expected 14)")
        assert len(options_ht) == 14, f"HT count mismatch: {len(options_ht)}"

        # 7. Click CVD
        page.locator('#ncd-category-pills button[data-cat="CVD"]').click()
        time.sleep(0.5)
        options_cvd = select.locator("option").all_inner_texts()
        print(f"Dropdown options count (CVD): {len(options_cvd)} (expected 1)")
        assert len(options_cvd) == 1, f"CVD count mismatch: {len(options_cvd)}"

        # 8. Click CKD
        page.locator('#ncd-category-pills button[data-cat="CKD"]').click()
        time.sleep(0.5)
        options_ckd = select.locator("option").all_inner_texts()
        print(f"Dropdown options count (CKD): {len(options_ckd)} (expected 5)")
        assert len(options_ckd) == 5, f"CKD count mismatch: {len(options_ckd)}"

        # 9. Return to ALL and check s_ht_control display
        page.locator('#ncd-category-pills button[data-cat="ALL"]').click()
        time.sleep(0.5)
        select.select_option(value="ncd_ht_control")
        time.sleep(1.0)

        # Check KPI values
        kpi_target = page.locator("#ncd-kpi-target").inner_text().strip()
        kpi_result = page.locator("#ncd-kpi-result").inner_text().strip()
        kpi_rate = page.locator("#ncd-kpi-rate").inner_text().strip()
        print(f"KPI values for s_ht_control: Target={kpi_target}, Result={kpi_result}, Rate={kpi_rate}")
        assert kpi_target != "0" and kpi_target != "-", "Target should not be zero!"
        assert kpi_result != "0" and kpi_result != "-", "Result should not be zero!"

        # Screenshot
        page.screenshot(path="C:/Users/Acer/.gemini/antigravity/brain/1d1dc2c1-0794-4595-82b5-1b0becaf4b50/test_ncd_cleanup_verified.png", full_page=False)
        print("Screenshot saved as test_ncd_cleanup_verified.png")

        browser.close()
        print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_verification()

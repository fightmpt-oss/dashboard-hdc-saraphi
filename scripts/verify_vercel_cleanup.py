import sys
import time
from playwright.sync_api import sync_playwright

def run_vercel_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        print("Navigating to https://dashboard-hdc-saraphi.vercel.app/ ...")
        # Retry in case Vercel is still deploying
        for attempt in range(1, 6):
            try:
                page.goto("https://dashboard-hdc-saraphi.vercel.app/", wait_until="networkidle", timeout=30000)
                ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
                ncd_btn.wait_for(state="visible", timeout=10000)
                ncd_btn.click()
                page.wait_for_selector("#service-plan-ncd-panel", state="visible", timeout=10000)
                time.sleep(2)
                
                # Check sidebar badge
                sidebar_badge = page.locator("#ncd-sidebar-badge").inner_text().strip()
                if sidebar_badge == "37":
                    print(f"Attempt {attempt}: Vercel deployment is LIVE with badge 37!")
                    break
                else:
                    print(f"Attempt {attempt}: Badge is {sidebar_badge}, waiting for deployment to update...")
                    time.sleep(6)
            except Exception as e:
                print(f"Attempt {attempt} error: {e}")
                time.sleep(5)

        # 1. Check sidebar badge
        sidebar_badge = page.locator("#ncd-sidebar-badge").inner_text().strip()
        print(f"Live Sidebar badge: '{sidebar_badge}' (expected '37')")
        assert sidebar_badge == "37", f"Live Sidebar badge mismatch: {sidebar_badge}"

        # 2. Check header badge
        header_badge = page.locator("#ncd-report-count-badge").inner_text().strip()
        print(f"Live Header badge: '{header_badge}'")
        assert "37" in header_badge, f"Live Header badge mismatch: {header_badge}"

        # 3. Check pills
        pill_all = page.locator('#ncd-category-pills button[data-cat="ALL"]').inner_text().strip()
        pill_dm = page.locator('#ncd-category-pills button[data-cat="DM"]').inner_text().strip()
        pill_ht = page.locator('#ncd-category-pills button[data-cat="HT"]').inner_text().strip()
        pill_cvd = page.locator('#ncd-category-pills button[data-cat="CVD"]').inner_text().strip()
        pill_ckd = page.locator('#ncd-category-pills button[data-cat="CKD"]').inner_text().strip()

        print(f"Live Pills: ALL='{pill_all}', DM='{pill_dm}', HT='{pill_ht}', CVD='{pill_cvd}', CKD='{pill_ckd}'")
        assert "37" in pill_all, f"Pill ALL mismatch: {pill_all}"
        assert "17" in pill_dm, f"Pill DM mismatch: {pill_dm}"
        assert "14" in pill_ht, f"Pill HT mismatch: {pill_ht}"
        assert "1" in pill_cvd, f"Pill CVD mismatch: {pill_cvd}"
        assert "5" in pill_ckd, f"Pill CKD mismatch: {pill_ckd}"

        # 4. Check dropdown
        select = page.locator("#ncd-report-select")
        options_all = select.locator("option").all_inner_texts()
        print(f"Live Dropdown count: {len(options_all)} (expected 37)")
        assert len(options_all) == 37, f"Live count mismatch: {len(options_all)}"

        # Check absent deprecated
        all_text = " ".join(options_all)
        assert "s_ht_control_new1" not in all_text, "s_ht_control_new1 still on live!"
        assert "s_ht_control_new" not in all_text, "s_ht_control_new still on live!"

        # Take screenshot of live vercel
        page.screenshot(path="C:/Users/Acer/.gemini/antigravity/brain/1d1dc2c1-0794-4595-82b5-1b0becaf4b50/vercel_live_cleanup_verified.png", full_page=False)
        print("Live screenshot saved as vercel_live_cleanup_verified.png")

        browser.close()
        print("VERCEL LIVE VERIFICATION PASSED 100%!")

if __name__ == "__main__":
    run_vercel_verification()

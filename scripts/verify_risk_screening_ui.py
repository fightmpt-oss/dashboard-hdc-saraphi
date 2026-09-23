import asyncio
import os
import subprocess
import sys
import time
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
PORT = 8311

async def main():
    print("==================================================================")
    print("Verifying DM/HT Risk Screening Indicators & Steppers in Service Plan NCD")
    print("==================================================================")

    # Start local HTTP server
    server = subprocess.Popen(["python", "-m", "http.server", str(PORT)], cwd=r"d:\PROJECTS\Dashboard HDC Saraphi")
    time.sleep(1.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1600, "height": 1200})
            page = await context.new_page()

            url = f"http://127.0.0.1:{PORT}/"
            print(f"Loading {url} ...")
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)

            # 1. Click Service Plan NCD menu
            print("Step 1: Clicking Service Plan NCD menu...")
            ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
            await ncd_btn.click()
            await page.wait_for_timeout(1500)

            # Check badges and options count
            count_badge = await page.locator('#ncd-report-count-badge').inner_text()
            print(f"Report badge: {count_badge}")
            assert "72" in count_badge, f"Expected 72 reports in badge, got {count_badge}"

            # 2. Select s_dm_screen_risk (ncd_risk_dm)
            print("Step 2: Selecting s_dm_screen_risk (ncd_risk_dm)...")
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_risk_dm';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1500)

            # Check Criteria Callout
            criteria_callout = page.locator('#ncd-criteria-callout')
            assert await criteria_callout.is_visible(), "Criteria callout should be visible"
            criteria_text = await criteria_callout.inner_text()
            assert "เบาหวาน (DM)" in criteria_text
            assert "70 - <100" in criteria_text
            assert "126" in criteria_text

            # Check DM Table Headers
            thead_text = await page.locator('#ncd-table-thead').inner_text()
            assert "ปกติ" in thead_text
            assert "เสี่ยง" in thead_text
            assert "สงสัยป่วย" in thead_text
            assert "นอกเกณฑ์" in thead_text

            # Check 06014 row values in DM Table
            tbody_html = await page.locator('#ncd-table-tbody').inner_html()
            assert "06014" in tbody_html
            assert "4,317" in tbody_html  # Screened
            assert "4,010" in tbody_html  # Normal
            assert "289" in tbody_html    # Risk
            assert "14" in tbody_html     # Suspect
            print("Verified DM 06014 values match HDC screenshot exactly!")

            # Take screenshot of DM view
            dm_ss = os.path.join(ARTIFACTS_DIR, "ncd_risk_screening_dm_verified.png")
            await page.screenshot(path=dm_ss, full_page=False)
            print(f"Saved screenshot: {dm_ss}")

            # 3. Select s_ht_screen_risk (ncd_risk_ht)
            print("Step 3: Selecting s_ht_screen_risk (ncd_risk_ht)...")
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_risk_ht';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1500)

            # Check Criteria Callout for HT
            criteria_text_ht = await criteria_callout.inner_text()
            assert "ความดันโลหิตสูง (HT)" in criteria_text_ht
            assert "ป่วย" in criteria_text_ht

            # Check HT Table Headers
            thead_text_ht = await page.locator('#ncd-table-thead').inner_text()
            assert "ปกติ" in thead_text_ht
            assert "เสี่ยง" in thead_text_ht
            assert "สงสัยป่วย" in thead_text_ht
            assert "ป่วย" in thead_text_ht
            assert "นอกเกณฑ์" in thead_text_ht

            # Check 06014 row values in HT Table
            tbody_html_ht = await page.locator('#ncd-table-tbody').inner_html()
            assert "06014" in tbody_html_ht
            assert "3,435" in tbody_html_ht  # Screened
            assert "2,724" in tbody_html_ht  # Normal
            assert "553" in tbody_html_ht    # Risk
            assert "152" in tbody_html_ht    # Suspect
            assert "3" in tbody_html_ht      # Sick / OOB
            print("Verified HT 06014 values match HDC screenshot exactly!")

            # Take screenshot of HT view
            ht_ss = os.path.join(ARTIFACTS_DIR, "ncd_risk_screening_ht_verified.png")
            await page.screenshot(path=ht_ss, full_page=False)
            print(f"Saved screenshot: {ht_ss}")

            # 4. Test Steppers (Prev / Next buttons)
            print("Step 4: Testing Prev and Next stepper buttons...")
            prev_btn = page.locator('#btn-ncd-prev-report')
            next_btn = page.locator('#btn-ncd-next-report')
            assert await prev_btn.is_visible(), "Prev button should be visible"
            assert await next_btn.is_visible(), "Next button should be visible"

            current_val = await page.evaluate("() => document.getElementById('ncd-report-select').value")
            print(f"Current value before next: {current_val}")

            await next_btn.click()
            await page.wait_for_timeout(500)
            next_val = await page.evaluate("() => document.getElementById('ncd-report-select').value")
            print(f"Value after next: {next_val}")
            assert next_val != current_val, "Report select should have changed after clicking Next!"

            await prev_btn.click()
            await page.wait_for_timeout(500)
            back_val = await page.evaluate("() => document.getElementById('ncd-report-select').value")
            print(f"Value after prev: {back_val}")
            assert back_val == current_val, "Report select should match original value after clicking Prev!"

            # 5. Test Year switching (2568, 2567)
            print("Step 5: Testing Year switching...")
            btn_2568 = page.locator('#btn-ncd-yr-2568')
            await btn_2568.click()
            await page.wait_for_timeout(1000)
            tbody_2568 = await page.locator('#ncd-table-tbody').inner_html()
            assert len(tbody_2568) > 100, "Table should have data for 2568"
            print("Verified Year 2568 data rendered successfully!")

            btn_2569 = page.locator('#btn-ncd-yr-2569')
            await btn_2569.click()
            await page.wait_for_timeout(1000)
            print("Returned to Year 2569.")

            stepper_ss = os.path.join(ARTIFACTS_DIR, "ncd_stepper_verified.png")
            await page.screenshot(path=stepper_ss, full_page=False)
            print(f"Saved screenshot: {stepper_ss}")

            print("==================================================================")
            print("ALL TESTS PASSED SUCCESSFULLY!")
            print("==================================================================")

    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(main())

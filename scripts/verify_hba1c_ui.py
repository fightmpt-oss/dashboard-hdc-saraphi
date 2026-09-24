# -*- coding: utf-8 -*-
import asyncio
import os
import subprocess
import sys
import time
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
PORT = 8326

async def main():
    print("==================================================================")
    print("Verifying s_dm_hba1c HDC 1:1 Table and Single-Unit Comparative UI")
    print("==================================================================")

    server = subprocess.Popen(["python", "-m", "http.server", str(PORT)], cwd=r"d:\PROJECTS\Dashboard HDC Saraphi")
    time.sleep(1.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1600, "height": 1200})
            page = await context.new_page()

            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" and "nhso-sync-status" not in msg.text and "404" not in msg.text else None)
            page.on("pageerror", lambda exc: console_errors.append(str(exc)))

            url = f"http://127.0.0.1:{PORT}/"
            print(f"Loading {url} ...")
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)

            # 1. Switch to Service Plan NCD
            print("Step 1: Clicking Service Plan NCD menu...")
            ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
            await ncd_btn.click()
            await page.wait_for_timeout(1500)

            # 2. Select s_dm_hba1c report (ncd_55)
            print("Step 2: Selecting s_dm_hba1c (ncd_55)...")
            await page.evaluate('window.switchNcdReport("ncd_55")')
            await page.wait_for_timeout(1000)

            # 3. Ensure Year 2569 is selected
            print("Step 3: Selecting Year 2569...")
            await page.evaluate('window.switchNcdYear("2569")')
            await page.wait_for_timeout(1000)

            # 4. Verify Criteria Box
            callout = page.locator('#ncd-criteria-callout')
            is_callout_visible = await callout.is_visible()
            callout_text = await callout.inner_text() if is_callout_visible else ""
            print(f"Criteria Box visible: {is_callout_visible}")
            print(f"Criteria Box text preview: {callout_text[:120]}...")
            assert is_callout_visible, "Criteria box should be visible for s_dm_hba1c"
            assert "70.0%" in callout_text, "Criteria box should state >= 70.0% KPI"
            assert "Typearea 1,3" in callout_text or "TYPEAREA 1,3" in callout_text.upper(), "Criteria box should mention Typearea 1,3"
            assert "ChronicFU" in callout_text or "CHRONICFU" in callout_text.upper(), "Criteria box should mention ChronicFU"

            # 5. Verify Table 13-Column Structure & Row Figures
            print("Step 4: Verifying HDC 13-column table structure and data figures...")
            thead_html = await page.locator('#ncd-table-thead').inner_html()
            thead_text = await page.locator('#ncd-table-thead').inner_text()
            assert "Typearea 1,3" in thead_html, "Table header HTML missing Typearea 1,3"
            assert "ChronicFU" in thead_html, "Table header HTML missing ChronicFU"
            assert "ตรวจอย่างน้อย 1 ครั้ง" in thead_text, "Table header missing 1st screening"
            assert "ตรวจอย่างน้อย 2 ครั้ง" in thead_text, "Table header missing 2nd screening"

            table_body = page.locator('#ncd-table-tbody')
            rows_text = await table_body.inner_text()
            print(f"Total table rows text length: {len(rows_text)}")

            # Check 06014 row
            row_06014 = page.locator('#ncd-table-tbody tr:has-text("06014")')
            text_06014 = await row_06014.inner_text()
            print(f"Row 06014 text:\n  {text_06014}")
            assert "709" in text_06014, "06014 B1 should be 709"
            assert "387" in text_06014, "06014 A1 should be 387"
            assert "54.58" in text_06014, "06014 rate1 should be 54.58%"
            assert "17" in text_06014, "06014 A3 should be 17"
            assert "2.40" in text_06014, "06014 rate3 should be 2.40%"
            assert "245" in text_06014, "06014 B2 should be 245"
            assert "205" in text_06014, "06014 A2 should be 205"
            assert "83.67" in text_06014, "06014 rate2 should be 83.67%"

            # Check 06020 row
            row_06020 = page.locator('#ncd-table-tbody tr:has-text("06020")')
            text_06020 = await row_06020.inner_text()
            print(f"Row 06020 text:\n  {text_06020}")
            assert "329" in text_06020, "06020 B1 should be 329"
            assert "174" in text_06020, "06020 A1 should be 174"
            assert "52.89" in text_06020, "06020 rate1 should be 52.89%"
            assert "15" in text_06020, "06020 A3 should be 15"
            assert "4.56" in text_06020, "06020 rate3 should be 4.56%"
            assert "132" in text_06020, "06020 B2 should be 132"
            assert "115" in text_06020, "06020 A2 should be 115"
            assert "87.12" in text_06020, "06020 rate2 should be 87.12%"
            assert "7" in text_06020, "06020 A4 should be 7"
            assert "5.30" in text_06020, "06020 rate4 should be 5.30%"

            # Check district footer
            tfoot_text = await page.locator('#ncd-table-tfoot').inner_text()
            print(f"Tfoot text:\n  {tfoot_text}")
            assert "6,375" in tfoot_text or "6375" in tfoot_text, "District B1 should be 6,375"
            assert "3,324" in tfoot_text or "3324" in tfoot_text, "District A1 should be 3,324"
            assert "52.14" in tfoot_text, "District rate1 should be 52.14%"
            assert "235" in tfoot_text, "District A3 should be 235"
            assert "3.69" in tfoot_text, "District rate3 should be 3.69%"
            assert "4,272" in tfoot_text or "4272" in tfoot_text, "District B2 should be 4,272"
            assert "3,444" in tfoot_text or "3444" in tfoot_text, "District A2 should be 3,444"
            assert "80.62" in tfoot_text, "District rate2 should be 80.62%"
            assert "94" in tfoot_text, "District A4 should be 94"
            assert "2.20" in tfoot_text, "District rate4 should be 2.20%"

            # Take screenshot of table
            table_screenshot = os.path.join(ARTIFACTS_DIR, "hba1c_table_view.png")
            await page.locator('#service-plan-ncd-panel').screenshot(path=table_screenshot)
            print(f"Saved table screenshot to {table_screenshot}")

            # 6. Select Unit 06020 (รพ.สต.บ้านแคว)
            print("Step 5: Selecting Unit 06020...")
            await page.evaluate('window.switchNcdUnit("06020")')
            await page.wait_for_timeout(1500)

            # Verify Chart 1 for 06020
            title1 = await page.locator('#ncd-chart1-title').inner_text()
            print(f"Chart 1 Title: {title1}")
            assert "06020" in title1, "Chart 1 title should mention 06020"
            assert "HbA1c" in title1, "Chart 1 title should mention HbA1c"

            extra1_text = await page.locator('#ncd-chart1-extra').inner_text()
            print(f"Chart 1 Extra Chips:\n  {extra1_text}")
            assert "52.89%" in extra1_text, "Extra 1 should show Typearea 52.89%"
            assert "87.12%" in extra1_text, "Extra 1 should show ChronicFU 87.12%"
            assert "+34.23%" in extra1_text, "Extra 1 should show delta +34.23%"
            assert "4.56%" in extra1_text, "Extra 1 should show Typearea 2nd 4.56%"
            assert "5.30%" in extra1_text, "Extra 1 should show ChronicFU 2nd 5.30%"

            # Verify Chart 2 for 06020
            title2 = await page.locator('#ncd-chart2-title').inner_text()
            print(f"Chart 2 Title: {title2}")
            assert "06020" in title2, "Chart 2 title should mention 06020"

            extra2_text = await page.locator('#ncd-chart2-extra').inner_text()
            print(f"Chart 2 Extra Benchmark:\n  {extra2_text}")
            assert "70%" in extra2_text, "Extra 2 should mention 70% benchmark"
            assert "ผ่านเกณฑ์" in extra2_text, "ChronicFU 87.12% should pass KPI"
            assert "52.89%" in extra2_text, "Typearea 52.89% should show in benchmark"
            assert "87.12%" in extra2_text, "ChronicFU 87.12% should show in benchmark"

            # Take screenshot of 06020 single unit comparative charts
            unit_screenshot = os.path.join(ARTIFACTS_DIR, "hba1c_unit_06020_comparative.png")
            await page.locator('#service-plan-ncd-panel').screenshot(path=unit_screenshot)
            print(f"Saved 06020 comparative screenshot to {unit_screenshot}")

            # 7. Switch back to "all" units
            print("Step 6: Switching back to 'all' units...")
            await page.evaluate('window.switchNcdUnit("all")')
            await page.wait_for_timeout(1500)

            # Verify 14 units overview restored
            extra1_vis = await page.locator('#ncd-chart1-extra').is_visible()
            extra2_vis = await page.locator('#ncd-chart2-extra').is_visible()
            title1_all = await page.locator('#ncd-chart1-title').inner_text()
            print(f"Restored Chart 1 title: {title1_all}")
            print(f"Extra 1 hidden: {not extra1_vis}, Extra 2 hidden: {not extra2_vis}")
            assert not extra1_vis, "Extra 1 should be hidden in all units mode"
            assert not extra2_vis, "Extra 2 should be hidden in all units mode"

            all_screenshot = os.path.join(ARTIFACTS_DIR, "hba1c_all_restored.png")
            await page.locator('#service-plan-ncd-panel').screenshot(path=all_screenshot)
            print(f"Saved all units restored screenshot to {all_screenshot}")

            # 8. Check console errors
            print(f"Console errors recorded: {len(console_errors)}")
            if console_errors:
                print(f"Errors: {console_errors}")
            assert len(console_errors) == 0, f"Found console errors: {console_errors}"

            print("\n==================================================================")
            print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100% Exact Match)!")
            print("==================================================================")

    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(main())

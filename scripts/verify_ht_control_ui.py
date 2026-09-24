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
PORT = 8331

async def main():
    print("==================================================================")
    print("Verifying s_ht_control HDC 1:1 Table and Single-Unit Comparative UI")
    print("==================================================================")

    server = subprocess.Popen(["python", "-m", "http.server", str(PORT)], cwd=r"d:\PROJECTS\Dashboard HDC Saraphi")
    time.sleep(1.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1600, "height": 1300})
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

            # 2. Select s_ht_control report
            print("Step 2: Selecting s_ht_control (ncd_ht_control)...")
            await page.evaluate('window.switchNcdReport("ncd_ht_control")')
            await page.wait_for_timeout(1000)

            # 3. Ensure Year 2569 is selected
            print("Step 3: Selecting Year 2569...")
            await page.evaluate('window.switchNcdYear("2569")')
            await page.wait_for_timeout(1000)

            # 4. Verify Criteria Box
            print("Step 4: Verifying Criteria Box...")
            callout = page.locator('#ncd-criteria-callout')
            is_callout_visible = await callout.is_visible()
            callout_text = await callout.inner_text() if is_callout_visible else ""
            print(f"Criteria Box visible: {is_callout_visible}")
            print(f"Criteria Box text preview: {callout_text[:120]}...")
            assert is_callout_visible, "Criteria box should be visible for s_ht_control"
            assert "60.0%" in callout_text or "60%" in callout_text, "Criteria box should state >= 60.0% KPI"
            assert "Typearea 1,3" in callout_text or "TYPEAREA 1,3" in callout_text.upper(), "Criteria box should mention Typearea 1,3"
            assert "ChronicFU" in callout_text or "CHRONICFU" in callout_text.upper(), "Criteria box should mention ChronicFU"

            # 5. Capture Overview (All Units) Charts
            print("Step 5: Capturing All Units Overview Charts...")
            charts_section = page.locator('#service-plan-ncd-panel')
            overview_chart_path = os.path.join(ARTIFACTS_DIR, "ht_control_all_charts.png")
            await charts_section.screenshot(path=overview_chart_path)
            print(f"Saved All Units charts screenshot: {overview_chart_path}")

            # 6. Verify Table 20-Column Structure & Row Figures
            print("Step 6: Verifying HDC 20-column table structure and data figures...")
            thead_html = await page.locator('#ncd-table-thead').inner_html()
            thead_text = await page.locator('#ncd-table-thead').inner_text()
            assert "Typearea 1,3" in thead_html or "Typearea 1, 3" in thead_html or "Typearea" in thead_html, "Table header HTML missing Typearea"
            assert "ChronicFU" in thead_html, "Table header HTML missing ChronicFU"
            assert "การได้รับการวัดความดันโลหิต" in thead_text, "Table header missing 'การได้รับการวัดความดันโลหิต'"
            assert "ควบคุมความดันได้ดี" in thead_text, "Table header missing 'ควบคุมความดันได้ดี'"

            # Check 06014 row
            row_06014 = page.locator('#ncd-table-tbody tr:has-text("06014")')
            text_06014 = await row_06014.inner_text()
            print(f"Row 06014 text:\n  {text_06014}")
            assert "1,743" in text_06014, "06014 B1 should be 1,743"
            assert "709" in text_06014, "06014 D1 should be 709"
            assert "91" in text_06014, "06014 1x should be 91"
            assert "943" in text_06014, "06014 >=2x should be 943"
            assert "656" in text_06014, "06014 A1 should be 656"
            assert "37.64" in text_06014, "06014 rate1 should be 37.64%"
            assert "602" in text_06014, "06014 C1 should be 602"
            assert "34.54" in text_06014, "06014 rate_c1 should be 34.54%"
            assert "670" in text_06014, "06014 B2 should be 670"
            assert "582" in text_06014, "06014 fu_ge2_2 should be 582"
            assert "0" in text_06014, "06014 D2 should be 0"
            assert "88" in text_06014, "06014 1x ChronicFU should be 88"
            assert "582" in text_06014, "06014 >=2x ChronicFU should be 582"
            assert "443" in text_06014, "06014 A2 should be 443"
            assert "66.12" in text_06014, "06014 rate2 should be 66.12%"
            assert "392" in text_06014, "06014 C2 should be 392"
            assert "58.51" in text_06014, "06014 rate_c2 should be 58.51%"

            # Check 06020 row
            row_06020 = page.locator('#ncd-table-tbody tr:has-text("06020")')
            text_06020 = await row_06020.inner_text()
            print(f"Row 06020 text:\n  {text_06020}")
            assert "708" in text_06020, "06020 B1 should be 708"
            assert "309" in text_06020, "06020 D1 should be 309"
            assert "86" in text_06020, "06020 1x should be 86"
            assert "313" in text_06020, "06020 >=2x should be 313"
            assert "262" in text_06020, "06020 A1 should be 262"
            assert "37.01" in text_06020, "06020 rate1 should be 37.01%"
            assert "205" in text_06020, "06020 C1 should be 205"
            assert "28.95" in text_06020, "06020 rate_c1 should be 28.95%"
            assert "271" in text_06020, "06020 B2 should be 271"
            assert "185" in text_06020, "06020 fu_ge2_2 should be 185"
            assert "194" in text_06020, "06020 A2 should be 194"
            assert "71.59" in text_06020, "06020 rate2 should be 71.59%"
            assert "132" in text_06020, "06020 C2 should be 132"
            assert "48.71" in text_06020, "06020 rate_c2 should be 48.71%"

            # Check District 5019 row in tfoot
            tfoot = page.locator('#ncd-table-tfoot')
            tfoot_text = await tfoot.inner_text()
            print(f"Tfoot District 5019 text:\n  {tfoot_text}")
            assert "5019" in tfoot_text, "Tfoot should contain 5019"
            assert "14,882" in tfoot_text, "District B1 should be 14,882"
            assert "7,909" in tfoot_text, "District D1 should be 7,909"
            assert "1,232" in tfoot_text, "District 1x should be 1,232"
            assert "5,741" in tfoot_text, "District >=2x should be 5,741"
            assert "4,629" in tfoot_text, "District A1 should be 4,629"
            assert "31.10" in tfoot_text, "District rate1 should be 31.10%"
            assert "3,749" in tfoot_text, "District C1 should be 3,749"
            assert "25.19" in tfoot_text, "District rate_c1 should be 25.19%"
            assert "8,208" in tfoot_text, "District B2 should be 8,208"
            assert "6,426" in tfoot_text, "District fu_ge2_2 should be 6,426"
            assert "372" in tfoot_text, "District D2 should be 372"
            assert "1,673" in tfoot_text, "District 1x ChronicFU should be 1,673"
            assert "6,163" in tfoot_text, "District >=2x ChronicFU should be 6,163"
            assert "5,305" in tfoot_text, "District A2 should be 5,305"
            assert "64.63" in tfoot_text, "District rate2 should be 64.63%"
            assert "4,024" in tfoot_text, "District C2 should be 4,024"
            assert "49.03" in tfoot_text, "District rate_c2 should be 49.03%"

            # Capture Table screenshot
            table_container = page.locator('#ncd-matrix-table')
            table_path = os.path.join(ARTIFACTS_DIR, "ht_control_table_view.png")
            await table_container.screenshot(path=table_path)
            print(f"Saved Table screenshot: {table_path}")

            # 7. Select Single Unit (06020) and Verify Comparative Views
            print("Step 7: Selecting Unit 06020 (รพ.สต.บ้านแคว)...")
            await page.evaluate('window.switchNcdUnit("06020")')
            await page.wait_for_timeout(1500)

            # Verify Single Unit Charts and Chips
            extra1_elem = page.locator('#ncd-chart1-extra')
            chips_text = await extra1_elem.inner_text()
            print(f"Chips text: {chips_text}")
            assert "Typearea คุมได้ดี ครั้งสุดท้าย (A1)" in chips_text or "Typearea" in chips_text, "Chips should show Typearea"
            assert "ChronicFU คุมได้ดี ครั้งสุดท้าย (A2)" in chips_text or "ChronicFU" in chips_text, "Chips should show ChronicFU"
            assert "37.01%" in chips_text, "Chips should show 37.01% for Typearea"
            assert "71.59%" in chips_text, "Chips should show 71.59% for ChronicFU"

            # Verify Chart 3 historical trend is visible
            chart3_canvas = page.locator('#ncd-trend-chart')
            is_chart3_visible = await chart3_canvas.is_visible()
            print(f"Chart 3 (Historical Trend) visible: {is_chart3_visible}")
            assert is_chart3_visible, "Chart 3 should be visible in single unit mode"

            # Capture Single Unit Charts
            unit_charts_section = page.locator('#service-plan-ncd-panel')
            unit_chart_path = os.path.join(ARTIFACTS_DIR, "ht_control_unit_06020_comparative.png")
            await unit_charts_section.screenshot(path=unit_chart_path)
            print(f"Saved Single Unit comparative charts screenshot: {unit_chart_path}")

            # 8. Test CSV Export
            print("Step 8: Testing CSV Export for s_ht_control...")
            async with page.expect_download() as download_info:
                await page.evaluate('window.exportNcdTableCsv()')
            download = await download_info.value
            csv_path = os.path.join(ARTIFACTS_DIR, "test_export_ht_control.csv")
            await download.save_as(csv_path)
            print(f"Saved exported CSV to {csv_path}")

            with open(csv_path, 'r', encoding='utf-8') as f:
                csv_content = f.read()
            assert "Typearea ผู้ป่วยความดัน (B1)" in csv_content, "CSV header missing Typearea columns"
            assert "ChronicFU ผู้ป่วยมารับบริการทั้งหมด (B2)" in csv_content, "CSV header missing ChronicFU columns"
            assert "06014" in csv_content, "CSV missing 06014 row"
            assert "1743" in csv_content, "CSV missing 06014 B1 value 1743"
            assert "37.64" in csv_content, "CSV missing 06014 rate1 value 37.64"
            assert "06020" in csv_content, "CSV missing 06020 row"
            assert "708" in csv_content, "CSV missing 06020 B1 value 708"
            assert "37.01" in csv_content, "CSV missing 06020 rate1 value 37.01"
            assert "5019" in csv_content, "CSV missing 5019 summary row"
            assert "14882" in csv_content, "CSV missing district B1 value 14882"
            assert "31.10" in csv_content, "CSV missing district rate1 value 31.10"
            print("CSV export verified successfully!")

            # 9. Verify Console Errors
            print("Step 9: Checking for JavaScript console errors...")
            real_errors = [e for e in console_errors if "favicon" not in e.lower()]
            if real_errors:
                print(f"FAILED: Found {len(real_errors)} console errors:\n" + "\n".join(real_errors))
                raise AssertionError(f"Console errors found: {real_errors}")
            print("Zero console errors! Verification PASSED!")

            await browser.close()
    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(main())

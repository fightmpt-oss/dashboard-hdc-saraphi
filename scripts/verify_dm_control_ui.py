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
PORT = 8329

async def main():
    print("==================================================================")
    print("Verifying s_dm_control HDC 1:1 Table and Single-Unit Comparative UI")
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

            # 2. Select s_dm_control report
            print("Step 2: Selecting s_dm_control (ncd_dm_control)...")
            await page.evaluate('window.switchNcdReport("ncd_dm_control")')
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
            assert is_callout_visible, "Criteria box should be visible for s_dm_control"
            assert "40.0%" in callout_text or "40%" in callout_text, "Criteria box should state >= 40.0% KPI"
            assert "Typearea 1,3" in callout_text or "TYPEAREA 1,3" in callout_text.upper(), "Criteria box should mention Typearea 1,3"
            assert "ChronicFU" in callout_text or "CHRONICFU" in callout_text.upper(), "Criteria box should mention ChronicFU"

            # 5. Capture Overview (All Units) Charts
            print("Step 5: Capturing All Units Overview Charts...")
            charts_section = page.locator('#service-plan-ncd-panel')
            overview_chart_path = os.path.join(ARTIFACTS_DIR, "dm_control_all_charts.png")
            await charts_section.screenshot(path=overview_chart_path)
            print(f"Saved All Units charts screenshot: {overview_chart_path}")

            # 6. Verify Table 21-Column Structure & Row Figures
            print("Step 6: Verifying HDC 21-column table structure and data figures...")
            thead_html = await page.locator('#ncd-table-thead').inner_html()
            thead_text = await page.locator('#ncd-table-thead').inner_text()
            assert "Typearea 1,3" in thead_html or "Typearea 1, 3" in thead_html or "Typearea" in thead_html, "Table header HTML missing Typearea"
            assert "ChronicFU" in thead_html, "Table header HTML missing ChronicFU"
            assert "ไม่มีโรคร่วม" in thead_text, "Table header missing 'ไม่มีโรคร่วม'"
            assert "ควบคุมได้ดี (A1)" in thead_text or "ควบคุมได้ดี" in thead_text, "Table header missing 'ควบคุมได้ดี'"

            # Check 06014 row
            row_06014 = page.locator('#ncd-table-tbody tr:has-text("06014")')
            text_06014 = await row_06014.inner_text()
            print(f"Row 06014 text:\n  {text_06014}")
            assert "709" in text_06014, "06014 B1 should be 709"
            assert "387" in text_06014, "06014 hba1c1 should be 387"
            assert "203" in text_06014, "06014 A1 should be 203"
            assert "28.63" in text_06014, "06014 rate1 should be 28.63%"
            assert "663" in text_06014, "06014 D1 should be 663"
            assert "184" in text_06014, "06014 C1 should be 184"
            assert "27.75" in text_06014, "06014 rate_c1 should be 27.75%"
            assert "245" in text_06014, "06014 B2 should be 245"
            assert "115" in text_06014, "06014 A2 should be 115"
            assert "46.94" in text_06014, "06014 rate2 should be 46.94%"
            assert "240" in text_06014, "06014 D2 should be 240"
            assert "112" in text_06014, "06014 C2 should be 112"
            assert "46.67" in text_06014, "06014 rate_c2 should be 46.67%"

            # Check 06020 row
            row_06020 = page.locator('#ncd-table-tbody tr:has-text("06020")')
            text_06020 = await row_06020.inner_text()
            print(f"Row 06020 text:\n  {text_06020}")
            assert "329" in text_06020, "06020 B1 should be 329"
            assert "174" in text_06020, "06020 hba1c1 should be 174"
            assert "51" in text_06020, "06020 A1 should be 51"
            assert "15.50" in text_06020, "06020 rate1 should be 15.50%"
            assert "313" in text_06020, "06020 D1 should be 313"
            assert "45" in text_06020, "06020 C1 should be 45"
            assert "14.38" in text_06020, "06020 rate_c1 should be 14.38%"
            assert "132" in text_06020, "06020 B2 should be 132"
            assert "115" in text_06020, "06020 hba1c2 should be 115"
            assert "22" in text_06020, "06020 A2 should be 22"
            assert "16.67" in text_06020, "06020 rate2 should be 16.67%"
            assert "130" in text_06020, "06020 D2 should be 130"
            assert "113" in text_06020, "06020 hba1c_no_com2 should be 113"
            assert "22" in text_06020, "06020 C2 should be 22"
            assert "16.92" in text_06020, "06020 rate_c2 should be 16.92%"

            # Check District 5019 row in tfoot
            tfoot = page.locator('#ncd-table-tfoot')
            tfoot_text = await tfoot.inner_text()
            print(f"Tfoot District 5019 text:\n  {tfoot_text}")
            assert "5019" in tfoot_text, "Tfoot should contain 5019"
            assert "6,375" in tfoot_text, "District B1 should be 6,375"
            assert "3,324" in tfoot_text, "District hba1c1 should be 3,324"
            assert "1,553" in tfoot_text, "District A1 should be 1,553"
            assert "24.36" in tfoot_text, "District rate1 should be 24.36%"
            assert "6,091" in tfoot_text, "District D1 should be 6,091"
            assert "3,177" in tfoot_text, "District hba1c_no_com1 should be 3,177"
            assert "1,455" in tfoot_text, "District C1 should be 1,455"
            assert "23.89" in tfoot_text, "District rate_c1 should be 23.89%"
            assert "4,272" in tfoot_text, "District B2 should be 4,272"
            assert "3,444" in tfoot_text, "District hba1c2 should be 3,444"
            assert "1,616" in tfoot_text, "District A2 should be 1,616"
            assert "37.83" in tfoot_text, "District rate2 should be 37.83%"
            assert "4,077" in tfoot_text, "District D2 should be 4,077"
            assert "3,297" in tfoot_text, "District hba1c_no_com2 should be 3,297"
            assert "1,520" in tfoot_text, "District C2 should be 1,520"
            assert "37.28" in tfoot_text, "District rate_c2 should be 37.28%"

            # Capture Table screenshot
            table_container = page.locator('#ncd-matrix-table')
            table_path = os.path.join(ARTIFACTS_DIR, "dm_control_table_view.png")
            await table_container.screenshot(path=table_path)
            print(f"Saved Table screenshot: {table_path}")

            # 7. Select Single Unit (06020) and Verify Comparative Views
            print("Step 7: Selecting unit 06020 to verify comparative charts & 3-year historical trend...")
            await page.evaluate('window.switchNcdUnit("06020")')
            await page.wait_for_timeout(1500)

            unit_charts_section = page.locator('#service-plan-ncd-panel')
            unit_chart_path = os.path.join(ARTIFACTS_DIR, "dm_control_unit_06020_comparative.png")
            await unit_charts_section.screenshot(path=unit_chart_path)
            print(f"Saved Unit 06020 comparative charts screenshot: {unit_chart_path}")

            # Verify Chart 3 historical section is present
            chart3_canvas = page.locator('#ncd-trend-chart')
            is_chart3_visible = await chart3_canvas.is_visible()
            print(f"Chart 3 (Historical Trend) visible: {is_chart3_visible}")
            assert is_chart3_visible, "Chart 3 should be visible in single unit mode"

            # 8. Test CSV Export
            print("Step 8: Testing CSV export...")
            async with page.expect_download() as download_info:
                await page.evaluate('window.exportNcdTableCsv()')
            download = await download_info.value
            download_path = os.path.join(ARTIFACTS_DIR, "test_export_dm_control.csv")
            await download.save_as(download_path)
            with open(download_path, "r", encoding="utf-8-sig") as f:
                csv_lines = f.readlines()
            print(f"CSV exported successfully, total lines: {len(csv_lines)}")
            assert any("Typearea ผู้ป่วยเบาหวาน (B1)" in line for line in csv_lines), "CSV header should contain Typearea (B1)"
            assert any("ChronicFU ผู้ป่วยเบาหวาน (B2)" in line for line in csv_lines), "CSV header should contain ChronicFU (B2)"
            assert any("6375" in line or "6,375" in line for line in csv_lines), "CSV footer should contain district total 6375"

            print("\n-------------------------------------------------------------")
            print("ALL VERIFICATION CHECKS PASSED PERFECTLY!")
            print(f"Console errors: {console_errors}")
            print("-------------------------------------------------------------")

            await browser.close()
    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(main())

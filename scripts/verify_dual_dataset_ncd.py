import asyncio
import os
import subprocess
import time
from playwright.async_api import async_playwright

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
PORT = 8299

async def main():
    print("==================================================================")
    print("Verifying Dual Dataset (Typearea 1,3 vs ChronicFU) in Service Plan NCD")
    print("==================================================================")

    # Start local HTTP server
    server = subprocess.Popen(["python", "-m", "http.server", str(PORT)], cwd=r"d:\PROJECTS\Dashboard HDC Saraphi")
    time.sleep(1.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1600, "height": 1100})
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

            # 2. Select report s_dm_ckd1 (ncd_07)
            print("Step 2: Selecting s_dm_ckd1 (ncd_07: ร้อยละของผู้ป่วยเบาหวานได้รับการตรวจภาวะแทรกซ้อนทางไต)...")
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_07';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1500)

            # 3. Check if #ncd-dataset-mode-bar is visible
            mode_bar = page.locator('#ncd-dataset-mode-bar')
            is_mode_bar_visible = await mode_bar.is_visible()
            print(f"Step 3: #ncd-dataset-mode-bar visible: {is_mode_bar_visible}")
            assert is_mode_bar_visible, "Expected #ncd-dataset-mode-bar to be visible for s_dm_ckd1!"

            # 4. Verify table headers (Dual group)
            thead_text = await page.locator('#ncd-table-thead').inner_text()
            print(f"Thead text snippet:\n{thead_text}")
            assert "typearea 1,3" in thead_text.lower()
            assert "chronicfu" in thead_text.lower()
            assert "B1" in thead_text or "b1" in thead_text.lower()
            assert "B2" in thead_text or "b2" in thead_text.lower()

            # 5. Check Table row for 06014 (ยางเนิ้ง)
            print("Step 4: Checking numbers for 06014 (ยางเนิ้ง)...")
            row_06014 = await page.evaluate("""() => {
                const trs = document.querySelectorAll('#ncd-table-tbody tr');
                for (const tr of trs) {
                    if (tr.innerText.includes('06014')) {
                        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
                        return tds;
                    }
                }
                return null;
            }""")
            print(f"06014 Row: {row_06014}")
            # Target (B1): 709, Result (A1): 106, Rate1: 14.95, Result1: 103, Result2: 8
            # Target (B2): 236, Result (A2): 5, Rate2: 2.12, Result1_fu: 5, Result2_fu: 3
            assert "709" in row_06014, f"Expected 709 in B1 for 06014, got {row_06014}"
            assert "106" in row_06014, f"Expected 106 in A1 for 06014, got {row_06014}"
            assert "14.95" in row_06014, f"Expected 14.95 in Rate1 for 06014, got {row_06014}"
            assert "236" in row_06014, f"Expected 236 in B2 for 06014, got {row_06014}"
            assert "2.12" in row_06014, f"Expected 2.12 in Rate2 for 06014, got {row_06014}"

            # 6. Check Table row for 06020 (บ้านแคว)
            print("Step 5: Checking numbers for 06020 (บ้านแคว)...")
            row_06020 = await page.evaluate("""() => {
                const trs = document.querySelectorAll('#ncd-table-tbody tr');
                for (const tr of trs) {
                    if (tr.innerText.includes('06020')) {
                        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
                        return tds;
                    }
                }
                return null;
            }""")
            print(f"06020 Row: {row_06020}")
            # 329 / 142 / 43.16 / 140 / 6 || 132 / 106 / 80.30 / 105 / 1
            assert "329" in row_06020
            assert "142" in row_06020
            assert "43.16" in row_06020
            assert "132" in row_06020
            assert "106" in row_06020
            assert "80.30" in row_06020

            # 7. Check District TFoot Row
            print("Step 6: Checking District Total (tfoot)...")
            tfoot_text = await page.locator('#ncd-table-tfoot').inner_text()
            print(f"District Foot:\n{tfoot_text}")
            assert "6,375" in tfoot_text
            assert "1,519" in tfoot_text
            assert "23.83" in tfoot_text
            assert "3,802" in tfoot_text
            assert "1,531" in tfoot_text
            assert "40.27" in tfoot_text

            # 8. Screenshot 1: Dual dataset table matching user's image
            await page.evaluate("""() => {
                const el = document.getElementById('ncd-matrix-table');
                if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }""")
            await page.wait_for_timeout(500)
            ss_table = os.path.join(ARTIFACTS_DIR, "ncd_dual_dataset_table_verified.png")
            await page.screenshot(path=ss_table, full_page=False)
            print(f"Saved Screenshot: {ss_table}")

            # 9. Test Dataset Mode: Compare Mode
            print("Step 7: Switching to 'Compare (เปรียบเทียบ 2 กลุ่ม)' mode...")
            await page.click('#btn-ncd-mode-compare')
            await page.wait_for_timeout(1000)

            # Scroll to charts and KPI cards
            await page.evaluate("""() => {
                const el = document.getElementById('ncd-dataset-mode-bar');
                if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }""")
            await page.wait_for_timeout(500)
            ss_compare = os.path.join(ARTIFACTS_DIR, "ncd_dual_dataset_compare_mode.png")
            await page.screenshot(path=ss_compare, full_page=False)
            print(f"Saved Screenshot: {ss_compare}")

            # 10. Test Dataset Mode: ChronicFU Mode
            print("Step 8: Switching to 'ChronicFU (ผู้มารับบริการจริง)' mode...")
            await page.click('#btn-ncd-mode-chronicfu')
            await page.wait_for_timeout(1000)

            # Verify KPI card 1 shows ChronicFU result (1,531)
            kpi_res = await page.locator('#ncd-kpi-result').inner_text()
            kpi_target = await page.locator('#ncd-kpi-target').inner_text()
            kpi_rate = await page.locator('#ncd-kpi-rate').inner_text()
            print(f"ChronicFU Mode District KPIs -> Result: {kpi_res}, Target: {kpi_target}, Rate: {kpi_rate}%")
            assert "1,531" in kpi_res
            assert "3,802" in kpi_target
            assert "40.27" in kpi_rate

            ss_chronicfu = os.path.join(ARTIFACTS_DIR, "ncd_dual_dataset_chronicfu_mode.png")
            await page.screenshot(path=ss_chronicfu, full_page=False)
            print(f"Saved Screenshot: {ss_chronicfu}")

            # 11. Test non-FU report gracefully hides mode bar (e.g. s_dm_screen)
            print("Step 9: Selecting s_dm_screen (non-FU report) to verify graceful fallback...")
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_22'; // s_dm_screen
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1000)

            mode_bar_visible_dm_screen = await mode_bar.is_visible()
            print(f"Mode bar visible for s_dm_screen: {mode_bar_visible_dm_screen}")
            assert not mode_bar_visible_dm_screen, "Expected mode bar to be hidden for non-FU report!"

            print("==================================================================")
            print("ALL VERIFICATIONS PASSED 100%! DUAL DATASETS ARE FULLY FUNCTIONAL!")
            print("==================================================================")

            await browser.close()
    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(main())

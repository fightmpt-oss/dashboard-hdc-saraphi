import asyncio
import os
import sys
import threading
import http.server
import socketserver
from playwright.async_api import async_playwright

PORT = 8765
DIRECTORY = r"d:\PROJECTS\Dashboard HDC Saraphi"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass # suppress server logs

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

async def run_tests():
    # Start local server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    await asyncio.sleep(1)

    artifacts_dir = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1600, 'height': 1050})
        page = await context.new_page()

        # Capture console errors
        errors = []
        page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))
        page.on("console", lambda msg: print(f"Browser Console [{msg.type}]: {msg.text}") if msg.type in ['error', 'warning'] else None)

        print(f"Navigating to http://localhost:{PORT}/index.html ...")
        await page.goto(f"http://localhost:{PORT}/index.html", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # 1. Verify Sidebar Item exists
        ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
        assert await ncd_btn.count() > 0, "Service Plan NCD sidebar button not found!"
        print("PASS: Service Plan NCD sidebar button found.")

        # 2. Click Service Plan NCD button
        await ncd_btn.click()
        await page.wait_for_timeout(1500)

        # 3. Verify Panel is visible
        panel = page.locator('#service-plan-ncd-panel')
        is_hidden = await panel.evaluate("el => el.classList.contains('hidden')")
        assert not is_hidden, "service-plan-ncd-panel is still hidden!"
        print("PASS: service-plan-ncd-panel is visible.")

        # 4. Check Default Indicator KPIs (s_dm_screen 2569)
        kpi_result = await page.locator('#ncd-kpi-result').inner_text()
        kpi_target = await page.locator('#ncd-kpi-target').inner_text()
        kpi_rate = await page.locator('#ncd-kpi-rate').inner_text()
        top_unit = await page.locator('#ncd-kpi-top-unit').inner_text()
        print(f"KPI 2569 District -> Result: {kpi_result}, Target: {kpi_target}, Rate: {kpi_rate}%, Top Unit: {top_unit}")

        assert "34,794" in kpi_result, f"Expected 34,794 but got {kpi_result}"
        assert "37,313" in kpi_target, f"Expected 37,313 but got {kpi_target}"
        assert "93.25" in kpi_rate, f"Expected 93.25 but got {kpi_rate}"
        print("PASS: District KPIs match verified HDC numbers (34,794 / 37,313 = 93.25%).")

        # Take screenshot 1: Overview Panel
        ss1_path = os.path.join(artifacts_dir, "ncd_dashboard_overview_2569.png")
        await page.screenshot(path=ss1_path, full_page=False)
        print(f"Saved screenshot: {ss1_path}")

        # 5. Check Table Footer Total
        tfoot = await page.locator('#ncd-table-tfoot').inner_text()
        print(f"Table Footer -> {tfoot.replace(chr(10), ' ')}")
        assert "34,794" in tfoot, "Table footer missing 34,794"
        assert "37,313" in tfoot, "Table footer missing 37,313"
        print("PASS: Table footer has correct total.")

        # 6. Test Switching Year to 2568
        btn_2568 = page.locator('#btn-ncd-yr-2568')
        await btn_2568.click()
        await page.wait_for_timeout(1000)
        res_68 = await page.locator('#ncd-kpi-result').inner_text()
        tgt_68 = await page.locator('#ncd-kpi-target').inner_text()
        rate_68 = await page.locator('#ncd-kpi-rate').inner_text()
        print(f"KPI 2568 District -> Result: {res_68}, Target: {tgt_68}, Rate: {rate_68}%")
        assert "30,714" in res_68, f"Expected 30,714 in 2568 but got {res_68}"
        assert "37,244" in tgt_68, f"Expected 37,244 in 2568 but got {tgt_68}"
        print("PASS: Year 2568 KPIs match verified numbers.")

        # 7. Test Switching Year back to 2569
        await page.locator('#btn-ncd-yr-2569').click()
        await page.wait_for_timeout(800)

        # 8. Test Filtering by Unit (Select 06020 รพ.สต.บ้านแคว)
        unit_select = page.locator('#ncd-unit-select')
        await unit_select.select_option('06020')
        await page.wait_for_timeout(1000)
        u_res = await page.locator('#ncd-kpi-result').inner_text()
        u_tgt = await page.locator('#ncd-kpi-target').inner_text()
        u_rate = await page.locator('#ncd-kpi-rate').inner_text()
        print(f"KPI 06020 (บ้านแคว) -> Result: {u_res}, Target: {u_tgt}, Rate: {u_rate}%")
        assert "1,383" in u_res, f"Expected 1,383 for 06020 but got {u_res}"
        assert "1,477" in u_tgt, f"Expected 1,477 for 06020 but got {u_tgt}"
        print("PASS: Unit 06020 KPIs match verified numbers (1,383 / 1,477 = 93.64%).")

        # Take screenshot 2: Unit 06020 view
        ss2_path = os.path.join(artifacts_dir, "ncd_dashboard_unit_06020.png")
        await page.screenshot(path=ss2_path, full_page=False)
        print(f"Saved screenshot: {ss2_path}")

        # 9. Test Category Pills Filtering (e.g. HT)
        await page.locator('#ncd-btn-reset').click()
        await page.wait_for_timeout(800)
        ht_btn = page.locator('button[data-cat="HT"]')
        await ht_btn.click()
        await page.wait_for_timeout(1000)
        opt_count = await page.locator('#ncd-report-select option').count()
        print(f"HT Category Filtered Reports Count: {opt_count}")
        assert opt_count == 26, f"Expected 26 HT reports, got {opt_count}"
        print("PASS: HT category filtering works (26 reports).")

        # Take screenshot 3: Category filter view
        ss3_path = os.path.join(artifacts_dir, "ncd_dashboard_ht_category.png")
        await page.screenshot(path=ss3_path, full_page=False)
        print(f"Saved screenshot: {ss3_path}")

        # 10. Scroll down to HDC Table & take screenshot 4
        await page.locator('#ncd-btn-reset').click()
        await page.wait_for_timeout(800)
        await page.locator('#ncd-table-header-title').scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        ss4_path = os.path.join(artifacts_dir, "ncd_dashboard_table.png")
        await page.screenshot(path=ss4_path, full_page=False)
        print(f"Saved screenshot: {ss4_path}")

        # Check for any uncaught page errors
        if errors:
            print("ERROR: Uncaught page errors detected:")
            for e in errors:
                print("  ", e)
            sys.exit(1)
        else:
            print("ALL PLAYWRIGHT TESTS PASSED WITH 0 ERRORS!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_tests())

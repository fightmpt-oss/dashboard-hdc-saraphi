# -*- coding: utf-8 -*-
import asyncio
import os
import sys
import time
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
VERCEL_URL = "https://dashboard-hdc-saraphi.vercel.app/"

async def main():
    print("==================================================================")
    print("Verifying Live Production Vercel: s_dm_control HDC 1:1 & Comparative UI")
    print(f"Target URL: {VERCEL_URL}")
    print("==================================================================")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1600, "height": 1200})
        page = await context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" and "nhso-sync-status" not in msg.text and "404" not in msg.text else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        # Cache buster to ensure latest CDN deployment
        url_with_ts = f"{VERCEL_URL}?t={int(time.time())}"
        print(f"Loading {url_with_ts} ...")
        await page.goto(url_with_ts, wait_until="networkidle", timeout=45000)
        await page.wait_for_timeout(3000)

        # 1. Switch to Service Plan NCD
        print("Step 1: Clicking Service Plan NCD menu...")
        ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
        await ncd_btn.click()
        await page.wait_for_timeout(2000)

        # 2. Select s_dm_control report (ncd_dm_control)
        print("Step 2: Selecting s_dm_control (ncd_dm_control)...")
        await page.evaluate('window.switchNcdReport("ncd_dm_control")')
        await page.wait_for_timeout(1500)

        # 3. Ensure Year 2569 is selected
        print("Step 3: Selecting Year 2569...")
        await page.evaluate('window.switchNcdYear("2569")')
        await page.wait_for_timeout(1500)

        # 4. Verify Criteria Box
        callout = page.locator('#ncd-criteria-callout')
        is_callout_visible = await callout.is_visible()
        callout_text = await callout.inner_text() if is_callout_visible else ""
        print(f"Criteria Box visible: {is_callout_visible}")
        print(f"Criteria Box text preview: {callout_text[:120]}...")
        assert is_callout_visible, "Criteria box should be visible for s_dm_control"
        assert "40.0%" in callout_text, "Criteria box should state >= 40.0% KPI"

        # 5. Verify All Units Overview Charts
        print("Step 5: Capturing Live Vercel All Units Overview Charts...")
        chart1 = page.locator('#ncd-unit-rate-chart')
        chart2 = page.locator('#ncd-unit-compare-chart')
        assert await chart1.is_visible(), "Chart 1 should be visible"
        assert await chart2.is_visible(), "Chart 2 should be visible"
        
        charts_sec = page.locator('#service-plan-ncd-panel')
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "vercel_live_dm_control_charts.png"), full_page=False)

        # 6. Verify HDC 21-column Table Structure & Figures
        print("Step 6: Verifying Live Vercel HDC 21-column table structure and data figures...")
        table = page.locator('#ncd-matrix-table')
        assert await table.is_visible(), "Matrix table should be visible"

        # Check column count in table tbody
        td_count = await table.locator('tbody tr').first.locator('td').count()
        print(f"Table columns in first tbody row: {td_count} (Expected 21)")
        assert td_count == 21, f"Expected 21 table columns, got {td_count}"

        # Verify unit 06014 row
        row_06014 = table.locator('tbody tr:has-text("06014")')
        row_06014_text = await row_06014.inner_text()
        print(f"Row 06014 text:\n  {row_06014_text}")
        assert "709" in row_06014_text, "Unit 06014 B1 should be 709"
        assert "54.58" in row_06014_text, "Unit 06014 rate_hba1c1 should be 54.58"
        assert "203" in row_06014_text, "Unit 06014 A1 should be 203"
        assert "28.63" in row_06014_text, "Unit 06014 rate1 should be 28.63"

        # Verify unit 06020 row
        row_06020 = table.locator('tbody tr:has-text("06020")')
        row_06020_text = await row_06020.inner_text()
        print(f"Row 06020 text:\n  {row_06020_text}")
        assert "329" in row_06020_text, "Unit 06020 B1 should be 329"
        assert "51" in row_06020_text, "Unit 06020 A1 should be 51"
        assert "15.50" in row_06020_text, "Unit 06020 rate1 should be 15.50"
        assert "313" in row_06020_text, "Unit 06020 D1 should be 313"
        assert "45" in row_06020_text, "Unit 06020 C1 should be 45"
        assert "14.38" in row_06020_text, "Unit 06020 rate_c1 should be 14.38"

        # Verify tfoot District 5019 total
        tfoot = table.locator('tfoot tr')
        tfoot_text = await tfoot.inner_text()
        print(f"Tfoot District 5019 text:\n  {tfoot_text}")
        assert "6,375" in tfoot_text, "District B1 should be 6,375"
        assert "1,553" in tfoot_text, "District A1 should be 1,553"
        assert "24.36" in tfoot_text, "District rate1 should be 24.36"
        assert "6,091" in tfoot_text, "District D1 should be 6,091"
        assert "1,455" in tfoot_text, "District C1 should be 1,455"
        assert "23.89" in tfoot_text, "District rate_c1 should be 23.89"

        # Capture table view
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "vercel_live_dm_control_table.png"), full_page=False)

        # 7. Select unit 06020 to verify single-unit comparative view
        print("Step 7: Selecting unit 06020 on Live Vercel to verify comparative charts...")
        await page.evaluate('window.switchNcdUnit("06020")')
        await page.wait_for_timeout(1500)
        
        await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "vercel_live_dm_control_unit_06020.png"), full_page=False)

        # Verify historical trend chart exists and is visible
        trend_chart = page.locator('#ncd-trend-chart')
        is_trend_visible = await trend_chart.is_visible()
        print(f"Chart 3 (Historical Trend) visible: {is_trend_visible}")
        assert is_trend_visible, "Historical trend chart should be visible for single unit"

        print("\n-------------------------------------------------------------")
        print("ALL VERCEL LIVE PRODUCTION CHECKS PASSED PERFECTLY!")
        print(f"Console errors: {console_errors}")
        print("-------------------------------------------------------------\n")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

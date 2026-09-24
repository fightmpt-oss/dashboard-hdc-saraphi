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
    print("Verifying Live Production Vercel: s_dm_hba1c HDC 1:1 & Comparative UI")
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

        # 2. Select s_dm_hba1c report (ncd_55)
        print("Step 2: Selecting s_dm_hba1c (ncd_55)...")
        await page.evaluate('window.switchNcdReport("ncd_55")')
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
        assert is_callout_visible, "Criteria box should be visible for s_dm_hba1c"
        assert "70.0%" in callout_text, "Criteria box should state >= 70.0% KPI"

        # 5. Verify Table 13-Column Structure & Row Figures
        print("Step 4: Verifying HDC 13-column table structure and data figures...")
        thead_html = await page.locator('#ncd-table-thead').inner_html()
        thead_text = await page.locator('#ncd-table-thead').inner_text()
        assert "Typearea 1,3" in thead_html, "Table header HTML missing Typearea 1,3"
        assert "ChronicFU" in thead_html, "Table header HTML missing ChronicFU"

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

        # Check District Total row
        tfoot_text = await page.locator('#ncd-table-tfoot').inner_text()
        print(f"Tfoot text:\n  {tfoot_text}")
        assert "6,375" in tfoot_text or "6375" in tfoot_text, "District B1 should be 6,375"
        assert "3,324" in tfoot_text or "3324" in tfoot_text, "District A1 should be 3,324"
        assert "52.14" in tfoot_text, "District rate1 should be 52.14%"
        assert "4,272" in tfoot_text or "4272" in tfoot_text, "District B2 should be 4,272"
        assert "3,444" in tfoot_text or "3444" in tfoot_text, "District A2 should be 3,444"
        assert "80.62" in tfoot_text, "District rate2 should be 80.62%"

        # Screenshot Table
        shot1 = os.path.join(ARTIFACTS_DIR, "vercel_live_hba1c_table.png")
        await page.screenshot(path=shot1, full_page=False)
        print(f"Saved live screenshot 1: {shot1}")

        # 6. Switch to 06020 (Single Unit)
        print("Step 5: Selecting Unit 06020 (รพ.สต.บ้านแคว)...")
        await page.evaluate('window.switchNcdUnit("06020")')
        await page.wait_for_timeout(1500)

        # Verify extra chips in Chart 1 and Chart 2
        extra1 = page.locator('#ncd-chart1-extra')
        extra1_visible = await extra1.is_visible()
        extra1_text = await extra1.inner_text() if extra1_visible else ""
        print(f"Chart 1 Extra Chips visible: {extra1_visible}")
        print(f"Chart 1 Extra Chips text:\n{extra1_text}")
        assert extra1_visible, "Chart 1 extra chips should be visible for 06020"
        assert "52.89%" in extra1_text, "Should show Typearea rate 52.89%"
        assert "87.12%" in extra1_text, "Should show ChronicFU rate 87.12%"
        assert "+34.23%" in extra1_text, "Should show delta +34.23%"

        extra2 = page.locator('#ncd-chart2-extra')
        extra2_visible = await extra2.is_visible()
        extra2_text = await extra2.inner_text() if extra2_visible else ""
        print(f"Chart 2 Extra Benchmark visible: {extra2_visible}")
        print(f"Chart 2 Extra Benchmark text:\n{extra2_text}")
        assert extra2_visible, "Chart 2 extra benchmark should be visible for 06020"
        assert "ผ่านเกณฑ์" in extra2_text or "ChronicFU ผ่านเกณฑ์" in extra2_text, "Should show benchmark evaluation"

        # Screenshot Single Unit
        shot2 = os.path.join(ARTIFACTS_DIR, "vercel_live_hba1c_unit_06020.png")
        await page.screenshot(path=shot2, full_page=False)
        print(f"Saved live screenshot 2: {shot2}")

        # 7. Switch back to all
        print("Step 6: Switching back to all units...")
        await page.evaluate('window.switchNcdUnit("all")')
        await page.wait_for_timeout(1500)
        extra1_vis_after = await extra1.is_visible()
        assert not extra1_vis_after, "Chart 1 extra chips should be hidden when 'all' is selected"

        shot3 = os.path.join(ARTIFACTS_DIR, "vercel_live_hba1c_all_restored.png")
        await page.screenshot(path=shot3, full_page=False)
        print(f"Saved live screenshot 3: {shot3}")

        print(f"Console errors during test: {len(console_errors)}")
        for err in console_errors:
            print(f"  [ERROR] {err}")
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"

        print("==================================================================")
        print("ALL LIVE VERCEL TESTS PASSED PERFECTLY!")
        print("==================================================================")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

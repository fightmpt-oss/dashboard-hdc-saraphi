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
PORT = 8321

async def main():
    print("==================================================================")
    print("Verifying Unit-Specific Risk Donut and Coverage Benchmark Charts")
    print("==================================================================")

    # Start local HTTP server
    server = subprocess.Popen(["python", "-m", "http.server", str(PORT)], cwd=r"d:\PROJECTS\Dashboard HDC Saraphi")
    time.sleep(1.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1600, "height": 1200})
            page = await context.new_page()

            # Listen for console errors (ignore optional local static 404s like /api/nhso-sync-status)
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

            # 2. Select DM Risk Screening
            print("Step 2: Selecting DM Risk Screening (ncd_risk_dm)...")
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_risk_dm';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1000)

            # 3. Select Unit 06020 (รพ.สต.บ้านแคว)
            print("Step 3: Selecting Unit 06020 (รพ.สต.บ้านแคว)...")
            await page.evaluate("""() => {
                const uSel = document.getElementById('ncd-unit-select');
                if (uSel) {
                    uSel.value = '06020';
                    uSel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1500)

            # Verify Chart 1 Title & Content for DM 06020
            chart1_title = await page.locator('#ncd-chart1-title').inner_text()
            print(f"Chart 1 Title: {chart1_title}")
            assert "06020" in chart1_title and "รพ.สต.บ้านแคว" in chart1_title

            chart1_center = await page.locator('#ncd-chart1-center').inner_text()
            print(f"Chart 1 Center: {chart1_center.strip().replace(chr(10), ' ')}")
            assert "1,383" in chart1_center, f"Expected 1,383 in Chart 1 center, got: {chart1_center}"
            assert "คัดกรองแล้ว" in chart1_center

            chart1_extra = await page.locator('#ncd-chart1-extra').inner_text()
            print(f"Chart 1 Extra Chips: {chart1_extra.strip().replace(chr(10), ' | ')}")
            assert "1,150" in chart1_extra, "Expected 1,150 normal in extra chips"
            assert "83.15%" in chart1_extra
            assert "213" in chart1_extra, "Expected 213 risk in extra chips"
            assert "15.40%" in chart1_extra
            assert "20" in chart1_extra, "Expected 20 suspect in extra chips"
            assert "1.45%" in chart1_extra

            # Verify Chart 2 Title & Content for DM 06020
            chart2_title = await page.locator('#ncd-chart2-title').inner_text()
            print(f"Chart 2 Title: {chart2_title}")
            assert "ความครอบคลุม" in chart2_title

            chart2_center = await page.locator('#ncd-chart2-center').inner_text()
            print(f"Chart 2 Center: {chart2_center.strip().replace(chr(10), ' ')}")
            assert "93.64%" in chart2_center, f"Expected 93.64% in Chart 2 center, got: {chart2_center}"

            chart2_extra = await page.locator('#ncd-chart2-extra').inner_text()
            print(f"Chart 2 Extra Benchmark: {chart2_extra.strip().replace(chr(10), ' | ')}")
            assert "1,383" in chart2_extra and "1,477" in chart2_extra
            assert "ภาพรวมอำเภอ" in chart2_extra or "สารภี" in chart2_extra
            assert "90%" in chart2_extra and "ผ่านเกณฑ์" in chart2_extra

            # Screenshot DM 06020
            dm_ss = os.path.join(ARTIFACTS_DIR, "ncd_unit_06020_dm_verified.png")
            await page.screenshot(path=dm_ss, full_page=False)
            print(f"Saved screenshot: {dm_ss}")

            # 4. Switch to HT Risk Screening with 06020
            print("\nStep 4: Selecting HT Risk Screening (ncd_risk_ht) for Unit 06020...")
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_risk_ht';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1500)

            chart1_ht_center = await page.locator('#ncd-chart1-center').inner_text()
            print(f"Chart 1 HT Center: {chart1_ht_center.strip().replace(chr(10), ' ')}")
            assert "1,017" in chart1_ht_center, f"Expected 1,017 in Chart 1 center for HT, got: {chart1_ht_center}"

            chart1_ht_extra = await page.locator('#ncd-chart1-extra').inner_text()
            print(f"Chart 1 HT Extra Chips: {chart1_ht_extra.strip().replace(chr(10), ' | ')}")
            assert "563" in chart1_ht_extra, "Expected 563 normal in HT chips"
            assert "333" in chart1_ht_extra, "Expected 333 risk in HT chips"
            assert "117" in chart1_ht_extra, "Expected 117 suspect in HT chips"
            assert "3" in chart1_ht_extra, "Expected 3 sick in HT chips"
            assert "ป่วย (พบแพทย์)" in chart1_ht_extra

            chart2_ht_center = await page.locator('#ncd-chart2-center').inner_text()
            print(f"Chart 2 HT Center: {chart2_ht_center.strip().replace(chr(10), ' ')}")
            assert "90.97%" in chart2_ht_center, f"Expected 90.97% in Chart 2 center for HT, got: {chart2_ht_center}"

            # Screenshot HT 06020
            ht_ss = os.path.join(ARTIFACTS_DIR, "ncd_unit_06020_ht_verified.png")
            await page.screenshot(path=ht_ss, full_page=False)
            print(f"Saved screenshot: {ht_ss}")

            # 5. Switch back to "all" units
            print("\nStep 5: Switching back to 'all' units (ภาพรวมอำเภอ)...")
            await page.evaluate("""() => {
                const uSel = document.getElementById('ncd-unit-select');
                if (uSel) {
                    uSel.value = 'all';
                    uSel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1500)

            c1_center_visible = await page.locator('#ncd-chart1-center').is_visible()
            c1_extra_visible = await page.locator('#ncd-chart1-extra').is_visible()
            c2_center_visible = await page.locator('#ncd-chart2-center').is_visible()
            c2_extra_visible = await page.locator('#ncd-chart2-extra').is_visible()

            assert not c1_center_visible, "Chart 1 center overlay should be hidden for 'all'"
            assert not c1_extra_visible, "Chart 1 extra container should be hidden for 'all'"
            assert not c2_center_visible, "Chart 2 center overlay should be hidden for 'all'"
            assert not c2_extra_visible, "Chart 2 extra container should be hidden for 'all'"

            c1_title_all = await page.locator('#ncd-chart1-title').inner_text()
            badge1_text = await page.locator('#ncd-chart1-badge').inner_text()
            assert "เปรียบเทียบสัดส่วนกลุ่มเสี่ยง" in c1_title_all, f"Expected risk title, got: {c1_title_all}"
            assert "100% Stacked" in badge1_text, f"Expected 100% Stacked in badge, got: {badge1_text}"

            # Screenshot All restored
            all_ss = os.path.join(ARTIFACTS_DIR, "ncd_unit_all_restored.png")
            await page.screenshot(path=all_ss, full_page=False)
            print(f"Saved screenshot: {all_ss}")

            print("\nChecking for console errors...")
            if console_errors:
                print(f"Encountered {len(console_errors)} console errors: {console_errors}")
                raise AssertionError(f"Console errors found: {console_errors}")
            else:
                print("Zero console errors! Perfectly clean.")

            print("\n==================================================================")
            print("ALL UNIT-SPECIFIC RISK & COVERAGE TESTS PASSED WITH 100% SUCCESS!")
            print("==================================================================")

    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(main())

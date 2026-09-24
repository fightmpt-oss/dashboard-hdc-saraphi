# -*- coding: utf-8 -*-
import asyncio
import os
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

VERCEL_URL = "https://dashboard-hdc-saraphi.vercel.app/"
ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"

async def test_live():
    print("==================================================================")
    print(f"Testing Live Production URL: {VERCEL_URL}")
    print("==================================================================")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1600, 'height': 1200})
        page = await context.new_page()

        # Retry up to 5 times to let Vercel build & CDN cache propagate
        for attempt in range(1, 6):
            print(f"Attempt {attempt}: Loading {VERCEL_URL} ...")
            try:
                await page.goto(f"{VERCEL_URL}?v={attempt}", wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(2000)
                
                ncd_badge = page.locator('#ncd-sidebar-badge')
                if await ncd_badge.count() > 0:
                    badge_text = await ncd_badge.inner_text()
                    if "72" in badge_text:
                        print("PASS: 72 reports badge confirmed on live Vercel deployment!")
                        break
                print("Waiting 6s for Vercel deployment cache to settle...")
                await asyncio.sleep(6)
            except Exception as e:
                print(f"Attempt {attempt} error: {e}")
                await asyncio.sleep(6)

        # 1. Switch to Service Plan NCD
        ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
        await ncd_btn.click()
        await page.wait_for_timeout(2000)

        # 2. Select s_dm_screen_risk
        print("\nLive Vercel: Selecting s_dm_screen_risk...")
        await page.evaluate("""() => {
            const sel = document.getElementById('ncd-report-select');
            if (sel) {
                sel.value = 'ncd_risk_dm';
                sel.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)

        # 3. Select Unit 06020 (รพ.สต.บ้านแคว)
        print("Live Vercel: Selecting Unit 06020 (รพ.สต.บ้านแคว)...")
        await page.evaluate("""() => {
            const uSel = document.getElementById('ncd-unit-select');
            if (uSel) {
                uSel.value = '06020';
                uSel.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)

        # Check DM 06020 Chart Elements
        c1_center = await page.locator('#ncd-chart1-center').inner_text()
        print(f"DM 06020 Center 1: {c1_center.strip().replace(chr(10), ' ')}")
        assert "1,383" in c1_center, f"Expected 1,383 in Chart 1 center, got {c1_center}"

        c1_extra = await page.locator('#ncd-chart1-extra').inner_text()
        print(f"DM 06020 Chips: {c1_extra.strip().replace(chr(10), ' | ')}")
        assert "1,150" in c1_extra
        assert "213" in c1_extra

        c2_center = await page.locator('#ncd-chart2-center').inner_text()
        print(f"DM 06020 Center 2: {c2_center.strip().replace(chr(10), ' ')}")
        assert "93.64%" in c2_center

        dm_ss = os.path.join(ARTIFACTS_DIR, "vercel_live_unit_06020_dm.png")
        await page.screenshot(path=dm_ss, full_page=False)
        print(f"Saved screenshot: {dm_ss}")

        # 4. Select s_ht_screen_risk with 06020
        print("\nLive Vercel: Selecting s_ht_screen_risk for 06020...")
        await page.evaluate("""() => {
            const sel = document.getElementById('ncd-report-select');
            if (sel) {
                sel.value = 'ncd_risk_ht';
                sel.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)

        c1_ht_center = await page.locator('#ncd-chart1-center').inner_text()
        print(f"HT 06020 Center 1: {c1_ht_center.strip().replace(chr(10), ' ')}")
        assert "1,017" in c1_ht_center

        c1_ht_extra = await page.locator('#ncd-chart1-extra').inner_text()
        print(f"HT 06020 Chips: {c1_ht_extra.strip().replace(chr(10), ' | ')}")
        assert "563" in c1_ht_extra
        assert "333" in c1_ht_extra
        assert "ป่วย (พบแพทย์)" in c1_ht_extra

        c2_ht_center = await page.locator('#ncd-chart2-center').inner_text()
        print(f"HT 06020 Center 2: {c2_ht_center.strip().replace(chr(10), ' ')}")
        assert "90.97%" in c2_ht_center

        ht_ss = os.path.join(ARTIFACTS_DIR, "vercel_live_unit_06020_ht.png")
        await page.screenshot(path=ht_ss, full_page=False)
        print(f"Saved screenshot: {ht_ss}")

        # 5. Switch back to all units
        print("\nLive Vercel: Switching back to all units...")
        await page.evaluate("""() => {
            const uSel = document.getElementById('ncd-unit-select');
            if (uSel) {
                uSel.value = 'all';
                uSel.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)

        all_ss = os.path.join(ARTIFACTS_DIR, "vercel_live_unit_all_restored.png")
        await page.screenshot(path=all_ss, full_page=False)
        print(f"Saved screenshot: {all_ss}")

        print("\n==================================================================")
        print("VERCEL PRODUCTION VERIFICATION COMPLETED WITH 100% SUCCESS!")
        print("==================================================================")

if __name__ == "__main__":
    asyncio.run(test_live())

import asyncio
import os
import sys
from playwright.async_api import async_playwright

VERCEL_URL = "https://dashboard-hdc-saraphi.vercel.app/"
artifacts_dir = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"

async def test_live():
    print(f"Testing Live Production URL: {VERCEL_URL} ...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1600, 'height': 1050})
        page = await context.new_page()

        # Retry up to 3 times to allow Vercel build to finish
        for attempt in range(1, 4):
            print(f"Attempt {attempt}: Loading {VERCEL_URL} ...")
            try:
                await page.goto(VERCEL_URL, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(2000)
                
                ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
                if await ncd_btn.count() > 0:
                    print("PASS: Service Plan NCD menu found on live Vercel deployment!")
                    break
                else:
                    print("Menu not found yet, Vercel build might be finishing. Waiting 10s...")
                    await asyncio.sleep(10)
            except Exception as e:
                print(f"Attempt {attempt} error: {e}")
                await asyncio.sleep(10)

        ncd_btn = page.locator('button[data-domain="service_plan_ncd"]')
        assert await ncd_btn.count() > 0, "Service Plan NCD sidebar button not found on Vercel!"

        # Click Service Plan NCD
        await ncd_btn.click()
        await page.wait_for_timeout(2000)

        # Verify default indicator KPIs (s_dm_screen 2569)
        kpi_result = await page.locator('#ncd-kpi-result').inner_text()
        kpi_target = await page.locator('#ncd-kpi-target').inner_text()
        kpi_rate = await page.locator('#ncd-kpi-rate').inner_text()
        print(f"Live Vercel 2569 -> Result: {kpi_result}, Target: {kpi_target}, Rate: {kpi_rate}%")

        assert "34,794" in kpi_result, f"Expected 34,794 but got {kpi_result}"
        assert "37,313" in kpi_target, f"Expected 37,313 but got {kpi_target}"
        assert "93.25" in kpi_rate, f"Expected 93.25 but got {kpi_rate}"

        # Test s_dm_ckd1 with Dual Dataset
        print("Selecting s_dm_ckd1 on Vercel Live...")
        await page.evaluate("""() => {
            const sel = document.getElementById('ncd-report-select');
            if (sel) {
                sel.value = 'ncd_07';
                sel.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)

        mode_bar = page.locator('#ncd-dataset-mode-bar')
        assert await mode_bar.is_visible(), "Expected mode bar on Vercel live for s_dm_ckd1!"

        # Check dual thead
        thead_text = await page.locator('#ncd-table-thead').inner_text()
        assert "typearea 1,3" in thead_text.lower()
        assert "chronicfu" in thead_text.lower()

        # Switch to Compare mode
        await page.click('#btn-ncd-mode-compare')
        await page.wait_for_timeout(1000)

        # Take screenshot of live Vercel dual dataset table & compare
        ss_live_dual = os.path.join(artifacts_dir, "vercel_live_dual_dataset_verified.png")
        await page.screenshot(path=ss_live_dual, full_page=False)
        print(f"Saved Live Vercel Dual Dataset screenshot: {ss_live_dual}")

        print("LIVE VERCEL DEPLOYMENT & DUAL DATASETS VERIFIED SUCCESSFULLY!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_live())

import asyncio
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        print("[1] Loading Vercel live site https://dashboard-hdc-saraphi.vercel.app/ ...")
        await page.goto("https://dashboard-hdc-saraphi.vercel.app/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(3000)
        
        print("[2] Switching to nhso_ttm domain and nhso_herb32 indicator on Vercel...")
        await page.evaluate("""() => {
            const items = document.querySelectorAll('.sidebar-item');
            for (const item of items) {
                if (item.dataset.domain === 'nhso_ttm') {
                    item.click();
                    break;
                }
            }
            const select = document.getElementById('indicator-select');
            if (select) {
                select.value = 'nhso_herb32';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)
        
        # Read District level values
        dist_cards = await page.evaluate("""() => {
            const cards = document.getElementById('herb32-kpi-cards');
            return cards ? cards.innerText : '';
        }""")
        print("[3] Vercel District KPI Cards:")
        print(dist_cards)
        
        # Scroll to table and take screenshot
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-matrix-table');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/vercel_live_table_district.png", full_page=False)
        
        # Select 06020
        print("[4] Selecting 06020 on Vercel...")
        await page.evaluate("""() => {
            const select = document.getElementById('herb32-unit-select');
            if (select) {
                select.value = '06020';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(1500)
        
        u_cards = await page.evaluate("""() => {
            const cards = document.getElementById('herb32-kpi-cards');
            return cards ? cards.innerText : '';
        }""")
        print("[5] Vercel 06020 KPI Cards:")
        print(u_cards)
        
        # Scroll to 06020 KPI and take screenshot
        await page.evaluate("""() => {
            const panel = document.getElementById('nhso-herb32-panel');
            if (panel) panel.scrollIntoView({ behavior: 'instant' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/vercel_live_06020_kpi.png", full_page=False)
        
        await browser.close()
        print("[6] Vercel verification complete!")

asyncio.run(main())

import asyncio
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        print("[1] Navigating...")
        await page.goto("http://127.0.0.1:8095/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2000)
        
        print("[2] Switching to nhso_ttm domain and nhso_herb32 indicator...")
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
        
        print("[3] Selecting unit 06020...")
        await page.evaluate("""() => {
            const select = document.getElementById('herb32-unit-select');
            if (select) {
                select.value = '06020';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }""")
        await page.wait_for_timeout(2000)
        
        # Read KPI Cards text
        cards_html = await page.evaluate("""() => {
            const cards = document.getElementById('herb32-kpi-cards');
            return cards ? cards.innerText : 'CARDS NOT FOUND';
        }""")
        print("[4] 06020 KPI Cards Text:")
        print(cards_html)
        
        # Capture screenshot of 06020 top area
        await page.evaluate("""() => {
            const panel = document.getElementById('nhso-herb32-panel');
            if (panel) panel.scrollIntoView({ behavior: 'instant' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_06020_kpi_fixed.png", full_page=False)
        
        # Capture charts section
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-unit-count-chart');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_06020_charts_fixed.png", full_page=False)
        
        # Capture table section
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-detail-table');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_06020_table_fixed.png", full_page=False)

        await browser.close()
        print("[5] Done!")

asyncio.run(main())

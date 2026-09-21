import asyncio
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 1080})
        
        await page.goto("http://127.0.0.1:8095/", wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2000)
        
        # Switch to nhso_ttm and nhso_herb32
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
        
        # Scroll to table
        await page.evaluate("""() => {
            const el = document.getElementById('herb32-matrix-table');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }""")
        await page.wait_for_timeout(500)
        
        # Take screenshot of the table
        await page.screenshot(path=f"{SCREENSHOTS_DIR}/herb32_live_table_district.png", full_page=False)
        print("Table screenshot captured successfully!")
        
        await browser.close()

asyncio.run(main())

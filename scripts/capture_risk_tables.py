import asyncio
import os
import subprocess
import sys
import time
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACTS_DIR = r"C:\Users\Acer\.gemini\antigravity\brain\1d1dc2c1-0794-4595-82b5-1b0becaf4b50"
PORT = 8312

async def main():
    server = subprocess.Popen(["python", "-m", "http.server", str(PORT)], cwd=r"d:\PROJECTS\Dashboard HDC Saraphi")
    time.sleep(1.5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1600, "height": 1300})
            page = await context.new_page()

            url = f"http://127.0.0.1:{PORT}/"
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)

            # Click NCD
            await page.locator('button[data-domain="service_plan_ncd"]').click()
            await page.wait_for_timeout(1500)

            # Select DM
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_risk_dm';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1000)

            # Scroll to table
            await page.evaluate("() => document.getElementById('ncd-matrix-table').scrollIntoView()")
            await page.wait_for_timeout(1000)
            await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "ncd_risk_table_dm_view.png"))

            # Select HT
            await page.evaluate("""() => {
                const sel = document.getElementById('ncd-report-select');
                if (sel) {
                    sel.value = 'ncd_risk_ht';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""")
            await page.wait_for_timeout(1000)

            # Scroll to table
            await page.evaluate("() => document.getElementById('ncd-matrix-table').scrollIntoView()")
            await page.wait_for_timeout(1000)
            await page.screenshot(path=os.path.join(ARTIFACTS_DIR, "ncd_risk_table_ht_view.png"))

            print("Captured table screenshots successfully!")
    finally:
        server.terminate()

if __name__ == "__main__":
    asyncio.run(main())

# -*- coding: utf-8 -*-
import asyncio
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})
        url = "https://hdc.moph.go.th/cmi/public/standard-report-detail/2e3813337b6b5377c2f68affe247d5f9"
        print(f"Loading {url}...")
        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Print page title
            title = await page.title()
            print(f"Title: {title}")
            
            # Look for table headers
            ths = await page.locator("table thead tr").all()
            print(f"Thead rows count: {len(ths)}")
            for idx, r in enumerate(ths):
                text = await r.inner_text()
                print(f"Header Row {idx}:\n  {text.replace(chr(10), ' | ')}")
                
            # Check for SQL button
            sql_btn = page.locator("button:has-text('SQL'), a:has-text('SQL')")
            if await sql_btn.count() > 0:
                print("Found SQL button, clicking...")
                await sql_btn.first.click()
                await page.wait_for_timeout(1000)
                # print modal or text
                dialog = page.locator(".modal, [role='dialog'], pre, code")
                if await dialog.count() > 0:
                    sql_text = await dialog.first.inner_text()
                    print(f"SQL preview:\n{sql_text[:1000]}")
                    
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

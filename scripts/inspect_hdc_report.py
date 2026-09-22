import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        url = "https://hdc.moph.go.th/cmi/public/standard-report-detail/626c89f6b8d9f7ed90c72c719775eb07"
        print(f"Navigating to {url} ...")
        try:
            await page.goto(url, wait_until="networkidle", timeout=45000)
            await page.wait_for_timeout(3000)
            title = await page.title()
            print("Page title:", title)
            
            # Print page content or table headers
            text = await page.evaluate("() => document.body.innerText.substring(0, 1000)")
            print("Page snippet:\n", text[:500])
        except Exception as e:
            print("Error loading page:", e)
        finally:
            await browser.close()

asyncio.run(main())

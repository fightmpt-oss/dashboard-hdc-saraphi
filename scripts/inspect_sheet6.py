import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1680, 'height': 1100})
        print("Navigating to Tableau MeData...")
        await page.goto('https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y', wait_until='domcontentloaded', timeout=60000)
        await page.wait_for_selector('tableau-viz', timeout=40000)
        await asyncio.sleep(6)
        
        data = await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync('6-ยาสมุนไพร 32 รายการ');
            await new Promise(r => setTimeout(r, 4000));
            const sheet = viz.workbook.activeSheet;
            const res = [];
            for (const ws of sheet.worksheets) {
                try {
                    const sum = await ws.getSummaryDataAsync({ maxRows: 5 });
                    res.push({
                        name: ws.name,
                        columns: sum.columns.map(c => ({ fieldName: c.fieldName, dataType: c.dataType })),
                        rowCount: sum.totalRowCount,
                        sample: sum.data.map(row => row.map(cell => cell.formattedValue))
                    });
                } catch(e) {
                    res.push({ name: ws.name, error: e.toString() });
                }
            }
            return res;
        }''')
        
        out_path = os.path.join(os.path.dirname(__file__), "s6_worksheets.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved {out_path} successfully. Total worksheets: {len(data)}")
        for item in data:
            print("Worksheet:", item.get("name"), "Columns:", [c["fieldName"] for c in item.get("columns", [])])
        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect())

import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def test_unit_filter():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1680, 'height': 1100})
        await page.goto('https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y', wait_until='domcontentloaded', timeout=60000)
        await page.wait_for_selector('tableau-viz', timeout=40000)
        await asyncio.sleep(6)
        
        result = await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync('6-ยาสมุนไพร 32 รายการ');
            await new Promise(r => setTimeout(r, 4000));
            const sheet = viz.workbook.activeSheet;
            
            const wsUnitCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-ครั้ง');
            const wsUnitPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-จ่าย');
            const wsHerbCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-ครั้ง');
            const wsHerbPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-จ่าย');
            
            const allWs = [wsUnitCount, wsUnitPay, wsHerbCount, wsHerbPay];
            for (const ws of allWs) {
                await ws.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                await ws.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                await ws.applyFilterAsync("amphur_name", ["สารภี"], "replace");
                await ws.applyFilterAsync("F Year", ["2569"], "replace");
            }
            
            // Filter Hname for รพ.สต.บ้านแคว
            await wsHerbCount.applyFilterAsync("Hname", ["รพ.สต.บ้านแคว"], "replace");
            await wsHerbPay.applyFilterAsync("Hname", ["รพ.สต.บ้านแคว"], "replace");
            await new Promise(r => setTimeout(r, 1000));
            
            const sHC = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
            const sHP = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
            
            return {
                hCount: sHC.data.map(r => [r[0].formattedValue, r[1].formattedValue]),
                hPay: sHP.data.map(r => [r[0].formattedValue, r[1].formattedValue])
            };
        }''')
        
        print("\n--- รพ.สต.บ้านแคว Herbs Count (2569) ---")
        total_cnt = 0
        for r in result["hCount"]:
            print(f"  {r[0]}: {r[1]} ครั้ง")
            total_cnt += int(r[1].replace(',', ''))
        print("Total Count:", total_cnt)
            
        print("\n--- รพ.สต.บ้านแคว Herbs Pay (2569) ---")
        total_pay = 0.0
        for r in result["hPay"]:
            print(f"  {r[0]}: {r[1]} บาท")
            total_pay += float(r[1].replace(',', ''))
        print("Total Pay:", total_pay)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_unit_filter())

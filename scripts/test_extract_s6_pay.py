import asyncio
import json
import os
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

SARAPHI_MAP = {
    "06014": {"name": "รพ.สต.บ้านยางเนิ้ง", "subdistrict": "ยางเนิ้ง", "aliases": ["ยางเนิ้ง", "บ้านยางเนิ้ง"]},
    "06015": {"name": "รพ.สต.บ้านพญาชมภู", "subdistrict": "ชมภู", "aliases": ["พญาชมภู", "บ้านพญาชมภู", "พญาชมพู"]},
    "06016": {"name": "รพ.สต.บ้านศรีสองเมือง", "subdistrict": "ไชยสถาน", "aliases": ["ศรีสองเมือง", "สองแคว", "ไชยสถาน"]},
    "06017": {"name": "รพ.สต.บ้านหัวดง", "subdistrict": "ขัวมุง", "aliases": ["หัวดง", "บ้านหัวดง", "ขัวมุง"]},
    "06018": {"name": "รพ.สต.บ้านหนองแฝก", "subdistrict": "หนองแฝก", "aliases": ["หนองแฝก", "บ้านหนองแฝก"]},
    "06020": {"name": "รพ.สต.บ้านแคว (ท่ากว้าง)", "subdistrict": "ท่ากว้าง", "aliases": ["บ้านแคว", "ท่ากว้าง", "แคว"]},
    "06021": {"name": "รพ.สต.บ้านสันต้นกอก", "subdistrict": "ดอนแก้ว", "aliases": ["สันต้นกอก", "ดอนแก้ว"]},
    "06022": {"name": "รพ.สต.บ้านบวกครกเหนือ", "subdistrict": "ท่าวังตาล", "aliases": ["บวกครกเหนือ", "ท่าวังตาล"]},
    "06023": {"name": "รพ.สต.บ้านป่าสา", "subdistrict": "สันทราย", "aliases": ["ป่าเส้า", "บ้านป่าเส้า", "ป่าสา", "บ้านป่าสา", "สันทราย"]},
    "06024": {"name": "รพ.สต.บ้านศรีคำชมภู", "subdistrict": "ป่าบง", "aliases": ["ศรีคำชมภู", "ป่าบง"]},
    "11135": {"name": "รพ.สารภี", "subdistrict": "สารภี", "aliases": ["รพ.สารภี", "โรงพยาบาลสารภี", "สารภี"]},
    "13994": {"name": "รพ.สต.บ้านท่าต้นกวาว", "subdistrict": "ท่ากว้าง", "aliases": ["ท่าต้นกวาว", "บ้านท่าต้นกวาว"]},
    "14461": {"name": "รพ.สต.บ้านหนองผึ้ง", "subdistrict": "หนองผึ้ง", "aliases": ["หนองผึ้ง", "บ้านหนองผึ้ง"]},
    "99758": {"name": "ศสม.สารภี", "subdistrict": "สารภี", "aliases": ["ศสม", "ศูนย์สุขภาพชุมชน"]}
}

def match_hospcode(raw_name):
    if not raw_name:
        return None
    clean = raw_name.replace("ตำบล", " ").replace("ต.", " ")
    for code, info in SARAPHI_MAP.items():
        if info["name"] in clean:
            return code
        for alias in info["aliases"]:
            if alias in clean:
                return code
    return None

def parse_num(val):
    if val is None:
        return 0
    if isinstance(val, (int, float)):
        return val
    cleaned = str(val).replace(",", "").strip()
    try:
        return float(cleaned) if "." in cleaned else int(cleaned)
    except:
        return 0

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1680, 'height': 1100})
        print("Navigating to Tableau MeData...")
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
            await new Promise(r => setTimeout(r, 2000));
            
            const sUnitCount = await wsUnitCount.getSummaryDataAsync({ maxRows: 50 });
            const sUnitPay = await wsUnitPay.getSummaryDataAsync({ maxRows: 50 });
            const sHerbCount = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
            const sHerbPay = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
            
            return {
                unitCount: sUnitCount.data.map(r => [r[0].formattedValue, r[1].formattedValue]),
                unitPay: sUnitPay.data.map(r => [r[0].formattedValue, r[1].formattedValue]),
                herbCount: sHerbCount.data.map(r => [r[0].formattedValue, r[1].formattedValue]),
                herbPay: sHerbPay.data.map(r => [r[0].formattedValue, r[1].formattedValue])
            };
        }''')
        
        print("\n--- Unit Count (2569) ---")
        for r in result["unitCount"]:
            print(f"  {r[0]}: {r[1]} ครั้ง")
            
        print("\n--- Unit Pay (2569) ---")
        for r in result["unitPay"]:
            print(f"  {r[0]}: {r[1]} บาท")
            
        print("\n--- Herb Count (2569) Top 10 ---")
        for r in result["herbCount"][:10]:
            print(f"  {r[0]}: {r[1]} ครั้ง")
            
        print("\n--- Herb Pay (2569) Top 10 ---")
        for r in result["herbPay"][:10]:
            print(f"  {r[0]}: {r[1]} บาท")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())

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

MONTH_LIST_2569 = [
    "ตุลาคม 2568", "พฤศจิกายน 2568", "ธันวาคม 2568",
    "มกราคม 2569", "กุมภาพันธ์ 2569", "มีนาคม 2569",
    "เมษายน 2569", "พฤษภาคม 2569", "มิถุนายน 2569",
    "กรกฎาคม 2569"
]

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

async def extract_2569():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1680, 'height': 1100})
        print("Navigating to Tableau MeData...")
        await page.goto('https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y', wait_until='domcontentloaded', timeout=60000)
        await page.wait_for_selector('tableau-viz', timeout=40000)
        await asyncio.sleep(6)
        
        result = await page.evaluate('''async ({ months }) => {
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
            await new Promise(r => setTimeout(r, 1500));
            
            // 1. Overall Year 2569
            const sUC = await wsUnitCount.getSummaryDataAsync({ maxRows: 50 });
            const sUP = await wsUnitPay.getSummaryDataAsync({ maxRows: 50 });
            const sHC = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
            const sHP = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
            
            const out = {
                units: {},
                herbs: {},
                months: {}
            };
            
            sUC.data.forEach(r => {
                const u = r[0].formattedValue;
                out.units[u] = { count: r[1].formattedValue, pay: "0", herbs: {}, monthly: {} };
            });
            sUP.data.forEach(r => {
                const u = r[0].formattedValue;
                if (!out.units[u]) out.units[u] = { count: "0", pay: r[1].formattedValue, herbs: {}, monthly: {} };
                else out.units[u].pay = r[1].formattedValue;
            });
            
            sHC.data.forEach(r => {
                const h = r[0].formattedValue;
                out.herbs[h] = { count: r[1].formattedValue, pay: "0" };
            });
            sHP.data.forEach(r => {
                const h = r[0].formattedValue;
                if (!out.herbs[h]) out.herbs[h] = { count: "0", pay: r[1].formattedValue };
                else out.herbs[h].pay = r[1].formattedValue;
            });
            
            // 2. For each active unit, extract its herbs breakdown
            for (const uName of Object.keys(out.units)) {
                await wsHerbCount.applyFilterAsync("Hname", [uName], "replace");
                await wsHerbPay.applyFilterAsync("Hname", [uName], "replace");
                await new Promise(r => setTimeout(r, 300));
                
                const uHC = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
                const uHP = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
                
                const uHerbs = {};
                uHC.data.forEach(r => {
                    uHerbs[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0" };
                });
                uHP.data.forEach(r => {
                    if (!uHerbs[r[0].formattedValue]) uHerbs[r[0].formattedValue] = { count: "0", pay: r[1].formattedValue };
                    else uHerbs[r[0].formattedValue].pay = r[1].formattedValue;
                });
                out.units[uName].herbs = uHerbs;
            }
            
            // Clear Hname filter
            try { await wsHerbCount.clearFilterAsync("Hname"); } catch(e){}
            try { await wsHerbPay.clearFilterAsync("Hname"); } catch(e){}
            
            // 3. For each month
            for (const m of months) {
                for (const ws of allWs) {
                    await ws.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                }
                await new Promise(r => setTimeout(r, 400));
                
                const mUC = await wsUnitCount.getSummaryDataAsync({ maxRows: 50 });
                const mUP = await wsUnitPay.getSummaryDataAsync({ maxRows: 50 });
                const mHC = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
                const mHP = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
                
                const mData = {
                    units: {},
                    herbs: {}
                };
                
                mUC.data.forEach(r => {
                    mData.units[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0" };
                });
                mUP.data.forEach(r => {
                    const u = r[0].formattedValue;
                    if (!mData.units[u]) mData.units[u] = { count: "0", pay: r[1].formattedValue };
                    else mData.units[u].pay = r[1].formattedValue;
                });
                
                mHC.data.forEach(r => {
                    mData.herbs[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0" };
                });
                mHP.data.forEach(r => {
                    const h = r[0].formattedValue;
                    if (!mData.herbs[h]) mData.herbs[h] = { count: "0", pay: r[1].formattedValue };
                    else mData.herbs[h].pay = r[1].formattedValue;
                });
                
                // Record into unit monthly
                for (const [u, v] of Object.entries(mData.units)) {
                    if (out.units[u]) {
                        out.units[u].monthly[m] = v;
                    }
                }
                
                // For each unit in this month with count > 0, get herb breakdown
                for (const [uName, uVal] of Object.entries(mData.units)) {
                    if (parseFloat(uVal.count.replace(/,/g, '')) > 0) {
                        await wsHerbCount.applyFilterAsync("Hname", [uName], "replace");
                        await wsHerbPay.applyFilterAsync("Hname", [uName], "replace");
                        await new Promise(r => setTimeout(r, 250));
                        
                        const umHC = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
                        const umHP = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
                        
                        const umHerbs = {};
                        umHC.data.forEach(r => {
                            umHerbs[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0" };
                        });
                        umHP.data.forEach(r => {
                            if (!umHerbs[r[0].formattedValue]) umHerbs[r[0].formattedValue] = { count: "0", pay: r[1].formattedValue };
                            else umHerbs[r[0].formattedValue].pay = r[1].formattedValue;
                        });
                        
                        if (!out.units[uName].monthlyHerbs) out.units[uName].monthlyHerbs = {};
                        out.units[uName].monthlyHerbs[m] = umHerbs;
                    }
                }
                
                try { await wsHerbCount.clearFilterAsync("Hname"); } catch(e){}
                try { await wsHerbPay.clearFilterAsync("Hname"); } catch(e){}
                
                out.months[m] = mData;
            }
            
            return out;
        }''', {"months": MONTH_LIST_2569})
        
        out_file = os.path.join(os.path.dirname(__file__), "extracted_s6_2569.json")
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"Saved {out_file} successfully.")
        
        # Check Baankwae 06020 specifically
        for k, v in result["units"].items():
            if "บ้านแคว" in k:
                print(f"\n*** Baankwae check ({k}) ***")
                print(f"Total Count: {v['count']}, Total Pay: {v['pay']}")
                print("Monthly:")
                for m, mv in v["monthly"].items():
                    print(f"  {m}: {mv['count']} ครั้ง, {mv['pay']} บาท")
                print("Herbs:")
                for h, hv in v["herbs"].items():
                    print(f"  {h}: {hv['count']} ครั้ง, {hv['pay']} บาท")
                    
        await browser.close()

if __name__ == "__main__":
    asyncio.run(extract_2569())

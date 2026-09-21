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

async def extract_streamlined():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1680, 'height': 1100})
        print("Connecting to Tableau MeData...", flush=True)
        await page.goto('https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y', wait_until='domcontentloaded', timeout=60000)
        await page.wait_for_selector('tableau-viz', timeout=40000)
        await asyncio.sleep(6)
        
        print("Activating Sheet 6: ยาสมุนไพร 32 รายการ...", flush=True)
        await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync('6-ยาสมุนไพร 32 รายการ');
            await new Promise(r => setTimeout(r, 4000));
            const sheet = viz.workbook.activeSheet;
            
            const wsUnitCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-ครั้ง');
            const wsUnitPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-จ่าย');
            const wsHerbCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-ครั้ง');
            const wsHerbPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-จ่าย');
            
            for (const ws of [wsUnitCount, wsUnitPay, wsHerbCount, wsHerbPay]) {
                await ws.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                await ws.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                await ws.applyFilterAsync("amphur_name", ["สารภี"], "replace");
            }
        }''')
        print("Applied Saraphi filters.", flush=True)
        
        # We will extract for 2569, 2568, 2567
        YEARS = ["2569", "2568", "2567"]
        year_results = {}
        
        for yr in YEARS:
            print(f"\n=================== PROCESSING YEAR {yr} ===================", flush=True)
            yr_data = await page.evaluate('''async (targetYear) => {
                const viz = document.querySelector('tableau-viz');
                const sheet = viz.workbook.activeSheet;
                const wsUnitCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-ครั้ง');
                const wsUnitPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-จ่าย');
                const wsHerbCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-ครั้ง');
                const wsHerbPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-จ่าย');
                
                for (const ws of [wsUnitCount, wsUnitPay, wsHerbCount, wsHerbPay]) {
                    try { await ws.clearFilterAsync("MY(Xyyyymm)"); } catch(e){}
                    try { await ws.clearFilterAsync("Hname"); } catch(e){}
                    await ws.applyFilterAsync("F Year", [targetYear], "replace");
                }
                await new Promise(r => setTimeout(r, 1500));
                
                // 1. Overall Year summary
                const sUC = await wsUnitCount.getSummaryDataAsync({ maxRows: 50 });
                const sUP = await wsUnitPay.getSummaryDataAsync({ maxRows: 50 });
                const sHC = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
                const sHP = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
                
                const units = {};
                sUC.data.forEach(r => {
                    units[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0", herbs: {}, monthly: {} };
                });
                sUP.data.forEach(r => {
                    const u = r[0].formattedValue;
                    if (!units[u]) units[u] = { count: "0", pay: r[1].formattedValue, herbs: {}, monthly: {} };
                    else units[u].pay = r[1].formattedValue;
                });
                
                const herbs = {};
                sHC.data.forEach(r => {
                    herbs[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0" };
                });
                sHP.data.forEach(r => {
                    const h = r[0].formattedValue;
                    if (!herbs[h]) herbs[h] = { count: "0", pay: r[1].formattedValue };
                    else herbs[h].pay = r[1].formattedValue;
                });
                
                // 2. Unit herbs breakdown
                for (const uName of Object.keys(units)) {
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
                        const h = r[0].formattedValue;
                        if (!uHerbs[h]) uHerbs[h] = { count: "0", pay: r[1].formattedValue };
                        else uHerbs[h].pay = r[1].formattedValue;
                    });
                    units[uName].herbs = uHerbs;
                }
                
                try { await wsHerbCount.clearFilterAsync("Hname"); } catch(e){}
                try { await wsHerbPay.clearFilterAsync("Hname"); } catch(e){}
                
                return { units, herbs };
            }''', yr)
            
            print(f"Year {yr} overall units: {len(yr_data['units'])}, herbs: {len(yr_data['herbs'])}", flush=True)
            
            # Now extract months for this year
            months_data = {}
            # Let's get the available months for this year from Tableau or standard
            month_names = await page.evaluate('''async () => {
                const viz = document.querySelector('tableau-viz');
                const sheet = viz.workbook.activeSheet;
                const ws = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-ครั้ง');
                const filters = await ws.getFiltersAsync();
                const mFilter = filters.find(f => f.fieldName.includes("Xyyyymm"));
                if (mFilter && mFilter.appliedValues) {
                    return mFilter.appliedValues.map(v => v.formattedValue);
                }
                return [];
            }''')
            
            # If month_names empty or all, let's use known months
            if yr == "2569":
                m_list = MONTH_LIST_2569
            elif yr == "2568":
                m_list = [f"{m} 2568" if i >= 3 else f"{m} 2567" for i, m in enumerate(["ตุลาคม", "พฤศจิกายน", "ธันวาคม", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน"])]
            else:
                m_list = [f"{m} 2567" if i >= 3 else f"{m} 2566" for i, m in enumerate(["ตุลาคม", "พฤศจิกายน", "ธันวาคม", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน"])]
                
            for m in m_list:
                m_res = await page.evaluate('''async (targetMonth) => {
                    const viz = document.querySelector('tableau-viz');
                    const sheet = viz.workbook.activeSheet;
                    const wsUnitCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-ครั้ง');
                    const wsUnitPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-หน่วย-จ่าย');
                    const wsHerbCount = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-ครั้ง');
                    const wsHerbPay = sheet.worksheets.find(w => w.name === 's6-herb-32fs-บริการ-จ่าย');
                    
                    for (const ws of [wsUnitCount, wsUnitPay, wsHerbCount, wsHerbPay]) {
                        await ws.applyFilterAsync("MY(Xyyyymm)", [targetMonth], "replace");
                    }
                    await new Promise(r => setTimeout(r, 400));
                    
                    const mUC = await wsUnitCount.getSummaryDataAsync({ maxRows: 50 });
                    const mUP = await wsUnitPay.getSummaryDataAsync({ maxRows: 50 });
                    const mHC = await wsHerbCount.getSummaryDataAsync({ maxRows: 50 });
                    const mHP = await wsHerbPay.getSummaryDataAsync({ maxRows: 50 });
                    
                    const uMap = {};
                    mUC.data.forEach(r => {
                        uMap[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0" };
                    });
                    mUP.data.forEach(r => {
                        const u = r[0].formattedValue;
                        if (!uMap[u]) uMap[u] = { count: "0", pay: r[1].formattedValue };
                        else uMap[u].pay = r[1].formattedValue;
                    });
                    
                    const hMap = {};
                    mHC.data.forEach(r => {
                        hMap[r[0].formattedValue] = { count: r[1].formattedValue, pay: "0" };
                    });
                    mHP.data.forEach(r => {
                        const h = r[0].formattedValue;
                        if (!hMap[h]) hMap[h] = { count: "0", pay: r[1].formattedValue };
                        else hMap[h].pay = r[1].formattedValue;
                    });
                    
                    return { units: uMap, herbs: hMap };
                }''', m)
                
                months_data[m] = m_res
                # Update unit monthly
                for uName, uVal in m_res["units"].items():
                    if uName in yr_data["units"]:
                        yr_data["units"][uName]["monthly"][m] = uVal
                        
                print(f"  Month {m}: {len(m_res['units'])} units, {len(m_res['herbs'])} herbs", flush=True)
                
            yr_data["months"] = months_data
            year_results[yr] = yr_data
            
        out_file = os.path.join(os.path.dirname(__file__), "extracted_s6_streamlined.json")
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(year_results, f, ensure_ascii=False, indent=2)
        print(f"\nSuccessfully saved all years to {out_file}", flush=True)
        
        # Verify Baankwae 06020 for 2569
        bkw_2569 = None
        for k, v in year_results.get("2569", {}).get("units", {}).items():
            if "บ้านแคว" in k:
                bkw_2569 = (k, v)
                break
        if bkw_2569:
            print(f"\n================ 06020 รพ.สต.บ้านแคว VERIFICATION 2569 ================")
            print(f"Unit Name: {bkw_2569[0]}")
            print(f"Total Count: {bkw_2569[1]['count']} ครั้ง")
            print(f"Total Pay: {bkw_2569[1]['pay']} บาท")
            print("Monthly breakdown:")
            sum_m_cnt = 0
            sum_m_pay = 0.0
            for m, mv in bkw_2569[1]["monthly"].items():
                c = parse_num(mv["count"])
                p = parse_num(mv["pay"])
                sum_m_cnt += c
                sum_m_pay += p
                print(f"  - {m}: {c} ครั้ง | {p:,.2f} บาท")
            print(f"Sum across months: {sum_m_cnt} ครั้ง | {sum_m_pay:,.2f} บาท")
            print(f"Herbs breakdown ({len(bkw_2569[1]['herbs'])} kinds):")
            for h, hv in sorted(bkw_2569[1]['herbs'].items(), key=lambda x: parse_num(x[1]['count']), reverse=True):
                print(f"  - {h}: {hv['count']} ครั้ง | {hv['pay']} บาท")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(extract_streamlined())

import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "nhso"))

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

YEAR_MONTHS = {
    "2569": [
        "ตุลาคม 2568", "พฤศจิกายน 2568", "ธันวาคม 2568",
        "มกราคม 2569", "กุมภาพันธ์ 2569", "มีนาคม 2569",
        "เมษายน 2569", "พฤษภาคม 2569", "มิถุนายน 2569",
        "กรกฎาคม 2569"
    ],
    "2568": [
        "ตุลาคม 2567", "พฤศจิกายน 2567", "ธันวาคม 2567",
        "มกราคม 2568", "กุมภาพันธ์ 2568", "มีนาคม 2568",
        "เมษายน 2568", "พฤษภาคม 2568", "มิถุนายน 2568",
        "กรกฎาคม 2568", "สิงหาคม 2568", "กันยายน 2568"
    ],
    "2567": [
        "ตุลาคม 2566", "พฤศจิกายน 2566", "ธันวาคม 2566",
        "มกราคม 2567", "กุมภาพันธ์ 2567", "มีนาคม 2567",
        "เมษายน 2567", "พฤษภาคม 2567", "มิถุนายน 2567",
        "กรกฎาคม 2567", "สิงหาคม 2567", "กันยายน 2567"
    ]
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

async def extract_granular_data():
    async with async_playwright() as p:
        print("เปิดเบราว์เซอร์ Chromium Headless...", flush=True)
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1680, "height": 1100})
        
        print("กำลังเชื่อมต่อ Tableau MeData...", flush=True)
        await page.goto("https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_selector("tableau-viz", timeout=40000)
        await asyncio.sleep(6)
        
        # -------------------------------------------------------------
        # 1. EXTRACT SHEET 4: ยาสมุนไพร 55 รายการ
        # -------------------------------------------------------------
        print("\n--- กำลังสกัด Sheet 4: ยาสมุนไพร 55 รายการ (Granular Unit x Month x Herb) ---", flush=True)
        s4_data = await page.evaluate('''async ({ years, yearMonths }) => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("4-ยาสมุนไพร 55 รายการ");
            await new Promise(r => setTimeout(r, 4000));
            const sheet = viz.workbook.activeSheet;
            
            const wsUnit = sheet.worksheets.find(w => w.name === 's4-herb-55gb-หน่วย-point');
            const wsHerb = sheet.worksheets.find(w => w.name === 's4-herb-55gb-ยาสมุนไพร-point');
            
            await wsUnit.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
            await wsUnit.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await wsUnit.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
            
            await wsHerb.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
            await wsHerb.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await wsHerb.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
            
            const result = {};
            for (const yr of years) {
                result[yr] = { units: {}, months: {}, unitMonthlyHerbs: {} };
                await wsUnit.clearFilterAsync("MY(Xyyyymm)");
                await wsHerb.clearFilterAsync("MY(Xyyyymm)");
                try { await wsHerb.clearFilterAsync("Hname"); } catch(e){}
                
                await wsUnit.applyFilterAsync("F Year", [yr], "replace");
                await wsHerb.applyFilterAsync("F Year", [yr], "replace");
                await new Promise(r => setTimeout(r, 800));
                
                // Units grand total
                const sU = await wsUnit.getSummaryDataAsync({ maxRows: 50 });
                const unitList = sU.data.map(r => ({ name: r[0].formattedValue, val: r[1].formattedValue }));
                
                // District herbs grand total
                const sH = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                result[yr].districtHerbs = sH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                
                // For each active unit, extract herbs & monthly herbs
                for (const u of unitList) {
                    await wsHerb.clearFilterAsync("MY(Xyyyymm)");
                    await wsHerb.applyFilterAsync("Hname", [u.name], "replace");
                    await new Promise(r => setTimeout(r, 400));
                    
                    const uHerbTotal = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                    result[yr].units[u.name] = {
                        total: u.val,
                        herbs: uHerbTotal.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue })),
                        monthly: {}
                    };
                    
                    // Check monthly for this unit
                    const months = yearMonths[yr] || [];
                    for (const m of months) {
                        await wsHerb.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                        await new Promise(r => setTimeout(r, 300));
                        const mHerb = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                        if (mHerb.data.length > 0) {
                            result[yr].units[u.name].monthly[m] = mHerb.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                        }
                    }
                }
                
                // District monthly herbs
                try { await wsHerb.clearFilterAsync("Hname"); } catch(e){}
                const months = yearMonths[yr] || [];
                for (const m of months) {
                    await wsHerb.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                    await new Promise(r => setTimeout(r, 350));
                    const dmH = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                    result[yr].months[m] = dmH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                }
            }
            return result;
        }''', {"years": ["2569", "2568", "2567"], "yearMonths": YEAR_MONTHS})
        
        print("  -> Sheet 4 สกัดสำเร็จ บันทึกโครงสร้างลงไฟล์ nhso_herb55_monthly.json", flush=True)
        
        # Load existing herb55 dataset and enhance with granular herbs
        h55_path = os.path.join(DATA_DIR, "nhso_herb55_monthly.json")
        h55 = json.load(open(h55_path, "r", encoding="utf-8"))
        
        for yr in ["2569", "2568", "2567"]:
            if yr not in s4_data or yr not in h55["data"]:
                continue
            yr_extracted = s4_data[yr]
            
            # Update units in h55
            for raw_uname, udata in yr_extracted.get("units", {}).items():
                code = match_hospcode(raw_uname)
                if not code or code not in h55["data"][yr]["units"]:
                    continue
                unit_entry = h55["data"][yr]["units"][code]
                
                herbs_dict = {}
                for h in udata.get("herbs", []):
                    herbs_dict[h["herb"]] = parse_num(h["val"])
                unit_entry["herbs"] = herbs_dict
                
                monthly_herbs = {}
                for m, hlist in udata.get("monthly", {}).items():
                    m_dict = {}
                    for h in hlist:
                        m_dict[h["herb"]] = parse_num(h["val"])
                    monthly_herbs[m] = m_dict
                unit_entry["monthlyHerbs"] = monthly_herbs
                
            # Update months district herbs
            for m, hlist in yr_extracted.get("months", {}).items():
                if m in h55["data"][yr]["months"]:
                    m_dict = {}
                    for h in hlist:
                        m_dict[h["herb"]] = parse_num(h["val"])
                    h55["data"][yr]["months"][m]["herbs"] = m_dict
                    
        with open(h55_path, "w", encoding="utf-8") as f:
            json.dump(h55, f, ensure_ascii=False, indent=2)
        print("  -> บันทึก nhso_herb55_monthly.json เรียบร้อย", flush=True)
        
        # -------------------------------------------------------------
        # 2. EXTRACT SHEET 6: ยาสมุนไพร 32 รายการ
        # -------------------------------------------------------------
        print("\n--- กำลังสกัด Sheet 6: ยาสมุนไพร 32 รายการ (Granular Unit x Month x Herb) ---", flush=True)
        s6_data = await page.evaluate('''async ({ years, yearMonths }) => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("6-ยาสมุนไพร 32 รายการ");
            await new Promise(r => setTimeout(r, 4000));
            const sheet = viz.workbook.activeSheet;
            
            const wsUnit = sheet.worksheets.find(w => w.name.includes("หน่วย-ครั้ง"));
            const wsHerb = sheet.worksheets.find(w => w.name.includes("บริการ-ครั้ง"));
            
            await wsUnit.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
            await wsUnit.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await wsUnit.applyFilterAsync("amphur_name", ["สารภี"], "replace");
            
            await wsHerb.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
            await wsHerb.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await wsHerb.applyFilterAsync("amphur_name", ["สารภี"], "replace");
            
            const result = {};
            for (const yr of years) {
                result[yr] = { units: {}, months: {} };
                await wsUnit.clearFilterAsync("MY(Xyyyymm)");
                await wsHerb.clearFilterAsync("MY(Xyyyymm)");
                try { await wsHerb.clearFilterAsync("Hname"); } catch(e){}
                
                await wsUnit.applyFilterAsync("F Year", [yr], "replace");
                await wsHerb.applyFilterAsync("F Year", [yr], "replace");
                await new Promise(r => setTimeout(r, 800));
                
                const sU = await wsUnit.getSummaryDataAsync({ maxRows: 50 });
                const unitList = sU.data.map(r => ({ name: r[0].formattedValue, val: r[1].formattedValue }));
                
                const sH = await wsHerb.getSummaryDataAsync({ maxRows: 100 });
                result[yr].districtItems = sH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                
                // For each active unit, extract herbs & monthly herbs
                for (const u of unitList) {
                    await wsHerb.clearFilterAsync("MY(Xyyyymm)");
                    await wsHerb.applyFilterAsync("Hname", [u.name], "replace");
                    await new Promise(r => setTimeout(r, 400));
                    
                    const uHerbTotal = await wsHerb.getSummaryDataAsync({ maxRows: 100 });
                    result[yr].units[u.name] = {
                        total: u.val,
                        herbs: uHerbTotal.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue })),
                        monthly: {}
                    };
                    
                    // Monthly for this unit
                    const months = yearMonths[yr] || [];
                    for (const m of months) {
                        await wsHerb.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                        await new Promise(r => setTimeout(r, 300));
                        const mHerb = await wsHerb.getSummaryDataAsync({ maxRows: 100 });
                        if (mHerb.data.length > 0) {
                            result[yr].units[u.name].monthly[m] = mHerb.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                        }
                    }
                }
                
                // District monthly herbs
                try { await wsHerb.clearFilterAsync("Hname"); } catch(e){}
                const months = yearMonths[yr] || [];
                for (const m of months) {
                    await wsHerb.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                    await new Promise(r => setTimeout(r, 350));
                    const dmH = await wsHerb.getSummaryDataAsync({ maxRows: 100 });
                    result[yr].months[m] = dmH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                }
            }
            return result;
        }''', {"years": ["2569", "2568", "2567"], "yearMonths": YEAR_MONTHS})
        
        print("  -> Sheet 6 สกัดสำเร็จ บันทึกโครงสร้างลงไฟล์ nhso_herb32_monthly.json", flush=True)
        
        h32_path = os.path.join(DATA_DIR, "nhso_herb32_monthly.json")
        h32 = json.load(open(h32_path, "r", encoding="utf-8"))
        
        for yr in ["2569", "2568", "2567"]:
            if yr not in s6_data or yr not in h32["data"]:
                continue
            yr_extracted = s6_data[yr]
            
            for raw_uname, udata in yr_extracted.get("units", {}).items():
                code = match_hospcode(raw_uname)
                if not code or code not in h32["data"][yr]["units"]:
                    continue
                unit_entry = h32["data"][yr]["units"][code]
                
                herbs_dict = {}
                for h in udata.get("herbs", []):
                    herbs_dict[h["herb"]] = parse_num(h["val"])
                unit_entry["herbs"] = herbs_dict
                
                monthly_herbs = {}
                for m, hlist in udata.get("monthly", {}).items():
                    m_dict = {}
                    for h in hlist:
                        m_dict[h["herb"]] = parse_num(h["val"])
                    monthly_herbs[m] = m_dict
                unit_entry["monthlyHerbs"] = monthly_herbs
                
            for m, hlist in yr_extracted.get("months", {}).items():
                if m in h32["data"][yr]["months"]:
                    m_dict = {}
                    for h in hlist:
                        m_dict[h["herb"]] = parse_num(h["val"])
                    h32["data"][yr]["months"][m]["items"] = m_dict
                    
        with open(h32_path, "w", encoding="utf-8") as f:
            json.dump(h32, f, ensure_ascii=False, indent=2)
        print("  -> บันทึก nhso_herb32_monthly.json เรียบร้อย", flush=True)

        # -------------------------------------------------------------
        # 3. EXTRACT SHEET 5: ยาสมุนไพร 9 รายการ
        # -------------------------------------------------------------
        print("\n--- กำลังสกัด Sheet 5: ยาสมุนไพร 9 รายการ (Granular Unit x Month x Herb) ---", flush=True)
        s5_data = await page.evaluate('''async ({ years, yearMonths }) => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("5-ยาสมุนไพร 9 รายการ");
            await new Promise(r => setTimeout(r, 4000));
            const sheet = viz.workbook.activeSheet;
            
            const wsUnit = sheet.worksheets.find(w => w.name.includes("หน่วย-ครั้ง"));
            const wsHerb = sheet.worksheets.find(w => w.name.includes("บริการ-ครั้ง"));
            
            await wsUnit.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
            await wsUnit.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await wsUnit.applyFilterAsync("amphur_name", ["สารภี"], "replace");
            
            await wsHerb.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
            await wsHerb.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await wsHerb.applyFilterAsync("amphur_name", ["สารภี"], "replace");
            
            const result = {};
            for (const yr of years) {
                result[yr] = { units: {}, months: {} };
                await wsUnit.clearFilterAsync("MY(xyyyymm)");
                await wsHerb.clearFilterAsync("MY(xyyyymm)");
                try { await wsHerb.clearFilterAsync("Hname"); } catch(e){}
                
                await wsUnit.applyFilterAsync("F Year", [yr], "replace");
                await wsHerb.applyFilterAsync("F Year", [yr], "replace");
                await new Promise(r => setTimeout(r, 800));
                
                const sU = await wsUnit.getSummaryDataAsync({ maxRows: 50 });
                const unitList = sU.data.map(r => ({ name: r[0].formattedValue, val: r[1].formattedValue }));
                
                const sH = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                result[yr].districtItems = sH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                
                for (const u of unitList) {
                    await wsHerb.clearFilterAsync("MY(xyyyymm)");
                    await wsHerb.applyFilterAsync("Hname", [u.name], "replace");
                    await new Promise(r => setTimeout(r, 400));
                    
                    const uHerbTotal = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                    result[yr].units[u.name] = {
                        total: u.val,
                        herbs: uHerbTotal.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue })),
                        monthly: {}
                    };
                    
                    const months = yearMonths[yr] || [];
                    for (const m of months) {
                        await wsHerb.applyFilterAsync("MY(xyyyymm)", [m], "replace");
                        await new Promise(r => setTimeout(r, 300));
                        const mHerb = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                        if (mHerb.data.length > 0) {
                            result[yr].units[u.name].monthly[m] = mHerb.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                        }
                    }
                }
                
                try { await wsHerb.clearFilterAsync("Hname"); } catch(e){}
                const months = yearMonths[yr] || [];
                for (const m of months) {
                    await wsHerb.applyFilterAsync("MY(xyyyymm)", [m], "replace");
                    await new Promise(r => setTimeout(r, 350));
                    const dmH = await wsHerb.getSummaryDataAsync({ maxRows: 50 });
                    result[yr].months[m] = dmH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }));
                }
            }
            return result;
        }''', {"years": ["2568", "2567"], "yearMonths": YEAR_MONTHS})
        
        print("  -> Sheet 5 สกัดสำเร็จ บันทึกโครงสร้างลงไฟล์ nhso_herb9_monthly.json", flush=True)
        
        h9_path = os.path.join(DATA_DIR, "nhso_herb9_monthly.json")
        h9 = json.load(open(h9_path, "r", encoding="utf-8"))
        
        for yr in ["2568", "2567"]:
            if yr not in s5_data or yr not in h9["data"]:
                continue
            yr_extracted = s5_data[yr]
            
            for raw_uname, udata in yr_extracted.get("units", {}).items():
                code = match_hospcode(raw_uname)
                if not code or code not in h9["data"][yr]["units"]:
                    continue
                unit_entry = h9["data"][yr]["units"][code]
                
                herbs_dict = {}
                for h in udata.get("herbs", []):
                    herbs_dict[h["herb"]] = parse_num(h["val"])
                unit_entry["herbs"] = herbs_dict
                
                monthly_herbs = {}
                for m, hlist in udata.get("monthly", {}).items():
                    m_dict = {}
                    for h in hlist:
                        m_dict[h["herb"]] = parse_num(h["val"])
                    monthly_herbs[m] = m_dict
                unit_entry["monthlyHerbs"] = monthly_herbs
                
            for m, hlist in yr_extracted.get("months", {}).items():
                if m in h9["data"][yr]["months"]:
                    m_dict = {}
                    for h in hlist:
                        m_dict[h["herb"]] = parse_num(h["val"])
                    h9["data"][yr]["months"][m]["items"] = m_dict
                    
        with open(h9_path, "w", encoding="utf-8") as f:
            json.dump(h9, f, ensure_ascii=False, indent=2)
        print("  -> บันทึก nhso_herb9_monthly.json เรียบร้อย", flush=True)

        # -------------------------------------------------------------
        # 4. UPDATE nhso_saraphi_master.json
        # -------------------------------------------------------------
        print("\n--- กำลังอัปเดต nhso_saraphi_master.json ---", flush=True)
        master_path = os.path.join(DATA_DIR, "nhso_saraphi_master.json")
        master = json.load(open(master_path, "r", encoding="utf-8"))
        
        master["sheets"]["4-ยาสมุนไพร 55 รายการ"]["monthly_dataset"] = h55
        master["sheets"]["6-ยาสมุนไพร 32 รายการ"]["monthly_dataset"] = h32
        master["sheets"]["5-ยาสมุนไพร 9 รายการ"]["monthly_dataset"] = h9
        master["last_sync_timestamp"] = datetime.now().isoformat()
        
        with open(master_path, "w", encoding="utf-8") as f:
            json.dump(master, f, ensure_ascii=False, indent=2)
        print("  -> บันทึก nhso_saraphi_master.json สมบูรณ์แบบ 100%!", flush=True)
        
        await browser.close()
        print("\n=== การสกัดข้อมูล Granular Herb Breakdown สำเร็จเสร็จสิ้น! ===", flush=True)

if __name__ == "__main__":
    asyncio.run(extract_granular_data())

import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "nhso")
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def wait_step(ms=3500):
    await asyncio.sleep(ms / 1000.0)

async def extract_all_nhso_data():
    print("==================================================", flush=True)
    print("Starting NHSO MeData Extraction for Saraphi District", flush=True)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print("==================================================", flush=True)

    results = {
        "timestamp": datetime.now().isoformat(),
        "district": "สารภี",
        "province": "เชียงใหม่",
        "zone": "เขต 1 เชียงใหม่",
        "sheets": {}
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1680, "height": 1100})
        page = await context.new_page()

        print("Navigating to medata.nhso.go.th...", flush=True)
        try:
            await page.goto("https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y", wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            print(f"Error navigating: {e}", flush=True)
            await browser.close()
            return False

        print("Waiting 12s for Tableau Viz to initialize...", flush=True)
        await asyncio.sleep(12)

        # ----------------------------------------------------
        # SHEET 3: บริการแพทย์แผนไทย (หัตถการ: Point & บาท)
        # ----------------------------------------------------
        print("\n[1/4] Extracting Sheet 3: บริการแพทย์แผนไทย...", flush=True)
        s3_data = await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            if (!viz || !viz.workbook) return { error: "No workbook" };
            
            await viz.workbook.activateSheetAsync("3-บริการแพทย์แผนไทย");
            await new Promise(r => setTimeout(r, 4000));

            const sheet = viz.workbook.activeSheet;
            const wsPoint = sheet.worksheets.find(w => w.name.includes("หน่วย-point"));
            const wsBath = sheet.worksheets.find(w => w.name.includes("หน่วย-บาท"));
            const wsServicePoint = sheet.worksheets.find(w => w.name.includes("บริการ-point"));
            const wsServiceBath = sheet.worksheets.find(w => w.name.includes("บริการ-บาท"));

            // Filter zone, province, amphur
            if (wsPoint) {
                try { await wsPoint.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            if (wsBath) {
                try { await wsBath.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("Amphur Name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            // Also filter service worksheets if possible
            if (wsServicePoint) {
                try { await wsServicePoint.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsServicePoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsServicePoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace"); } catch(e){}
            }
            if (wsServiceBath) {
                try { await wsServiceBath.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsServiceBath.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsServiceBath.applyFilterAsync("Amphur Name", ["สารภี"], "replace"); } catch(e){}
            }

            await new Promise(r => setTimeout(r, 3000));

            // Extract
            let unitPoints = [];
            let unitBaths = [];
            let servicePoints = [];
            let serviceBaths = [];

            try {
                const d = await wsPoint.getSummaryDataAsync({ maxRows: 100 });
                unitPoints = d.data.map(r => ({ unit: r[0].formattedValue, point: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsBath.getSummaryDataAsync({ maxRows: 100 });
                unitBaths = d.data.map(r => ({ unit: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsServicePoint.getSummaryDataAsync({ maxRows: 50 });
                servicePoints = d.data.map(r => ({ service: r[0].formattedValue, point: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsServiceBath.getSummaryDataAsync({ maxRows: 50 });
                serviceBaths = d.data.map(r => ({ service: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            return { unitPoints, unitBaths, servicePoints, serviceBaths };
        }''')
        print(f"Sheet 3 Extracted: {len(s3_data.get('unitPoints', []))} units", flush=True)
        results["sheets"]["sheet3_service"] = s3_data

        # ----------------------------------------------------
        # SHEET 4: ยาสมุนไพร 55 รายการ (Point System)
        # ----------------------------------------------------
        print("\n[2/4] Extracting Sheet 4: ยาสมุนไพร 55 รายการ...", flush=True)
        s4_data = await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("4-ยาสมุนไพร 55 รายการ");
            await new Promise(r => setTimeout(r, 4000));

            const sheet = viz.workbook.activeSheet;
            const wsPoint = sheet.worksheets.find(w => w.name.includes("หน่วย-point"));
            const wsBath = sheet.worksheets.find(w => w.name.includes("หน่วย-บาท") || w.name.includes("หน่วย-บ"));
            const wsHerbPoint = sheet.worksheets.find(w => w.name.includes("สมุนไพร-point"));
            const wsHerbBath = sheet.worksheets.find(w => w.name.includes("สมุนไพร-บาท") || w.name.includes("สมุนไพร-บ"));

            if (wsPoint) {
                try { await wsPoint.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            if (wsBath) {
                try { await wsBath.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("Amphur Name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            if (wsHerbPoint) {
                try { await wsHerbPoint.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsHerbPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsHerbPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace"); } catch(e){}
            }

            await new Promise(r => setTimeout(r, 3000));

            let unitPoints = [];
            let unitBaths = [];
            let herbPoints = [];
            let herbBaths = [];

            try {
                const d = await wsPoint.getSummaryDataAsync({ maxRows: 100 });
                unitPoints = d.data.map(r => ({ unit: r[0].formattedValue, point: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsBath.getSummaryDataAsync({ maxRows: 100 });
                unitBaths = d.data.map(r => ({ unit: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsHerbPoint.getSummaryDataAsync({ maxRows: 100 });
                herbPoints = d.data.map(r => ({ herb: r[0].formattedValue, point: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsHerbBath.getSummaryDataAsync({ maxRows: 100 });
                herbBaths = d.data.map(r => ({ herb: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            return { unitPoints, unitBaths, herbPoints, herbBaths };
        }''')
        print(f"Sheet 4 Extracted: {len(s4_data.get('unitPoints', []))} units", flush=True)
        results["sheets"]["sheet4_herb55"] = s4_data

        # ----------------------------------------------------
        # SHEET 5: ยาสมุนไพร 9 รายการ (Fee Schedule)
        # ----------------------------------------------------
        print("\n[3/4] Extracting Sheet 5: ยาสมุนไพร 9 รายการ...", flush=True)
        s5_data = await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("5-ยาสมุนไพร 9 รายการ");
            await new Promise(r => setTimeout(r, 4000));

            const sheet = viz.workbook.activeSheet;
            const wsCnt = sheet.worksheets.find(w => w.name.includes("หน่วย-ครั้ง") || w.name.includes("หน่วย-ค"));
            const wsBath = sheet.worksheets.find(w => w.name.includes("หน่วย-บาท") || w.name.includes("หน่วย-บ"));
            const wsItemCnt = sheet.worksheets.find(w => w.name.includes("บริการ-ครั้ง") || w.name.includes("บริการ-ค"));
            const wsItemBath = sheet.worksheets.find(w => w.name.includes("บริการ-บาท") || w.name.includes("บริการ-บ"));

            if (wsCnt) {
                try { await wsCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            if (wsBath) {
                try { await wsBath.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("amphur_name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            if (wsItemCnt) {
                try { await wsItemCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsItemCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsItemCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace"); } catch(e){}
            }

            await new Promise(r => setTimeout(r, 3000));

            let unitCounts = [];
            let unitBaths = [];
            let itemCounts = [];
            let itemBaths = [];

            try {
                const d = await wsCnt.getSummaryDataAsync({ maxRows: 100 });
                unitCounts = d.data.map(r => ({ unit: r[0].formattedValue, count: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsBath.getSummaryDataAsync({ maxRows: 100 });
                unitBaths = d.data.map(r => ({ unit: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsItemCnt.getSummaryDataAsync({ maxRows: 50 });
                itemCounts = d.data.map(r => ({ item: r[0].formattedValue, count: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsItemBath.getSummaryDataAsync({ maxRows: 50 });
                itemBaths = d.data.map(r => ({ item: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            return { unitCounts, unitBaths, itemCounts, itemBaths };
        }''')
        print(f"Sheet 5 Extracted: {len(s5_data.get('unitCounts', []))} units", flush=True)
        results["sheets"]["sheet5_herb9"] = s5_data

        # ----------------------------------------------------
        # SHEET 6: ยาสมุนไพร 32 รายการ (บาท / Point)
        # ----------------------------------------------------
        print("\n[4/4] Extracting Sheet 6: ยาสมุนไพร 32 รายการ...", flush=True)
        s6_data = await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("6-ยาสมุนไพร 32 รายการ");
            await new Promise(r => setTimeout(r, 4000));

            const sheet = viz.workbook.activeSheet;
            const wsCnt = sheet.worksheets.find(w => w.name.includes("หน่วย-ครั้ง") || w.name.includes("หน่วย-ค"));
            const wsBath = sheet.worksheets.find(w => w.name.includes("หน่วย-บาท") || w.name.includes("หน่วย-บ"));
            const wsHerbCnt = sheet.worksheets.find(w => w.name.includes("บริการ-ครั้ง") || w.name.includes("บริการ-ค"));
            const wsHerbBath = sheet.worksheets.find(w => w.name.includes("บริการ-บาท") || w.name.includes("บริการ-บ"));

            if (wsCnt) {
                try { await wsCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 2000));
                try { await wsCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            if (wsBath) {
                try { await wsBath.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsBath.applyFilterAsync("amphur_name", ["สารภี"], "replace"); } catch(e){}
                await new Promise(r => setTimeout(r, 3000));
            }

            if (wsHerbCnt) {
                try { await wsHerbCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                try { await wsHerbCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace"); } catch(e){}
                try { await wsHerbCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace"); } catch(e){}
            }

            await new Promise(r => setTimeout(r, 3000));

            let unitCounts = [];
            let unitBaths = [];
            let herbCounts = [];
            let herbBaths = [];

            try {
                const d = await wsCnt.getSummaryDataAsync({ maxRows: 100 });
                unitCounts = d.data.map(r => ({ unit: r[0].formattedValue, count: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsBath.getSummaryDataAsync({ maxRows: 100 });
                unitBaths = d.data.map(r => ({ unit: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsHerbCnt.getSummaryDataAsync({ maxRows: 100 });
                herbCounts = d.data.map(r => ({ herb: r[0].formattedValue, count: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            try {
                const d = await wsHerbBath.getSummaryDataAsync({ maxRows: 100 });
                herbBaths = d.data.map(r => ({ herb: r[0].formattedValue, bath: parseFloat(r[1].value) || 0 }));
            } catch(e){}

            return { unitCounts, unitBaths, herbCounts, herbBaths };
        }''')
        print(f"Sheet 6 Extracted: {len(s6_data.get('unitCounts', []))} units", flush=True)
        results["sheets"]["sheet6_herb32"] = s6_data

        await browser.close()

    # ----------------------------------------------------
    # DATA VALIDATION & ERROR PREVENTION
    # ----------------------------------------------------
    print("\n--------------------------------------------------", flush=True)
    print("Performing Rigorous Data Validation...", flush=True)
    print("--------------------------------------------------", flush=True)

    validation_errors = []
    total_units_found = set()

    for s_name, s_content in results["sheets"].items():
        units_in_sheet = []
        for key in ["unitPoints", "unitBaths", "unitCounts"]:
            if key in s_content and s_content[key]:
                units_in_sheet.extend([u["unit"] for u in s_content[key]])
        
        unique_units = set(units_in_sheet)
        total_units_found.update(unique_units)
        print(f"  • {s_name}: {len(unique_units)} health units found")

        saraphi_matches = [u for u in unique_units if "สารภี" in u or "รพ." in u or "รพ.สต." in u]
        if not saraphi_matches:
            validation_errors.append(f"{s_name}: No recognized hospital or health center names found!")

    print(f"Total unique units across all sheets: {len(total_units_found)} units")
    for u in sorted(total_units_found):
        print(f"    - {u}")

    results["validation"] = {
        "status": "PASS" if not validation_errors else "WARNING",
        "errors": validation_errors,
        "totalUnitsCount": len(total_units_found)
    }

    # ----------------------------------------------------
    # BUILD INTEGRATED MASTER SARAPHI NHSO DATASET
    # ----------------------------------------------------
    SARAPHI_MAP = {
        "06014": {"name": "รพ.สต.บ้านยางเนิ้ง", "aliases": ["ยางเนิ้ง", "บ้านยางเนิ้ง"]},
        "06015": {"name": "รพ.สต.บ้านพญาชมภู", "aliases": ["พญาชมภู", "บ้านพญาชมภู"]},
        "06016": {"name": "รพ.สต.บ้านศรีสองเมือง", "aliases": ["ศรีสองเมือง", "สองแคว", "ไชยสถาน"]},
        "06017": {"name": "รพ.สต.บ้านหัวดง", "aliases": ["หัวดง", "บ้านหัวดง", "ขัวมุง"]},
        "06018": {"name": "รพ.สต.บ้านหนองแฝก", "aliases": ["หนองแฝก", "บ้านหนองแฝก"]},
        "06020": {"name": "รพ.สต.บ้านแคว (ท่ากว้าง)", "aliases": ["บ้านแคว", "ท่ากว้าง"]},
        "06021": {"name": "รพ.สต.บ้านสันต้นกอก", "aliases": ["สันต้นกอก", "ดอนแก้ว"]},
        "06022": {"name": "รพ.สต.บ้านบวกครกเหนือ", "aliases": ["บวกครกเหนือ", "ท่าวังตาล"]},
        "06023": {"name": "รพ.สต.บ้านป่าเส้า", "aliases": ["ป่าเส้า", "สันทราย"]},
        "06024": {"name": "รพ.สต.บ้านศรีคำชมภู", "aliases": ["ศรีคำชมภู", "ป่าบง"]},
        "11135": {"name": "รพ.สารภี", "aliases": ["รพ.สารภี", "โรงพยาบาลสารภี"]},
        "13994": {"name": "รพ.สต.บ้านท่าต้นกวาว", "aliases": ["ท่าต้นกวาว"]},
        "14461": {"name": "รพ.สต.บ้านหนองผึ้ง", "aliases": ["หนองผึ้ง", "บ้านหนองผึ้ง"]},
        "99758": {"name": "ศสม.สารภี", "aliases": ["ศสม", "ศูนย์สุขภาพชุมชน"]}
    }

    def match_hospcode(raw_name):
        for code, info in SARAPHI_MAP.items():
            if info["name"] in raw_name:
                return code
            for alias in info["aliases"]:
                if alias in raw_name:
                    return code
        return None

    unit_summary = {}
    for code, info in SARAPHI_MAP.items():
        unit_summary[code] = {
            "hospcode": code,
            "name": info["name"],
            "sheet3_service_point": 0,
            "sheet3_service_bath": 0,
            "sheet4_herb55_point": 0,
            "sheet4_herb55_bath": 0,
            "sheet5_herb9_count": 0,
            "sheet5_herb9_bath": 0,
            "sheet6_herb32_count": 0,
            "sheet6_herb32_bath": 0,
            "total_bath": 0,
            "total_point": 0
        }

    # Populate Sheet 3
    for p in results["sheets"]["sheet3_service"].get("unitPoints", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet3_service_point"] = p["point"]
    for b in results["sheets"]["sheet3_service"].get("unitBaths", []):
        c = match_hospcode(b["unit"])
        if c:
            unit_summary[c]["sheet3_service_bath"] = b["bath"]

    # Populate Sheet 4
    for p in results["sheets"]["sheet4_herb55"].get("unitPoints", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet4_herb55_point"] = p["point"]
    for b in results["sheets"]["sheet4_herb55"].get("unitBaths", []):
        c = match_hospcode(b["unit"])
        if c:
            unit_summary[c]["sheet4_herb55_bath"] = b["bath"]

    # Populate Sheet 5
    for p in results["sheets"]["sheet5_herb9"].get("unitCounts", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet5_herb9_count"] = p["count"]
    for b in results["sheets"]["sheet5_herb9"].get("unitBaths", []):
        c = match_hospcode(b["unit"])
        if c:
            unit_summary[c]["sheet5_herb9_bath"] = b["bath"]

    # Populate Sheet 6
    for p in results["sheets"]["sheet6_herb32"].get("unitCounts", []):
        c = match_hospcode(p["unit"])
        if c:
            unit_summary[c]["sheet6_herb32_count"] = p["count"]
    for b in results["sheets"]["sheet6_herb32"].get("unitBaths", []):
        c = match_hospcode(b["unit"])
        if c:
            unit_summary[c]["sheet6_herb32_bath"] = b["bath"]

    district_total = {
        "sheet3_service_point": 0,
        "sheet3_service_bath": 0,
        "sheet4_herb55_point": 0,
        "sheet4_herb55_bath": 0,
        "sheet5_herb9_count": 0,
        "sheet5_herb9_bath": 0,
        "sheet6_herb32_count": 0,
        "sheet6_herb32_bath": 0,
        "total_bath": 0,
        "total_point": 0
    }

    for code, u in unit_summary.items():
        u["total_point"] = u["sheet3_service_point"] + u["sheet4_herb55_point"]
        u["total_bath"] = (
            u["sheet3_service_bath"] +
            u["sheet4_herb55_bath"] +
            u["sheet5_herb9_bath"] +
            u["sheet6_herb32_bath"]
        )
        for k in district_total:
            district_total[k] += u[k]

    results["aggregated"] = {
        "district_total": district_total,
        "units": unit_summary
    }

    out_master = os.path.join(OUTPUT_DIR, "nhso_saraphi_master.json")
    with open(out_master, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\nSaved master file to: {out_master}", flush=True)

    for key, data in results["sheets"].items():
        sheet_path = os.path.join(OUTPUT_DIR, f"{key}.json")
        with open(sheet_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved: {sheet_path}", flush=True)

    print("\n==================================================", flush=True)
    print("NHSO MeData Extraction & Aggregation Completed!", flush=True)
    print(f"District Total Compensation: {district_total['total_bath']:,.2f} บาท", flush=True)
    print(f"District Total Point: {district_total['total_point']:,.0f} Point", flush=True)
    print("==================================================", flush=True)
    return True

if __name__ == "__main__":
    asyncio.run(extract_all_nhso_data())

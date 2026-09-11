import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "nhso", "nhso_procedure_types.json")

SARAPHI_MAP = {
    "06014": {"name": "รพ.สต.บ้านยางเนิ้ง", "aliases": ["ยางเนิ้ง", "บ้านยางเนิ้ง"]},
    "06015": {"name": "รพ.สต.บ้านพญาชมภู", "aliases": ["พญาชมภู", "บ้านพญาชมภู", "พญาชมพู", "บ้านพญาชมพู"]},
    "06016": {"name": "รพ.สต.บ้านศรีสองเมือง", "aliases": ["ศรีสองเมือง", "สองแคว", "ไชยสถาน"]},
    "06017": {"name": "รพ.สต.บ้านหัวดง", "aliases": ["หัวดง", "บ้านหัวดง", "ขัวมุง"]},
    "06018": {"name": "รพ.สต.บ้านหนองแฝก", "aliases": ["หนองแฝก", "บ้านหนองแฝก"]},
    "06020": {"name": "รพ.สต.บ้านแคว (ท่ากว้าง)", "aliases": ["บ้านแคว", "ท่ากว้าง", "แคว"]},
    "06021": {"name": "รพ.สต.บ้านสันต้นกอก", "aliases": ["สันต้นกอก", "ดอนแก้ว"]},
    "06022": {"name": "รพ.สต.บ้านบวกครกเหนือ", "aliases": ["บวกครกเหนือ", "ท่าวังตาล"]},
    "06023": {"name": "รพ.สต.บ้านป่าเส้า", "aliases": ["ป่าเส้า", "บ้านป่าเส้า", "ป่าสา", "บ้านป่าสา", "สันทราย"]},
    "06024": {"name": "รพ.สต.บ้านศรีคำชมภู", "aliases": ["ศรีคำชมภู", "ป่าบง"]},
    "11135": {"name": "รพ.สารภี", "aliases": ["รพ.สารภี", "โรงพยาบาลสารภี", "สารภี"]},
    "13994": {"name": "รพ.สต.บ้านท่าต้นกวาว", "aliases": ["ท่าต้นกวาว", "บ้านท่าต้นกวาว"]},
    "14461": {"name": "รพ.สต.บ้านหนองผึ้ง", "aliases": ["หนองผึ้ง", "บ้านหนองผึ้ง"]},
    "99758": {"name": "ศสม.สารภี", "aliases": ["ศสม", "ศูนย์สุขภาพชุมชน"]}
}

SERVICES = [
    'การฟื้นฟูมารดาหลังคลอด',
    'นวด',
    'นวด+ประคบ',
    'ประคบ',
    'พอกเข่า',
    'อบสมุนไพร'
]

YEARS = ["2569", "2568", "2567"]

def match_hospcode(raw_name):
    clean = raw_name.replace("ตำบล", " ").replace("ต.", " ")
    for code, info in SARAPHI_MAP.items():
        if info["name"] in clean:
            return code
        for alias in info["aliases"]:
            if alias in clean:
                return code
    return None

async def extract_procedures():
    print("==================================================", flush=True)
    print("Extracting Procedure Types (หัตถการ 6 ประเภท) from MeData Sheet 3", flush=True)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print("==================================================", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1680, "height": 1100})
        print("Navigating to medata.nhso.go.th...", flush=True)
        try:
            await page.goto("https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y", wait_until="domcontentloaded", timeout=60000)
        except Exception as e:
            print(f"Navigation error: {e}", flush=True)
            await browser.close()
            return False

        print("Waiting for Tableau Viz activeSheet...", flush=True)
        await page.wait_for_function('''() => {
            const viz = document.querySelector('tableau-viz');
            try {
                return !!(viz && viz.workbook && viz.workbook.activeSheet);
            } catch(e) {
                return false;
            }
        }''', timeout=60000)
        await asyncio.sleep(3)

        print("Activating Sheet 3: 3-บริการแพทย์แผนไทย...", flush=True)
        raw_results = await page.evaluate('''async ({ services, years }) => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("3-บริการแพทย์แผนไทย");
            await new Promise(r => setTimeout(r, 4000));
            const s3 = viz.workbook.activeSheet;
            const wsPoint = s3.worksheets.find(w => w.name.includes("หน่วย-point"));

            if (!wsPoint) return { error: "wsPoint not found" };

            // Apply geographic filters
            await wsPoint.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace");
            await new Promise(r => setTimeout(r, 1000));
            await wsPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await new Promise(r => setTimeout(r, 1000));
            await wsPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
            await new Promise(r => setTimeout(r, 1500));

            const res = {};

            for (const yr of years) {
                res[yr] = {};
                await wsPoint.applyFilterAsync("F Year", [yr], "replace");
                await new Promise(r => setTimeout(r, 1500));

                for (const s of services) {
                    try {
                        await wsPoint.applyFilterAsync("TTM type Thai", [s], "replace");
                        await new Promise(r => setTimeout(r, 1200));
                        const d = await wsPoint.getSummaryDataAsync({ maxRows: 50 });
                        res[yr][s] = d.data.map(r => ({
                            unit: r[0].formattedValue,
                            point: parseFloat(r[1].value) || 0
                        }));
                    } catch(e) {
                        res[yr][s] = [];
                    }
                }
            }
            return res;
        }''', { "services": SERVICES, "years": YEARS })

        await browser.close()

        # Structure dataset
        dataset = {
            "timestamp": datetime.now().isoformat(),
            "district": "สารภี",
            "province": "เชียงใหม่",
            "zone": "เขต 1 เชียงใหม่",
            "years": YEARS,
            "services": SERVICES,
            "data": {}
        }

        for yr in YEARS:
            yr_raw = raw_results.get(yr, {})
            district_summary = {s: 0 for s in SERVICES}
            district_total = 0

            # Initialize 14 units
            units_data = {}
            for code, info in SARAPHI_MAP.items():
                units_data[code] = {
                    "hospcode": code,
                    "name": info["name"],
                    "services": {s: 0 for s in SERVICES},
                    "totalPoint": 0
                }

            for s in SERVICES:
                rows = yr_raw.get(s, [])
                service_sum = 0
                for r in rows:
                    unit_name = r["unit"]
                    pt = r["point"]
                    code = match_hospcode(unit_name)
                    if code and code in units_data:
                        units_data[code]["services"][s] = pt
                        units_data[code]["totalPoint"] += pt
                        service_sum += pt
                    elif pt > 0:
                        print(f"Warning: Unmatched unit with points: {unit_name} ({pt})")
                district_summary[s] = service_sum
                district_total += service_sum

            dataset["data"][yr] = {
                "districtSummary": district_summary,
                "districtTotal": district_total,
                "units": units_data
            }
            print(f"Year {yr}: Total District Procedure Points = {district_total:,.0f} pts")

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)

        print(f"\nSaved procedure types dataset to {OUTPUT_PATH} successfully!")
        return True

if __name__ == "__main__":
    asyncio.run(extract_procedures())

import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

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
    "06023": {"name": "รพ.สต.บ้านป่าสา", "aliases": ["ป่าเส้า", "บ้านป่าเส้า", "ป่าสา", "บ้านป่าสา", "สันทราย"]},
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
    clean = raw_name.replace("ตำบล", " ").replace("ต.", " ")
    for code, info in SARAPHI_MAP.items():
        if info["name"] in clean:
            return code
        for alias in info["aliases"]:
            if alias in clean:
                return code
    return None

async def extract_all_procedures():
    print("==================================================", flush=True)
    print("Extracting Procedure Types (หัตถการ 6 ประเภท x รายเดือน) from MeData Sheet 3", flush=True)
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
        raw_results = await page.evaluate('''async ({ yearMonths, services }) => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("3-บริการแพทย์แผนไทย");
            await new Promise(r => setTimeout(r, 4000));
            const s3 = viz.workbook.activeSheet;
            const wsPoint = s3.worksheets.find(w => w.name.includes("หน่วย-point"));

            if (!wsPoint) return { error: "wsPoint not found" };

            // Apply geographic filters
            await wsPoint.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace");
            await new Promise(r => setTimeout(r, 400));
            await wsPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
            await new Promise(r => setTimeout(r, 400));
            await wsPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
            await new Promise(r => setTimeout(r, 600));

            const res = {};

            for (const [yr, months] of Object.entries(yearMonths)) {
                res[yr] = {};
                await wsPoint.applyFilterAsync("F Year", [yr], "replace");
                await new Promise(r => setTimeout(r, 800));

                for (const m of months) {
                    res[yr][m] = {};
                    await wsPoint.applyFilterAsync("MY(xyyyymm)", [m], "replace");
                    await new Promise(r => setTimeout(r, 400));

                    for (const s of services) {
                        try {
                            await wsPoint.applyFilterAsync("TTM type Thai", [s], "replace");
                            await new Promise(r => setTimeout(r, 350));
                            const d = await wsPoint.getSummaryDataAsync({ maxRows: 30 });
                            res[yr][m][s] = d.data.map(r => ({
                                unit: r[0].formattedValue,
                                point: parseFloat(r[1].value) || 0
                            }));
                        } catch(e) {
                            res[yr][m][s] = [];
                        }
                    }
                }
            }
            return res;
        }''', { "yearMonths": YEAR_MONTHS, "services": SERVICES })

        await browser.close()

        # Structure dataset
        dataset = {
            "timestamp": datetime.now().isoformat(),
            "district": "สารภี",
            "province": "เชียงใหม่",
            "zone": "เขต 1 เชียงใหม่",
            "years": list(YEAR_MONTHS.keys()),
            "services": SERVICES,
            "data": {}
        }

        for yr, months in YEAR_MONTHS.items():
            yr_raw = raw_results.get(yr, {})
            district_summary_total = {s: 0 for s in SERVICES}
            district_grand_total = 0

            # Initialize 14 units for the year
            units_data = {}
            for code, info in SARAPHI_MAP.items():
                units_data[code] = {
                    "hospcode": code,
                    "name": info["name"],
                    "services": {s: 0 for s in SERVICES},
                    "totalPoint": 0,
                    "byMonth": {}
                }

            months_data = {}

            for m in months:
                m_raw = yr_raw.get(m, {})
                m_district_summary = {s: 0 for s in SERVICES}
                m_district_total = 0

                # Initialize month unit records
                m_units = {}
                for code, info in SARAPHI_MAP.items():
                    m_units[code] = {
                        "hospcode": code,
                        "name": info["name"],
                        "services": {s: 0 for s in SERVICES},
                        "totalPoint": 0
                    }

                for s in SERVICES:
                    rows = m_raw.get(s, [])
                    s_sum = 0
                    for r in rows:
                        unit_name = r["unit"]
                        pt = r["point"]
                        code = match_hospcode(unit_name)
                        if code and code in m_units:
                            m_units[code]["services"][s] = pt
                            m_units[code]["totalPoint"] += pt
                            units_data[code]["services"][s] += pt
                            units_data[code]["totalPoint"] += pt
                            s_sum += pt
                        elif pt > 0:
                            print(f"Warning: Unmatched unit with points: {unit_name} ({pt}) in {m}")

                    m_district_summary[s] = s_sum
                    m_district_total += s_sum
                    district_summary_total[s] += s_sum
                    district_grand_total += s_sum

                # Attach month data to each unit's byMonth
                for code in SARAPHI_MAP:
                    units_data[code]["byMonth"][m] = {
                        "month": m,
                        "services": m_units[code]["services"],
                        "totalPoint": m_units[code]["totalPoint"]
                    }

                months_data[m] = {
                    "monthName": m,
                    "districtSummary": m_district_summary,
                    "districtTotal": m_district_total,
                    "units": m_units
                }

            dataset["data"][yr] = {
                "districtSummary": district_summary_total,
                "districtTotal": district_grand_total,
                "monthList": months,
                "months": months_data,
                "units": units_data
            }

            print(f"Year {yr}: Total District Procedure Points = {district_grand_total:,.0f} pts ({len(months)} months)")

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)

        print(f"\nSaved procedure types dataset with monthly dimensions to {OUTPUT_PATH} successfully!")
        return True

if __name__ == "__main__":
    asyncio.run(extract_all_procedures())

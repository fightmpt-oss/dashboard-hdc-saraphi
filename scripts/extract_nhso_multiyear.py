import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

OUTPUT_PATH = r"d:\PROJECTS\Dashboard HDC Saraphi\data\nhso\nhso_multiyear.json"

async def extract_multiyear():
    print("==================================================", flush=True)
    print("Extracting Multi-Year Data (2567-2569) for MeData Sheets 3, 4, 5, 6", flush=True)
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

        await asyncio.sleep(12)

        data = await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            const res = {
                sheet3: {},
                sheet4: {},
                sheet5: {},
                sheet6: {}
            };

            // SHEET 3
            try {
                await viz.workbook.activateSheetAsync("3-บริการแพทย์แผนไทย");
                await new Promise(r => setTimeout(r, 4000));
                const s3 = viz.workbook.activeSheet;
                const wsPoint = s3.worksheets.find(w => w.name.includes("หน่วย-point"));
                const wsBath = s3.worksheets.find(w => w.name.includes("หน่วย-บาท"));

                if (wsPoint) {
                    await wsPoint.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await wsPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await wsPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
                    await new Promise(r => setTimeout(r, 1500));

                    for (const yr of ["2567", "2568", "2569"]) {
                        await wsPoint.applyFilterAsync("F Year", [yr], "replace");
                        await new Promise(r => setTimeout(r, 2000));
                        const d = await wsPoint.getSummaryDataAsync({ maxRows: 50 });
                        res.sheet3[yr] = d.data.map(r => ({
                            unit: r[0].formattedValue,
                            point: parseFloat(r[1].value) || 0
                        }));
                    }
                }
            } catch(e) { res.sheet3.error = e.toString(); }

            // SHEET 4
            try {
                await viz.workbook.activateSheetAsync("4-ยาสมุนไพร 55 รายการ");
                await new Promise(r => setTimeout(r, 4000));
                const s4 = viz.workbook.activeSheet;
                const wsPoint = s4.worksheets.find(w => w.name.includes("หน่วย-point"));

                if (wsPoint) {
                    await wsPoint.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await wsPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await wsPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
                    await new Promise(r => setTimeout(r, 1500));

                    for (const yr of ["2567", "2568", "2569"]) {
                        await wsPoint.applyFilterAsync("F Year", [yr], "replace");
                        await new Promise(r => setTimeout(r, 2000));
                        const d = await wsPoint.getSummaryDataAsync({ maxRows: 50 });
                        res.sheet4[yr] = d.data.map(r => ({
                            unit: r[0].formattedValue,
                            point: parseFloat(r[1].value) || 0
                        }));
                    }
                }
            } catch(e) { res.sheet4.error = e.toString(); }

            // SHEET 5
            try {
                await viz.workbook.activateSheetAsync("5-ยาสมุนไพร 9 รายการ");
                await new Promise(r => setTimeout(r, 4000));
                const s5 = viz.workbook.activeSheet;
                const ws = s5.worksheets.find(w => w.name.includes("หน่วย-บาท") || w.name.includes("หน่วย"));

                if (ws) {
                    await ws.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await ws.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await ws.applyFilterAsync("amphur_name", ["สารภี"], "replace");
                    await new Promise(r => setTimeout(r, 1500));

                    for (const yr of ["2567", "2568", "2569"]) {
                        await ws.applyFilterAsync("F Year", [yr], "replace");
                        await new Promise(r => setTimeout(r, 2000));
                        const d = await ws.getSummaryDataAsync({ maxRows: 50 });
                        res.sheet5[yr] = d.data.map(r => ({
                            unit: r[0].formattedValue,
                            val: parseFloat(r[1]?.value) || 0
                        }));
                    }
                }
            } catch(e) { res.sheet5.error = e.toString(); }

            // SHEET 6
            try {
                await viz.workbook.activateSheetAsync("6-ยาสมุนไพร 32 รายการ");
                await new Promise(r => setTimeout(r, 4000));
                const s6 = viz.workbook.activeSheet;
                const ws = s6.worksheets.find(w => w.name.includes("หน่วย-บาท") || w.name.includes("หน่วย"));

                if (ws) {
                    await ws.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await ws.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                    await new Promise(r => setTimeout(r, 1000));
                    await ws.applyFilterAsync("amphur_name", ["สารภี"], "replace");
                    await new Promise(r => setTimeout(r, 1500));

                    for (const yr of ["2567", "2568", "2569"]) {
                        await ws.applyFilterAsync("F Year", [yr], "replace");
                        await new Promise(r => setTimeout(r, 2000));
                        const d = await ws.getSummaryDataAsync({ maxRows: 50 });
                        res.sheet6[yr] = d.data.map(r => ({
                            unit: r[0].formattedValue,
                            val: parseFloat(r[1]?.value) || 0
                        }));
                    }
                }
            } catch(e) { res.sheet6.error = e.toString(); }

            return res;
        }''')

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\nSaved multi-year data to {OUTPUT_PATH}", flush=True)
        for k in ["sheet3", "sheet4", "sheet5", "sheet6"]:
            print(f"[{k}]")
            for yr in ["2567", "2568", "2569"]:
                count = len(data.get(k, {}).get(yr, []))
                print(f"  {yr}: {count} units")

        await browser.close()
        return True

if __name__ == "__main__":
    asyncio.run(extract_multiyear())

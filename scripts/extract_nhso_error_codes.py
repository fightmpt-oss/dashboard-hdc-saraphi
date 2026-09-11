import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

OUTPUT_PATH = r"d:\PROJECTS\Dashboard HDC Saraphi\data\nhso\nhso_error_codes.json"

async def extract_menu9():
    print("==================================================", flush=True)
    print("Extracting Menu 9: Error Code การส่งเบิกชดเชย MeData สปสช.", flush=True)
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

        print("Activating Sheet 9: 9-Error Code การส่งข้อมูล...", flush=True)
        await page.evaluate('''async () => {
            const viz = document.querySelector('tableau-viz');
            await viz.workbook.activateSheetAsync("9-Error Code การส่งข้อมูล");
            await new Promise(r => setTimeout(r, 4000));
        }''')

        activities = ["ยาสมุนไพร", "หัตถการ"]
        years = ["2567", "2568", "2569"]

        dataset = {
            "timestamp": datetime.now().isoformat(),
            "district": "สารภี",
            "province": "เชียงใหม่",
            "zone": "เขต 1 เชียงใหม่",
            "years": years,
            "activities": activities,
            "errorCatalog": {},
            "records": {
                "ยาสมุนไพร": {},
                "หัตถการ": {}
            }
        }

        for act in activities:
            for yr in years:
                print(f"Extracting {act} - ปีงบ {yr}...", flush=True)
                res = await page.evaluate('''async ({ act, yr }) => {
                    const viz = document.querySelector('tableau-viz');
                    const sheet = viz.workbook.activeSheet;
                    const wsTable = sheet.worksheets.find(w => w.name.includes("ตารางล่าง") || w.name.includes("หน่วย"));
                    const wsSummary = sheet.worksheets.find(w => w.name.includes("ตารางจำนวน Error"));

                    if (!wsTable) return { error: "wsTable not found" };

                    // Filter Saraphi
                    try { await wsTable.applyFilterAsync("เขต", ["เขต 1 เชียงใหม่"], "replace"); } catch(e){}
                    await new Promise(r => setTimeout(r, 1000));
                    try { await wsTable.applyFilterAsync("จังหวัด", ["เชียงใหม่"], "replace"); } catch(e){}
                    await new Promise(r => setTimeout(r, 1000));
                    try { await wsTable.applyFilterAsync("อำเภอ", ["สารภี"], "replace"); } catch(e){}
                    await new Promise(r => setTimeout(r, 1500));

                    // Filter activity and year
                    try { await wsTable.applyFilterAsync("Xactivity", [act], "replace"); } catch(e){}
                    await new Promise(r => setTimeout(r, 1000));
                    try { await wsTable.applyFilterAsync("F Year", [yr], "replace"); } catch(e){}
                    await new Promise(r => setTimeout(r, 2000));

                    const dTable = await wsTable.getSummaryDataAsync({ maxRows: 150 });
                    const cols = dTable.columns.map(c => c.fieldName);
                    const rows = dTable.data.map(r => r.map(c => c.formattedValue));

                    // Also extract summary error catalog
                    let sumRows = [];
                    if (wsSummary) {
                        try {
                            await wsSummary.applyFilterAsync("เขต", ["เขต 1 เชียงใหม่"], "replace");
                            await wsSummary.applyFilterAsync("จังหวัด", ["เชียงใหม่"], "replace");
                            await wsSummary.applyFilterAsync("อำเภอ", ["สารภี"], "replace");
                            await wsSummary.applyFilterAsync("Xactivity", [act], "replace");
                            await wsSummary.applyFilterAsync("F Year", [yr], "replace");
                            await new Promise(r => setTimeout(r, 1200));
                            const dSum = await wsSummary.getSummaryDataAsync({ maxRows: 100 });
                            sumRows = dSum.data.map(r => r.map(c => c.formattedValue));
                        } catch(e){}
                    }

                    return { ok: true, cols, rows, sumRows };
                }''', {"act": act, "yr": yr})

                if res.get("ok"):
                    rows = res.get("rows", [])
                    cols = res.get("cols", [])
                    sumRows = res.get("sumRows", [])
                    print(f"  -> Extracted: {len(rows)} rows, {len(sumRows)} catalog items", flush=True)
                    
                    dataset["records"][act][yr] = {
                        "columns": cols,
                        "rows": rows
                    }

                    for sr in sumRows:
                        if len(sr) >= 2 and sr[0]:
                            code = sr[0].strip()
                            desc = sr[1].strip() if len(sr) > 1 and sr[1] else ""
                            if code not in dataset["errorCatalog"] or not dataset["errorCatalog"][code]:
                                dataset["errorCatalog"][code] = desc

                    # If columns contain 'TTM ERROR' and 'TTM ERROR คำอธิบาย'
                    if "TTM ERROR" in cols and "TTM ERROR คำอธิบาย" in cols:
                        c_idx = cols.index("TTM ERROR")
                        d_idx = cols.index("TTM ERROR คำอธิบาย")
                        for r in rows:
                            if len(r) > max(c_idx, d_idx):
                                code = r[c_idx]
                                desc = r[d_idx]
                                if code and (code not in dataset["errorCatalog"] or not dataset["errorCatalog"][code]):
                                    dataset["errorCatalog"][code] = desc
                else:
                    print(f"  -> Error: {res.get('error')}", flush=True)

        # Write output
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)

        print(f"\nSuccessfully saved full Menu 9 dataset to {OUTPUT_PATH}", flush=True)
        print(f"Error catalog items: {len(dataset['errorCatalog'])} codes cataloged", flush=True)
        for code, desc in sorted(dataset["errorCatalog"].items()):
            print(f"  [{code}] {desc}", flush=True)

        await browser.close()
        return True

if __name__ == "__main__":
    asyncio.run(extract_menu9())

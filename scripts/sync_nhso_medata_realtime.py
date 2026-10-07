import asyncio
import json
import os
import sys
import argparse
from datetime import datetime
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "nhso"))

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from saraphi_config import SARAPHI_UNITS, SARAPHI_ALIASES

SARAPHI_MAP = {hc: {'name': u['name'], 'subdistrict': u['subdistrict'], 'aliases': SARAPHI_ALIASES[hc]} for hc, u in SARAPHI_UNITS.items()}

YEAR_MONTHS = {
    "2569": [
        "ตุลาคม 2568", "พฤศจิกายน 2568", "ธันวาคม 2568",
        "มกราคม 2569", "กุมภาพันธ์ 2569", "มีนาคม 2569",
        "เมษายน 2569", "พฤษภาคม 2569", "มิถุนายน 2569",
        "กรกฎาคม 2569", "สิงหาคม 2569", "กันยายน 2569"
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

# Sheet 3 (บริการแพทย์แผนไทย): หัตถการ 6 ประเภทที่เว็บเมนู "MeData สปสช. เมนู 3" แสดง
SERVICES = [
    'การฟื้นฟูมารดาหลังคลอด',
    'นวด',
    'นวด+ประคบ',
    'ประคบ',
    'พอกเข่า',
    'อบสมุนไพร'
]

def build_procedure_types_dataset(raw, process_date="N/A"):
    """เรียบเรียงผลสกัดดิบ Sheet 3 ให้เป็นโครงสร้างเดียวกับ
    data/nhso/nhso_procedure_types.json ที่เมนู 3 ของเว็บอ่าน
    (districtSummary / districtTotal / monthList / months / units ครบ 14 หน่วย)"""
    dataset = {
        "timestamp": datetime.now().isoformat(),
        "district": "สารภี",
        "province": "เชียงใหม่",
        "zone": "เขต 1 เชียงใหม่",
        "process_date": process_date,
        "services": SERVICES,
        "data": {}
    }
    if not isinstance(raw, dict):
        return dataset

    for yr in YEAR_MONTHS:
        yr_raw = raw.get(yr)
        if not isinstance(yr_raw, dict):
            continue
        months = YEAR_MONTHS[yr]

        units_data = {}
        for code, info in SARAPHI_MAP.items():
            units_data[code] = {
                "hospcode": code,
                "name": info["name"],
                "services": {s: 0 for s in SERVICES},
                "totalPoint": 0,
                "byMonth": {}
            }

        district_summary_total = {s: 0 for s in SERVICES}
        district_grand_total = 0
        months_data = {}

        for m in months:
            m_raw = yr_raw.get(m, {})
            m_district_summary = {s: 0 for s in SERVICES}
            m_district_total = 0
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
                    code = match_hospcode(r.get("unit", ""))
                    pt = parse_num(r.get("point"))
                    if code and code in m_units:
                        m_units[code]["services"][s] = pt
                        m_units[code]["totalPoint"] += pt
                        units_data[code]["services"][s] += pt
                        units_data[code]["totalPoint"] += pt
                        s_sum += pt
                    elif pt > 0:
                        print(f"  [Sheet 3] Warning: Unmatched unit with points: {r.get('unit')} ({pt}) in {m}", flush=True)

                m_district_summary[s] = s_sum
                m_district_total += s_sum
                district_summary_total[s] += s_sum
                district_grand_total += s_sum

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
        print(f"  [Sheet 3] ปี {yr}: รวม {district_grand_total:,.0f} pts ({len(months)} เดือน)", flush=True)

    return dataset

async def run_sync():
    parser = argparse.ArgumentParser(description="NHSO MeData Real-time Data Sync for Saraphi District")
    parser.add_argument("--sheets", nargs="+", default=["3", "4", "5", "6", "9"], help="Sheets to sync (e.g. 3 4 5 6 9)")
    parser.add_argument("--skip-granular", action="store_true",
                        help="ข้ามขั้น granular breakdown (per-unit/per-drug) — โหมดเร็วสำหรับปุ่ม Live Sync; "
                             "รอบ nightly จะรัน granular เต็มเพื่อเก็บมิติรายชนิดยาทั้งหมด")
    parser.add_argument("--years", nargs="+", default=["2569", "2568", "2567"], help="Years to sync")
    args = parser.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)
    sync_start = datetime.now()
    print("==================================================================", flush=True)
    print("  ระบบ Real-time Data Sync กองทุนแพทย์แผนไทย สปสช. (MeData)")
    print(f"  เวลาเริ่ม: {sync_start.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  เป้าหมายแผ่นงาน: {args.sheets} | ปีงบ: {args.years}")
    print("==================================================================", flush=True)

    async with async_playwright() as p:
        print("กำลังเปิดเบราว์เซอร์ Chromium Headless...", flush=True)
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1680, "height": 1100})

        print("กำลังเชื่อมต่อไปยัง https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y ...", flush=True)
        # คลาวด์/Tableau อาจโหลดช้าหรือตอบสนองไม่สม่ำเสมอ — ลองซ้ำได้ 3 ครั้ง
        # และเก็บภาพหน้าจอ debug เมื่อพลาด เพื่อวินิจฉัย (เช่น NHSO บล็อก IP คลาวด์)
        viz_ready = False
        max_attempts = 3
        for attempt in range(1, max_attempts + 1):
            print(f"  ความพยายามครั้งที่ {attempt}/{max_attempts} ...", flush=True)
            try:
                await page.goto("https://medata.nhso.go.th/dashboard.viz?ref=wEJcuu5y", wait_until="domcontentloaded", timeout=120000)
            except Exception as e:
                print(f"  โหลดหน้าเว็บไม่สำเร็จ: {e}", flush=True)
                try:
                    await page.screenshot(path=f"_debug_medata_attempt{attempt}.png", full_page=True)
                except Exception:
                    pass
                continue
            try:
                await page.wait_for_function('''() => {
                    const viz = document.querySelector('tableau-viz');
                    try { return !!(viz && viz.workbook && viz.workbook.activeSheet); } catch(e) { return false; }
                }''', timeout=180000)
                viz_ready = True
                break
            except Exception as e:
                print(f"  Tableau ยังไม่พร้อมภายในเวลาที่กำหนด: {type(e).__name__}", flush=True)
                try:
                    await page.screenshot(path=f"_debug_medata_attempt{attempt}.png", full_page=True)
                    print(f"  บันทึกภาพหน้าจอ debug: _debug_medata_attempt{attempt}.png", flush=True)
                except Exception:
                    pass
                try:
                    title = await page.title()
                    print(f"  page.title() = '{title}'", flush=True)
                except Exception:
                    pass
        if not viz_ready:
            print("เชื่อมต่อ Tableau MeData ไม่สำเร็จหลังลองครบทุกครั้ง — ตรวจภาพ debug ประกอบ", flush=True)
            await browser.close()
            return False
        await asyncio.sleep(4)

        process_date = "N/A"

        # -------------------------------------------------------------
        # SYNC SHEET 4: ยาสมุนไพร 55 รายการ
        # -------------------------------------------------------------
        if "4" in args.sheets:
            print("\n-------------------------------------------------------------", flush=True)
            print(">>> [Sheet 4] กำลังสกัดข้อมูล: 4-ยาสมุนไพร 55 รายการ (Point / ชดเชยบาท)...", flush=True)
            s4_raw = await page.evaluate('''async ({ years, yearMonths }) => {
                const viz = document.querySelector('tableau-viz');
                await viz.workbook.activateSheetAsync("4-ยาสมุนไพร 55 รายการ");
                await new Promise(r => setTimeout(r, 4000));
                const sheet = viz.workbook.activeSheet;
                
                let pDate = "N/A";
                const wsDate = sheet.worksheets.find(w => w.name.includes("วันที่"));
                if (wsDate) {
                    try {
                        const d = await wsDate.getSummaryDataAsync({ maxRows: 5 });
                        if (d.data.length && d.data[0].length) pDate = d.data[0][0].formattedValue;
                    } catch(e){}
                }

                const wsUnitPt = sheet.worksheets.find(w => w.name.includes("หน่วย-point"));
                const wsUnitPay = sheet.worksheets.find(w => w.name.includes("หน่วย-จ่าย"));
                const wsHerbPt = sheet.worksheets.find(w => w.name.includes("ยาสมุนไพร-point"));
                const wsHerbPay = sheet.worksheets.find(w => w.name.includes("ยาสมุนไพร-จ่าย"));

                if (!wsUnitPt) return { error: "wsUnitPt not found", pDate };

                // Apply geographic filters
                await wsUnitPt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                await wsUnitPt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                await wsUnitPt.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
                await new Promise(r => setTimeout(r, 800));

                if (wsHerbPt) {
                    await wsHerbPt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                    await wsHerbPt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                    await wsHerbPt.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
                }

                const res = { pDate, years: {} };

                for (const yr of years) {
                    res.years[yr] = { all: {}, monthly: {} };
                    try {
                        await wsUnitPt.clearFilterAsync("MY(Xyyyymm)");
                        if (wsHerbPt) await wsHerbPt.clearFilterAsync("MY(Xyyyymm)");
                    } catch(e){}
                    await new Promise(r => setTimeout(r, 400));

                    await wsUnitPt.applyFilterAsync("F Year", [yr], "replace");
                    if (wsHerbPt) await wsHerbPt.applyFilterAsync("F Year", [yr], "replace");
                    await new Promise(r => setTimeout(r, 800));

                    // Get grand total for all months
                    try {
                        const dU = await wsUnitPt.getSummaryDataAsync({ maxRows: 50 });
                        const dH = wsHerbPt ? await wsHerbPt.getSummaryDataAsync({ maxRows: 100 }) : { data: [] };
                        res.years[yr].all = {
                            units: dU.data.map(r => ({ unit: r[0].formattedValue, val: r[1].formattedValue })),
                            herbs: dH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }))
                        };
                    } catch(e){}

                    // Monthly data
                    const months = yearMonths[yr] || [];
                    for (const m of months) {
                        try {
                            await wsUnitPt.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                            if (wsHerbPt) await wsHerbPt.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                            await new Promise(r => setTimeout(r, 450));
                            const dUm = await wsUnitPt.getSummaryDataAsync({ maxRows: 50 });
                            const dHm = wsHerbPt ? await wsHerbPt.getSummaryDataAsync({ maxRows: 100 }) : { data: [] };
                            res.years[yr].monthly[m] = {
                                units: dUm.data.map(r => ({ unit: r[0].formattedValue, val: r[1].formattedValue })),
                                herbs: dHm.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }))
                            };
                        } catch(e) {
                            res.years[yr].monthly[m] = { units: [], herbs: [] };
                        }
                    }
                }
                return res;
            }''', {"years": args.years, "yearMonths": YEAR_MONTHS})

            if s4_raw.get("pDate"):
                process_date = s4_raw["pDate"]
                print(f"  -> สปสช. ประมวลผลข้อมูล ณ: {process_date}", flush=True)

            # Process and build structured dataset for Herb55
            herb55_dataset = {
                "timestamp": datetime.now().isoformat(),
                "process_date": process_date,
                "district": "สารภี",
                "province": "เชียงใหม่",
                "years": args.years,
                "data": {}
            }

            for yr in args.years:
                yr_raw = s4_raw.get("years", {}).get(yr, {})
                months = YEAR_MONTHS.get(yr, [])

                # 14 units init
                units_map = {}
                for code, info in SARAPHI_MAP.items():
                    units_map[code] = {
                        "hospcode": code,
                        "name": info["name"],
                        "subdistrict": info["subdistrict"],
                        "totalPoint": 0,
                        "totalBath": 0,
                        "byMonth": {}
                    }

                district_total_pt = 0
                district_herbs = {}

                # Fill all-year summary
                all_units = yr_raw.get("all", {}).get("units", [])
                for u in all_units:
                    c = match_hospcode(u["unit"])
                    pt = parse_num(u["val"])
                    if c:
                        units_map[c]["totalPoint"] = pt
                        units_map[c]["totalBath"] = pt
                        district_total_pt += pt

                all_herbs = yr_raw.get("all", {}).get("herbs", [])
                for h in all_herbs:
                    hname = h["herb"]
                    pt = parse_num(h["val"])
                    district_herbs[hname] = pt

                # Fill monthly
                monthly_data = {}
                for m in months:
                    m_raw = yr_raw.get("monthly", {}).get(m, {})
                    m_units = {c: 0 for c in SARAPHI_MAP}
                    m_herbs = {}
                    m_dist_pt = 0

                    for u in m_raw.get("units", []):
                        c = match_hospcode(u["unit"])
                        pt = parse_num(u["val"])
                        if c:
                            m_units[c] = pt
                            m_dist_pt += pt
                            units_map[c]["byMonth"][m] = pt

                    for h in m_raw.get("herbs", []):
                        hname = h["herb"]
                        pt = parse_num(h["val"])
                        m_herbs[hname] = pt

                    # Ensure every unit has byMonth entry
                    for c in SARAPHI_MAP:
                        if m not in units_map[c]["byMonth"]:
                            units_map[c]["byMonth"][m] = 0

                    monthly_data[m] = {
                        "month": m,
                        "districtPoint": m_dist_pt,
                        "districtBath": m_dist_pt,
                        "units": m_units,
                        "herbs": m_herbs
                    }

                herb55_dataset["data"][yr] = {
                    "districtTotalPoint": district_total_pt,
                    "districtTotalBath": district_total_pt,
                    "districtHerbs": district_herbs,
                    "monthList": months,
                    "months": monthly_data,
                    "units": units_map
                }
                print(f"  -> Herb 55 ปี {yr}: รวม {district_total_pt:,.0f} Point ({len(months)} เดือน, {len(district_herbs)} รายการยา)", flush=True)

            out_s4 = os.path.join(DATA_DIR, "nhso_herb55_monthly.json")
            with open(out_s4, "w", encoding="utf-8") as f:
                json.dump(herb55_dataset, f, ensure_ascii=False, indent=2)
            print(f"  -> บันทึก {out_s4} เรียบร้อยแล้ว", flush=True)

        # -------------------------------------------------------------
        # SYNC SHEET 5: ยาสมุนไพร 9 รายการ
        # -------------------------------------------------------------
        if "5" in args.sheets:
            print("\n-------------------------------------------------------------", flush=True)
            print(">>> [Sheet 5] กำลังสกัดข้อมูล: 5-ยาสมุนไพร 9 รายการ (ครั้ง / ชดเชยบาท)...", flush=True)
            s5_raw = await page.evaluate('''async ({ years, yearMonths }) => {
                const viz = document.querySelector('tableau-viz');
                await viz.workbook.activateSheetAsync("5-ยาสมุนไพร 9 รายการ");
                await new Promise(r => setTimeout(r, 4000));
                const sheet = viz.workbook.activeSheet;
                
                const wsUnitCnt = sheet.worksheets.find(w => w.name.includes("หน่วย-ครั้ง"));
                const wsHerbCnt = sheet.worksheets.find(w => w.name.includes("บริการ-ครั้ง"));

                if (!wsUnitCnt) return { error: "wsUnitCnt not found" };

                // Apply geographic filters (amphur_name is lowercase in sheet 5!)
                await wsUnitCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                await wsUnitCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                await wsUnitCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace");
                await new Promise(r => setTimeout(r, 800));

                if (wsHerbCnt) {
                    await wsHerbCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                    await wsHerbCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                    await wsHerbCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace");
                }

                const res = { years: {} };

                for (const yr of years) {
                    res.years[yr] = { all: {}, monthly: {} };
                    try {
                        await wsUnitCnt.clearFilterAsync("MY(xyyyymm)");
                        if (wsHerbCnt) await wsHerbCnt.clearFilterAsync("MY(xyyyymm)");
                    } catch(e){}
                    await new Promise(r => setTimeout(r, 400));

                    await wsUnitCnt.applyFilterAsync("F Year", [yr], "replace");
                    if (wsHerbCnt) await wsHerbCnt.applyFilterAsync("F Year", [yr], "replace");
                    await new Promise(r => setTimeout(r, 800));

                    // Grand total
                    try {
                        const dU = await wsUnitCnt.getSummaryDataAsync({ maxRows: 50 });
                        const dH = wsHerbCnt ? await wsHerbCnt.getSummaryDataAsync({ maxRows: 50 }) : { data: [] };
                        res.years[yr].all = {
                            units: dU.data.map(r => ({ unit: r[0].formattedValue, val: r[1].formattedValue })),
                            herbs: dH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }))
                        };
                    } catch(e){}

                    // Monthly data
                    const months = yearMonths[yr] || [];
                    for (const m of months) {
                        try {
                            await wsUnitCnt.applyFilterAsync("MY(xyyyymm)", [m], "replace");
                            if (wsHerbCnt) await wsHerbCnt.applyFilterAsync("MY(xyyyymm)", [m], "replace");
                            await new Promise(r => setTimeout(r, 450));
                            const dUm = await wsUnitCnt.getSummaryDataAsync({ maxRows: 50 });
                            const dHm = wsHerbCnt ? await wsHerbCnt.getSummaryDataAsync({ maxRows: 50 }) : { data: [] };
                            res.years[yr].monthly[m] = {
                                units: dUm.data.map(r => ({ unit: r[0].formattedValue, val: r[1].formattedValue })),
                                herbs: dHm.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }))
                            };
                        } catch(e) {
                            res.years[yr].monthly[m] = { units: [], herbs: [] };
                        }
                    }
                }
                return res;
            }''', {"years": args.years, "yearMonths": YEAR_MONTHS})

            herb9_dataset = {
                "timestamp": datetime.now().isoformat(),
                "process_date": process_date,
                "district": "สารภี",
                "province": "เชียงใหม่",
                "years": args.years,
                "data": {}
            }

            for yr in args.years:
                yr_raw = s5_raw.get("years", {}).get(yr, {})
                months = YEAR_MONTHS.get(yr, [])

                units_map = {}
                for code, info in SARAPHI_MAP.items():
                    units_map[code] = {
                        "hospcode": code,
                        "name": info["name"],
                        "subdistrict": info["subdistrict"],
                        "totalCount": 0,
                        "totalBath": 0,
                        "byMonth": {}
                    }

                district_total_cnt = 0
                district_items = {}

                all_units = yr_raw.get("all", {}).get("units", [])
                for u in all_units:
                    c = match_hospcode(u["unit"])
                    cnt = parse_num(u["val"])
                    if c:
                        units_map[c]["totalCount"] = cnt
                        units_map[c]["totalBath"] = cnt * 60
                        district_total_cnt += cnt

                all_herbs = yr_raw.get("all", {}).get("herbs", [])
                for h in all_herbs:
                    iname = h["herb"]
                    cnt = parse_num(h["val"])
                    district_items[iname] = cnt

                monthly_data = {}
                for m in months:
                    m_raw = yr_raw.get("monthly", {}).get(m, {})
                    m_units = {c: 0 for c in SARAPHI_MAP}
                    m_items = {}
                    m_dist_cnt = 0

                    for u in m_raw.get("units", []):
                        c = match_hospcode(u["unit"])
                        cnt = parse_num(u["val"])
                        if c:
                            m_units[c] = cnt
                            m_dist_cnt += cnt
                            units_map[c]["byMonth"][m] = cnt

                    for h in m_raw.get("herbs", []):
                        iname = h["herb"]
                        cnt = parse_num(h["val"])
                        m_items[iname] = cnt

                    for c in SARAPHI_MAP:
                        if m not in units_map[c]["byMonth"]:
                            units_map[c]["byMonth"][m] = 0

                    monthly_data[m] = {
                        "month": m,
                        "districtCount": m_dist_cnt,
                        "districtBath": m_dist_cnt * 60,
                        "units": m_units,
                        "items": m_items
                    }

                herb9_dataset["data"][yr] = {
                    "districtTotalCount": district_total_cnt,
                    "districtTotalBath": district_total_cnt * 60,
                    "districtItems": district_items,
                    "monthList": months,
                    "months": monthly_data,
                    "units": units_map
                }
                print(f"  -> Herb 9 ปี {yr}: รวม {district_total_cnt:,.0f} ครั้ง ({len(months)} เดือน, {len(district_items)} รายการยา)", flush=True)

            out_s5 = os.path.join(DATA_DIR, "nhso_herb9_monthly.json")
            with open(out_s5, "w", encoding="utf-8") as f:
                json.dump(herb9_dataset, f, ensure_ascii=False, indent=2)
            print(f"  -> บันทึก {out_s5} เรียบร้อยแล้ว", flush=True)

        # -------------------------------------------------------------
        # SYNC SHEET 6: ยาสมุนไพร 32 รายการ
        # -------------------------------------------------------------
        if "6" in args.sheets:
            print("\n-------------------------------------------------------------", flush=True)
            print(">>> [Sheet 6] กำลังสกัดข้อมูล: 6-ยาสมุนไพร 32 รายการ (ครั้ง / ชดเชยบาท)...", flush=True)
            s6_raw = await page.evaluate('''async ({ years, yearMonths }) => {
                const viz = document.querySelector('tableau-viz');
                await viz.workbook.activateSheetAsync("6-ยาสมุนไพร 32 รายการ");
                await new Promise(r => setTimeout(r, 4000));
                const sheet = viz.workbook.activeSheet;
                
                const wsUnitCnt = sheet.worksheets.find(w => w.name.includes("หน่วย-ครั้ง"));
                const wsHerbCnt = sheet.worksheets.find(w => w.name.includes("บริการ-ครั้ง"));

                if (!wsUnitCnt) return { error: "wsUnitCnt not found" };

                // Apply geographic filters
                await wsUnitCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                await wsUnitCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                await wsUnitCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace");
                await new Promise(r => setTimeout(r, 800));

                if (wsHerbCnt) {
                    await wsHerbCnt.applyFilterAsync("Nhso Zonename", ["เขต 1 เชียงใหม่"], "replace");
                    await wsHerbCnt.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                    await wsHerbCnt.applyFilterAsync("amphur_name", ["สารภี"], "replace");
                }

                const res = { years: {} };

                for (const yr of years) {
                    res.years[yr] = { all: {}, monthly: {} };
                    try {
                        await wsUnitCnt.clearFilterAsync("MY(Xyyyymm)");
                        if (wsHerbCnt) await wsHerbCnt.clearFilterAsync("MY(Xyyyymm)");
                    } catch(e){}
                    await new Promise(r => setTimeout(r, 400));

                    await wsUnitCnt.applyFilterAsync("F Year", [yr], "replace");
                    if (wsHerbCnt) await wsHerbCnt.applyFilterAsync("F Year", [yr], "replace");
                    await new Promise(r => setTimeout(r, 800));

                    // Grand total
                    try {
                        const dU = await wsUnitCnt.getSummaryDataAsync({ maxRows: 50 });
                        const dH = wsHerbCnt ? await wsHerbCnt.getSummaryDataAsync({ maxRows: 100 }) : { data: [] };
                        res.years[yr].all = {
                            units: dU.data.map(r => ({ unit: r[0].formattedValue, val: r[1].formattedValue })),
                            herbs: dH.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }))
                        };
                    } catch(e){}

                    // Monthly data
                    const months = yearMonths[yr] || [];
                    for (const m of months) {
                        try {
                            await wsUnitCnt.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                            if (wsHerbCnt) await wsHerbCnt.applyFilterAsync("MY(Xyyyymm)", [m], "replace");
                            await new Promise(r => setTimeout(r, 450));
                            const dUm = await wsUnitCnt.getSummaryDataAsync({ maxRows: 50 });
                            const dHm = wsHerbCnt ? await wsHerbCnt.getSummaryDataAsync({ maxRows: 100 }) : { data: [] };
                            res.years[yr].monthly[m] = {
                                units: dUm.data.map(r => ({ unit: r[0].formattedValue, val: r[1].formattedValue })),
                                herbs: dHm.data.map(r => ({ herb: r[0].formattedValue, val: r[1].formattedValue }))
                            };
                        } catch(e) {
                            res.years[yr].monthly[m] = { units: [], herbs: [] };
                        }
                    }
                }
                return res;
            }''', {"years": args.years, "yearMonths": YEAR_MONTHS})

            herb32_dataset = {
                "timestamp": datetime.now().isoformat(),
                "process_date": process_date,
                "district": "สารภี",
                "province": "เชียงใหม่",
                "years": args.years,
                "data": {}
            }

            for yr in args.years:
                yr_raw = s6_raw.get("years", {}).get(yr, {})
                months = YEAR_MONTHS.get(yr, [])

                units_map = {}
                for code, info in SARAPHI_MAP.items():
                    units_map[code] = {
                        "hospcode": code,
                        "name": info["name"],
                        "subdistrict": info["subdistrict"],
                        "totalCount": 0,
                        "totalBath": 0,
                        "byMonth": {}
                    }

                district_total_cnt = 0
                district_herbs = {}

                all_units = yr_raw.get("all", {}).get("units", [])
                for u in all_units:
                    c = match_hospcode(u["unit"])
                    cnt = parse_num(u["val"])
                    if c:
                        units_map[c]["totalCount"] = cnt
                        units_map[c]["totalBath"] = cnt * 55
                        district_total_cnt += cnt

                all_herbs = yr_raw.get("all", {}).get("herbs", [])
                for h in all_herbs:
                    hname = h["herb"]
                    cnt = parse_num(h["val"])
                    district_herbs[hname] = cnt

                monthly_data = {}
                for m in months:
                    m_raw = yr_raw.get("monthly", {}).get(m, {})
                    m_units = {c: 0 for c in SARAPHI_MAP}
                    m_herbs = {}
                    m_dist_cnt = 0

                    for u in m_raw.get("units", []):
                        c = match_hospcode(u["unit"])
                        cnt = parse_num(u["val"])
                        if c:
                            m_units[c] = cnt
                            m_dist_cnt += cnt
                            units_map[c]["byMonth"][m] = cnt

                    for h in m_raw.get("herbs", []):
                        hname = h["herb"]
                        cnt = parse_num(h["val"])
                        m_herbs[hname] = cnt

                    for c in SARAPHI_MAP:
                        if m not in units_map[c]["byMonth"]:
                            units_map[c]["byMonth"][m] = 0

                    monthly_data[m] = {
                        "month": m,
                        "districtCount": m_dist_cnt,
                        "districtBath": m_dist_cnt * 55,
                        "units": m_units,
                        "herbs": m_herbs
                    }

                herb32_dataset["data"][yr] = {
                    "districtTotalCount": district_total_cnt,
                    "districtTotalBath": district_total_cnt * 55,
                    "districtHerbs": district_herbs,
                    "monthList": months,
                    "months": monthly_data,
                    "units": units_map
                }
                print(f"  -> Herb 32 ปี {yr}: รวม {district_total_cnt:,.0f} ครั้ง ({len(months)} เดือน, {len(district_herbs)} รายการยา)", flush=True)

            out_s6 = os.path.join(DATA_DIR, "nhso_herb32_monthly.json")
            with open(out_s6, "w", encoding="utf-8") as f:
                json.dump(herb32_dataset, f, ensure_ascii=False, indent=2)
            print(f"  -> บันทึก {out_s6} เรียบร้อยแล้ว", flush=True)

        # -------------------------------------------------------------
        # SYNC SHEET 9: Error Code การส่งข้อมูล
        # -------------------------------------------------------------
        if "9" in args.sheets:
            print("\n-------------------------------------------------------------", flush=True)
            print(">>> [Sheet 9] กำลังสกัดข้อมูล: 9-Error Code การส่งข้อมูล (จำแนกรายเดือน & รายหน่วย)...", flush=True)
            s9_raw = await page.evaluate('''async (years) => {
                const viz = document.querySelector('tableau-viz');
                await viz.workbook.activateSheetAsync("9-Error Code การส่งข้อมูล");
                await new Promise(r => setTimeout(r, 4000));
                const sheet = viz.workbook.activeSheet;

                const wsTimeline = sheet.worksheets.find(w => w.name.includes("timeline"));
                const wsUnit = sheet.worksheets.find(w => w.name.includes("ตารางรายหน่วย") || w.name.includes("หน่วย") || w.name.includes("ตารางล่าง"));
                const wsSummary = sheet.worksheets.find(w => w.name.includes("ตารางราย Error") || w.name.includes("ตารางจำนวน Error"));

                if (!wsUnit) return { error: "wsUnit in sheet 9 not found" };

                // Apply geographic filters
                await wsUnit.applyFilterAsync("เขต", ["เขต 1 เชียงใหม่"], "replace");
                await wsUnit.applyFilterAsync("จังหวัด", ["เชียงใหม่"], "replace");
                await wsUnit.applyFilterAsync("อำเภอ", ["สารภี"], "replace");
                await new Promise(r => setTimeout(r, 800));

                const activities = ["ยาสมุนไพร", "หัตถการ"];
                const res = { catalog: {}, records: {} };

                for (const act of activities) {
                    res.records[act] = {};
                    await wsUnit.applyFilterAsync("Xactivity", [act], "replace");
                    await new Promise(r => setTimeout(r, 600));

                    for (const yr of years) {
                        await wsUnit.applyFilterAsync("F Year", [yr], "replace");
                        await new Promise(r => setTimeout(r, 800));

                        const dTable = await wsUnit.getSummaryDataAsync({ maxRows: 300 });
                        const dTime = wsTimeline ? await wsTimeline.getSummaryDataAsync({ maxRows: 300 }) : { data: [] };

                        res.records[act][yr] = {
                            units: dTable.data.map(r => r.map(c => c.formattedValue)),
                            timeline: dTime.data.map(r => r.map(c => c.formattedValue))
                        };
                    }
                }
                return res;
            }''', args.years)

            # Build structured dataset for Error codes
            error_dataset = {
                "timestamp": datetime.now().isoformat(),
                "process_date": process_date,
                "district": "สารภี",
                "province": "เชียงใหม่",
                "years": args.years,
                "activities": ["ยาสมุนไพร", "หัตถการ"],
                "errorCatalog": {},
                "summary": {}
            }

            for act in ["ยาสมุนไพร", "หัตถการ"]:
                error_dataset["summary"][act] = {}
                for yr in args.years:
                    rec = s9_raw.get("records", {}).get(act, {}).get(yr, {})
                    u_rows = rec.get("units", [])
                    t_rows = rec.get("timeline", [])

                    # Units breakdown
                    units_err = {}
                    for code, info in SARAPHI_MAP.items():
                        units_err[code] = {
                            "hospcode": code,
                            "name": info["name"],
                            "subdistrict": info["subdistrict"],
                            "errors": {},
                            "totalErrors": 0
                        }

                    district_errors = {}
                    total_errors = 0

                    for r in u_rows:
                        if len(r) >= 7:
                            uname = r[3]
                            ecode = r[4].strip()
                            edesc = r[5].strip() if len(r) > 5 else ""
                            cnt = parse_num(r[6])

                            if ecode:
                                if ecode not in error_dataset["errorCatalog"] or not error_dataset["errorCatalog"][ecode]:
                                    error_dataset["errorCatalog"][ecode] = edesc

                                c = match_hospcode(uname)
                                if c:
                                    units_err[c]["errors"][ecode] = units_err[c]["errors"].get(ecode, 0) + cnt
                                    units_err[c]["totalErrors"] += cnt

                                district_errors[ecode] = district_errors.get(ecode, 0) + cnt
                                total_errors += cnt

                    # Monthly Timeline
                    monthly_timeline = {}
                    for tr in t_rows:
                        if len(tr) >= 5:
                            m_name = tr[0].strip()
                            ecode = tr[1].strip()
                            edesc = tr[2].strip()
                            cnt = parse_num(tr[4])
                            if ecode == "Null" or not ecode:
                                # extract code from text if available
                                if " - " in tr[3]:
                                    ecode = tr[3].split(" - ")[0].strip()

                            if ecode and ecode != "Null":
                                if ecode not in error_dataset["errorCatalog"] or not error_dataset["errorCatalog"][ecode]:
                                    error_dataset["errorCatalog"][ecode] = edesc

                                if m_name not in monthly_timeline:
                                    monthly_timeline[m_name] = {"month": m_name, "errors": {}, "total": 0}
                                monthly_timeline[m_name]["errors"][ecode] = monthly_timeline[m_name]["errors"].get(ecode, 0) + cnt
                                monthly_timeline[m_name]["total"] += cnt

                    error_dataset["summary"][act][yr] = {
                        "districtErrors": district_errors,
                        "totalErrors": total_errors,
                        "units": units_err,
                        "timeline": monthly_timeline,
                        "monthList": YEAR_MONTHS.get(yr, [])
                    }
                    print(f"  -> Error {act} ปี {yr}: รวม {total_errors:,.0f} รายการ ({len(district_errors)} Error Codes, {len(monthly_timeline)} เดือน)", flush=True)

            out_s9 = os.path.join(DATA_DIR, "nhso_error_codes.json")
            with open(out_s9, "w", encoding="utf-8") as f:
                json.dump(error_dataset, f, ensure_ascii=False, indent=2)
            print(f"  -> บันทึก {out_s9} เรียบร้อยแล้ว", flush=True)

        # -------------------------------------------------------------
        # SYNC SHEET 3: บริการแพทย์แผนไทย (หัตถการ 6 ประเภท x รายเดือน)
        # -------------------------------------------------------------
        if "3" in args.sheets:
            print("\n-------------------------------------------------------------", flush=True)
            print(">>> [Sheet 3] กำลังสกัดข้อมูล: 3-บริการแพทย์แผนไทย (หัตถการ 6 ประเภท x รายเดือน)...", flush=True)
            s3_raw = await page.evaluate('''async ({ years, yearMonths, services }) => {
                const viz = document.querySelector('tableau-viz');
                await viz.workbook.activateSheetAsync("3-บริการแพทย์แผนไทย");
                await new Promise(r => setTimeout(r, 4000));
                const s3 = viz.workbook.activeSheet;
                const wsPoint = s3.worksheets.find(w => w.name.includes("หน่วย-point"));

                if (!wsPoint) return { error: "wsPoint not found" };

                await wsPoint.applyFilterAsync("nhso_zonename", ["เขต 1 เชียงใหม่"], "replace");
                await new Promise(r => setTimeout(r, 400));
                await wsPoint.applyFilterAsync("Province Name", ["เชียงใหม่"], "replace");
                await new Promise(r => setTimeout(r, 400));
                await wsPoint.applyFilterAsync("Amphur Name", ["สารภี"], "replace");
                await new Promise(r => setTimeout(r, 600));

                const res = {};
                for (const yr of years) {
                    res[yr] = {};
                    await wsPoint.applyFilterAsync("F Year", [yr], "replace");
                    await new Promise(r => setTimeout(r, 800));
                    const months = yearMonths[yr] || [];
                    for (const m of months) {
                        res[yr][m] = {};
                        try {
                            await wsPoint.applyFilterAsync("MY(xyyyymm)", [m], "replace");
                            await new Promise(r => setTimeout(r, 400));
                        } catch(e) {}
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
            }''', { "years": args.years, "yearMonths": YEAR_MONTHS, "services": SERVICES })

            if isinstance(s3_raw, dict) and s3_raw.get("error"):
                print(f"  [Sheet 3] error: {s3_raw.get('error')} — ข้ามรอบนี้ (master คงใช้ข้อมูลเดิม)", flush=True)
                s3_raw = None

            s3_dataset = build_procedure_types_dataset(s3_raw, process_date)
            s3_path = os.path.join(DATA_DIR, "nhso_procedure_types.json")
            # merge รักษาปีเก่าที่รอบนี้ไม่ได้ดึง (เช่น รัน --years 2569 เฉพาะปีเดียว)
            merged = {}
            if os.path.exists(s3_path):
                try:
                    with open(s3_path, "r", encoding="utf-8") as f:
                        merged = json.load(f).get("data", {}) or {}
                except Exception:
                    merged = {}
            merged.update(s3_dataset.get("data", {}))
            s3_dataset["data"] = merged
            with open(s3_path, "w", encoding="utf-8") as f:
                json.dump(s3_dataset, f, ensure_ascii=False, indent=2)
            print(f"  -> บันทึก {s3_path} เรียบร้อยแล้ว (ปีครอบคลุม: {sorted(merged.keys())})", flush=True)

        # -------------------------------------------------------------
        # GRANULAR BREAKDOWN PASS — สกัดมิติรายชนิดยา/รายหน่วยที่กราฟเมนู 4/5/6
        # อ่าน (units.herbs / monthlyHerbs / months.herbs / months.items /
        # unitsPay / herbsPay) — ใช้ worksheet เฉพาะ + filter Hname รายหน่วย
        # -------------------------------------------------------------
        if args.skip_granular:
            print("[Granular] ข้ามขั้น granular (--skip-granular) — เมนู 4/5/6 ใช้มิติรายชนิดยาจากรอบ nightly ล่าสุด", flush=True)
        unit_display_names = [SARAPHI_MAP[c]["name"] for c in SARAPHI_MAP]

        skip_g = args.skip_granular
        g4 = {"units": {}, "months": {}, "skipped": []} if ("4" in args.sheets and not skip_g) else None
        g6 = {"units": {}, "months": {}, "skipped": []} if ("6" in args.sheets and not skip_g) else None
        g5 = {"units": {}, "months": {}, "skipped": []} if ("5" in args.sheets and not skip_g) else None

        # ── Granular per-unit driver ─────────────────────────────────────────
        # แทน evaluate ก้อนเดียว (ที่ hang ได้ตลอดกาลเมื่อ filter promise ค้าง)
        # ด้วย evaluate รายหน่วยแบบ self-contained + asyncio.wait_for timeout
        # ต่อ call — call ไหนค้าง/ล้ม ข้ามหน่วยนั้นแล้วทำงานต่อได้ทันที

        import asyncio as _asyncio

        GRANULAR_TIMEOUT = 120  # วินาทีต่อหน่วย (เปิดชีต+ฟิลเตอร์+อ่าน 12 เดือน)

        async def granular_unit(sheet_name, geo_filter, month_field, worksheets_spec,
                                 extra_ws_spec, yr, month_list, uname):
            """เปิดชีต → ฟิลเตอร์ภูมิศาสตร์+ปี → Hname=หน่วย → อ่าน herbs รวม+รายเดือน
            (และ herbsPay ถ้ามี worksheet จ่าย) — self-contained ต่อ 1 หน่วย"""
            return await page.evaluate('''async (cfg) => {
                const { sheetName, wsUnitNeedle, wsHerbNeedle, wsHerbPayNeedle,
                        geo, yr, months, uname, monthField } = cfg;
                const viz = document.querySelector('tableau-viz');
                await viz.workbook.activateSheetAsync(sheetName);
                await new Promise(r => setTimeout(r, 2500));
                const sheet = viz.workbook.activeSheet;
                const wsUnit = sheet.worksheets.find(w => w.name.includes(wsUnitNeedle));
                const wsHerb = sheet.worksheets.find(w => w.name.includes(wsHerbNeedle));
                const wsHerbPay = wsHerbPayNeedle ? sheet.worksheets.find(w => w.name.includes(wsHerbPayNeedle)) : null;
                if (!wsUnit || !wsHerb) return { error: "worksheets not found" };
                const safeApply = async (ws, field, values) => {
                    try { await ws.applyFilterAsync(field, values, "replace"); return true; }
                    catch (e) { return false; }
                };
                const safeSummary = async (ws, maxRows) => {
                    try { return await ws.getSummaryDataAsync({ maxRows }); } catch (e) { return { data: [] }; }
                };
                const rowsToObj = (d) => (d.data || []).map(r => ({ herb: r[0].formattedValue, val: r[1].value }));
                const allWs = [wsUnit, wsHerb, wsHerbPay].filter(Boolean);
                for (const ws of allWs) {
                    await safeApply(ws, geo.zoneField, [geo.zone]);
                    await safeApply(ws, geo.provinceField, [geo.province]);
                    await safeApply(ws, geo.amphurField, [geo.amphur]);
                    await safeApply(ws, "F Year", [yr]);
                }
                await new Promise(r => setTimeout(r, 700));
                const okH = await safeApply(wsHerb, "Hname", [uname]);
                if (wsHerbPay) await safeApply(wsHerbPay, "Hname", [uname]);
                if (!okH) return { error: "Hname filter failed", uname };
                await new Promise(r => setTimeout(r, 350));
                const out = {
                    herbs: rowsToObj(await safeSummary(wsHerb, 60)),
                    herbsPay: wsHerbPay ? rowsToObj(await safeSummary(wsHerbPay, 60)) : [],
                    monthly: {}
                };
                for (const m of months) {
                    const okM = await safeApply(wsHerb, monthField, [m]);
                    if (wsHerbPay) await safeApply(wsHerbPay, monthField, [m]);
                    await new Promise(r => setTimeout(r, 280));
                    out.monthly[m] = {
                        herbs: okM ? rowsToObj(await safeSummary(wsHerb, 60)) : [],
                        herbsPay: (okM && wsHerbPay) ? rowsToObj(await safeSummary(wsHerbPay, 60)) : []
                    };
                }
                return out;
            }''', {
                "sheetName": sheet_name,
                "wsUnitNeedle": worksheets_spec["unit"],
                "wsHerbNeedle": worksheets_spec["herb"],
                "wsHerbPayNeedle": (extra_ws_spec or {}).get("herbPay"),
                "geo": geo_filter,
                "yr": yr,
                "months": month_list,
                "uname": uname,
                "monthField": month_field,
            })

        async def granular_district_months(sheet_name, geo_filter, month_field, worksheets_spec,
                                            extra_ws_spec, yr, month_list):
            """อ่านยอดระดับอำเภอรายเดือน: months.herbs (จาก ยาสมุนไพร-point) และ/หรือ
            items (บริการ-ครั้ง) / unitsPay (หน่วย-จ่าย) / herbsPay (บริการ-จ่าย)"""
            return await page.evaluate('''async (cfg) => {
                const { sheetName, wsHerbNeedle, wsHerbPayNeedle, wsUnitPayNeedle,
                        geo, yr, months, monthField } = cfg;
                const viz = document.querySelector('tableau-viz');
                await viz.workbook.activateSheetAsync(sheetName);
                await new Promise(r => setTimeout(r, 2500));
                const sheet = viz.workbook.activeSheet;
                const wsHerb = sheet.worksheets.find(w => w.name.includes(wsHerbNeedle));
                const wsHerbPay = wsHerbPayNeedle ? sheet.worksheets.find(w => w.name.includes(wsHerbPayNeedle)) : null;
                const wsUnitPay = wsUnitPayNeedle ? sheet.worksheets.find(w => w.name.includes(wsUnitPayNeedle)) : null;
                if (!wsHerb) return { error: "herb worksheet not found" };
                const safeApply = async (ws, field, values) => {
                    try { await ws.applyFilterAsync(field, values, "replace"); return true; }
                    catch (e) { return false; }
                };
                const safeSummary = async (ws, maxRows) => {
                    try { return await ws.getSummaryDataAsync({ maxRows }); } catch (e) { return { data: [] }; }
                };
                const rowsToObj = (d) => (d.data || []).map(r => ({ herb: r[0].formattedValue, val: r[1].value }));
                const allWs = [wsHerb, wsHerbPay, wsUnitPay].filter(Boolean);
                for (const ws of allWs) {
                    await safeApply(ws, geo.zoneField, [geo.zone]);
                    await safeApply(ws, geo.provinceField, [geo.province]);
                    await safeApply(ws, geo.amphurField, [geo.amphur]);
                    await safeApply(ws, "F Year", [yr]);
                }
                await new Promise(r => setTimeout(r, 700));
                const out = { months: {} };
                for (const m of months) {
                    const okH = await safeApply(wsHerb, monthField, [m]);
                    if (wsHerbPay) await safeApply(wsHerbPay, monthField, [m]);
                    if (wsUnitPay) await safeApply(wsUnitPay, monthField, [m]);
                    await new Promise(r => setTimeout(r, 300));
                    out.months[m] = {
                        herbs: okH ? rowsToObj(await safeSummary(wsHerb, 60)) : [],
                        items: okH ? rowsToObj(await safeSummary(wsHerb, 60)) : [],
                        herbsPay: wsHerbPay ? rowsToObj(await safeSummary(wsHerbPay, 60)) : [],
                        unitsPay: (wsUnitPay && okH) ? rowsToObj(await safeSummary(wsUnitPay, 40)) : []
                    };
                }
                return out;
            }''', {
                "sheetName": sheet_name,
                "wsHerbNeedle": worksheets_spec["herb"],
                "wsHerbPayNeedle": (extra_ws_spec or {}).get("herbPay"),
                "wsUnitPayNeedle": (extra_ws_spec or {}).get("unitPay"),
                "geo": geo_filter,
                "yr": yr,
                "months": month_list,
                "monthField": month_field,
            })

        async def run_bounded(coro, timeout, label):
            try:
                return await _asyncio.wait_for(coro, timeout=timeout)
            except _asyncio.TimeoutError:
                print(f"    [timeout] {label} เกิน {timeout} วิ — ข้าม", flush=True)
                # คืนสถานะหน้าเว็บให้สะอาดก่อน call ถัดไป
                try:
                    await page.reload(wait_until="domcontentloaded", timeout=60000)
                    await page.wait_for_function('''() => {
                        const viz = document.querySelector('tableau-viz');
                        try { return !!(viz && viz.workbook && viz.workbook.activeSheet); } catch(e) { return false; }
                    }''', timeout=120000)
                except Exception as e:
                    print(f"    [recovery] reload ล้มเหลว: {type(e).__name__}", flush=True)
                return None
            except Exception as e:
                print(f"    [error] {label}: {type(e).__name__}: {str(e)[:150]} — ข้าม", flush=True)
                return None

        GEO = {
            "zone": "เขต 1 เชียงใหม่",
            "province": "เชียงใหม่",
            "amphur": "สารภี",
        }

        # Sheet 4: worksheet เฉพาะแบบ granular + ฟิลด์เดือนแบบที่ main block ใช้สำเร็จ
        S4_SPEC = {"sheet": "4-ยาสมุนไพร 55 รายการ",
                   "unit": "s4-herb-55gb-หน่วย-point",
                   "herb": "s4-herb-55gb-ยาสมุนไพร-point",
                   "monthField": "MY(Xyyyamm)"}
        # Sheet 6: ชุด s6-herb-32fs (ครั้ง + จ่าย)
        S6_SPEC = {"sheet": "6-ยาสมุนไพร 32 รายการ",
                   "unit": "หน่วย-ครั้ง",
                   "herb": "บริการ-ครั้ง",
                   "herbPay": "บริการ-จ่าย",
                   "unitPay": "หน่วย-จ่าย",
                   "monthField": "MY(Xyyyamm)"}
        # Sheet 5: หน่วย-ครั้ง / บริการ-ครั้ง ของชีต 5 + ฟิลด์เดือนแบบ main block
        S5_SPEC = {"sheet": "5-ยาสมุนไพร 9 รายการ",
                   "unit": "หน่วย-ครั้ง",
                   "herb": "บริการ-ครั้ง",
                   "monthField": "MY(xyyyamm)"}

        g4 = {"units": {}, "months": {}, "skipped": []} if "4" in args.sheets else None
        g6 = {"units": {}, "months": {}, "skipped": []} if "6" in args.sheets else None
        g5 = {"units": {}, "months": {}, "skipped": []} if "5" in args.sheets else None

        for yr in args.years:
            month_list = YEAR_MONTHS.get(yr, [])

            if g4 is not None:
                print(f">>> [Granular S4] ปี {yr}: สกัดรายหน่วย...", flush=True)
                for i, uname in enumerate(unit_display_names, 1):
                    print(f"    ({i}/{len(unit_display_names)}) {uname}", flush=True)
                    ud = await run_bounded(
                        granular_unit(S4_SPEC["sheet"], GEO, S4_SPEC["monthField"],
                                      {"unit": S4_SPEC["unit"], "herb": S4_SPEC["herb"]},
                                      None, yr, month_list, uname),
                        GRANULAR_TIMEOUT, f"S4 {yr} {uname}")
                    code = match_hospcode(uname)
                    if ud and not ud.get("error") and code:
                        g4["units"].setdefault(code, {}).setdefault(str(yr), ud)
                    elif ud and ud.get("error"):
                        g4["skipped"].append(f"{uname}: {ud.get('error')}")
                print(f">>> [Granular S4] ปี {yr}: อ่านยอดอำเภอรายเดือน...", flush=True)
                dm = await run_bounded(
                    granular_district_months(S4_SPEC["sheet"], GEO, S4_SPEC["monthField"],
                                              {"herb": S4_SPEC["herb"]}, None, yr, month_list),
                    300, f"S4 district {yr}")
                if dm and not dm.get("error"):
                    g4["months"].setdefault(str(yr), dm.get("months", {}))

            if g6 is not None:
                print(f">>> [Granular S6] ปี {yr}: สกัดรายหน่วย...", flush=True)
                for i, uname in enumerate(unit_display_names, 1):
                    print(f"    ({i}/{len(unit_display_names)}) {uname}", flush=True)
                    ud = await run_bounded(
                        granular_unit(S6_SPEC["sheet"], GEO, S6_SPEC["monthField"],
                                      {"unit": S6_SPEC["unit"], "herb": S6_SPEC["herb"]},
                                      {"herbPay": S6_SPEC.get("herbPay")}, yr, month_list, uname),
                        GRANULAR_TIMEOUT, f"S6 {yr} {uname}")
                    code = match_hospcode(uname)
                    if ud and not ud.get("error") and code:
                        g6["units"].setdefault(code, {}).setdefault(str(yr), ud)
                print(f">>> [Granular S6] ปี {yr}: อ่านยอดอำเภอรายเดือน...", flush=True)
                dm = await run_bounded(
                    granular_district_months(S6_SPEC["sheet"], GEO, S6_SPEC["monthField"],
                                              {"herb": S6_SPEC["herb"]},
                                              {"herbPay": S6_SPEC.get("herbPay"), "unitPay": S6_SPEC.get("unitPay")},
                                              yr, month_list),
                    300, f"S6 district {yr}")
                if dm and not dm.get("error"):
                    g6["months"].setdefault(str(yr), dm.get("months", {}))

            if g5 is not None:
                print(f">>> [Granular S5] ปี {yr}: สกัดรายหน่วย...", flush=True)
                for i, uname in enumerate(unit_display_names, 1):
                    print(f"    ({i}/{len(unit_display_names)}) {uname}", flush=True)
                    ud = await run_bounded(
                        granular_unit(S5_SPEC["sheet"], GEO, S5_SPEC["monthField"],
                                      {"unit": S5_SPEC["unit"], "herb": S5_SPEC["herb"]},
                                      None, yr, month_list, uname),
                        GRANULAR_TIMEOUT, f"S5 {yr} {uname}")
                    code = match_hospcode(uname)
                    if ud and not ud.get("error") and code:
                        g5["units"].setdefault(code, {}).setdefault(str(yr), ud)
                print(f">>> [Granular S5] ปี {yr}: อ่านยอดอำเภอรายเดือน...", flush=True)
                dm = await run_bounded(
                    granular_district_months(S5_SPEC["sheet"], GEO, S5_SPEC["monthField"],
                                              {"herb": S5_SPEC["herb"]}, None, yr, month_list),
                    300, f"S5 district {yr}")
                if dm and not dm.get("error"):
                    g5["months"].setdefault(str(yr), dm.get("months", {}))

        await browser.close()

        # -------------------------------------------------------------
        # MERGE GRANULAR DATA เข้าไฟล์ monthly (shape จาก per-unit driver)
        # -------------------------------------------------------------
        def rows_to_dict(rows):
            out = {}
            for h in rows or []:
                out[h["herb"]] = parse_num(h.get("val"))
            return out

        def merge_granular(file_path, granular, pay_key=None, month_herbs_key="herbs"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception as e:
                print(f"  [Granular] อ่าน {file_path} ไม่สำเร็จ: {e}", flush=True)
                return
            base = data.get("data") or {}
            enhanced = 0
            for code, years_map in (granular.get("units") or {}).items():
                for yr, ud in years_map.items():
                    unit = base.get(yr, {}).get("units", {}).get(code)
                    if not unit:
                        continue
                    unit["herbs"] = rows_to_dict(ud.get("herbs"))
                    if pay_key:
                        unit[pay_key] = rows_to_dict(ud.get("herbsPay"))
                    unit["monthlyHerbs"] = {
                        m: rows_to_dict(md.get("herbs")) for m, md in (ud.get("monthly") or {}).items()
                    }
                    enhanced += 1
            for yr, months_map in (granular.get("months") or {}).items():
                for m, md in months_map.items():
                    month_entry = base.get(yr, {}).get("months", {}).get(m)
                    if not month_entry:
                        continue
                    if md.get(month_herbs_key):
                        month_entry["herbs"] = rows_to_dict(md[month_herbs_key])
                    if md.get("items"):
                        month_entry["items"] = rows_to_dict(md["items"])
                    if pay_key and md.get("herbsPay"):
                        month_entry["herbsPay"] = rows_to_dict(md["herbsPay"])
                    if md.get("unitsPay"):
                        up = {}
                        for r in md["unitsPay"]:
                            ucode = match_hospcode(r.get("herb", ""))
                            up[ucode or r.get("herb")] = parse_num(r.get("val"))
                        month_entry["unitsPay"] = up
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  [Granular] merged -> {file_path} (enhanced {enhanced} unit-years)", flush=True)

        if g4 is not None:
            merge_granular(os.path.join(DATA_DIR, "nhso_herb55_monthly.json"), g4,
                           month_herbs_key="herbs")
        if g5 is not None:
            merge_granular(os.path.join(DATA_DIR, "nhso_herb9_monthly.json"), g5,
                           month_herbs_key="items")
        if g6 is not None:
            merge_granular(os.path.join(DATA_DIR, "nhso_herb32_monthly.json"), g6,
                           pay_key="herbsPay", month_herbs_key="items")


    # -------------------------------------------------------------
    # REPROCESS MASTER JSON & CREATE METADATA
    # -------------------------------------------------------------
    print("\n-------------------------------------------------------------", flush=True)
    print(">>> กำลังประมวลผลเชื่อมโยง Master JSON (nhso_saraphi_master.json)...", flush=True)
    
    master_path = os.path.join(DATA_DIR, "nhso_saraphi_master.json")
    master = {}
    if os.path.exists(master_path):
        try:
            with open(master_path, "r", encoding="utf-8") as f:
                master = json.load(f)
        except Exception:
            master = {}

    master["timestamp"] = datetime.now().isoformat()
    master["district"] = "สารภี"
    master["province"] = "เชียงใหม่"
    master["process_date"] = process_date

    # Attach loaded datasets
    s4_path = os.path.join(DATA_DIR, "nhso_herb55_monthly.json")
    if os.path.exists(s4_path):
        with open(s4_path, "r", encoding="utf-8") as f:
            master["herb55_monthly"] = json.load(f).get("data", {})

    s5_path = os.path.join(DATA_DIR, "nhso_herb9_monthly.json")
    if os.path.exists(s5_path):
        with open(s5_path, "r", encoding="utf-8") as f:
            master["herb9_monthly"] = json.load(f).get("data", {})

    s6_path = os.path.join(DATA_DIR, "nhso_herb32_monthly.json")
    if os.path.exists(s6_path):
        with open(s6_path, "r", encoding="utf-8") as f:
            master["herb32_monthly"] = json.load(f).get("data", {})

    s3_path = os.path.join(DATA_DIR, "nhso_procedure_types.json")
    if os.path.exists(s3_path):
        with open(s3_path, "r", encoding="utf-8") as f:
            master["procedure_types"] = json.load(f).get("data", {})

    s9_path = os.path.join(DATA_DIR, "nhso_error_codes.json")
    if os.path.exists(s9_path):
        with open(s9_path, "r", encoding="utf-8") as f:
            master["error_codes"] = json.load(f)

    # Re-verify aggregated unit summary for 2569
    unit_summary = {}
    for code, info in SARAPHI_MAP.items():
        unit_summary[code] = {
            "hospcode": code,
            "name": info["name"],
            "subdistrict": info["subdistrict"],
            "sheet3_service_point": 0,
            "sheet3_service_bath": 0,
            "sheet4_herb55_point": 0,
            "sheet4_herb55_bath": 0,
            "sheet5_herb9_count": 0,
            "sheet5_herb9_bath": 0,
            "sheet6_herb32_count": 0,
            "sheet6_herb32_bath": 0,
            "total_point": 0,
            "total_bath": 0
        }

    # Load 2569 figures from monthly datasets
    h55_2569 = master.get("herb55_monthly", {}).get("2569", {}).get("units", {})
    for c, u in h55_2569.items():
        if c in unit_summary:
            unit_summary[c]["sheet4_herb55_point"] = u.get("totalPoint", 0)
            unit_summary[c]["sheet4_herb55_bath"] = u.get("totalBath", 0)

    h9_2569 = master.get("herb9_monthly", {}).get("2569", {}).get("units", {})
    for c, u in h9_2569.items():
        if c in unit_summary:
            unit_summary[c]["sheet5_herb9_count"] = u.get("totalCount", 0)
            unit_summary[c]["sheet5_herb9_bath"] = u.get("totalBath", 0)

    h32_2569 = master.get("herb32_monthly", {}).get("2569", {}).get("units", {})
    for c, u in h32_2569.items():
        if c in unit_summary:
            unit_summary[c]["sheet6_herb32_count"] = u.get("totalCount", 0)
            unit_summary[c]["sheet6_herb32_bath"] = u.get("totalBath", 0)

    # Sheet 3
    proc_2569 = master.get("procedure_types", {}).get("2569", {}).get("units", {})
    for c, u in proc_2569.items():
        if c in unit_summary:
            unit_summary[c]["sheet3_service_point"] = u.get("totalPoint", 0)
            unit_summary[c]["sheet3_service_bath"] = u.get("totalPoint", 0)

    district_total = {
        "sheet3_service_point": 0,
        "sheet3_service_bath": 0,
        "sheet4_herb55_point": 0,
        "sheet4_herb55_bath": 0,
        "sheet5_herb9_count": 0,
        "sheet5_herb9_bath": 0,
        "sheet6_herb32_count": 0,
        "sheet6_herb32_bath": 0,
        "total_point": 0,
        "total_bath": 0
    }

    for c, u in unit_summary.items():
        u["total_point"] = u["sheet3_service_point"] + u["sheet4_herb55_point"]
        u["total_bath"] = (
            u["sheet3_service_bath"] +
            u["sheet4_herb55_bath"] +
            u["sheet5_herb9_bath"] +
            u["sheet6_herb32_bath"]
        )
        for k in district_total:
            district_total[k] += u[k]

    master["aggregated"] = {
        "district_total": district_total,
        "units": unit_summary
    }

    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)
    print(f"  -> บันทึก {master_path} เรียบร้อยแล้ว", flush=True)

    # Save Sync Metadata
    meta_path = os.path.join(DATA_DIR, "nhso_sync_metadata.json")
    meta = {
        "last_sync": datetime.now().isoformat(),
        "last_sync_thai": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        "process_date": process_date,
        "status": "success",
        "duration_seconds": round((datetime.now() - sync_start).total_seconds(), 1),
        "sheets_synced": args.sheets,
        "years_synced": args.years
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print("==================================================================", flush=True)
    print(f"  [สำเร็จ 100%] ซิงค์ข้อมูล สปสช. MeData เรียบร้อยแล้ว (ใช้เวลา {meta['duration_seconds']} วินาที)")
    print(f"  วันที่ประมวลผล สปสช.: {process_date}")
    print("==================================================================", flush=True)
    return True

if __name__ == "__main__":
    asyncio.run(run_sync())

"""Build data/pcc_2569_master.json from the source Excel "PCC 2569/PCC_69_R.1.xlsx".

The committed master file was originally produced by hand from that Excel.
This script recreates it reproducibly (float bit-exact) with these derivation
rules, reverse-engineered from the committed JSON:

- Sheet "เขต 1" holds one row per primary-care unit per HMAIN network, so a unit
  (HSUB code) can appear in several rows. Saraphi unit values are SUMS over all
  rows sharing the same HSUB code (e.g. 06016 appears twice, 14461 three times).
- The sheet's trailing rows are: one "รวม" zone-total row, one empty row and one
  "อัตราจ่าย(บาท)ต่อ 1 คะแนน" rates row.
- zone1_benchmark = sums over ALL sheet data rows INCLUDING the "รวม" row.
  NOTE: this reproduces the committed JSON exactly but means the committed
  benchmark totals are 2x the zone's own total row (e.g. uc_pop 7,774,906 vs the
  รวม row's 3,887,453). rate_per_point (= total_budget/total_pt_prod) is
  unaffected by this scaling. Sums use numpy pairwise summation to stay
  bit-identical to the original pandas-based build.
- rate_per_point = kpi_budget_sum / point_prod_sum. The official per-point rates
  are also printed as constants in the sheet's last row (1.90064841... /
  410.03076... / 1.51051375... / 777.69047...).
- score (0-5 stars) is recomputed from the aggregated rate using the star
  brackets from the announcement; weight_score = score; point_prod and budget
  are sums of the sheet's "คะแนนถ่วงน้ำหนัก*ผลงาน" and "จัดสรรเงิน" columns;
  budgets are rounded to 2 decimals.
- saraphi_district: rate = round(a/b*100, 2); kpi budgets = sum of the ROUNDED
  unit budgets (rounded again); total_budget = sum of the ROUNDED unit totals.
- Unit 99758 (ศสม.สารภี) does not exist in the Excel; it is added as an
  all-zero placeholder (its kpi blocks carry no "multiplier" key, as committed).
- Hospital names / short names / subdistricts are NOT in the Excel: they come
  from the constant table below (manual unit registry).

Known deviation from the committed JSON (reported, not silently kept):
  unit 06016 kpi2 score is 0 in the committed file but 1 by the bracket rule
  (rate 1.14% falls in ">0 - <=34%" = 1 star). This script writes the
  rule-derived value (score 1, weight_score 1.0).

Constants marked "ค่าจากประกาศ/คู่มือ PCC 2569" (star brackets, KPI weights,
metadata text) come from:
  - PCC 2569/ราชกิจจา 68_ประกาศฯ PCC.pdf
  - PCC 2569/บริการสาธารณสุขเพิ่มเติม PCC 2569 4 ตัวชี้วัด.txt

Usage: python scripts/build_pcc_2569_master.py
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_XLSX = os.path.join(ROOT_DIR, "PCC 2569", "PCC_69_R.1.xlsx")
OUT_JSON = os.path.join(ROOT_DIR, "data", "pcc_2569_master.json")

# --- Sheet "เขต 1" column layout (1-based) --------------------------------
COL_HSUB = 9          # I  HSUB_ID (hospcode)
COL_HSUB_NAME = 10    # J  HSUB_name
COL_UC_POP = 11       # K  ประชากร UC
COL_UC35_POP = 12     # L  ประชากร UC อายุ 35+
# Per KPI: A, B, rate%(A/B*100), score(1-5), quality(1|0.9), weighted score,
# weighted score * performance (point product), budget allocation.
KPI_COLS = {          # first column of each KPI block (a, b, rate, score, qual, wscore, point_prod, budget)
    "kpi1": 13,       # M..T
    "kpi2": 21,       # U..AB
    "kpi3": 29,       # AC..AJ
    "kpi4": 37,       # AK..AR
}
COL_TOTAL = 45        # AS รวมจ่ายหน่วยบริการ

# --- ค่าจากประกาศ/คู่มือ PCC 2569 ------------------------------------------
# (PCC 2569/ราชกิจจา 68_ประกาศฯ PCC.pdf, PCC 2569/บริการสาธารณสุขเพิ่มเติม PCC 2569 4 ตัวชี้วัด.txt)
KPI_META = {
    "kpi1": {
        "code": "PCC-69-1",
        "name": "KPI 1: จน.ปชก. UC อายุ ≥35 ปี ที่ไม่เคยเป็น DM ได้ตรวจคัดกรองน้ำตาล ในช่วง 1 กค. 68 - 30 มิย. 69",
        "short_name": "คัดกรองเบาหวาน (DM Screen)",
        "weight_percent": 20,
        "target_desc": "เกณฑ์คะแนน: <56% (0 ดาว), 56-<65% (1 ดาว), 65-<74% (2 ดาว), 74-<83% (3 ดาว), 83-<92% (4 ดาว), >=92% (5 ดาว)",
        "brackets": [
            {"score": 1, "min": 56.0, "max": 65.0, "label": "56 - <65%"},
            {"score": 2, "min": 65.0, "max": 74.0, "label": "65 - <74%"},
            {"score": 3, "min": 74.0, "max": 83.0, "label": "74 - <83%"},
            {"score": 4, "min": 83.0, "max": 92.0, "label": "83 - <92%"},
            {"score": 5, "min": 92.0, "max": 100.0, "label": ">= 92%"},
        ],
    },
    "kpi2": {
        "code": "PCC-69-2",
        "name": "KPI 2: จน.ปชก. UC อายุ ≥35 ปี ที่คัดกรองเป็นกลุ่มเสี่ยง/Pre DM ในช่วง 1 กค. 67 - 30 มิย. 68 กลับมาปกติในช่วง 1 กค. 68 - 30 มิย. 69",
        "short_name": "Pre-DM กลับเป็นปกติ (Pre-DM Normal)",
        "weight_percent": 40,
        "target_desc": "เกณฑ์คะแนน: 0% (0 ดาว), >0-<=34% (1 ดาว), 35-<45% (2 ดาว), 45-<55% (3 ดาว), 55-<65% (4 ดาว), >=65% (5 ดาว)",
        "brackets": [
            {"score": 1, "min": 0.01, "max": 34.0, "label": ">0 - <=34%"},
            {"score": 2, "min": 35.0, "max": 45.0, "label": "35 - <45%"},
            {"score": 3, "min": 45.0, "max": 55.0, "label": "45 - <55%"},
            {"score": 4, "min": 55.0, "max": 65.0, "label": "55 - <65%"},
            {"score": 5, "min": 65.0, "max": 100.0, "label": ">= 65%"},
        ],
    },
    "kpi3": {
        "code": "PCC-69-3",
        "name": "KPI 3: จน.ปชก. UC อายุ ≥35 ปี ที่ไม่เคยเป็น HT ได้ตรวจคัดกรองความดัน ในช่วง 1 กค. 68 - 30 มิย. 69",
        "short_name": "คัดกรองความดัน (HT Screen)",
        "weight_percent": 15,
        "target_desc": "เกณฑ์คะแนน: <57% (0 ดาว), 57-<66% (1 ดาว), 66-<75% (2 ดาว), 75-<84% (3 ดาว), 84-<93% (4 ดาว), >=93% (5 ดาว)",
        "brackets": [
            {"score": 1, "min": 57.0, "max": 66.0, "label": "57 - <66%"},
            {"score": 2, "min": 66.0, "max": 75.0, "label": "66 - <75%"},
            {"score": 3, "min": 75.0, "max": 84.0, "label": "75 - <84%"},
            {"score": 4, "min": 84.0, "max": 93.0, "label": "84 - <93%"},
            {"score": 5, "min": 93.0, "max": 100.0, "label": ">= 93%"},
        ],
    },
    "kpi4": {
        "code": "PCC-69-4",
        "name": "KPI 4: จน.ปชก. UC อายุ ≥35 ปี ที่คัดกรองพบว่ามีความดันสูงและได้รับวินิจฉัยเป็น ผป.HT รายใหม่ ในช่วง 1 กค. 68 - 30 มิย. 69",
        "short_name": "วินิจฉัย HT รายใหม่ (New HT Diag)",
        "weight_percent": 25,
        "target_desc": "เกณฑ์คะแนน: 0% (0 ดาว), >0-<6.3% (1 ดาว), 6.3-<7.8% (2 ดาว), 7.8-<9.3% (3 ดาว), 9.3-<10.8% (4 ดาว), >=10.8% (5 ดาว)",
        "brackets": [
            {"score": 1, "min": 0.01, "max": 6.3, "label": ">0 - <6.3%"},
            {"score": 2, "min": 6.3, "max": 7.8, "label": "6.3 - <7.8%"},
            {"score": 3, "min": 7.8, "max": 9.3, "label": "7.8 - <9.3%"},
            {"score": 4, "min": 9.3, "max": 10.8, "label": "9.3 - <10.8%"},
            {"score": 5, "min": 10.8, "max": 100.0, "label": ">= 10.8%"},
        ],
    },
}

# --- Manual unit registry (NOT in the Excel) ------------------------------
# (hospcode, name, short_name, subdistrict) in the committed JSON's order.
# 99758 = ศสม.สารภี is absent from the Excel -> all-zero placeholder unit.
SARAPHI_UNITS = [
    ("11135", "โรงพยาบาลสารภี", "รพ.สารภี", "สารภี"),
    ("06014", "รพ.สต.บ้านยางเนิ้ง", "รพ.สต.บ้านยางเนิ้ง", "ยางเนิ้ง"),
    ("06015", "รพ.สต.บ้านพญาชมพู", "รพ.สต.บ้านพญาชมพู", "ชมภู"),
    ("06016", "รพ.สต.บ้านศรีสองเมือง", "รพ.สต.บ้านศรีสองเมือง", "ไชยสถาน"),
    ("06017", "รพ.สต.บ้านหัวดง", "รพ.สต.บ้านหัวดง", "ขัวมุง"),
    ("06018", "รพ.สต.บ้านหนองแฝก", "รพ.สต.บ้านหนองแฝก", "หนองแฝก"),
    ("06020", "รพ.สต.บ้านแคว", "รพ.สต.บ้านแคว", "ท่ากว้าง"),
    ("06021", "รพ.สต.บ้านสันต้นกอก", "รพ.สต.บ้านสันต้นกอก", "ดอนแก้ว"),
    ("06022", "รพ.สต.บ้านบวกครกเหนือ", "รพ.สต.บ้านบวกครกเหนือ", "ท่าวังตาล"),
    ("06023", "รพ.สต.บ้านป่าสา", "รพ.สต.บ้านป่าสา", "สันทราย"),
    ("06024", "รพ.สต.บ้านศรีคำชมภู", "รพ.สต.บ้านศรีคำชมภู", "ป่าบง"),
    ("13994", "รพ.สต.บ้านท่าต้นกวาว", "รพ.สต.บ้านท่าต้นกวาว", "ชมภู"),
    ("14461", "รพ.สต.บ้านหนองผึ้ง", "รพ.สต.บ้านหนองผึ้ง", "หนองผึ้ง"),
    ("99758", "ศสม.สารภี", "ศสม.สารภี", "สารภี"),
]

METADATA = {
    "title": "ข้อมูลการจัดสรรค่าบริการสาธารณสุขเพิ่มเติม PCC ปีงบประมาณ 2569 (รอบที่ 1)",
    "budget_year": 2569,
    "round": "R.1",
    "service_date_window": "1 กรกฎาคม 2568 - 30 มิถุนายน 2569",
    "announcement": "ประกาศสำนักงานหลักประกันสุขภาพแห่งชาติ ในราชกิจจานุเบกษา เล่ม 142 ตอนพิเศษ 288 ง (2 ก.ย. 2568)",
    "zone": "สปสช. เขต 1 เชียงใหม่",
    "district": "อำเภอสารภี จังหวัดเชียงใหม่",
}


def score_from_rate(rate, brackets):
    """Star score: highest bracket whose min <= rate (0 when rate below all)."""
    score = 0
    for br in brackets:
        if rate >= br["min"]:
            score = br["score"]
    return score


def load_unit_rows():
    """Return (all_rows, unit_rows) as value tuples; unit rows = rows with an HSUB code."""
    import openpyxl

    wb = openpyxl.load_workbook(SRC_XLSX, data_only=True)
    ws = wb["เขต 1"]
    all_rows, unit_rows = [], []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not any(v is not None for v in row):
            continue
        all_rows.append(row)
        hsub = row[COL_HSUB - 1]
        if hsub is not None and str(hsub).strip():
            unit_rows.append(row)
    return all_rows, unit_rows


def npair_sum(values):
    """Pairwise float summation, bit-identical to numpy/pandas .sum().

    Uses numpy when available (the original build summed via pandas); falls
    back to builtin sum (last-digit float differences possible) otherwise.
    """
    try:
        import numpy as np
    except ImportError:
        return float(sum(values))
    return float(np.sum(np.asarray(values, dtype=np.float64)))


def col_values(rows, col_1based):
    col = col_1based - 1
    return [r[col] for r in rows if isinstance(r[col], (int, float))]


def col_sum(rows, col_1based):
    return npair_sum(col_values(rows, col_1based))


def build_zone_benchmark(all_rows, kpis):
    """Zone totals. Summed over ALL sheet data rows INCLUDING the 'รวม' row,
    exactly as the committed JSON was built (so totals are 2x the sheet's own
    total row; see module docstring)."""
    zkpis = {}
    for kpi, meta in kpis.items():
        c = KPI_COLS[kpi]
        total_a = int(col_sum(all_rows, c))
        total_b = int(col_sum(all_rows, c + 1))
        total_pt_prod = col_sum(all_rows, c + 6)
        total_budget = col_sum(all_rows, c + 7)
        total_rate = round(total_a / total_b * 100, 2) if total_b else 0.0
        rate_per_point = total_budget / total_pt_prod if total_pt_prod else 0.0
        zkpis[kpi] = {
            "total_a": total_a,
            "total_b": total_b,
            "total_rate": total_rate,
            "total_pt_prod": total_pt_prod,
            "total_budget": total_budget,
            "rate_per_point": rate_per_point,
        }
    zone_total_budget = col_sum(all_rows, COL_TOTAL)
    return {
        "total_budget": zone_total_budget,
        "uc_pop": int(col_sum(all_rows, COL_UC_POP)),
        "uc35_pop": int(col_sum(all_rows, COL_UC35_POP)),
        "kpis": zkpis,
    }


def build_units(unit_rows, kpis):
    """Aggregate duplicate HSUB rows per hospcode and compute scores/budgets."""
    by_hosp = {}
    order = []
    for row in unit_rows:
        hosp = str(row[COL_HSUB - 1]).strip()
        if hosp not in by_hosp:
            by_hosp[hosp] = []
            order.append(hosp)
        by_hosp[hosp].append(row)

    units = {}
    for hosp, name, short_name, subdistrict in SARAPHI_UNITS:
        if hosp == "99758":
            # ศสม.สารภี is not in the Excel: zero placeholder (no kpi.multiplier)
            unit = {
                "hospcode": hosp, "name": name, "short_name": short_name,
                "subdistrict": subdistrict, "uc_pop": 0, "uc35_pop": 0,
                "multiplier": 1.0,
            }
            for kpi, meta in kpis.items():
                unit[kpi] = {
                    "a": 0, "b": 0, "rate": 0.0, "score": 0,
                    "weight_score": 0.0, "point_prod": 0.0, "budget": 0.0,
                }
            unit["total_budget"] = 0.0
            units[hosp] = unit
            continue

        rows = by_hosp.get(hosp)
        if not rows:
            raise RuntimeError(f"Saraphi unit {hosp} ({name}) not found in {SRC_XLSX}")
        first = rows[0]
        multiplier = float(first[KPI_COLS["kpi1"] + 3])  # quality column (1 or 0.9)
        unit = {
            "hospcode": hosp, "name": name, "short_name": short_name,
            "subdistrict": subdistrict,
            "uc_pop": int(sum(r[COL_UC_POP - 1] or 0 for r in rows)),
            "uc35_pop": int(sum(r[COL_UC35_POP - 1] or 0 for r in rows)),
            "multiplier": multiplier,
        }
        for kpi, meta in kpis.items():
            c = KPI_COLS[kpi]
            # rows are 0-based tuples: block starts at index c-1 (col c is "a")
            a = int(sum(r[c - 1] or 0 for r in rows))
            b = int(sum(r[c] or 0 for r in rows))
            rate = round(a / b * 100, 2) if b else 0.0
            score = score_from_rate(rate, meta["brackets"])
            unit[kpi] = {
                "a": a,
                "b": b,
                "rate": rate,
                "score": score,
                "multiplier": multiplier,
                "weight_score": float(score),
                "point_prod": float(sum(r[c + 5] or 0 for r in rows)),
                "budget": round(float(sum(r[c + 6] or 0 for r in rows)), 2),
            }
        unit["total_budget"] = round(float(sum(r[COL_TOTAL - 1] or 0 for r in rows)), 2)
        units[hosp] = unit

    # rank_budget: 1 = highest total budget
    ranked = sorted(units.values(), key=lambda u: (-u["total_budget"], u["hospcode"]))
    for rank, unit in enumerate(ranked, start=1):
        units[unit["hospcode"]]["rank_budget"] = rank
    return units


def build_saraphi_district(units, kpis, zone):
    dist = {
        "uc_pop": sum(u["uc_pop"] for u in units.values()),
        "uc35_pop": sum(u["uc35_pop"] for u in units.values()),
        "total_budget": round(sum(u["total_budget"] for u in units.values()), 2),
    }
    for kpi, meta in kpis.items():
        a = sum(u[kpi]["a"] for u in units.values())
        b = sum(u[kpi]["b"] for u in units.values())
        dist[kpi] = {
            "a": a,
            "b": b,
            "rate": round(a / b * 100, 2) if b else 0.0,
            # sum of the ROUNDED unit budgets, rounded again (matches committed JSON)
            "budget": round(sum(u[kpi]["budget"] for u in units.values()), 2),
            "rate_per_point": zone["kpis"][kpi]["rate_per_point"],
        }
    return dist


def main():
    all_rows, unit_rows = load_unit_rows()
    print(f"Loaded {SRC_XLSX}: {len(all_rows)} data rows ({len(unit_rows)} unit rows, incl. duplicate HSUB rows and the รวม total row)")

    zone = build_zone_benchmark(all_rows, KPI_META)
    print(f"Zone benchmark: uc_pop={zone['uc_pop']:,} total_budget={zone['total_budget']:,.2f}")

    units = build_units(unit_rows, KPI_META)
    missing = [h for h, *_ in SARAPHI_UNITS if h not in units]
    if missing:
        raise RuntimeError(f"Units missing from output: {missing}")

    dist = build_saraphi_district(units, KPI_META, zone)
    print(f"Saraphi district: uc_pop={dist['uc_pop']:,} total_budget={dist['total_budget']:,.2f}")

    kpi_meta_out = {}
    for kpi, meta in KPI_META.items():
        kpi_meta_out[kpi] = {
            "code": meta["code"],
            "name": meta["name"],
            "short_name": meta["short_name"],
            "weight_percent": meta["weight_percent"],
            "rate_per_point": zone["kpis"][kpi]["rate_per_point"],
            "target_desc": meta["target_desc"],
            "brackets": meta["brackets"],
        }

    master = {
        "metadata": {
            **METADATA,
            "num_units": len(SARAPHI_UNITS),
            "kpi_meta": kpi_meta_out,
        },
        "zone1_benchmark": zone,
        "saraphi_district": dist,
        "units": units,
    }

    with open(OUT_JSON, "w", encoding="utf-8", newline="\r\n") as f:
        json.dump(master, f, ensure_ascii=False, indent=2)
    print(f"WROTE {OUT_JSON}")
    print("\nDone. Note: zone1_benchmark sums include the sheet's รวม total row")
    print("(reproduces the committed JSON exactly; true zone totals are half).")


if __name__ == "__main__":
    main()

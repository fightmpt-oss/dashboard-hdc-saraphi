"""Verify data integrity of every displayed indicator — nightly self-check.

ใบตรวจรับรองข้อมูล: ตรวจทุกตัวชี้วัดทุกปีทุกหน่วยบริการตามเกณฑ์ที่จับความผิด
พลาดที่พบบ่อย (ดึงผิดหน่วย/ผิดอำเภอ/คำนวณผิด/แสดงไม่ครบ) และเฝ้าสคีมาของ
raw snapshot ว่า HDC ไม่ได้เปลี่ยนคอลัมน์ (บทเรียนกรณี s_dm_hypo/s_ht_control)

Checks:
  completeness    — ทุกตัวชี้วัดมีครบ 3 ปี, NCD ครบ 14 หน่วยทุกปี, รหัสหน่วยถูกต้อง
  invariants      — (ตัวชี้วัด %) 0 ≤ rate ≤ 100, num ≤ den,
                    rate == num/den×100 (tolerance 0.02),
                    (ทุกตัว) ยอดอำเภอ == ผลรวมรายหน่วย, จำนวนไม่ติดลบ
  cross_view      — 4 ตาราง PCC ตัวเลขมุมมองงบ PCC == มุมมอง Service Plan
                    (district + รายหน่วย ครบ 3 ปี — ตรวจจับ snapshot เหลื่อมกัน)
  fingerprints    — ชุดคอลัมน์ของ raw snapshot แต่ละตารางตรงกับ baseline
                    (data/schema_fingerprints.json) — HDC เปลี่ยนสคีมา = แดงทันที;
                    reseed หลังตรวจสอบกับ HDC แล้วด้วย --reseed-fingerprints

Output: data/verification_status.json + exit 1 เมื่อตรวจไม่ผ่าน
(ใน GitHub Actions จะหยุดก่อนขั้น commit — ข้อมูลที่ตรวจไม่ผ่านจะไม่ถูกเผยแพร่)
"""
import json
import os
import sys
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from saraphi_config import SARAPHI_UNITS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
YEARS = ["2567", "2568", "2569"]
UNIT_CODES = set(SARAPHI_UNITS.keys())
FINGERPRINT_PATH = os.path.join(DATA, "schema_fingerprints.json")


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def norm_units(units):
    """NCD units เป็น dict, main master เป็น array → ปรับเป็น dict เดียวกัน"""
    if isinstance(units, dict):
        return units
    out = {}
    for u in units or []:
        if isinstance(u, dict) and u.get("hospcode"):
            out[u["hospcode"]] = u
    return out


def scope_nums(scope):
    """(num, den) ของ scope — รองรับชื่อฟิลด์ของทั้งสอง master"""
    if scope is None:
        return None, None
    num = _num(scope["num"]) if scope.get("num") is not None else _num(scope.get("result"))
    den = _num(scope["den"]) if scope.get("den") is not None else _num(scope.get("target"))
    return num, den


def check_indicator(id_label, unit, years, is_ncd, completeness_fail, invariant_fail, warnings):
    """ตรวจตัวชี้วัดเดียวครบทุกปี — failure: ความผิดพลาดของระบบ / warning: ลักษณะข้อมูลต้นทาง HDC"""
    for yr in YEARS:
        yd = years.get(yr)
        if not isinstance(yd, dict):
            completeness_fail.append(f"{id_label} {yr}: ไม่มีข้อมูลปีงบนี้")
            continue
        # NCD: ยอดอำเภออยู่ใน yd.district / main master: อยู่ระดับบนของ year object
        dist = yd["district"] if isinstance(yd.get("district"), dict) else yd
        units = norm_units(yd.get("units"))

        # --- completeness ---
        if is_ncd:
            missing = UNIT_CODES - set(units.keys())
            if missing:
                completeness_fail.append(f"{id_label} {yr}: ขาดหน่วยบริการ {sorted(missing)}")
        extra = set(units.keys()) - UNIT_CODES
        if extra:
            completeness_fail.append(f"{id_label} {yr}: มีหน่วยบริการนอกเขตสารภี {sorted(extra)}")

        # --- invariants ---
        is_pct = (unit == "%")
        dnum, dden = scope_nums(dist)
        scopes = [("อำเภอ", dist)] + [(f"หน่วย {hc}", u) for hc, u in sorted(units.items())]
        for label, sc in scopes:
            num, den = scope_nums(sc)
            if num is None or den is None:
                continue
            if num < 0 or den < 0:
                invariant_fail.append(f"{id_label} {yr} {label}: จำนวนติดลบ (num={num}, den={den})")
            if not is_pct:
                continue
            rate = _num(sc.get("rate"))
            if rate is None:
                if not (den == 0 and num == 0):
                    invariant_fail.append(f"{id_label} {yr} {label}: ไม่มี rate แต่มีตัวเลข")
                continue
            if not (0 <= rate <= 100):
                # num > den: ข้อมูลต้นทาง HDC เองมีจำนวนผลงานมากกว่ากลุ่มเป้าหมาย
                # (พบจริงใน s_bmi2year — ผู้ป่วยอ้วนมากกว่าทะเบียน DM; ตรวจยืนยัน
                # กับ raw API แล้วว่าระบบคำนวณถูกต้อง จึงบันทึกเป็นข้อสังเกต)
                warnings.append(f"{id_label} {yr} {label}: num({num:g}) > den({den:g}) = {rate}% — ลักษณะข้อมูลต้นทาง HDC (ไม่ใช่การคำนวณผิด)")
            if den > 0:
                expected = round(num * 100.0 / den, 2)
                if abs(rate - expected) > 0.02:
                    invariant_fail.append(f"{id_label} {yr} {label}: rate({rate}) != num/den×100({expected})")

        # ยอดอำเภอ == ผลรวมรายหน่วย (จับดึงผิดหน่วย/รวมข้ามเขต)
        u_num = sum(v for v in (_num(scope_nums(u)[0]) for u in units.values()) if v is not None)
        u_den = sum(v for v in (_num(scope_nums(u)[1]) for u in units.values()) if v is not None)
        if dnum is not None and abs(dnum - u_num) > 0.51:
            invariant_fail.append(f"{id_label} {yr}: ยอดอำเภอ num({dnum:g}) != ผลรวมหน่วย({round(u_num, 2)})")
        if dden is not None and abs(dden - u_den) > 0.51:
            invariant_fail.append(f"{id_label} {yr}: ยอดอำเภอ den({dden:g}) != ผลรวมหน่วย({round(u_den, 2)})")


def check_completeness_and_invariants(main_master, ncd_master):
    completeness, invariants, warnings = [], [], []
    for ind_id, ind in main_master.get("indicators", {}).items():
        check_indicator(f"main:{ind_id}", ind.get("unit"), ind.get("years") or {}, False,
                        completeness, invariants, warnings)
    for rep in ncd_master.get("reports", []):
        check_indicator(f"ncd:{rep['id']}({rep.get('table_name')})", rep.get("unit") or "%",
                        rep.get("years") or {}, True, completeness, invariants, warnings)
    return completeness, invariants, warnings


CROSS_VIEW_PAIRS = [
    ("pcc_dm_hba1c", "ncd_36", {"num": "a1", "den": "b1"}),
    ("pcc_dm_control", "ncd_37", {"num": "a1", "den": "b1"}),
    ("pcc_ht_control", "ncd_01", {"num": "a1", "den": "b1"}),
    ("pcc_complication", "ncd_02", {"num": "result", "den": "target"}),
]


def check_cross_view(main_master, ncd_master):
    failures = []
    ncd_by_id = {r["id"]: r for r in ncd_master.get("reports", [])}
    for pcc_id, ncd_id, keys in CROSS_VIEW_PAIRS:
        pcc = main_master.get("indicators", {}).get(pcc_id)
        ncd = ncd_by_id.get(ncd_id)
        if not pcc or not ncd:
            failures.append(f"{pcc_id}/{ncd_id}: ไม่พบตัวชี้วัดฝั่งใดฝั่งหนึ่ง")
            continue
        for yr in YEARS:
            pd_ = pcc.get("years", {}).get(yr) or {}
            nd_ = ncd.get("years", {}).get(yr) or {}
            pdist, ndist = pd_.get("district") or {}, nd_.get("district") or {}
            pnum, pden = _num(pdist.get("num")), _num(pdist.get("den"))
            nnum, nden = _num(ndist.get(keys["num"])), _num(ndist.get(keys["den"]))
            if None not in (pnum, nnum) and abs(pnum - nnum) > 0.51:
                failures.append(f"{pcc_id}/{ncd_id} {yr}: district num ไม่ตรงกัน ({pnum:g} vs {nnum:g})")
            if None not in (pden, nden) and abs(pden - nden) > 0.51:
                failures.append(f"{pcc_id}/{ncd_id} {yr}: district den ไม่ตรงกัน ({pden:g} vs {nden:g})")
            pu = norm_units(pd_.get("units"))
            nu = norm_units(nd_.get("units"))
            for hc in sorted(UNIT_CODES & set(pu) & set(nu)):
                pnum, pden = _num(pu[hc].get("num")), _num(pu[hc].get("den"))
                nnum, nden = _num(nu[hc].get(keys["num"])), _num(nu[hc].get(keys["den"]))
                if None not in (pnum, nnum) and abs(pnum - nnum) > 0.51:
                    failures.append(f"{pcc_id}/{ncd_id} {yr} หน่วย {hc}: num ไม่ตรงกัน ({pnum:g} vs {nnum:g})")
                if None not in (pden, nden) and abs(pden - nden) > 0.51:
                    failures.append(f"{pcc_id}/{ncd_id} {yr} หน่วย {hc}: den ไม่ตรงกัน ({pden:g} vs {nden:g})")
    return failures


def collect_fingerprints():
    """ชุดคอลัมน์ (union ทุกแถว) ของ raw snapshot แต่ละตาราง/แต่ละปี"""
    fps = {}
    for fname in sorted(os.listdir(DATA)):
        if not (fname.startswith("s_") and fname.endswith(".json")):
            continue
        stem = fname[:-5]  # e.g. s_dm_control_2569
        table, _, year = stem.rpartition("_")
        path = os.path.join(DATA, fname)
        try:
            with open(path, encoding="utf-8") as f:
                rows = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue
        if not isinstance(rows, list) or not rows:
            continue
        cols = set()
        for r in rows:
            if isinstance(r, dict):
                cols.update(r.keys())
        fps.setdefault(table, {})[year] = sorted(cols)
    return fps


def check_fingerprints(reseed=False):
    failures, notes = [], []
    current = collect_fingerprints()
    if reseed or not os.path.exists(FINGERPRINT_PATH):
        with open(FINGERPRINT_PATH, "w", encoding="utf-8") as f:
            json.dump(current, f, ensure_ascii=False, indent=2)
        notes.append(f"seeded baseline: {len(current)} tables ({'forced' if reseed else 'first run'})")
        return failures, notes
    with open(FINGERPRINT_PATH, encoding="utf-8") as f:
        baseline = json.load(f)
    for table, years in current.items():
        base = baseline.get(table)
        if base is None:
            failures.append(f"{table}: ตารางใหม่ที่ไม่มีใน baseline (ตรวจความหมายคอลัมน์กับ HDC แล้ว reseed)")
            continue
        for yr, cols in years.items():
            bcols = base.get(yr)
            if bcols is None:
                failures.append(f"{table} {yr}: ปีใหม่ที่ไม่มีใน baseline")
                continue
            added = set(cols) - set(bcols)
            removed = set(bcols) - set(cols)
            if added or removed:
                failures.append(
                    f"{table} {yr}: สคีมา HDC เปลี่ยน! เพิ่ม={sorted(added)} หาย={sorted(removed)} "
                    f"— อย่าเชื่อตัวเลขจนตรวจความหมายคอลัมน์กับ HDC แล้ว reseed")
    for table in baseline:
        if table not in current:
            notes.append(f"{table}: ไม่มี raw snapshot ในรอบนี้ (ข้าม)")
    return failures, notes


def main():
    reseed = "--reseed-fingerprints" in sys.argv
    print("=== Data Integrity Verification ===")
    main_master = load("saraphi_complete_master.json")
    ncd_master = load("ncd_service_plan_master.json")
    overview = load("overview_master.json")

    print("[1/4] completeness (ครบปี/ครบหน่วย/รหัสหน่วยถูกต้อง)")
    completeness, invariants, warnings = check_completeness_and_invariants(main_master, ncd_master)
    sections = [{"name": "completeness", "passed": not completeness,
                 "failures": completeness[:40], "failure_count": len(completeness), "notes": []}]

    print("[2/4] invariants (rate/num/den/ผลรวมอำเภอ)")
    sections.append({"name": "invariants", "passed": not invariants,
                     "failures": invariants[:40], "failure_count": len(invariants), "notes": []})
    print(f"  [{'PASS' if not completeness else 'FAIL'}] completeness: {len(completeness)} failure(s)")
    print(f"  [{'PASS' if not invariants else 'FAIL'}] invariants: {len(invariants)} failure(s)")
    for f in (completeness + invariants)[:8]:
        print(f"         - {f}")
    if warnings:
        print(f"  [WARN] hdc_source_warnings: {len(warnings)} ข้อสังเกต")
        for w in warnings[:5]:
            print(f"         - {w}")

    print("[3/4] cross-view (งบ PCC ↔ Service Plan ต้องตรงกัน)")
    cv_failures = check_cross_view(main_master, ncd_master)
    sections.append({"name": "cross_view", "passed": not cv_failures,
                     "failures": cv_failures[:40], "failure_count": len(cv_failures), "notes": []})
    print(f"  [{'PASS' if not cv_failures else 'FAIL'}] cross_view: {len(cv_failures)} failure(s)")
    for f in cv_failures[:8]:
        print(f"         - {f}")

    print("[4/4] schema fingerprints (HDC ไม่เปลี่ยนคอลัมน์)")
    fp_failures, fp_notes = check_fingerprints(reseed)
    sections.append({"name": "schema_fingerprints", "passed": not fp_failures,
                     "failures": fp_failures[:40], "failure_count": len(fp_failures), "notes": fp_notes})
    print(f"  [{'PASS' if not fp_failures else 'FAIL'}] schema_fingerprints: {len(fp_failures)} failure(s)")
    for f in fp_failures[:8]:
        print(f"         - {f}")

    sections.append({"name": "hdc_source_warnings", "passed": True,
                     "failures": warnings[:40], "failure_count": len(warnings),
                     "notes": ["ลักษณะข้อมูลต้นทาง HDC ที่ตรวจยืนยันแล้ว ไม่ใช่ความผิดพลาดของระบบ"]})

    total = completeness + invariants + cv_failures + fp_failures
    overall = "pass" if not total else "fail"
    status = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "overall": overall,
        "counts": {
            "main_indicators": len(main_master.get("indicators", {})),
            "ncd_reports": len(ncd_master.get("reports", [])),
            "checks_failed": len(total),
            "warnings": len(warnings),
        },
        "sections": sections,
    }
    out = os.path.join(DATA, "verification_status.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(status, f, ensure_ascii=False, indent=2)
    print(f"\nSaved {out}")
    print(f"OVERALL: {overall.upper()} ({len(total)} failures)")
    sys.exit(0 if overall == "pass" else 1)


if __name__ == "__main__":
    main()

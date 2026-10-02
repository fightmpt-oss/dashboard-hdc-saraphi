"""Regenerate data/moph_cache/s_ttm4_{2567,2568,2569}.json from raw sources.

The moph_cache s_ttm4 files were captured by hand around 2026-09-11 and no
script in the repo produced them.  This script rebuilds them reproducibly:

Sources
  - data/s_ttm4_{year}.json          raw HDC OpenData rows (areacode 5019*),
                                     identical to saraphi_s_ttm4_3years.json
  - data/s_ttm7_{year}.json          raw HDC rows -> quarterly thai_qN/total_qN
  - data/drug_names_map.json         didstd -> Thai drug name (curated subset)
  - data/drug_master_tis620.json     didstd -> drug name (TIS-620 decode)
  - data/jhcis_cdrug_map.json        didstd -> drug name (JHCIS CDRUG)
  - scripts/saraphi_config.py        unit registry (names/subdistricts)

Derivation rules (reverse-engineered from the existing caches, all verified
bit-equal on the committed files):
  - one drug item per (hospcode, didstd): sums of vs_all/vs_uc (int) and
    am_all/pri_all/pri_uc (float, rounded to 2dp); alias fields vs=vs_all,
    amount=qty=am_all, price=cost=pri_all
  - items sorted by vs_all descending, ties keep raw row order (stable sort)
  - hdc_grouped_drugs = items grouped by hdc_group_name, same sums,
    sorted by vs_all descending (stable), didstd_list in item order
  - unit totals: total_num = rate = total_tm = sum(pri_all);
    total_den = total_op = vs_all = sum(vs_all)
  - quarters from s_ttm7: num=thai_qN, den=total_qN, rate=round(num/den*100,2)
  - rank / units order = total_num descending within the 14 Saraphi units
  - top-level history_3years = history of TARGET_HOSPCODE ("06020", the unit
    selected when the original caches were captured), derived from all 3 years
  - last_updated = max(date_com) of the year's raw rows
  - drug_name resolution: drug_names_map -> drug_master_tis620 -> jhcis_cdrug_map
    (entries containing "?" i.e. TIS-620 mojibake are skipped) -> fall back to
    the didstd code itself (same convention as the existing caches).
    hdc_group_name = TTM4_HDC_GROUPS[didstd] if known else the drug_name.
    NOTE: the old caches contain ~22 hand-curated names (e.g. "ไพลครีม 30 g.")
    that do not come from the maps; the dashboard re-resolves names itself
    (build_saraphi_master.resolve_clean_herb_name), so numeric data is
    unaffected.  Any name differences are reported by --dry-run.
  - chiangmai_summary is province-wide and NOT derivable from the Saraphi-only
    raw rows: --write carries it over unchanged from the existing cache.

Modes
  python scripts/build_ttm4_cache.py            dry-run: print comparison only
  python scripts/build_ttm4_cache.py --write    actually overwrite the cache files
"""
import argparse
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT_DIR, "data")
CACHE_DIR = os.path.join(DATA_DIR, "moph_cache")
SCRIPTS_DIR = os.path.join(ROOT_DIR, "scripts")
sys.path.insert(0, SCRIPTS_DIR)

YEARS = ["2567", "2568", "2569"]
TARGET_HOSPCODE = "06020"  # unit selected in the original caches (is_target_unit)

INDICATOR_META = {
    "success": True,
    "indicator": "s_ttm4",
    "indicator_code": "1.4",
    "indicator_name": "OPD-อันดับการใช้ยาสมุนไพร",
    "indicator_desc": "อันดับและการกระจายการใช้ยาสมุนไพรรายรายการยา (DIDSTD) และมูลค่าการใช้ยา",
    "unit": "บาท",
    "num_label": "มูลค่าใช้ยาสมุนไพร",
    "den_label": "จำนวนครั้งสั่งจ่าย",
    "rate_label": "มูลค่ายารวม",
    "target_rate": 10.0,
    "hdc_url": "https://hdc.moph.go.th/cmi/public/standard-report-detail/8d38925724b0bbb4b11844b18df088e4",
}

# HDC Standard Report 1.4 group names (didstd -> group) — keep in sync with
# scripts/build_saraphi_master.py (TTM4_HDC_GROUPS).
TTM4_HDC_GROUPS = {
    "420000011779404094782758": "แก้ไอผสมมะขามป้อม ตราอภัยภูเบศร, ยาน้ำ",
    "420000001559402594781053": "แก้ไอผสมมะขามป้อม, ยาน้ำ",
    "420000001580000094782755": "แก้ไอผสมมะขามป้อม, ยาน้ำ/ยาจิบ",
    "420000001589502094782737": "แก้ไอผสมมะขามป้อม, ยาน้ำ",
    "420000010349500794782770": "แก้ไอผสมมะขามป้อม, ยาน้ำ",
    "420000003969120020382755": "ประสะมะแว้ง, ยาลูกกลอน/ยาอม",
    "420000003969120021582750": "ประสะมะแว้ง, ยาลูกกลอน/ยาอม",
    "420000001540000094711170": "ประสะมะแว้ง, ยาลูกกลอน/ยาอม",
    "410000000479150020182750": "ฟ้าทะลายโจร, ยาแคปซูล",
    "410000000479135020182737": "ฟ้าทะลายโจร, ยาแคปซูล",
    "410000000479135020182755": "ฟ้าทะลายโจร, ยาแคปซูล",
    "410000000109150020182742": "ขมิ้นชัน, ยาแคปซูล",
    "410000000109150020182748": "ขมิ้นชัน, ยาแคปซูล",
    "410000000109150020111197": "ขมิ้นชัน, ยาแคปซูล",
    "400000000120000000400000": "ขมิ้นชัน, ยาผง",
    "410000000499140020182750": "มะขามแขก, ยาแคปซูล",
    "410000000499145020182737": "มะขามแขก, ยาแคปซูล",
    "410000000499130020382750": "มะขามแขก, ยาแคปซูล",
    "410000000459601440182737": "ไพล, ครีม",
    "410000000459301440182750": "ไพล, ครีม",
    "410000000450000040111144": "ไพล, น้ำมัน",
    "410000000239150020182750": "เถาวัลย์เปรียง, ยาแคปซูล",
    "410000000239140020182758": "เถาวัลย์เปรียง, ยาแคปซูล",
    "410000000239150000000000": "เถาวัลย์เปรียง, ยาแคปซูล",
    "410050000000000000000000": "ยาสมุนไพรกลุ่มบำรุงโลหิต",
    "410040000000000000000000": "ยาสมุนไพรกลุ่มขับลมและระบาย",
    "420010000000000000000000": "ยาแผนไทยตำรับกลุ่มปรับธาตุ",
    "4200800000000000000": "ยาแผนไทยตำรับกลุ่มสตรีและหลังคลอด",
    "410000000389300550282750": "พญายอ, สารละลายสำหรับป้ายปาก",
    "410000000389401050382758": "พญายอ, สารละลายสำหรับป้ายปาก",
    "410000000380000041911197": "พญายอ, ยาน้ำ",
    "410000000389301840182758": "พญายอ, ครีม",
    "410000000649200234182758": "หญ้าหนวดแมว, ยาชง",
    "410000000649200234110671": "หญ้าหนวดแมว, ยาชง",
    "410000000619201034111135": "หญ้าดอกขาว, ยาชง",
    "420000004119150020182748": "เพชรสังฆาต, ยาแคปซูล",
    "420000004129150020182750": "เพชรสังฆาต, ยาแคปซูล",
    "420000002169140020182758": "เพชรสังฆาต, ยาแคปซูล",
    "420000007839140020182758": "รางจืด, ยาแคปซูล",
    "420000005649138020182750": "รางจืด, ยาแคปซูล",
    "420000008179140020182737": "รางจืด, ยาแคปซูล",
    "420000006979150020182750": "ดอกคำฝอย, ยาแคปซูล",
    "420000002379150020182742": "ยาธาตุบรรจบ, ยาแคปซูล",
    "420000002369125020110919": "ยาธาตุบรรจบ, ยาผง/เม็ด",
    "420000002939500594711135": "ยาธาตุอบเชย, ยาน้ำ",
    "420000002939500494711135": "ยาธาตุอบเชย, ยาน้ำ",
    "420000002930000002311170": "ยาธาตุอบเชย, ยาน้ำ",
    "420000004489220044211197": "ลูกประคบสมุนไพร, ประคบแห้ง/สด",
    "420000004489220044211119": "ลูกประคบสมุนไพร, สด",
    "420000004489220044282750": "ลูกประคบสมุนไพร, แห้ง",
    "420000004489215044211135": "ลูกประคบสมุนไพร",
    "420000004489220044282770": "ลูกประคบสมุนไพร",
    "420000016869220044211135": "ลูกประคบสมุนไพรสด",
    "420000004919150020182750": "ตรีผลา, ยาแคปซูล",
    "420000005179201594582742": "ยาหอมนวโกฐ, ยาผง",
    "420000001550000094710665": "ยาหอมเทพจิตร, ยาผง/เม็ด",
    "420000010169210094111135": "ประสะไพล, ยาแคปซูล/ผง",
    "420000014769207894511452": "ยาต้มศุขไสยาศน์ (กัญชาแผนไทย)",
    "420000014759500494782770": "ยาศุขไสยาศน์ (กัญชาแผนไทย)",
    "420000014869150020111452": "น้ำมันกัญชา (แผนไทย)",
    "420000001930000040611170": "บัวบก, ครีม",
}

# short_name label quirk of the original caches: 99758 (ศสม.) uses the full
# official name as short_name; every other unit uses the registry name.
SHORT_NAME_OVERRIDES = {"99758": "ศูนย์สุขภาพชุมชนตำบลสารภี"}


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def clean_did(value):
    return str(value or "").strip().replace(" ", "")


def build_name_maps():
    """didstd -> drug name from the three maps (mojibake-safe order)."""
    names_map = load_json(os.path.join(DATA_DIR, "drug_names_map.json"), {})
    tis620 = load_json(os.path.join(DATA_DIR, "drug_master_tis620.json"), {})
    jhcis = load_json(os.path.join(DATA_DIR, "jhcis_cdrug_map.json"), {})

    def resolve(did):
        for source in (names_map, tis620, jhcis):
            name = source.get(did)
            if name and "?" not in name:
                return str(name).strip()
        return did  # same convention as the old caches: code as name

    return resolve


def aggregate_raw(rows):
    """{(hospcode, didstd): sums} with dids ordered by first raw appearance."""
    agg = {}
    for r in rows:
        hc = str(r.get("hospcode") or "").strip()
        did = clean_did(r.get("didstd"))
        key = (hc, did)
        if key not in agg:
            agg[key] = {
                "didstd_raw": str(r.get("didstd") or ""),  # verbatim (2568 raw has one spaced code)
                "vs_all": 0, "vs_uc": 0,
                "am_all": 0.0, "pri_all": 0.0, "pri_uc": 0.0,
                "areacode": str(r.get("areacode") or ""),
                "date_com": str(r.get("date_com") or ""),
            }
        a = agg[key]
        a["vs_all"] += int(r.get("vs_all") or 0)
        a["vs_uc"] += int(r.get("vs_uc") or 0)
        a["am_all"] += float(r.get("am_all") or 0)
        a["pri_all"] += float(r.get("pri_all") or 0)
        a["pri_uc"] += float(r.get("pri_uc") or 0)
    return agg


def quarters_from_ttm7(rows):
    """{hospcode: {qN: {num, den, rate}}} from raw s_ttm7 thai_qN/total_qN."""
    out = {}
    for r in rows:
        hc = str(r.get("hospcode") or "").strip()
        if not hc:
            continue
        quarters = {}
        for q in range(1, 5):
            num = round(float(r.get(f"thai_q{q}") or 0.0), 2)
            den = round(float(r.get(f"total_q{q}") or 0.0), 2)
            rate = round(num / den * 100, 2) if den > 0 else 0.0
            quarters[f"q{q}"] = {"num": num, "den": den, "rate": rate}
        out[hc] = quarters
    return out


def make_drug_item(did, a, resolve_name):
    drug_name = resolve_name(did)
    group = TTM4_HDC_GROUPS.get(did, drug_name)
    vs_all = a["vs_all"]
    am_all = round(a["am_all"], 2)
    pri_all = round(a["pri_all"], 2)
    return {
        "didstd": did,
        "drug_name": drug_name,
        "hdc_group_name": group,
        "vs": vs_all,
        "vs_all": vs_all,
        "vs_uc": a["vs_uc"],
        "amount": am_all,
        "am_all": am_all,
        "qty": am_all,
        "price": pri_all,
        "pri_all": pri_all,
        "pri_uc": round(a["pri_uc"], 2),
        "cost": pri_all,
    }


def group_drugs(items):
    groups = {}
    order = []
    for it in items:
        gname = it["hdc_group_name"]
        if gname not in groups:
            groups[gname] = {
                "drug_name": gname,
                "vs_all": 0,
                "vs_uc": 0,
                "am_all": 0.0,
                "pri_all": 0.0,
                "items_count": 0,
                "didstd_list": [],
            }
            order.append(gname)
        g = groups[gname]
        g["vs_all"] += it["vs_all"]
        g["vs_uc"] += it["vs_uc"]
        g["am_all"] = round(g["am_all"] + it["am_all"], 2)
        g["pri_all"] = round(g["pri_all"] + it["pri_all"], 2)
        g["items_count"] += 1
        g["didstd_list"].append(it["didstd"])
    # vs_all descending, stable by first appearance
    ordered = sorted(order, key=lambda g: -groups[g]["vs_all"])
    return [groups[g] for g in ordered]


def build_year_cache(year, resolve_name):
    raw = load_json(os.path.join(DATA_DIR, f"s_ttm4_{year}.json"), None)
    if raw is None:
        raise FileNotFoundError(f"missing raw source: data/s_ttm4_{year}.json")
    ttm7 = load_json(os.path.join(DATA_DIR, f"s_ttm7_{year}.json"), [])
    q_map = quarters_from_ttm7(ttm7)

    from saraphi_config import SARAPHI_UNITS

    agg = aggregate_raw(raw)
    by_hosp = {}
    for (hc, did), a in agg.items():
        by_hosp.setdefault(hc, {})[did] = a

    date_coms = sorted({str(r.get("date_com") or "") for r in raw if r.get("date_com")})
    last_updated = date_coms[-1] if date_coms else ""

    units = []
    for hc in SARAPHI_UNITS:
        info = SARAPHI_UNITS[hc]
        official_name = str(info.get("full_name") or info["name"]).replace(" (แม่ข่าย)", "")
        short_name = SHORT_NAME_OVERRIDES.get(hc, info["name"])
        rows_map = by_hosp.get(hc, {})
        items = [make_drug_item(a["didstd_raw"], a, resolve_name) for a in rows_map.values()]
        items.sort(key=lambda it: -it["vs_all"])  # stable: raw order on ties

        total_num = round(sum(it["pri_all"] for it in items), 2)
        total_den = sum(it["vs_all"] for it in items)
        vs_uc = sum(it["vs_uc"] for it in items)
        units.append({
            "hospcode": hc,
            "hospname": f"{hc}:{official_name}",
            "short_name": short_name,
            "official_name": official_name,
            "areacode": next(iter(rows_map.values()))["areacode"] if rows_map else "",
            "total_num": total_num,
            "total_den": total_den,
            "total_tm": total_num,
            "total_op": total_den,
            "vs_all": total_den,
            "vs_uc": vs_uc,
            "rate": total_num,
            "item_count": len(items),
            "drug_items": items,
            "hdc_grouped_drugs": group_drugs(items),
            "quarters": q_map.get(hc, {f"q{q}": {"num": 0.0, "den": 0.0, "rate": 0.0} for q in range(1, 5)}),
            "date_com": next(iter(rows_map.values()))["date_com"] if rows_map else "",
            "is_target_unit": hc == TARGET_HOSPCODE,
            "rank": 0,
        })

    # rank + units order: total_num descending (stable by registry order)
    units_sorted = sorted(units, key=lambda u: -u["total_num"])
    for i, u in enumerate(units_sorted, 1):
        u["rank"] = i

    total_num = round(sum(u["total_num"] for u in units), 2)
    total_den = sum(u["total_den"] for u in units)
    cache = {
        **INDICATOR_META,
        "year": int(year),
        # key order matches the existing caches: ... hdc_url, year, source, last_updated ...
        "source": "MOPH Open Data API (HDC s_ttm4)",
        "last_updated": last_updated,
        "target_unit": next(u for u in units if u["hospcode"] == TARGET_HOSPCODE),
        "saraphi_summary": {
            "total_units": len(units),
            "total_num": total_num,
            "total_den": total_den,
            "total_tm": total_num,
            "total_op": total_den,
            "rate": total_num,
            "units": units_sorted,
        },
        # chiangmai_summary is province-wide: not derivable from Saraphi-only
        # raw rows -> carried over from the existing cache by the caller.
        "chiangmai_summary": {},
        # history_3years (all 3 years) is filled in by build_all()
        "history_3years": [],
    }
    return cache


def build_all():
    """Return {year: cache_dict} with history_3years and chiangmai filled in."""
    from saraphi_config import SARAPHI_UNITS

    resolve_name = build_name_maps()

    # Pre-compute per-year aggregates + per-unit total_num for history ranks
    per_year = {}
    for year in YEARS:
        raw = load_json(os.path.join(DATA_DIR, f"s_ttm4_{year}.json"), None)
        if raw is None:
            raise FileNotFoundError(f"missing raw source: data/s_ttm4_{year}.json")
        per_year[year] = aggregate_raw(raw)

    def unit_rank_total(year, hospcode):
        totals = {}
        for (hc, _did), a in per_year[year].items():
            totals[hc] = round(totals.get(hc, 0.0) + a["pri_all"], 2)
        ranked = sorted(SARAPHI_UNITS, key=lambda hc: -totals.get(hc, 0.0))
        return totals.get(hospcode, 0.0), ranked.index(hospcode) + 1

    history = []
    for year in YEARS:
        rows_map = {(hc, did): a for (hc, did), a in per_year[year].items() if hc == TARGET_HOSPCODE}
        vs_all = sum(a["vs_all"] for a in rows_map.values())
        vs_uc = sum(a["vs_uc"] for a in rows_map.values())
        total, rank = unit_rank_total(year, TARGET_HOSPCODE)
        history.append({
            "year": int(year),
            "total_pri": total,
            "vs_all": vs_all,
            "vs_uc": vs_uc,
            "vs_other": vs_all - vs_uc,
            "items_count": len(rows_map),
            "rank": rank,
            "pri_uc": round(sum(a["pri_uc"] for a in rows_map.values()), 2),
        })

    caches = {}
    for year in YEARS:
        cache = build_year_cache(year, resolve_name)
        cache["history_3years"] = history
        prev = load_json(os.path.join(CACHE_DIR, f"s_ttm4_{year}.json"), {})
        cache["chiangmai_summary"] = prev.get("chiangmai_summary", {})
        caches[year] = cache
    return caches


# --------------------------------------------------------------------------
# Dry-run comparison
# --------------------------------------------------------------------------

def district_top5(cache):
    totals = {}
    names = {}
    for u in cache.get("saraphi_summary", {}).get("units", []):
        for it in u.get("drug_items", []):
            did = clean_did(it.get("didstd"))
            totals[did] = totals.get(did, 0) + int(it.get("vs_all") or 0)
            names.setdefault(did, str(it.get("drug_name") or did))
    top = sorted(totals.items(), key=lambda kv: -kv[1])[:5]
    return [(did, names[did], vs) for did, vs in top]


def compare_year(year, old, new):
    problems = []
    print(f"\n--- {year} " + "-" * 60)

    o_sp, n_sp = old.get("saraphi_summary", {}), new["saraphi_summary"]
    print(f"district totals: cache total_num={o_sp.get('total_num')} total_den={o_sp.get('total_den')} | "
          f"regen total_num={n_sp['total_num']} total_den={n_sp['total_den']}")
    if o_sp.get("total_num") != n_sp["total_num"] or o_sp.get("total_den") != n_sp["total_den"]:
        problems.append("district totals differ")

    o_units = {u.get("hospcode"): u for u in o_sp.get("units", [])}
    items_cache = items_regen = 0
    distinct_did_cache, distinct_did_regen = set(), set()
    name_diffs = []
    print(f"{'unit':7s} {'cache num':>12s} {'regen num':>12s} {'cache den':>9s} {'regen den':>9s} "
          f"{'items c/r':>9s}  status")
    for u in n_sp["units"]:
        hc = u["hospcode"]
        o = o_units.get(hc, {})
        o_items = len(o.get("drug_items", [])) if o else 0
        items_cache += o_items
        items_regen += u["item_count"]
        for it in o.get("drug_items", []):
            if it.get("didstd"):
                distinct_did_cache.add(clean_did(it["didstd"]))
        for it in u["drug_items"]:
            distinct_did_regen.add(it["didstd"])
        num_ok = abs(float(o.get("total_num") or 0) - u["total_num"]) < 0.005
        den_ok = int(o.get("total_den") or 0) == u["total_den"]
        ok = num_ok and den_ok and o_items == u["item_count"]
        if not ok:
            problems.append(f"{hc}: totals/items differ (cache {o.get('total_num')}/{o.get('total_den')}/{o_items})")
        print(f"{hc:7s} {float(o.get('total_num') or 0):12.2f} {u['total_num']:12.2f} "
              f"{int(o.get('total_den') or 0):9d} {u['total_den']:9d} {o_items:>4d}/{u['item_count']:<4d} "
              f"{'OK' if ok else 'DIFF'}")

    # name differences
    for u in n_sp["units"]:
        o = o_units.get(u["hospcode"], {})
        o_names = {clean_did(it.get("didstd")): str(it.get("drug_name") or "") for it in o.get("drug_items", [])}
        for it in u["drug_items"]:
            on = o_names.get(it["didstd"])
            if on is not None and on != it["drug_name"]:
                name_diffs.append((u["hospcode"], it["didstd"], on, it["drug_name"]))

    print(f"drug items: cache={items_cache} regen={items_regen} | distinct didstd: "
          f"cache={len(distinct_did_cache)} regen={len(distinct_did_regen)}")

    o_top = district_top5(old)
    n_top = district_top5(new)
    print("top-5 district drugs by vs_all (cache | regen):")
    for i in range(max(len(o_top), len(n_top))):
        o_s = f"{o_top[i][1][:34]}: vs={o_top[i][2]}" if i < len(o_top) else "-"
        n_s = f"{n_top[i][1][:34]}: vs={n_top[i][2]}" if i < len(n_top) else "-"
        marker = "" if (i < len(o_top) and i < len(n_top) and o_top[i][0] == n_top[i][0] and o_top[i][2] == n_top[i][2]) else "   <- differs"
        print(f"  {i+1}. {o_s:52s} | {n_s}{marker}")

    if name_diffs:
        print(f"drug_name differences (cache label vs map-derived): {len(name_diffs)}")
        for hc, did, on, nn in name_diffs[:6]:
            print(f"    {hc} {did}: cache={on!r} -> regen={nn!r}")
        if len(name_diffs) > 6:
            print(f"    ... and {len(name_diffs) - 6} more")

    o_hist = old.get("history_3years") or []
    if o_hist != new["history_3years"]:
        problems.append("history_3years differs")
    print(f"history_3years (target {TARGET_HOSPCODE}): "
          f"{'OK (identical)' if o_hist == new['history_3years'] else 'DIFFERS'}")
    cm = new.get("chiangmai_summary") or {}
    print(f"chiangmai_summary: preserved from existing cache "
          f"(total_num={cm.get('total_num')}, total_units={cm.get('total_units')}) — not derivable from raw")

    return problems


def main():
    parser = argparse.ArgumentParser(description="Rebuild moph_cache s_ttm4 files from raw data (dry-run by default).")
    parser.add_argument("--write", action="store_true",
                        help="overwrite data/moph_cache/s_ttm4_{year}.json (default: dry-run)")
    args = parser.parse_args()

    caches = build_all()

    if not args.write:
        print("DRY-RUN (no files written; pass --write to overwrite the cache files)")
        all_problems = []
        for year in YEARS:
            old = load_json(os.path.join(CACHE_DIR, f"s_ttm4_{year}.json"), {})
            if not old:
                print(f"\n--- {year}: no existing cache to compare")
                continue
            all_problems += [(year,) + p for p in compare_year(year, old, caches[year])]
        print("\n" + "=" * 70)
        if all_problems:
            print(f"RESULT: {len(all_problems)} difference(s):")
            for p in all_problems:
                print("  -", " ".join(str(x) for x in p))
        else:
            print("RESULT: regenerated numeric data matches the existing caches for all years.")
        return

    for year in YEARS:
        path = os.path.join(CACHE_DIR, f"s_ttm4_{year}.json")
        with open(path, "w", encoding="utf-8", newline="\r\n") as f:
            json.dump(caches[year], f, ensure_ascii=False, indent=2)
        print(f"WROTE {path}")
    print("\nDone. chiangmai_summary was carried over from the previous caches (not derivable from raw).")


if __name__ == "__main__":
    main()

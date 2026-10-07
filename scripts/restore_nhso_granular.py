"""One-off recovery for the สปสช. monthly datasets after the partial-year sync:
- herb9: restore wholesale from git 08c3819 (has per-unit herbs + monthly items)
- herb55 / herb32: restore from git 08c3819 as the BASE (3 years + granular
  fields through ก.ค. 2569), then overlay TODAY's fresh 2569 monthly numbers
  (districtCount/districtBath/units/byMonth/totalPoint — ครบ ส.ค.+ก.ย.)
  while KEEPING the granular fields (herbs/monthlyHerbs/items/unitsPay/herbsPay)
"""
import json
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

GIT_REV = "08c3819"


def old_file(path):
    r = subprocess.run(["git", "show", f"{GIT_REV}:{path}"],
                       capture_output=True, text=True, encoding="utf-8")
    return json.loads(r.stdout)


def save(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  saved {path}")


def overlay_year(base_year, fresh_year):
    """อัปเดตตัวเลขรายเดือน/รายหน่วยจากข้อมูลสด — merge รายฟิลด์
    (ตัวเลข/units จากสด, granular fields เดิมของหน่วยคงไว้)"""
    months_f = fresh_year.get("months") or {}
    months_b = base_year.get("months") or {}
    for m, md in months_f.items():
        mb = months_b.setdefault(m, {})
        for k in ("districtCount", "districtTotalCount", "districtBath", "districtTotalBath",
                  "districtPoint", "districtTotal", "districtSummary", "districtTotalPoint"):
            if k in md:
                mb[k] = md[k]
        if md.get("herbs"):
            mb["herbs"] = md["herbs"]
        # units: merge รายหน่วย — ตัวเลขจากสด, herbs/monthlyHerbs เดิมคงไว้
        fresh_units = md.get("units") or {}
        base_units = mb.setdefault("units", {})
        for code, fu in fresh_units.items():
            if not isinstance(fu, dict):
                base_units[code] = fu  # month-level units เป็น {รหัส: จำนวน}
                continue
            bu = base_units.setdefault(code, fu)
            for k, v in fu.items():
                if k not in ("herbs", "monthlyHerbs", "herbsPay"):
                    bu[k] = v
    # ระดับปี: รวมทับเฉพาะฟิลด์ตัวเลข (herbs/monthlyHerbs ของเดิมคงไว้)
    for code, fu in (fresh_year.get("units") or {}).items():
        if not isinstance(fu, dict):
            base_year.setdefault("units", {})[code] = fu
            continue
        bu = base_year.setdefault("units", {}).setdefault(code, fu)
        for k, v in fu.items():
            if k not in ("herbs", "monthlyHerbs", "herbsPay"):
                bu[k] = v
    if fresh_year.get("districtTotalCount") is not None:
        base_year["districtTotalCount"] = fresh_year["districtTotalCount"]
    if fresh_year.get("districtTotalBath") is not None:
        base_year["districtTotalBath"] = fresh_year["districtTotalBath"]
    if fresh_year.get("districtTotal") is not None:
        base_year["districtTotal"] = fresh_year["districtTotal"]
    if fresh_year.get("districtSummary"):
        base_year["districtSummary"] = fresh_year["districtSummary"]


def main():
    # ---- herb9: restore wholesale ----
    old = old_file("data/nhso/nhso_herb9_monthly.json")
    save("data/nhso/nhso_herb9_monthly.json", old)
    print("  herb9 restored wholesale (2568/2567 herbs + items ครบ)")

    # ---- herb55: base = old, overlay fresh 2569 ----
    base = old_file("data/nhso/nhso_herb55_monthly.json")
    fresh = json.load(open("data/nhso/nhso_herb55_monthly.json", encoding="utf-8"))
    if "2569" in (fresh.get("data") or {}):
        overlay_year(base["data"]["2569"], fresh["data"]["2569"])
    base["process_date"] = fresh.get("process_date", base.get("process_date"))
    save("data/nhso/nhso_herb55_monthly.json", base)
    print("  herb55 = old base + fresh 2569 overlay (herbs/monthlyHerbs คงเดิม)")

    # ---- herb32: base = old, overlay fresh 2569 ----
    base = old_file("data/nhso/nhso_herb32_monthly.json")
    fresh = json.load(open("data/nhso/nhso_herb32_monthly.json", encoding="utf-8"))
    if "2569" in (fresh.get("data") or {}):
        overlay_year(base["data"]["2569"], fresh["data"]["2569"])
    base["process_date"] = fresh.get("process_date", base.get("process_date"))
    save("data/nhso/nhso_herb32_monthly.json", base)
    print("  herb32 = old base + fresh 2569 overlay (items/unitsPay/herbsPay ถึง ก.ค. คงเดิม)")


if __name__ == "__main__":
    main()

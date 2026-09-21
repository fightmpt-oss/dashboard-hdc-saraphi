import json
import os
import sys

SARAPHI_MAP = {
    "06014": {"name": "รพ.สต.บ้านยางเนิ้ง", "subdistrict": "ยางเนิ้ง", "aliases": ["ยางเนิ้ง", "บ้านยางเนิ้ง"]},
    "06015": {"name": "รพ.สต.บ้านพญาชมภู", "subdistrict": "ชมภู", "aliases": ["พญาชมภู", "บ้านพญาชมภู", "พญาชมพู"]},
    "06016": {"name": "รพ.สต.บ้านศรีสองเมือง", "subdistrict": "ไชยสถาน", "aliases": ["ศรีสองเมือง", "สองแคว", "ไชยสถาน"]},
    "06017": {"name": "รพ.สต.บ้านหัวดง", "subdistrict": "ขัวมุง", "aliases": ["หัวดง", "บ้านหัวดง", "ขัวมุง"]},
    "06018": {"name": "รพ.สต.บ้านหนองแฝก", "subdistrict": "หนองแฝก", "aliases": ["หนองแฝก", "บ้านหนองแฝก"]},
    "06020": {"name": "รพ.สต.บ้านแคว (ท่ากว้าง)", "subdistrict": "ท่ากว้าง", "aliases": ["บ้านแคว", "ท่ากว้าง", "แคว"]},
    "06021": {"name": "รพ.สต.บ้านสันต้นกอก", "subdistrict": "ดอนแก้ว", "aliases": ["สันต้นกอก", "ดอนแก้ว"]},
    "06022": {"name": "รพ.สต.บ้านบวกครกเหนือ", "subdistrict": "ท่าวังตาล", "aliases": ["บวกครกเหนือ", "ท่าวังตาล"]},
    "06023": {"name": "รพ.สต.บ้านป่าสา", "subdistrict": "สันทราย", "aliases": ["ป่าเส้า", "บ้านป่าเส้า", "ป่าสา", "บ้านป่าสา", "สันทราย"]},
    "06024": {"name": "รพ.สต.บ้านศรีคำชมภู", "subdistrict": "ป่าบง", "aliases": ["ศรีคำชมภู", "ป่าบง"]},
    "11135": {"name": "รพ.สารภี", "subdistrict": "สารภี", "aliases": ["รพ.สารภี", "โรงพยาบาลสารภี", "สารภี"]},
    "13994": {"name": "รพ.สต.บ้านท่าต้นกวาว", "subdistrict": "ท่ากว้าง", "aliases": ["ท่าต้นกวาว", "บ้านท่าต้นกวาว"]},
    "14461": {"name": "รพ.สต.บ้านหนองผึ้ง", "subdistrict": "หนองผึ้ง", "aliases": ["หนองผึ้ง", "บ้านหนองผึ้ง"]},
    "99758": {"name": "ศสม.สารภี", "subdistrict": "สารภี", "aliases": ["ศสม", "ศูนย์สุขภาพชุมชน"]}
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

def update_dataset():
    h32_path = os.path.join("data", "nhso", "nhso_herb32_monthly.json")
    h32 = json.load(open(h32_path, "r", encoding="utf-8"))
    
    # Load streamlined (2568, 2567) and 2569 full 12 months
    streamlined = json.load(open("scripts/extracted_s6_streamlined.json", "r", encoding="utf-8"))
    full_2569 = json.load(open("scripts/extracted_s6_2569_full12.json", "r", encoding="utf-8"))
    aug_herbs = json.load(open("scripts/august_2569_herbs.json", "r", encoding="utf-8"))
    
    datasets = {
        "2569": full_2569,
        "2568": streamlined.get("2568", {}),
        "2567": streamlined.get("2567", {})
    }
    
    for yr, ydata in datasets.items():
        if yr not in h32["data"]:
            h32["data"][yr] = {}
        target_yr = h32["data"][yr]
        
        # 1. District totals
        units_raw = ydata.get("units", {})
        herbs_raw = ydata.get("herbs", {})
        months_raw = ydata.get("months", {})
        
        tot_cnt = sum(parse_num(v["count"]) for v in units_raw.values())
        tot_pay = sum(parse_num(v["pay"]) for v in units_raw.values())
        
        target_yr["districtTotalCount"] = int(tot_cnt)
        target_yr["districtTotalBath"] = round(tot_pay, 2)
        
        # District herbs
        d_herbs = {}
        d_herbs_pay = {}
        for h, v in herbs_raw.items():
            d_herbs[h] = int(parse_num(v["count"]))
            d_herbs_pay[h] = round(parse_num(v["pay"]), 2)
        target_yr["districtHerbs"] = d_herbs
        target_yr["districtHerbsPay"] = d_herbs_pay
        target_yr["districtItems"] = d_herbs
        
        # Month List
        all_months = list(months_raw.keys())
        target_yr["monthList"] = all_months
        
        # Months
        if "months" not in target_yr:
            target_yr["months"] = {}
        for m, mv in months_raw.items():
            m_u_raw = mv.get("units", {})
            m_h_raw = mv.get("herbs", {})
            
            m_cnt = sum(parse_num(v["count"]) for v in m_u_raw.values())
            m_pay = sum(parse_num(v["pay"]) for v in m_u_raw.values())
            
            u_dict_cnt = {}
            u_dict_pay = {}
            for raw_u, val in m_u_raw.items():
                c = match_hospcode(raw_u)
                if c:
                    u_dict_cnt[c] = int(parse_num(val["count"]))
                    u_dict_pay[c] = round(parse_num(val["pay"]), 2)
                    
            h_dict_cnt = {}
            h_dict_pay = {}
            for h, val in m_h_raw.items():
                h_dict_cnt[h] = int(parse_num(val["count"]))
                h_dict_pay[h] = round(parse_num(val["pay"]), 2)
                
            if m not in target_yr["months"]:
                target_yr["months"][m] = {}
                
            m_entry = target_yr["months"][m]
            m_entry["month"] = m
            m_entry["districtCount"] = int(m_cnt)
            m_entry["districtBath"] = round(m_pay, 2)
            m_entry["units"] = u_dict_cnt
            m_entry["unitsPay"] = u_dict_pay
            m_entry["herbs"] = h_dict_cnt
            m_entry["herbsPay"] = h_dict_pay
            m_entry["items"] = h_dict_cnt
            
        # Units
        if "units" not in target_yr:
            target_yr["units"] = {}
            
        # Initialize all 14 units
        for code, info in SARAPHI_MAP.items():
            if code not in target_yr["units"]:
                target_yr["units"][code] = {
                    "name": info["name"],
                    "subdistrict": info["subdistrict"],
                    "totalCount": 0,
                    "totalBath": 0.0,
                    "monthly": {},
                    "herbs": {},
                    "herbsPay": {},
                    "monthlyHerbs": {},
                    "monthlyHerbsPay": {}
                }
                
        for raw_u, uv in units_raw.items():
            code = match_hospcode(raw_u)
            if not code:
                continue
            u_entry = target_yr["units"][code]
            u_entry["name"] = SARAPHI_MAP[code]["name"]
            u_entry["subdistrict"] = SARAPHI_MAP[code]["subdistrict"]
            u_entry["totalCount"] = int(parse_num(uv["count"]))
            u_entry["totalBath"] = round(parse_num(uv["pay"]), 2)
            
            # Unit herbs
            u_herbs_cnt = {}
            u_herbs_pay = {}
            for h, v in uv.get("herbs", {}).items():
                u_herbs_cnt[h] = int(parse_num(v["count"]))
                u_herbs_pay[h] = round(parse_num(v["pay"]), 2)
            u_entry["herbs"] = u_herbs_cnt
            u_entry["herbsPay"] = u_herbs_pay
            
            # Unit monthly
            u_monthly = {}
            for m, v in uv.get("monthly", {}).items():
                u_monthly[m] = {
                    "count": int(parse_num(v["count"])),
                    "pay": round(parse_num(v["pay"]), 2)
                }
            u_entry["monthly"] = u_monthly
            
            # Monthly herbs for August 2569 if available
            if yr == "2569":
                if "monthlyHerbs" not in u_entry:
                    u_entry["monthlyHerbs"] = {}
                if "monthlyHerbsPay" not in u_entry:
                    u_entry["monthlyHerbsPay"] = {}
                    
                for raw_aug_u, hmap in aug_herbs.items():
                    if match_hospcode(raw_aug_u) == code:
                        aug_cnt = {}
                        aug_pay = {}
                        for h, hv in hmap.items():
                            aug_cnt[h] = int(parse_num(hv["count"]))
                            aug_pay[h] = round(parse_num(hv["pay"]), 2)
                        u_entry["monthlyHerbs"]["สิงหาคม 2569"] = aug_cnt
                        u_entry["monthlyHerbsPay"]["สิงหาคม 2569"] = aug_pay

    with open(h32_path, "w", encoding="utf-8") as f:
        json.dump(h32, f, ensure_ascii=False, indent=2)
    print(f"Updated {h32_path} successfully!")
    
    # Also update master if present
    master_path = os.path.join("data", "nhso", "nhso_saraphi_master.json")
    if os.path.exists(master_path):
        try:
            master = json.load(open(master_path, "r", encoding="utf-8"))
            if "sheets" in master and "6-ยาสมุนไพร 32 รายการ" in master["sheets"]:
                master["sheets"]["6-ยาสมุนไพร 32 รายการ"]["monthly_dataset"] = h32
            if "herb32_monthly" in master:
                master["herb32_monthly"] = h32.get("data", {})
            with open(master_path, "w", encoding="utf-8") as f:
                json.dump(master, f, ensure_ascii=False, indent=2)
            print(f"Updated {master_path} successfully!")
        except Exception as e:
            print("Master update error:", e)

    # Verification of 06020
    bkw = h32["data"]["2569"]["units"]["06020"]
    print("\n================ FINAL VERIFICATION FOR 06020 (2569) ================")
    print("Name:", bkw["name"])
    print("Total Count:", bkw["totalCount"])
    print("Total Bath:", bkw["totalBath"])
    print(f"Monthly ({len(bkw['monthly'])} months):")
    for m, mv in bkw["monthly"].items():
        print(f"  {m}: {mv['count']} ครั้ง | {mv['pay']} บาท")
    print(f"Herbs ({len(bkw['herbs'])} kinds):")
    for h, cnt in bkw["herbs"].items():
        print(f"  {h}: {cnt} ครั้ง | {bkw['herbsPay'].get(h, 0)} บาท")

if __name__ == "__main__":
    update_dataset()

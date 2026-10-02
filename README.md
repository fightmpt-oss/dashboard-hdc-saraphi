# 🏥 HDC Saraphi Health & Herbal Medicine Dashboard (2567-2569)

ระบบสารสนเทศเปรียบเทียบข้อมูลสุขภาพและยาสมุนไพร อำเภอสารภี จังหวัดเชียงใหม่ ย้อนหลัง 3 ปีงบประมาณ (2567, 2568, 2569) ครอบคลุม 14 หน่วยบริการปฐมภูมิและทุติยภูมิ จากฐานข้อมูล **Open Data กระทรวงสาธารณสุข (MoPH)**

### 🌐 Live Links
- 🌍 **เว็บไซต์ออนไลน์ (Live on GitHub Pages)**: [https://fightmpt-oss.github.io/dashboard-hdc-saraphi/](https://fightmpt-oss.github.io/dashboard-hdc-saraphi/)
- 💻 **GitHub Repository**: [https://github.com/fightmpt-oss/dashboard-hdc-saraphi](https://github.com/fightmpt-oss/dashboard-hdc-saraphi)
- 🚀 **1-Click Deploy to Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Ffightmpt-oss%2Fdashboard-hdc-saraphi)

---

## 🌟 จุดเด่นของระบบ (Key Highlights)

1. **🌿 แพทย์แผนไทย & ยาสมุนไพร ครบ 9 ตัวชี้วัดหลัก (Takwang Parity)**
   - มูลค่าการใช้ยาสมุนไพรเทียบกับยาทั้งหมด (s_ttm7)
   - สัดส่วนการใช้ยาสมุนไพรในบัญชียาหลักแห่งชาติ (s_ttm10)
   - สัดส่วนการสั่งใช้ยาสมุนไพรต่อใบสั่งยาผู้ป่วยนอก (s_ttm32)
   - อัตราการรับบริการการแพทย์แผนไทยและการแพทย์ทางเลือก (s_ttm34)
   - อัตราการได้รับยาสมุนไพรต่อคนและต่อครั้ง (s_ttm2)
   - 10 อันดับกลุ่มโรค/อาการที่พบบ่อยที่ได้รับยาสมุนไพร (s_common_diseases_thai_drug)
   - การจ่ายยาสมุนไพรตามอายุและเพศ (s_ttm3)
   - หัตถการบำบัดรักษา/ฟื้นฟู (นวด อบ ประคบ) (s_ttm8)
   - **20 อันดับยาสมุนไพรยอดนิยม** แปลงรหัสยามาตรฐาน 24 หลัก (DIDSTD) เป็นชื่อยาไทย (s_ttm4)

2. **💰 งบ PCC (ผลลัพธ์บริการปฐมภูมิตรายบุคคล - 4 ตัวชี้วัด)**
   - ผู้ป่วย DM ได้รับการตรวจ HbA1c ปีละอย่างน้อย 1 ครั้ง (s_dm_hba1c)
   - ผู้ป่วย DM ควบคุมระดับน้ำตาลได้ดี (HbA1c < 7% หรือ FBS ตามเกณฑ์) (s_dm_control)
   - ผู้ป่วย HT ควบคุมระดับความดันโลหิตได้ดี (< 140/90 mmHg) (s_ht_control)
   - ผู้ป่วยเบาหวาน/ความดันที่เกิดภาวะแทรกซ้อนเฉียบพลัน/Admit (s_dm_hypo)

3. **🎯 งบ PPB (ภาระงานบริการพื้นฐาน Workload - 5 ตัวชี้วัดตาม สปสช.)**
   - การคัดกรองและประเมินพัฒนาการเด็กปฐมวัย 0-5 ปี (s_childdev_specialpp)
   - การชั่งน้ำหนักและวัดส่วนสูงเด็กวัยเรียน 6-12 (หรือ 6-14) ปี (s_kpi_height614)
   - การทา/เคลือบฟลูออไรด์ในเด็ก 4-12 ปี (s_kpi_dental63)
   - การเคลือบหลุมร่องฟันในเด็ก 6-12 ปี (s_kpi_dental64)
   - การคัดกรองโรคซึมเศร้า (2Q) และภาวะสมองเสื่อมในผู้สูงอายุ 60 ปีขึ้นไป (s_2q_adl_test)

4. **👵 ผู้สูงอายุ & NCDs (2 ตัวชี้วัด)**
   - คัดกรองสุขภาพผู้สูงอายุ 9 ด้านตามเกณฑ์ สธ. (s_aged9)
   - ประเมินความสามารถในการดำเนินชีวิตประจำวัน ADL (ติดสังคม/ติดบ้าน/ติดเตียง) (s_ageing)

5. **👶 อนามัยแม่และเด็ก (4 ตัวชี้วัด)**
   - เด็กอายุ 6 เดือน ดื่มนมแม่อย่างเดียว (s_kpi_food)
   - เด็กอายุ 0-5 ปี มีการเจริญเติบโตสมส่วน (น้ำหนักตามเกณฑ์ส่วนสูง) (s_nutrition_11)
   - การคัดกรองพัฒนาการเด็กปฐมวัยตามช่วงอายุ 9, 18, 30, 42, 60 เดือน (s_childdev_specialpp)
   - เด็กพัฒนาการสงสัยล่าช้าได้รับการติดตามประเมินซ้ำ TEDA4I/DAIM (s_childdev_specialpp48)

   > ℹ️ ตัวชี้วัด "ฝากครรภ์ครั้งแรก ≤ 12 สัปดาห์" ถูกถอดออก เพราะตาราง HDC `s_anc12ga`
   > เป็นรายงาน "อายุครรภ์เฉลี่ย" ไม่ใช่ร้อยละความครอบคลุม และไม่มีตาราง HDC OpenData
   > ที่วัด % นี้โดยตรง — การแสดงผลเดิมเป็นตัวเลขที่ไม่มีความหมาย

6. **🔍 OpenData MoPH Explorer (1,028 รายงาน)**
   - แคตตาล็อกค้นหาตาราง HDC Open Data ทั้งหมด 5 หมวดหมู่หลัก 44 หมวดหมู่ย่อย
   - มี Modal แสดงตัวอย่าง **cURL** และ **JavaScript Fetch API** ให้พร้อมนำไปพัฒนาระบบต่อได้ทันที

---

## 🏥 14 หน่วยบริการในอำเภอสารภี (Chiang Mai: 5019)

| รหัสสถานพยาบาล | ชื่อหน่วยบริการ | ตำบล | ประเภท |
| :--- | :--- | :--- | :--- |
| **11135** | โรงพยาบาลสารภี | สารภี | รพช. (แม่ข่าย) |
| **06014** | รพ.สต.บ้านยางเนิ้ง | ยางเนิ้ง | รพ.สต. |
| **06015** | รพ.สต.บ้านพญาชมภู | ชมภู | รพ.สต. |
| **06016** | รพ.สต.บ้านศรีสองเมือง | ไชยสถาน | รพ.สต. |
| **06017** | รพ.สต.บ้านหัวดง | ขัวมุง | รพ.สต. |
| **06018** | รพ.สต.บ้านหนองแฝก | หนองแฝก | รพ.สต. |
| **06020** | รพ.สต.บ้านแคว (ท่ากว้าง) | ท่ากว้าง | รพ.สต. |
| **06021** | รพ.สต.บ้านสันต้นกอก | ดอนแก้ว | รพ.สต. |
| **06022** | รพ.สต.บ้านบวกครกเหนือ | ท่าวังตาล | รพ.สต. |
| **06023** | รพ.สต.บ้านป่าสา | สันทราย | รพ.สต. |
| **06024** | รพ.สต.บ้านศรีคำชมภู | ป่าบง | รพ.สต. |
| **13994** | รพ.สต.บ้านท่าต้นกวาว | ชมภู | รพ.สต. |
| **14461** | รพ.สต.บ้านหนองผึ้ง | หนองผึ้ง | รพ.สต. |
| **99758** | ศสม.สารภี (ศูนย์สุขภาพชุมชน) | สารภี | ศสม. |

---

## 🚀 การนำขึ้นเผยแพร่ (Deployment Guide)

โครงการนี้เป็น **Client-Side Single Page Application (Static SPA)** ไม่จำเป็นต้องตั้งค่า Server ใดๆ สามารถ Deploy ฟรีได้บนทุก Platform:

### วิธีที่ 1: Vercel (แนะนำ ⭐)
1. **ผ่าน GitHub**:
   - อัปโหลดโฟลเดอร์โครงการขึ้น GitHub Repository
   - เข้าไปที่ [vercel.com](https://vercel.com) คลิก **Add New Project** -> เลือก Repository
   - ตั้งค่า **Framework Preset: Other**
   - Root Directory: ./
   - คลิก **Deploy** ได้ทันที (ไฟล์ ercel.json มีการตั้งค่า Caching ให้เรียบร้อย)
2. **ผ่าน Vercel CLI**:
   `ash
   npm install -g vercel
   vercel
   # หรือ deploy ขึ้น production ทันที:
   vercel --prod
   `

---

### วิธีที่ 2: Cloudflare Pages
1. **ผ่าน Direct Upload**:
   - เข้า [dash.cloudflare.com](https://dash.cloudflare.com)
   - ไปที่ **Workers & Pages** -> **Create application** -> **Pages** -> **Upload assets**
   - ลากโฟลเดอร์โครงการ (Dashboard HDC Saraphi) วางแล้วกด **Deploy**
2. **ผ่าน GitHub Integration**:
   - เลือก **Connect to Git**
   - Build command: *(ปล่อยว่าง)*
   - Build output directory: *(ปล่อยว่าง หรือใส่ .)*
   - คลิก **Save and Deploy**
3. **ผ่าน Wrangler CLI**:
   `ash
   npx wrangler pages deploy . --project-name=hdc-saraphi
   `

---

### วิธีที่ 3: GitHub Pages
1. ใน GitHub Repository ไปที่ **Settings** -> **Pages**
2. ภายใต้ **Build and deployment** เลือก Source: Deploy from a branch
3. เลือก Branch main โฟลเดอร์ / (root) แล้วคลิก **Save**

---

## 🔄 แหล่งข้อมูล & ความถี่การอัปเดต (อ่านก่อนใช้ข้อมูล)

**ระบบนี้ไม่ได้ดึงข้อมูลแบบ realtime** — ทุกตัวเลขบนเว็บไซต์มาจากไฟล์ JSON snapshot
ที่ commit ลง git (ผู้ดูแลระบบต้องรันสคริปต์ดึงข้อมูลแล้ว push ข้อมูลจึงจะอัปเดต)
วันที่ข้อมูลล่าสุดดูได้จาก `metadata.generated_at` ใน `data/saraphi_complete_master.json`
และ `last_updated` ใน `data/ncd_service_plan_master.json`

### ลำดับการรันเมื่อต้องการรีเฟรชข้อมูล

```bash
# 1) ดึงข้อมูลดิบ 4 ตาราง PCC จาก OpenData MoPH (paginated, fail-loud)
python scripts/refresh_pcc_data.py

# 2) ดึงข้อมูลดิบตาราง TTM/PPB/ผู้สูงอายุ/MCH ที่เหลือ
python fetch_all_saraphi_data.py
python fetch_additional_kpis.py

# 3) อัปเดตมุมมอง Service Plan (NCD) — enricher แต่ละตัว fetch เองและเขียน
#    raw snapshot ลง data/ ให้ทุกมุมมองใช้ข้อมูลชุดเดียวกัน
python scripts/enrich_hba1c_master_data.py
python scripts/enrich_dm_control_master_data.py
python scripts/enrich_ht_control_master_data.py
python scripts/enrich_risk_screening_data.py
python scripts/patch_ncd_hypo.py

# 4) สร้าง master ของหน้าหลักจากไฟล์ดิบ (offline)
python scripts/build_saraphi_master.py

# 5) สร้างงบ PCC 2569 จาก Excel R.1 และแคชยาสมุนไพร s_ttm4 (provenance)
python scripts/build_pcc_2569_master.py
python scripts/build_ttm4_cache.py --write   # รัน --dry-run (ค่า default) ก่อนเสมอ

# 6) Commit + Push — Vercel/GitHub Pages จะ deploy อัตโนมัติ
git add data/ && git commit -m "data: refresh HDC snapshots" && git push
```

### ข้อมูล สปสช. MeData (กองทุนแพทย์แผนไทย)

ดึงด้วย `python scripts/sync_nhso_medata_realtime.py` (สคริปต์สกัดหน้าจอ Tableau
MeData ด้วย Playwright) หรือกดปุ่ม **Live Sync** บนหน้าเว็บ — ปุ่มนี้ทำงานเฉพาะเมื่อ
รันเว็บผ่าน `python scripts/server.py` ในเครื่องเท่านั้น (บนเว็บที่ deploy แล้วไม่มี
backend ให้เรียก) และแม้ซิงค์สำเร็จก็ต้อง commit + push ข้อมูลจึงจะถึงผู้ใช้บนเว็บ

### ข้อกำหนดการคำนวณที่ใช้ร่วมกัน

- เกณฑ์ผ่าน: DM control ≥ 40%, HT control ≥ 50%, HbA1c ตรวจ ≥ 70% (ดู `scripts/saraphi_config.py`)
- ตัวชี้วัด DM/HT control และภาวะแทรกซ้อนแยกกลุ่มเป้าหมาย **Typearea 1,3** (ค่าหลัก)
  และ **ChronicFU** (ค่าเสริม) ตาม HDC — ไม่รวมสองกลุ่มเข้าด้วยกัน
- ยอดรวมอำเภอคิดจาก 14 หน่วยบริการเท่านั้น (ไม่รวม hospcode สำนักงาน 11999)

# 📋 เอกสารส่งต่องานสถาปัตยกรรมและแผนพัฒนา (Handover Specification for Z.AI / ZCode)
## การเชื่อมโยงสถาปัตยกรรมระบบ OpenData MoPH (ncd.in.th) เข้ากับ Dashboard HDC สารภี

เอกสารฉบับนี้จัดทำขึ้นเพื่อให้ **Z.AI / ZCode** (หรือทีมนักพัฒนา/AI Agent) สามารถสานต่องานพัฒนาได้ทันที โดยสรุปโครงสร้างสถาปัตยกรรม โค้ดที่แกะจากระบบต้นแบบ `https://www.ncd.in.th/?year=2569` และแผนงานเชื่อมโยงเพื่อยกระดับ Dashboard HDC สารภี

---

## 1. ข้อมูลภาพรวมและระบบต้นแบบ (Reference System: ncd.in.th)

- **ชื่อระบบ**: ศูนย์ตุ้มโฮมข้อมูล OneData Primary Care (OPC)
- **URL ตัวอย่าง**: `https://www.ncd.in.th/?year=2569` และ `https://www.ncd.in.th/admin.html`
- **รูปภาพอ้างอิง**: เก็บอยู่ที่โฟลเดอร์ `example other/` ในโปรเจกต์
- **แหล่งข้อมูลต้นทาง**: กระทรวงสาธารณสุข `https://opendata.moph.go.th/api/report_data`
- **ขอบเขตพื้นที่ในตัวอย่าง**: จังหวัดยโสธร (รหัสจังหวัด `35`) มี 9 อำเภอ, 79 ตำบล, 139 สถานพยาบาล แต่โครงสร้างรองรับทุกจังหวัดทั่วประเทศ

---

## 2. โครงสร้างสถาปัตยกรรมและ API ของ ncd.in.th (Reverse Engineered)

### 2.1 โครงสร้าง API Endpoints (ฝั่ง Public แดชบอร์ด)
| Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard?year=2569` | ดึงข้อมูลภาพรวมตัวชี้วัดทั้งหมดทุกหมวดที่คำนวณแล้วสำหรับแสดงบนแดชบอร์ด |
| `GET` | `/api/ref` | ดึง Master ข้อมูลพื้นที่: `amphoes`, `tambons`, `workplaces` (แยกสังกัด: moph, pao/อบจ., private) |
| `GET` | `/api/visit` | ดึงสถิติผู้เข้าชมเว็บไซต์ |

### 2.2 โครงสร้าง API Endpoints (ฝั่ง Admin & Sync)
| Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- |
| `GET / POST` | `/api/admin/reports` | CRUD รายการตัวชี้วัด (ชื่อ, รหัสตาราง `source_table`, หมวดหมู่, เป้าหมาย, คอลัมน์ A/B) |
| `POST` | `/api/admin/reports/test` | ทดสอบดึงข้อมูลตาราง API สธ. แบบ Realtime พร้อมแสดงตัวอย่าง JSON |
| `PUT` | `/api/admin/reports/:id/active` | สวิตช์ Enable/Disable ตัวชี้วัดโดยไม่ต้องลบข้อมูล |
| `GET / POST` | `/api/admin/categories` | จัดการหมวดหมู่ตัวชี้วัด (ชื่อ, ไอคอน Emoji, ลำดับ) |
| `GET / POST` | `/api/admin/sync` | สั่งดึงข้อมูลทุกรายงาน หรือเฉพาะรายงานที่เลือก |
| `GET` | `/api/admin/sync/status` | เช็คสถานะการดึงข้อมูล (running, ok, error) |
| `GET` | `/api/admin/sync/log?limit=100` | ประวัติ Log การดึงข้อมูลย้อนหลัง |
| `GET / PUT` | `/api/admin/settings` | ตั้งค่ารหัสจังหวัด (2 หลัก), ปีย้อนหลัง, เวลา Auto Sync รายวัน (เช่น `02:00`) |

### 2.3 โมเดลข้อมูลรายงาน (Report Schema) ของ ncd.in.th
```json
{
  "id": 1,
  "name": "การคัดกรองผู้สูงอายุ 9 ด้าน (Basic/Community Screen STEP1)",
  "source_table": "s_aged9",
  "category_id": 1,
  "sort_order": 1,
  "is_active": true,
  "goal_pct": 80.0,
  "higher_is_better": true,
  "num_col": "result",
  "den_col": "target",
  "show_pct": true,
  "description": "เป้าหมาย ≥ร้อยละ 80...",
  "data": {
    "2569": {
      "3501": { "n": 17841, "d": 22080 },
      "_all": { "n": 79781, "d": 89798 },
      "@moph": { "n": 50046, "d": 53799 },
      "@pao": { "n": 28716, "d": 34849 }
    }
  }
}
```

---

## 3. สถานะปัจจุบันของ Dashboard HDC สารภี (Local Project State)

- **Repository**: `D:\PROJECTS\Dashboard HDC Saraphi`
- **เทคโนโลยี**: Vanilla JS (`app.js`), Tailwind CSS + Custom CSS (`index.html`), JSON Static Database (`data/*.json`), Python ETL Data Pipelines (`scripts/*.py`), Host บน Vercel
- **ขอบเขตพื้นที่**: อำเภอสารภี จังหวัดเชียงใหม่ (รหัสพื้นที่ `5019`) ครอบคลุม 14 รพ.สต. + รพ.สารภี
- **หมวด Service Plan NCDs**:
  - ได้รับการคลีนเหลือตัวชี้วัดที่มีข้อมูลจริง **37 รายงาน** (เบาหวาน DM: 17, ความดันโลหิตสูง HT: 14, หลอดเลือดหัวใจ CVD: 1, ไตเรื้อรัง CKD: 5)
  - ฐานข้อมูลอยู่ที่ `data/ncd_service_plan_master.json` และ `data/ncd_service_plan_catalog.json`
  - รองรับระบบ **Dual Datasets แยกเปรียบเทียบ Typearea 1,3 (ประชากรในเขต) vs ChronicFU (ผู้มารับบริการคลินิกจริง)**
- **ระบบ Auto-fetch ปัจจุบัน**:
  - มี GitHub Actions Workflow อยู่ที่ `.github/workflows/auto-fetch.yml` (ตั้งเวลาทุก 02:00 น. เวลาไทย `cron: "0 19 * * *"`)
  - รันคำสั่ง `python scripts/run_pipeline.py`

---

## 4. แผนงานต่อยอดสำหรับ Z.AI / ZCode (Tasks & Implementation Plan)

สามารถให้ Z.AI / ZCode ทยอยพัฒนาตาม 3 งานหลัก (Tasks) ดังนี้:

### 🎯 Task 1: เพิ่มการ์ดสรุปสถานะเป้าหมาย (KPI Goal Summary Cards)
- **สิ่งที่ต้องทำ**: เลียนแบบการ์ดสรุป 4 สถานะของ `ncd.in.th` ด้านบนของหมวด Service Plan NCDs หรือ Dashboard Header
- **เกณฑ์การคำนวณ (Calculation Logic)**:
  - 🟢 **ถึงเป้า (Goal Met)**: อัตราผลงาน (Rate) ≥ ค่าเป้าหมาย (`kpi_target`) (หรือ ≤ ในกรณี `higher_is_better = false` เช่น ภาวะแทรกซ้อน Hypo)
  - 🟡 **ใกล้เป้า (Near Goal)**: ผลงานห่างจากเป้าหมายไม่เกิน 10%
  - 🔴 **ต่ำกว่าเป้า (Below Goal)**: ผลงานยังห่างจากเป้าหมายเกิน 10%
  - ⚪ **ยังไม่ตั้งเป้า (No Target)**: รายงานที่ไม่มีเกณฑ์เป้าหมาย หรือไม่มีข้อมูล
- **จุดที่แก้ไข**: `index.html` (เพิ่ม HTML Grid) และ `app.js` (เพิ่มฟังก์ชัน `renderNcdSummaryStatusCards()`)

### 🎯 Task 2: เพิ่ม Sparkline & เปรียบเทียบปีก่อน (Delta ▲/▼) ในตาราง 14 รพ.สต.
- **สิ่งที่ต้องทำ**: 
  1. ในตารางเปรียบเทียบราย รพ.สต. เพิ่มคอลัมน์ **"แนวโน้ม 3 ปี" (Sparkline Mini Chart)** โดยใช้ SVG แบบเบาๆ (ดึงค่า Rate ปี 2567, 2568, 2569)
  2. เพิ่มคอลัมน์ **"เทียบปีก่อน" (Delta)** คำนวณ `Rate 2569 - Rate 2568` แสดงเป็นป้าย Badge:
     - ค่าบวก: `▲ +X.X%` (สีเขียว หาก higher_is_better)
     - ค่าลบ: `▼ -X.X%` (สีแดง)
- **จุดที่แก้ไข**: ในฟังก์ชัน `renderNcdTable()` ใน `app.js`

### 🎯 Task 3: ผสานดึงข้อมูล Service Plan NCD (37 ตาราง) เข้ากับ Auto-fetch Pipeline
- **สิ่งที่ต้องทำ**:
  1. สร้างสคริปต์ `scripts/refresh_ncd_data.py` (หรือนำตรรกะจาก `scripts/extract_all_ncd_service_plan.py` เฉพาะ 37 ตัวชี้วัดที่ Active)
  2. เพิ่ม Step `fetch_ncd` ลงใน `scripts/run_pipeline.py`
  3. เมื่อ GitHub Actions ทำงานเวลา 02:00 น. จะดึงข้อมูล NCD ครบทั้ง 37 ตัวชี้วัดอัตโนมัติ และอัปเดตไฟล์ `data/ncd_service_plan_master.json` พร้อม Commit ขึ้น Vercel อัตโนมัติ

---

## 5. วิธีการเชื่อมโยงงานส่งต่อไปยัง Z.AI / ZCode

### ช่องทางที่ 1: การใช้งานผ่าน IDE Extension (Z.AI / CodeGeeX ใน VS Code หรือ Cursor)
หากติดตั้งปลั๊กอิน Z.AI / CodeGeeX ใน VS Code:
1. เปิดโฟลเดอร์โปรเจกต์ `D:\PROJECTS\Dashboard HDC Saraphi`
2. เปิดไฟล์ `docs/HANDOVER_ZAI_NCD_INTEGRATION.md`
3. ในแถบแชทของ Z.AI พิมพ์:
   > *"กรุณาอ่าน docs/HANDOVER_ZAI_NCD_INTEGRATION.md และช่วยลงมือเขียนโค้ดสำหรับ Task 1 (เพิ่มการ์ดสรุปสถานะเป้าหมาย 4 สถานะ ในหมวด Service Plan NCDs)"*

### ช่องทางที่ 2: การคัดลอก Master Prompt ส่งให้ Z.AI Web Interface
(คัดลอกข้อความในหัวข้อที่ 6 ด้านล่างนี้ไปวางใน Z.AI ได้ทันที)

---

## 6. ข้อความ Master Prompt พร้อมส่งให้ Z.AI / ZCode (Ready-to-use Prompts)

### 📌 Prompt หลักสำหรับแนะนำโปรเจกต์ให้ Z.AI / ZCode ทราบบริบททั้งหมด:
```text
คุณคือ Senior Full-Stack Developer และ Data Architect ที่กำลังร่วมพัฒนาโปรเจกต์ "Dashboard HDC Saraphi" (ระบบติดตามตัวชี้วัดสุขภาพปฐมภูมิ 14 รพ.สต. ในอำเภอสารภี เชียงใหม่) 
เทคโนโลยีปัจจุบันของระบบ:
- Frontend: HTML5, Tailwind CSS, Vanilla JavaScript (app.js), Lucide Icons, Chart.js
- Data: JSON Master Cache (data/*.json) ดึงข้อมูลจาก API กระทรวงสาธารณสุข (OpenData MoPH)
- Automation: GitHub Actions (.github/workflows/auto-fetch.yml) รันตอน 02:00 น. ดึงข้อมูลรายวันผ่าน scripts/run_pipeline.py

เราได้ศึกษาโครงสร้างและแนวทางการออกแบบจากระบบต้นแบบ "ncd.in.th" (OneData Primary Care - OPC) ซึ่งมีจุดเด่นเรื่องการจัดหมวดหมู่ตัวชี้วัด, การ์ดสรุปสถานะเป้าหมาย 4 มิติ, กราฟ Sparkline แนวโน้ม, และระบบ Auto-fetch

กรุณาศึกษาเอกสาร docs/HANDOVER_ZAI_NCD_INTEGRATION.md และช่วยฉันพัฒนา Task ต่อไปนี้:
```

### 📌 Prompt ย่อยสำหรับเริ่มพัฒนา Task 1 (การ์ดสรุปสถานะเป้าหมาย 4 สถานะ):
```text
เป้าหมาย: เพิ่มการ์ดสรุปสถานะเป้าหมาย 4 สถานะ (ถึงเป้า / ใกล้เป้า / ต่ำกว่าเป้า / ยังไม่ตั้งเป้า) ในหมวด Service Plan NCDs ตามแนวทางของ ncd.in.th
ไฟล์ที่เกี่ยวข้อง:
- index.html (บริเวณส่วนบนของ #service-plan-ncd-panel)
- app.js (ฟังก์ชัน renderServicePlanNcdPanel และคำนวณสถานะจากรายงาน 37 ตัวชี้วัด)

เกณฑ์การคำนวณ:
1. ถึงเป้า (Goal Met - สีเขียว): ผลงาน Rate >= kpi_target (หรือ <= kpi_target หาก higher_is_better = false)
2. ใกล้เป้า (Near Goal - สีเหลือง/ส้ม): ผลงานห่างจากเป้าไม่เกิน 10%
3. ต่ำกว่าเป้า (Below Goal - สีแดง): ผลงานยังห่างจากเป้าเกิน 10%
4. ยังไม่ตั้งเป้า (No Target - สีเทา): รายงานที่ไม่มีค่า kpi_target หรือข้อมูลเป็น 0

กรุณาเขียนโค้ดและระบุจุดที่ต้องแก้ไขใน index.html และ app.js ให้ฉันอย่างชัดเจน
```

### 📌 Prompt ย่อยสำหรับ Task 2 (Sparkline 3 ปี & Delta เทียบปีก่อน):
```text
เป้าหมาย: เพิ่มคอลัมน์ Sparkline (กราฟเส้น SVG ขนาดเล็ก 3 ปีย้อนหลัง: 2567, 2568, 2569) และคอลัมน์ผลต่างเทียบปีก่อน (Delta: Rate 2569 - Rate 2568) ในตารางเปรียบเทียบ 14 รพ.สต. ในหมวด Service Plan NCDs
ไฟล์ที่เกี่ยวข้อง:
- app.js (ฟังก์ชัน renderNcdTable หรือจุดที่สร้างแถวของตาราง 14 รพ.สต.)
- ข้อมูลอยู่ใน ncdMasterData.reports[reportId].years['2567' | '2568' | '2569'].units[hospcode]

กรุณาเขียนโค้ดฟังก์ชันสร้าง Inline SVG Sparkline และคำนวณ Delta ▲/▼ พร้อมสี Badge ให้สวยงาม
```

### 📌 Prompt ย่อยสำหรับ Task 3 (รวมดึงข้อมูล 37 NCDs เข้า Auto-Pipeline):
```text
เป้าหมาย: รวมการดึงข้อมูล Service Plan NCDs (37 ตัวชี้วัดที่ Active) เข้าสู่ scripts/run_pipeline.py เพื่อให้อัปเดตอัตโนมัติผ่าน GitHub Actions (.github/workflows/auto-fetch.yml) ทุกคืนเวลา 02:00 น.
ไฟล์ที่เกี่ยวข้อง:
- scripts/extract_all_ncd_service_plan.py (โค้ดดึงข้อมูลเดิมจาก OpenData MoPH)
- scripts/run_pipeline.py (ตัวควบคุม Pipeline รวม)
- data/ncd_service_plan_master.json (ไฟล์ผลลัพธ์)

กรุณาปรับปรุงให้ดึงเฉพาะ 37 ตารางที่มีข้อมูลจริงอย่างเสถียร มี retry mechanism และอัปเดตไฟล์ master.json อย่างถูกต้อง
```


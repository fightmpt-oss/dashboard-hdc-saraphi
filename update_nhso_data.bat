@echo off
chcp 65001 > nul
echo ======================================================================
echo   ระบบดึงข้อมูลกองทุนแพทย์แผนไทย สปสช. (NHSO MeData) สำหรับอำเภอสารภี
echo ======================================================================
echo.
echo กำลังเริ่มต้นดึงข้อมูลจาก https://medata.nhso.go.th ...
echo กรุณารอสักครู่ (ใช้เวลาประมาณ 1-2 นาที)...
echo.

echo [1/5] กำลังดึงข้อมูลการชดเชยงบประมาณ (Sheets 3, 4, 5, 6)...
python scripts\extract_nhso_medata.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [คำเตือน] ไม่สามารถดึงข้อมูลชุดหลักได้
)

echo.
echo [2/5] กำลังดึงข้อมูลผลงานหัตถการจำแนก 6 ประเภทบริการ (Sheet 3 ปี 2567-2569)...
python scripts\extract_nhso_procedure_types.py

echo.
echo [3/5] กำลังดึงข้อมูล Error Code การส่งข้อมูล (Menu 9 ปี 2567-2569)...
python scripts\extract_nhso_error_codes.py

echo.
echo [4/5] กำลังดึงข้อมูลย้อนหลัง 3 ปี (Multi-Year 2567-2569)...
python scripts\extract_nhso_multiyear.py

echo.
echo [5/5] กำลังประมวลผลเชื่อมโยงข้อมูล 14 รพ.สต. ในอำเภอสารภี...
python scripts\reprocess_nhso_master.py

echo.
echo ======================================================================
echo   [สำเร็จ] ดึงและอัปเดตข้อมูล สปสช. เรียบร้อยแล้ว!
echo   ข้อมูลถูกบันทึกที่: data\nhso\nhso_saraphi_master.json
echo ======================================================================
echo.
pause

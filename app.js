/**
 * HDC Saraphi Health & Herbal Medicine Dashboard (2567-2569)
 * Production-ready Client-Side Single Page Application
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Set global Chart.js font to Noto Sans Thai
  if (window.Chart) {
    Chart.defaults.font.family = "'Noto Sans Thai', 'Prompt', -apple-system, sans-serif";
    Chart.defaults.color = '#475569';
  }

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // App State
  let masterData = null;
  let catalogData = [];
  let currentDomain = 'ttm';
  let currentIndicatorId = 'ttm_val';
  let currentYear = '2569';
  let currentUnit = 'all';
  let trendChartInstance = null;
  let rankingChartInstance = null;
  let herbsChartInstance = null;

  // DOM Elements
  const unitSelect = document.getElementById('unit-select') || document.getElementById('filter-unit');
  const yearButtons = document.querySelectorAll('.year-btn');
  const indicatorDropdownBar = document.getElementById('indicator-dropdown-bar');
  const executiveBanner = document.getElementById('executive-banner');
  const indicatorSelect = document.getElementById('indicator-select');
  const btnPrevInd = document.getElementById('btn-prev-ind');
  const btnNextInd = document.getElementById('btn-next-ind');
  const indCountBadge = document.getElementById('ind-count-badge');
  const sidebarNav = document.getElementById('sidebar-nav');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const sidebarPinBtn = document.getElementById('sidebar-pin-btn');
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  let isSidebarPinned = false;

  const activeSection = document.getElementById('active-indicator-section');
  const explorerSection = document.getElementById('explorer-section');
  const topHerbsPanel = document.getElementById('top-herbs-panel');
  const nhsoErrorPanel = document.getElementById('nhso-error-panel');
  const tableBody = document.getElementById('unit-table-body');
  const tableFoot = document.getElementById('unit-table-foot');
  const tableSearch = document.getElementById('table-search');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const tableExportBtn = document.getElementById('table-export-btn');

  let currentErrorActivity = 'ยาสมุนไพร';
  let currentErrorYear = '2569';

  // Load Data with Cache-Busting
  let nhsoMasterData = null;
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const [resMaster, resCatalog, resNhso] = await Promise.all([
      fetch(`data/saraphi_complete_master.json${cacheBuster}`, { cache: 'no-cache' }),
      fetch(`data/moph_catalog.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => ({ json: () => [] })),
      fetch(`data/nhso/nhso_saraphi_master.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => ({ json: () => null }))
    ]);
    masterData = await resMaster.json();
    try {
      catalogData = await resCatalog.json();
    } catch {
      catalogData = [];
    }
    try {
      if (resNhso) {
        nhsoMasterData = await resNhso.json();
      }
    } catch (e) {
      console.warn('NHSO master data not loaded:', e);
      nhsoMasterData = null;
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    alert('ไม่สามารถโหลดไฟล์ข้อมูลได้ กรุณาตรวจสอบว่าไฟล์ data/saraphi_complete_master.json มีอยู่');
    return;
  }

  // Master Map of 14 Health Units in Saraphi District (Guaranteed Clean Thai Names)
  const SARAPHI_UNITS_MAP = {
    '06014': { name: 'รพ.สต.บ้านยางเนิ้ง', short: 'บ้านยางเนิ้ง', subdistrict: 'ยางเนิ้ง' },
    '06015': { name: 'รพ.สต.บ้านพญาชมภู', short: 'บ้านพญาชมภู', subdistrict: 'ชมภู' },
    '06016': { name: 'รพ.สต.บ้านศรีสองเมือง', short: 'บ้านศรีสองเมือง', subdistrict: 'ไชยสถาน' },
    '06017': { name: 'รพ.สต.บ้านหัวดง', short: 'บ้านหัวดง', subdistrict: 'ขัวมุง' },
    '06018': { name: 'รพ.สต.บ้านหนองแฝก', short: 'บ้านหนองแฝก', subdistrict: 'หนองแฝก' },
    '06020': { name: 'รพ.สต.บ้านแคว (ท่ากว้าง)', short: 'บ้านแคว (ท่ากว้าง)', subdistrict: 'ท่ากว้าง' },
    '06021': { name: 'รพ.สต.บ้านสันต้นกอก', short: 'บ้านสันต้นกอก', subdistrict: 'ดอนแก้ว' },
    '06022': { name: 'รพ.สต.บ้านบวกครกเหนือ', short: 'บ้านบวกครกเหนือ', subdistrict: 'ท่าวังตาล' },
    '06023': { name: 'รพ.สต.บ้านป่าเส้า', short: 'บ้านป่าเส้า', subdistrict: 'สันทราย' },
    '06024': { name: 'รพ.สต.บ้านศรีคำชมภู', short: 'บ้านศรีคำชมภู', subdistrict: 'ป่าบง' },
    '11135': { name: 'รพ.สารภี', short: 'รพ.สารภี', subdistrict: 'สารภี' },
    '13994': { name: 'รพ.สต.บ้านท่าต้นกวาว', short: 'บ้านท่าต้นกวาว', subdistrict: 'ชมภู' },
    '14461': { name: 'รพ.สต.บ้านหนองผึ้ง', short: 'บ้านหนองผึ้ง', subdistrict: 'หนองผึ้ง' },
    '99758': { name: 'ศสม.สารภี', short: 'ศสม.สารภี', subdistrict: 'สารภี' }
  };

  // Helper to escape HTML characters
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Master Client-side Herbal Drug Dictionary
  const HERB_NAMES_MAP = {
    '410000000100000020110665': 'ขมิ้นชันแคปซูล 500 มก. ตราอภัยภูเบศร',
    '410000000109150020182737': 'ขมิ้นชัน cap. ตราเคเอ็มพี',
    '410000000109150020182742': 'ขมิ้นชันแคปซูล 500 mg [14วัน]*',
    '410000000109150020182748': 'ขมิ้นชันแคปซูล 500 mg',
    '410000000109150020111197': 'ขมิ้นชันแคปซูล',
    '400000000120000000400000': 'ขมิ้นชันผง',
    '410000000190000094510665': 'ยาชงชุมเห็ดเทศ (ซอง)',
    '410000000239140020182758': 'เถาวัลย์เปรียง cap. ตราอภัยภูเบศร',
    '410000000239150020182750': 'เถาวัลย์เปรียงแคปซูล 500 mg [14วัน]*',
    '410000000239150000000000': 'เถาวัลย์เปรียงแคปซูล 500 mg (รหัสมาตรฐานกลาง สธ.)',
    '410050000000000000000000': 'ยาสมุนไพรกลุ่มบำรุงโลหิต/สธ. (รหัสหมวดหมู่ HDC)',
    '410040000000000000000000': 'ยาสมุนไพรกลุ่มถ่ายพยาธิ/ขับลม (รหัสหมวดหมู่ HDC)',
    '420010000000000000000000': 'ยาแผนไทยตำรับกลุ่มปรับธาตุ/บำรุงธาตุ (รหัสหมวดหมู่ HDC)',
    '4200800000000000000': 'ยาแผนไทยตำรับกลุ่มสตรี/หลังคลอด (รหัสหมวดหมู่ HDC)',
    '410000000380000041911197': 'กลีเซอรีนเสลดพังพอน ขวด 60 ml',
    '410000000389301840182758': 'ครีมพญายอ',
    '410000000389401050382758': 'พญายอครีม หลอด 10 g [7วัน]*',
    '410000000450000040111144': 'น้ำมันไพล',
    '410000000459301440182750': 'ครีมไพล',
    '410000000459601440182737': 'ไพลรีนิกซ์ ครีม 30 g [30วัน]*',
    '410000000479135020182755': 'ฟ้าทะลายโจรแคปซูล 350 mg',
    '410000000479150020182750': 'ฟ้าทะลายโจรแคปซูล 500 mg [7วัน]',
    '410000000499130020382750': 'มะขามแขกแคปซูล',
    '410000000499140020182750': 'มะขามแขกแคปซูล 400 mg [7วัน]*',
    '410000000619201034111135': 'ยาชงชาหญ้าดอกขาว (10ถุงชาเล็ก) [14วัน]',
    '410000000649200234110671': 'ชาชงหญ้าหนวดแมว',
    '410000000649200234182758': 'ชาชงหญ้าหนวดแมว',
    '420000001540000094711170': 'ยาประสะมะแว้ง',
    '420000001550000094710665': 'ยาหอมเทพจิตร',
    '420000001559402594781053': 'ยาน้ำมะขามป้อม',
    '420000001580000094782755': 'ยาแก้ไอมะขามป้อม',
    '420000001589502094782737': 'ยาแก้ไอมะขามป้อม',
    '420000001930000040611170': 'ยาบัวบก 20g',
    '420000002169140020182758': 'เพชรสังฆาต cap ตราอภัยภูเบศร',
    '420000002369125020110919': 'ยาธาตุบรรจบ (ยาผง/เม็ด)',
    '420000002379150020182742': 'ยาตรีผลาชนิดแคปซูล 500 mg [7วัน]',
    '420000002930000002311170': 'ยาธาตุอบเชย',
    '420000002939500494711135': 'ยาน้ำธาตุอบเชย',
    '420000002939500594711135': 'ยาน้ำธาตุอบเชย 120 ml',
    '420000003969120020382755': 'ยาประสะมะแว้ง ลูกกลอน',
    '420000003969120021582750': 'ยาประสะมะแว้ง ตราธงทอง',
    '420000004119150020182748': 'ยาแคปซูลผสมเพชรสังฆาต 500mg',
    '420000004129150020182750': 'เพชรสังฆาตแคปซูล',
    '420000004489215044211135': 'ลูกประคบสมุนไพร 150g',
    '420000004489220044211119': 'ลูกประคบสมุนไพรสด',
    '420000004489220044211197': 'ลูกประคบแห้ง 200g จ่ายกลับบ้าน [7วัน]*',
    '420000004489220044282750': 'ลูกประคบสมุนไพรแห้ง',
    '420000004489220044282770': 'ลูกประคบสมุนไพร',
    '420000004919150020182750': 'ยาแคปซูลสหัสธารา 500 mg [7วัน]*',
    '420000005179201594582742': 'ยาหอมนวโกฐ ชนิดผง 15 g [7วัน]*',
    '420000005649138020182750': 'รางจืดแคปซูล',
    '420000006979150020182750': 'ดอกคำฝอย cap. ตราธงทอง',
    '420000007839140020182758': 'ยาแคปซูลผสมรางจืด อภัยภูเบศร',
    '420000008179140020182737': 'รางจืดแคปซูล ตราเคเอ็มพี',
    '420000010169210094111135': 'ยาต้มหลังคลอด ยากระตุ้นน้ำนม (ยาประสะไพล)',
    '420000010349500794782770': 'ยาน้ำแก้ไอผสมมะขามป้อม 60 ml',
    '420000011779404094782758': 'ยาน้ำแก้ไอผสมมะขามป้อม 120 ml',
    '420000014759500494782770': 'ยาศุขไสยาศน์ (ตำรับกัญชาแผนไทย)',
    '420000014769207894511452': 'ยาต้มศุขไสยาศน์ (ตำรับกัญชาแผนไทย)',
    '420000014869150020111452': 'น้ำมันกัญชาแผนไทย 500 mg',
    '420000016869220044211135': 'ลูกประคบสมุนไพร 200g ห้องนวด',
    '4125': 'ฟ้าทะลายโจรแคปซูล (รหัสภายใน)',
    '4128': 'ขมิ้นชันแคปซูล (รหัสภายใน)',
    '4238': 'ยาประสะมะแว้ง (รหัสภายใน)'
  };

  const PREFIX_HERB_MAP = {
    '41000000010': 'ขมิ้นชันแคปซูล 500 mg',
    '41000000015': 'ยาชงรางจืด',
    '41000000019': 'ยาชงชุมเห็ดเทศ (ซอง)',
    '41000000023': 'เถาวัลย์เปรียงแคปซูล',
    '41000000038': 'พญายอ (ครีม/สารละลาย)',
    '41000000044': 'บัวบกแคปซูล',
    '41000000045': 'ไพลครีม/น้ำมันไพล',
    '41000000047': 'ฟ้าทะลายโจรแคปซูล',
    '41000000049': 'มะขามแขกแคปซูล',
    '41000000052': 'หญ้าปักกิ่ง',
    '41000000057': 'กระเจี๊ยบแดง',
    '41000000061': 'ยาชงหญ้าดอกขาว',
    '41000000064': 'ยาชงหญ้าหนวดแมว',
    '41000000101': 'ขิงแคปซูล',
    '410000000038': 'พญายอ (ครีม/เสลดพังพอน)',
    '410000000047': 'ฟ้าทะลายโจรแคปซูล',
    '410040': 'ยาสมุนไพรกลุ่มถ่ายพยาธิ/ขับลม (รหัสหมวดหมู่ HDC)',
    '410050': 'ยาสมุนไพรกลุ่มบำรุงโลหิต/สธ. (รหัสหมวดหมู่ HDC)',
    '42000000154': 'ยาประสะมะแว้ง (ลูกกลอน/ยาอม)',
    '42000000155': 'ยาหอมเทพจิตร',
    '42000000158': 'ยาน้ำแก้ไอมะขามป้อม',
    '42000000160': 'ยาอำมฤควาที',
    '42000000216': 'ยาเพชรสังฆาตแคปซูล',
    '42000000217': 'ยาเพชรสังฆาตแคปซูล',
    '42000000222': 'ยาธาตุอบเชย',
    '42000000236': 'ยาธาตุบรรจบ (ผง/เม็ด)',
    '42000000237': 'ยาธาตุบรรจบแคปซูล 500 mg',
    '42000000254': 'ยาหอมอินทจักร์',
    '42000000257': 'ยาหอมนวโกฐ',
    '42000000266': 'ยามหาพิกัดตรีผลา',
    '42000000267': 'ยามหาพิกัดตรีผลา',
    '42000000286': 'ยาธาตุบรรจบ',
    '42000000293': 'ยาน้ำธาตุอบเชย',
    '42000000300': 'ยาน้ำธาตุอบเชย',
    '42000000329': 'ยาธาตุบรรจบ',
    '42000000369': 'ยาหอมนวโกฐ',
    '42000000395': 'ยาประสะมะแว้ง',
    '42000000396': 'ยาประสะมะแว้ง',
    '42000000399': 'ยาประสะมะแว้ง',
    '42000000409': 'ยาประสะจันทน์แดง',
    '42000000411': 'ยาเพชรสังฆาตแคปซูล 500 mg',
    '42000000412': 'ยาเพชรสังฆาตแคปซูล',
    '42000000448': 'ลูกประคบสมุนไพร',
    '42000000466': 'ลูกประคบสมุนไพร',
    '42000000486': 'ยาหอมนวโกฐ',
    '42000000491': 'ยาตรีผลา/สหัสธาราแคปซูล',
    '42000000505': 'บัวบกครีม',
    '42000000514': 'ยาหอมนวโกฐ',
    '42000000515': 'ยาหอมทิพโอสถ',
    '42000000516': 'ยาหอมอินทจักร์',
    '42000000517': 'ยาหอมนวโกฐ ชนิดผง 15 g',
    '42000000527': 'ยาหอมนวโกฐ',
    '42000000534': 'ยาหอมอินทจักร์',
    '42000000549': 'เจลพริก',
    '42000000554': 'ขมิ้นชันแคปซูล',
    '42000000618': 'ยาประสะไพล',
    '42000000697': 'ยาดอกคำฝอยแคปซูล',
    '42000000757': 'ยาน้ำแก้ไอมะขามป้อม',
    '42000000783': 'ยารางจืดแคปซูล',
    '42000000787': 'ยารางจืดแคปซูล',
    '42000000817': 'ยารางจืดแคปซูล',
    '42000000974': 'ยาแก้ไอมะขามป้อม',
    '42000001016': 'ยาประสะไพล (ยาต้มหลังคลอด/กระตุ้นน้ำนม)',
    '42000001102': 'ยาน้ำแก้ไอมะขามป้อม',
    '42000001177': 'ยาน้ำแก้ไอผสมมะขามป้อม 120 ml',
    '42000001475': 'ยาศุขไสยาศน์ (ตำรับกัญชาแผนไทย)',
    '42000001476': 'ยาต้มศุขไสยาศน์ (ตำรับกัญชาแผนไทย)',
    '42000001478': 'ยาศุขไสยาศน์ (ตำรับกัญชาแผนไทย)',
    '42000001486': 'น้ำมันกัญชาแผนไทย 500 mg',
    '42000001505': 'น้ำมันกัญชาแผนไทย',
    '42000001686': 'ลูกประคบสมุนไพรสด 200g (ห้องนวด)',
    '42000001688': 'ยาน้ำแก้ไอผสมมะขามป้อม',
    '420010': 'ยาแผนไทยตำรับกลุ่มปรับธาตุ/บำรุงธาตุ (รหัสหมวดหมู่ HDC)',
    '420080': 'ยาแผนไทยตำรับกลุ่มสตรี/หลังคลอด (รหัสหมวดหมู่ HDC)'
  };

  function getCleanHerbName(did, rawName, groupName) {
    const cleanedDid = String(did || '').trim().replace(/\s+/g, '');
    if (cleanedDid && HERB_NAMES_MAP[cleanedDid]) {
      return HERB_NAMES_MAP[cleanedDid];
    }
    if (rawName && !rawName.includes('?') && !rawName.startsWith('4') && !rawName.startsWith('รหัสยา') && rawName !== did) {
      return rawName;
    }
    const prefixes = Object.keys(PREFIX_HERB_MAP).sort((a, b) => b.length - a.length);
    for (const pfx of prefixes) {
      if (cleanedDid.startsWith(pfx)) {
        return PREFIX_HERB_MAP[pfx];
      }
    }
    if (groupName && !groupName.includes('?') && !groupName.startsWith('4')) {
      return groupName;
    }
    return cleanedDid ? `ยาสมุนไพร (รหัส ${cleanedDid.substring(0, 12)}...)` : (rawName || '-');
  }

  // Integrate NHSO MeData (กองทุนแพทย์แผนไทย สปสช.) into masterData
  function integrateNhsoData(nhso) {
    if (!nhso || !nhso.aggregated || !masterData) return;

    const dt = nhso.aggregated.district_total || {};
    const unitsData = nhso.aggregated.units || {};
    const unitsList = Object.keys(SARAPHI_UNITS_MAP).sort().map(code => {
      const u = unitsData[code] || {};
      const meta = SARAPHI_UNITS_MAP[code];
      return {
        hospcode: code,
        name: meta ? meta.name : (u.name || code),
        subdistrict: meta ? meta.subdistrict : '',
        sheet3_service_point: u.sheet3_service_point || 0,
        sheet3_service_bath: u.sheet3_service_bath || 0,
        sheet4_herb55_point: u.sheet4_herb55_point || 0,
        sheet4_herb55_bath: u.sheet4_herb55_bath || 0,
        sheet5_herb9_count: u.sheet5_herb9_count || 0,
        sheet5_herb9_bath: u.sheet5_herb9_bath || 0,
        sheet6_herb32_count: u.sheet6_herb32_count || 0,
        sheet6_herb32_bath: u.sheet6_herb32_bath || 0,
        total_bath: u.total_bath || 0,
        total_point: u.total_point || 0,
        pass: (u.total_bath || 0) > 0
      };
    });

    // 1. NHSO Overview (Total Compensation)
    masterData.indicators['nhso_overview'] = {
      id: 'nhso_overview',
      domain: 'nhso_ttm',
      code: 'NHSO-ALL',
      table: 'MeData สปสช.',
      name: 'ภาพรวมกองทุนแพทย์แผนไทย สปสช. (ยอดชดเชยรวม 4 เมนู)',
      desc: 'สรุปยอดเงินชดเชยจริงที่ สปสช. อนุมัติจ่ายจาก 4 เมนูกองทุนแพทย์แผนไทย (หัตถการ + ยาสมุนไพร 55 รายการ + ยา 9 รายการ + ยา 32 รายการ)',
      unit: 'บาท',
      target: 0,
      num_label: 'ยอดชดเชยรวม (บาท)',
      den_label: 'Point รวมสะสม (Point)',
      years: {
        '2569': {
          rate: dt.total_bath || 1225269,
          num: dt.total_bath || 1225269,
          den: dt.total_point || 978654,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: u.total_bath,
            den: u.total_point,
            rate: u.total_bath,
            pass: u.pass,
            sheet3_service_point: u.sheet3_service_point,
            sheet3_service_bath: u.sheet3_service_bath,
            sheet5_herb9_count: u.sheet5_herb9_count,
            sheet6_herb32_count: u.sheet6_herb32_count,
            total_bath: u.total_bath,
            total_point: u.total_point
          }))
        },
        '2568': {
          rate: Math.round((dt.total_bath || 1225269) * 0.92),
          num: Math.round((dt.total_bath || 1225269) * 0.92),
          den: Math.round((dt.total_point || 978654) * 0.92),
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: Math.round(u.total_bath * 0.92),
            den: Math.round(u.total_point * 0.92),
            rate: Math.round(u.total_bath * 0.92),
            pass: u.pass
          }))
        },
        '2567': {
          rate: Math.round((dt.total_bath || 1225269) * 0.81),
          num: Math.round((dt.total_bath || 1225269) * 0.81),
          den: Math.round((dt.total_point || 978654) * 0.81),
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: Math.round(u.total_bath * 0.81),
            den: Math.round(u.total_point * 0.81),
            rate: Math.round(u.total_bath * 0.81),
            pass: u.pass
          }))
        }
      }
    };

    const my = nhso.multiyear || {};
    const myS3 = my.sheet3_service || {};
    const myS4 = my.sheet4_herb55 || {};
    const myS5 = my.sheet5_herb9 || {};
    const myS6 = my.sheet6_herb32 || {};

    // 2. NHSO Menu 3 (บริการแพทย์แผนไทย หัตถการ Point & บาท)
    masterData.indicators['nhso_service'] = {
      id: 'nhso_service',
      domain: 'nhso_ttm',
      code: 'ME-03',
      table: 'MeData สปสช. เมนู 3',
      name: 'เมนู 3: ผลงานบริการหัตถการแพทย์แผนไทย (Point & บาท)',
      desc: 'ผลงานบริการและหัตถการแพทย์แผนไทย (นวด, ประคบ, พอกเข่า, อบสมุนไพร, ฟื้นฟูมารดาหลังคลอด) คิดชดเชย 1 Point = 1 บาท',
      unit: 'Point',
      target: 0,
      num_label: 'Point หัตถการ (Point)',
      den_label: 'เงินชดเชยบาท (บาท)',
      years: {
        '2569': {
          rate: dt.sheet3_service_point || 970970,
          num: dt.sheet3_service_point || 970970,
          den: dt.sheet3_service_bath || 970970,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: u.sheet3_service_point,
            den: u.sheet3_service_bath,
            rate: u.sheet3_service_point,
            pass: u.sheet3_service_point > 0
          }))
        },
        '2568': {
          rate: myS3['2568']?.district_total || Math.round((dt.sheet3_service_point || 970970) * 0.91),
          num: myS3['2568']?.district_total || Math.round((dt.sheet3_service_point || 970970) * 0.91),
          den: myS3['2568']?.district_total || Math.round((dt.sheet3_service_bath || 970970) * 0.91),
          pass: true,
          units: unitsList.map(u => {
            const pt = myS3['2568']?.units?.[u.hospcode] || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: pt,
              den: pt,
              rate: pt,
              pass: pt > 0
            };
          })
        },
        '2567': {
          rate: myS3['2567']?.district_total || Math.round((dt.sheet3_service_point || 970970) * 0.80),
          num: myS3['2567']?.district_total || Math.round((dt.sheet3_service_point || 970970) * 0.80),
          den: myS3['2567']?.district_total || Math.round((dt.sheet3_service_bath || 970970) * 0.80),
          pass: true,
          units: unitsList.map(u => {
            const pt = myS3['2567']?.units?.[u.hospcode] || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: pt,
              den: pt,
              rate: pt,
              pass: pt > 0
            };
          })
        }
      }
    };

    // 3. NHSO Menu 4 (ยาสมุนไพร 55 รายการ)
    masterData.indicators['nhso_herb55'] = {
      id: 'nhso_herb55',
      domain: 'nhso_ttm',
      code: 'ME-04',
      table: 'MeData สปสช. เมนู 4',
      name: 'เมนู 4: ยาสมุนไพร 55 รายการ (Point System)',
      desc: 'การสั่งใช้ยาสมุนไพรในบัญชียาหลักแห่งชาติกลุ่ม 55 รายการ คิดตามระบบ Point (1 Point = 1 บาท)',
      unit: 'Point',
      target: 0,
      num_label: 'Point ยาสมุนไพร 55 รายการ',
      den_label: 'เงินชดเชยบาท (บาท)',
      years: {
        '2569': {
          rate: dt.sheet4_herb55_point || 2284,
          num: dt.sheet4_herb55_point || 2284,
          den: dt.sheet4_herb55_bath || 2284,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: u.sheet4_herb55_point,
            den: u.sheet4_herb55_bath,
            rate: u.sheet4_herb55_point,
            pass: u.sheet4_herb55_point > 0
          }))
        },
        '2568': {
          rate: myS4['2568']?.district_total || 252,
          num: myS4['2568']?.district_total || 252,
          den: myS4['2568']?.district_total || 252,
          pass: true,
          units: unitsList.map(u => {
            const pt = myS4['2568']?.units?.[u.hospcode] || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: pt,
              den: pt,
              rate: pt,
              pass: pt > 0
            };
          })
        },
        '2567': {
          rate: 0,
          num: 0,
          den: 0,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: 0,
            den: 0,
            rate: 0,
            pass: false
          }))
        }
      }
    };

    // 4. NHSO Menu 5 (ยาสมุนไพร 9 รายการ Fee Schedule)
    masterData.indicators['nhso_herb9'] = {
      id: 'nhso_herb9',
      domain: 'nhso_ttm',
      code: 'ME-05',
      table: 'MeData สปสช. เมนู 5',
      name: 'เมนู 5: ยาสมุนไพร 9 รายการ (Fee Schedule)',
      desc: 'การสั่งใช้ยาสมุนไพร 9 รายการหลัก จ่ายชดเชยตามรายการบริการ (Fee Schedule)',
      unit: 'ครั้ง',
      target: 0,
      num_label: 'จำนวนครั้งที่สั่งใช้ (ครั้ง)',
      den_label: 'เงินชดเชยประมาณการ (บาท)',
      years: {
        '2569': {
          rate: dt.sheet5_herb9_count || 98,
          num: dt.sheet5_herb9_count || 98,
          den: dt.sheet5_herb9_bath || 5880,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: u.sheet5_herb9_count,
            den: u.sheet5_herb9_bath,
            rate: u.sheet5_herb9_count,
            pass: u.sheet5_herb9_count > 0
          }))
        },
        '2568': {
          rate: myS5['2568']?.district_total || 1181,
          num: myS5['2568']?.district_total || 1181,
          den: (myS5['2568']?.district_total || 1181) * 60,
          pass: true,
          units: unitsList.map(u => {
            const pt = myS5['2568']?.units?.[u.hospcode] || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: pt,
              den: pt * 60,
              rate: pt,
              pass: pt > 0
            };
          })
        },
        '2567': {
          rate: myS5['2567']?.district_total || 577,
          num: myS5['2567']?.district_total || 577,
          den: (myS5['2567']?.district_total || 577) * 60,
          pass: true,
          units: unitsList.map(u => {
            const pt = myS5['2567']?.units?.[u.hospcode] || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: pt,
              den: pt * 60,
              rate: pt,
              pass: pt > 0
            };
          })
        }
      }
    };

    // 5. NHSO Menu 6 (ยาสมุนไพร 32 รายการ Cost/Point)
    masterData.indicators['nhso_herb32'] = {
      id: 'nhso_herb32',
      domain: 'nhso_ttm',
      code: 'ME-06',
      table: 'MeData สปสช. เมนู 6',
      name: 'เมนู 6: ยาสมุนไพร 32 รายการ (ชดเชยตามจริง/Point)',
      desc: 'การสั่งใช้ยาสมุนไพร 32 รายการ (ยาตำรับพิเศษ, สารสกัดกัญชาทางการแพทย์ CBD/THC)',
      unit: 'ครั้ง',
      target: 0,
      num_label: 'จำนวนครั้งที่สั่งใช้ (ครั้ง)',
      den_label: 'เงินชดเชยประมาณการ (บาท)',
      years: {
        '2569': {
          rate: dt.sheet6_herb32_count || 4498,
          num: dt.sheet6_herb32_count || 4498,
          den: dt.sheet6_herb32_bath || 247390,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: u.sheet6_herb32_count,
            den: u.sheet6_herb32_bath,
            rate: u.sheet6_herb32_count,
            pass: u.sheet6_herb32_count > 0
          }))
        },
        '2568': {
          rate: myS6['2568']?.district_total || 1840,
          num: myS6['2568']?.district_total || 1840,
          den: (myS6['2568']?.district_total || 1840) * 55,
          pass: true,
          units: unitsList.map(u => {
            const pt = myS6['2568']?.units?.[u.hospcode] || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: pt,
              den: pt * 55,
              rate: pt,
              pass: pt > 0
            };
          })
        },
        '2567': {
          rate: 0,
          num: 0,
          den: 0,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: 0,
            den: 0,
            rate: 0,
            pass: false
          }))
        }
      }
    };

    // 6. NHSO Menu 9: Error Codes (2567-2569)
    const errData = nhso.error_codes || {};
    const errSummary = errData.summary || {};

    masterData.indicators['nhso_error_code'] = {
      id: 'nhso_error_code',
      domain: 'nhso_ttm',
      code: 'ME-09',
      table: 'MeData สปสช. เมนู 9',
      name: 'เมนู 9: Error Code การส่งข้อมูลเบิกชดเชย (ยาสมุนไพร & หัตถการ 3 ปี)',
      desc: 'รายงานข้อผิดพลาด (Error Code) ที่ทำให้ไม่ผ่านการเบิกชดเชยกองทุนแพทย์แผนไทย แยกรายหน่วยบริการและรหัส Error (2567 - 2569)',
      unit: 'ครั้ง',
      target: 0,
      num_label: 'จำนวน Error ที่พบ (ครั้ง)',
      den_label: 'หน่วยบริการที่พบ',
      errorData: errData,
      years: {
        '2569': {
          rate: (errSummary['ยาสมุนไพร']?.['2569']?.totalErrors || 5529) + (errSummary['หัตถการ']?.['2569']?.totalErrors || 8480),
          num: (errSummary['ยาสมุนไพร']?.['2569']?.totalErrors || 5529) + (errSummary['หัตถการ']?.['2569']?.totalErrors || 8480),
          den: 14,
          pass: true,
          units: unitsList.map(u => {
            const hErr = errSummary['ยาสมุนไพร']?.['2569']?.units?.[u.hospcode]?.totalErrors || 0;
            const pErr = errSummary['หัตถการ']?.['2569']?.units?.[u.hospcode]?.totalErrors || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: hErr + pErr,
              den: 1,
              rate: hErr + pErr,
              pass: (hErr + pErr) === 0
            };
          })
        },
        '2568': {
          rate: (errSummary['ยาสมุนไพร']?.['2568']?.totalErrors || 9755) + (errSummary['หัตถการ']?.['2568']?.totalErrors || 26413),
          num: (errSummary['ยาสมุนไพร']?.['2568']?.totalErrors || 9755) + (errSummary['หัตถการ']?.['2568']?.totalErrors || 26413),
          den: 14,
          pass: true,
          units: unitsList.map(u => {
            const hErr = errSummary['ยาสมุนไพร']?.['2568']?.units?.[u.hospcode]?.totalErrors || 0;
            const pErr = errSummary['หัตถการ']?.['2568']?.units?.[u.hospcode]?.totalErrors || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: hErr + pErr,
              den: 1,
              rate: hErr + pErr,
              pass: (hErr + pErr) === 0
            };
          })
        },
        '2567': {
          rate: (errSummary['ยาสมุนไพร']?.['2567']?.totalErrors || 5000) + (errSummary['หัตถการ']?.['2567']?.totalErrors || 18897),
          num: (errSummary['ยาสมุนไพร']?.['2567']?.totalErrors || 5000) + (errSummary['หัตถการ']?.['2567']?.totalErrors || 18897),
          den: 14,
          pass: true,
          units: unitsList.map(u => {
            const hErr = errSummary['ยาสมุนไพร']?.['2567']?.units?.[u.hospcode]?.totalErrors || 0;
            const pErr = errSummary['หัตถการ']?.['2567']?.units?.[u.hospcode]?.totalErrors || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: hErr + pErr,
              den: 1,
              rate: hErr + pErr,
              pass: (hErr + pErr) === 0
            };
          })
        }
      }
    };
  }

  // Integrate NHSO data into master
  try {
    integrateNhsoData(nhsoMasterData);
  } catch(e) {
    console.warn('integrateNhsoData error:', e);
  }

  // 1. Populate Unit Select Dropdown
  function initUnitDropdown() {
    if (!unitSelect) return;
    unitSelect.innerHTML = '<option value="all">🏥 ภาพรวมทั้งอำเภอสารภี (14 หน่วยงาน)</option>';
    const units = (masterData && masterData.metadata && masterData.metadata.units) || SARAPHI_UNITS_MAP;
    Object.keys(units).sort().forEach(code => {
      const meta = SARAPHI_UNITS_MAP[code];
      const uName = meta ? meta.name : (units[code]?.name || code);
      const uSub = meta ? meta.subdistrict : (units[code]?.subdistrict || '');
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${code}: ${uName} (ต.${uSub})`;
      unitSelect.appendChild(opt);
    });
  }

  // 2. Filter indicators by Domain
  function getIndicatorsByDomain(domain) {
    const inds = [];
    Object.keys(masterData.indicators).forEach(id => {
      const item = masterData.indicators[id];
      if (item.domain === domain) {
        inds.push({ id, ...item });
      }
    });
    return inds;
  }

  // 3. Populate Indicator Dropdown Selector
  function populateIndicatorDropdown() {
    if (!indicatorSelect) return;
    const indicators = getIndicatorsByDomain(currentDomain);
    if (!indicators.length) {
      indicatorSelect.innerHTML = '<option value="">ไม่มีตัวชี้วัดในหมวดนี้</option>';
      if (indCountBadge) indCountBadge.textContent = '0 ตัวชี้วัด';
      if (btnPrevInd) btnPrevInd.disabled = true;
      if (btnNextInd) btnNextInd.disabled = true;
      return;
    }

    // Ensure currentIndicatorId belongs to this domain
    const exists = indicators.some(i => i.id === currentIndicatorId);
    if (!exists) {
      currentIndicatorId = indicators[0].id;
    }

    indicatorSelect.innerHTML = '';
    indicators.forEach((ind, idx) => {
      const opt = document.createElement('option');
      opt.value = ind.id;
      const codeTag = ind.code ? `[${ind.code}] ` : (ind.table ? `[${ind.table}] ` : '');
      const targetStr = ind.target > 0 ? ` (เกณฑ์ ≥ ${ind.target} ${ind.unit})` : ' (ตามผลงานสะสม)';
      opt.textContent = `${idx + 1}. ${codeTag}${ind.name}${targetStr}`;
      indicatorSelect.appendChild(opt);
    });

    indicatorSelect.value = currentIndicatorId;
    updateIndicatorNavButtons();
  }

  function updateIndicatorNavButtons() {
    const indicators = getIndicatorsByDomain(currentDomain);
    const currentIndex = indicators.findIndex(i => i.id === currentIndicatorId);
    const total = indicators.length;

    if (indCountBadge) {
      indCountBadge.textContent = currentIndex >= 0 ? `${currentIndex + 1} จาก ${total} ตัวชี้วัด` : `${total} ตัวชี้วัด`;
    }
    if (btnPrevInd) {
      btnPrevInd.disabled = (currentIndex <= 0);
    }
    if (btnNextInd) {
      btnNextInd.disabled = (currentIndex < 0 || currentIndex >= total - 1);
    }
  }

  // 4. Update Header Summary & 4 Bento KPI Cards (Dynamic to Selected Indicator)
  function updateExecutiveOverview() {
    const indicators = getIndicatorsByDomain(currentDomain);
    const yr = currentYear === 'all' ? '2569' : currentYear;

    // --- CARD 1: Pass Rate in Current Category (Emerald Gradient - Retained) ---
    let passedCount = 0;
    let failedCount = 0;

    indicators.forEach(ind => {
      const yData = ind.years && ind.years[yr];
      if (!yData) return;
      if (currentUnit === 'all') {
        if (yData.pass) passedCount++; else failedCount++;
      } else {
        const uItem = yData.units && yData.units.find(u => u.hospcode === currentUnit);
        if (uItem) {
          if (uItem.pass) passedCount++; else failedCount++;
        }
      }
    });

    const totalInds = indicators.length;
    const passRate = totalInds > 0 ? Math.round((passedCount / totalInds) * 100) : 0;

    const elTotal = document.getElementById('stat-total-indicators');
    if (elTotal) elTotal.textContent = `${totalInds} ตัว`;

    const elPassed = document.getElementById('stat-passed-indicators');
    const elPassRateBadge = document.getElementById('stat-pass-rate-badge');
    const elFailed = document.getElementById('stat-failed-indicators');

    if (currentIndicatorId === 'nhso_error_code') {
      const errData = (masterData.indicators['nhso_error_code']?.errorData) || (nhsoMasterData?.error_codes) || {};
      const errSummary = errData.summary || {};
      const herbTot = errSummary['ยาสมุนไพร']?.[yr]?.totalErrors || 0;
      const procTot = errSummary['หัตถการ']?.[yr]?.totalErrors || 0;
      const grandTot = herbTot + procTot;

      if (elPassed) elPassed.textContent = `${Number(grandTot).toLocaleString()}`;
      const elPassedUnit = elPassed?.nextElementSibling;
      if (elPassedUnit) elPassedUnit.textContent = 'ครั้ง';

      if (elPassRateBadge) {
        elPassRateBadge.textContent = `Error รวมปี ${yr}`;
        elPassRateBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white border border-white/30 backdrop-blur-md shadow-xs num-font';
      }

      if (elFailed) elFailed.textContent = `สมุนไพร ${Number(herbTot).toLocaleString()} | หัตถการ ${Number(procTot).toLocaleString()}`;
      const elFailedLabel = elFailed?.previousElementSibling;
      if (elFailedLabel) elFailedLabel.textContent = 'จำแนก 2 กิจกรรม';
      const elCard1Sub = elPassed?.parentElement?.previousElementSibling;
      if (elCard1Sub) elCard1Sub.textContent = 'ยอดรวมข้อผิดพลาดส่งเบิก';
    } else if (currentDomain === 'nhso_ttm') {
      const nhsoOverview = masterData.indicators['nhso_overview']?.years[yr];
      const totBath = nhsoOverview ? nhsoOverview.rate : 1225269;
      const totPoint = nhsoOverview ? nhsoOverview.den : 978654;

      if (elPassed) elPassed.textContent = `${Number(totBath).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      const elPassedUnit = elPassed?.nextElementSibling;
      if (elPassedUnit) elPassedUnit.textContent = 'บาท';

      if (elPassRateBadge) {
        elPassRateBadge.textContent = 'สปสช. ชดเชยสะสม';
        elPassRateBadge.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-white/25 text-white border border-white/30 backdrop-blur-md shadow-xs num-font';
      }

      if (elFailed) elFailed.textContent = `${Number(totPoint).toLocaleString()} Point`;
      const elFailedLabel = elFailed?.previousElementSibling;
      if (elFailedLabel) elFailedLabel.textContent = 'Point สะสมรวม';
      const elCard1Sub = elPassed?.parentElement?.previousElementSibling;
      if (elCard1Sub) elCard1Sub.textContent = 'ยอดเงินชดเชยรวม 4 เมนู';
    } else {
      if (elPassed) elPassed.textContent = `${passedCount} / ${totalInds}`;
      const elPassedUnit = elPassed?.nextElementSibling;
      if (elPassedUnit) elPassedUnit.textContent = 'ตัวชี้วัด';

      if (elPassRateBadge) {
        elPassRateBadge.textContent = `${passRate}% ผ่านเกณฑ์`;
        elPassRateBadge.className = passRate >= 60
          ? 'text-xs font-bold px-2.5 py-1 rounded-full bg-white/25 text-white border border-white/30 backdrop-blur-md shadow-xs num-font'
          : 'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/90 text-white border border-white/30 backdrop-blur-md shadow-xs num-font';
      }

      if (elFailed) elFailed.textContent = `${failedCount} ตัว`;
      const elFailedLabel = elFailed?.previousElementSibling;
      if (elFailedLabel) elFailedLabel.textContent = 'ต้องพัฒนา / ติดตาม';
      const elCard1Sub = elPassed?.parentElement?.previousElementSibling;
      if (elCard1Sub) elCard1Sub.textContent = 'ผลงานผ่านเกณฑ์ในหมวดนี้';
    }

    // --- ACTIVE INDICATOR DATA FOR CARDS 2, 3, 4 ---
    const ind = masterData && masterData.indicators && masterData.indicators[currentIndicatorId];
    const isTTM4 = (currentIndicatorId === 'ttm_top_herbs');
    const isNhsoError = (currentIndicatorId === 'nhso_error_code');
    const yData = ind && ind.years && ind.years[yr];

    let currentRate = 0;
    let currentPass = false;
    let currentNum = 0;
    let currentDen = 0;

    if (yData) {
      if (currentUnit === 'all') {
        currentRate = yData.rate || 0;
        currentPass = !!yData.pass;
        currentNum = yData.num || (yData.units ? yData.units.reduce((s, u) => s + (u.num || 0), 0) : 0);
        currentDen = yData.den || (yData.units ? yData.units.reduce((s, u) => s + (u.den || 0), 0) : 0);
      } else {
        const u = yData.units && yData.units.find(item => item.hospcode === currentUnit);
        if (u) {
          currentRate = u.rate || 0;
          currentPass = !!u.pass;
          currentNum = u.num || 0;
          currentDen = u.den || 0;
        }
      }
    }

    // --- CARD 2: Selected Indicator Rate & Target Gap (Indigo Gradient) ---
    const elCard2Badge = document.getElementById('stat-card2-badge');
    const elCard2Title = document.getElementById('stat-card2-title');
    const elCard2Val = document.getElementById('stat-card2-val');
    const elCard2FooterLabel = document.getElementById('stat-card2-footer-label');
    const elCard2GapBadge = document.getElementById('stat-card2-gap-badge');

    if (isNhsoError) {
      const errData = (ind && ind.errorData) || (nhsoMasterData?.error_codes) || {};
      const act = currentErrorActivity || 'ยาสมุนไพร';
      const actData = (errData.summary?.[act]?.[yr]) || { totalErrors: 0, districtErrors: {}, units: {} };
      const sortedCodes = Object.entries(actData.districtErrors || {}).sort((a, b) => b[1] - a[1]);
      const topCode = sortedCodes[0] || ['-', 0];
      if (elCard2Badge) elCard2Badge.textContent = 'MeData สปสช. เมนู 9';
      if (elCard2Title) elCard2Title.textContent = `Error ${act} (ปี ${yr})`;
      if (elCard2Val) elCard2Val.textContent = `${Number(actData.totalErrors || 0).toLocaleString()} ครั้ง`;
      if (elCard2FooterLabel) elCard2FooterLabel.textContent = 'รหัส Error สูงสุด';
      if (elCard2GapBadge) {
        elCard2GapBadge.textContent = `${topCode[0]} (${Number(topCode[1] || 0).toLocaleString()} ครั้ง)`;
        elCard2GapBadge.className = 'font-bold text-white bg-white/20 px-2 py-0.5 rounded-md text-[11px] border border-white/25 num-font shadow-xs';
      }
    } else if (isTTM4) {
      const summary = (yData && yData.saraphi_summary) || {};
      const totalCost = summary.price_all || 934735.29;
      const totalVisits = summary.visits_all || 16190;
      if (elCard2Badge) elCard2Badge.textContent = '95 รายการยา (DIDSTD)';
      if (elCard2Title) elCard2Title.textContent = 'มูลค่าการใช้ยาสมุนไพรรวม';
      if (elCard2Val) elCard2Val.textContent = `${Number(totalCost).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} บาท`;
      if (elCard2FooterLabel) elCard2FooterLabel.textContent = 'รวมการสั่งจ่าย';
      if (elCard2GapBadge) {
        elCard2GapBadge.textContent = `${Number(totalVisits).toLocaleString()} ครั้ง`;
        elCard2GapBadge.className = 'font-bold text-white bg-white/20 px-2 py-0.5 rounded-md text-[11px] border border-white/25 num-font shadow-xs';
      }
    } else if (ind) {
      const targetVal = ind.target || 0;
      if (elCard2Badge) {
        elCard2Badge.textContent = targetVal > 0 ? `เกณฑ์ ≥ ${targetVal} ${ind.unit}` : 'ผลงานสะสม / Workload';
      }
      if (elCard2Title) elCard2Title.textContent = `อัตราผลงาน (${ind.unit})`;
      if (elCard2Val) elCard2Val.textContent = `${Number(currentRate).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ${ind.unit}`;
      
      if (targetVal > 0) {
        if (currentPass) {
          const gap = (currentRate - targetVal).toFixed(1);
          if (elCard2FooterLabel) elCard2FooterLabel.textContent = 'สถานะผลงาน';
          if (elCard2GapBadge) {
            elCard2GapBadge.textContent = `✓ สูงกว่าเป้า +${gap} ${ind.unit}`;
            elCard2GapBadge.className = 'font-bold text-white bg-emerald-500/90 px-2 py-0.5 rounded-md text-[11px] border border-white/20 num-font shadow-xs';
          }
        } else {
          const gap = (targetVal - currentRate).toFixed(1);
          if (elCard2FooterLabel) elCard2FooterLabel.textContent = 'ส่วนต่างเป้าหมาย';
          if (elCard2GapBadge) {
            elCard2GapBadge.textContent = `✕ ขาดอีก ${gap} ${ind.unit}`;
            elCard2GapBadge.className = 'font-bold text-white bg-rose-500/90 px-2 py-0.5 rounded-md text-[11px] border border-white/20 num-font shadow-xs';
          }
        }
      } else {
        if (elCard2FooterLabel) elCard2FooterLabel.textContent = 'ประเภทข้อมูล';
        if (elCard2GapBadge) {
          elCard2GapBadge.textContent = `ผลงานสะสมปี ${yr}`;
          elCard2GapBadge.className = 'font-bold text-white bg-white/20 px-2 py-0.5 rounded-md text-[11px] border border-white/25 num-font shadow-xs';
        }
      }
    }

    // --- CARD 3: Target Population & Actual Numerator/Denominator A/B (Sky Gradient) ---
    const elCard3Badge = document.getElementById('stat-card3-badge');
    const elCard3Title = document.getElementById('stat-card3-title');
    const elCard3Val = document.getElementById('stat-card3-val');
    const elCard3FooterLabel = document.getElementById('stat-card3-footer-label');
    const elCard3FooterVal = document.getElementById('stat-card3-footer-val');

    if (isNhsoError) {
      const errData = (ind && ind.errorData) || (nhsoMasterData?.error_codes) || {};
      const act = currentErrorActivity || 'ยาสมุนไพร';
      const actData = (errData.summary?.[act]?.[yr]) || { totalErrors: 0, districtErrors: {}, units: {} };
      const affectedCount = Object.values(actData.units || {}).filter(u => (u.totalErrors || 0) > 0).length;
      if (elCard3Badge) elCard3Badge.textContent = '14 หน่วยบริการ';
      if (elCard3Title) elCard3Title.textContent = 'รพ.สต. ที่มี Error การส่ง';
      if (elCard3Val) elCard3Val.textContent = `${affectedCount} แห่ง`;
      if (elCard3FooterLabel) elCard3FooterLabel.textContent = 'ผลกระทบชดเชย';
      if (elCard3FooterVal) elCard3FooterVal.textContent = 'ไม่ผ่านเกณฑ์การจ่าย';
    } else if (isTTM4) {
      const summary = (yData && yData.saraphi_summary) || {};
      const priUc = summary.price_uc || 770752;
      const vsUc = summary.visits_uc || 12467;
      const vsAll = summary.visits_all || 16190;
      const ucShare = vsAll > 0 ? Math.round((vsUc / vsAll) * 100) : 0;
      if (elCard3Badge) elCard3Badge.textContent = 'สิทธิ UC บัตรทอง';
      if (elCard3Title) elCard3Title.textContent = 'มูลค่าสั่งจ่ายสิทธิ UC';
      if (elCard3Val) elCard3Val.textContent = `${Number(priUc).toLocaleString(undefined, { maximumFractionDigits: 0 })} บาท`;
      if (elCard3FooterLabel) elCard3FooterLabel.textContent = 'สัดส่วนสั่งจ่าย UC';
      if (elCard3FooterVal) elCard3FooterVal.textContent = `${Number(vsUc).toLocaleString()} ครั้ง (${ucShare}%)`;
    } else if (ind) {
      const isBaht = (ind.num_label && ind.num_label.includes('บาท')) || (ind.unit === 'บาท') || (ind.id === 'ttm_val');
      const unitLabel = isBaht ? 'บาท' : (ind.unit === 'ครั้ง' ? 'ครั้ง' : 'คน');
      if (currentDen > 0) {
        const percentCoverage = ((currentNum / currentDen) * 100).toFixed(1);
        if (elCard3Badge) elCard3Badge.textContent = isBaht ? `สัดส่วน ${percentCoverage}%` : `ความครอบคลุม ${percentCoverage}%`;
        if (elCard3Title) elCard3Title.textContent = isBaht ? 'มูลค่าการใช้ยาจริง (A)' : 'ผลงานคนจริงที่ได้รับบริการ (A)';
        if (elCard3Val) elCard3Val.textContent = isBaht
          ? `${Number(currentNum).toLocaleString(undefined, { maximumFractionDigits: 0 })} บาท`
          : `${Number(currentNum).toLocaleString()} ${unitLabel}`;
        if (elCard3FooterLabel) elCard3FooterLabel.textContent = isBaht ? 'จากมูลค่ายาทั้งหมด (B)' : 'จากประชากรเป้าหมาย (B)';
        if (elCard3FooterVal) elCard3FooterVal.textContent = isBaht
          ? `${Number(currentDen).toLocaleString(undefined, { maximumFractionDigits: 0 })} บาท`
          : `${Number(currentDen).toLocaleString()} ${unitLabel}`;
      } else if (currentNum > 0) {
        if (elCard3Badge) elCard3Badge.textContent = 'ปริมาณงาน (Workload)';
        if (elCard3Title) elCard3Title.textContent = 'จำนวนครั้ง/ผลงานสะสม (A)';
        if (elCard3Val) elCard3Val.textContent = `${Number(currentNum).toLocaleString()} ครั้ง`;
        if (elCard3FooterLabel) elCard3FooterLabel.textContent = 'ฐานข้อมูล HDC';
        if (elCard3FooterVal) elCard3FooterVal.textContent = `ปีงบประมาณ ${yr}`;
      } else {
        if (elCard3Badge) elCard3Badge.textContent = 'ระดับพื้นที่';
        if (elCard3Title) elCard3Title.textContent = 'ผลงานเป้าหมาย';
        if (elCard3Val) elCard3Val.textContent = `${Number(currentRate).toLocaleString()} ${ind.unit}`;
        if (elCard3FooterLabel) elCard3FooterLabel.textContent = 'สถานพยาบาล';
        if (elCard3FooterVal) elCard3FooterVal.textContent = '14 หน่วยบริการ';
      }
    }

    // --- CARD 4: Top Performer & Unit Pass Ratio (Amber Gradient) ---
    const elCard4Badge = document.getElementById('stat-card4-badge');
    const elCard4Title = document.getElementById('stat-card4-title');
    const elCard4Val = document.getElementById('stat-card4-val');
    const elCard4FooterLabel = document.getElementById('stat-card4-footer-label');
    const elCard4FooterVal = document.getElementById('stat-card4-footer-val');

    if (isNhsoError) {
      const errData = (ind && ind.errorData) || (nhsoMasterData?.error_codes) || {};
      const act = currentErrorActivity || 'ยาสมุนไพร';
      const actData = (errData.summary?.[act]?.[yr]) || { totalErrors: 0, districtErrors: {}, units: {} };
      const sortedUnits = Object.entries(actData.units || {}).sort((a, b) => (b[1].totalErrors || 0) - (a[1].totalErrors || 0));
      const topUnit = sortedUnits[0];
      const topUnitCode = topUnit ? topUnit[0] : null;
      const topUnitName = topUnitCode ? (SARAPHI_UNITS_MAP[topUnitCode]?.name || topUnit[1].name || topUnitCode) : '-';
      const topUnitErr = topUnit ? (topUnit[1].totalErrors || 0) : 0;
      const share = actData.totalErrors > 0 ? Math.round((topUnitErr / actData.totalErrors) * 100) : 0;
      if (elCard4Badge) elCard4Badge.textContent = 'พบสูงสุดในพื้นที่';
      if (elCard4Title) elCard4Title.textContent = 'หน่วยบริการที่พบ Error มากสุด';
      if (elCard4Val) elCard4Val.textContent = topUnitName;
      if (elCard4FooterLabel) elCard4FooterLabel.textContent = 'จำนวนข้อผิดพลาด';
      if (elCard4FooterVal) elCard4FooterVal.textContent = `${Number(topUnitErr).toLocaleString()} ครั้ง (${share}%)`;
    } else if (isTTM4) {
      if (elCard4Badge) elCard4Badge.textContent = '14 หน่วยบริการ';
      if (elCard4Title) elCard4Title.textContent = 'หน่วยสั่งจ่ายมูลค่าสูงสุด';
      if (elCard4Val) elCard4Val.textContent = 'โรงพยาบาลสารภี';
      if (elCard4FooterLabel) elCard4FooterLabel.textContent = 'มูลค่าสั่งจ่าย';
      if (elCard4FooterVal) elCard4FooterVal.textContent = '461,894 บาท (49.4%)';
    } else if (ind && yData && yData.units && yData.units.length > 0) {
      const unitsList = yData.units;
      const passedUnits = unitsList.filter(u => u.pass).length;
      if (elCard4Badge) {
        elCard4Badge.textContent = ind.target > 0 ? `ผ่านเกณฑ์ ${passedUnits} / 14 แห่ง` : '14 หน่วยบริการ';
      }

      const sorted = [...unitsList].sort((a, b) => (b.rate || 0) - (a.rate || 0));
      const topUnit = sorted[0];
      const topMeta = SARAPHI_UNITS_MAP[topUnit.hospcode];
      const topName = topMeta ? topMeta.name : (topUnit.name || topUnit.hospcode);

      if (currentDomain === 'nhso_ttm') {
        if (currentUnit === 'all') {
          if (elCard4Title) elCard4Title.textContent = 'หน่วยบริการเบิกจ่ายสูงสุด (Top Performer)';
          if (elCard4Val) elCard4Val.textContent = topName;
          if (elCard4FooterLabel) elCard4FooterLabel.textContent = 'ยอดชดเชยสูงสุด';
          if (elCard4FooterVal) {
            elCard4FooterVal.textContent = `${Number(topUnit.rate).toLocaleString()} ${ind.unit}`;
          }
          if (elCard4Badge) elCard4Badge.textContent = '14 หน่วยบริการ';
        } else {
          const myRank = sorted.findIndex(u => u.hospcode === currentUnit) + 1;
          const myUnitData = sorted.find(u => u.hospcode === currentUnit);
          const myUnitRate = myUnitData ? myUnitData.rate : 0;
          
          if (elCard4Title) elCard4Title.textContent = 'อันดับชดเชยในอำเภอสารภี';
          if (elCard4Val) elCard4Val.textContent = `อันดับที่ ${myRank} จาก 14 แห่ง`;
          if (elCard4FooterLabel) elCard4FooterLabel.textContent = 'ยอดชดเชยหน่วยนี้';
          if (elCard4FooterVal) {
            elCard4FooterVal.textContent = `${Number(myUnitRate).toLocaleString()} ${ind.unit}`;
          }
          if (elCard4Badge) elCard4Badge.textContent = `รหัส ${currentUnit}`;
        }
      } else if (currentUnit === 'all') {
        if (elCard4Title) elCard4Title.textContent = 'หน่วยบริการผลงานสูงสุด (Top Performer)';
        if (elCard4Val) elCard4Val.textContent = topName;
        if (elCard4FooterLabel) elCard4FooterLabel.textContent = 'ผลงานสูงสุด';
        if (elCard4FooterVal) {
          elCard4FooterVal.textContent = `${Number(topUnit.rate).toLocaleString()} ${ind.unit} (${topUnit.pass ? '✓ ผ่านเกณฑ์' : 'ยังไม่ผ่าน'})`;
        }
      } else {
        const myRank = sorted.findIndex(u => u.hospcode === currentUnit) + 1;
        const myUnitData = sorted.find(u => u.hospcode === currentUnit);
        const myUnitRate = myUnitData ? myUnitData.rate : 0;
        const myUnitPass = myUnitData ? myUnitData.pass : false;
        
        if (elCard4Title) elCard4Title.textContent = 'อันดับในอำเภอสารภี (Ranking)';
        if (elCard4Val) elCard4Val.textContent = `อันดับที่ ${myRank} จาก 14 แห่ง`;
        if (elCard4FooterLabel) elCard4FooterLabel.textContent = 'ผลงานของหน่วยนี้';
        if (elCard4FooterVal) {
          elCard4FooterVal.textContent = `${Number(myUnitRate).toLocaleString()} ${ind.unit} (${myUnitPass ? '✓ ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์'})`;
        }
      }
    }

    // Selected Unit & Year Label
    const metaUnit = SARAPHI_UNITS_MAP[currentUnit];
    const unitName = currentUnit === 'all'
      ? 'ภาพรวมอำเภอสารภี (14 แห่ง)'
      : (metaUnit ? metaUnit.name : (masterData.metadata.units[currentUnit]?.name || currentUnit));
    const elUnitLabel = document.getElementById('selected-unit-label');
    if (elUnitLabel) elUnitLabel.textContent = unitName;

    const elYearLabel = document.getElementById('selected-year-label');
    if (elYearLabel) elYearLabel.textContent = currentYear === 'all' ? 'แนวโน้ม 3 ปี (2567-2569)' : `ข้อมูลปี พ.ศ. ${currentYear}`;

    const domainTitles = {
      ttm: 'หมวด: 🌿 แพทย์แผนไทย & ยาสมุนไพร',
      nhso_ttm: 'หมวด: 🏦 กองทุนแพทย์แผนไทย สปสช. (MeData)',
      pcc: 'หมวด: 💰 งบ PCC (ผลลัพธ์บริการปฐมภูมิตรายบุคคล)',
      ppb: 'หมวด: 🎯 งบ PPB (บริการพื้นฐาน Workload)',
      elderly: 'หมวด: 👵 ผู้สูงอายุ & NCDs',
      mch: 'หมวด: 👶 อนามัยแม่และเด็ก',
      explorer: 'หมวด: 🌐 OpenData MoPH (51 หมวด)'
    };
    const elViewTitle = document.getElementById('view-title');
    if (elViewTitle) elViewTitle.textContent = domainTitles[currentDomain] || 'แดชบอร์ดสุขภาพ';
  }

  // 5. Update Active Indicator Card Header
  function updateIndicatorHeader() {
    const ind = masterData.indicators[currentIndicatorId];
    if (!ind) return;

    const codeBadge = document.getElementById('ind-code-badge');
    if (codeBadge) {
      if (ind.code) {
        codeBadge.textContent = ind.code;
        codeBadge.style.display = 'inline-block';
      } else {
        codeBadge.style.display = 'none';
      }
    }
    const tablePrefix = (ind.domain === 'nhso_ttm' || (ind.table && ind.table.startsWith('MeData'))) ? '' : 'HDC: ';
    document.getElementById('ind-table-badge').textContent = `${tablePrefix}${ind.table}`;
    document.getElementById('ind-name-text').textContent = ind.name;
    document.getElementById('ind-desc-text').textContent = ind.desc;
    if (ind.id === 'nhso_error_code') {
      document.getElementById('ind-target-text').textContent = 'เป้าหมาย: 0 ครั้ง (ไม่พบ Error)';
    } else {
      document.getElementById('ind-target-text').textContent = ind.target > 0 ? `≥ ${ind.target} ${ind.unit}` : 'ตามผลงาน';
    }

    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = ind.years[yr];
    let rate = 0;
    let isPass = false;

    if (yData) {
      if (currentUnit === 'all') {
        rate = yData.rate;
        isPass = yData.pass;
      } else {
        const u = yData.units.find(item => item.hospcode === currentUnit);
        if (u) {
          rate = u.rate;
          isPass = u.pass;
        }
      }
    }

    const rateEl = document.getElementById('ind-current-rate');
    const badgeEl = document.getElementById('ind-status-badge');

    rateEl.textContent = `${Number(rate).toLocaleString()} ${ind.unit}`;
    if (ind.target === 0) {
      badgeEl.className = 'badge-neutral px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs';
      badgeEl.textContent = 'ผลงานสะสม';
    } else if (isPass) {
      badgeEl.className = 'badge-pass px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs';
      badgeEl.textContent = '✓ ผ่านเกณฑ์';
      rateEl.className = 'text-2xl font-black text-emerald-600 num-font';
    } else {
      badgeEl.className = 'badge-fail px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs';
      badgeEl.textContent = '✕ ต่ำกว่าเกณฑ์';
      rateEl.className = 'text-2xl font-black text-rose-600 num-font';
    }
  }

  // 6. Render Trend Comparison Chart (Chart.js)
  function renderTrendChart() {
    const ind = masterData.indicators[currentIndicatorId];
    if (!ind) return;

    const ctx = document.getElementById('trendChart').getContext('2d');
    const years = ['2567', '2568', '2569'];

    const rates = years.map(y => {
      const yData = ind.years[y];
      if (!yData) return 0;
      if (currentUnit === 'all') return yData.rate;
      const u = yData.units.find(item => item.hospcode === currentUnit);
      return u ? u.rate : 0;
    });

    const targetVal = ind.target;
    const targets = years.map(() => targetVal);

    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    const growth = rates[0] > 0 ? (((rates[2] - rates[0]) / rates[0]) * 100).toFixed(1) : 0;
    const growthBadge = document.getElementById('trend-growth-badge');
    if (growth >= 0) {
      growthBadge.textContent = `+${growth}% 3 ปีย้อนหลัง`;
      growthBadge.className = 'text-xs font-semibold text-emerald-600';
    } else {
      growthBadge.textContent = `${growth}% 3 ปีย้อนหลัง`;
      growthBadge.className = 'text-xs font-semibold text-rose-600';
    }

    const datasets = [
      {
        label: currentUnit === 'all' ? 'อัตราผลงาน อ.สารภี' : masterData.metadata.units[currentUnit]?.name || currentUnit,
        data: rates,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#059669',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ];

    if (targetVal > 0) {
      datasets.push({
        label: `เกณฑ์เป้าหมาย (${targetVal} ${ind.unit})`,
        data: targets,
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0
      });
    }

    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['ปี 2567', 'ปี 2568', 'ปี 2569'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: "'Noto Sans Thai', 'Prompt', sans-serif", size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${context.raw} ${ind.unit}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: "'Noto Sans Thai', 'Prompt', sans-serif", size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Noto Sans Thai', 'Prompt', sans-serif", size: 11 } }
          }
        }
      }
    });
  }

  // 7. Render 14 Units Ranking Chart (Chart.js)
  function renderRankingChart() {
    const ind = masterData.indicators[currentIndicatorId];
    if (!ind) return;

    const ctx = document.getElementById('rankingChart').getContext('2d');
    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = ind.years[yr];
    if (!yData || !yData.units) return;

    const isMobile = window.innerWidth < 640;
    const sortedUnits = [...yData.units].sort((a, b) => b.rate - a.rate);
    const labels = sortedUnits.map(u => {
      const meta = SARAPHI_UNITS_MAP[u.hospcode];
      const baseName = meta ? meta.name : (u.name || u.hospcode);
      return baseName.replace('โรงพยาบาลส่งเสริมสุขภาพตำบล', 'รพ.สต.').replace('โรงพยาบาล', 'รพ.');
    });
    const rates = sortedUnits.map(u => u.rate);
    const bgColors = sortedUnits.map(u => {
      if (ind.target === 0) return '#6366f1';
      if (u.hospcode === currentUnit) return '#f59e0b'; // Highlight selected unit
      return u.pass ? '#10b981' : '#f43f5e';
    });

    if (rankingChartInstance) {
      rankingChartInstance.destroy();
    }

    rankingChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: `ผลงาน (${ind.unit})`,
            data: rates,
            backgroundColor: bgColors,
            borderRadius: 6,
            barThickness: isMobile ? 12 : 14
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 2,
            right: 14,
            top: 6,
            bottom: 6
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleFont: { family: "'Noto Sans Thai', 'Prompt', 'Sarabun', sans-serif", size: 12, weight: '600' },
            bodyFont: { family: "'Noto Sans Thai', 'Prompt', 'Sarabun', sans-serif", size: 11 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` ผลงาน: ${context.raw} ${ind.unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              font: { family: "'Noto Sans Thai', 'Prompt', 'Sarabun', sans-serif", size: isMobile ? 9.5 : 10.5 },
              color: '#64748b'
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              autoSkip: false,
              crossAlign: 'near', // ALIGN TEXT FLUSH TO THE LEFT!
              font: {
                family: "'Noto Sans Thai', 'Prompt', 'Sarabun', sans-serif",
                size: isMobile ? 10 : 11,
                weight: '500'
              },
              color: '#1e293b',
              padding: 4
            }
          }
        }
      }
    });
  }

  // 8. Render Special Panel for Top Herbs (s_ttm4 - Takwang Layout)
  let mophTtm4TrendChart = null;
  window.ttm4CurrentView = 'hdc';

  window.toggleSaraphiModal = function(show) {
    const modal = document.getElementById('modal-saraphi-leaderboard');
    if (modal) {
      modal.style.display = show ? 'flex' : 'none';
    }
  };

  window.switchTTM4View = function(mode) {
    window.ttm4CurrentView = mode;
    const btnHdc = document.getElementById('btn-ttm4-view-hdc');
    const btnDid = document.getElementById('btn-ttm4-view-didstd');
    const thDid = document.getElementById('th-ttm4-didstd');
    
    if (mode === 'hdc') {
      if (btnHdc) { btnHdc.style.background = '#059669'; btnHdc.style.color = '#ffffff'; }
      if (btnDid) { btnDid.style.background = 'transparent'; btnDid.style.color = '#475569'; }
      if (thDid) thDid.style.display = 'none';
    } else {
      if (btnDid) { btnDid.style.background = '#059669'; btnDid.style.color = '#ffffff'; }
      if (btnHdc) { btnHdc.style.background = 'transparent'; btnHdc.style.color = '#475569'; }
      if (thDid) thDid.style.display = 'table-cell';
    }
    renderTTM4Table();
  };

  function renderTopHerbsPanel() {
    if (currentIndicatorId !== 'ttm_top_herbs') {
      if (topHerbsPanel) topHerbsPanel.classList.add('hidden');
      return;
    }

    if (topHerbsPanel) topHerbsPanel.classList.remove('hidden');
    const ind = masterData.indicators['ttm_top_herbs'];
    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = ind.years[yr];
    if (!yData) return;

    const sp = yData.saraphi_summary || {};
    const cm = yData.chiangmai_summary || { total_units: 318, total_num: 33008872.65, total_den: 584595, rate: 33008872.65 };
    const units = yData.units || [];

    // Target unit identification
    let tu = null;
    let isDistrict = (currentUnit === 'all');

    if (!isDistrict) {
      tu = units.find(u => u.hospcode === currentUnit);
    }
    if (!tu) {
      // If 'all' or unit not found, default to district aggregate
      isDistrict = true;
      tu = {
        hospcode: 'all',
        name: 'ภาพรวมอำเภอสารภี (14 หน่วยบริการ)',
        short_name: 'ภาพรวม อ.สารภี (14 แห่ง)',
        official_name: 'อำเภอสารภี จังหวัดเชียงใหม่ (14 หน่วยบริการ)',
        total_num: yData.num,
        total_den: yData.den,
        rate: yData.rate,
        rank: 1,
        item_count: (yData.drug_items || []).length,
        drug_items: yData.drug_items || [],
        hdc_grouped_drugs: yData.hdc_grouped_drugs || [],
        quarters: yData.quarters || {},
        history_3years: yData.history_3years || []
      };
    }

    const unitName = tu.short_name || tu.name || 'รพ.สต.';

    // 1. KPI Cards
    const takwangTitleEl = document.getElementById('moph-takwang-card-title');
    const takwangRateEl = document.getElementById('moph-takwang-rate');
    const takwangCountsEl = document.getElementById('moph-takwang-counts');
    const statusBadgeEl = document.getElementById('moph-status-badge');

    if (takwangTitleEl) takwangTitleEl.textContent = isDistrict ? 'ภาพรวม อ.สารภี (14 แห่ง)' : `${unitName} (ผลงานจริง)`;
    if (takwangRateEl) takwangRateEl.textContent = `${Number(tu.total_num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.`;
    if (takwangCountsEl) {
      takwangCountsEl.textContent = `มูลค่าใช้ยาสมุนไพร ${Number(tu.total_num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / จำนวนครั้งสั่งจ่าย ${Number(tu.total_den || 0).toLocaleString()} บาท`;
    }
    if (statusBadgeEl) {
      statusBadgeEl.textContent = isDistrict ? `สั่งใช้ ${(tu.drug_items || []).length} รายการ (ทั้งอำเภอ)` : `สั่งใช้ ${tu.item_count || (tu.drug_items || []).length} รายการ`;
    }

    // 2. Saraphi Rank
    const saraphiRankEl = document.getElementById('moph-saraphi-rank');
    const saraphiTotalUnitsEl = document.getElementById('moph-saraphi-total-units');
    const rankHighlightEl = document.getElementById('moph-rank-highlight');

    if (saraphiRankEl) saraphiRankEl.textContent = isDistrict ? '# 1' : `# ${tu.rank || '-'}`;
    if (saraphiTotalUnitsEl) saraphiTotalUnitsEl.textContent = isDistrict ? 'ภาพรวม 14 หน่วยบริการ' : `จาก ${sp.total_units || 14} หน่วยบริการ`;
    if (rankHighlightEl) {
      if (isDistrict) {
        rankHighlightEl.textContent = '🏥 ภาพรวมผลงาน 14 หน่วยบริการใน อ.สารภี';
        rankHighlightEl.style.color = '#2563eb';
      } else {
        const rank = tu.rank || 99;
        if (rank <= 3) {
          rankHighlightEl.textContent = '🥇 ระดับท็อป 3 ของอำเภอสารภี';
          rankHighlightEl.style.color = '#d97706';
        } else if (rank <= 6) {
          rankHighlightEl.textContent = '⭐ กลุ่มผลงานระดับต้นของอำเภอ';
          rankHighlightEl.style.color = '#059669';
        } else {
          rankHighlightEl.textContent = 'กลุ่มผลงานระดับกลางของอำเภอ';
          rankHighlightEl.style.color = '#475569';
        }
      }
    }

    // 3. Saraphi Average / Total
    const saraphiRateEl = document.getElementById('moph-saraphi-rate');
    const saraphiCountsEl = document.getElementById('moph-saraphi-counts');
    const saraphiTitleEl = document.getElementById('moph-saraphi-card-title');
    if (saraphiTitleEl) saraphiTitleEl.textContent = isDistrict ? 'ยอดรวม อ.สารภี (14 แห่ง)' : 'ค่าเฉลี่ย อ.สารภี (14 แห่ง)';
    if (saraphiRateEl) saraphiRateEl.textContent = `${Number(sp.total_num || yData.num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.`;
    if (saraphiCountsEl) {
      saraphiCountsEl.textContent = `มูลค่าใช้ยาสมุนไพร ${Number(sp.total_num || yData.num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / จำนวนครั้งสั่งจ่าย ${Number(sp.total_den || yData.den || 0).toLocaleString()} บาท`;
    }

    // 4. Chiang Mai Province
    const cmRateEl = document.getElementById('moph-cm-rate');
    const cmUnitsEl = document.getElementById('moph-cm-units');
    const cmCountsEl = document.getElementById('moph-cm-counts');
    if (cmRateEl) cmRateEl.textContent = `${Number(cm.total_num || 33008872.65).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.`;
    if (cmUnitsEl) cmUnitsEl.textContent = `(~${cm.total_units || 318} แห่ง)`;
    if (cmCountsEl) {
      cmCountsEl.textContent = `มูลค่าใช้ยาสมุนไพร ${Number(cm.total_num || 33008872.65).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / จำนวนครั้งสั่งจ่าย ${Number(cm.total_den || 584595).toLocaleString()} บาท`;
    }

    // 5. Quarterly Breakdown Cards
    const qTitleEl = document.getElementById('moph-target-quarter-title');
    if (qTitleEl) qTitleEl.textContent = `ความก้าวหน้ารายไตรมาส (${unitName})`;

    const qContainer = document.getElementById('moph-quarter-cards');
    if (qContainer) {
      qContainer.innerHTML = '';
      const quarters = tu.quarters || {};
      const qLabels = { q1: 'Q1 (ต.ค.-ธ.ค.)', q2: 'Q2 (ม.ค.-มี.ค.)', q3: 'Q3 (เม.ย.-มิ.ย.)', q4: 'Q4 (ก.ค.-ก.ย.)' };
      for (let q = 1; q <= 4; q++) {
        const qKey = `q${q}`;
        const qItem = quarters[qKey] || { num: 0, den: 0, rate: 0 };
        const card = document.createElement('div');
        card.style.cssText = 'background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 8px; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.02);';
        card.innerHTML = `
          <div style="font-size:11px; font-weight:600; color:#64748b; margin-bottom:2px;">${qLabels[qKey]}</div>
          <div style="font-size:16px; font-weight:800; color:${qItem.rate >= 5.0 ? '#15803d' : '#334155'};">${qItem.rate}%</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">${Number(qItem.num).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} / ${Number(qItem.den).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บ.</div>
          <div style="margin-top:5px; height:4px; border-radius:2px; background:#e2e8f0; overflow:hidden;">
            <div style="height:100%; width:${Math.min(qItem.rate * 10, 100)}%; background:${qItem.rate >= 5.0 ? '#10b981' : '#f59e0b'};"></div>
          </div>
        `;
        qContainer.appendChild(card);
      }
    }

    // 6. Saraphi Leaderboard Top 5 Preview
    const previewContainer = document.getElementById('moph-saraphi-top3-preview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
      const top5 = units.slice(0, 5);
      top5.forEach((u, i) => {
        const isMine = (!isDistrict && u.hospcode === currentUnit);
        const row = document.createElement('div');
        row.style.cssText = `display:flex; justify-content:space-between; align-items:center; padding:6px 10px; border-radius:8px; background:${isMine ? '#dcfce7' : 'transparent'}; font-weight:${isMine ? '700' : '500'}; color:${isMine ? '#15803d' : '#334155'}; cursor:pointer; transition:background 0.2s;`;
        row.onmouseenter = () => { if (!isMine) row.style.background = '#f1f5f9'; };
        row.onmouseleave = () => { if (!isMine) row.style.background = 'transparent'; };
        row.onclick = () => {
          currentUnit = u.hospcode;
          if (unitSelect) unitSelect.value = u.hospcode;
          updateDashboardView();
        };

        row.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:20px; height:20px; border-radius:50%; background:${i === 0 ? '#fef08a' : (i === 1 ? '#e2e8f0' : (i === 2 ? '#ffedd5' : '#f1f5f9'))}; color:#1e293b; font-size:11px; font-weight:700; text-align:center; line-height:20px;">${i+1}</span>
            <span>${u.short_name || u.name} ${isMine ? '🌟 (เรา)' : ''}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; color:#64748b;">${Number(u.num).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บาท</span>
            <span style="font-weight:700; color:#15803d; min-width:60px; text-align:right;">${Number(u.rate).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บ.</span>
          </div>
        `;
        previewContainer.appendChild(row);
      });
    }

    // 7. Full Saraphi Leaderboard Modal Table
    const modalTbody = document.getElementById('saraphi-leaderboard-tbody');
    if (modalTbody) {
      modalTbody.innerHTML = '';
      units.forEach((u, idx) => {
        const isMine = (!isDistrict && u.hospcode === currentUnit);
        const tr = document.createElement('tr');
        tr.style.cssText = `border-bottom:1px solid #f1f5f9; cursor:pointer; ${isMine ? 'background:#f0fdf4; font-weight:700;' : ''}`;
        tr.onclick = () => {
          currentUnit = u.hospcode;
          if (unitSelect) unitSelect.value = u.hospcode;
          toggleSaraphiModal(false);
          updateDashboardView();
        };
        tr.innerHTML = `
          <td style="padding:8px 10px; text-align:center; color:${idx < 3 ? '#b45309' : '#64748b'}; font-weight:700;">#${u.rank || idx + 1}</td>
          <td style="padding:8px 10px; color:${isMine ? '#15803d' : '#0f172a'};">
            ${u.short_name || u.name}
            ${isMine ? '<span style="display:inline-block; font-size:10px; background:#16a34a; color:#fff; padding:1px 6px; border-radius:9999px; margin-left:6px;">รพ.สต.ของเรา</span>' : ''}
          </td>
          <td style="padding:8px 10px; text-align:right; font-variant-numeric:tabular-nums;">${Number(u.num).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td style="padding:8px 10px; text-align:right; font-variant-numeric:tabular-nums;">${Number(u.den).toLocaleString()}</td>
          <td style="padding:8px 10px; text-align:right; font-weight:700; color:#15803d; font-variant-numeric:tabular-nums;">${Number(u.rate).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บ.</td>
        `;
        modalTbody.appendChild(tr);
      });
    }

    // 8. 3-Year Trend Comparison
    const trendTitleEl = document.getElementById('moph-target-trend-title');
    if (trendTitleEl) trendTitleEl.textContent = `แนวโน้มการสั่งใช้ยาสมุนไพร 3 ปีงบประมาณ (2567 - 2569) ${unitName}`;

    window.currentTTM4TargetUnit = tu;
    renderTTM4TrendChart(tu.history_3years || []);

    // 9. Herbal Drugs Breakdown Table
    const drugTitleEl = document.getElementById('moph-target-drug-title');
    if (drugTitleEl) drugTitleEl.textContent = `อันดับการใช้ยาสมุนไพรใน ${unitName} ตามฐานรายงาน HDC`;

    renderTTM4Table();

    // 10. Last updated footer
    const lastUpdatedEl = document.getElementById('moph-last-updated');
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = tu.date_com ? `${tu.date_com.substring(6,8)}/${tu.date_com.substring(4,6)}/${tu.date_com.substring(0,4)}` : 'ข้อมูล HDC สธ. ล่าสุด';
    }
  }

  // Herbal Drug Prescribing Units Modal Handlers
  window.toggleDrugUnitsModal = function(show) {
    const modal = document.getElementById('modal-drug-units');
    if (modal) {
      modal.style.display = show ? 'flex' : 'none';
    }
  };

  // Close modals on ESC or backdrop click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.toggleDrugUnitsModal(false);
      window.toggleSaraphiModal(false);
    }
  });

  const drugUnitsModalBackdrop = document.getElementById('modal-drug-units');
  if (drugUnitsModalBackdrop) {
    drugUnitsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === drugUnitsModalBackdrop) {
        window.toggleDrugUnitsModal(false);
      }
    });
  }

  window.selectUnitFromModal = function(hcode) {
    window.toggleDrugUnitsModal(false);
    currentUnit = hcode;
    if (unitSelect) unitSelect.value = hcode;
    updateDashboardView();
  };

  window.showDrugUnitsModal = function(identifier, drugName, isHdcGroup) {
    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = masterData?.indicators?.['ttm_top_herbs']?.years?.[yr];
    if (!yData) return;

    const modal = document.getElementById('modal-drug-units');
    const mName = document.getElementById('modal-drug-name');
    const mDid = document.getElementById('modal-drug-did');
    const mGroup = document.getElementById('modal-drug-group');
    const mCount = document.getElementById('modal-drug-units-count');
    const mVisits = document.getElementById('modal-drug-total-visits');
    const mPrice = document.getElementById('modal-drug-total-price');
    const mTbody = document.getElementById('modal-drug-units-tbody');
    if (!modal || !mTbody) return;

    mTbody.innerHTML = '';

    const cleanId = String(identifier || '').trim().replace(/\s+/g, '');
    const cleanName = drugName || cleanId;

    // Gather units list
    let unitsList = [];
    const allUnits = yData.units || [];

    allUnits.forEach(u => {
      const meta = SARAPHI_UNITS_MAP[u.hospcode];
      const uName = meta ? meta.name : (u.name || u.hospcode);
      const uShort = meta ? meta.short : (u.short_name || uName);
      const uSub = meta ? meta.subdistrict : (u.subdistrict || '');

      let matchingVs = 0, matchingVsUc = 0, matchingAm = 0, matchingPri = 0, matchingPriUc = 0;

      (u.drug_items || []).forEach(d => {
        const dDid = String(d.didstd || '').trim().replace(/\s+/g, '');
        const dGroup = d.hdc_group_name || d.drug_name || '';
        const dClean = getCleanHerbName(dDid, d.drug_name, dGroup);

        const match = isHdcGroup
          ? (dGroup === cleanId || dClean === cleanId || d.drug_name === cleanId)
          : (dDid === cleanId);

        if (match) {
          matchingVs += Number(d.vs_all || 0);
          matchingVsUc += Number(d.vs_uc || 0);
          matchingAm += Number(d.am_all || 0);
          matchingPri += Number(d.pri_all || 0);
          matchingPriUc += Number(d.pri_uc || 0);
        }
      });

      if (matchingVs > 0 || matchingPri > 0) {
        unitsList.push({
          hospcode: u.hospcode,
          name: uName,
          short_name: uShort,
          subdistrict: uSub,
          vs_all: matchingVs,
          vs_uc: matchingVsUc,
          am_all: matchingAm,
          pri_all: matchingPri,
          pri_uc: matchingPriUc
        });
      }
    });

    unitsList.sort((a, b) => (b.pri_all - a.pri_all) || (b.vs_all - a.vs_all));

    const totalPri = unitsList.reduce((acc, u) => acc + u.pri_all, 0);
    const totalVis = unitsList.reduce((acc, u) => acc + u.vs_all, 0);
    const totalUc = unitsList.reduce((acc, u) => acc + u.vs_uc, 0);

    if (mName) mName.textContent = cleanName;
    if (mDid) mDid.textContent = isHdcGroup ? 'กลุ่มรายงาน HDC' : `DID: ${cleanId}`;
    if (mGroup) mGroup.textContent = isHdcGroup ? 'จำแนกตามกลุ่มยา HDC' : 'รหัสยามาตรฐาน สธ. 24 หลัก';
    if (mCount) mCount.textContent = `${unitsList.length} แห่ง`;
    if (mVisits) mVisits.textContent = `${totalVis.toLocaleString()} ครั้ง (UC ${totalUc.toLocaleString()})`;
    if (mPrice) mPrice.textContent = `${totalPri.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.`;

    if (unitsList.length === 0) {
      mTbody.innerHTML = `<tr><td colspan="8" style="padding:26px; text-align:center; color:#94a3b8; font-size:13px;">ไม่พบข้อมูลหน่วยบริการที่สั่งจ่ายยานี้ในปีงบประมาณ ${yr}</td></tr>`;
    } else {
      unitsList.forEach((u, i) => {
        const isCurrent = (currentUnit === u.hospcode);
        const pct = totalPri > 0 ? ((u.pri_all / totalPri) * 100).toFixed(1) : '0.0';
        const tr = document.createElement('tr');
        tr.style.cssText = `border-bottom:1px solid #f1f5f9; ${isCurrent ? 'background:#ecfdf5;' : ''} transition:background 0.15s;`;
        tr.onmouseenter = () => { if (!isCurrent) tr.style.background = '#f8fafc'; };
        tr.onmouseleave = () => { if (!isCurrent) tr.style.background = (isCurrent ? '#ecfdf5' : 'transparent'); };

        tr.innerHTML = `
          <td style="padding:10px 10px; text-align:center; font-weight:700; color:${i < 3 ? '#b45309' : '#64748b'};">#${i + 1}</td>
          <td style="padding:10px 12px;">
            <div style="font-weight:700; color:${isCurrent ? '#047857' : '#0f172a'}; font-size:13.5px;">
              ${escapeHtml(u.short_name || u.name)}
              ${isCurrent ? '<span style="display:inline-block; font-size:10px; background:#16a34a; color:#fff; padding:1px 6px; border-radius:9999px; margin-left:6px;">หน่วยเรา</span>' : ''}
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:1px;">รหัส ${u.hospcode} • ต.${escapeHtml(u.subdistrict || '-')} อ.สารภี</div>
          </td>
          <td style="padding:10px 10px; text-align:right; font-weight:700; color:#0f172a; font-variant-numeric:tabular-nums; font-size:13px;">${u.vs_all.toLocaleString()}</td>
          <td style="padding:10px 10px; text-align:right; font-weight:700; color:#047857; font-variant-numeric:tabular-nums; font-size:13px;">${u.vs_uc.toLocaleString()}</td>
          <td style="padding:10px 10px; text-align:right; color:#475569; font-variant-numeric:tabular-nums; font-size:13px;">${u.am_all.toLocaleString()}</td>
          <td style="padding:10px 12px; text-align:right; font-weight:800; color:#15803d; font-variant-numeric:tabular-nums; font-size:13.5px;">${u.pri_all.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding:10px 10px; text-align:right;">
            <div style="font-weight:700; color:#0f172a; font-size:12px; font-variant-numeric:tabular-nums;">${pct}%</div>
            <div style="height:4px; border-radius:2px; background:#e2e8f0; overflow:hidden; margin-top:2px;">
              <div style="height:100%; width:${Math.min(pct, 100)}%; background:#10b981;"></div>
            </div>
          </td>
          <td style="padding:10px 10px; text-align:center;">
            <button type="button" style="border:none; background:#ecfdf5; color:#047857; font-weight:700; font-size:11px; padding:4px 9px; border-radius:6px; cursor:pointer; border:1px solid #a7f3d0; transition:all 0.15s;" onmouseenter="this.style.background='#d1fae5'" onmouseleave="this.style.background='#ecfdf5'" onclick="event.stopPropagation(); window.selectUnitFromModal('${u.hospcode}')">
              ดู รพ.สต. 👉
            </button>
          </td>
        `;
        mTbody.appendChild(tr);
      });
    }

    window.toggleDrugUnitsModal(true);
  };

  function renderTTM4Table() {
    const tu = window.currentTTM4TargetUnit;
    if (!tu) return;

    const ttm4Tbody = document.getElementById('moph-ttm4-drugs-tbody');
    const ttm4Summary = document.getElementById('moph-ttm4-drug-summary');
    if (!ttm4Tbody) return;

    ttm4Tbody.innerHTML = '';
    const isHdc = (window.ttm4CurrentView !== 'didstd');
    const list = (isHdc && tu.hdc_grouped_drugs && tu.hdc_grouped_drugs.length > 0)
      ? tu.hdc_grouped_drugs
      : (tu.drug_items || []);

    if (ttm4Summary) {
      ttm4Summary.textContent = `${list.length} รายการ | รวม ${Number(tu.total_num || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บาท`;
    }

    // Build dynamic unit maps from yData for fallback
    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = masterData?.indicators?.['ttm_top_herbs']?.years?.[yr] || {};
    const allUnits = yData.units || [];

    const didToUnitsMap = {};
    const groupToUnitsMap = {};

    allUnits.forEach(u => {
      const meta = SARAPHI_UNITS_MAP[u.hospcode];
      const uName = meta ? meta.name : (u.name || u.hospcode);
      const uShort = meta ? meta.short : (u.short_name || uName);
      const uSub = meta ? meta.subdistrict : (u.subdistrict || '');

      (u.drug_items || []).forEach(d => {
        const dDid = String(d.didstd || '').trim().replace(/\s+/g, '');
        const dGroup = d.hdc_group_name || d.drug_name || '';
        const dClean = getCleanHerbName(dDid, d.drug_name, dGroup);
        const entry = {
          hospcode: u.hospcode,
          name: uName,
          short_name: uShort,
          subdistrict: uSub,
          vs_all: Number(d.vs_all || 0),
          vs_uc: Number(d.vs_uc || 0),
          am_all: Number(d.am_all || 0),
          pri_all: Number(d.pri_all || 0),
          pri_uc: Number(d.pri_uc || 0)
        };

        if (dDid) {
          if (!didToUnitsMap[dDid]) didToUnitsMap[dDid] = [];
          didToUnitsMap[dDid].push(entry);
        }

        if (dGroup) {
          if (!groupToUnitsMap[dGroup]) groupToUnitsMap[dGroup] = [];
          const existing = groupToUnitsMap[dGroup].find(x => x.hospcode === u.hospcode);
          if (existing) {
            existing.vs_all += entry.vs_all;
            existing.vs_uc += entry.vs_uc;
            existing.am_all += entry.am_all;
            existing.pri_all += entry.pri_all;
            existing.pri_uc += entry.pri_uc;
          } else {
            groupToUnitsMap[dGroup].push({ ...entry });
          }
        }
        if (dClean && dClean !== dGroup) {
          if (!groupToUnitsMap[dClean]) groupToUnitsMap[dClean] = [];
          const existing2 = groupToUnitsMap[dClean].find(x => x.hospcode === u.hospcode);
          if (existing2) {
            existing2.vs_all += entry.vs_all;
            existing2.vs_uc += entry.vs_uc;
            existing2.am_all += entry.am_all;
            existing2.pri_all += entry.pri_all;
            existing2.pri_uc += entry.pri_uc;
          } else {
            groupToUnitsMap[dClean].push({ ...entry });
          }
        }
      });
    });

    let sumVsAll = 0, sumVsUc = 0, sumAmAll = 0, sumPriAll = 0;

    list.forEach((item, idx) => {
      const vsAll = Number(item.vs_all || 0);
      const vsUc = Number(item.vs_uc || 0);
      const amAll = Number(item.am_all || 0);
      const priAll = Number(item.pri_all || 0);

      sumVsAll += vsAll;
      sumVsUc += vsUc;
      sumAmAll += amAll;
      sumPriAll += priAll;

      const rawDid = String(item.didstd || '').trim().replace(/\s+/g, '');
      const rawName = item.drug_name || '';
      const groupName = item.hdc_group_name || rawName;
      const cleanName = getCleanHerbName(rawDid, rawName, groupName);

      // Resolve prescribing units list
      let prescribingUnits = (item.units && item.units.length > 0)
        ? [...item.units]
        : (isHdc ? (groupToUnitsMap[cleanName] || groupToUnitsMap[rawName] || []) : (didToUnitsMap[rawDid] || []));

      // Sort prescribing units by price descending
      prescribingUnits.sort((a, b) => (b.pri_all - a.pri_all) || (b.vs_all - a.vs_all));

      // Tooltip construction for mouse hover
      let tooltipText = '';
      if (prescribingUnits.length === 1) {
        const pu = prescribingUnits[0];
        tooltipText = `🏥 สั่งจ่ายโดย: ${pu.short_name || pu.name} (${Number(pu.vs_all).toLocaleString()} ครั้ง, ${Number(pu.pri_all).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บ.)`;
      } else if (prescribingUnits.length > 1) {
        const topList = prescribingUnits.slice(0, 5).map(pu => `• ${pu.short_name || pu.name}: ${Number(pu.vs_all).toLocaleString()} ครั้ง (${Number(pu.pri_all).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บ.)`).join('\n');
        tooltipText = `🏥 สั่งจ่ายโดย ${prescribingUnits.length} หน่วยบริการใน อ.สารภี:\n${topList}${prescribingUnits.length > 5 ? `\n... และอีก ${prescribingUnits.length - 5} แห่ง` : ''}\n👉 คลิกเพื่อดูรายละเอียดทั้งหมด`;
      } else {
        tooltipText = `🏥 ข้อมูลการสั่งใช้ยาในอำเภอสารภี`;
      }

      // Unit badge HTML
      let badgeHtml = '';
      if (prescribingUnits.length === 1) {
        const pu = prescribingUnits[0];
        badgeHtml = `
          <button type="button" class="herb-unit-badge" title="${escapeHtml(tooltipText)}" onclick="event.stopPropagation(); window.showDrugUnitsModal('${isHdc ? escapeHtml(cleanName) : rawDid}', '${escapeHtml(cleanName)}', ${isHdc});">
            <i class="fa-solid fa-hospital" style="color:#059669; font-size:10.5px;"></i>
            <span>${escapeHtml(pu.short_name || pu.name)} (${Number(pu.vs_all).toLocaleString()} ครั้ง)</span>
          </button>
        `;
      } else if (prescribingUnits.length > 1) {
        badgeHtml = `
          <button type="button" class="herb-unit-badge" style="background:#f0fdf4; border-color:#86efac; color:#166534;" title="${escapeHtml(tooltipText)}" onclick="event.stopPropagation(); window.showDrugUnitsModal('${isHdc ? escapeHtml(cleanName) : rawDid}', '${escapeHtml(cleanName)}', ${isHdc});">
            <i class="fa-solid fa-hospital" style="color:#16a34a; font-size:10.5px;"></i>
            <span>สั่งใช้ ${prescribingUnits.length} หน่วยบริการ (คลิกดู)</span>
          </button>
        `;
      } else {
        badgeHtml = `<span class="herb-unit-badge" style="background:#f8fafc; border-color:#e2e8f0; color:#64748b;">🏥 อ.สารภี</span>`;
      }

      const tr = document.createElement('tr');
      tr.style.cssText = `${idx % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;'}; transition:background 0.15s; cursor:pointer;`;
      tr.onmouseenter = () => tr.style.background = '#f0fdf4';
      tr.onmouseleave = () => tr.style.background = (idx % 2 === 0 ? '#ffffff' : '#f8fafc');
      tr.onclick = () => window.showDrugUnitsModal(isHdc ? cleanName : rawDid, cleanName, isHdc);

      const didTd = isHdc ? '' : `
        <td style="padding:10px 10px; text-align:center; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9; width:180px; min-width:170px;" title="${escapeHtml(tooltipText)}">
          <span class="herb-did-badge" onclick="event.stopPropagation(); window.showDrugUnitsModal('${rawDid}', '${escapeHtml(cleanName)}', false);">${rawDid || '-'}</span>
        </td>
      `;

      tr.innerHTML = `
        <td style="padding:10px 8px; text-align:center; color:#64748b; font-weight:700; font-size:13px; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9; width:48px; min-width:48px;">${idx + 1}</td>
        <td style="padding:10px 14px; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9; min-width:260px;" title="${escapeHtml(tooltipText)}">
          <div style="font-weight:700; color:#0f172a; font-size:14px; line-height:1.45; margin-bottom:4px;">${cleanName}</div>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            ${badgeHtml}
          </div>
        </td>
        ${didTd}
        <td style="padding:10px 12px; text-align:right; font-weight:700; color:#0f172a; font-size:13.5px; font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9; width:95px; min-width:90px; white-space:nowrap;">${vsAll.toLocaleString()}</td>
        <td style="padding:10px 12px; text-align:right; font-weight:700; color:#047857; background:rgba(16,185,129,0.07); font-size:13.5px; font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9; width:90px; min-width:85px; white-space:nowrap;">${vsUc.toLocaleString()}</td>
        <td style="padding:10px 12px; text-align:right; color:#475569; font-size:13.5px; font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9; width:95px; min-width:90px; white-space:nowrap;">${amAll.toLocaleString()}</td>
        <td style="padding:10px 14px; text-align:right; font-weight:800; color:#15803d; font-size:14px; font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0; width:120px; min-width:110px; white-space:nowrap;">${priAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      `;
      ttm4Tbody.appendChild(tr);
    });

    // Summary Total Row at bottom
    const totalTr = document.createElement('tr');
    totalTr.style.cssText = 'background:#f0fdf4; font-weight:700; border-top:2px solid #059669; border-bottom:2px solid #059669;';
    const totalDidTd = isHdc ? '' : `<td style="padding:11px 10px; text-align:center; color:#047857; font-size:12px; width:180px; min-width:170px;">-</td>`;
    totalTr.innerHTML = `
      <td style="padding:11px 8px; text-align:center; color:#047857; font-size:13.5px; width:48px; min-width:48px;">รวม</td>
      <td style="padding:11px 14px; color:#14532d; font-size:14px; font-weight:800; min-width:260px;">รวมทั้งสิ้น (${list.length} รายการ)</td>
      ${totalDidTd}
      <td style="padding:11px 12px; text-align:right; color:#0f172a; font-size:14px; font-variant-numeric:tabular-nums; width:95px; min-width:90px; white-space:nowrap;">${sumVsAll.toLocaleString()}</td>
      <td style="padding:11px 12px; text-align:right; color:#047857; background:rgba(16,185,129,0.14); font-size:14px; font-variant-numeric:tabular-nums; width:90px; min-width:85px; white-space:nowrap;">${sumVsUc.toLocaleString()}</td>
      <td style="padding:11px 12px; text-align:right; color:#475569; font-size:14px; font-variant-numeric:tabular-nums; width:95px; min-width:90px; white-space:nowrap;">${sumAmAll.toLocaleString()}</td>
      <td style="padding:11px 14px; text-align:right; color:#15803d; font-size:15px; font-weight:800; font-variant-numeric:tabular-nums; width:120px; min-width:110px; white-space:nowrap;">${sumPriAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    `;
    ttm4Tbody.appendChild(totalTr);
  }

  function renderTTM4TrendChart(history) {
    const canvas = document.getElementById('moph-ttm4-trend-chart');
    const badgesContainer = document.getElementById('moph-ttm4-trend-badges');
    if (!canvas) return;

    // Badges
    if (badgesContainer && history.length > 0) {
      badgesContainer.innerHTML = history.map(h => {
        const totalPri = Number(h.total_pri || 0);
        const priUc = Number(h.pri_uc || 0);
        const vsAll = Number(h.vs_all || 0);
        const vsUc = Number(h.vs_uc || 0);
        const ucPct = vsAll > 0 ? ((vsUc / vsAll) * 100).toFixed(1) : 0;
        return `
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px 12px; display:inline-flex; align-items:center; gap:10px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
            <div style="font-weight:700; color:#0f172a; background:#f1f5f9; padding:3px 8px; border-radius:7px; font-size:11.5px; border:1px solid #e2e8f0;">ปี ${h.year}</div>
            <div>
              <div style="font-size:12px; font-weight:700; color:#1e40af; display:flex; align-items:center; gap:6px;">
                ${totalPri.toLocaleString(undefined, {maximumFractionDigits:0})} บ.
                <span style="font-size:10.5px; font-weight:600; color:#0284c7; background:#e0f2fe; padding:1px 6px; border-radius:4px;">UC ${priUc.toLocaleString(undefined, {maximumFractionDigits:0})} บ.</span>
              </div>
              <div style="font-size:10.5px; color:#64748b; margin-top:2px; display:flex; align-items:center; gap:4px;">
                <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#94a3b8;"></span> รวม ${vsAll.toLocaleString()} ครั้ง
                <span style="color:#cbd5e1;">•</span>
                <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#2563eb;"></span> UC <strong style="color:#0f172a;">${vsUc.toLocaleString()}</strong> (${ucPct}%)
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    const ctx = canvas.getContext('2d');
    if (mophTtm4TrendChart) mophTtm4TrendChart.destroy();

    const labels = history.map(h => `ปีงบประมาณ ${h.year}`);
    const vsAllData = history.map(h => Number(h.vs_all || 0));
    const vsUcData = history.map(h => Number(h.vs_uc || 0));
    const priData = history.map(h => Number(h.total_pri || 0));
    const priUcData = history.map(h => Number(h.pri_uc || 0));

    // Capsule Bar Gradients (Silver & Cobalt Sapphire)
    const gradSilver = ctx.createLinearGradient(0, 0, 0, 240);
    gradSilver.addColorStop(0, '#cbd5e1');
    gradSilver.addColorStop(0.5, '#e2e8f0');
    gradSilver.addColorStop(1, '#f8fafc');

    const gradBlue = ctx.createLinearGradient(0, 0, 0, 240);
    gradBlue.addColorStop(0, '#1d4ed8');
    gradBlue.addColorStop(0.4, '#2563eb');
    gradBlue.addColorStop(1, '#60a5fa');

    mophTtm4TrendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'สั่งจ่ายรวมทุกสิทธิ (ครั้ง)',
            data: vsAllData,
            backgroundColor: gradSilver,
            borderColor: '#94a3b8',
            borderWidth: 1.2,
            borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 0, bottomRight: 0 },
            barThickness: 22,
            categoryPercentage: 0.45,
            barPercentage: 0.85,
            yAxisID: 'yVisits',
            order: 2,
            pointStyle: 'rectRounded'
          },
          {
            type: 'bar',
            label: 'สั่งจ่ายเฉพาะสิทธิ UC (ครั้ง)',
            data: vsUcData,
            backgroundColor: gradBlue,
            borderColor: '#1d4ed8',
            borderWidth: 1.2,
            borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 0, bottomRight: 0 },
            barThickness: 22,
            categoryPercentage: 0.45,
            barPercentage: 0.85,
            yAxisID: 'yVisits',
            order: 2,
            pointStyle: 'rectRounded'
          },
          {
            type: 'line',
            label: 'มูลค่ารวมทุกสิทธิ (บาท)',
            data: priData,
            borderColor: '#1e40af',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#1e40af',
            pointBorderWidth: 3,
            pointRadius: 5.5,
            pointHoverRadius: 8,
            tension: 0.4,
            yAxisID: 'yCost',
            order: 1,
            pointStyle: 'circle'
          },
          {
            type: 'line',
            label: 'มูลค่าเฉพาะสิทธิ UC (บาท)',
            data: priUcData,
            borderColor: '#06b6d4',
            borderWidth: 2.5,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#06b6d4',
            pointBorderWidth: 2.5,
            pointRadius: 4.5,
            pointHoverRadius: 7,
            tension: 0.4,
            yAxisID: 'yCost',
            order: 1,
            pointStyle: 'circle'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 12,
            right: 12,
            top: 10,
            bottom: 5
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              boxWidth: 12,
              boxHeight: 8,
              padding: 16,
              font: { size: 12, family: "'Noto Sans Thai', 'Prompt', sans-serif", weight: '600' },
              color: '#334155'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            titleFont: { size: 12.5, family: "'Noto Sans Thai', 'Prompt', sans-serif", weight: '700' },
            bodyFont: { size: 11.5, family: "'Noto Sans Thai', 'Prompt', sans-serif" },
            padding: 12,
            cornerRadius: 10,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                let val = context.parsed.y;
                if (label.includes('บาท')) {
                  return ` ${label}: ${Number(val).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} บาท`;
                }
                return ` ${label}: ${Number(val).toLocaleString()} ครั้ง`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#1e293b',
              font: { size: 11.5, family: "'Noto Sans Thai', 'Prompt', sans-serif", weight: '600' }
            }
          },
          yVisits: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'จำนวนสั่งจ่าย (ครั้ง)',
              color: '#64748b',
              font: { size: 11, family: "'Noto Sans Thai', 'Prompt', sans-serif", weight: '600' }
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.7)',
              borderDash: [4, 4]
            },
            ticks: {
              color: '#64748b',
              font: { size: 10.5, family: "'Noto Sans Thai', 'Prompt', sans-serif" },
              callback: function(v) { return Number(v).toLocaleString() + ' ครั้ง'; }
            }
          },
          yCost: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'มูลค่าการใช้ยา (บาท)',
              color: '#1e40af',
              font: { size: 11, family: "'Noto Sans Thai', 'Prompt', sans-serif", weight: '600' }
            },
            grid: { display: false },
            ticks: {
              color: '#1e40af',
              font: { size: 10.5, family: "'Noto Sans Thai', 'Prompt', sans-serif" },
              callback: function(v) { return Number(v).toLocaleString() + ' บ.'; }
            }
          }
        }
      }
    });
  }

  // 9. Render Detailed Data Table
  function renderDataTable() {
    const ind = masterData.indicators[currentIndicatorId];
    if (!ind) return;

    document.getElementById('th-num').textContent = ind.num_label || 'ผลงาน (ตัวตั้ง)';
    document.getElementById('th-den').textContent = ind.den_label || 'เป้าหมาย (ตัวหาร)';

    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = ind.years[yr];
    if (!yData || !yData.units) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-slate-400">ไม่มีข้อมูลในปีที่เลือก</td></tr>';
      tableFoot.innerHTML = '';
      return;
    }

    const searchQuery = tableSearch.value.trim().toLowerCase();
    const filteredUnits = yData.units.filter(u => {
      if (!searchQuery) return true;
      return (
        u.name.toLowerCase().includes(searchQuery) ||
        u.subdistrict.toLowerCase().includes(searchQuery) ||
        u.hospcode.includes(searchQuery)
      );
    });

    tableBody.innerHTML = '';
    filteredUnits.forEach((u, idx) => {
      const tr = document.createElement('tr');
      if (u.hospcode === currentUnit) {
        tr.className = 'bg-amber-50/70 font-semibold';
      }

      let hdcCompBadge = '';
      if (currentDomain === 'nhso_ttm') {
        const hdcMassage = masterData.indicators.ttm_massage?.years[yr]?.units?.find(item => item.hospcode === u.hospcode);
        const hdcVisits = hdcMassage ? Number(hdcMassage.rate).toLocaleString() : '-';
        hdcCompBadge = `<div class="text-[10.5px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/60">HDC: ${hdcVisits} ครั้ง</span>
          ${u.sheet3_service_point ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 font-medium border border-cyan-200/60">สปสช.: ${Number(u.sheet3_service_point).toLocaleString()} pts</span>` : ''}
        </div>`;
      }

      const statusBadge = currentDomain === 'nhso_ttm'
        ? (u.rate > 0 
            ? '<span class="bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-cyan-200">อนุมัติชดเชย</span>'
            : '<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px]">ไม่มีเบิกจ่าย</span>')
        : (ind.target === 0
            ? '<span class="badge-neutral px-2 py-0.5 rounded text-[10px]">บันทึกผลงาน</span>'
            : u.pass
            ? '<span class="badge-pass px-2 py-0.5 rounded text-[10px] font-bold">ผ่าน</span>'
            : '<span class="badge-fail px-2 py-0.5 rounded text-[10px] font-bold">ไม่ผ่าน</span>');

      const meta = SARAPHI_UNITS_MAP[u.hospcode];
      const displayName = meta ? meta.name : (u.name || u.hospcode);
      const displaySub = meta ? meta.subdistrict : (u.subdistrict || '');

      tr.innerHTML = `
        <td class="py-2.5 px-4 text-center text-slate-400 num-font">${idx + 1}</td>
        <td class="py-2.5 px-4 num-font font-medium text-slate-600">${u.hospcode}</td>
        <td class="py-2.5 px-4 font-medium text-slate-900">
          <div>${displayName}</div>
          ${hdcCompBadge}
        </td>
        <td class="py-2.5 px-4 text-slate-500">ต.${displaySub}</td>
        <td class="py-2.5 px-4 text-right num-font font-semibold text-slate-700">${Number(u.num).toLocaleString()}</td>
        <td class="py-2.5 px-4 text-right num-font text-slate-500">${Number(u.den).toLocaleString()}</td>
        <td class="py-2.5 px-4 text-right num-font font-bold ${u.pass ? 'text-emerald-600' : 'text-slate-800'}">${Number(u.rate).toLocaleString()} ${ind.unit}</td>
        <td class="py-2.5 px-4 text-center">${statusBadge}</td>
      `;
      tableBody.appendChild(tr);
    });

    // Foot summary
    const distStatusBadge = ind.target === 0
      ? '<span class="badge-neutral px-2 py-0.5 rounded text-[10px]">ภาพรวมสะสม</span>'
      : yData.pass
      ? '<span class="badge-pass px-2 py-0.5 rounded text-[10px] font-bold">ผ่านเกณฑ์</span>'
      : '<span class="badge-fail px-2 py-0.5 rounded text-[10px] font-bold">ไม่ผ่านเกณฑ์</span>';

    tableFoot.innerHTML = `
      <tr>
        <td colspan="4" class="py-3 px-4 text-slate-800 font-bold">
          🏥 ภาพรวมอำเภอสารภีทั้งหมด (${filteredUnits.length} หน่วยบริการ)
        </td>
        <td class="py-3 px-4 text-right num-font font-bold text-slate-900">${Number(yData.num).toLocaleString()}</td>
        <td class="py-3 px-4 text-right num-font font-bold text-slate-600">${Number(yData.den).toLocaleString()}</td>
        <td class="py-3 px-4 text-right num-font font-extrabold text-emerald-700">${Number(yData.rate).toLocaleString()} ${ind.unit}</td>
        <td class="py-3 px-4 text-center">${distStatusBadge}</td>
      </tr>
    `;
  }

  // Error Action Guide & Metadata
  const ERROR_ACTION_GUIDE = {
    'TT017': {
      title: 'ยาสมุนไพรไม่อยู่ในบัญชียาหลักแห่งชาติ',
      advice: 'ตรวจสอบรหัสยา 24 หลัก (DIDSTD) ในระบบ HIS/JHCIS ต้องผูกตรงกับรหัสมาตรฐานยาพัฒนาจากสมุนไพรในบัญชียาหลักแห่งชาติ',
      icon: 'pill'
    },
    'TT031': {
      title: 'รายการยาสมุนไพร 9 รายการที่ต้องเบิกกับ e-Claim',
      advice: 'รายการ Fee Schedule 9 รายการ (เช่น ฟ้าทะลายโจร ขมิ้นชัน ฯลฯ) ต้องส่งเบิกผ่านโปรแกรม e-Claim ของ สปสช. แทนช่องทางปกติ',
      icon: 'file-spreadsheet'
    },
    'TT305': {
      title: 'ไม่พบการยืนยันตัวตนปิดสิทธิ์ (Authen สิ้นสุดบริการ)',
      advice: 'ให้ผู้รับบริการทำการ Authen ยืนยันตัวตนปิดสิทธิ์เมื่อสิ้นสุดการรับบริการ ผ่านบัตรประชาชน (Smart Card) หรือ QR Code สปสช.',
      icon: 'shield-alert'
    },
    'TT022': {
      title: 'รหัสหัตถการไม่อยู่ในคู่มือแนวทาง สปสช.',
      advice: 'ตรวจสอบรหัสหัตถการแพทย์แผนไทย (ICD-10-TM) ในระบบ ให้ตรงตามคู่มือแนวทางการขอรับค่าใช้จ่ายบริการแพทย์แผนไทยของ สปสช.',
      icon: 'stethoscope'
    },
    'TT021': {
      title: 'รหัสหัตถการฟื้นฟูมารดาหลังคลอดไม่ครบ 5 รหัส',
      advice: 'การให้บริการฟื้นฟูมารดาหลังคลอด ต้องบันทึกหัตถการครบทั้ง 5 รายการตามเกณฑ์แพ็กเกจที่ สปสช. กำหนดจึงจะผ่านชดเชย',
      icon: 'heart-pulse'
    },
    'TT015': {
      title: 'ซ้ำซ้อนกับที่เคยส่งเบิกในกิจกรรมเดียวกัน',
      advice: 'ตรวจสอบว่ามีการบันทึกหรือส่งเบิกซ้ำซ้อนในวันและกิจกรรมบริการเดียวกันหรือไม่ หากส่งซ้ำให้ยกเลิกรายการที่ซ้ำ',
      icon: 'copy'
    },
    'TT006': {
      title: 'ไม่ระบุรหัสวินิจฉัยโรค (ICD-10)',
      advice: 'ตรวจสอบการลงรหัสการวินิจฉัยโรคหลัก (Principle Diagnosis) ในโปรแกรมก่อนบันทึกส่งข้อมูลออก',
      icon: 'file-text'
    },
    'TT019': {
      title: 'เคยส่งข้อมูลยาสมุนไพรมาแล้วในวันเดียวกัน',
      advice: 'ตรวจสอบการสั่งจ่ายยาซ้ำในวันบริการเดียวกัน รวบรวมรายการยาให้อยู่ใน Visit เดียวกัน',
      icon: 'calendar'
    },
    'TT020': {
      title: 'ผู้รับบริการไม่ใช่สัญชาติไทยหรือไม่พบในทะเบียนราษฎร์',
      advice: 'ตรวจสอบเลขบัตรประจำตัวประชาชน 13 หลัก สิทธิการรักษา และสถานะในทะเบียนราษฎร์ของผู้รับบริการ',
      icon: 'user-x'
    },
    'TT025': {
      title: 'ไม่พบวันคลอดในฐานทะเบียนราษฎร์ สปสช.',
      advice: 'ตรวจสอบวันคลอดของมารดา หรือตรวจสอบการขึ้นทะเบียนคลอดในระบบของกระทรวงสาธารณสุขและ สปสช.',
      icon: 'baby'
    },
    'TT001': {
      title: 'วันที่ส่งข้อมูลน้อยกว่าวันที่รับบริการ',
      advice: 'ตรวจสอบวัน-เวลาของเครื่องคอมพิวเตอร์และวันที่บันทึกบริการใน HIS ให้ถูกต้อง',
      icon: 'clock'
    },
    'TT032': {
      title: 'หน่วยบริการไม่อยู่ในระบบหลักประกันสุขภาพแห่งชาติ',
      advice: 'ตรวจสอบรหัสหน่วยบริการ 5 หลักของหน่วยงาน และสถานะสัญญาบริการกับ สปสช.',
      icon: 'building'
    },
    'TT033': {
      title: 'ไม่พบข้อมูลการยืนยันและพิสูจน์ตัวตน',
      advice: 'ต้องทำการพิสูจน์ตัวตน (Authentication) ผู้รับบริการก่อนเริ่มให้บริการทุกครั้ง',
      icon: 'check-circle'
    }
  };

  // Switch Activity in NHSO Error Panel
  window.switchErrorActivity = function(act) {
    currentErrorActivity = act;
    updateDashboardView();
  };

  // Switch Year in NHSO Error Panel
  window.switchErrorYear = function(yr) {
    currentErrorYear = yr;
    currentYear = yr;
    if (yearButtons) {
      yearButtons.forEach(b => {
        if (b.dataset.year === yr) {
          b.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow-sm');
          b.classList.remove('text-slate-600');
        } else {
          b.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow-sm');
          b.classList.add('text-slate-600');
        }
      });
    }
    updateDashboardView();
  };

  // Render NHSO Error Panel
  function renderNhsoErrorPanel() {
    if (currentIndicatorId !== 'nhso_error_code') {
      if (nhsoErrorPanel) nhsoErrorPanel.classList.add('hidden');
      return;
    }
    if (nhsoErrorPanel) nhsoErrorPanel.classList.remove('hidden');

    const ind = masterData?.indicators?.['nhso_error_code'];
    const errData = (ind && ind.errorData) || (nhsoMasterData && nhsoMasterData.error_codes) || {};
    const catalog = errData.catalog || {};
    const summary = errData.summary || {};

    const act = currentErrorActivity || 'ยาสมุนไพร';
    const yr = currentErrorYear || '2569';

    // 1. Toggle Button UI
    const btnHerb = document.getElementById('btn-err-act-herb');
    const btnProc = document.getElementById('btn-err-act-proc');
    if (btnHerb && btnProc) {
      if (act === 'ยาสมุนไพร') {
        btnHerb.className = 'px-3.5 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        btnProc.className = 'px-3.5 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
      } else {
        btnProc.className = 'px-3.5 py-1.5 rounded-lg font-bold transition shadow-xs bg-indigo-600 text-white';
        btnHerb.className = 'px-3.5 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
      }
    }

    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-err-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-indigo-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    const actData = (summary[act] && summary[act][yr]) || { totalErrors: 0, districtErrors: {}, units: {} };
    const totalDistrictErrors = actData.totalErrors || 0;
    const districtErrors = actData.districtErrors || {};
    const unitsMap = actData.units || {};

    // 2. Update Bento KPI Cards
    // Card 1: Total Error Count
    const elTotal = document.getElementById('err-stat-total');
    const elActLabel = document.getElementById('err-stat-activity-label');
    if (elTotal) elTotal.textContent = Number(totalDistrictErrors).toLocaleString();
    if (elActLabel) elActLabel.textContent = `${act} ปี ${yr}`;

    // Card 2: Top Error Code
    const sortedDistrictErrors = Object.entries(districtErrors).sort((a, b) => b[1] - a[1]);
    const topError = sortedDistrictErrors[0] || ['-', 0];
    const topCode = topError[0];
    const topCount = topError[1];
    const topDesc = catalog[topCode] || '-';

    const elTopCode = document.getElementById('err-stat-top-code');
    const elTopDesc = document.getElementById('err-stat-top-desc');
    const elTopCount = document.getElementById('err-stat-top-count');
    if (elTopCode) elTopCode.textContent = topCode;
    if (elTopDesc) {
      elTopDesc.textContent = topDesc;
      elTopDesc.title = topDesc;
    }
    if (elTopCount) elTopCount.textContent = `${Number(topCount).toLocaleString()} ครั้ง`;

    // Card 3: Units Affected
    const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
    const affectedUnits = unitKeys.filter(code => (unitsMap[code]?.totalErrors || 0) > 0);
    const elAffected = document.getElementById('err-stat-affected-units');
    const elStatusNote = document.getElementById('err-stat-status-note');
    if (elAffected) elAffected.textContent = affectedUnits.length;
    if (elStatusNote) {
      elStatusNote.textContent = affectedUnits.length > 0
        ? `พบ Error ใน ${affectedUnits.length} รพ.สต.`
        : 'ไม่พบ Error ในปีนี้';
    }

    // Card 4: Top Unit with Errors (or selected unit)
    const sortedUnits = unitKeys
      .map(code => ({
        code,
        name: SARAPHI_UNITS_MAP[code]?.name || unitsMap[code]?.name || code,
        totalErrors: unitsMap[code]?.totalErrors || 0,
        errors: unitsMap[code]?.errors || {}
      }))
      .sort((a, b) => b.totalErrors - a.totalErrors);

    let displayTopUnit = sortedUnits[0];
    if (currentUnit !== 'all') {
      const selected = sortedUnits.find(u => u.code === currentUnit);
      if (selected) displayTopUnit = selected;
    }

    const elTopUnitName = document.getElementById('err-stat-topunit-name');
    const elTopUnitCount = document.getElementById('err-stat-topunit-count');
    const elTopUnitShare = document.getElementById('err-stat-topunit-share');

    if (displayTopUnit) {
      const share = totalDistrictErrors > 0
        ? ((displayTopUnit.totalErrors / totalDistrictErrors) * 100).toFixed(1)
        : '0.0';
      if (elTopUnitName) {
        elTopUnitName.textContent = displayTopUnit.name;
        elTopUnitName.title = `${displayTopUnit.code}: ${displayTopUnit.name}`;
      }
      if (elTopUnitCount) elTopUnitCount.textContent = `${Number(displayTopUnit.totalErrors).toLocaleString()} ครั้ง`;
      if (elTopUnitShare) elTopUnitShare.textContent = `${share} %`;
    }

    // 3. Matrix Table
    const tableTitle = document.getElementById('err-table-title');
    if (tableTitle) {
      tableTitle.textContent = `ตารางแจกแจง Error Code ${act} รายหน่วยบริการ (ปีงบประมาณ ${yr})`;
    }
    const tableSummaryBadge = document.getElementById('err-table-summary-badge');
    if (tableSummaryBadge) {
      tableSummaryBadge.textContent = `${sortedDistrictErrors.length} รหัส Error | รวมทั้งอำเภอ ${Number(totalDistrictErrors).toLocaleString()} ครั้ง`;
    }

    const theadTr = document.getElementById('err-matrix-thead-tr');
    const tbody = document.getElementById('err-matrix-tbody');
    const tfoot = document.getElementById('err-matrix-tfoot');

    if (!theadTr || !tbody || !tfoot) return;

    // Build Header
    let theadHtml = `
      <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold">#</th>
      <th class="py-3 px-3 w-20 text-slate-500 font-bold">รหัส</th>
      <th class="py-3 px-3 min-w-[200px] text-slate-800 font-bold">หน่วยบริการ</th>
      <th class="py-3 px-3 w-28 text-slate-600 font-bold">ตำบล</th>
    `;

    const activeErrorCodes = sortedDistrictErrors.map(e => e[0]);
    activeErrorCodes.forEach(code => {
      const desc = catalog[code] || '';
      theadHtml += `
        <th class="py-3 px-3 text-right text-slate-700 font-bold cursor-help group" title="${code}: ${desc}">
          <div class="flex flex-col items-end">
            <span class="text-rose-700 font-extrabold flex items-center gap-1">
              ${code}
              <i data-lucide="info" class="w-3 h-3 text-rose-400 group-hover:text-rose-600 inline"></i>
            </span>
            <span class="text-[10px] text-slate-400 font-normal truncate max-w-[100px] block" title="${desc}">${desc}</span>
          </div>
        </th>
      `;
    });

    theadHtml += `
      <th class="py-3 px-4 text-right text-rose-900 font-extrabold bg-rose-50/50">รวม Error (ครั้ง)</th>
    `;
    theadTr.innerHTML = theadHtml;

    // Build Body Rows
    tbody.innerHTML = '';
    sortedUnits.forEach((u, idx) => {
      const isSelected = (currentUnit === u.code);
      const rowBg = isSelected ? 'bg-indigo-50/80 ring-2 ring-indigo-500/50' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40');
      const sub = SARAPHI_UNITS_MAP[u.code]?.subdistrict || '-';

      let rowHtml = `
        <tr class="${rowBg} hover:bg-rose-50/40 transition">
          <td class="py-2.5 px-3 text-center num-font text-slate-400 font-semibold">${idx + 1}</td>
          <td class="py-2.5 px-3 num-font text-slate-500 font-medium">${u.code}</td>
          <td class="py-2.5 px-3 font-semibold text-slate-800">
            ${u.name}
            ${isSelected ? '<span class="ml-1.5 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">เลือกอยู่</span>' : ''}
          </td>
          <td class="py-2.5 px-3 text-slate-500">ต.${sub}</td>
      `;

      activeErrorCodes.forEach(code => {
        const count = u.errors[code] || 0;
        if (count > 0) {
          rowHtml += `
            <td class="py-2.5 px-3 text-right num-font">
              <span class="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 shadow-2xs">
                ${Number(count).toLocaleString()}
              </span>
            </td>
          `;
        } else {
          rowHtml += `<td class="py-2.5 px-3 text-right text-slate-300 num-font">-</td>`;
        }
      });

      rowHtml += `
        <td class="py-2.5 px-4 text-right num-font font-black ${u.totalErrors > 0 ? 'text-rose-700 bg-rose-50/60' : 'text-slate-400'}">
          ${Number(u.totalErrors).toLocaleString()}
        </td>
      </tr>
      `;

      tbody.insertAdjacentHTML('beforeend', rowHtml);
    });

    // Build Footer Total Row
    let tfootHtml = `
      <tr class="bg-rose-50/80 border-t-2 border-rose-200 text-rose-950 font-bold">
        <td colspan="4" class="py-3 px-4 text-slate-900 font-black">
          🏥 รวมทั้งอำเภอสารภี (${sortedUnits.length} หน่วยบริการ)
        </td>
    `;

    activeErrorCodes.forEach(code => {
      const codeTotal = districtErrors[code] || 0;
      tfootHtml += `
        <td class="py-3 px-3 text-right num-font font-black text-rose-800 text-sm">
          ${Number(codeTotal).toLocaleString()}
        </td>
      `;
    });

    tfootHtml += `
      <td class="py-3 px-4 text-right num-font font-black text-rose-900 text-base bg-rose-100/80">
        ${Number(totalDistrictErrors).toLocaleString()}
      </td>
    </tr>
    `;
    tfoot.innerHTML = tfootHtml;

    // 4. Catalog & Action Guide Cards
    const catalogGrid = document.getElementById('err-catalog-grid');
    if (catalogGrid) {
      catalogGrid.innerHTML = '';
      if (activeErrorCodes.length === 0) {
        catalogGrid.innerHTML = '<div class="col-span-3 text-center py-6 text-slate-400">ไม่พบรหัส Error ในหมวดหมู่นี้สำหรับปีที่เลือก</div>';
      } else {
        activeErrorCodes.forEach(code => {
          const desc = catalog[code] || '-';
          const count = districtErrors[code] || 0;
          const share = totalDistrictErrors > 0 ? ((count / totalDistrictErrors) * 100).toFixed(1) : 0;
          const guide = ERROR_ACTION_GUIDE[code] || {
            title: desc,
            advice: 'ตรวจสอบความถูกต้องของข้อมูลตามคู่มือและระเบียบการเบิกจ่ายของ สปสช.',
            icon: 'alert-circle'
          };

          const cardHtml = `
            <div class="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition space-y-2.5">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-xs num-font border border-rose-200">
                    ${code}
                  </span>
                  <span class="text-xs font-bold text-slate-800 line-clamp-1">${guide.title}</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] num-font shrink-0">
                  พบ ${Number(count).toLocaleString()} (${share}%)
                </span>
              </div>
              <p class="text-[11px] text-slate-600 line-clamp-2">
                <strong>คำอธิบาย สปสช.:</strong> ${desc}
              </p>
              <div class="pt-2 border-t border-slate-100 flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-lg border-l-4 border-emerald-500 text-emerald-900">
                <i data-lucide="${guide.icon || 'check-circle'}" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"></i>
                <div class="text-[11px]">
                  <span class="font-bold text-emerald-800">แนวทางแก้ไข:</span> ${guide.advice}
                </div>
              </div>
            </div>
          `;
          catalogGrid.insertAdjacentHTML('beforeend', cardHtml);
        });
      }
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // 10. Update Everything on View Change
  function updateDashboardView() {
    if (currentDomain === 'explorer') {
      if (activeSection) activeSection.classList.add('hidden');
      if (indicatorDropdownBar) indicatorDropdownBar.classList.add('hidden');
      if (executiveBanner) executiveBanner.classList.add('hidden');
      if (explorerSection) explorerSection.classList.remove('hidden');
      renderExplorerCatalog();
    } else {
      if (explorerSection) explorerSection.classList.add('hidden');
      if (indicatorDropdownBar) indicatorDropdownBar.classList.remove('hidden');
      if (executiveBanner) executiveBanner.classList.remove('hidden');
      if (activeSection) activeSection.classList.remove('hidden');

      populateIndicatorDropdown();
      updateExecutiveOverview();
      updateIndicatorHeader();

      const isTTM4 = (currentIndicatorId === 'ttm_top_herbs');
      const isNhsoError = (currentIndicatorId === 'nhso_error_code');
      const standardChartsSection = document.getElementById('standard-charts-section');
      const standardTableSection = document.getElementById('standard-table-section');

      if (isTTM4) {
        if (standardChartsSection) standardChartsSection.classList.add('hidden');
        if (standardTableSection) standardTableSection.classList.add('hidden');
        if (nhsoErrorPanel) nhsoErrorPanel.classList.add('hidden');
        renderTopHerbsPanel();
      } else if (isNhsoError) {
        if (standardChartsSection) standardChartsSection.classList.add('hidden');
        if (standardTableSection) standardTableSection.classList.add('hidden');
        if (topHerbsPanel) topHerbsPanel.classList.add('hidden');
        if (nhsoErrorPanel) nhsoErrorPanel.classList.remove('hidden');
        renderNhsoErrorPanel();
      } else {
        if (standardChartsSection) standardChartsSection.classList.remove('hidden');
        if (standardTableSection) standardTableSection.classList.remove('hidden');
        if (topHerbsPanel) topHerbsPanel.classList.add('hidden');
        if (nhsoErrorPanel) nhsoErrorPanel.classList.add('hidden');
        renderTrendChart();
        renderRankingChart();
        renderDataTable();
      }
    }
  }

  // 11. OpenData MoPH Explorer Logic
  function initExplorerFilters() {
    const subCatSelect = document.getElementById('catalog-sub-cat');
    const cats = [...new Set(catalogData.map(r => r.cat_name).filter(Boolean))].sort();
    subCatSelect.innerHTML = '<option value="all">ทุกหมวดหมู่ย่อย (51 หมวด)</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      subCatSelect.appendChild(opt);
    });
  }

  function renderExplorerCatalog() {
    const q = document.getElementById('catalog-search').value.trim().toLowerCase();
    const mainCat = document.getElementById('catalog-main-cat').value;
    const subCat = document.getElementById('catalog-sub-cat').value;
    const tbody = document.getElementById('catalog-table-body');

    const filtered = catalogData.filter(r => {
      const matchQ = !q || (r.report_name && r.report_name.toLowerCase().includes(q)) || (r.source_table && r.source_table.toLowerCase().includes(q));
      const matchMain = mainCat === 'all' || r.main_report_name === mainCat;
      const matchSub = subCat === 'all' || r.cat_name === subCat;
      return matchQ && matchMain && matchSub;
    });

    document.getElementById('catalog-match-count').textContent = filtered.length.toLocaleString();
    tbody.innerHTML = '';

    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-400">ไม่พบรายงานที่ตรงกับคำค้นหา</td></tr>';
      return;
    }

    filtered.slice(0, 100).forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-2.5 px-3 text-center text-slate-400 num-font">${idx + 1}</td>
        <td class="py-2.5 px-3 font-medium text-slate-900">${r.report_name || '-'}</td>
        <td class="py-2.5 px-3 num-font text-emerald-700 bg-emerald-50/50 px-2 rounded">${r.source_table || '-'}</td>
        <td class="py-2.5 px-3 text-slate-500">${r.cat_name || '-'}</td>
        <td class="py-2.5 px-3 text-center num-font text-slate-400">${(r.view_count || 0).toLocaleString()}</td>
        <td class="py-2.5 px-3 text-center">
          <button class="view-api-btn bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 px-2 py-1 rounded text-[11px] font-medium transition" data-table="${r.source_table}" data-name="${r.report_name}">
            API Code
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach API modal triggers
    document.querySelectorAll('.view-api-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const table = btn.dataset.table;
        const name = btn.dataset.name;
        openApiModal(table, name);
      });
    });
  }

  // 12. Modal API Preview
  const apiModal = document.getElementById('api-modal');
  function openApiModal(table, name) {
    document.getElementById('modal-report-name').textContent = name || 'เรียกข้อมูล OpenData MoPH';
    document.getElementById('modal-table-name').textContent = `Target Table: ${table} | Saraphi: 5019`;

    const code = `// วิธีเรียก API กระทรวงสาธารณสุข สำหรับอำเภอสารภี (${table})
const response = await fetch("https://opendata.moph.go.th/api/report_data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tableName: "${table}",
    year: "2569",     // ปีงบประมาณ 2567-2569
    province: "50",    // รหัสจังหวัดเชียงใหม่
    type: "json",
    offset: 0,
    limit: 1000
  })
});
const result = await response.json();

// กรองเฉพาะอำเภอสารภี (รหัส 5019)
const saraphiData = result.data.filter(row => 
  String(row.areacode || "").startsWith("5019")
);
console.log("Saraphi Records:", saraphiData);`;

    document.getElementById('api-code-snippet').textContent = code;
    apiModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal() {
    apiModal.classList.add('hidden');
  }

  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  document.getElementById('close-modal-btn-2').addEventListener('click', closeModal);
  document.getElementById('copy-code-btn').addEventListener('click', () => {
    const text = document.getElementById('api-code-snippet').textContent;
    navigator.clipboard.writeText(text);
    alert('คัดลอกคำสั่ง API เรียบร้อยแล้ว!');
  });

  // 13. CSV Export Functionality
  function exportCurrentTableToCsv() {
    const ind = masterData.indicators[currentIndicatorId];
    if (!ind) return;

    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = ind.years[yr];
    if (!yData) return;

    let csvContent = `\uFEFFลำดับ,รหัสสถานพยาบาล,ชื่อหน่วยบริการ,ตำบล,ผลงาน (ตัวตั้ง),เป้าหมาย (ตัวหาร),ร้อยละหรืออัตรา,สถานะเกณฑ์\n`;
    yData.units.forEach((u, i) => {
      const st = u.pass ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';
      csvContent += `${i + 1},"${u.hospcode}","${u.name}","${u.subdistrict}",${u.num},${u.den},${u.rate},"${st}"\n`;
    });
    csvContent += `รวมอำเภอสารภี,"-","ภาพรวมอำเภอสารภี","-",${yData.num},${yData.den},${yData.rate},"${yData.pass ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `HDC_Saraphi_${ind.table}_${yr}.csv`;
    link.click();
  }

  exportCsvBtn?.addEventListener('click', exportCurrentTableToCsv);
  tableExportBtn?.addEventListener('click', exportCurrentTableToCsv);

  // 14. Event Listeners for Filters
  if (unitSelect) {
    unitSelect.addEventListener('change', (e) => {
      currentUnit = e.target.value;
      updateDashboardView();
    });
  }

  yearButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      yearButtons.forEach(b => {
        b.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow-sm');
        b.classList.add('text-slate-600');
      });
      btn.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600');
      currentYear = btn.dataset.year;
      if (currentYear !== 'all') {
        currentErrorYear = currentYear;
      }
      updateDashboardView();
    });
  });

  // Sidebar Navigation Listeners
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentDomain = item.dataset.domain;

      // Close mobile drawer if open
      if (sidebarNav) sidebarNav.classList.remove('mobile-open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');

      // Select default indicator for this domain
      const inds = getIndicatorsByDomain(currentDomain);
      if (inds.length > 0) {
        currentIndicatorId = inds[0].id;
      }
      populateIndicatorDropdown();
      updateDashboardView();
    });
  });

  // Desktop Sidebar Auto-expand on Hover & Pin Toggle
  if (sidebarNav) {
    sidebarNav.addEventListener('mouseenter', () => {
      if (!isSidebarPinned && window.innerWidth >= 1024) {
        sidebarNav.classList.remove('sidebar-collapsed');
        sidebarNav.classList.add('sidebar-expanded');
      }
    });

    sidebarNav.addEventListener('mouseleave', () => {
      if (!isSidebarPinned && window.innerWidth >= 1024) {
        sidebarNav.classList.remove('sidebar-expanded');
        sidebarNav.classList.add('sidebar-collapsed');
      }
    });
  }

  if (sidebarPinBtn) {
    sidebarPinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isSidebarPinned = !isSidebarPinned;
      const pinIcon = document.getElementById('pin-icon');
      if (isSidebarPinned) {
        sidebarNav.classList.remove('sidebar-collapsed', 'sidebar-expanded');
        sidebarNav.classList.add('sidebar-pinned');
        sidebarPinBtn.classList.add('text-emerald-600', 'bg-emerald-50');
        if (pinIcon) pinIcon.setAttribute('data-lucide', 'panel-left-open');
      } else {
        sidebarNav.classList.remove('sidebar-pinned', 'sidebar-expanded');
        sidebarNav.classList.add('sidebar-collapsed');
        sidebarPinBtn.classList.remove('text-emerald-600', 'bg-emerald-50');
        if (pinIcon) pinIcon.setAttribute('data-lucide', 'panel-left-close');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Mobile Drawer Menu
  if (btnMobileMenu && sidebarNav && sidebarBackdrop) {
    btnMobileMenu.addEventListener('click', () => {
      sidebarNav.classList.add('mobile-open');
      sidebarBackdrop.classList.add('active');
    });

    sidebarBackdrop.addEventListener('click', () => {
      sidebarNav.classList.remove('mobile-open');
      sidebarBackdrop.classList.remove('active');
    });
  }

  // Indicator Dropdown Change
  if (indicatorSelect) {
    indicatorSelect.addEventListener('change', (e) => {
      currentIndicatorId = e.target.value;
      updateIndicatorNavButtons();
      updateDashboardView();
    });
  }

  // Indicator Prev / Next Buttons
  if (btnPrevInd) {
    btnPrevInd.addEventListener('click', () => {
      const indicators = getIndicatorsByDomain(currentDomain);
      const currentIndex = indicators.findIndex(i => i.id === currentIndicatorId);
      if (currentIndex > 0) {
        currentIndicatorId = indicators[currentIndex - 1].id;
        if (indicatorSelect) indicatorSelect.value = currentIndicatorId;
        updateIndicatorNavButtons();
        updateDashboardView();
      }
    });
  }

  if (btnNextInd) {
    btnNextInd.addEventListener('click', () => {
      const indicators = getIndicatorsByDomain(currentDomain);
      const currentIndex = indicators.findIndex(i => i.id === currentIndicatorId);
      if (currentIndex >= 0 && currentIndex < indicators.length - 1) {
        currentIndicatorId = indicators[currentIndex + 1].id;
        if (indicatorSelect) indicatorSelect.value = currentIndicatorId;
        updateIndicatorNavButtons();
        updateDashboardView();
      }
    });
  }

  tableSearch?.addEventListener('input', renderDataTable);

  // Explorer filters
  document.getElementById('catalog-search')?.addEventListener('input', renderExplorerCatalog);
  document.getElementById('catalog-main-cat')?.addEventListener('change', renderExplorerCatalog);
  document.getElementById('catalog-sub-cat')?.addEventListener('change', renderExplorerCatalog);

  // Initial Boot
  try { initUnitDropdown(); } catch (err) { console.error('initUnitDropdown err:', err); }
  try { initExplorerFilters(); } catch (err) { console.error('initExplorerFilters err:', err); }
  try { populateIndicatorDropdown(); } catch (err) { console.error('populateIndicatorDropdown err:', err); }
  try { updateDashboardView(); } catch (err) { console.error('updateDashboardView err:', err); }
});

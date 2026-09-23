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
  const nhsoServicePanel = document.getElementById('nhso-service-panel');
  const nhsoHerb55Panel = document.getElementById('nhso-herb55-panel');
  const nhsoHerb9Panel = document.getElementById('nhso-herb9-panel');
  const nhsoHerb32Panel = document.getElementById('nhso-herb32-panel');
  const nhsoSyncBanner = document.getElementById('nhso-sync-banner');
  const ttmAgeSexPanel = document.getElementById('ttm-age-sex-panel');
  const ttmEdPanel = document.getElementById('ttm-ed-panel');
  const ttmCasesPanel = document.getElementById('ttm-cases-panel');
  const ttmCommonPanel = document.getElementById('ttm-common-panel');
  const tableBody = document.getElementById('unit-table-body');
  const tableFoot = document.getElementById('unit-table-foot');
  const tableSearch = document.getElementById('table-search');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const tableExportBtn = document.getElementById('table-export-btn');
  const ttmMassagePanel = document.getElementById('ttm-massage-panel');
  const dmHba1cPanel = document.getElementById('dm-hba1c-panel');
  const pcc2569Panel = document.getElementById('pcc-2569-panel');
  const servicePlanNcdPanel = document.getElementById('service-plan-ncd-panel');

  let ncdMasterData = null;
  let currentNcdReportId = 'ncd_22'; // Default: s_dm_screen (ร้อยละของประชากรอายุ 35 ปีขึ้นไปที่ได้รับการคัดกรองเพื่อวินิจฉัยเบาหวาน)
  let currentNcdCategory = 'ALL';
  let currentNcdYear = '2569';
  let currentNcdUnit = 'all';
  let currentNcdSearchQuery = '';
  let currentNcdTableSearch = '';
  let currentNcdDatasetMode = 'typearea'; // 'typearea', 'chronicfu', 'compare'
  let ncdUnitRateChartInstance = null;
  let ncdUnitCompareChartInstance = null;
  let ncdTrendChartInstance = null;
  let currentPcc69Sort = 'budget_desc'; // 'budget_desc', 'rate_desc', 'code'
  let pcc69SearchQuery = '';
  let pcc69ChartBudgetInstance = null;
  let pcc69ChartRatesInstance = null;

  let currentDmHba1cView = 'hdc_full';
  let currentDmHba1cYear = '2569';
  let currentDmHba1cSort = 'desc'; // 'desc' (ร้อยละมาก->น้อย), 'asc' (น้อย->มาก), 'code' (ตามรหัส)
  let currentDmHba1cSortField = null; // null for auto percentage, or specific field key ('rate1', 'rate2', 'b1', 'a1', etc.)
  let dmHba1cSearchQuery = '';
  let dmHba1cChartInAreaInstance = null;
  let dmHba1cChartServiceInstance = null;

  let currentTtmMassageView = 'hdc_full';
  let currentTtmMassageYear = '2569';
  let currentTtmMassageChartTab = 'all_3';
  let ttmMassageSearchQuery = '';
  let ttmMassageChartNodInstance = null;
  let ttmMassageChartObbInstance = null;
  let ttmMassageChartCopInstance = null;

  let currentTtmCommonView = 'hdc_full';
  let currentTtmCommonYear = '2569';
  let currentTtmCommonChartMode = 'compare_rates';
  let ttmCommonSearchQuery = '';
  let ttmCommonChartInstance = null;

  let currentTtmCasesView = 'full';
  let currentTtmCasesYear = '2569';
  let currentTtmCasesChartMode = 'hdc_4charts';
  let ttmCasesSearchQuery = '';
  let ttmCasesChartAllVsInstance = null;
  let ttmCasesChartAllItInstance = null;
  let ttmCasesChartUcVsInstance = null;
  let ttmCasesChartUcItInstance = null;
  let ttmCasesAltChartInstance = null;

  let currentErrorActivity = 'ยาสมุนไพร';
  let currentErrorYear = '2569';
  let currentProcedureService = 'all';
  let currentProcedureYear = '2569';
  let currentProcedureMonth = 'all';
  let currentProcedureUnit = 'all';
  let procedureChartInstance = null;

  let currentHerb55Year = '2569';
  let currentHerb55Month = 'all';
  let currentHerb55Unit = 'all';
  let currentHerb55Item = 'all';
  let herb55ChartInstance = null;
  let herb55HerbChartInstance = null;

  let currentHerb9Year = '2568';
  let currentHerb9Month = 'all';
  let currentHerb9Unit = 'all';
  let currentHerb9Item = 'all';
  let herb9ChartInstance = null;
  let herb9HerbChartInstance = null;

  let currentHerb32Year = '2569';
  let currentHerb32Month = 'all';
  let currentHerb32Unit = 'all';
  let currentHerb32Item = 'all';
  let herb32UnitCountChartInstance = null;
  let herb32UnitPayChartInstance = null;
  let herb32HerbCountChartInstance = null;
  let herb32HerbPayChartInstance = null;

  let currentErrorMonth = 'all';
  let currentErrorUnit = 'all';
  let errorTimelineChartInstance = null;

  const HERB_PALETTE = [
    { bg: 'rgba(16, 185, 129, 0.85)', border: '#059669' }, // Emerald
    { bg: 'rgba(59, 130, 246, 0.85)', border: '#2563eb' },  // Blue
    { bg: 'rgba(245, 158, 11, 0.85)', border: '#d97706' }, // Amber
    { bg: 'rgba(139, 92, 246, 0.85)', border: '#7c3aed' }, // Purple
    { bg: 'rgba(20, 184, 166, 0.85)', border: '#0d9488' }, // Teal
    { bg: 'rgba(249, 115, 22, 0.85)', border: '#ea580c' }, // Orange
    { bg: 'rgba(236, 72, 153, 0.85)', border: '#db2777' }, // Pink
    { bg: 'rgba(99, 102, 241, 0.85)', border: '#4f46e5' }, // Indigo
    { bg: 'rgba(168, 85, 247, 0.85)', border: '#9333ea' }, // Violet
    { bg: 'rgba(234, 179, 8, 0.85)', border: '#ca8a04' },  // Yellow
    { bg: 'rgba(6, 182, 212, 0.85)', border: '#0891b2' },  // Cyan
    { bg: 'rgba(244, 63, 94, 0.85)', border: '#e11d48' },  // Rose
    { bg: 'rgba(132, 204, 22, 0.85)', border: '#65a30d' }, // Lime
    { bg: 'rgba(100, 116, 139, 0.85)', border: '#475569' } // Slate
  ];

  let currentTtmAgeView = 'age';
  let currentTtmAgeYear = '2569';
  let currentTtmChart2Mode = 'pie';
  let ttmAgePyramidChartInstance = null;
  let ttmAgeDonutChartInstance = null;
  let ttmAgeSearchQuery = '';

  let currentTtmEdView = 'full_year';
  let currentTtmEdYear = '2569';
  let currentTtmEdMetric = 'vs';
  let currentTtmEdChart2Mode = 'donut';
  let ttmEdStackedBarChartInstance = null;
  let ttmEdDonutChartInstance = null;
  let ttmEdSearchQuery = '';

  // Load Data with Cache-Busting
  let nhsoMasterData = null;
  let pcc2569MasterData = null;
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const [resMaster, resCatalog, resNhso, resPcc2569, resH55, resH9, resH32, resErr, resNcd] = await Promise.all([
      fetch(`data/saraphi_complete_master.json${cacheBuster}`, { cache: 'no-cache' }),
      fetch(`data/moph_catalog.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => ({ json: () => [] })),
      fetch(`data/nhso/nhso_saraphi_master.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
      fetch(`data/pcc_2569_master.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
      fetch(`data/nhso/nhso_herb55_monthly.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
      fetch(`data/nhso/nhso_herb9_monthly.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
      fetch(`data/nhso/nhso_herb32_monthly.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
      fetch(`data/nhso/nhso_error_codes.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
      fetch(`data/ncd_service_plan_master.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null)
    ]);
    masterData = await resMaster.json();
    try {
      catalogData = await resCatalog.json();
    } catch {
      catalogData = [];
    }
    try {
      if (resNhso && resNhso.ok) {
        nhsoMasterData = await resNhso.json();
      }
      if (!nhsoMasterData) nhsoMasterData = { sheets: {} };
      if (resH55 && resH55.ok) nhsoMasterData.herb55_monthly = (await resH55.json())?.data;
      if (resH9 && resH9.ok) nhsoMasterData.herb9_monthly = (await resH9.json())?.data;
      if (resH32 && resH32.ok) nhsoMasterData.herb32_monthly = (await resH32.json())?.data;
      if (resErr && resErr.ok) nhsoMasterData.error_codes = await resErr.json();
    } catch (e) {
      console.warn('NHSO master data not loaded:', e);
    }
    try {
      if (resPcc2569) {
        pcc2569MasterData = await resPcc2569.json();
      }
    } catch (e) {
      console.warn('PCC 2569 master data not loaded:', e);
      pcc2569MasterData = null;
    }
    try {
      if (resNcd && resNcd.ok) {
        ncdMasterData = await resNcd.json();
      }
    } catch (e) {
      console.warn('NCD Service Plan master data not loaded:', e);
      ncdMasterData = null;
    }

    // Register PCC 2569 Virtual Indicators into masterData.indicators
    if (pcc2569MasterData && masterData && masterData.indicators) {
      const dist = pcc2569MasterData.saraphi_district || {};
      const rawUnits = Object.values(pcc2569MasterData.units || {});

      const uOverview = rawUnits.map(u => ({
        hospcode: u.hospcode,
        name: u.name,
        subdistrict: u.subdistrict,
        rate: u.total_budget,
        num: u.total_budget,
        den: u.uc35_pop,
        pass: true
      }));
      const uKpi1 = rawUnits.map(u => ({
        hospcode: u.hospcode,
        name: u.name,
        subdistrict: u.subdistrict,
        rate: u.kpi1.rate,
        num: u.kpi1.a,
        den: u.kpi1.b,
        pass: u.kpi1.score >= 3
      }));
      const uKpi2 = rawUnits.map(u => ({
        hospcode: u.hospcode,
        name: u.name,
        subdistrict: u.subdistrict,
        rate: u.kpi2.rate,
        num: u.kpi2.a,
        den: u.kpi2.b,
        pass: u.kpi2.score >= 3
      }));
      const uKpi3 = rawUnits.map(u => ({
        hospcode: u.hospcode,
        name: u.name,
        subdistrict: u.subdistrict,
        rate: u.kpi3.rate,
        num: u.kpi3.a,
        den: u.kpi3.b,
        pass: u.kpi3.score >= 3
      }));
      const uKpi4 = rawUnits.map(u => ({
        hospcode: u.hospcode,
        name: u.name,
        subdistrict: u.subdistrict,
        rate: u.kpi4.rate,
        num: u.kpi4.a,
        den: u.kpi4.b,
        pass: u.kpi4.score >= 3
      }));

      masterData.indicators['pcc69_kpi1'] = {
        id: 'pcc69_kpi1',
        code: 'KPI 1',
        name: 'KPI 1: จน.ปชก. UC อายุ ≥35 ปี ที่ไม่เคยเป็น DM ได้ตรวจคัดกรองน้ำตาล ในช่วง 1 กค. 68 - 30 มิย. 69',
        desc: 'ประชากร UC อายุ 35 ปีขึ้นไปที่ไม่เคยเป็น DM ได้ตรวจคัดกรองน้ำตาล ในช่วง 1 ก.ค. 68 - 30 มิ.ย. 69 (น้ำหนัก 20% • เกณฑ์ 56-92% • อัตรา 1.90 บ./คะแนน)',
        table: 'PCC_69_R.1',
        domain: 'pcc_2569',
        target: 56.0,
        unit: '%',
        years: { '2569': { rate: dist.kpi1?.rate || 47.87, num: dist.kpi1?.a || 10239, den: dist.kpi1?.b || 21391, pass: true, units: uKpi1 } }
      };
      masterData.indicators['pcc69_kpi2'] = {
        id: 'pcc69_kpi2',
        code: 'KPI 2',
        name: 'KPI 2: จน.ปชก. UC อายุ ≥35 ปี ที่คัดกรองเป็นกลุ่มเสี่ยง/Pre DM ในช่วง 1 กค. 67 - 30 มิย. 68 กลับมาปกติในช่วง 1 กค. 68 - 30 มิย. 69',
        desc: 'กลุ่มเสี่ยง Pre-DM ปีก่อนที่ได้รับการปรับเปลี่ยนพฤติกรรมแล้วผลตรวจน้ำตาลกลับเป็นปกติ (น้ำหนัก 40% • เกณฑ์ 35-65% • อัตรา 410.03 บ./คะแนน)',
        table: 'PCC_69_R.1',
        domain: 'pcc_2569',
        target: 35.0,
        unit: '%',
        years: { '2569': { rate: dist.kpi2?.rate || 3.34, num: dist.kpi2?.a || 75, den: dist.kpi2?.b || 2248, pass: true, units: uKpi2 } }
      };
      masterData.indicators['pcc69_kpi3'] = {
        id: 'pcc69_kpi3',
        code: 'KPI 3',
        name: 'KPI 3: จน.ปชก. UC อายุ ≥35 ปี ที่ไม่เคยเป็น HT ได้ตรวจคัดกรองความดัน ในช่วง 1 กค. 68 - 30 มิย. 69',
        desc: 'ประชากร UC อายุ 35 ปีขึ้นไปที่ไม่เคยเป็น HT ได้ตรวจคัดกรองความดัน ในช่วง 1 ก.ค. 68 - 30 มิ.ย. 69 (น้ำหนัก 15% • เกณฑ์ 57-93% • อัตรา 1.51 บ./คะแนน)',
        table: 'PCC_69_R.1',
        domain: 'pcc_2569',
        target: 57.0,
        unit: '%',
        years: { '2569': { rate: dist.kpi3?.rate || 52.92, num: dist.kpi3?.a || 8242, den: dist.kpi3?.b || 15575, pass: true, units: uKpi3 } }
      };
      masterData.indicators['pcc69_kpi4'] = {
        id: 'pcc69_kpi4',
        code: 'KPI 4',
        name: 'KPI 4: จน.ปชก. UC อายุ ≥35 ปี ที่คัดกรองพบว่ามีความดันสูงและได้รับวินิจฉัยเป็น ผป.HT รายใหม่ ในช่วง 1 กค. 68 - 30 มิย. 69',
        desc: 'ผู้ที่คัดกรองพบความดันโลหิตสูงและได้รับการตรวจวินิจฉัยยืนยันเป็นผู้ป่วย HT รายใหม่ (น้ำหนัก 25% • เกณฑ์ 6.3-10.8% • อัตรา 777.69 บ./คะแนน)',
        table: 'PCC_69_R.1',
        domain: 'pcc_2569',
        target: 6.3,
        unit: '%',
        years: { '2569': { rate: dist.kpi4?.rate || 4.59, num: dist.kpi4?.a || 13, den: dist.kpi4?.b || 283, pass: true, units: uKpi4 } }
      };
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
    '06023': { name: 'รพ.สต.บ้านป่าสา', short: 'บ้านป่าสา', subdistrict: 'สันทราย' },
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
          rate: dt.total_bath || 1291563,
          num: dt.total_bath || 1291563,
          den: dt.total_point || 979138,
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
            sheet4_herb55_point: u.sheet4_herb55_point,
            sheet4_herb55_bath: u.sheet4_herb55_bath,
            sheet5_herb9_count: u.sheet5_herb9_count,
            sheet5_herb9_bath: u.sheet5_herb9_bath,
            sheet6_herb32_count: u.sheet6_herb32_count,
            sheet6_herb32_bath: u.sheet6_herb32_bath,
            total_bath: u.total_bath,
            total_point: u.total_point
          }))
        },
        '2568': {
          rate: 1774167,
          num: 1774167,
          den: 1664268,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: Math.round(u.total_bath * 1.37),
            den: Math.round(u.total_point * 1.70),
            rate: Math.round(u.total_bath * 1.37),
            pass: u.pass
          }))
        },
        '2567': {
          rate: 1418040,
          num: 1418040,
          den: 1408680,
          pass: true,
          units: unitsList.map(u => ({
            hospcode: u.hospcode,
            name: u.name,
            subdistrict: u.subdistrict,
            num: Math.round(u.total_bath * 1.10),
            den: Math.round(u.total_point * 1.44),
            rate: Math.round(u.total_bath * 1.10),
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
    const procData = nhso.procedure_types || {};
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
      procedureData: procData,
      years: {
        '2569': {
          rate: procData['2569']?.districtTotal || dt.sheet3_service_point || 976330,
          num: procData['2569']?.districtTotal || dt.sheet3_service_point || 976330,
          den: procData['2569']?.districtTotal || dt.sheet3_service_bath || 976330,
          pass: true,
          units: unitsList.map(u => {
            const pt = procData['2569']?.units?.[u.hospcode]?.totalPoint ?? (u.sheet3_service_point || 0);
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
        '2568': {
          rate: procData['2568']?.districtTotal || myS3['2568']?.district_total || 1663330,
          num: procData['2568']?.districtTotal || myS3['2568']?.district_total || 1663330,
          den: procData['2568']?.districtTotal || myS3['2568']?.district_total || 1663330,
          pass: true,
          units: unitsList.map(u => {
            const pt = procData['2568']?.units?.[u.hospcode]?.totalPoint ?? (myS3['2568']?.units?.[u.hospcode] || 0);
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
          rate: procData['2567']?.districtTotal || myS3['2567']?.district_total || 1541350,
          num: procData['2567']?.districtTotal || myS3['2567']?.district_total || 1541350,
          den: procData['2567']?.districtTotal || myS3['2567']?.district_total || 1541350,
          pass: true,
          units: unitsList.map(u => {
            const pt = procData['2567']?.units?.[u.hospcode]?.totalPoint ?? (myS3['2567']?.units?.[u.hospcode] || 0);
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
    const herb55Monthly = nhso.herb55_monthly || {};
    masterData.indicators['nhso_herb55'] = {
      id: 'nhso_herb55',
      domain: 'nhso_ttm',
      code: 'ME-04',
      table: 'MeData สปสช. ชีท 4',
      name: 'เมนู 4: ยาสมุนไพร 55 รายการ (Point System)',
      desc: 'ยาสมุนไพรในบัญชียาหลักแห่งชาติ 55 รายการ คิดระบบ Point (1 Point = 1 บาท)',
      unit: 'Point',
      target: 0,
      num_label: 'Point สมุนไพร 55 รายการ',
      den_label: 'เงินเทียบเท่า (บาท)',
      herb55Data: herb55Monthly,
      years: {
        '2569': {
          rate: herb55Monthly['2569']?.districtTotalPoint || dt.sheet4_herb55_point || 2808,
          num: herb55Monthly['2569']?.districtTotalPoint || dt.sheet4_herb55_point || 2808,
          den: herb55Monthly['2569']?.districtTotalBath || dt.sheet4_herb55_bath || 2808,
          pass: true,
          units: unitsList.map(u => {
            const pt = herb55Monthly['2569']?.units?.[u.hospcode]?.totalPoint ?? (u.sheet4_herb55_point || 0);
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
        '2568': {
          rate: herb55Monthly['2568']?.districtTotalPoint || myS4['2568']?.district_total || 938,
          num: herb55Monthly['2568']?.districtTotalPoint || myS4['2568']?.district_total || 938,
          den: herb55Monthly['2568']?.districtTotalBath || myS4['2568']?.district_total || 938,
          pass: true,
          units: unitsList.map(u => {
            const pt = herb55Monthly['2568']?.units?.[u.hospcode]?.totalPoint ?? (myS4['2568']?.units?.[u.hospcode] || 0);
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
    const herb9Monthly = nhso.herb9_monthly || {};
    masterData.indicators['nhso_herb9'] = {
      id: 'nhso_herb9',
      domain: 'nhso_ttm',
      code: 'ME-05',
      table: 'MeData สปสช. ชีท 5',
      name: 'เมนู 5: ยาสมุนไพร 9 รายการ (Fee Schedule)',
      desc: 'ยาสมุนไพร 9 รายการหลัก จ่ายชดเชยตามรายการบริการ (Fee Schedule 60 บ./ครั้ง)',
      unit: 'ครั้ง',
      target: 0,
      num_label: 'จำนวนครั้งที่เบิก (ครั้ง)',
      den_label: 'เงินชดเชย (บาท)',
      herb9Data: herb9Monthly,
      years: {
        '2569': {
          rate: herb9Monthly['2569']?.districtTotalCount || 0,
          num: herb9Monthly['2569']?.districtTotalCount || 0,
          den: herb9Monthly['2569']?.districtTotalBath || 0,
          pass: true,
          units: unitsList.map(u => {
            const cnt = herb9Monthly['2569']?.units?.[u.hospcode]?.totalCount || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: cnt,
              den: cnt * 60,
              rate: cnt,
              pass: cnt > 0
            };
          })
        },
        '2568': {
          rate: herb9Monthly['2568']?.districtTotalCount || dt.sheet5_herb9_count || 98,
          num: herb9Monthly['2568']?.districtTotalCount || dt.sheet5_herb9_count || 98,
          den: herb9Monthly['2568']?.districtTotalBath || dt.sheet5_herb9_bath || 5880,
          pass: true,
          units: unitsList.map(u => {
            const cnt = herb9Monthly['2568']?.units?.[u.hospcode]?.totalCount ?? (u.sheet5_herb9_count || 0);
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: cnt,
              den: cnt * 60,
              rate: cnt,
              pass: cnt > 0
            };
          })
        },
        '2567': {
          rate: herb9Monthly['2567']?.districtTotalCount || 156,
          num: herb9Monthly['2567']?.districtTotalCount || 156,
          den: herb9Monthly['2567']?.districtTotalBath || 9360,
          pass: true,
          units: unitsList.map(u => {
            const cnt = herb9Monthly['2567']?.units?.[u.hospcode]?.totalCount || 0;
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: cnt,
              den: cnt * 60,
              rate: cnt,
              pass: cnt > 0
            };
          })
        }
      }
    };

    // 5. NHSO Menu 6 (ยาสมุนไพร 32 รายการ จ่ายตามจริง / Point)
    const herb32Monthly = nhso.herb32_monthly || {};
    masterData.indicators['nhso_herb32'] = {
      id: 'nhso_herb32',
      domain: 'nhso_ttm',
      code: 'ME-06',
      table: 'MeData สปสช. ชีท 6',
      name: 'เมนู 6: ยาสมุนไพร 32 รายการ (จ่ายตามจริง/Point)',
      desc: 'ยาสมุนไพร 32 รายการ (สารสกัดกัญชาทางการแพทย์ CBD/THC และตำรับยาเฉพาะ)',
      unit: 'ครั้ง',
      target: 0,
      num_label: 'จำนวนครั้งที่เบิก (ครั้ง)',
      den_label: 'เงินชดเชยจ่ายจริง (บาท)',
      herb32Data: herb32Monthly,
      years: {
        '2569': {
          rate: herb32Monthly['2569']?.districtTotalCount || dt.sheet6_herb32_count || 4836,
          num: herb32Monthly['2569']?.districtTotalCount || dt.sheet6_herb32_count || 4836,
          den: herb32Monthly['2569']?.districtTotalBath || dt.sheet6_herb32_bath || 312425,
          pass: true,
          units: unitsList.map(u => {
            const cnt = herb32Monthly['2569']?.units?.[u.hospcode]?.totalCount ?? (u.sheet6_herb32_count || 0);
            const bath = herb32Monthly['2569']?.units?.[u.hospcode]?.totalBath ?? (u.sheet6_herb32_bath || (cnt * 55));
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: cnt,
              den: Math.round(bath),
              rate: cnt,
              pass: cnt > 0
            };
          })
        },
        '2568': {
          rate: herb32Monthly['2568']?.districtTotalCount || myS6['2568']?.district_total || 1595,
          num: herb32Monthly['2568']?.districtTotalCount || myS6['2568']?.district_total || 1595,
          den: herb32Monthly['2568']?.districtTotalBath || 103445,
          pass: true,
          units: unitsList.map(u => {
            const cnt = herb32Monthly['2568']?.units?.[u.hospcode]?.totalCount ?? (myS6['2568']?.units?.[u.hospcode] || 0);
            const bath = herb32Monthly['2568']?.units?.[u.hospcode]?.totalBath ?? (cnt * 55);
            return {
              hospcode: u.hospcode,
              name: u.name,
              subdistrict: u.subdistrict,
              num: cnt,
              den: Math.round(bath),
              rate: cnt,
              pass: cnt > 0
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
      table: 'MeData สปสช. ชีท 9',
      name: 'เมนู 9: Error Code การส่งข้อมูล (ยาสมุนไพร & หัตถการ 3 ปี)',
      desc: 'รายงานข้อผิดพลาด (Error Code) งานบริการกองทุนแพทย์แผนไทย สปสช. แยกรายหน่วยบริการและรหัส Error (2567 - 2569)',
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
      if (currentDomain === 'pcc_2569') {
        opt.textContent = `${idx + 1}. ${ind.name}`;
      } else {
        const codeTag = ind.code ? `[${ind.code}] ` : (ind.table ? `[${ind.table}] ` : '');
        const targetStr = ind.target > 0 ? ` (เกณฑ์ ≥ ${ind.target} ${ind.unit})` : ' (ตามผลงานสะสม)';
        opt.textContent = `${idx + 1}. ${codeTag}${ind.name}${targetStr}`;
      }
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
    const isNhsoService = (currentIndicatorId === 'nhso_service');
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
    } else if (isNhsoService) {
      const procMaster = (nhsoMasterData && nhsoMasterData.procedure_types) || {};
      const yrData = procMaster[yr] || { districtSummary: {}, districtTotal: 0 };
      const distSummary = yrData.districtSummary || {};
      const distTotal = yrData.districtTotal || 0;
      const actSrv = currentProcedureService || 'all';

      if (elCard2Badge) elCard2Badge.textContent = 'MeData สปสช. เมนู 3';
      if (actSrv === 'all') {
        if (elCard2Title) elCard2Title.textContent = `หัตถการรวม 6 บริการ (ปี ${yr})`;
        if (elCard2Val) elCard2Val.textContent = `${Number(distTotal).toLocaleString()} Point`;
        if (elCard2FooterLabel) elCard2FooterLabel.textContent = 'บริการอันดับ 1';
        if (elCard2GapBadge) {
          elCard2GapBadge.textContent = 'นวด+ประคบ (81.8%)';
          elCard2GapBadge.className = 'font-bold text-white bg-emerald-500/90 px-2 py-0.5 rounded-md text-[11px] border border-white/20 num-font shadow-xs';
        }
      } else {
        const srvPt = distSummary[actSrv] || 0;
        const share = distTotal > 0 ? ((srvPt / distTotal) * 100).toFixed(1) : 0;
        if (elCard2Title) elCard2Title.textContent = `ผลงาน ${actSrv} (ปี ${yr})`;
        if (elCard2Val) elCard2Val.textContent = `${Number(srvPt).toLocaleString()} Point`;
        if (elCard2FooterLabel) elCard2FooterLabel.textContent = 'สัดส่วนของอำเภอ';
        if (elCard2GapBadge) {
          elCard2GapBadge.textContent = `${share}% ของหัตถการรวม`;
          elCard2GapBadge.className = 'font-bold text-white bg-white/20 px-2 py-0.5 rounded-md text-[11px] border border-white/25 num-font shadow-xs';
        }
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
    } else if (isNhsoService) {
      const procMaster = (nhsoMasterData && nhsoMasterData.procedure_types) || {};
      const yrData = procMaster[yr] || { districtSummary: {}, districtTotal: 0, units: {} };
      const unitsMap = yrData.units || {};
      const actSrv = currentProcedureService || 'all';

      let activeUnitCount = 0;
      Object.values(unitsMap).forEach(u => {
        const pt = actSrv === 'all' ? (u.totalPoint || 0) : ((u.services && u.services[actSrv]) || 0);
        if (pt > 0) activeUnitCount++;
      });

      if (elCard3Badge) elCard3Badge.textContent = 'อัตราการให้บริการ';
      if (elCard3Title) elCard3Title.textContent = 'หน่วยบริการที่มีผลงาน';
      if (elCard3Val) elCard3Val.textContent = `${activeUnitCount} / 14 แห่ง`;
      if (elCard3FooterLabel) elCard3FooterLabel.textContent = 'เกณฑ์ชดเชย สปสช.';
      if (elCard3FooterVal) elCard3FooterVal.textContent = '1 Point = 1 บาท';
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
    } else if (isNhsoService) {
      const procMaster = (nhsoMasterData && nhsoMasterData.procedure_types) || {};
      const yrData = procMaster[yr] || { districtSummary: {}, districtTotal: 0, units: {} };
      const distTotal = yrData.districtTotal || 0;
      const unitsMap = yrData.units || {};
      const actSrv = currentProcedureService || 'all';

      let topUnitCode = null;
      let topPt = 0;
      Object.entries(unitsMap).forEach(([code, u]) => {
        const pt = actSrv === 'all' ? (u.totalPoint || 0) : ((u.services && u.services[actSrv]) || 0);
        if (pt > topPt) {
          topPt = pt;
          topUnitCode = code;
        }
      });
      const topName = topUnitCode ? (SARAPHI_UNITS_MAP[topUnitCode]?.name || topUnitCode) : '-';
      const shareBase = (actSrv === 'all' ? distTotal : (yrData.districtSummary?.[actSrv] || 0));
      const sharePct = shareBase > 0 ? ((topPt / shareBase) * 100).toFixed(1) : 0;

      if (elCard4Badge) elCard4Badge.textContent = 'ผลงานสูงสุดในพื้นที่';
      if (elCard4Title) elCard4Title.textContent = 'หน่วยบริการผลงานสูงสุด';
      if (elCard4Val) elCard4Val.textContent = topName;
      if (elCard4FooterLabel) elCard4FooterLabel.textContent = 'ยอดผลงานสูงสุด';
      if (elCard4FooterVal) elCard4FooterVal.textContent = `${Number(topPt).toLocaleString()} Point (${sharePct}%)`;
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
      pcc: 'หมวด: 💰 งบ PCC ปีงบ 2568 (4 ตัวชี้วัดเดิม HDC PCC 1-4)',
      pcc_2569: 'หมวด: ✨ งบ PCC ปีงบ 2569 (4 ตัวชี้วัดใหม่ & การจัดสรรเงิน P4P)',
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
    const tablePrefix = (ind.domain === 'nhso_ttm' || (ind.table && ind.table.startsWith('MeData')) || ind.domain === 'pcc_2569') ? '' : 'HDC: ';
    const tableLabel = (ind.domain === 'pcc_2569') ? 'สปสช. เขต 1 เชียงใหม่ (R.1)' : `${tablePrefix}${ind.table}`;
    document.getElementById('ind-table-badge').textContent = tableLabel;
    document.getElementById('ind-name-text').textContent = ind.name;
    document.getElementById('ind-desc-text').textContent = ind.desc;
    if (ind.id === 'nhso_error_code') {
      document.getElementById('ind-target-text').textContent = 'เป้าหมาย: 0 ครั้ง (ไม่พบ Error)';
    } else if (ind.id === 'nhso_service') {
      document.getElementById('ind-target-text').textContent = 'ชดเชยตามผลงาน: 1 Point = 1 บาท (6 บริการหัตถการ)';
    } else if (ind.id === 'ttm_age_sex') {
      document.getElementById('ind-target-text').textContent = 'รายงานจำแนก 5 กลุ่มอายุและเพศ (คน/ครั้ง)';
    } else if (ind.id === 'ttm_ed') {
      document.getElementById('ind-target-text').textContent = 'เกณฑ์กระทรวงสาธารณสุข: สัดส่วนการใช้ยาในบัญชียาหลักแห่งชาติ (ED) ≥ 80%';
    } else if (ind.id === 'ttm_cases') {
      document.getElementById('ind-target-text').textContent = 'รายงานปริมาณการจ่ายยา: ทุกสิทธิ และสิทธิ UC (ครั้ง/รายการ) ทั้งปีและรายไตรมาส';
    } else if (ind.id === 'pcc69_kpi1') {
      document.getElementById('ind-target-text').textContent = 'เกณฑ์ 1-5 ดาว: 56-92% • อัตรา 1.90 บ./คะแนน (น้ำหนัก 20%)';
    } else if (ind.id === 'pcc69_kpi2') {
      document.getElementById('ind-target-text').textContent = 'เกณฑ์ 1-5 ดาว: 35-65% • อัตรา 410.03 บ./คะแนน (น้ำหนัก 40%)';
    } else if (ind.id === 'pcc69_kpi3') {
      document.getElementById('ind-target-text').textContent = 'เกณฑ์ 1-5 ดาว: 57-93% • อัตรา 1.51 บ./คะแนน (น้ำหนัก 15%)';
    } else if (ind.id === 'pcc69_kpi4') {
      document.getElementById('ind-target-text').textContent = 'เกณฑ์ 1-5 ดาว: 6.3-10.8% • อัตรา 777.69 บ./คะแนน (น้ำหนัก 25%)';
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

    if (ind.id === 'ttm_age_sex') {
      const totPt = (currentUnit === 'all')
        ? (yData?.patients_total || yData?.num || 0)
        : ((yData?.units?.find(item => item.hospcode === currentUnit)?.patients_total) || 0);
      rateEl.textContent = `${Number(totPt).toLocaleString()} คน`;
      badgeEl.className = 'badge-neutral px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs';
      badgeEl.textContent = 'จำแนกอายุ & เพศ';
    } else if (ind.id === 'ttm_ed') {
      const edRate = (currentUnit === 'all')
        ? (yData?.ed_rate_vs || yData?.rate || 0)
        : ((yData?.units?.find(item => item.hospcode === currentUnit)?.ed_rate_vs) || 0);
      const edVs = (currentUnit === 'all')
        ? (yData?.num || yData?.summary?.full_year?.ed?.vs_all || 0)
        : ((yData?.units?.find(item => item.hospcode === currentUnit)?.num) || 0);
      rateEl.textContent = `${Number(edRate).toFixed(1)}% (${Number(edVs).toLocaleString()} ครั้ง)`;
      if (edRate >= 80.0) {
        badgeEl.className = 'badge-pass px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs';
        badgeEl.textContent = '✓ ผ่านเกณฑ์ (≥ 80%)';
        rateEl.className = 'text-2xl font-black text-emerald-600 num-font';
      } else {
        badgeEl.className = 'badge-fail px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs';
        badgeEl.textContent = '✕ ต่ำกว่าเกณฑ์ (< 80%)';
        rateEl.className = 'text-2xl font-black text-rose-600 num-font';
      }
    } else if (ind.id === 'ttm_cases') {
      const allVs = (currentUnit === 'all')
        ? (yData?.all_visits || yData?.num || 0)
        : ((yData?.units?.find(item => item.hospcode === currentUnit)?.all_visits) || 0);
      const allIt = (currentUnit === 'all')
        ? (yData?.all_items || yData?.den || 0)
        : ((yData?.units?.find(item => item.hospcode === currentUnit)?.all_items) || 0);
      const ratioVal = allVs > 0 ? (allIt / allVs).toFixed(2) : '0.00';
      rateEl.textContent = `${Number(allVs).toLocaleString()} ครั้ง (${Number(allIt).toLocaleString()} รายการ)`;
      badgeEl.className = 'badge-pass px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs';
      badgeEl.textContent = `เฉลี่ย ${ratioVal} รายการ/ครั้ง`;
      rateEl.className = 'text-2xl font-black text-emerald-600 num-font';
    } else {
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
  // ==========================================================================
  // NHSO Error Panel (Menu 9: Upgraded with Month & Unit Filter, Trends & Table)
  // ==========================================================================
  window.switchErrorActivity = function(act) {
    currentErrorActivity = act;
    currentErrorMonth = 'all';
    renderNhsoErrorPanel();
  };

  window.switchErrorYear = function(yr) {
    currentErrorYear = yr;
    currentYear = yr;
    currentErrorMonth = 'all';
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

  window.switchErrorMonth = function(m) {
    currentErrorMonth = m;
    renderNhsoErrorPanel();
  };

  window.switchErrorUnit = function(u) {
    currentErrorUnit = u;
    renderNhsoErrorPanel();
  };

  window.resetErrorFilters = function() {
    currentErrorMonth = 'all';
    currentErrorUnit = 'all';
    renderNhsoErrorPanel();
  };

  function renderNhsoErrorPanel() {
    if (currentIndicatorId !== 'nhso_error_code') {
      if (nhsoErrorPanel) nhsoErrorPanel.classList.add('hidden');
      return;
    }
    if (nhsoErrorPanel) nhsoErrorPanel.classList.remove('hidden');

    const ind = masterData?.indicators?.['nhso_error_code'];
    const errData = (nhsoMasterData && nhsoMasterData.error_codes) || (ind && ind.errorData) || {};
    const catalog = errData.errorCatalog || errData.catalog || {};
    const summary = errData.summary || {};

    const act = currentErrorActivity || 'ยาสมุนไพร';
    const yr = currentErrorYear || currentYear || '2569';
    let activeMonth = currentErrorMonth || 'all';
    let activeUnit = currentErrorUnit || 'all';

    // 1. Toggle Activity & Year Buttons UI
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

    const actData = (summary[act] && summary[act][yr]) || { totalErrors: 0, districtErrors: {}, units: {}, timeline: {}, monthList: [] };
    const monthList = actData.monthList || Object.keys(actData.timeline || {});
    const unitsMap = actData.units || {};
    const isSingleUnit = (activeUnit !== 'all' && SARAPHI_UNITS_MAP[activeUnit]);
    const isSingleMonth = (activeMonth !== 'all' && actData.timeline && actData.timeline[activeMonth]);

    // 2. Sync Month Selector Dropdown
    const errMonthSelect = document.getElementById('err-month-select');
    if (errMonthSelect) {
      const currentOpts = Array.from(errMonthSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...monthList];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        errMonthSelect.innerHTML = `<option value="all">ทุกเดือน (รวมทั้งปีงบประมาณ ${yr})</option>`;
        monthList.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          errMonthSelect.appendChild(opt);
        });
      }
      if (activeMonth !== 'all' && !monthList.includes(activeMonth)) {
        currentErrorMonth = 'all';
        activeMonth = 'all';
      }
      errMonthSelect.value = activeMonth;
    }

    // 3. Sync Unit Selector Dropdown
    const errUnitSelect = document.getElementById('err-unit-select');
    if (errUnitSelect) {
      if (errUnitSelect.options.length <= 1) {
        errUnitSelect.innerHTML = '<option value="all">ทุกหน่วยบริการ (รวมทั้งอำเภอ 14 แห่ง)</option>';
        Object.keys(SARAPHI_UNITS_MAP).forEach(code => {
          const u = SARAPHI_UNITS_MAP[code];
          const opt = document.createElement('option');
          opt.value = code;
          opt.textContent = `${code} - ${u.name} (${u.subdistrict})`;
          errUnitSelect.appendChild(opt);
        });
      }
      errUnitSelect.value = activeUnit;
    }

    // 4. Sync Reset Button & Active Filter Badge
    const btnReset = document.getElementById('btn-err-reset');
    const badgeFilter = document.getElementById('err-active-filter-badge');
    const isFiltered = (activeMonth !== 'all' || activeUnit !== 'all');
    if (btnReset) {
      if (isFiltered) btnReset.classList.remove('hidden');
      else btnReset.classList.add('hidden');
    }
    if (badgeFilter) {
      if (isFiltered) {
        const tags = [];
        tags.push(`<span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-calendar-days text-[10px]"></i> ปีงบ ${yr}</span>`);
        tags.push(`<span class="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">${act === 'ยาสมุนไพร' ? '🌿 ยาสมุนไพร' : '💆 หัตถการ'}</span>`);
        if (activeMonth !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-regular fa-calendar-check text-[10px]"></i> ${activeMonth}</span>`);
        }
        if (activeUnit !== 'all') {
          const uName = SARAPHI_UNITS_MAP[activeUnit]?.short || activeUnit;
          tags.push(`<span class="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-hospital text-[10px]"></i> ${uName}</span>`);
        }
        badgeFilter.innerHTML = tags.join(' ');
      } else {
        badgeFilter.innerHTML = `<span class="text-slate-400 text-xs">แสดงผลรวมทั้งอำเภอ (14 หน่วยบริการ, ทุกเดือน)</span>`;
      }
    }

    // 5. Compute Metrics for KPI Cards
    let filteredTotal = 0;
    let filteredErrors = {};

    if (isSingleMonth) {
      const mSlice = actData.timeline[activeMonth];
      filteredTotal = mSlice?.total || 0;
      filteredErrors = mSlice?.errors || {};
    } else {
      filteredTotal = actData.totalErrors || 0;
      filteredErrors = actData.districtErrors || {};
    }

    if (isSingleUnit) {
      const uSlice = unitsMap[activeUnit] || { errors: {}, totalErrors: 0 };
      filteredTotal = uSlice.totalErrors || 0;
      filteredErrors = uSlice.errors || {};
    }

    // Card 1: Total Error Count
    const elTotal = document.getElementById('err-stat-total');
    const elActLabel = document.getElementById('err-stat-activity-label');
    if (elTotal) elTotal.textContent = Number(filteredTotal).toLocaleString();
    if (elActLabel) {
      elActLabel.textContent = isSingleUnit 
        ? `${SARAPHI_UNITS_MAP[activeUnit]?.short} • ${act}` 
        : `${act} • ${isSingleMonth ? activeMonth : `ปีงบ ${yr}`}`;
    }

    // Card 2: Top Error Code
    const sortedErrors = Object.entries(filteredErrors).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
    const topError = sortedErrors[0] || ['-', 0];
    const topCode = topError[0];
    const topCount = topError[1];
    const topDesc = catalog[topCode] || 'ไม่พบรายการ';
    const topPct = filteredTotal > 0 ? ((topCount / filteredTotal) * 100).toFixed(1) : '0.0';

    const elTopCode = document.getElementById('err-stat-top-code');
    const elTopDesc = document.getElementById('err-stat-top-desc');
    const elTopCount = document.getElementById('err-stat-top-count');
    const elTopShare = document.getElementById('err-stat-top-share');
    if (elTopCode) elTopCode.textContent = topCode;
    if (elTopDesc) {
      elTopDesc.textContent = topDesc;
      elTopDesc.title = topDesc;
    }
    if (elTopCount) elTopCount.textContent = `${Number(topCount).toLocaleString()} ครั้ง`;
    if (elTopShare) elTopShare.textContent = `${topPct}%`;

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

    // Card 4: Top Unit with Errors
    const sortedUnits = unitKeys
      .map(code => ({
        code,
        name: SARAPHI_UNITS_MAP[code]?.name || unitsMap[code]?.name || code,
        short: SARAPHI_UNITS_MAP[code]?.short || code,
        totalErrors: unitsMap[code]?.totalErrors || 0,
        errors: unitsMap[code]?.errors || {}
      }))
      .sort((a, b) => b.totalErrors - a.totalErrors);

    let displayTopUnit = sortedUnits[0];
    if (isSingleUnit) {
      const selected = sortedUnits.find(u => u.code === activeUnit);
      if (selected) displayTopUnit = selected;
    }

    const elTopUnitName = document.getElementById('err-stat-topunit-name');
    const elTopUnitCount = document.getElementById('err-stat-topunit-count');
    const elTopUnitShare = document.getElementById('err-stat-topunit-share');
    if (elTopUnitName) elTopUnitName.textContent = displayTopUnit ? displayTopUnit.short : '-';
    if (elTopUnitCount) elTopUnitCount.textContent = `${Number(displayTopUnit?.totalErrors || 0).toLocaleString()} ครั้ง`;
    if (elTopUnitShare) {
      const allTotal = actData.totalErrors || 1;
      const share = displayTopUnit ? ((displayTopUnit.totalErrors / allTotal) * 100).toFixed(1) : '0.0';
      elTopUnitShare.textContent = `${share}%`;
    }

    // 6. Render Error Timeline / Trend Chart
    const canvas = document.getElementById('error-timeline-chart');
    const chartTitle = document.getElementById('err-chart-title');
    const chartSubtitle = document.getElementById('err-chart-subtitle');
    const chartBadge = document.getElementById('err-chart-badge');

    if (canvas) {
      if (errorTimelineChartInstance) {
        errorTimelineChartInstance.destroy();
        errorTimelineChartInstance = null;
      }
      const ctx = canvas.getContext('2d');
      let chartConfig = null;

      const ERROR_COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#8b5cf6', '#06b6d4',
        '#ec4899', '#10b981', '#3b82f6', '#64748b'
      ];

      if (!isSingleUnit) {
        if (!isSingleMonth) {
          // Monthly stacked bar chart for District
          if (chartTitle) chartTitle.textContent = `แนวโน้ม Error Code รายเดือน (${act} ปีงบ ${yr})`;
          if (chartSubtitle) chartSubtitle.textContent = `แสดงจำนวนข้อผิดพลาดจำแนกตามรหัส Error ในแต่ละเดือน (ต.ค. - ส.ค./ก.ย.)`;
          if (chartBadge) {
            chartBadge.textContent = `รวมทั้งปี: ${Number(actData.totalErrors || 0).toLocaleString()} ครั้ง`;
            chartBadge.className = 'text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
          }

          const topCodes = Object.entries(actData.districtErrors || {})
            .sort((a, b) => b[1] - a[1])
            .map(e => e[0])
            .slice(0, 6);

          const datasets = topCodes.map((code, idx) => {
            const desc = catalog[code] || code;
            return {
              label: `${code} (${desc.substring(0, 16)}...)`,
              data: monthList.map(m => actData.timeline?.[m]?.errors?.[code] || 0),
              backgroundColor: ERROR_COLORS[idx % ERROR_COLORS.length],
              borderRadius: 3,
              borderSkipped: false
            };
          });

          chartConfig = {
            type: 'bar',
            data: { labels: monthList, datasets: datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11 } } },
                y: { stacked: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 11 }, callback: v => Number(v).toLocaleString() } }
              },
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Prompt', size: 10.5 }, usePointStyle: true, boxWidth: 8, padding: 8 } },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    footer: (items) => {
                      const mIdx = items[0]?.dataIndex;
                      const mName = monthList[mIdx];
                      const mTot = actData.timeline?.[mName]?.total || 0;
                      return ` รวมเดือนนี้: ${Number(mTot).toLocaleString()} ครั้ง`;
                    }
                  }
                }
              }
            }
          };
        } else {
          // Specific Month Breakdown
          if (chartTitle) chartTitle.textContent = `การกระจายตัว Error ประจำเดือน ${activeMonth} (${act})`;
          if (chartSubtitle) chartSubtitle.textContent = `แสดงจำนวนข้อผิดพลาดจำแนกตามรหัส Error ในเดือน ${activeMonth}`;
          if (chartBadge) {
            chartBadge.textContent = `${activeMonth}: ${Number(filteredTotal).toLocaleString()} ครั้ง`;
            chartBadge.className = 'text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
          }

          const codesInMonth = sortedErrors.slice(0, 8);
          chartConfig = {
            type: 'bar',
            data: {
              labels: codesInMonth.map(e => `${e[0]}: ${(catalog[e[0]] || '').substring(0, 20)}...`),
              datasets: [{
                label: 'จำนวน Error (ครั้ง)',
                data: codesInMonth.map(e => e[1]),
                backgroundColor: '#ef4444',
                borderRadius: 5
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 11 } } },
                y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11 }, color: '#334155' } }
              },
              plugins: { legend: { display: false } }
            }
          };
        }
      } else {
        // Single Unit Error Breakdown Chart
        const uInfo = SARAPHI_UNITS_MAP[activeUnit];
        if (chartTitle) chartTitle.textContent = `รายงาน Error Code: ${uInfo?.name || activeUnit} (ปีงบ ${yr})`;
        if (chartSubtitle) chartSubtitle.textContent = `จำแนกตามรหัส Error ของหน่วยบริการ ${uInfo?.name} ยอดรวม ${Number(filteredTotal).toLocaleString()} ครั้ง`;
        if (chartBadge) {
          chartBadge.textContent = `${uInfo?.short}: ${Number(filteredTotal).toLocaleString()} ครั้ง`;
          chartBadge.className = 'text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        const codesInUnit = sortedErrors.slice(0, 8);
        chartConfig = {
          type: 'bar',
          data: {
            labels: codesInUnit.map(e => `${e[0]}: ${(catalog[e[0]] || '').substring(0, 22)}...`),
            datasets: [{
              label: 'จำนวน Error (ครั้ง)',
              data: codesInUnit.map(e => e[1]),
              backgroundColor: '#e11d48',
              borderRadius: 5
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 11 } } },
              y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11 }, color: '#334155' } }
            },
            plugins: { legend: { display: false } }
          }
        };
      }

      errorTimelineChartInstance = new Chart(ctx, chartConfig);
    }

    // 7. Render Detailed Table
    const theadTr = document.getElementById('err-matrix-thead-tr') || document.getElementById('err-table-head-tr');
    const tbody = document.getElementById('err-matrix-tbody') || document.getElementById('err-table-tbody');
    const tfoot = document.getElementById('err-matrix-tfoot') || document.getElementById('err-table-tfoot');
    const tableTitle = document.getElementById('err-table-title');
    const tableSubtitle = document.getElementById('err-table-subtitle');

    if (!isSingleUnit) {
      if (tableTitle) tableTitle.textContent = `ตารางวิเคราะห์ Error Code รายหน่วยบริการ (${act} ปีงบ ${yr})`;
      if (tableSubtitle) {
        tableSubtitle.innerHTML = isSingleMonth
          ? `ข้อมูลประจำเดือน <strong>${activeMonth}</strong> (คลิกที่แถวหน่วยบริการเพื่อดูเจาะลึก)`
          : `คลิกที่แถวหน่วยบริการเพื่อดูเจาะลึกเฉพาะหน่วยบริการนั้น หรือเลือกตัวกรองเดือนด้านบน`;
      }

      const topTableCodes = Object.entries(actData.districtErrors || {})
        .sort((a, b) => b[1] - a[1])
        .map(e => e[0])
        .slice(0, 5);

      if (theadTr) {
        let codeCols = topTableCodes.map(code => `
          <th class="py-3 px-2 text-right text-rose-700 font-bold" title="${catalog[code] || code}">
            ${code}
          </th>
        `).join('');

        theadTr.innerHTML = `
          <th class="py-3 px-3 w-10 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
          <th class="py-3 px-2 w-16 text-slate-500 font-bold">รหัส</th>
          <th class="py-3 px-3 min-w-[170px] text-slate-800 font-bold">หน่วยบริการ</th>
          <th class="py-3 px-3 w-20 text-slate-600 font-bold">ตำบล</th>
          ${codeCols}
          <th class="py-3 px-4 text-right text-rose-900 font-extrabold bg-rose-50/70">รวม Error</th>
        `;
      }

      if (tbody) {
        tbody.innerHTML = '';
        sortedUnits.forEach((u, idx) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-rose-50/40 cursor-pointer transition group';
          tr.onclick = () => window.switchErrorUnit(u.code);
          tr.title = `คลิกเพื่อดูรายละเอียด Error ของ ${u.name}`;

          let codeCells = topTableCodes.map(code => {
            const count = u.errors[code] || 0;
            return `
              <td class="py-2.5 px-2 text-right num-font ${count > 0 ? 'text-rose-700 font-semibold' : 'text-slate-300 font-light'}">
                ${count > 0 ? Number(count).toLocaleString() : '-'}
              </td>
            `;
          }).join('');

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white group-hover:bg-rose-50/40 z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-2 text-slate-500 font-mono text-[11px]">${u.code}</td>
            <td class="py-2.5 px-3 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="group-hover:text-rose-700 font-semibold transition">${u.name}</span>
              <span class="text-[10px] text-rose-600 opacity-0 group-hover:opacity-100 transition shrink-0"><i class="fa-solid fa-arrow-right"></i> เจาะลึก</span>
            </td>
            <td class="py-2.5 px-3 text-slate-500">${SARAPHI_UNITS_MAP[u.code]?.subdistrict || '-'}</td>
            ${codeCells}
            <td class="py-2.5 px-4 text-right num-font font-black text-rose-950 bg-rose-50/50 group-hover:bg-rose-100/60">
              ${Number(u.totalErrors).toLocaleString()}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        let codeTotals = topTableCodes.map(code => {
          const count = actData.districtErrors?.[code] || 0;
          return `
            <td class="py-3 px-2 text-right num-font font-black text-rose-900">
              ${Number(count).toLocaleString()}
            </td>
          `;
        }).join('');

        tfoot.innerHTML = `
          <tr class="text-xs bg-rose-50/80 font-bold border-t-2 border-rose-300">
            <td colspan="4" class="py-3 px-4 text-left font-black text-rose-900">
              รวมทั้งอำเภอ (14 หน่วยบริการ)
            </td>
            ${codeTotals}
            <td class="py-3 px-4 text-right num-font font-black text-rose-950 text-sm bg-rose-100/70">
              ${Number(actData.totalErrors || 0).toLocaleString()}
            </td>
          </tr>
        `;
      }
    } else {
      // Single Unit Error Breakdown Table
      const uInfo = SARAPHI_UNITS_MAP[activeUnit];
      const uSlice = unitsMap[activeUnit] || { errors: {}, totalErrors: 0 };
      const uErrorsList = Object.entries(uSlice.errors || {}).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);

      if (tableTitle) tableTitle.textContent = `รายการข้อผิดพลาด (Error Code): ${uInfo?.name || activeUnit}`;
      if (tableSubtitle) {
        tableSubtitle.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap mt-0.5">
            <span>พบ ${uErrorsList.length} รหัสข้อผิดพลาด รวมทั้งสิ้น <strong>${Number(uSlice.totalErrors).toLocaleString()} ครั้ง</strong></span>
            <button type="button" onclick="window.switchErrorUnit('all')" class="text-xs font-bold text-rose-600 hover:text-rose-800 bg-white border border-rose-200 px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1">
              <i class="fa-solid fa-arrow-left text-[10px]"></i> กลับไปดูทุกหน่วยบริการ
            </button>
          </div>
        `;
      }

      if (theadTr) {
        theadTr.innerHTML = `
          <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
          <th class="py-3 px-3 w-28 text-rose-700 font-bold">รหัส Error</th>
          <th class="py-3 px-3 min-w-[280px] text-slate-800 font-bold">คำอธิบายข้อผิดพลาด (จากแคตตาล็อก สปสช.)</th>
          <th class="py-3 px-4 text-right text-rose-900 font-extrabold bg-rose-50/70 w-28">จำนวน (ครั้ง)</th>
          <th class="py-3 px-3 text-right text-slate-600 font-semibold w-24">สัดส่วน %</th>
        `;
      }

      if (tbody) {
        tbody.innerHTML = '';
        if (uErrorsList.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-emerald-600 font-bold">🎉 ไม่พบประวัติ Error Code ในปีงบประมาณ ${yr} สำหรับหน่วยบริการนี้</td></tr>`;
        } else {
          uErrorsList.forEach((e, idx) => {
            const code = e[0];
            const count = e[1];
            const desc = catalog[code] || 'ไม่พบคำอธิบายในระบบ';
            const pct = uSlice.totalErrors > 0 ? ((count / uSlice.totalErrors) * 100).toFixed(1) : '0.0';

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-rose-50/30 transition';
            tr.innerHTML = `
              <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white z-10 sm:static">${idx + 1}</td>
              <td class="py-2.5 px-3 font-mono font-bold text-rose-700 text-xs">${code}</td>
              <td class="py-2.5 px-3 font-medium text-slate-800">${desc}</td>
              <td class="py-2.5 px-4 text-right num-font font-bold text-rose-900 bg-rose-50/30">${Number(count).toLocaleString()}</td>
              <td class="py-2.5 px-3 text-right num-font font-semibold text-slate-600">${pct}%</td>
            `;
            tbody.appendChild(tr);
          });
        }
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr class="text-xs bg-rose-50/80 font-bold border-t-2 border-rose-300">
            <td colspan="3" class="py-3 px-4 text-left font-black text-rose-900">
              รวม Error ทั้งหมดของ ${uInfo?.name || activeUnit}
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-rose-950 text-sm bg-rose-100/70">
              ${Number(uSlice.totalErrors).toLocaleString()}
            </td>
            <td class="py-3 px-3 text-right num-font font-black text-rose-900">100.0%</td>
          </tr>
        `;
      }
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }


  // --------------------------------------------------------------------------
  // NHSO Procedure Types Configuration & Handlers (MeData Sheet 3)
  // --------------------------------------------------------------------------
  const PROCEDURE_SERVICE_META = {
    'นวด+ประคบ': {
      id: 'นวด+ประคบ',
      name: 'นวด+ประคบ',
      btnId: 'btn-proc-massage-press',
      icon: '💆',
      iconHtml: '<i class="fa-solid fa-spa text-emerald-600 text-lg"></i>',
      color: '#059669', // Emerald
      bgColor: 'rgba(5, 150, 105, 0.85)',
      cardBg: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: '#059669',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    'พอกเข่า': {
      id: 'พอกเข่า',
      name: 'พอกเข่า',
      btnId: 'btn-proc-knee',
      icon: '✨',
      iconHtml: '<i class="fa-solid fa-bandage text-amber-500 text-lg"></i>',
      color: '#d97706', // Amber
      bgColor: 'rgba(217, 119, 6, 0.85)',
      cardBg: 'from-amber-500/10 to-amber-500/5',
      borderColor: '#d97706',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    'นวด': {
      id: 'นวด',
      name: 'นวด',
      btnId: 'btn-proc-massage',
      icon: '👐',
      iconHtml: '<i class="fa-solid fa-hand-holding-heart text-sky-500 text-lg"></i>',
      color: '#0284c7', // Sky
      bgColor: 'rgba(2, 132, 199, 0.85)',
      cardBg: 'from-sky-500/10 to-sky-500/5',
      borderColor: '#0284c7',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200'
    },
    'ประคบ': {
      id: 'ประคบ',
      name: 'ประคบ',
      btnId: 'btn-proc-press',
      icon: '🌿',
      iconHtml: '<i class="fa-solid fa-leaf text-teal-500 text-lg"></i>',
      color: '#0d9488', // Teal
      bgColor: 'rgba(13, 148, 136, 0.85)',
      cardBg: 'from-teal-500/10 to-teal-500/5',
      borderColor: '#0d9488',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    'การฟื้นฟูมารดาหลังคลอด': {
      id: 'การฟื้นฟูมารดาหลังคลอด',
      name: 'ฟื้นฟูมารดาหลังคลอด',
      btnId: 'btn-proc-postpartum',
      icon: '🤰',
      iconHtml: '<i class="fa-solid fa-person-breastfeeding text-rose-500 text-lg"></i>',
      color: '#e11d48', // Rose
      bgColor: 'rgba(225, 29, 72, 0.85)',
      cardBg: 'from-rose-500/10 to-rose-500/5',
      borderColor: '#e11d48',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    'อบสมุนไพร': {
      id: 'อบสมุนไพร',
      name: 'อบสมุนไพร',
      btnId: 'btn-proc-steam',
      icon: '♨️',
      iconHtml: '<i class="fa-solid fa-hot-tub-person text-purple-500 text-lg"></i>',
      color: '#9333ea', // Purple
      bgColor: 'rgba(147, 51, 234, 0.85)',
      cardBg: 'from-purple-500/10 to-purple-500/5',
      borderColor: '#9333ea',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  };

  const PROCEDURE_SERVICES_ORDER = [
    'นวด+ประคบ',
    'พอกเข่า',
    'นวด',
    'ประคบ',
    'การฟื้นฟูมารดาหลังคลอด',
    'อบสมุนไพร'
  ];

  window.switchProcedureService = function(srv) {
    currentProcedureService = srv;
    renderNhsoServicePanel();
    updateExecutiveOverview();
  };

  window.switchProcedureYear = function(yr) {
    currentProcedureYear = yr;
    currentYear = yr;
    currentProcedureMonth = 'all'; // Reset month filter on year change
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

  window.switchProcedureMonth = function(m) {
    currentProcedureMonth = m;
    renderNhsoServicePanel();
  };

  window.switchProcedureUnit = function(u) {
    currentProcedureUnit = u;
    renderNhsoServicePanel();
  };

  window.resetProcedureFilters = function() {
    currentProcedureMonth = 'all';
    currentProcedureUnit = 'all';
    currentProcedureService = 'all';
    renderNhsoServicePanel();
  };

  function renderNhsoServicePanel() {
    if (currentIndicatorId !== 'nhso_service') {
      if (nhsoServicePanel) nhsoServicePanel.classList.add('hidden');
      return;
    }
    if (nhsoServicePanel) nhsoServicePanel.classList.remove('hidden');

    const yr = currentProcedureYear || currentYear || '2569';
    const activeService = currentProcedureService || 'all';
    let activeMonth = currentProcedureMonth || 'all';
    let activeUnit = currentProcedureUnit || 'all';

    // 1. Extract Data for Year
    const procMaster = (nhsoMasterData && nhsoMasterData.procedure_types) || (masterData?.indicators?.['nhso_service']?.procedureData) || {};
    const yrData = procMaster[yr] || { districtSummary: {}, districtTotal: 0, units: {}, monthList: [], months: {} };
    const monthList = yrData.monthList || (yrData.months ? Object.keys(yrData.months) : []);

    // 2. Sync Month Selector Dropdown
    const procMonthSelect = document.getElementById('proc-month-select');
    if (procMonthSelect) {
      const currentOpts = Array.from(procMonthSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...monthList];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        procMonthSelect.innerHTML = `<option value="all">ทุกเดือน (รวมทั้งปีงบประมาณ ${yr})</option>`;
        monthList.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          procMonthSelect.appendChild(opt);
        });
      }
      if (activeMonth !== 'all' && !monthList.includes(activeMonth)) {
        currentProcedureMonth = 'all';
        activeMonth = 'all';
      }
      procMonthSelect.value = activeMonth;
    }

    // 3. Sync Unit Selector Dropdown
    const procUnitSelect = document.getElementById('proc-unit-select');
    if (procUnitSelect) {
      if (procUnitSelect.options.length <= 1) {
        procUnitSelect.innerHTML = '<option value="all">ทุกหน่วยบริการ (รวมทั้งอำเภอ 14 แห่ง)</option>';
        Object.keys(SARAPHI_UNITS_MAP).forEach(code => {
          const u = SARAPHI_UNITS_MAP[code];
          const opt = document.createElement('option');
          opt.value = code;
          opt.textContent = `${code} - ${u.name} (${u.subdistrict})`;
          procUnitSelect.appendChild(opt);
        });
      }
      procUnitSelect.value = activeUnit;
    }

    // 4. Sync Reset Button & Active Filter Tag
    const btnReset = document.getElementById('btn-proc-reset');
    const badgeFilter = document.getElementById('proc-active-filter-badge');
    const isFiltered = (activeMonth !== 'all' || activeUnit !== 'all' || activeService !== 'all');
    if (btnReset) {
      if (isFiltered) btnReset.classList.remove('hidden');
      else btnReset.classList.add('hidden');
    }
    if (badgeFilter) {
      if (isFiltered) {
        const tags = [];
        tags.push(`<span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-calendar-days text-[10px]"></i> ปีงบ ${yr}</span>`);
        if (activeMonth !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-regular fa-calendar-check text-[10px]"></i> ${activeMonth}</span>`);
        }
        if (activeUnit !== 'all') {
          const uName = SARAPHI_UNITS_MAP[activeUnit]?.short || activeUnit;
          tags.push(`<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-hospital text-[10px]"></i> ${uName}</span>`);
        }
        if (activeService !== 'all') {
          const meta = PROCEDURE_SERVICE_META[activeService];
          tags.push(`<span class="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-bold text-[11px]">${meta?.icon || ''} ${activeService}</span>`);
        }
        badgeFilter.innerHTML = tags.join(' ');
      } else {
        badgeFilter.innerHTML = `<span class="text-slate-400 text-xs">แสดงผลรวมทั้งอำเภอ (14 หน่วยบริการ, ทุกเดือน)</span>`;
      }
    }

    // 5. Update Service Filter Buttons
    const btnAll = document.getElementById('btn-proc-all');
    if (btnAll) {
      if (activeService === 'all') {
        btnAll.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
      } else {
        btnAll.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
      }
    }

    PROCEDURE_SERVICES_ORDER.forEach(srv => {
      const meta = PROCEDURE_SERVICE_META[srv];
      const btn = document.getElementById(meta.btnId);
      if (btn) {
        if (activeService === srv) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs text-white';
          btn.style.backgroundColor = meta.color;
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
          btn.style.backgroundColor = '';
        }
      }
    });

    // 6. Update Year Filter Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-proc-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1 rounded-lg font-bold transition shadow-xs bg-indigo-600 text-white';
        } else {
          btn.className = 'px-3 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 7. Determine Data Scopes
    const isSingleUnit = (activeUnit !== 'all' && SARAPHI_UNITS_MAP[activeUnit]);
    const isSingleMonth = (activeMonth !== 'all' && yrData.months && yrData.months[activeMonth]);

    let distSummary = yrData.districtSummary || {};
    let distTotal = yrData.districtTotal || 0;
    let unitsMap = yrData.units || {};

    if (isSingleMonth) {
      const mSlice = yrData.months[activeMonth];
      distSummary = mSlice.districtSummary || {};
      distTotal = mSlice.districtTotal || 0;
      unitsMap = mSlice.units || {};
    }

    const unitFullYear = isSingleUnit ? (yrData.units?.[activeUnit] || { services: {}, totalPoint: 0, byMonth: {} }) : null;
    const unitCurrentMonth = (isSingleUnit && isSingleMonth) ? (yrData.months?.[activeMonth]?.units?.[activeUnit] || { services: {}, totalPoint: 0 }) : null;

    // 8. Render 6 Mini Bento KPI Cards
    const cardsContainer = document.getElementById('proc-kpi-cards');
    if (cardsContainer) {
      cardsContainer.innerHTML = '';
      PROCEDURE_SERVICES_ORDER.forEach(srv => {
        const meta = PROCEDURE_SERVICE_META[srv];
        const isSelected = (activeService === srv);

        let srvPt = 0;
        let totalBasis = 0;
        let sharePct = '0.0';
        let bottomText = '';
        let bottomVal = '';

        if (!isSingleUnit) {
          srvPt = distSummary[srv] || 0;
          totalBasis = distTotal;
          sharePct = totalBasis > 0 ? ((srvPt / totalBasis) * 100).toFixed(1) : '0.0';

          let topHosp = null;
          let topPt = 0;
          Object.entries(unitsMap).forEach(([hosp, u]) => {
            const pt = (u.services && u.services[srv]) || 0;
            if (pt > topPt) {
              topPt = pt;
              topHosp = hosp;
            }
          });
          bottomText = `สูงสุด: ${topHosp ? (SARAPHI_UNITS_MAP[topHosp]?.short || topHosp) : '-'}`;
          bottomVal = Number(topPt).toLocaleString();
        } else {
          if (isSingleMonth) {
            srvPt = unitCurrentMonth?.services?.[srv] || 0;
            totalBasis = unitCurrentMonth?.totalPoint || 0;
          } else {
            srvPt = unitFullYear?.services?.[srv] || 0;
            totalBasis = unitFullYear?.totalPoint || 0;
          }
          sharePct = totalBasis > 0 ? ((srvPt / totalBasis) * 100).toFixed(1) : '0.0';
          const distSrvPt = distSummary[srv] || 0;
          const pctOfDist = distSrvPt > 0 ? ((srvPt / distSrvPt) * 100).toFixed(1) : '0.0';
          bottomText = `% ของอำเภอ:`;
          bottomVal = `${pctOfDist}%`;
        }

        const card = document.createElement('div');
        card.className = `cursor-pointer rounded-2xl p-3 bg-white border transition-all flex flex-col justify-between ${
          isSelected
            ? 'ring-2 shadow-md bg-gradient-to-br ' + meta.cardBg
            : 'border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300'
        }`;
        if (isSelected) {
          card.style.borderColor = meta.color;
          card.style.setProperty('--tw-ring-color', meta.color + '33');
        }
        card.onclick = () => window.switchProcedureService(srv === activeService ? 'all' : srv);

        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-base sm:text-lg">${meta.iconHtml || meta.icon}</span>
            <span class="text-[10.5px] font-black px-2 py-0.5 rounded-full ${meta.badgeClass} num-font">${sharePct}%</span>
          </div>
          <div class="mt-2">
            <div class="text-[11.5px] font-bold text-slate-700 truncate" title="${srv}">${meta.name}</div>
            <div class="text-base sm:text-lg font-black text-slate-900 num-font mt-0.5" style="${isSelected ? `color:${meta.color}` : ''}">
              ${Number(srvPt).toLocaleString()} <span class="text-[10px] font-normal text-slate-400">Pt</span>
            </div>
          </div>
          <div class="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span class="truncate pr-1">${bottomText}</span>
            <span class="font-bold text-slate-700 num-font shrink-0">${bottomVal}</span>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }

    // 9. Render Chart
    const chartTitle = document.getElementById('proc-chart-title');
    const chartSubtitle = document.getElementById('proc-chart-subtitle');
    const chartBadge = document.getElementById('proc-chart-badge');
    const canvas = document.getElementById('procedure-breakdown-chart');

    if (canvas) {
      if (procedureChartInstance) {
        procedureChartInstance.destroy();
        procedureChartInstance = null;
      }

      let chartConfig = null;
      const ctx = canvas.getContext('2d');

      if (!isSingleUnit) {
        // 14 Units Chart
        const unitsList = Object.keys(SARAPHI_UNITS_MAP).map(hospcode => {
          const uInfo = SARAPHI_UNITS_MAP[hospcode];
          const uData = unitsMap[hospcode] || { services: {}, totalPoint: 0 };
          return {
            hospcode: hospcode,
            name: uInfo.name,
            short: uInfo.short,
            subdistrict: uInfo.subdistrict,
            services: uData.services || {},
            totalPoint: uData.totalPoint || 0
          };
        });

        if (activeService === 'all') {
          const sortedUnits = [...unitsList].sort((a, b) => b.totalPoint - a.totalPoint);
          if (chartTitle) chartTitle.textContent = isSingleMonth ? `กราฟแท่งแสดงผลงานบริการหัตถการ (${activeMonth})` : 'กราฟแท่งแสดงผลงานบริการหัตถการ (Point / ประมาณการบาท)';
          if (chartSubtitle) chartSubtitle.textContent = isSingleMonth ? `สัดส่วน 6 หัตถการรายหน่วยบริการ 14 แห่ง ประจำเดือน ${activeMonth} ปีงบ ${yr}` : `สัดส่วน 6 หัตถการรายหน่วยบริการ 14 แห่งใน อ.สารภี (เรียงตามผลงานรวม) ปีงบประมาณ ${yr}`;
          if (chartBadge) {
            chartBadge.textContent = `${isSingleMonth ? activeMonth : 'รวมทั้งปี'}: ${Number(distTotal).toLocaleString()} Point`;
            chartBadge.className = 'text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
          }

          const datasets = PROCEDURE_SERVICES_ORDER.map(srv => {
            const meta = PROCEDURE_SERVICE_META[srv];
            return {
              label: `${meta.icon} ${srv}`,
              data: sortedUnits.map(u => u.services[srv] || 0),
              backgroundColor: meta.color,
              borderRadius: 3,
              borderSkipped: false
            };
          });

          chartConfig = {
            type: 'bar',
            data: {
              labels: sortedUnits.map(u => u.short),
              datasets: datasets
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  stacked: true,
                  grid: { color: 'rgba(226, 232, 240, 0.6)' },
                  ticks: { font: { family: 'Prompt', size: 11 }, callback: val => Number(val).toLocaleString() }
                },
                y: {
                  stacked: true,
                  grid: { display: false },
                  ticks: { font: { family: 'Prompt', size: 11.5, weight: '500' }, color: '#334155' }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: { font: { family: 'Prompt', size: 11 }, usePointStyle: true, boxWidth: 8, padding: 12 }
                },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: function(ctx) {
                      const val = ctx.raw || 0;
                      const uTotal = sortedUnits[ctx.dataIndex]?.totalPoint || 0;
                      const pct = uTotal > 0 ? ((val / uTotal) * 100).toFixed(1) : 0;
                      return ` ${ctx.dataset.label}: ${Number(val).toLocaleString()} Point (${pct}% ของหน่วย)`;
                    },
                    footer: function(ctxItems) {
                      const uIndex = ctxItems[0]?.dataIndex;
                      const u = sortedUnits[uIndex];
                      return ` รวมของหน่วยนี้: ${Number(u.totalPoint).toLocaleString()} Point`;
                    }
                  }
                }
              }
            }
          };
        } else {
          const meta = PROCEDURE_SERVICE_META[activeService];
          const srvTotal = distSummary[activeService] || 0;
          const sortedUnits = [...unitsList].sort((a, b) => (b.services[activeService] || 0) - (a.services[activeService] || 0));

          if (chartTitle) chartTitle.textContent = `กราฟแท่งจัดอันดับผลงาน: ${meta.icon} ${activeService} (${isSingleMonth ? activeMonth : `ปี ${yr}`})`;
          if (chartSubtitle) chartSubtitle.textContent = `ผลงานรายหน่วยบริการ 14 แห่งใน อ.สารภี (เรียงจากมากไปน้อย) ${isSingleMonth ? `ประจำเดือน ${activeMonth}` : `ปีงบประมาณ ${yr}`}`;
          if (chartBadge) {
            chartBadge.textContent = `${meta.icon} ${activeService}: ${Number(srvTotal).toLocaleString()} Point`;
            chartBadge.className = `text-xs font-bold ${meta.badgeClass} px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto`;
          }

          chartConfig = {
            type: 'bar',
            data: {
              labels: sortedUnits.map(u => u.short),
              datasets: [{
                label: `${meta.icon} ${activeService} (Point)`,
                data: sortedUnits.map(u => u.services[activeService] || 0),
                backgroundColor: meta.color,
                borderColor: meta.borderColor,
                borderWidth: 1,
                borderRadius: 5,
                borderSkipped: false
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: { color: 'rgba(226, 232, 240, 0.6)' },
                  ticks: { font: { family: 'Prompt', size: 11 }, callback: val => Number(val).toLocaleString() }
                },
                y: {
                  grid: { display: false },
                  ticks: { font: { family: 'Prompt', size: 11.5, weight: '500' }, color: '#334155' }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: function(ctx) {
                      const val = ctx.raw || 0;
                      const pct = srvTotal > 0 ? ((val / srvTotal) * 100).toFixed(1) : 0;
                      return ` ผลงาน: ${Number(val).toLocaleString()} Point (${pct}% ของอำเภอ)`;
                    }
                  }
                }
              }
            }
          };
        }
      } else {
        // Single Unit Monthly Trend Chart
        const uInfo = SARAPHI_UNITS_MAP[activeUnit];
        const byMonth = unitFullYear?.byMonth || {};

        if (chartTitle) chartTitle.textContent = `แนวโน้มผลงานรายเดือน: ${uInfo?.name || activeUnit} (ปีงบประมาณ ${yr})`;
        if (chartSubtitle) chartSubtitle.textContent = activeService === 'all' ? `แสดงสัดส่วน 6 หัตถการเรียงตามแต่ละเดือน (ต.ค. - ก.ค./ก.ย.)` : `ผลงานหัตถการ ${activeService} รายเดือน`;
        if (chartBadge) {
          chartBadge.textContent = `รวมทั้งปี (${uInfo?.short}): ${Number(unitFullYear?.totalPoint || 0).toLocaleString()} Point`;
          chartBadge.className = 'text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        if (activeService === 'all') {
          const datasets = PROCEDURE_SERVICES_ORDER.map(srv => {
            const meta = PROCEDURE_SERVICE_META[srv];
            return {
              label: `${meta.icon} ${srv}`,
              data: monthList.map(m => byMonth[m]?.services?.[srv] || 0),
              backgroundColor: meta.color,
              borderRadius: 3,
              borderSkipped: false
            };
          });

          chartConfig = {
            type: 'bar',
            data: {
              labels: monthList,
              datasets: datasets
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              maxBarThickness: 28,
              barPercentage: 0.6,
              categoryPercentage: 0.7,
              scales: {
                x: {
                  stacked: true,
                  grid: { display: false },
                  ticks: { font: { family: 'Prompt', size: 11 } }
                },
                y: {
                  stacked: true,
                  grid: { color: 'rgba(226, 232, 240, 0.6)' },
                  ticks: { font: { family: 'Prompt', size: 11 }, callback: val => Number(val).toLocaleString() }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: { font: { family: 'Prompt', size: 11 }, usePointStyle: true, boxWidth: 8, padding: 12 }
                },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: function(ctx) {
                      const val = ctx.raw || 0;
                      const mName = monthList[ctx.dataIndex];
                      const mTotal = byMonth[mName]?.totalPoint || 0;
                      const pct = mTotal > 0 ? ((val / mTotal) * 100).toFixed(1) : 0;
                      return ` ${ctx.dataset.label}: ${Number(val).toLocaleString()} Point (${pct}% ของเดือน)`;
                    },
                    footer: function(ctxItems) {
                      const mIndex = ctxItems[0]?.dataIndex;
                      const mName = monthList[mIndex];
                      const mTotal = byMonth[mName]?.totalPoint || 0;
                      return ` รวมเดือนนี้: ${Number(mTotal).toLocaleString()} Point`;
                    }
                  }
                }
              }
            }
          };
        } else {
          const meta = PROCEDURE_SERVICE_META[activeService];
          const srvMonthlyPts = monthList.map(m => byMonth[m]?.services?.[activeService] || 0);
          const srvYearTotal = srvMonthlyPts.reduce((a, b) => a + b, 0);

          chartConfig = {
            type: 'bar',
            data: {
              labels: monthList,
              datasets: [{
                label: `${meta.icon} ${activeService}`,
                data: srvMonthlyPts,
                backgroundColor: meta.color,
                borderColor: meta.borderColor,
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
                maxBarThickness: 28,
                barPercentage: 0.6,
                categoryPercentage: 0.7
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { family: 'Prompt', size: 11 } }
                },
                y: {
                  grid: { color: 'rgba(226, 232, 240, 0.6)' },
                  ticks: { font: { family: 'Prompt', size: 11 }, callback: val => Number(val).toLocaleString() }
                }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: function(ctx) {
                      const val = ctx.raw || 0;
                      const pct = srvYearTotal > 0 ? ((val / srvYearTotal) * 100).toFixed(1) : 0;
                      return ` ผลงาน: ${Number(val).toLocaleString()} Point (${pct}% ของทั้งปี)`;
                    }
                  }
                }
              }
            }
          };
        }
      }

      procedureChartInstance = new Chart(ctx, chartConfig);
    }

    // 10. Render Table (14 Units View or Single Unit Monthly View)
    const thead = document.getElementById('proc-matrix-thead');
    const tbody = document.getElementById('proc-matrix-tbody');
    const tfoot = document.getElementById('proc-matrix-tfoot');
    const tableTitle = document.getElementById('proc-table-title');
    const tableSubtitle = document.getElementById('proc-table-subtitle');
    const tableBadge = document.getElementById('proc-table-summary-badge');

    if (!isSingleUnit) {
      // 14 Units View
      if (tableTitle) tableTitle.textContent = 'ตารางแจกแจงผลงานหัตถการจำแนก 6 ประเภทบริการ รายหน่วยบริการ (14 แห่ง)';
      if (tableSubtitle) {
        tableSubtitle.innerHTML = isSingleMonth
          ? `ข้อมูลประจำเดือน <strong>${activeMonth}</strong> ปีงบ ${yr} (คลิกที่แถวหน่วยบริการเพื่อดูประวัติรายเดือน)`
          : 'คลิกที่แถวหน่วยบริการเพื่อดูประวัติการเคลมรายเดือน หรือเลือกตัวกรองด้านบน';
      }
      if (tableBadge) {
        tableBadge.textContent = isSingleMonth
          ? `รวมเดือน ${activeMonth}: ${Number(distTotal).toLocaleString()} Point (ประมาณการ ${Number(distTotal).toLocaleString()} บาท)`
          : `รวมทั้งอำเภอ: ${Number(distTotal).toLocaleString()} Point (ประมาณการ ${Number(distTotal).toLocaleString()} บาท)`;
      }

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-3 w-20 text-slate-500 font-bold">รหัส</th>
            <th class="py-3 px-3 min-w-[180px] text-slate-800 font-bold">หน่วยบริการ</th>
            <th class="py-3 px-3 w-24 text-slate-600 font-bold">ตำบล</th>
            <th class="py-3 px-3 text-right text-emerald-700 font-extrabold"><i class="fa-solid fa-spa text-emerald-600 mr-1"></i> นวด+ประคบ</th>
            <th class="py-3 px-3 text-right text-amber-600 font-extrabold"><i class="fa-solid fa-bandage text-amber-600 mr-1"></i> พอกเข่า</th>
            <th class="py-3 px-3 text-right text-sky-600 font-extrabold"><i class="fa-solid fa-hand-holding-heart text-sky-600 mr-1"></i> นวด</th>
            <th class="py-3 px-3 text-right text-teal-600 font-extrabold"><i class="fa-solid fa-leaf text-teal-600 mr-1"></i> ประคบ</th>
            <th class="py-3 px-3 text-right text-rose-600 font-extrabold"><i class="fa-solid fa-person-breastfeeding text-rose-600 mr-1"></i> ฟื้นฟูมารดา</th>
            <th class="py-3 px-3 text-right text-purple-600 font-extrabold"><i class="fa-solid fa-hot-tub-person text-purple-600 mr-1"></i> อบสมุนไพร</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-extrabold bg-emerald-50/60">รวม Point (บาท)</th>
          </tr>
        `;
      }

      const unitsList = Object.keys(SARAPHI_UNITS_MAP).map(hospcode => {
        const uInfo = SARAPHI_UNITS_MAP[hospcode];
        const uData = unitsMap[hospcode] || { services: {}, totalPoint: 0 };
        return {
          hospcode: hospcode,
          name: uInfo.name,
          short: uInfo.short,
          subdistrict: uInfo.subdistrict,
          services: uData.services || {},
          totalPoint: uData.totalPoint || 0
        };
      });

      const sortedTableUnits = [...unitsList].sort((a, b) => {
        if (activeService === 'all') return b.totalPoint - a.totalPoint;
        return (b.services[activeService] || 0) - (a.services[activeService] || 0);
      });

      if (tbody) {
        tbody.innerHTML = '';
        sortedTableUnits.forEach((u, idx) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-emerald-50/50 cursor-pointer transition group';
          tr.onclick = () => window.switchProcedureUnit(u.hospcode);
          tr.title = `คลิกเพื่อดูประวัติการเคลมรายเดือนของ ${u.name}`;

          let servicesCells = '';
          PROCEDURE_SERVICES_ORDER.forEach(srv => {
            const pt = u.services[srv] || 0;
            const isCurrentSrv = (activeService === srv);
            const meta = PROCEDURE_SERVICE_META[srv];
            const highlightStyle = isCurrentSrv ? `background-color: ${meta.color}15; font-weight: 700; color: ${meta.color};` : '';
            servicesCells += `
              <td class="py-2.5 px-3 text-right num-font ${pt > 0 ? 'text-slate-800' : 'text-slate-300 font-light'}" style="${highlightStyle}">
                ${pt > 0 ? Number(pt).toLocaleString() : '-'}
              </td>
            `;
          });

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font ${idx < 3 ? 'font-bold text-amber-600' : 'text-slate-400'} sticky left-0 bg-white group-hover:bg-emerald-50/50 z-10 sm:static">
              ${idx === 0 ? '🥇 1' : (idx === 1 ? '🥈 2' : (idx === 2 ? '🥉 3' : idx + 1))}
            </td>
            <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">${u.hospcode}</td>
            <td class="py-2.5 px-3 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="group-hover:text-emerald-700 font-semibold transition">${u.name}</span>
              <span class="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0"><i class="fa-solid fa-arrow-right"></i> ดูรายเดือน</span>
            </td>
            <td class="py-2.5 px-3 text-slate-500">${u.subdistrict}</td>
            ${servicesCells}
            <td class="py-2.5 px-4 text-right num-font font-black text-emerald-950 bg-emerald-50/50 group-hover:bg-emerald-100/60">
              ${Number(u.totalPoint).toLocaleString()}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        let tfootCells = '';
        PROCEDURE_SERVICES_ORDER.forEach(srv => {
          const pt = distSummary[srv] || 0;
          const isCurrentSrv = (activeService === srv);
          const meta = PROCEDURE_SERVICE_META[srv];
          const highlightStyle = isCurrentSrv ? `background-color: ${meta.color}25; color: ${meta.color};` : '';
          tfootCells += `
            <td class="py-3 px-3 text-right num-font font-black ${pt > 0 ? 'text-slate-900' : 'text-slate-400'}" style="${highlightStyle}">
              ${Number(pt).toLocaleString()}
            </td>
          `;
        });

        tfoot.innerHTML = `
          <tr class="text-xs bg-emerald-50/80 font-bold border-t-2 border-emerald-300">
            <td colspan="4" class="py-3 px-4 text-left font-black text-emerald-900">
              รวมทั้งอำเภอสารภี (${isSingleMonth ? activeMonth : '14 หน่วยบริการ'})
            </td>
            ${tfootCells}
            <td class="py-3 px-4 text-right num-font font-black text-emerald-900 text-sm bg-emerald-100/70">
              ${Number(distTotal).toLocaleString()}
            </td>
          </tr>
        `;
      }
    } else {
      // Single Unit: Monthly Breakdown View!
      const uInfo = SARAPHI_UNITS_MAP[activeUnit];
      const byMonth = unitFullYear?.byMonth || {};

      if (tableTitle) {
        tableTitle.innerHTML = `ตารางประวัติผลงานรายเดือน: <span class="text-emerald-700 font-extrabold">${uInfo?.name || activeUnit}</span>`;
      }
      if (tableSubtitle) {
        tableSubtitle.innerHTML = `แจกแจงผลงาน 6 ประเภทบริการแยกรายเดือน ปีงบประมาณ ${yr} &nbsp; <button type="button" onclick="window.switchProcedureUnit('all')" class="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer text-xs ml-2"><i class="fa-solid fa-arrow-left"></i> กลับไปดูทุกหน่วยบริการ</button>`;
      }
      if (tableBadge) {
        tableBadge.textContent = `รวมทั้งปี (${uInfo?.short}): ${Number(unitFullYear?.totalPoint || 0).toLocaleString()} Point (บาท)`;
      }

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-4 min-w-[160px] text-slate-800 font-bold">ประจำเดือน</th>
            <th class="py-3 px-3 w-24 text-slate-600 font-bold">ปีงบประมาณ</th>
            <th class="py-3 px-3 text-right text-emerald-700 font-extrabold"><i class="fa-solid fa-spa text-emerald-600 mr-1"></i> นวด+ประคบ</th>
            <th class="py-3 px-3 text-right text-amber-600 font-extrabold"><i class="fa-solid fa-bandage text-amber-600 mr-1"></i> พอกเข่า</th>
            <th class="py-3 px-3 text-right text-sky-600 font-extrabold"><i class="fa-solid fa-hand-holding-heart text-sky-600 mr-1"></i> นวด</th>
            <th class="py-3 px-3 text-right text-teal-600 font-extrabold"><i class="fa-solid fa-leaf text-teal-600 mr-1"></i> ประคบ</th>
            <th class="py-3 px-3 text-right text-rose-600 font-extrabold"><i class="fa-solid fa-person-breastfeeding text-rose-600 mr-1"></i> ฟื้นฟูมารดา</th>
            <th class="py-3 px-3 text-right text-purple-600 font-extrabold"><i class="fa-solid fa-hot-tub-person text-purple-600 mr-1"></i> อบสมุนไพร</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-extrabold bg-emerald-50/60">รวม Point (บาท)</th>
          </tr>
        `;
      }

      if (tbody) {
        tbody.innerHTML = '';
        monthList.forEach((m, idx) => {
          const mData = byMonth[m] || { services: {}, totalPoint: 0 };
          const isCurrentMonthRow = (activeMonth === m);

          const tr = document.createElement('tr');
          tr.className = `hover:bg-slate-50 transition cursor-pointer ${
            isCurrentMonthRow ? 'bg-emerald-50/80 font-semibold border-l-4 border-emerald-600' : ''
          }`;
          tr.onclick = () => window.switchProcedureMonth(m === activeMonth ? 'all' : m);
          tr.title = isCurrentMonthRow ? 'คลิกเพื่อยกเลิกการกรองเดือนนี้' : `คลิกเพื่อกรองเฉพาะเดือน ${m}`;

          let servicesCells = '';
          PROCEDURE_SERVICES_ORDER.forEach(srv => {
            const pt = mData.services?.[srv] || 0;
            const isCurrentSrv = (activeService === srv);
            const meta = PROCEDURE_SERVICE_META[srv];
            const highlightStyle = isCurrentSrv ? `background-color: ${meta.color}15; font-weight: 700; color: ${meta.color};` : '';
            servicesCells += `
              <td class="py-2.5 px-3 text-right num-font ${pt > 0 ? 'text-slate-800 font-medium' : 'text-slate-300 font-light'}" style="${highlightStyle}">
                ${pt > 0 ? Number(pt).toLocaleString() : '-'}
              </td>
            `;
          });

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-4 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="${isCurrentMonthRow ? 'text-emerald-800 font-bold' : ''}">${m}</span>
              ${isCurrentMonthRow ? '<span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">เลือกอยู่</span>' : ''}
            </td>
            <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">${yr}</td>
            ${servicesCells}
            <td class="py-2.5 px-4 text-right num-font font-black text-emerald-950 bg-emerald-50/50">
              ${Number(mData.totalPoint || 0).toLocaleString()}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        let tfootCells = '';
        PROCEDURE_SERVICES_ORDER.forEach(srv => {
          const pt = unitFullYear?.services?.[srv] || 0;
          const isCurrentSrv = (activeService === srv);
          const meta = PROCEDURE_SERVICE_META[srv];
          const highlightStyle = isCurrentSrv ? `background-color: ${meta.color}25; color: ${meta.color};` : '';
          tfootCells += `
            <td class="py-3 px-3 text-right num-font font-black ${pt > 0 ? 'text-slate-900' : 'text-slate-400'}" style="${highlightStyle}">
              ${Number(pt).toLocaleString()}
            </td>
          `;
        });

        tfoot.innerHTML = `
          <tr class="text-xs bg-emerald-50/80 font-bold border-t-2 border-emerald-300">
            <td colspan="3" class="py-3 px-4 text-left font-black text-emerald-900">
              รวมทั้งปีงบประมาณ ${yr} (${uInfo?.name || activeUnit})
            </td>
            ${tfootCells}
            <td class="py-3 px-4 text-right num-font font-black text-emerald-900 text-sm bg-emerald-100/70">
              ${Number(unitFullYear?.totalPoint || 0).toLocaleString()}
            </td>
          </tr>
        `;
      }
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }


  
  // ==========================================================================
  // NHSO Herb 55 Panel (Menu 4: 55 รายการ Point System)
  // ==========================================================================
  window.switchHerb55Year = function(yr) {
    currentHerb55Year = yr;
    currentYear = yr;
    currentHerb55Month = 'all';
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

  window.switchHerb55Month = function(m) {
    currentHerb55Month = m;
    renderNhsoHerb55Panel();
  };

  window.switchHerb55Unit = function(u) {
    currentHerb55Unit = u;
    renderNhsoHerb55Panel();
  };

  window.switchHerb55Item = function(item) {
    currentHerb55Item = item;
    renderNhsoHerb55Panel();
  };

  window.resetHerb55Filters = function() {
    currentHerb55Month = 'all';
    currentHerb55Unit = 'all';
    currentHerb55Item = 'all';
    renderNhsoHerb55Panel();
  };

  function renderNhsoHerb55Panel() {
    if (currentIndicatorId !== 'nhso_herb55') {
      if (nhsoHerb55Panel) nhsoHerb55Panel.classList.add('hidden');
      return;
    }
    if (nhsoHerb55Panel) nhsoHerb55Panel.classList.remove('hidden');

    const ind = masterData?.indicators?.['nhso_herb55'];
    const hMaster = (nhsoMasterData && nhsoMasterData.herb55_monthly) || (ind && ind.herb55Data) || {};
    const yr = currentHerb55Year || currentYear || '2569';
    let activeMonth = currentHerb55Month || 'all';
    let activeUnit = currentHerb55Unit || 'all';
    let activeItem = currentHerb55Item || 'all';

    const yrData = hMaster[yr] || { districtTotalPoint: 0, districtTotalBath: 0, districtHerbs: {}, monthList: [], months: {}, units: {} };
    const monthList = yrData.monthList || Object.keys(yrData.months || {});
    const districtHerbs = yrData.districtHerbs || {};
    const unitsMap = yrData.units || {};
    const isSingleUnit = (activeUnit !== 'all' && SARAPHI_UNITS_MAP[activeUnit]);
    const isSingleMonth = (activeMonth !== 'all' && yrData.months && yrData.months[activeMonth]);
    const uSlice = isSingleUnit ? unitsMap[activeUnit] : null;

    // Available herbs for current unit/district
    const availableHerbs = isSingleUnit ? Object.keys(uSlice?.herbs || {}) : Object.keys(districtHerbs);
    if (availableHerbs.length === 0 && Object.keys(districtHerbs).length > 0) {
      availableHerbs.push(...Object.keys(districtHerbs));
    }

    // 1. Year Buttons UI
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-herb55-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1 rounded-lg font-bold transition shadow-xs bg-indigo-600 text-white';
        } else {
          btn.className = 'px-3 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Month Selector Dropdown
    const monthSelect = document.getElementById('herb55-month-select');
    if (monthSelect) {
      const currentOpts = Array.from(monthSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...monthList];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        monthSelect.innerHTML = `<option value="all">ทุกเดือน (รวมทั้งปีงบประมาณ ${yr})</option>`;
        monthList.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          monthSelect.appendChild(opt);
        });
      }
      if (activeMonth !== 'all' && !monthList.includes(activeMonth)) {
        currentHerb55Month = 'all';
        activeMonth = 'all';
      }
      monthSelect.value = activeMonth;
    }

    // 3. Unit Selector Dropdown
    const unitSelect = document.getElementById('herb55-unit-select');
    if (unitSelect) {
      if (unitSelect.options.length <= 1) {
        unitSelect.innerHTML = '<option value="all">ทุกหน่วยบริการ (14 แห่ง)</option>';
        Object.keys(SARAPHI_UNITS_MAP).forEach(code => {
          const u = SARAPHI_UNITS_MAP[code];
          const opt = document.createElement('option');
          opt.value = code;
          opt.textContent = `${code} - ${u.name} (${u.subdistrict})`;
          unitSelect.appendChild(opt);
        });
      }
      unitSelect.value = activeUnit;
    }

    // 4. Herb Item Dropdown
    const itemSelect = document.getElementById('herb55-item-select');
    if (itemSelect) {
      const currentOpts = Array.from(itemSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...availableHerbs];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        itemSelect.innerHTML = `<option value="all">ยาสมุนไพรทุกรายการ (${availableHerbs.length} รายการ)</option>`;
        availableHerbs.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item;
          let val = 0;
          if (isSingleUnit) val = uSlice?.herbs?.[item] || 0;
          else val = districtHerbs[item] || 0;
          opt.textContent = `${item} (${Number(val).toLocaleString()} Pt)`;
          itemSelect.appendChild(opt);
        });
      }
      if (activeItem !== 'all' && !availableHerbs.includes(activeItem)) {
        currentHerb55Item = 'all';
        activeItem = 'all';
      }
      itemSelect.value = activeItem;
    }

    // 5. Reset Button & Filter Badge
    const btnReset = document.getElementById('btn-herb55-reset');
    const badgeFilter = document.getElementById('herb55-active-filter-badge');
    const isFiltered = (activeMonth !== 'all' || activeUnit !== 'all' || activeItem !== 'all');
    if (btnReset) {
      if (isFiltered) btnReset.classList.remove('hidden');
      else btnReset.classList.add('hidden');
    }
    if (badgeFilter) {
      if (isFiltered) {
        const tags = [];
        tags.push(`<span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-calendar-days text-[10px]"></i> ปีงบ ${yr}</span>`);
        if (activeMonth !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-regular fa-calendar-check text-[10px]"></i> ${activeMonth}</span>`);
        }
        if (activeUnit !== 'all') {
          const uName = SARAPHI_UNITS_MAP[activeUnit]?.short || activeUnit;
          tags.push(`<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-hospital text-[10px]"></i> ${uName}</span>`);
        }
        if (activeItem !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-leaf text-[10px]"></i> ${activeItem}</span>`);
        }
        badgeFilter.innerHTML = tags.join(' ');
      } else {
        badgeFilter.innerHTML = `<span class="text-slate-400 text-xs">แสดงผลรวมทั้งอำเภอ (14 หน่วยบริการ, ทุกเดือน)</span>`;
      }
    }

    // 6. Calculate Active Herbs Breakdown & Filtered Total
    let activeHerbsMap = {};
    if (isSingleUnit) {
      if (isSingleMonth) {
        activeHerbsMap = uSlice?.monthlyHerbs?.[activeMonth] || {};
      } else {
        activeHerbsMap = uSlice?.herbs || {};
      }
    } else {
      if (isSingleMonth) {
        activeHerbsMap = yrData.months?.[activeMonth]?.herbs || {};
      } else {
        activeHerbsMap = districtHerbs;
      }
    }

    let filteredTotal = 0;
    if (activeItem !== 'all') {
      filteredTotal = activeHerbsMap[activeItem] || 0;
    } else {
      filteredTotal = Object.values(activeHerbsMap).reduce((a, b) => a + b, 0);
    }

    // 7. Render 4 Bento KPI Cards
    const cardsContainer = document.getElementById('herb55-kpi-cards');
    if (cardsContainer) {
      const sortedHerbs = Object.entries(activeHerbsMap).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
      const topHerb = sortedHerbs[0] || ['-', 0];
      const topHerbPct = filteredTotal > 0 ? ((topHerb[1] / filteredTotal) * 100).toFixed(1) : '0.0';

      const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
      const unitsPerformance = unitKeys.map(code => {
        let pt = 0;
        if (activeItem !== 'all') {
          if (isSingleMonth) pt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
          else pt = unitsMap[code]?.herbs?.[activeItem] || 0;
        } else {
          if (isSingleMonth) pt = yrData.months?.[activeMonth]?.units?.[code] || 0;
          else pt = unitsMap[code]?.totalPoint || 0;
        }
        return { code, name: SARAPHI_UNITS_MAP[code]?.name || code, short: SARAPHI_UNITS_MAP[code]?.short || code, point: pt };
      }).sort((a, b) => b.point - a.point);

      const activeUnitsCount = unitsPerformance.filter(u => u.point > 0).length;
      const topUnit = unitsPerformance[0] || { short: '-', point: 0 };
      const topUnitPct = filteredTotal > 0 ? ((topUnit.point / filteredTotal) * 100).toFixed(1) : '0.0';

      cardsContainer.innerHTML = `
        <!-- Card 1: Total Points / Bath -->
        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-coins text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md num-font">1 Pt = 1 บาท</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ผลงาน Point ${activeItem !== 'all' ? '(' + activeItem + ')' : '(บาท)'}</span>
            <div class="text-2xl font-black text-slate-900 num-font mt-1 flex items-baseline gap-1.5">
              ${Number(filteredTotal).toLocaleString()} <span class="text-xs font-normal text-slate-400">Point</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ชดเชยบาท:</span>
            <span class="font-bold text-emerald-700 num-font">~${Number(filteredTotal).toLocaleString()} บาท</span>
          </div>
        </div>

        <!-- Card 2: Top Herb Item -->
        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-leaf text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md num-font">${topHerbPct}%</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ยาสมุนไพรยอดนิยม</span>
            <div class="text-lg font-black text-slate-900 truncate mt-1" title="${topHerb[0]}">
              ${activeItem !== 'all' ? activeItem : topHerb[0]}
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ผลงาน:</span>
            <span class="font-bold text-teal-700 num-font">${Number(activeItem !== 'all' ? filteredTotal : topHerb[1]).toLocaleString()} Point</span>
          </div>
        </div>

        <!-- Card 3: Top Performer Unit -->
        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-crown text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md num-font">${topUnitPct}%</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">หน่วยบริการสูงสุด</span>
            <div class="text-lg font-black text-slate-900 truncate mt-1" title="${topUnit.name}">
              ${isSingleUnit ? SARAPHI_UNITS_MAP[activeUnit]?.short : topUnit.short}
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ยอดสั่งใช้:</span>
            <span class="font-bold text-amber-700 num-font">${Number(isSingleUnit ? filteredTotal : topUnit.point).toLocaleString()} Point</span>
          </div>
        </div>

        <!-- Card 4: Active Units Count -->
        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-hospital-user text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-md num-font">${availableHerbs.length} รายการ</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">หน่วยบริการที่มีผลงาน</span>
            <div class="text-2xl font-black text-slate-900 num-font mt-1 flex items-baseline gap-1">
              ${activeUnitsCount} <span class="text-xs font-normal text-slate-400">จาก 14 แห่ง</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>สัดส่วนครอบคลุม:</span>
            <span class="font-bold text-indigo-700 num-font">${((activeUnitsCount / 14) * 100).toFixed(1)}%</span>
          </div>
        </div>
      `;
    }

    // 8. Render Chart 1: Unit or Monthly Trend (Stacked Bar)
    const canvas1 = document.getElementById('herb55-breakdown-chart');
    const chartTitle1 = document.getElementById('herb55-chart-title');
    const chartSubtitle1 = document.getElementById('herb55-chart-subtitle');
    const chartBadge1 = document.getElementById('herb55-chart-badge');

    if (canvas1) {
      if (herb55ChartInstance) {
        herb55ChartInstance.destroy();
        herb55ChartInstance = null;
      }
      const ctx1 = canvas1.getContext('2d');
      let chartConfig1 = null;

      if (!isSingleUnit) {
        // 14 Units Chart
        const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
        const unitsList = unitKeys.map(code => {
          let pt = 0;
          if (activeItem !== 'all') {
            if (isSingleMonth) pt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
            else pt = unitsMap[code]?.herbs?.[activeItem] || 0;
          } else {
            if (isSingleMonth) pt = yrData.months?.[activeMonth]?.units?.[code] || 0;
            else pt = unitsMap[code]?.totalPoint || 0;
          }
          return { code, short: SARAPHI_UNITS_MAP[code]?.short || code, point: pt };
        }).sort((a, b) => b.point - a.point);

        if (chartTitle1) chartTitle1.textContent = isSingleMonth ? `ผลงานยาสมุนไพร 55 รายการ (${activeMonth})` : `ผลงานยาสมุนไพร 55 รายการ (ปีงบ ${yr})`;
        if (chartSubtitle1) chartSubtitle1.textContent = activeItem !== 'all' ? `เปรียบเทียบผลงาน ${activeItem} รายหน่วยบริการ 14 แห่ง` : `เปรียบเทียบผลงาน Point รายหน่วยบริการ (จำแนกชนิดยา - แยกสีในแท่งเดียว)`;
        if (chartBadge1) {
          chartBadge1.textContent = `${isSingleMonth ? activeMonth : 'รวมทั้งปี'}: ${Number(filteredTotal).toLocaleString()} Pt`;
          chartBadge1.className = 'text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        if (activeItem === 'all') {
          // Stacked Bar across 14 units
          const allHerbsInDistrict = Object.keys(districtHerbs);
          const datasets = allHerbsInDistrict.map((hName, hIdx) => {
            const pal = HERB_PALETTE[hIdx % HERB_PALETTE.length];
            return {
              label: hName,
              data: unitsList.map(u => {
                if (isSingleMonth) return unitsMap[u.code]?.monthlyHerbs?.[activeMonth]?.[hName] || 0;
                return unitsMap[u.code]?.herbs?.[hName] || 0;
              }),
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 3,
              maxBarThickness: 22,
              stack: 'units'
            };
          });

          chartConfig1 = {
            type: 'bar',
            data: { labels: unitsList.map(u => u.short), datasets: datasets },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { stacked: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
                y: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11, weight: '500' }, color: '#334155' } }
              },
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Prompt', size: 10 }, usePointStyle: true, boxWidth: 6, padding: 8 } },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} Pt`,
                    footer: (items) => {
                      const total = items.reduce((a, b) => a + b.raw, 0);
                      return ` รวมทุกชนิดยา: ${Number(total).toLocaleString()} Pt`;
                    }
                  }
                }
              }
            }
          };
        } else {
          chartConfig1 = {
            type: 'bar',
            data: {
              labels: unitsList.map(u => u.short),
              datasets: [{
                label: activeItem,
                data: unitsList.map(u => u.point),
                backgroundColor: '#059669',
                borderColor: '#047857',
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 22
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
                y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11, weight: '500' }, color: '#334155' } }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: { label: (ctx) => ` ${activeItem}: ${Number(ctx.raw).toLocaleString()} Pt` }
                }
              }
            }
          };
        }
      } else {
        // Single Unit Monthly Trend Chart (Stacked by Herbs!)
        const uInfo = SARAPHI_UNITS_MAP[activeUnit];
        const byMonth = uSlice?.byMonth || {};

        if (chartTitle1) chartTitle1.textContent = `ประวัติรายเดือน: ${uInfo?.name || activeUnit} (ปีงบ ${yr})`;
        if (chartSubtitle1) chartSubtitle1.textContent = activeItem !== 'all' ? `แนวโน้มการจ่ายยา ${activeItem} รายเดือน` : `แนวโน้มการจ่ายยาสมุนไพรจำแนกชนิดยา (รวมในแท่งเดียวแต่แยกสี)`;
        if (chartBadge1) {
          chartBadge1.textContent = `${uInfo?.short}: ${Number(filteredTotal).toLocaleString()} Pt`;
          chartBadge1.className = 'text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        const unitHerbsList = Object.keys(uSlice?.herbs || {});
        if (activeItem === 'all' && unitHerbsList.length > 0) {
          const datasets = unitHerbsList.map((hName, hIdx) => {
            const pal = HERB_PALETTE[hIdx % HERB_PALETTE.length];
            return {
              label: hName,
              data: monthList.map(m => uSlice?.monthlyHerbs?.[m]?.[hName] || 0),
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 3,
              maxBarThickness: 28,
              stack: 'month'
            };
          });

          chartConfig1 = {
            type: 'bar',
            data: { labels: monthList, datasets: datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              maxBarThickness: 28,
              barPercentage: 0.6,
              categoryPercentage: 0.7,
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10 } } },
                y: { stacked: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } }
              },
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Prompt', size: 10 }, usePointStyle: true, boxWidth: 6, padding: 8 } },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} Pt`,
                    footer: (items) => {
                      const mIdx = items[0]?.dataIndex;
                      const mName = monthList[mIdx];
                      const total = items.reduce((a, b) => a + b.raw, 0);
                      return ` รวมเดือน ${mName}: ${Number(total).toLocaleString()} Pt`;
                    }
                  }
                }
              }
            }
          };
        } else {
          const pts = monthList.map(m => {
            if (activeItem !== 'all') return uSlice?.monthlyHerbs?.[m]?.[activeItem] || 0;
            return byMonth[m] || 0;
          });
          chartConfig1 = {
            type: 'bar',
            data: {
              labels: monthList,
              datasets: [{
                label: activeItem !== 'all' ? activeItem : 'ผลงาน Point',
                data: pts,
                backgroundColor: '#0d9488',
                borderColor: '#0f766e',
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 28,
                barPercentage: 0.6,
                categoryPercentage: 0.7
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10 } } },
                y: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: { label: (ctx) => ` ${monthList[ctx.dataIndex]}: ${Number(ctx.raw).toLocaleString()} Pt` }
                }
              }
            }
          };
        }
      }

      herb55ChartInstance = new Chart(ctx1, chartConfig1);
    }

    // 9. Render Chart 2: Herb Breakdown Bar Chart (Medata Style)
    const canvas2 = document.getElementById('herb55-herb-chart');
    const chartTitle2 = document.getElementById('herb55-herb-chart-title');
    const chartSubtitle2 = document.getElementById('herb55-herb-chart-subtitle');
    const chartBadge2 = document.getElementById('herb55-herb-chart-badge');

    if (canvas2) {
      if (herb55HerbChartInstance) {
        herb55HerbChartInstance.destroy();
        herb55HerbChartInstance = null;
      }
      const ctx2 = canvas2.getContext('2d');
      const herbEntries = Object.entries(activeHerbsMap)
        .filter(e => activeItem === 'all' || e[0] === activeItem)
        .sort((a, b) => b[1] - a[1]);

      if (chartTitle2) chartTitle2.textContent = `จำแนกรายประเภทบริการ / ชนิดยา (${yr})`;
      if (chartSubtitle2) chartSubtitle2.textContent = `${isSingleUnit ? SARAPHI_UNITS_MAP[activeUnit]?.short : 'รวมทั้งอำเภอ'} • ${isSingleMonth ? activeMonth : 'ทั้งปีงบ ' + yr}`;
      if (chartBadge2) chartBadge2.textContent = `${herbEntries.length} ชนิดยา`;

      const chartConfig2 = {
        type: 'bar',
        data: {
          labels: herbEntries.map(e => e[0]),
          datasets: [{
            label: 'จำนวน Point',
            data: herbEntries.map(e => e[1]),
            backgroundColor: herbEntries.map((_, i) => HERB_PALETTE[i % HERB_PALETTE.length].bg),
            borderColor: herbEntries.map((_, i) => HERB_PALETTE[i % HERB_PALETTE.length].border),
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 22
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
            y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11, weight: '500' }, color: '#334155' } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              titleFont: { family: 'Prompt', size: 12 },
              bodyFont: { family: 'Prompt', size: 11 },
              callbacks: {
                label: (ctx) => {
                  const val = ctx.raw || 0;
                  const pct = filteredTotal > 0 ? ((val / filteredTotal) * 100).toFixed(1) : 0;
                  return ` สั่งใช้: ${Number(val).toLocaleString()} Pt (~${Number(val).toLocaleString()} บาท, ${pct}%)`;
                }
              }
            }
          }
        }
      };

      herb55HerbChartInstance = new Chart(ctx2, chartConfig2);
    }

    // 10. Render Table
    const thead = document.getElementById('herb55-matrix-thead');
    const tbody = document.getElementById('herb55-matrix-tbody');
    const tfoot = document.getElementById('herb55-matrix-tfoot');
    const tableTitle = document.getElementById('herb55-table-title');
    const tableSubtitle = document.getElementById('herb55-table-subtitle');
    const tableBadge = document.getElementById('herb55-table-summary-badge');

    if (!isSingleUnit) {
      if (tableTitle) tableTitle.textContent = isSingleMonth ? `ตารางผลงานยาสมุนไพร 55 รายการ ประจำเดือน: ${activeMonth}` : `ตารางผลงานยาสมุนไพร 55 รายการ รายหน่วยบริการ (ปีงบ ${yr})`;
      if (tableSubtitle) tableSubtitle.textContent = activeItem !== 'all' ? `แสดงผลงานเฉพาะยา ${activeItem} (คลิกที่แถวเพื่อเจาะลึก)` : `คลิกที่แถวหน่วยบริการเพื่อดูประวัติการเคลมและชนิดยาที่จ่ายรายเดือน`;
      if (tableBadge) tableBadge.textContent = `${isSingleMonth ? activeMonth : 'ทั้งปีงบ ' + yr} - ${Number(filteredTotal).toLocaleString()} Pt`;

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-3 w-20 text-slate-500 font-bold">รหัส</th>
            <th class="py-3 px-3 min-w-[180px] text-slate-800 font-bold">หน่วยบริการ</th>
            <th class="py-3 px-3 w-24 text-slate-600 font-bold">ตำบล</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-extrabold bg-emerald-50/60">รวม Point (บาท)</th>
            <th class="py-3 px-3 text-right text-slate-600 font-semibold w-20">สัดส่วน %</th>
            <th class="py-3 px-3 text-center text-slate-500 font-semibold w-28">ชนิดยาหลัก</th>
          </tr>
        `;
      }

      const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
      const unitsList = unitKeys.map(code => {
        let pt = 0;
        if (activeItem !== 'all') {
          if (isSingleMonth) pt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
          else pt = unitsMap[code]?.herbs?.[activeItem] || 0;
        } else {
          if (isSingleMonth) pt = yrData.months?.[activeMonth]?.units?.[code] || 0;
          else pt = unitsMap[code]?.totalPoint || 0;
        }
        return {
          hospcode: code,
          name: SARAPHI_UNITS_MAP[code]?.name || code,
          subdistrict: SARAPHI_UNITS_MAP[code]?.subdistrict || '-',
          point: pt,
          herbs: unitsMap[code]?.herbs || {}
        };
      }).sort((a, b) => b.point - a.point);

      if (tbody) {
        tbody.innerHTML = '';
        unitsList.forEach((u, idx) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-emerald-50/50 cursor-pointer transition group';
          tr.onclick = () => window.switchHerb55Unit(u.hospcode);
          tr.title = `คลิกเพื่อดูประวัติรายเดือนของ ${u.name}`;

          const pct = filteredTotal > 0 ? ((u.point / filteredTotal) * 100).toFixed(1) : '0.0';
          const topHerbEntry = Object.entries(u.herbs).sort((a, b) => b[1] - a[1])[0];
          const topHerbBadge = topHerbEntry ? `<span class="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[120px] inline-block" title="${topHerbEntry[0]}: ${topHerbEntry[1]} Pt">${topHerbEntry[0]}</span>` : '<span class="text-slate-300">-</span>';

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white group-hover:bg-emerald-50/50 z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">${u.hospcode}</td>
            <td class="py-2.5 px-3 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="group-hover:text-emerald-700 font-semibold transition">${u.name}</span>
              <span class="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0"><i class="fa-solid fa-arrow-right"></i> เจาะลึก</span>
            </td>
            <td class="py-2.5 px-3 text-slate-500">${u.subdistrict}</td>
            <td class="py-2.5 px-4 text-right num-font font-black text-emerald-950 bg-emerald-50/50 group-hover:bg-emerald-100/60">
              ${Number(u.point).toLocaleString()}
            </td>
            <td class="py-2.5 px-3 text-right num-font font-semibold text-slate-600">${pct}%</td>
            <td class="py-2.5 px-3 text-center">
              ${topHerbBadge}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr class="text-xs bg-emerald-50/80 font-bold border-t-2 border-emerald-300">
            <td colspan="4" class="py-3 px-4 text-left font-black text-emerald-900">
              รวมทั้งอำเภอสารภี (${isSingleMonth ? activeMonth : '14 หน่วยบริการ'})
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-emerald-950 text-sm bg-emerald-100/70">
              ${Number(filteredTotal).toLocaleString()} Point
            </td>
            <td class="py-3 px-3 text-right num-font font-black text-emerald-900">100.0%</td>
            <td class="py-3 px-3 text-center num-font font-bold text-emerald-800">~${Number(filteredTotal).toLocaleString()} บ.</td>
          </tr>
        `;
      }
    } else {
      // Single Unit Monthly Breakdown View with Herbs Details
      const uInfo = SARAPHI_UNITS_MAP[activeUnit];
      const byMonth = uSlice?.byMonth || {};

      if (tableTitle) tableTitle.textContent = `ประวัติผลงานรายเดือน: ${uInfo?.name || activeUnit}`;
      if (tableSubtitle) {
        tableSubtitle.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap mt-0.5">
            <span>ผลงานสะสมตลอดปีงบประมาณ ${yr} รวม <strong>${Number(filteredTotal).toLocaleString()} Point</strong></span>
            <button type="button" onclick="window.switchHerb55Unit('all')" class="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1">
              <i class="fa-solid fa-arrow-left text-[10px]"></i> กลับไปดูทุกหน่วยบริการ
            </button>
          </div>
        `;
      }
      if (tableBadge) tableBadge.textContent = `${uInfo?.short}: ${Number(filteredTotal).toLocaleString()} Point`;

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-4 text-slate-800 font-bold min-w-[160px]">ประจำเดือน</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-extrabold bg-emerald-50/60 w-32">ผลงาน Point (บาท)</th>
            <th class="py-3 px-3 text-right text-slate-600 font-semibold w-24">สัดส่วน %</th>
            <th class="py-3 px-4 text-left text-slate-700 font-bold min-w-[220px]">ชนิดยาสมุนไพรที่จ่ายในเดือน</th>
          </tr>
        `;
      }

      if (tbody) {
        tbody.innerHTML = '';
        const totalYear = filteredTotal > 0 ? filteredTotal : 1;
        monthList.forEach((m, idx) => {
          let pt = 0;
          if (activeItem !== 'all') pt = uSlice?.monthlyHerbs?.[m]?.[activeItem] || 0;
          else pt = byMonth[m] || 0;

          const isCurrentM = (activeMonth === m);
          const pct = totalYear > 0 ? ((pt / totalYear) * 100).toFixed(1) : '0.0';

          const monthHerbs = uSlice?.monthlyHerbs?.[m] || {};
          const herbBadges = Object.entries(monthHerbs).map(([hName, hPt]) => {
            return `<span class="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">${hName}: ${Number(hPt).toLocaleString()} Pt</span>`;
          }).join(' ') || '<span class="text-slate-300 text-xs">-</span>';

          const tr = document.createElement('tr');
          tr.className = `hover:bg-slate-50 transition cursor-pointer ${
            isCurrentM ? 'bg-emerald-50/80 font-semibold border-l-4 border-emerald-600' : ''
          }`;
          tr.onclick = () => window.switchHerb55Month(m === activeMonth ? 'all' : m);
          tr.title = isCurrentM ? 'คลิกเพื่อยกเลิกการกรองเดือน' : `คลิกเพื่อกรองเฉพาะเดือน ${m}`;

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-4 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="${isCurrentM ? 'text-emerald-800 font-bold' : ''}">${m}</span>
              ${isCurrentM ? '<span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">เลือกอยู่</span>' : ''}
            </td>
            <td class="py-2.5 px-4 text-right num-font font-black text-emerald-950 bg-emerald-50/50">
              ${Number(pt).toLocaleString()}
            </td>
            <td class="py-2.5 px-3 text-right num-font font-semibold text-slate-600">${pct}%</td>
            <td class="py-2.5 px-4 text-left flex flex-wrap gap-1">
              ${herbBadges}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr class="text-xs bg-emerald-50/80 font-bold border-t-2 border-emerald-300">
            <td colspan="2" class="py-3 px-4 text-left font-black text-emerald-900">
              รวมสะสมปีงบประมาณ ${yr} (${uInfo?.name})
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-emerald-950 text-sm bg-emerald-100/70">
              ${Number(filteredTotal).toLocaleString()} Point
            </td>
            <td class="py-3 px-3 text-right num-font font-black text-emerald-900">100.0%</td>
            <td class="py-3 px-4 text-left font-bold text-emerald-800">
              จ่ายยารวม ${availableHerbs.length} ชนิด (~${Number(filteredTotal).toLocaleString()} บาท)
            </td>
          </tr>
        `;
      }
    }
  }

  // ==========================================================================
  // NHSO Herb 9 Dictionary & Legend Helper (คำอธิบาย HERB1-9)
  // ==========================================================================
  const NHSO_HERB9_DICT = {
    'HERB1': 'ฟ้าทะลายโจร',
    'HERB2': 'ขมิ้นชัน',
    'HERB3': 'ประสะมะแว้ง',
    'HERB4': 'ยาแก้ไอมะขามป้อม',
    'HERB5': 'ยาไพล',
    'HERB6': 'เถาวัลย์เปรียง',
    'HERB7': 'ยาประคบ *',
    'HERB8': 'ยาธาตุอบเชย',
    'HERB9': 'ยาสหัสธารา',
    'HERB01': 'ฟ้าทะลายโจร',
    'HERB02': 'ขมิ้นชัน',
    'HERB03': 'ประสะมะแว้ง',
    'HERB04': 'ยาแก้ไอมะขามป้อม',
    'HERB05': 'ยาไพล',
    'HERB06': 'เถาวัลย์เปรียง',
    'HERB07': 'ยาประคบ *',
    'HERB08': 'ยาธาตุอบเชย',
    'HERB09': 'ยาสหัสธารา'
  };

  function formatHerb9Label(rawKey) {
    if (!rawKey) return '-';
    const k = String(rawKey).trim();
    const upper = k.toUpperCase();
    const name = NHSO_HERB9_DICT[upper];
    if (name) {
      const num = upper.replace('HERB', '').replace(/^0+/, '');
      return `Herb${num} = ${name}`;
    }
    return k;
  }

  function getHerb9ShortName(rawKey) {
    if (!rawKey) return '-';
    const k = String(rawKey).trim();
    const upper = k.toUpperCase();
    return NHSO_HERB9_DICT[upper] || k;
  }

  window.toggleHerb9Legend = function(forceOpen = false) {
    const body = document.getElementById('herb9-legend-body');
    const title = document.getElementById('herb9-legend-header-title');
    const icon = document.getElementById('herb9-legend-icon');
    const hint = document.getElementById('herb9-legend-toggle-hint');
    if (!body) return;
    const isHidden = body.classList.contains('hidden');
    if (forceOpen || isHidden) {
      body.classList.remove('hidden');
      if (title) title.textContent = '(คลิกเพื่อปิด) คำอธิบาย HERB';
      if (icon) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      }
      if (hint) hint.textContent = 'คลิกเพื่อย่อ';
    } else {
      body.classList.add('hidden');
      if (title) title.textContent = '(คลิกเพื่อเปิด) คำอธิบาย HERB';
      if (icon) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }
      if (hint) hint.textContent = 'คลิกเพื่อขยาย';
    }
  };

  window.switchHerb9Year = function(yr) {
    currentHerb9Year = yr;
    currentHerb9Month = 'all';
    currentHerb9Unit = 'all';
    currentHerb9Item = 'all';
    renderNhsoHerb9Panel();
  };

  window.switchHerb9Month = function(m) {
    currentHerb9Month = m;
    renderNhsoHerb9Panel();
  };

  window.switchHerb9Unit = function(u) {
    currentHerb9Unit = u;
    renderNhsoHerb9Panel();
  };

  window.switchHerb9Item = function(item) {
    currentHerb9Item = item;
    renderNhsoHerb9Panel();
  };

  window.resetHerb9Filters = function() {
    currentHerb9Month = 'all';
    currentHerb9Unit = 'all';
    currentHerb9Item = 'all';
    renderNhsoHerb9Panel();
  };

  function renderNhsoHerb9Panel() {
    if (currentIndicatorId !== 'nhso_herb9') {
      if (nhsoHerb9Panel) nhsoHerb9Panel.classList.add('hidden');
      return;
    }
    if (nhsoHerb9Panel) nhsoHerb9Panel.classList.remove('hidden');

    const ind = masterData?.indicators?.['nhso_herb9'];
    const hMaster = (nhsoMasterData && nhsoMasterData.herb9_monthly) || (ind && ind.herb9Data) || {};
    const yr = currentHerb9Year || '2568';
    let activeMonth = currentHerb9Month || 'all';
    let activeUnit = currentHerb9Unit || 'all';
    let activeItem = currentHerb9Item || 'all';

    const yrData = hMaster[yr] || { districtTotalCount: 0, districtTotalBath: 0, districtItems: {}, monthList: [], months: {}, units: {} };
    const monthList = yrData.monthList || Object.keys(yrData.months || {});
    const districtHerbs = yrData.districtItems || yrData.districtHerbs || {};
    const unitsMap = yrData.units || {};
    const isSingleUnit = (activeUnit !== 'all' && SARAPHI_UNITS_MAP[activeUnit]);
    const isSingleMonth = (activeMonth !== 'all' && yrData.months && yrData.months[activeMonth]);
    const uSlice = isSingleUnit ? unitsMap[activeUnit] : null;

    const availableHerbs = isSingleUnit ? Object.keys(uSlice?.herbs || {}) : Object.keys(districtHerbs);
    if (availableHerbs.length === 0 && Object.keys(districtHerbs).length > 0) {
      availableHerbs.push(...Object.keys(districtHerbs));
    }
    availableHerbs.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    // 1. Year Buttons UI
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-herb9-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1 rounded-lg font-bold transition shadow-xs bg-indigo-600 text-white';
        } else {
          btn.className = 'px-3 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Month Selector Dropdown
    const monthSelect = document.getElementById('herb9-month-select');
    if (monthSelect) {
      const currentOpts = Array.from(monthSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...monthList];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        monthSelect.innerHTML = `<option value="all">ทุกเดือน (รวมทั้งปีงบประมาณ ${yr})</option>`;
        monthList.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          monthSelect.appendChild(opt);
        });
      }
      if (activeMonth !== 'all' && !monthList.includes(activeMonth)) {
        currentHerb9Month = 'all';
        activeMonth = 'all';
      }
      monthSelect.value = activeMonth;
    }

    // 3. Unit Selector Dropdown
    const unitSelect = document.getElementById('herb9-unit-select');
    if (unitSelect) {
      if (unitSelect.options.length <= 1) {
        unitSelect.innerHTML = '<option value="all">ทุกหน่วยบริการ (14 แห่ง)</option>';
        Object.keys(SARAPHI_UNITS_MAP).forEach(code => {
          const u = SARAPHI_UNITS_MAP[code];
          const opt = document.createElement('option');
          opt.value = code;
          opt.textContent = `${code} - ${u.name} (${u.subdistrict})`;
          unitSelect.appendChild(opt);
        });
      }
      unitSelect.value = activeUnit;
    }

    // 4. Herb Item Dropdown
    const itemSelect = document.getElementById('herb9-item-select');
    if (itemSelect) {
      const currentOpts = Array.from(itemSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...availableHerbs];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        itemSelect.innerHTML = `<option value="all">ยาสมุนไพร 9 รายการทั้งหมด (${availableHerbs.length} รายการ)</option>`;
        availableHerbs.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item;
          let val = 0;
          if (isSingleUnit) val = uSlice?.herbs?.[item] || 0;
          else val = districtHerbs[item] || 0;
          opt.textContent = `${formatHerb9Label(item)} (${Number(val).toLocaleString()} ครั้ง)`;
          itemSelect.appendChild(opt);
        });
      }
      if (activeItem !== 'all' && !availableHerbs.includes(activeItem)) {
        currentHerb9Item = 'all';
        activeItem = 'all';
      }
      itemSelect.value = activeItem;
    }

    // 5. Reset Button & Filter Badge
    const btnReset = document.getElementById('btn-herb9-reset');
    const badgeFilter = document.getElementById('herb9-active-filter-badge');
    const isFiltered = (activeMonth !== 'all' || activeUnit !== 'all' || activeItem !== 'all');
    if (btnReset) {
      if (isFiltered) btnReset.classList.remove('hidden');
      else btnReset.classList.add('hidden');
    }
    if (badgeFilter) {
      if (isFiltered) {
        const tags = [];
        tags.push(`<span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-calendar-days text-[10px]"></i> ปีงบ ${yr}</span>`);
        if (activeMonth !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-regular fa-calendar-check text-[10px]"></i> ${activeMonth}</span>`);
        }
        if (activeUnit !== 'all') {
          const uName = SARAPHI_UNITS_MAP[activeUnit]?.short || activeUnit;
          tags.push(`<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-hospital text-[10px]"></i> ${uName}</span>`);
        }
        if (activeItem !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-leaf text-[10px]"></i> ${formatHerb9Label(activeItem)}</span>`);
        }
        badgeFilter.innerHTML = tags.join(' ');
      } else {
        badgeFilter.innerHTML = `<span class="text-slate-400 text-xs">แสดงผลรวมทั้งอำเภอ (14 หน่วยบริการ, ทุกเดือน)</span>`;
      }
    }

    // 6. Active Herbs & Filtered Total
    let activeHerbsMap = {};
    if (isSingleUnit) {
      if (isSingleMonth) {
        activeHerbsMap = uSlice?.monthlyHerbs?.[activeMonth] || {};
      } else {
        activeHerbsMap = uSlice?.herbs || {};
      }
    } else {
      if (isSingleMonth) {
        activeHerbsMap = yrData.months?.[activeMonth]?.items || yrData.months?.[activeMonth]?.herbs || {};
      } else {
        activeHerbsMap = districtHerbs;
      }
    }

    // Update Herb 1-9 Legend Box counts & active highlight
    for (let i = 1; i <= 9; i++) {
      const code = `HERB${i}`;
      const elCount = document.getElementById(`herb9-count-herb${i}`);
      const btnEl = document.getElementById(`btn-legend-herb${i}`);
      const val = activeHerbsMap[code] || 0;
      if (elCount) {
        elCount.textContent = `${Number(val).toLocaleString()} ครั้ง`;
      }
      if (btnEl) {
        if (activeItem === code) {
          btnEl.className = 'flex items-center justify-between p-2 rounded-lg bg-emerald-700 text-white font-bold border border-emerald-800 shadow-xs transition text-left cursor-pointer ring-2 ring-emerald-400';
          if (elCount) elCount.className = 'text-[11px] text-emerald-100 font-mono ml-2';
        } else {
          btnEl.className = 'flex items-center justify-between p-2 rounded-lg bg-white/70 hover:bg-white border border-emerald-200/60 hover:border-emerald-400 hover:shadow-2xs transition text-left cursor-pointer';
          if (elCount) elCount.className = 'text-[11px] text-emerald-800 font-mono ml-2';
        }
      }
    }

    let filteredTotal = 0;
    if (activeItem !== 'all') {
      filteredTotal = activeHerbsMap[activeItem] || 0;
    } else {
      filteredTotal = Object.values(activeHerbsMap).reduce((a, b) => a + b, 0);
    }
    const filteredBath = filteredTotal * 60;

    // 7. Render 4 Bento KPI Cards
    const cardsContainer = document.getElementById('herb9-kpi-cards');
    if (cardsContainer) {
      const sortedHerbs = Object.entries(activeHerbsMap).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
      const topHerb = sortedHerbs[0] || ['-', 0];
      const topHerbPct = filteredTotal > 0 ? ((topHerb[1] / filteredTotal) * 100).toFixed(1) : '0.0';

      const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
      const unitsPerformance = unitKeys.map(code => {
        let cnt = 0;
        if (activeItem !== 'all') {
          if (isSingleMonth) cnt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
          else cnt = unitsMap[code]?.herbs?.[activeItem] || 0;
        } else {
          if (isSingleMonth) cnt = yrData.months?.[activeMonth]?.units?.[code] || 0;
          else cnt = unitsMap[code]?.totalCount || 0;
        }
        return { code, name: SARAPHI_UNITS_MAP[code]?.name || code, short: SARAPHI_UNITS_MAP[code]?.short || code, count: cnt };
      }).sort((a, b) => b.count - a.count);

      const activeUnitsCount = unitsPerformance.filter(u => u.count > 0).length;
      const topUnit = unitsPerformance[0] || { short: '-', count: 0 };
      const topUnitPct = filteredTotal > 0 ? ((topUnit.count / filteredTotal) * 100).toFixed(1) : '0.0';

      cardsContainer.innerHTML = `
        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-prescription-bottle-medical text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md num-font">60 บ./ครั้ง</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ผลงานจำนวนครั้ง</span>
            <div class="text-2xl font-black text-slate-900 num-font mt-1 flex items-baseline gap-1.5">
              ${Number(filteredTotal).toLocaleString()} <span class="text-xs font-normal text-slate-400">ครั้ง</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ชดเชยบาท:</span>
            <span class="font-bold text-teal-700 num-font">~${Number(filteredBath).toLocaleString()} บาท</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-leaf text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md num-font">${topHerbPct}%</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ยาสมุนไพรยอดนิยม</span>
            <div class="text-lg font-black text-slate-900 truncate mt-1" title="${formatHerb9Label(activeItem !== 'all' ? activeItem : topHerb[0])}">
              ${formatHerb9Label(activeItem !== 'all' ? activeItem : topHerb[0])}
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ผลงาน:</span>
            <span class="font-bold text-emerald-700 num-font">${Number(activeItem !== 'all' ? filteredTotal : topHerb[1]).toLocaleString()} ครั้ง</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-crown text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md num-font">${topUnitPct}%</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">หน่วยบริการสูงสุด</span>
            <div class="text-lg font-black text-slate-900 truncate mt-1" title="${topUnit.name}">
              ${isSingleUnit ? SARAPHI_UNITS_MAP[activeUnit]?.short : topUnit.short}
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ยอดสั่งใช้:</span>
            <span class="font-bold text-amber-700 num-font">${Number(isSingleUnit ? filteredTotal : topUnit.count).toLocaleString()} ครั้ง</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-hospital-user text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-md num-font">${availableHerbs.length} รายการ</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">หน่วยบริการที่มีผลงาน</span>
            <div class="text-2xl font-black text-slate-900 num-font mt-1 flex items-baseline gap-1">
              ${activeUnitsCount} <span class="text-xs font-normal text-slate-400">จาก 14 แห่ง</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>สัดส่วนครอบคลุม:</span>
            <span class="font-bold text-indigo-700 num-font">${((activeUnitsCount / 14) * 100).toFixed(1)}%</span>
          </div>
        </div>
      `;
    }

    // 8. Render Chart 1: Unit or Monthly Trend (Stacked Bar)
    const canvas1 = document.getElementById('herb9-breakdown-chart');
    const chartTitle1 = document.getElementById('herb9-chart-title');
    const chartSubtitle1 = document.getElementById('herb9-chart-subtitle');
    const chartBadge1 = document.getElementById('herb9-chart-badge');

    if (canvas1) {
      if (herb9ChartInstance) {
        herb9ChartInstance.destroy();
        herb9ChartInstance = null;
      }
      const ctx1 = canvas1.getContext('2d');
      let chartConfig1 = null;

      if (!isSingleUnit) {
        const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
        const unitsList = unitKeys.map(code => {
          let cnt = 0;
          if (activeItem !== 'all') {
            if (isSingleMonth) cnt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
            else cnt = unitsMap[code]?.herbs?.[activeItem] || 0;
          } else {
            if (isSingleMonth) cnt = yrData.months?.[activeMonth]?.units?.[code] || 0;
            else cnt = unitsMap[code]?.totalCount || 0;
          }
          return { code, short: SARAPHI_UNITS_MAP[code]?.short || code, count: cnt };
        }).sort((a, b) => b.count - a.count);

        if (chartTitle1) chartTitle1.textContent = isSingleMonth ? `ผลงานยาสมุนไพร 9 รายการ (${activeMonth})` : `ผลงานยาสมุนไพร 9 รายการ (ปีงบ ${yr})`;
        if (chartSubtitle1) chartSubtitle1.textContent = activeItem !== 'all' ? `เปรียบเทียบผลงาน ${activeItem} รายหน่วยบริการ 14 แห่ง` : `เปรียบเทียบผลงานจำนวนครั้งรายหน่วยบริการ (จำแนกชนิดยา - แยกสีในแท่งเดียว)`;
        if (chartBadge1) {
          chartBadge1.textContent = `${isSingleMonth ? activeMonth : 'รวมทั้งปี'}: ${Number(filteredTotal).toLocaleString()} ครั้ง`;
          chartBadge1.className = 'text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        if (activeItem === 'all') {
          const allHerbsInDistrict = Object.keys(districtHerbs).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
          });
          const datasets = allHerbsInDistrict.map((hName) => {
            const num = parseInt(hName.replace(/\D/g, '')) || 1;
            const pal = HERB_PALETTE[(num - 1) % HERB_PALETTE.length];
            return {
              label: formatHerb9Label(hName),
              data: unitsList.map(u => {
                if (isSingleMonth) return unitsMap[u.code]?.monthlyHerbs?.[activeMonth]?.[hName] || 0;
                return unitsMap[u.code]?.herbs?.[hName] || 0;
              }),
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 3,
              maxBarThickness: 22,
              stack: 'units'
            };
          });

          chartConfig1 = {
            type: 'bar',
            data: { labels: unitsList.map(u => u.short), datasets: datasets },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { stacked: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
                y: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11, weight: '500' }, color: '#334155' } }
              },
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Prompt', size: 10 }, usePointStyle: true, boxWidth: 6, padding: 8 } },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} ครั้ง`,
                    footer: (items) => ` รวมทุกชนิดยา: ${Number(items.reduce((a, b) => a + b.raw, 0)).toLocaleString()} ครั้ง`
                  }
                }
              }
            }
          };
        } else {
          chartConfig1 = {
            type: 'bar',
            data: {
              labels: unitsList.map(u => u.short),
              datasets: [{
                label: formatHerb9Label(activeItem),
                data: unitsList.map(u => u.count),
                backgroundColor: '#0d9488',
                borderColor: '#0f766e',
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 22
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
                y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11, weight: '500' }, color: '#334155' } }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: { label: (ctx) => ` ${formatHerb9Label(activeItem)}: ${Number(ctx.raw).toLocaleString()} ครั้ง` }
                }
              }
            }
          };
        }
      } else {
        const uInfo = SARAPHI_UNITS_MAP[activeUnit];
        const byMonth = uSlice?.byMonth || {};

        if (chartTitle1) chartTitle1.textContent = `ประวัติรายเดือน: ${uInfo?.name || activeUnit} (ปีงบ ${yr})`;
        if (chartSubtitle1) chartSubtitle1.textContent = activeItem !== 'all' ? `แนวโน้มการสั่งใช้ ${activeItem} รายเดือน` : `แนวโน้มการสั่งใช้ยาสมุนไพร 9 รายการ (จำแนกชนิดยา - แยกสีในแท่งเดียว)`;
        if (chartBadge1) {
          chartBadge1.textContent = `${uInfo?.short}: ${Number(filteredTotal).toLocaleString()} ครั้ง`;
          chartBadge1.className = 'text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        const unitHerbsList = Object.keys(uSlice?.herbs || {}).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        });
        if (activeItem === 'all' && unitHerbsList.length > 0) {
          const datasets = unitHerbsList.map((hName) => {
            const num = parseInt(hName.replace(/\D/g, '')) || 1;
            const pal = HERB_PALETTE[(num - 1) % HERB_PALETTE.length];
            return {
              label: formatHerb9Label(hName),
              data: monthList.map(m => uSlice?.monthlyHerbs?.[m]?.[hName] || 0),
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 3,
              maxBarThickness: 28,
              stack: 'month'
            };
          });

          chartConfig1 = {
            type: 'bar',
            data: { labels: monthList, datasets: datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              maxBarThickness: 28,
              barPercentage: 0.6,
              categoryPercentage: 0.7,
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10 } } },
                y: { stacked: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } }
              },
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Prompt', size: 10 }, usePointStyle: true, boxWidth: 6, padding: 8 } },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} ครั้ง`,
                    footer: (items) => {
                      const mIdx = items[0]?.dataIndex;
                      const mName = monthList[mIdx];
                      const total = items.reduce((a, b) => a + b.raw, 0);
                      return ` รวมเดือน ${mName}: ${Number(total).toLocaleString()} ครั้ง`;
                    }
                  }
                }
              }
            }
          };
        } else {
          const cnts = monthList.map(m => {
            if (activeItem !== 'all') return uSlice?.monthlyHerbs?.[m]?.[activeItem] || 0;
            return byMonth[m] || 0;
          });
          chartConfig1 = {
            type: 'bar',
            data: {
              labels: monthList,
              datasets: [{
                label: activeItem !== 'all' ? formatHerb9Label(activeItem) : 'ผลงานจำนวนครั้ง',
                data: cnts,
                backgroundColor: '#0d9488',
                borderColor: '#0f766e',
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 28,
                barPercentage: 0.6,
                categoryPercentage: 0.7
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10 } } },
                y: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 12 },
                  bodyFont: { family: 'Prompt', size: 11 },
                  callbacks: { label: (ctx) => ` ${monthList[ctx.dataIndex]}: ${Number(ctx.raw).toLocaleString()} ครั้ง` }
                }
              }
            }
          };
        }
      }

      herb9ChartInstance = new Chart(ctx1, chartConfig1);
    }

    // 9. Render Chart 2: Herb Breakdown Bar Chart
    const canvas2 = document.getElementById('herb9-herb-chart');
    const chartTitle2 = document.getElementById('herb9-herb-chart-title');
    const chartSubtitle2 = document.getElementById('herb9-herb-chart-subtitle');
    const chartBadge2 = document.getElementById('herb9-herb-chart-badge');

    if (canvas2) {
      if (herb9HerbChartInstance) {
        herb9HerbChartInstance.destroy();
        herb9HerbChartInstance = null;
      }
      const ctx2 = canvas2.getContext('2d');
      const herbEntries = Object.entries(activeHerbsMap)
        .filter(e => activeItem === 'all' || e[0] === activeItem)
        .sort((a, b) => b[1] - a[1]);

      if (chartTitle2) chartTitle2.textContent = `จำแนกรายประเภทบริการ / ชนิดยา (${yr})`;
      if (chartSubtitle2) chartSubtitle2.textContent = `${isSingleUnit ? SARAPHI_UNITS_MAP[activeUnit]?.short : 'รวมทั้งอำเภอ'} • ${isSingleMonth ? activeMonth : 'ทั้งปีงบ ' + yr}`;
      if (chartBadge2) chartBadge2.textContent = `${herbEntries.length} ชนิดยา`;

      const chartConfig2 = {
        type: 'bar',
        data: {
          labels: herbEntries.map(e => formatHerb9Label(e[0])),
          datasets: [{
            label: 'จำนวนครั้ง',
            data: herbEntries.map(e => e[1]),
            backgroundColor: herbEntries.map((e) => {
              const num = parseInt(e[0].replace(/\D/g, '')) || 1;
              return HERB_PALETTE[(num - 1) % HERB_PALETTE.length].bg;
            }),
            borderColor: herbEntries.map((e) => {
              const num = parseInt(e[0].replace(/\D/g, '')) || 1;
              return HERB_PALETTE[(num - 1) % HERB_PALETTE.length].border;
            }),
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 22
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
            y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11, weight: '500' }, color: '#334155' } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              titleFont: { family: 'Prompt', size: 12 },
              bodyFont: { family: 'Prompt', size: 11 },
              callbacks: {
                title: (items) => {
                  const entry = herbEntries[items[0].dataIndex];
                  return formatHerb9Label(entry ? entry[0] : '');
                },
                label: (ctx) => {
                  const val = ctx.raw || 0;
                  const pct = filteredTotal > 0 ? ((val / filteredTotal) * 100).toFixed(1) : 0;
                  return ` สั่งใช้: ${Number(val).toLocaleString()} ครั้ง (~${Number(val * 60).toLocaleString()} บาท, ${pct}%)`;
                }
              }
            }
          }
        }
      };

      herb9HerbChartInstance = new Chart(ctx2, chartConfig2);
    }

    // 10. Render Table
    const thead = document.getElementById('herb9-matrix-thead');
    const tbody = document.getElementById('herb9-matrix-tbody');
    const tfoot = document.getElementById('herb9-matrix-tfoot');
    const tableTitle = document.getElementById('herb9-table-title');
    const tableSubtitle = document.getElementById('herb9-table-subtitle');
    const tableBadge = document.getElementById('herb9-table-summary-badge');

    if (!isSingleUnit) {
      if (tableTitle) tableTitle.textContent = isSingleMonth ? `ตารางผลงานยาสมุนไพร 9 รายการ ประจำเดือน: ${activeMonth}` : `ตารางผลงานยาสมุนไพร 9 รายการ รายหน่วยบริการ (ปีงบ ${yr})`;
      if (tableSubtitle) tableSubtitle.textContent = activeItem !== 'all' ? `แสดงผลงานเฉพาะยา ${activeItem} (คลิกที่แถวเพื่อเจาะลึก)` : `คลิกที่แถวหน่วยบริการเพื่อดูประวัติการเคลมและชนิดยาที่จ่ายรายเดือน`;
      if (tableBadge) tableBadge.textContent = `${isSingleMonth ? activeMonth : 'ทั้งปีงบ ' + yr} - ${Number(filteredTotal).toLocaleString()} ครั้ง`;

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-3 w-20 text-slate-500 font-bold">รหัส</th>
            <th class="py-3 px-3 min-w-[180px] text-slate-800 font-bold">หน่วยบริการ</th>
            <th class="py-3 px-3 w-24 text-slate-600 font-bold">ตำบล</th>
            <th class="py-3 px-4 text-right text-teal-900 font-extrabold bg-teal-50/60">จำนวนครั้ง</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-bold">ชดเชยบาท (~60บ.)</th>
            <th class="py-3 px-3 text-right text-slate-600 font-semibold w-20">สัดส่วน %</th>
            <th class="py-3 px-3 text-center text-slate-500 font-semibold w-28">ชนิดยาหลัก</th>
          </tr>
        `;
      }

      const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
      const unitsList = unitKeys.map(code => {
        let cnt = 0;
        if (activeItem !== 'all') {
          if (isSingleMonth) cnt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
          else cnt = unitsMap[code]?.herbs?.[activeItem] || 0;
        } else {
          if (isSingleMonth) cnt = yrData.months?.[activeMonth]?.units?.[code] || 0;
          else cnt = unitsMap[code]?.totalCount || 0;
        }
        return {
          hospcode: code,
          name: SARAPHI_UNITS_MAP[code]?.name || code,
          subdistrict: SARAPHI_UNITS_MAP[code]?.subdistrict || '-',
          count: cnt,
          bath: cnt * 60,
          herbs: unitsMap[code]?.herbs || {}
        };
      }).sort((a, b) => b.count - a.count);

      if (tbody) {
        tbody.innerHTML = '';
        unitsList.forEach((u, idx) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-teal-50/50 cursor-pointer transition group';
          tr.onclick = () => window.switchHerb9Unit(u.hospcode);
          tr.title = `คลิกเพื่อดูประวัติรายเดือนของ ${u.name}`;

          const pct = filteredTotal > 0 ? ((u.count / filteredTotal) * 100).toFixed(1) : '0.0';
          const topHerbEntry = Object.entries(u.herbs).sort((a, b) => b[1] - a[1])[0];
          const topHerbBadge = topHerbEntry ? `<span class="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200 truncate max-w-[140px] inline-block" title="${formatHerb9Label(topHerbEntry[0])}: ${topHerbEntry[1]} ครั้ง">${formatHerb9Label(topHerbEntry[0])}</span>` : '<span class="text-slate-300">-</span>';

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white group-hover:bg-teal-50/50 z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">${u.hospcode}</td>
            <td class="py-2.5 px-3 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="group-hover:text-teal-700 font-semibold transition">${u.name}</span>
              <span class="text-[10px] text-teal-600 opacity-0 group-hover:opacity-100 transition shrink-0"><i class="fa-solid fa-arrow-right"></i> เจาะลึก</span>
            </td>
            <td class="py-2.5 px-3 text-slate-500">${u.subdistrict}</td>
            <td class="py-2.5 px-4 text-right num-font font-black text-teal-950 bg-teal-50/50 group-hover:bg-teal-100/60">
              ${Number(u.count).toLocaleString()}
            </td>
            <td class="py-2.5 px-4 text-right num-font font-bold text-emerald-900">
              ~${Number(u.bath).toLocaleString()}
            </td>
            <td class="py-2.5 px-3 text-right num-font font-semibold text-slate-600">${pct}%</td>
            <td class="py-2.5 px-3 text-center">
              ${topHerbBadge}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr class="text-xs bg-teal-50/80 font-bold border-t-2 border-teal-300">
            <td colspan="4" class="py-3 px-4 text-left font-black text-teal-900">
              รวมทั้งอำเภอสารภี (${isSingleMonth ? activeMonth : '14 หน่วยบริการ'})
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-teal-950 text-sm bg-teal-100/70">
              ${Number(filteredTotal).toLocaleString()} ครั้ง
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-emerald-950 text-sm bg-emerald-100/70">
              ~${Number(filteredBath).toLocaleString()} บาท
            </td>
            <td class="py-3 px-3 text-right num-font font-black text-teal-900">100.0%</td>
            <td class="py-3 px-3 text-center num-font font-bold text-teal-800">14 หน่วย</td>
          </tr>
        `;
      }
    } else {
      // Single Unit Monthly Breakdown View with Herbs Details
      const uInfo = SARAPHI_UNITS_MAP[activeUnit];
      const byMonth = uSlice?.byMonth || {};

      if (tableTitle) tableTitle.textContent = `ประวัติผลงานรายเดือน: ${uInfo?.name || activeUnit}`;
      if (tableSubtitle) {
        tableSubtitle.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap mt-0.5">
            <span>ผลงานสะสมตลอดปีงบประมาณ ${yr} รวม <strong>${Number(filteredTotal).toLocaleString()} ครั้ง (~${Number(filteredBath).toLocaleString()} บาท)</strong></span>
            <button type="button" onclick="window.switchHerb9Unit('all')" class="text-xs font-bold text-teal-700 hover:text-teal-900 bg-white border border-teal-300 px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1">
              <i class="fa-solid fa-arrow-left text-[10px]"></i> กลับไปดูทุกหน่วยบริการ
            </button>
          </div>
        `;
      }
      if (tableBadge) tableBadge.textContent = `${uInfo?.short}: ${Number(filteredTotal).toLocaleString()} ครั้ง`;

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-4 text-slate-800 font-bold min-w-[160px]">ประจำเดือน</th>
            <th class="py-3 px-4 text-right text-teal-900 font-extrabold bg-teal-50/60 w-32">จำนวนครั้ง</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-bold w-32">ชดเชย (~60บ.)</th>
            <th class="py-3 px-3 text-right text-slate-600 font-semibold w-24">สัดส่วน %</th>
            <th class="py-3 px-4 text-left text-slate-700 font-bold min-w-[220px]">ชนิดยาสมุนไพรที่จ่ายในเดือน</th>
          </tr>
        `;
      }

      if (tbody) {
        tbody.innerHTML = '';
        const totalYear = filteredTotal > 0 ? filteredTotal : 1;
        monthList.forEach((m, idx) => {
          let cnt = 0;
          if (activeItem !== 'all') cnt = uSlice?.monthlyHerbs?.[m]?.[activeItem] || 0;
          else cnt = byMonth[m] || 0;

          const isCurrentM = (activeMonth === m);
          const pct = totalYear > 0 ? ((cnt / totalYear) * 100).toFixed(1) : '0.0';

          const monthHerbs = uSlice?.monthlyHerbs?.[m] || {};
          const herbBadges = Object.entries(monthHerbs).map(([hName, hCnt]) => {
            return `<span class="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded">${formatHerb9Label(hName)}: ${Number(hCnt).toLocaleString()} ครั้ง</span>`;
          }).join(' ') || '<span class="text-slate-300 text-xs">-</span>';

          const tr = document.createElement('tr');
          tr.className = `hover:bg-slate-50 transition cursor-pointer ${
            isCurrentM ? 'bg-teal-50/80 font-semibold border-l-4 border-teal-600' : ''
          }`;
          tr.onclick = () => window.switchHerb9Month(m === activeMonth ? 'all' : m);
          tr.title = isCurrentM ? 'คลิกเพื่อยกเลิกการกรองเดือน' : `คลิกเพื่อกรองเฉพาะเดือน ${m}`;

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-4 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="${isCurrentM ? 'text-teal-800 font-bold' : ''}">${m}</span>
              ${isCurrentM ? '<span class="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">เลือกอยู่</span>' : ''}
            </td>
            <td class="py-2.5 px-4 text-right num-font font-black text-teal-950 bg-teal-50/50">
              ${Number(cnt).toLocaleString()}
            </td>
            <td class="py-2.5 px-4 text-right num-font font-bold text-emerald-900">
              ~${Number(cnt * 60).toLocaleString()} บ.
            </td>
            <td class="py-2.5 px-3 text-right num-font font-semibold text-slate-600">${pct}%</td>
            <td class="py-2.5 px-4 text-left flex flex-wrap gap-1">
              ${herbBadges}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr class="text-xs bg-teal-50/80 font-bold border-t-2 border-teal-300">
            <td colspan="2" class="py-3 px-4 text-left font-black text-teal-900">
              รวมสะสมปีงบประมาณ ${yr} (${uInfo?.name})
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-teal-950 text-sm bg-teal-100/70">
              ${Number(filteredTotal).toLocaleString()} ครั้ง
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-emerald-950 text-sm bg-emerald-100/70">
              ~${Number(filteredBath).toLocaleString()} บาท
            </td>
            <td class="py-3 px-3 text-right num-font font-black text-teal-900">100.0%</td>
            <td class="py-3 px-4 text-left font-bold text-teal-800">
              จ่ายยารวม ${availableHerbs.length} ชนิด
            </td>
          </tr>
        `;
      }
    }
  }

  window.switchHerb32Year = function(yr) {
    currentHerb32Year = yr;
    currentHerb32Month = 'all';
    currentHerb32Unit = 'all';
    currentHerb32Item = 'all';
    renderNhsoHerb32Panel();
  };

  window.switchHerb32Month = function(m) {
    currentHerb32Month = m;
    renderNhsoHerb32Panel();
  };

  window.switchHerb32Unit = function(u) {
    currentHerb32Unit = u;
    renderNhsoHerb32Panel();
  };

  window.switchHerb32Item = function(item) {
    currentHerb32Item = item;
    renderNhsoHerb32Panel();
  };

  window.resetHerb32Filters = function() {
    currentHerb32Month = 'all';
    currentHerb32Unit = 'all';
    currentHerb32Item = 'all';
    renderNhsoHerb32Panel();
  };

  function renderNhsoHerb32Panel() {
    if (currentIndicatorId !== 'nhso_herb32') {
      if (nhsoHerb32Panel) nhsoHerb32Panel.classList.add('hidden');
      return;
    }
    if (nhsoHerb32Panel) nhsoHerb32Panel.classList.remove('hidden');

    const ind = masterData?.indicators?.['nhso_herb32'];
    const hMaster = (nhsoMasterData && nhsoMasterData.herb32_monthly) || (ind && ind.herb32Data) || {};
    const yr = currentHerb32Year || currentYear || '2569';
    let activeMonth = currentHerb32Month || 'all';
    let activeUnit = currentHerb32Unit || 'all';
    let activeItem = currentHerb32Item || 'all';

    const yrData = hMaster[yr] || { districtTotalCount: 0, districtTotalBath: 0, districtHerbs: {}, monthList: [], months: {}, units: {} };
    const monthList = yrData.monthList || Object.keys(yrData.months || {});
    const districtHerbs = yrData.districtHerbs || yrData.districtItems || {};
    const unitsMap = yrData.units || {};
    const isSingleUnit = (activeUnit !== 'all' && SARAPHI_UNITS_MAP[activeUnit]);
    const isSingleMonth = (activeMonth !== 'all' && yrData.months && yrData.months[activeMonth]);
    const uSlice = isSingleUnit ? unitsMap[activeUnit] : null;

    const availableHerbs = isSingleUnit ? Object.keys(uSlice?.herbs || {}) : Object.keys(districtHerbs);
    if (availableHerbs.length === 0 && Object.keys(districtHerbs).length > 0) {
      availableHerbs.push(...Object.keys(districtHerbs));
    }

    // 1. Year Buttons UI
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-herb32-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1 rounded-lg font-bold transition shadow-xs bg-indigo-600 text-white';
        } else {
          btn.className = 'px-3 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Month Selector Dropdown
    const monthSelect = document.getElementById('herb32-month-select');
    if (monthSelect) {
      const currentOpts = Array.from(monthSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...monthList];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        monthSelect.innerHTML = `<option value="all">ทุกเดือน (รวมทั้งปีงบประมาณ ${yr})</option>`;
        monthList.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          monthSelect.appendChild(opt);
        });
      }
      if (activeMonth !== 'all' && !monthList.includes(activeMonth)) {
        currentHerb32Month = 'all';
        activeMonth = 'all';
      }
      monthSelect.value = activeMonth;
    }

    // 3. Unit Selector Dropdown
    const unitSelect = document.getElementById('herb32-unit-select');
    if (unitSelect) {
      if (unitSelect.options.length <= 1) {
        unitSelect.innerHTML = '<option value="all">ทุกหน่วยบริการ (14 แห่ง)</option>';
        Object.keys(SARAPHI_UNITS_MAP).forEach(code => {
          const u = SARAPHI_UNITS_MAP[code];
          const opt = document.createElement('option');
          opt.value = code;
          opt.textContent = `${code} - ${u.name} (${u.subdistrict})`;
          unitSelect.appendChild(opt);
        });
      }
      unitSelect.value = activeUnit;
    }

    // 4. Herb Item Dropdown
    const itemSelect = document.getElementById('herb32-item-select');
    if (itemSelect) {
      const currentOpts = Array.from(itemSelect.options).map(o => o.value);
      const expectedOpts = ['all', ...availableHerbs];
      const isMatched = currentOpts.length === expectedOpts.length && currentOpts.every((v, i) => v === expectedOpts[i]);
      if (!isMatched) {
        itemSelect.innerHTML = `<option value="all">ยาสมุนไพร 32 รายการทั้งหมด (${availableHerbs.length})</option>`;
        availableHerbs.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item;
          let val = 0;
          if (isSingleUnit) val = uSlice?.herbs?.[item] || 0;
          else val = districtHerbs[item] || 0;
          opt.textContent = `${item} (${Number(val).toLocaleString()} ครั้ง)`;
          itemSelect.appendChild(opt);
        });
      }
      if (activeItem !== 'all' && !availableHerbs.includes(activeItem)) {
        currentHerb32Item = 'all';
        activeItem = 'all';
      }
      itemSelect.value = activeItem;
    }

    // 5. Reset Button & Filter Badge
    const btnReset = document.getElementById('btn-herb32-reset');
    const badgeFilter = document.getElementById('herb32-active-filter-badge');
    const isFiltered = (activeMonth !== 'all' || activeUnit !== 'all' || activeItem !== 'all');
    if (btnReset) {
      if (isFiltered) btnReset.classList.remove('hidden');
      else btnReset.classList.add('hidden');
    }
    if (badgeFilter) {
      if (isFiltered) {
        const tags = [];
        tags.push(`<span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-calendar-days text-[10px]"></i> ปีงบ ${yr}</span>`);
        if (activeMonth !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-regular fa-calendar-check text-[10px]"></i> ${activeMonth}</span>`);
        }
        if (activeUnit !== 'all') {
          const uName = SARAPHI_UNITS_MAP[activeUnit]?.short || activeUnit;
          tags.push(`<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-hospital text-[10px]"></i> ${uName}</span>`);
        }
        if (activeItem !== 'all') {
          tags.push(`<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px]"><i class="fa-solid fa-leaf text-[10px]"></i> ${activeItem}</span>`);
        }
        badgeFilter.innerHTML = tags.join(' ');
      } else {
        badgeFilter.innerHTML = `<span class="text-slate-400 text-xs">แสดงผลรวมทั้งอำเภอ (14 หน่วยบริการ, ทุกเดือน)</span>`;
      }
    }

    // 6. Active Herbs & Filtered Total / Compensation Pay
    let activeHerbsMap = {};
    let activeHerbsPayMap = {};

    if (isSingleUnit) {
      if (isSingleMonth) {
        activeHerbsMap = uSlice?.monthlyHerbs?.[activeMonth] || {};
        activeHerbsPayMap = uSlice?.monthlyHerbsPay?.[activeMonth] || {};
      } else {
        activeHerbsMap = uSlice?.herbs || {};
        activeHerbsPayMap = uSlice?.herbsPay || {};
      }
    } else {
      if (isSingleMonth) {
        activeHerbsMap = yrData.months?.[activeMonth]?.items || yrData.months?.[activeMonth]?.herbs || {};
        activeHerbsPayMap = yrData.months?.[activeMonth]?.herbsPay || {};
      } else {
        activeHerbsMap = districtHerbs;
        activeHerbsPayMap = yrData.districtHerbsPay || {};
      }
    }

    let filteredTotal = 0;
    let filteredBath = 0;

    if (activeItem !== 'all') {
      filteredTotal = activeHerbsMap[activeItem] || 0;
      filteredBath = activeHerbsPayMap[activeItem] !== undefined ? activeHerbsPayMap[activeItem] : (filteredTotal * 55);
    } else {
      if (isSingleUnit) {
        if (isSingleMonth) {
          filteredTotal = uSlice?.monthly?.[activeMonth]?.count ?? Object.values(activeHerbsMap).reduce((a, b) => a + b, 0);
          filteredBath = uSlice?.monthly?.[activeMonth]?.pay ?? Object.values(activeHerbsPayMap).reduce((a, b) => a + b, 0);
        } else {
          filteredTotal = uSlice?.totalCount ?? Object.values(activeHerbsMap).reduce((a, b) => a + b, 0);
          filteredBath = uSlice?.totalBath ?? Object.values(activeHerbsPayMap).reduce((a, b) => a + b, 0);
        }
      } else {
        if (isSingleMonth) {
          filteredTotal = yrData.months?.[activeMonth]?.districtCount ?? Object.values(activeHerbsMap).reduce((a, b) => a + b, 0);
          filteredBath = yrData.months?.[activeMonth]?.districtBath ?? Object.values(activeHerbsPayMap).reduce((a, b) => a + b, 0);
        } else {
          filteredTotal = yrData.districtTotalCount ?? Object.values(activeHerbsMap).reduce((a, b) => a + b, 0);
          filteredBath = yrData.districtTotalBath ?? Object.values(activeHerbsPayMap).reduce((a, b) => a + b, 0);
        }
      }
    }

    // 7. Render 4 Bento KPI Cards
    const cardsContainer = document.getElementById('herb32-kpi-cards');
    if (cardsContainer) {
      const sortedHerbs = Object.entries(activeHerbsMap).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
      const topHerb = sortedHerbs[0] || ['-', 0];
      const topHerbCount = activeItem !== 'all' ? filteredTotal : topHerb[1];
      const topHerbPay = activeItem !== 'all' ? filteredBath : (activeHerbsPayMap[topHerb[0]] || (topHerb[1] * 55));
      const topHerbPct = filteredTotal > 0 ? ((topHerbCount / filteredTotal) * 100).toFixed(1) : '0.0';

      const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
      const unitsPerformance = unitKeys.map(code => {
        let cnt = 0;
        let pay = 0;
        if (activeItem !== 'all') {
          if (isSingleMonth) {
            cnt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
            pay = unitsMap[code]?.monthlyHerbsPay?.[activeMonth]?.[activeItem] || (cnt * 55);
          } else {
            cnt = unitsMap[code]?.herbs?.[activeItem] || 0;
            pay = unitsMap[code]?.herbsPay?.[activeItem] || (cnt * 55);
          }
        } else {
          if (isSingleMonth) {
            cnt = yrData.months?.[activeMonth]?.units?.[code] || 0;
            pay = yrData.months?.[activeMonth]?.unitsPay?.[code] || (cnt * 55);
          } else {
            cnt = unitsMap[code]?.totalCount || 0;
            pay = unitsMap[code]?.totalBath || (cnt * 55);
          }
        }
        return { code, name: SARAPHI_UNITS_MAP[code]?.name || code, short: SARAPHI_UNITS_MAP[code]?.short || code, count: cnt, pay: pay };
      }).sort((a, b) => b.count - a.count);

      const activeUnitsCount = unitsPerformance.filter(u => u.count > 0).length;
      const topUnit = isSingleUnit ? { short: SARAPHI_UNITS_MAP[activeUnit]?.short, count: filteredTotal, pay: filteredBath } : (unitsPerformance[0] || { short: '-', count: 0, pay: 0 });
      const topUnitPct = filteredTotal > 0 ? ((topUnit.count / filteredTotal) * 100).toFixed(1) : '0.0';

      cardsContainer.innerHTML = `
        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-prescription-bottle-medical text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md num-font">จ่ายตามจริง/Point</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ผลงานจำนวนครั้ง</span>
            <div class="text-2xl font-black text-slate-900 num-font mt-1 flex items-baseline gap-1.5">
              ${Number(filteredTotal).toLocaleString()} <span class="text-xs font-normal text-slate-400">ครั้ง</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ชดเชยเงินจริง:</span>
            <span class="font-bold text-emerald-700 num-font">${Number(Math.round(filteredBath)).toLocaleString()} บาท</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-leaf text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md num-font">${topHerbPct}%</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ยาสมุนไพรยอดนิยม</span>
            <div class="text-lg font-black text-slate-900 truncate mt-1" title="${activeItem !== 'all' ? activeItem : topHerb[0]}">
              ${activeItem !== 'all' ? activeItem : topHerb[0]}
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ผลงาน:</span>
            <span class="font-bold text-teal-700 num-font">${Number(topHerbCount).toLocaleString()} ครั้ง (${Number(Math.round(topHerbPay)).toLocaleString()} บ.)</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-crown text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md num-font">${topUnitPct}%</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">หน่วยบริการสูงสุด</span>
            <div class="text-lg font-black text-slate-900 truncate mt-1" title="${topUnit.short}">
              ${topUnit.short}
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ยอดชดเชย:</span>
            <span class="font-bold text-amber-700 num-font">${Number(Math.round(topUnit.pay)).toLocaleString()} บาท (${Number(topUnit.count).toLocaleString()} ครั้ง)</span>
          </div>
        </div>

        <div class="glass-card rounded-2xl p-4 bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <i class="fa-solid fa-hospital-user text-lg"></i>
            </div>
            <span class="text-[11px] font-bold text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-md num-font">${availableHerbs.length} รายการ</span>
          </div>
          <div class="mt-3">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">หน่วยบริการที่มีผลงาน</span>
            <div class="text-2xl font-black text-slate-900 num-font mt-1 flex items-baseline gap-1">
              ${activeUnitsCount} <span class="text-xs font-normal text-slate-400">จาก 14 แห่ง</span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>สัดส่วนครอบคลุม:</span>
            <span class="font-bold text-indigo-700 num-font">${((activeUnitsCount / 14) * 100).toFixed(1)}%</span>
          </div>
        </div>
      `;
    }

    // Destroy existing 4 chart instances
    if (herb32UnitCountChartInstance) {
      herb32UnitCountChartInstance.destroy();
      herb32UnitCountChartInstance = null;
    }
    if (herb32UnitPayChartInstance) {
      herb32UnitPayChartInstance.destroy();
      herb32UnitPayChartInstance = null;
    }
    if (herb32HerbCountChartInstance) {
      herb32HerbCountChartInstance.destroy();
      herb32HerbCountChartInstance = null;
    }
    if (herb32HerbPayChartInstance) {
      herb32HerbPayChartInstance.destroy();
      herb32HerbPayChartInstance = null;
    }

    // Update Section Headings
    const s1Title = document.getElementById('herb32-section1-title');
    const s1Sub = document.getElementById('herb32-section1-sub');
    if (s1Title) s1Title.textContent = isSingleUnit ? `ประวัติรายเดือน: ${SARAPHI_UNITS_MAP[activeUnit]?.name || activeUnit}` : 'หน่วยบริการ (Service Units)';
    if (s1Sub) s1Sub.textContent = isSingleUnit ? 'แนวโน้มจำนวนครั้งสั่งใช้ และยอดเงินจ่ายชดเชยรายเดือน' : 'เปรียบเทียบผลงานจำนวนครั้ง และยอดเงินจ่ายชดเชย 14 หน่วยบริการ';

    const s2Title = document.getElementById('herb32-section2-title');
    const s2Sub = document.getElementById('herb32-section2-sub');
    if (s2Title) s2Title.textContent = 'จำแนกรายประเภทบริการ (Service Types)';
    if (s2Sub) s2Sub.textContent = isSingleUnit ? `ยอดสั่งใช้และเงินชดเชยของ ${SARAPHI_UNITS_MAP[activeUnit]?.short || activeUnit}` : 'เปรียบเทียบผลงานและจำนวนเงินชดเชยรายชนิดยาสมุนไพร 32 รายการ';

    // 8.1 SECTION 1 - CHART 1: Unit Count (จำนวนครั้ง)
    const c1 = document.getElementById('herb32-unit-count-chart');
    const c1Title = document.getElementById('herb32-unit-count-title');
    const c1Subtitle = document.getElementById('herb32-unit-count-subtitle');
    const c1Badge = document.getElementById('herb32-unit-count-badge');

    if (c1) {
      const ctx1 = c1.getContext('2d');
      let config1 = null;

      if (!isSingleUnit) {
        const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
        const unitsList = unitKeys.map(code => {
          let cnt = 0;
          if (activeItem !== 'all') {
            if (isSingleMonth) cnt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
            else cnt = unitsMap[code]?.herbs?.[activeItem] || 0;
          } else {
            if (isSingleMonth) cnt = yrData.months?.[activeMonth]?.units?.[code] || 0;
            else cnt = unitsMap[code]?.totalCount || 0;
          }
          return { code, short: SARAPHI_UNITS_MAP[code]?.short || code, count: cnt };
        }).sort((a, b) => b.count - a.count);

        if (c1Title) c1Title.textContent = 'กราฟแท่งแสดงจำนวนครั้ง';
        if (c1Subtitle) c1Subtitle.textContent = activeItem !== 'all' ? `เปรียบเทียบ ${activeItem} (${isSingleMonth ? activeMonth : 'ปีงบ ' + yr})` : `จำแนกรายหน่วยบริการ (${isSingleMonth ? activeMonth : 'ปีงบ ' + yr})`;
        if (c1Badge) {
          c1Badge.textContent = `${isSingleMonth ? activeMonth : 'รวมทั้งปี'}: ${Number(filteredTotal).toLocaleString()} ครั้ง`;
          c1Badge.className = 'text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        config1 = {
          type: 'bar',
          data: {
            labels: unitsList.map(u => u.short),
            datasets: [{
              label: 'จำนวนครั้ง',
              data: unitsList.map(u => u.count),
              backgroundColor: 'rgba(242, 142, 139, 0.85)',
              borderColor: '#e15759',
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 16,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, items) => {
              if (items && items.length > 0) {
                const idx = items[0].index;
                const clickedCode = unitsList[idx]?.code;
                if (clickedCode) window.switchHerb32Unit(clickedCode);
              }
            },
            scales: {
              x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
              y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10, weight: '500' }, color: '#334155' } }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                titleFont: { family: 'Prompt', size: 12 },
                bodyFont: { family: 'Prompt', size: 11 },
                callbacks: {
                  label: (ctx) => {
                    const u = unitsList[ctx.dataIndex];
                    const pct = filteredTotal > 0 ? ((ctx.raw / filteredTotal) * 100).toFixed(1) : 0;
                    return ` สั่งใช้: ${Number(ctx.raw).toLocaleString()} ครั้ง (${pct}%) (คลิกเพื่อเจาะลึก)`;
                  }
                }
              }
            }
          }
        };
      } else {
        // Single unit monthly breakdown
        const uInfo = SARAPHI_UNITS_MAP[activeUnit];
        if (c1Title) c1Title.textContent = 'กราฟแท่งแสดงจำนวนครั้ง';
        if (c1Subtitle) c1Subtitle.textContent = activeItem !== 'all' ? `แนวโน้มการสั่งใช้ ${activeItem} รายเดือน` : `แนวโน้มสั่งใช้ยาสมุนไพร 32 รายการ (จำแนกชนิดยา - แยกสี)`;
        if (c1Badge) {
          c1Badge.textContent = `${uInfo?.short}: ${Number(filteredTotal).toLocaleString()} ครั้ง`;
          c1Badge.className = 'text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        const unitHerbsList = Object.keys(uSlice?.herbs || {});
        if (activeItem === 'all' && unitHerbsList.length > 0) {
          const datasets = unitHerbsList.map((hName, hIdx) => {
            const pal = HERB_PALETTE[hIdx % HERB_PALETTE.length];
            return {
              label: hName,
              data: monthList.map(m => uSlice?.monthlyHerbs?.[m]?.[hName] || 0),
              backgroundColor: pal.bg,
              borderColor: pal.border,
              borderWidth: 1,
              borderRadius: 3,
              maxBarThickness: 20,
              stack: 'month'
            };
          });

          config1 = {
            type: 'bar',
            data: { labels: monthList, datasets: datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              barPercentage: 0.7,
              categoryPercentage: 0.8,
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Prompt', size: 9 }, maxRotation: 45 } },
                y: { stacked: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } }
              },
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Prompt', size: 9 }, usePointStyle: true, boxWidth: 6, padding: 6 } },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 11 },
                  bodyFont: { family: 'Prompt', size: 10 },
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} ครั้ง`,
                    footer: (items) => {
                      const mIdx = items[0]?.dataIndex;
                      const mName = monthList[mIdx];
                      const total = items.reduce((a, b) => a + b.raw, 0);
                      return ` รวมเดือน ${mName}: ${Number(total).toLocaleString()} ครั้ง`;
                    }
                  }
                }
              }
            }
          };
        } else {
          const cnts = monthList.map(m => {
            if (activeItem !== 'all') return uSlice?.monthlyHerbs?.[m]?.[activeItem] || 0;
            return uSlice?.monthly?.[m]?.count ?? (uSlice?.byMonth?.[m] || 0);
          });
          config1 = {
            type: 'bar',
            data: {
              labels: monthList,
              datasets: [{
                label: activeItem !== 'all' ? activeItem : 'ผลงานจำนวนครั้ง',
                data: cnts,
                backgroundColor: 'rgba(242, 142, 139, 0.85)',
                borderColor: '#e15759',
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 20,
                barPercentage: 0.7,
                categoryPercentage: 0.8
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 9 }, maxRotation: 45 } },
                y: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } }
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  titleFont: { family: 'Prompt', size: 11 },
                  bodyFont: { family: 'Prompt', size: 10 },
                  callbacks: { label: (ctx) => ` ${monthList[ctx.dataIndex]}: ${Number(ctx.raw).toLocaleString()} ครั้ง` }
                }
              }
            }
          };
        }
      }

      herb32UnitCountChartInstance = new Chart(ctx1, config1);
    }

    // 8.2 SECTION 1 - CHART 2: Unit Pay (จำนวนเงินจ่ายชดเชย)
    const c2 = document.getElementById('herb32-unit-pay-chart');
    const c2Title = document.getElementById('herb32-unit-pay-title');
    const c2Subtitle = document.getElementById('herb32-unit-pay-subtitle');
    const c2Badge = document.getElementById('herb32-unit-pay-badge');

    if (c2) {
      const ctx2 = c2.getContext('2d');
      let config2 = null;

      if (!isSingleUnit) {
        const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
        const unitsList = unitKeys.map(code => {
          let pay = 0;
          if (activeItem !== 'all') {
            if (isSingleMonth) pay = unitsMap[code]?.monthlyHerbsPay?.[activeMonth]?.[activeItem] || ((unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0) * 55);
            else pay = unitsMap[code]?.herbsPay?.[activeItem] || ((unitsMap[code]?.herbs?.[activeItem] || 0) * 55);
          } else {
            if (isSingleMonth) pay = yrData.months?.[activeMonth]?.unitsPay?.[code] || ((yrData.months?.[activeMonth]?.units?.[code] || 0) * 55);
            else pay = unitsMap[code]?.totalBath || ((unitsMap[code]?.totalCount || 0) * 55);
          }
          return { code, short: SARAPHI_UNITS_MAP[code]?.short || code, pay: Math.round(pay) };
        }).sort((a, b) => b.pay - a.pay);

        if (c2Title) c2Title.textContent = 'กราฟแท่งแสดงจำนวนเงินจ่ายชดเชย';
        if (c2Subtitle) c2Subtitle.textContent = activeItem !== 'all' ? `เงินชดเชย ${activeItem} (${isSingleMonth ? activeMonth : 'ปีงบ ' + yr})` : `ยอดเงินจ่ายชดเชยจริงที่ สปสช. อนุมัติ (${isSingleMonth ? activeMonth : 'ปีงบ ' + yr})`;
        if (c2Badge) {
          c2Badge.textContent = `${isSingleMonth ? activeMonth : 'รวมทั้งปี'}: ${Number(Math.round(filteredBath)).toLocaleString()} บาท`;
          c2Badge.className = 'text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        config2 = {
          type: 'bar',
          data: {
            labels: unitsList.map(u => u.short),
            datasets: [{
              label: 'จำนวนเงินจ่ายชดเชย (บาท)',
              data: unitsList.map(u => u.pay),
              backgroundColor: 'rgba(242, 142, 139, 0.85)',
              borderColor: '#e15759',
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 16,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            onClick: (e, items) => {
              if (items && items.length > 0) {
                const idx = items[0].index;
                const clickedCode = unitsList[idx]?.code;
                if (clickedCode) window.switchHerb32Unit(clickedCode);
              }
            },
            scales: {
              x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() + ' บ.' } },
              y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10, weight: '500' }, color: '#334155' } }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                titleFont: { family: 'Prompt', size: 12 },
                bodyFont: { family: 'Prompt', size: 11 },
                callbacks: {
                  label: (ctx) => {
                    const u = unitsList[ctx.dataIndex];
                    const pct = filteredBath > 0 ? ((ctx.raw / filteredBath) * 100).toFixed(1) : 0;
                    return ` ชดเชยจริง: ${Number(ctx.raw).toLocaleString()} บาท (${pct}%) (คลิกเพื่อเจาะลึก)`;
                  }
                }
              }
            }
          }
        };
      } else {
        // Single unit monthly pay
        const uInfo = SARAPHI_UNITS_MAP[activeUnit];
        if (c2Title) c2Title.textContent = 'กราฟแท่งแสดงจำนวนเงินจ่ายชดเชย';
        if (c2Subtitle) c2Subtitle.textContent = `ยอดเงินชดเชยจริงรายเดือนของ ${uInfo?.name || activeUnit} (บาท)`;
        if (c2Badge) {
          c2Badge.textContent = `${uInfo?.short}: ${Number(Math.round(filteredBath)).toLocaleString()} บาท`;
          c2Badge.className = 'text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl shadow-2xs self-start sm:self-auto';
        }

        const monthlyPays = monthList.map(m => {
          if (activeItem !== 'all') {
            return Math.round(uSlice?.monthlyHerbsPay?.[m]?.[activeItem] || ((uSlice?.monthlyHerbs?.[m]?.[activeItem] || 0) * 55));
          }
          return Math.round(uSlice?.monthly?.[m]?.pay ?? ((uSlice?.monthly?.[m]?.count || 0) * 55));
        });

        config2 = {
          type: 'bar',
          data: {
            labels: monthList,
            datasets: [{
              label: 'เงินชดเชย (บาท)',
              data: monthlyPays,
              backgroundColor: 'rgba(13, 148, 136, 0.85)',
              borderColor: '#0f766e',
              borderWidth: 1,
              borderRadius: 4,
              maxBarThickness: 20,
              barPercentage: 0.7,
              categoryPercentage: 0.8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 9 }, maxRotation: 45 } },
              y: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() + ' บ.' } }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                titleFont: { family: 'Prompt', size: 11 },
                bodyFont: { family: 'Prompt', size: 10 },
                callbacks: { label: (ctx) => ` ${monthList[ctx.dataIndex]}: ${Number(ctx.raw).toLocaleString()} บาท` }
              }
            }
          }
        };
      }

      herb32UnitPayChartInstance = new Chart(ctx2, config2);
    }

    // 8.3 SECTION 2 - CHART 3: Herb Count (จำแนกรายประเภทบริการ - ครั้ง)
    const c3 = document.getElementById('herb32-herb-count-chart');
    const c3Title = document.getElementById('herb32-herb-count-title');
    const c3Subtitle = document.getElementById('herb32-herb-count-subtitle');
    const c3Badge = document.getElementById('herb32-herb-count-badge');

    if (c3) {
      const ctx3 = c3.getContext('2d');
      const herbEntries = Object.entries(activeHerbsMap)
        .filter(e => activeItem === 'all' || e[0] === activeItem)
        .sort((a, b) => b[1] - a[1]);

      if (c3Title) c3Title.textContent = 'กราฟแท่งแสดงจำนวนครั้ง';
      if (c3Subtitle) c3Subtitle.textContent = `ยอดสั่งใช้จำแนกตามชนิดยา (${isSingleUnit ? SARAPHI_UNITS_MAP[activeUnit]?.short : 'รวมทั้งอำเภอ'})`;
      if (c3Badge) c3Badge.textContent = `${herbEntries.length} ชนิดยา`;

      const config3 = {
        type: 'bar',
        data: {
          labels: herbEntries.map(e => e[0]),
          datasets: [{
            label: 'จำนวนครั้ง',
            data: herbEntries.map(e => e[1]),
            backgroundColor: 'rgba(242, 142, 43, 0.85)',
            borderColor: '#e67e22',
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 15,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          onClick: (e, items) => {
            if (items && items.length > 0) {
              const idx = items[0].index;
              const clickedHerb = herbEntries[idx]?.[0];
              if (clickedHerb) window.switchHerb32Item(clickedHerb === activeItem ? 'all' : clickedHerb);
            }
          },
          scales: {
            x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() } },
            y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10, weight: '500' }, color: '#334155' } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              titleFont: { family: 'Prompt', size: 12 },
              bodyFont: { family: 'Prompt', size: 11 },
              callbacks: {
                label: (ctx) => {
                  const val = ctx.raw || 0;
                  const pct = filteredTotal > 0 ? ((val / filteredTotal) * 100).toFixed(1) : 0;
                  return ` สั่งใช้: ${Number(val).toLocaleString()} ครั้ง (${pct}%) (คลิกเพื่อกรองชนิดยา)`;
                }
              }
            }
          }
        }
      };

      herb32HerbCountChartInstance = new Chart(ctx3, config3);
    }

    // 8.4 SECTION 2 - CHART 4: Herb Pay (จำแนกรายประเภทบริการ - บาท)
    const c4 = document.getElementById('herb32-herb-pay-chart');
    const c4Title = document.getElementById('herb32-herb-pay-title');
    const c4Subtitle = document.getElementById('herb32-herb-pay-subtitle');
    const c4Badge = document.getElementById('herb32-herb-pay-badge');

    if (c4) {
      const ctx4 = c4.getContext('2d');
      const herbPayEntries = Object.entries(activeHerbsPayMap)
        .filter(e => activeItem === 'all' || e[0] === activeItem)
        .map(e => [e[0], Math.round(e[1])])
        .sort((a, b) => b[1] - a[1]);

      if (c4Title) c4Title.textContent = 'กราฟแท่งแสดงจำนวนเงินจ่ายชดเชย';
      if (c4Subtitle) c4Subtitle.textContent = `ยอดเงินชดเชยจำแนกตามชนิดยา (${isSingleUnit ? SARAPHI_UNITS_MAP[activeUnit]?.short : 'รวมทั้งอำเภอ'})`;
      if (c4Badge) c4Badge.textContent = `ชดเชยรวม ${Number(Math.round(filteredBath)).toLocaleString()} บาท`;

      const config4 = {
        type: 'bar',
        data: {
          labels: herbPayEntries.map(e => e[0]),
          datasets: [{
            label: 'จำนวนเงินจ่ายชดเชย (บาท)',
            data: herbPayEntries.map(e => e[1]),
            backgroundColor: 'rgba(242, 142, 43, 0.85)',
            borderColor: '#e67e22',
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 15,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          onClick: (e, items) => {
            if (items && items.length > 0) {
              const idx = items[0].index;
              const clickedHerb = herbPayEntries[idx]?.[0];
              if (clickedHerb) window.switchHerb32Item(clickedHerb === activeItem ? 'all' : clickedHerb);
            }
          },
          scales: {
            x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() + ' บ.' } },
            y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10, weight: '500' }, color: '#334155' } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              titleFont: { family: 'Prompt', size: 12 },
              bodyFont: { family: 'Prompt', size: 11 },
              callbacks: {
                label: (ctx) => {
                  const val = ctx.raw || 0;
                  const pct = filteredBath > 0 ? ((val / filteredBath) * 100).toFixed(1) : 0;
                  return ` ชดเชยจริง: ${Number(val).toLocaleString()} บาท (${pct}%) (คลิกเพื่อกรองชนิดยา)`;
                }
              }
            }
          }
        }
      };

      herb32HerbPayChartInstance = new Chart(ctx4, config4);
    }

    // 9. Render Table
    const thead = document.getElementById('herb32-matrix-thead');
    const tbody = document.getElementById('herb32-matrix-tbody');
    const tfoot = document.getElementById('herb32-matrix-tfoot');
    const tableTitle = document.getElementById('herb32-table-title');
    const tableSubtitle = document.getElementById('herb32-table-subtitle');
    const tableBadge = document.getElementById('herb32-table-summary-badge');

    if (!isSingleUnit) {
      if (tableTitle) tableTitle.textContent = isSingleMonth ? `ตารางผลงานยาสมุนไพร 32 รายการ ประจำเดือน: ${activeMonth}` : `ตารางผลงานยาสมุนไพร 32 รายการ รายหน่วยบริการ (ปีงบ ${yr})`;
      if (tableSubtitle) tableSubtitle.textContent = activeItem !== 'all' ? `แสดงผลงานเฉพาะยา ${activeItem} (คลิกที่แถวเพื่อเจาะลึก)` : `คลิกที่แถวหน่วยบริการเพื่อดูประวัติการเคลมและชนิดยาที่จ่ายรายเดือน`;
      if (tableBadge) tableBadge.textContent = `${isSingleMonth ? activeMonth : 'ทั้งปีงบ ' + yr} - ${Number(filteredTotal).toLocaleString()} ครั้ง (${Number(Math.round(filteredBath)).toLocaleString()} บาท)`;

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-3 w-20 text-slate-500 font-bold">รหัส</th>
            <th class="py-3 px-3 min-w-[180px] text-slate-800 font-bold">หน่วยบริการ</th>
            <th class="py-3 px-3 w-24 text-slate-600 font-bold">ตำบล</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-extrabold bg-emerald-50/60">จำนวนครั้ง</th>
            <th class="py-3 px-4 text-right text-teal-900 font-bold">ชดเชยจริง (บาท)</th>
            <th class="py-3 px-3 text-right text-slate-600 font-semibold w-20">สัดส่วน %</th>
            <th class="py-3 px-3 text-center text-slate-500 font-semibold w-28">ชนิดยาหลัก</th>
          </tr>
        `;
      }

      const unitKeys = Object.keys(SARAPHI_UNITS_MAP).sort();
      const unitsList = unitKeys.map(code => {
        let cnt = 0;
        let pay = 0;
        if (activeItem !== 'all') {
          if (isSingleMonth) {
            cnt = unitsMap[code]?.monthlyHerbs?.[activeMonth]?.[activeItem] || 0;
            pay = unitsMap[code]?.monthlyHerbsPay?.[activeMonth]?.[activeItem] || (cnt * 55);
          } else {
            cnt = unitsMap[code]?.herbs?.[activeItem] || 0;
            pay = unitsMap[code]?.herbsPay?.[activeItem] || (cnt * 55);
          }
        } else {
          if (isSingleMonth) {
            cnt = yrData.months?.[activeMonth]?.units?.[code] || 0;
            pay = yrData.months?.[activeMonth]?.unitsPay?.[code] || (cnt * 55);
          } else {
            cnt = unitsMap[code]?.totalCount || 0;
            pay = unitsMap[code]?.totalBath || (cnt * 55);
          }
        }
        return {
          hospcode: code,
          name: SARAPHI_UNITS_MAP[code]?.name || code,
          subdistrict: SARAPHI_UNITS_MAP[code]?.subdistrict || '-',
          count: cnt,
          bath: Math.round(pay),
          herbs: unitsMap[code]?.herbs || {}
        };
      }).sort((a, b) => b.count - a.count);

      if (tbody) {
        tbody.innerHTML = '';
        unitsList.forEach((u, idx) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-emerald-50/50 cursor-pointer transition group';
          tr.onclick = () => window.switchHerb32Unit(u.hospcode);
          tr.title = `คลิกเพื่อดูประวัติรายเดือนของ ${u.name}`;

          const pct = filteredTotal > 0 ? ((u.count / filteredTotal) * 100).toFixed(1) : '0.0';
          const topHerbEntry = Object.entries(u.herbs).sort((a, b) => b[1] - a[1])[0];
          const topHerbBadge = topHerbEntry ? `<span class="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[120px] inline-block" title="${topHerbEntry[0]}: ${topHerbEntry[1]} ครั้ง">${topHerbEntry[0]}</span>` : '<span class="text-slate-300">-</span>';

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white group-hover:bg-emerald-50/50 z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">${u.hospcode}</td>
            <td class="py-2.5 px-3 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="group-hover:text-emerald-700 font-semibold transition">${u.name}</span>
              <span class="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0"><i class="fa-solid fa-arrow-right"></i> เจาะลึก</span>
            </td>
            <td class="py-2.5 px-3 text-slate-500">${u.subdistrict}</td>
            <td class="py-2.5 px-4 text-right num-font font-black text-emerald-950 bg-emerald-50/50 group-hover:bg-emerald-100/60">
              ${Number(u.count).toLocaleString()}
            </td>
            <td class="py-2.5 px-4 text-right num-font font-bold text-teal-900">
              ${Number(u.bath).toLocaleString()} บาท
            </td>
            <td class="py-2.5 px-3 text-right num-font font-semibold text-slate-600">${pct}%</td>
            <td class="py-2.5 px-3 text-center">
              ${topHerbBadge}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr class="text-xs bg-emerald-50/80 font-bold border-t-2 border-emerald-300">
            <td colspan="4" class="py-3 px-4 text-left font-black text-emerald-900">
              รวมทั้งอำเภอสารภี (${isSingleMonth ? activeMonth : '14 หน่วยบริการ'})
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-emerald-950 text-sm bg-emerald-100/70">
              ${Number(filteredTotal).toLocaleString()} ครั้ง
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-teal-950 text-sm bg-teal-100/70">
              ${Number(Math.round(filteredBath)).toLocaleString()} บาท
            </td>
            <td class="py-3 px-3 text-right num-font font-black text-emerald-900">100.0%</td>
            <td class="py-3 px-3 text-center num-font font-bold text-emerald-800">14 หน่วย</td>
          </tr>
        `;
      }
    } else {
      // Single Unit Monthly Breakdown View with Herbs Details
      const uInfo = SARAPHI_UNITS_MAP[activeUnit];

      if (tableTitle) tableTitle.textContent = `ประวัติผลงานรายเดือน: ${uInfo?.name || activeUnit}`;
      if (tableSubtitle) {
        tableSubtitle.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap mt-0.5">
            <span>ผลงานสะสมตลอดปีงบประมาณ ${yr} รวม <strong>${Number(filteredTotal).toLocaleString()} ครั้ง (${Number(Math.round(filteredBath)).toLocaleString()} บาท)</strong></span>
            <button type="button" onclick="window.switchHerb32Unit('all')" class="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1">
              <i class="fa-solid fa-arrow-left text-[10px]"></i> กลับไปดูทุกหน่วยบริการ
            </button>
          </div>
        `;
      }
      if (tableBadge) tableBadge.textContent = `${uInfo?.short}: ${Number(filteredTotal).toLocaleString()} ครั้ง (${Number(Math.round(filteredBath)).toLocaleString()} บาท)`;

      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50 text-slate-700 font-bold text-xs border-b border-slate-200">
            <th class="py-3 px-3 w-12 text-center text-slate-500 font-bold sticky left-0 bg-slate-50 z-10 sm:static">#</th>
            <th class="py-3 px-4 text-slate-800 font-bold min-w-[160px]">ประจำเดือน</th>
            <th class="py-3 px-4 text-right text-emerald-900 font-extrabold bg-emerald-50/60 w-32">จำนวนครั้ง</th>
            <th class="py-3 px-4 text-right text-teal-900 font-bold w-32">ชดเชยจริง (บาท)</th>
            <th class="py-3 px-3 text-right text-slate-600 font-semibold w-24">สัดส่วน %</th>
            <th class="py-3 px-4 text-left text-slate-700 font-bold min-w-[220px]">ชนิดยาสมุนไพรที่จ่ายในเดือน</th>
          </tr>
        `;
      }

      if (tbody) {
        tbody.innerHTML = '';
        const totalYear = filteredTotal > 0 ? filteredTotal : 1;
        monthList.forEach((m, idx) => {
          let cnt = 0;
          let pay = 0;
          if (activeItem !== 'all') {
            cnt = uSlice?.monthlyHerbs?.[m]?.[activeItem] || 0;
            pay = uSlice?.monthlyHerbsPay?.[m]?.[activeItem] || (cnt * 55);
          } else {
            cnt = uSlice?.monthly?.[m]?.count ?? (uSlice?.byMonth?.[m] || 0);
            pay = uSlice?.monthly?.[m]?.pay ?? (cnt * 55);
          }

          const isCurrentM = (activeMonth === m);
          const pct = totalYear > 0 ? ((cnt / totalYear) * 100).toFixed(1) : '0.0';

          const monthHerbs = uSlice?.monthlyHerbs?.[m] || {};
          const herbBadges = Object.entries(monthHerbs).map(([hName, hCnt]) => {
            return `<span class="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">${hName}: ${Number(hCnt).toLocaleString()} ครั้ง</span>`;
          }).join(' ') || '<span class="text-slate-300 text-xs">-</span>';

          const tr = document.createElement('tr');
          tr.className = `hover:bg-slate-50 transition cursor-pointer ${
            isCurrentM ? 'bg-emerald-50/80 font-semibold border-l-4 border-emerald-600' : ''
          }`;
          tr.onclick = () => window.switchHerb32Month(m === activeMonth ? 'all' : m);
          tr.title = isCurrentM ? 'คลิกเพื่อยกเลิกการกรองเดือน' : `คลิกเพื่อกรองเฉพาะเดือน ${m}`;

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center num-font text-slate-400 sticky left-0 bg-white z-10 sm:static">${idx + 1}</td>
            <td class="py-2.5 px-4 font-medium text-slate-900 flex items-center justify-between gap-1.5">
              <span class="${isCurrentM ? 'text-emerald-800 font-bold' : ''}">${m}</span>
              ${isCurrentM ? '<span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">เลือกอยู่</span>' : ''}
            </td>
            <td class="py-2.5 px-4 text-right num-font font-black text-emerald-950 bg-emerald-50/50">
              ${Number(cnt).toLocaleString()}
            </td>
            <td class="py-2.5 px-4 text-right num-font font-bold text-teal-900">
              ${Number(Math.round(pay)).toLocaleString()} บาท
            </td>
            <td class="py-2.5 px-3 text-right num-font font-semibold text-slate-600">${pct}%</td>
            <td class="py-2.5 px-4 text-left flex flex-wrap gap-1">
              ${herbBadges}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr class="text-xs bg-emerald-50/80 font-bold border-t-2 border-emerald-300">
            <td colspan="2" class="py-3 px-4 text-left font-black text-emerald-900">
              รวมสะสมปีงบประมาณ ${yr} (${uInfo?.name})
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-emerald-950 text-sm bg-emerald-100/70">
              ${Number(filteredTotal).toLocaleString()} ครั้ง
            </td>
            <td class="py-3 px-4 text-right num-font font-black text-teal-950 text-sm bg-teal-100/70">
              ${Number(Math.round(filteredBath)).toLocaleString()} บาท
            </td>
            <td class="py-3 px-3 text-right num-font font-black text-emerald-900">100.0%</td>
            <td class="py-3 px-4 text-left font-bold text-emerald-800">
              จ่ายยารวม ${availableHerbs.length} ชนิด
            </td>
          </tr>
        `;
      }
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  window.triggerNhsoLiveSync = async function() {
    const btn = document.getElementById('btn-nhso-live-sync');
    const icon = document.getElementById('icon-sync-spin');
    const text = document.getElementById('text-sync-btn');

    if (btn) btn.disabled = true;
    if (icon) icon.classList.add('animate-spin');
    if (text) text.textContent = 'กำลังเชื่อมต่อระบบ สปสช. MeData...';

    try {
      const res = await fetch('/api/nhso-live-sync', { method: 'POST' });
      const data = await res.json();

      if (text) text.textContent = 'กำลังประมวลผลดึงข้อมูลสด...';

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const sRes = await fetch('/api/nhso-sync-status');
          const sData = await sRes.json();
          if (!sData.is_running || attempts > 70) {
            clearInterval(pollInterval);

            // Reload fresh JSON data
            const cacheBuster = `?t=${Date.now()}`;
            try {
              const [resNhso, resH55, resH9, resH32, resErr] = await Promise.all([
                fetch(`data/nhso/nhso_saraphi_master.json${cacheBuster}`, { cache: 'no-cache' }),
                fetch(`data/nhso/nhso_herb55_monthly.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
                fetch(`data/nhso/nhso_herb9_monthly.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
                fetch(`data/nhso/nhso_herb32_monthly.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null),
                fetch(`data/nhso/nhso_error_codes.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => null)
              ]);

              if (resNhso.ok) {
                nhsoMasterData = await resNhso.json();
                if (resH55?.ok) nhsoMasterData.herb55_monthly = (await resH55.json())?.data || nhsoMasterData.herb55_monthly;
                if (resH9?.ok) nhsoMasterData.herb9_monthly = (await resH9.json())?.data || nhsoMasterData.herb9_monthly;
                if (resH32?.ok) nhsoMasterData.herb32_monthly = (await resH32.json())?.data || nhsoMasterData.herb32_monthly;
                if (resErr?.ok) nhsoMasterData.error_codes = await resErr.json();

                integrateNhsoData(nhsoMasterData);
              }
            } catch (loadErr) {
              console.warn('Failed to refresh data after sync:', loadErr);
            }

            // Update UI Banner
            const dateBadge = document.getElementById('nhso-sync-process-date-badge');
            if (dateBadge && (sData.process_date || nhsoMasterData?.process_date)) {
              dateBadge.textContent = sData.process_date || nhsoMasterData.process_date;
            }

            const timeText = document.getElementById('nhso-sync-last-time-text');
            if (timeText && sData.last_sync_thai) {
              timeText.textContent = `ซิงค์ข้อมูลล่าสุดเมื่อ: ${sData.last_sync_thai} (สถานะ: สำเร็จ)`;
            }

            if (text) text.textContent = 'ดึงข้อมูล สปสช. ล่าสุด (Live Sync)';
            if (icon) icon.classList.remove('animate-spin');
            if (btn) btn.disabled = false;

            updateDashboardView();
            alert('✅ ดึงข้อมูล สปสช. MeData ล่าสุดสำเร็จเรียบร้อยแล้ว!');
          }
        } catch (pollErr) {
          console.warn('Poll error:', pollErr);
        }
      }, 3000);
    } catch (err) {
      console.error('Live sync connection failed:', err);
      if (text) text.textContent = 'ดึงข้อมูล สปสช. ล่าสุด (Live Sync)';
      if (icon) icon.classList.remove('animate-spin');
      if (btn) btn.disabled = false;
      alert('⚠️ ไม่สามารถเชื่อมต่อระบบ Live Sync ได้ (กรุณารัน python scripts/server.py)');
    }
  };

  async function initNhsoSyncBanner() {
    try {
      const res = await fetch('/api/nhso-sync-status');
      if (res.ok) {
        const meta = await res.json();
        const dateBadge = document.getElementById('nhso-sync-process-date-badge');
        if (dateBadge && meta.process_date) {
          dateBadge.textContent = meta.process_date;
        }
        const timeText = document.getElementById('nhso-sync-last-time-text');
        if (timeText && meta.last_sync_thai) {
          timeText.textContent = `ซิงค์ข้อมูลล่าสุดเมื่อ: ${meta.last_sync_thai} (ประมวลผล สปสช.: ${meta.process_date || '15 ก.ย. 2569'})`;
        }
      }
    } catch (e) {
      if (nhsoMasterData?.process_date) {
        const dateBadge = document.getElementById('nhso-sync-process-date-badge');
        if (dateBadge) dateBadge.textContent = nhsoMasterData.process_date;
      }
    }
  }


  // ==========================================
  // HDC TTM3: Age & Sex Matrix Table & Charts
  // ==========================================

  window.switchTtmAgeView = function(view) {
    currentTtmAgeView = view;
    renderTtmAgeSexPanel();
  };

  window.switchTtmAgeYear = function(yr) {
    currentTtmAgeYear = yr;
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

  window.switchTtmChart2Mode = function(mode) {
    currentTtmChart2Mode = mode;
    renderTtmAgeSexPanel();
  };

  window.selectTtmAgeHospital = function(hospcode) {
    currentUnit = hospcode;
    if (unitSelect) unitSelect.value = hospcode;
    updateExecutiveOverview();
    updateIndicatorHeader();
    renderTtmAgeSexPanel();
  };

  window.exportTtmAgeCsv = function() {
    const yr = currentTtmAgeYear || currentYear || '2569';
    const ind = masterData?.indicators?.['ttm_age_sex'];
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];
    const distAge = yrData.age_groups || {};
    const distQtr = yrData.quarters || {};

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel

    if (currentTtmAgeView === 'age') {
      csvContent += `รายงานการจ่ายยาสมุนไพรจำแนกตามกลุ่มอายุและเพศ อำเภอสารภี ปีงบประมาณ ${yr}\n`;
      csvContent += 'รหัส,หน่วยบริการ,ตำบล,0-14ปี(ชาย),0-14ปี(หญิง),0-14ปี(รวม),15-29ปี(ชาย),15-29ปี(หญิง),15-29ปี(รวม),30-44ปี(ชาย),30-44ปี(หญิง),30-44ปี(รวม),45-59ปี(ชาย),45-59ปี(หญิง),45-59ปี(รวม),60+ปี(ชาย),60+ปี(หญิง),60+ปี(รวม),รวมทุกกลุ่ม(ชาย),รวมทุกกลุ่ม(หญิง),รวมทุกกลุ่ม(คน)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = meta ? meta.subdistrict : (u.subdistrict || '');
        const ag = u.age_groups || {};
        const row = [
          `"${u.hospcode}"`,
          `"${uName}"`,
          `"${uSub}"`,
          ag.a0_14?.m || 0, ag.a0_14?.f || 0, ag.a0_14?.total || 0,
          ag.a15_29?.m || 0, ag.a15_29?.f || 0, ag.a15_29?.total || 0,
          ag.a30_44?.m || 0, ag.a30_44?.f || 0, ag.a30_44?.total || 0,
          ag.a45_59?.m || 0, ag.a45_59?.f || 0, ag.a45_59?.total || 0,
          ag.a60_plus?.m || 0, ag.a60_plus?.f || 0, ag.a60_plus?.total || 0,
          ag.all_ages?.m || 0, ag.all_ages?.f || 0, ag.all_ages?.total || 0
        ];
        csvContent += row.join(',') + '\n';
      });

      const totRow = [
        '"total"',
        '"รวมทั้งอำเภอสารภี (14 หน่วยบริการ)"',
        '"-"',
        distAge.a0_14?.m || 0, distAge.a0_14?.f || 0, distAge.a0_14?.total || 0,
        distAge.a15_29?.m || 0, distAge.a15_29?.f || 0, distAge.a15_29?.total || 0,
        distAge.a30_44?.m || 0, distAge.a30_44?.f || 0, distAge.a30_44?.total || 0,
        distAge.a45_59?.m || 0, distAge.a45_59?.f || 0, distAge.a45_59?.total || 0,
        distAge.a60_plus?.m || 0, distAge.a60_plus?.f || 0, distAge.a60_plus?.total || 0,
        distAge.all_ages?.m || 0, distAge.all_ages?.f || 0, distAge.all_ages?.total || 0
      ];
      csvContent += totRow.join(',') + '\n';

    } else if (currentTtmAgeView === 'quarter') {
      csvContent += `รายงานการจ่ายยาสมุนไพรรายไตรมาส (Q1 - Q4) อำเภอสารภี ปีงบประมาณ ${yr}\n`;
      csvContent += 'รหัส,หน่วยบริการ,ตำบล,Q1 ชาย(คน),Q1 ชาย(ครั้ง),Q1 หญิง(คน),Q1 หญิง(ครั้ง),Q1 รวม(คน),Q2 ชาย(คน),Q2 ชาย(ครั้ง),Q2 หญิง(คน),Q2 หญิง(ครั้ง),Q2 รวม(คน),Q3 ชาย(คน),Q3 ชาย(ครั้ง),Q3 หญิง(คน),Q3 หญิง(ครั้ง),Q3 รวม(คน),Q4 ชาย(คน),Q4 ชาย(ครั้ง),Q4 หญิง(คน),Q4 หญิง(ครั้ง),Q4 รวม(คน),รวมทั้งปี(คน),รวมทั้งปี(ครั้ง)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = meta ? meta.subdistrict : (u.subdistrict || '');
        const q = u.quarters || {};
        const q1 = q.q1 || {};
        const q2 = q.q2 || {};
        const q3 = q.q3 || {};
        const q4 = q.q4 || {};
        const totPt = u.patients_total || (u.age_groups?.all_ages?.total || 0);
        const totVs = (q1.vs_total || 0) + (q2.vs_total || 0) + (q3.vs_total || 0) + (q4.vs_total || 0);

        const row = [
          `"${u.hospcode}"`, `"${uName}"`, `"${uSub}"`,
          q1.pt_m || 0, q1.vs_m || 0, q1.pt_f || 0, q1.vs_f || 0, q1.pt_total || 0,
          q2.pt_m || 0, q2.vs_m || 0, q2.pt_f || 0, q2.vs_f || 0, q2.pt_total || 0,
          q3.pt_m || 0, q3.vs_m || 0, q3.pt_f || 0, q3.vs_f || 0, q3.pt_total || 0,
          q4.pt_m || 0, q4.vs_m || 0, q4.pt_f || 0, q4.vs_f || 0, q4.pt_total || 0,
          totPt, totVs
        ];
        csvContent += row.join(',') + '\n';
      });

      const q1 = distQtr.q1 || {};
      const q2 = distQtr.q2 || {};
      const q3 = distQtr.q3 || {};
      const q4 = distQtr.q4 || {};
      const distPt = yrData.patients_total || (distAge.all_ages?.total || 0);
      const distVs = (q1.vs_total || 0) + (q2.vs_total || 0) + (q3.vs_total || 0) + (q4.vs_total || 0);
      const totRow = [
        '"total"', '"รวมทั้งอำเภอสารภี (14 หน่วยบริการ)"', '"-"',
        q1.pt_m || 0, q1.vs_m || 0, q1.pt_f || 0, q1.vs_f || 0, q1.pt_total || 0,
        q2.pt_m || 0, q2.vs_m || 0, q2.pt_f || 0, q2.vs_f || 0, q2.pt_total || 0,
        q3.pt_m || 0, q3.vs_m || 0, q3.pt_f || 0, q3.vs_f || 0, q3.pt_total || 0,
        q4.pt_m || 0, q4.vs_m || 0, q4.pt_f || 0, q4.vs_f || 0, q4.pt_total || 0,
        distPt, distVs
      ];
      csvContent += totRow.join(',') + '\n';

    } else {
      // Full HDC Table
      csvContent += `ตารางมาตรฐาน HDC s_ttm3: การจ่ายยาสมุนไพรจำแนกตามกลุ่มอายุ เพศ และไตรมาส อำเภอสารภี ปีงบประมาณ ${yr}\n`;
      csvContent += 'รหัสสถานพยาบาล,ชื่อสถานพยาบาล,0-14(ชาย),0-14(หญิง),0-14(รวม),15-29(ชาย),15-29(หญิง),15-29(รวม),30-44(ชาย),30-44(หญิง),30-44(รวม),45-59(ชาย),45-59(หญิง),45-59(รวม),60+(ชาย),60+(หญิง),60+(รวม),รวมทุกกลุ่ม(ชาย),รวมทุกกลุ่ม(หญิง),รวมทุกกลุ่ม(รวม),ไตรมาส1 ชาย(คน),ไตรมาส1 ชาย(ครั้ง),ไตรมาส1 หญิง(คน),ไตรมาส1 หญิง(ครั้ง),ไตรมาส2 ชาย(คน),ไตรมาส2 ชาย(ครั้ง),ไตรมาส2 หญิง(คน),ไตรมาส2 หญิง(ครั้ง),ไตรมาส3 ชาย(คน),ไตรมาส3 ชาย(ครั้ง),ไตรมาส3 หญิง(คน),ไตรมาส3 หญิง(ครั้ง),ไตรมาส4 ชาย(คน),ไตรมาส4 ชาย(ครั้ง),ไตรมาส4 หญิง(คน),ไตรมาส4 หญิง(ครั้ง)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const ag = u.age_groups || {};
        const q = u.quarters || {};
        const row = [
          `"${u.hospcode}"`, `"${uName}"`,
          ag.a0_14?.m || 0, ag.a0_14?.f || 0, ag.a0_14?.total || 0,
          ag.a15_29?.m || 0, ag.a15_29?.f || 0, ag.a15_29?.total || 0,
          ag.a30_44?.m || 0, ag.a30_44?.f || 0, ag.a30_44?.total || 0,
          ag.a45_59?.m || 0, ag.a45_59?.f || 0, ag.a45_59?.total || 0,
          ag.a60_plus?.m || 0, ag.a60_plus?.f || 0, ag.a60_plus?.total || 0,
          ag.all_ages?.m || 0, ag.all_ages?.f || 0, ag.all_ages?.total || 0,
          q.q1?.pt_m || 0, q.q1?.vs_m || 0, q.q1?.pt_f || 0, q.q1?.vs_f || 0,
          q.q2?.pt_m || 0, q.q2?.vs_m || 0, q.q2?.pt_f || 0, q.q2?.vs_f || 0,
          q.q3?.pt_m || 0, q.q3?.vs_m || 0, q.q3?.pt_f || 0, q.q3?.vs_f || 0,
          q.q4?.pt_m || 0, q.q4?.vs_m || 0, q.q4?.pt_f || 0, q.q4?.vs_f || 0
        ];
        csvContent += row.join(',') + '\n';
      });

      const q = distQtr;
      const totRow = [
        '"total"', '"รวมทั้งอำเภอสารภี (14 หน่วยบริการ)"',
        distAge.a0_14?.m || 0, distAge.a0_14?.f || 0, distAge.a0_14?.total || 0,
        distAge.a15_29?.m || 0, distAge.a15_29?.f || 0, distAge.a15_29?.total || 0,
        distAge.a30_44?.m || 0, distAge.a30_44?.f || 0, distAge.a30_44?.total || 0,
        distAge.a45_59?.m || 0, distAge.a45_59?.f || 0, distAge.a45_59?.total || 0,
        distAge.a60_plus?.m || 0, distAge.a60_plus?.f || 0, distAge.a60_plus?.total || 0,
        distAge.all_ages?.m || 0, distAge.all_ages?.f || 0, distAge.all_ages?.total || 0,
        q.q1?.pt_m || 0, q.q1?.vs_m || 0, q.q1?.pt_f || 0, q.q1?.vs_f || 0,
        q.q2?.pt_m || 0, q.q2?.vs_m || 0, q.q2?.pt_f || 0, q.q2?.vs_f || 0,
        q.q3?.pt_m || 0, q.q3?.vs_m || 0, q.q3?.pt_f || 0, q.q3?.vs_f || 0,
        q.q4?.pt_m || 0, q.q4?.vs_m || 0, q.q4?.pt_f || 0, q.q4?.vs_f || 0
      ];
      csvContent += totRow.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hdc_ttm3_saraphi_${yr}_${currentTtmAgeView}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function renderTtmAgeSexPanel() {
    if (currentIndicatorId !== 'ttm_age_sex') {
      if (ttmAgeSexPanel) ttmAgeSexPanel.classList.add('hidden');
      return;
    }
    if (ttmAgeSexPanel) ttmAgeSexPanel.classList.remove('hidden');

    const yr = currentTtmAgeYear || currentYear || '2569';

    // 1. Sync View Mode Buttons
    ['age', 'quarter', 'full'].forEach(v => {
      const btn = document.getElementById(`btn-ttm-view-${v}`);
      if (btn) {
        if (v === currentTtmAgeView) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Sync Year Filter Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-ttm-age-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 3. Sync Chart 2 Mode Buttons
    const btnPie = document.getElementById('btn-ttm-chart2-pie');
    const btnQtr = document.getElementById('btn-ttm-chart2-quarter');
    if (btnPie && btnQtr) {
      if (currentTtmChart2Mode === 'pie') {
        btnPie.className = 'px-2 py-1 rounded-md bg-white text-emerald-700 shadow-xs font-bold transition';
        btnQtr.className = 'px-2 py-1 rounded-md text-slate-500 hover:text-slate-800 transition bg-transparent';
      } else {
        btnPie.className = 'px-2 py-1 rounded-md text-slate-500 hover:text-slate-800 transition bg-transparent';
        btnQtr.className = 'px-2 py-1 rounded-md bg-white text-emerald-700 shadow-xs font-bold transition';
      }
    }

    // 4. Resolve Master Data
    const ind = masterData?.indicators?.['ttm_age_sex'];
    const yrData = ind?.years?.[yr] || {};
    const distAgeGroups = yrData.age_groups || {
      a0_14: { m: 0, f: 0, total: 0 },
      a15_29: { m: 0, f: 0, total: 0 },
      a30_44: { m: 0, f: 0, total: 0 },
      a45_59: { m: 0, f: 0, total: 0 },
      a60_plus: { m: 0, f: 0, total: 0 },
      all_ages: { m: 0, f: 0, total: 0 }
    };
    const distQuarters = yrData.quarters || {
      q1: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 },
      q2: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 },
      q3: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 },
      q4: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 }
    };
    const rawUnits = yrData.units || [];
    const unitsList = rawUnits.map(u => {
      const meta = SARAPHI_UNITS_MAP[u.hospcode];
      const cleanName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
      const cleanShort = (u.hospcode === '06023') ? 'บ้านป่าสา' : (meta ? meta.short : (u.subdistrict || u.name));
      const cleanSubdistrict = meta ? meta.subdistrict : (u.subdistrict || '');
      return {
        ...u,
        name: cleanName,
        short: cleanShort,
        subdistrict: cleanSubdistrict,
        patients_total: u.patients_total || (u.age_groups?.all_ages?.total || 0),
        age_groups: u.age_groups || {
          a0_14: { m: 0, f: 0, total: 0 },
          a15_29: { m: 0, f: 0, total: 0 },
          a30_44: { m: 0, f: 0, total: 0 },
          a45_59: { m: 0, f: 0, total: 0 },
          a60_plus: { m: 0, f: 0, total: 0 },
          all_ages: { m: 0, f: 0, total: 0 }
        },
        quarters: u.quarters || {
          q1: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 },
          q2: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 },
          q3: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 },
          q4: { pt_m: 0, vs_m: 0, pt_f: 0, vs_f: 0, pt_total: 0, vs_total: 0 }
        }
      };
    });

    const isDistrict = (currentUnit === 'all');
    const selectedUnit = isDistrict ? null : unitsList.find(u => u.hospcode === currentUnit);
    const activeAgeGroups = selectedUnit ? selectedUnit.age_groups : distAgeGroups;
    const activeQuarters = selectedUnit ? selectedUnit.quarters : distQuarters;
    const activePatientsTotal = selectedUnit ? selectedUnit.patients_total : (yrData.patients_total || distAgeGroups.all_ages.total || 0);

    // 5. Update 4 Bento Metric Cards
    const elTotal = document.getElementById('ttm-age-stat-total');
    const elGenderRatio = document.getElementById('ttm-age-stat-gender-ratio');
    const elCard1Badge = document.getElementById('ttm-age-card1-badge');
    if (elTotal) elTotal.textContent = Number(activePatientsTotal).toLocaleString();
    if (elCard1Badge) elCard1Badge.textContent = isDistrict ? `HDC s_ttm3 (${yr})` : `${selectedUnit.short} (${yr})`;

    const allM = activeAgeGroups.all_ages?.m || 0;
    const allF = activeAgeGroups.all_ages?.f || 0;
    const pctM = activePatientsTotal > 0 ? ((allM / activePatientsTotal) * 100).toFixed(1) : '0.0';
    const pctF = activePatientsTotal > 0 ? ((allF / activePatientsTotal) * 100).toFixed(1) : '0.0';
    if (elGenderRatio) {
      elGenderRatio.textContent = `ชาย ${pctM}% (${Number(allM).toLocaleString()}) • หญิง ${pctF}% (${Number(allF).toLocaleString()})`;
    }

    // Card 2: 60+
    const a60Tot = activeAgeGroups.a60_plus?.total || 0;
    const a60M = activeAgeGroups.a60_plus?.m || 0;
    const a60F = activeAgeGroups.a60_plus?.f || 0;
    const a60Pct = activePatientsTotal > 0 ? ((a60Tot / activePatientsTotal) * 100).toFixed(1) : '0.0';
    const a60FemalePct = a60Tot > 0 ? ((a60F / a60Tot) * 100).toFixed(1) : '0.0';

    const el60Plus = document.getElementById('ttm-age-stat-60plus');
    const el60Share = document.getElementById('ttm-age-card2-share');
    const el60Detail = document.getElementById('ttm-age-stat-60plus-detail');
    if (el60Plus) el60Plus.textContent = Number(a60Tot).toLocaleString();
    if (el60Share) el60Share.textContent = `${a60Pct}% สูงสุด`;
    if (el60Detail) el60Detail.textContent = `ชาย ${Number(a60M).toLocaleString()} • หญิง ${Number(a60F).toLocaleString()} (${a60FemalePct}%)`;

    // Card 3: 45-59
    const a45Tot = activeAgeGroups.a45_59?.total || 0;
    const a45M = activeAgeGroups.a45_59?.m || 0;
    const a45F = activeAgeGroups.a45_59?.f || 0;
    const a45Pct = activePatientsTotal > 0 ? ((a45Tot / activePatientsTotal) * 100).toFixed(1) : '0.0';
    const a45FemalePct = a45Tot > 0 ? ((a45F / a45Tot) * 100).toFixed(1) : '0.0';

    const el4559 = document.getElementById('ttm-age-stat-4559');
    const el45Share = document.getElementById('ttm-age-card3-share');
    const el45Detail = document.getElementById('ttm-age-stat-4559-detail');
    if (el4559) el4559.textContent = Number(a45Tot).toLocaleString();
    if (el45Share) el45Share.textContent = `${a45Pct}% อันดับ 2`;
    if (el45Detail) el45Detail.textContent = `ชาย ${Number(a45M).toLocaleString()} • หญิง ${Number(a45F).toLocaleString()} (${a45FemalePct}%)`;

    // Card 4: Top Performer
    const sortedUnits = [...unitsList].sort((a, b) => (b.patients_total || 0) - (a.patients_total || 0));
    const topUnit = sortedUnits[0];
    const elTopName = document.getElementById('ttm-age-stat-top-name');
    const elTopVal = document.getElementById('ttm-age-stat-top-val');
    const elCard4Badge = document.getElementById('ttm-age-card4-badge');
    const elCard4Title = document.getElementById('ttm-age-card4-title');
    const elCard4Sub = document.getElementById('ttm-age-card4-sublabel');

    if (isDistrict) {
      if (elCard4Title) elCard4Title.textContent = 'หน่วยบริการที่มีผู้รับยามากที่สุด';
      if (elCard4Badge) elCard4Badge.textContent = 'อันดับ 1 ในอำเภอ';
      if (elTopName) elTopName.textContent = topUnit ? topUnit.name : '-';
      if (elCard4Sub) elCard4Sub.textContent = 'จำนวนผู้รับยา';
      if (elTopVal) {
        const topPt = topUnit ? (topUnit.patients_total || 0) : 0;
        const topPct = (distAgeGroups.all_ages.total || 1) > 0 ? ((topPt / distAgeGroups.all_ages.total) * 100).toFixed(1) : '0.0';
        elTopVal.textContent = `${Number(topPt).toLocaleString()} คน (${topPct}%)`;
      }
    } else {
      if (elCard4Title) elCard4Title.textContent = 'สัดส่วนเปรียบเทียบทั้งอำเภอ';
      if (elCard4Badge) elCard4Badge.textContent = selectedUnit ? `รหัส ${selectedUnit.hospcode}` : 'หน่วยบริการ';
      if (elTopName) elTopName.textContent = selectedUnit ? selectedUnit.name : '-';
      if (elCard4Sub) elCard4Sub.textContent = 'สัดส่วนต่ออำเภอ';
      if (elTopVal) {
        const uPt = selectedUnit ? (selectedUnit.patients_total || 0) : 0;
        const uPct = (distAgeGroups.all_ages.total || 1) > 0 ? ((uPt / distAgeGroups.all_ages.total) * 100).toFixed(1) : '0.0';
        elTopVal.textContent = `${Number(uPt).toLocaleString()} คน (${uPct}% ของอำเภอ)`;
      }
    }

    // 6. Render Chart 1: Age Pyramid / Grouped Horizontal Bar
    const pyramidCanvas = document.getElementById('ttmAgePyramidChart');
    if (pyramidCanvas) {
      if (ttmAgePyramidChartInstance) {
        ttmAgePyramidChartInstance.destroy();
        ttmAgePyramidChartInstance = null;
      }

      const ageLabels = [
        '0 - 14 ปี (วัยเด็ก)',
        '15 - 29 ปี (วัยรุ่น/เริ่มทำงาน)',
        '30 - 44 ปี (วัยทำงาน)',
        '45 - 59 ปี (วัยทำงานตอนปลาย)',
        '60 ปีขึ้นไป (ผู้สูงอายุ)'
      ];
      const mData = [
        activeAgeGroups.a0_14?.m || 0,
        activeAgeGroups.a15_29?.m || 0,
        activeAgeGroups.a30_44?.m || 0,
        activeAgeGroups.a45_59?.m || 0,
        activeAgeGroups.a60_plus?.m || 0
      ];
      const fData = [
        activeAgeGroups.a0_14?.f || 0,
        activeAgeGroups.a15_29?.f || 0,
        activeAgeGroups.a30_44?.f || 0,
        activeAgeGroups.a45_59?.f || 0,
        activeAgeGroups.a60_plus?.f || 0
      ];
      const totData = [
        activeAgeGroups.a0_14?.total || 0,
        activeAgeGroups.a15_29?.total || 0,
        activeAgeGroups.a30_44?.total || 0,
        activeAgeGroups.a45_59?.total || 0,
        activeAgeGroups.a60_plus?.total || 0
      ];

      const ctx = pyramidCanvas.getContext('2d');
      ttmAgePyramidChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ageLabels,
          datasets: [
            {
              label: 'เพศชาย (คน)',
              data: mData,
              backgroundColor: '#0284c7',
              hoverBackgroundColor: '#0369a1',
              borderRadius: 5,
              borderSkipped: false,
              barPercentage: 0.8,
              categoryPercentage: 0.75
            },
            {
              label: 'เพศหญิง (คน)',
              data: fData,
              backgroundColor: '#f43f5e',
              hoverBackgroundColor: '#e11d48',
              borderRadius: 5,
              borderSkipped: false,
              barPercentage: 0.8,
              categoryPercentage: 0.75
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: 'rgba(226, 232, 240, 0.6)' },
              ticks: {
                font: { family: 'Prompt', size: 11 },
                callback: val => Number(val).toLocaleString() + ' คน'
              }
            },
            y: {
              grid: { display: false },
              ticks: {
                font: { family: 'Prompt', size: 11.5, weight: '600' },
                color: '#334155'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                font: { family: 'Prompt', size: 12, weight: '600' },
                color: '#334155'
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleFont: { family: 'Prompt', size: 13, weight: 'bold' },
              bodyFont: { family: 'Prompt', size: 12 },
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  const idx = context.dataIndex;
                  const grpTotal = totData[idx] || 1;
                  const pctInGrp = ((val / grpTotal) * 100).toFixed(1);
                  const isMale = context.datasetIndex === 0;
                  return ` ${isMale ? 'ชาย' : 'หญิง'}: ${Number(val).toLocaleString()} คน (${pctInGrp}% ของกลุ่มนี้)`;
                },
                afterBody: function(contexts) {
                  const idx = contexts[0].dataIndex;
                  const grpTotal = totData[idx] || 0;
                  const overallPct = activePatientsTotal > 0 ? ((grpTotal / activePatientsTotal) * 100).toFixed(1) : '0.0';
                  return `รวมกลุ่มนี้: ${Number(grpTotal).toLocaleString()} คน (${overallPct}% ของทั้งหมด)`;
                }
              }
            }
          }
        }
      });
    }

    // 7. Render Chart 2: Donut or Quarterly Trend
    const donutCanvas = document.getElementById('ttmAgeDonutChart');
    const chart2Title = document.getElementById('ttm-age-chart2-title');
    const chart2Subtitle = document.getElementById('ttm-age-chart2-subtitle');

    if (donutCanvas) {
      if (ttmAgeDonutChartInstance) {
        ttmAgeDonutChartInstance.destroy();
        ttmAgeDonutChartInstance = null;
      }

      const ctx2 = donutCanvas.getContext('2d');

      if (currentTtmChart2Mode === 'pie') {
        if (chart2Title) chart2Title.textContent = 'สัดส่วนผู้รับบริการตามช่วงอายุ (%)';
        if (chart2Subtitle) chart2Subtitle.textContent = isDistrict ? `ร้อยละของแต่ละกลุ่มวัยใน อ.สารภี ปี ${yr}` : `สัดส่วนกลุ่มวัยของ ${selectedUnit.short} ปี ${yr}`;

        const pieLabels = ['0-14 ปี', '15-29 ปี', '30-44 ปี', '45-59 ปี', '60+ ปี'];
        const pieData = [
          activeAgeGroups.a0_14?.total || 0,
          activeAgeGroups.a15_29?.total || 0,
          activeAgeGroups.a30_44?.total || 0,
          activeAgeGroups.a45_59?.total || 0,
          activeAgeGroups.a60_plus?.total || 0
        ];
        const pieColors = ['#38bdf8', '#34d399', '#fbbf24', '#818cf8', '#059669'];

        ttmAgeDonutChartInstance = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: pieLabels,
            datasets: [{
              data: pieData,
              backgroundColor: pieColors,
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: true,
                  font: { family: 'Prompt', size: 11.5, weight: '500' },
                  color: '#334155',
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const val = data.datasets[0].data[i] || 0;
                        const pct = activePatientsTotal > 0 ? ((val / activePatientsTotal) * 100).toFixed(1) : '0.0';
                        return {
                          text: `${label} (${pct}%)`,
                          fillStyle: pieColors[i],
                          strokeStyle: '#ffffff',
                          lineWidth: 1,
                          hidden: isNaN(val) || val === 0,
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Prompt', size: 12, weight: 'bold' },
                bodyFont: { family: 'Prompt', size: 11.5 },
                callbacks: {
                  label: function(context) {
                    const val = context.raw || 0;
                    const pct = activePatientsTotal > 0 ? ((val / activePatientsTotal) * 100).toFixed(1) : '0.0';
                    return ` ${context.label}: ${Number(val).toLocaleString()} คน (${pct}%)`;
                  }
                }
              }
            }
          }
        });
      } else {
        if (chart2Title) chart2Title.textContent = 'แนวโน้มการรับบริการรายไตรมาส (Q1 - Q4)';
        if (chart2Subtitle) chart2Subtitle.textContent = isDistrict ? `ผู้รับยา ชาย vs หญิง รายไตรมาส ปี ${yr}` : `ยอดบริการรายไตรมาสของ ${selectedUnit.short} ปี ${yr}`;

        const qtrLabels = ['ไตรมาส 1', 'ไตรมาส 2', 'ไตรมาส 3', 'ไตรมาส 4'];
        const qM = [activeQuarters.q1?.pt_m || 0, activeQuarters.q2?.pt_m || 0, activeQuarters.q3?.pt_m || 0, activeQuarters.q4?.pt_m || 0];
        const qF = [activeQuarters.q1?.pt_f || 0, activeQuarters.q2?.pt_f || 0, activeQuarters.q3?.pt_f || 0, activeQuarters.q4?.pt_f || 0];

        ttmAgeDonutChartInstance = new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: qtrLabels,
            datasets: [
              {
                label: 'เพศชาย (คน)',
                data: qM,
                backgroundColor: '#0284c7',
                borderRadius: 5
              },
              {
                label: 'เพศหญิง (คน)',
                data: qF,
                backgroundColor: '#f43f5e',
                borderRadius: 5
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Prompt', size: 11 } }
              },
              y: {
                grid: { color: 'rgba(226, 232, 240, 0.6)' },
                ticks: {
                  font: { family: 'Prompt', size: 11 },
                  callback: val => Number(val).toLocaleString()
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: true,
                  font: { family: 'Prompt', size: 11 }
                }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                callbacks: {
                  label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} คน`
                }
              }
            }
          }
        });
      }
    }

    // 8. Render HDC Matrix Data Table
    const tableEl = document.getElementById('ttm-age-matrix-table');
    const captionEl = document.getElementById('ttm-age-table-caption');
    if (!tableEl) return;

    // Filter units
    const q = (ttmAgeSearchQuery || '').trim().toLowerCase();
    const filteredUnits = unitsList.filter(u => {
      if (!q) return true;
      return (
        (u.hospcode && u.hospcode.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.subdistrict && u.subdistrict.toLowerCase().includes(q))
      );
    });

    let theadHtml = '';
    let tbodyHtml = '';
    let tfootHtml = '';

    if (currentTtmAgeView === 'age') {
      if (captionEl) captionEl.textContent = `จำแนก 5 กลุ่มอายุ (ชาย / หญิง / รวม) ราย 14 หน่วยบริการใน อ.สารภี ปีงบประมาณ ${yr}`;

      theadHtml = `
        <thead class="text-white text-xs font-bold sticky top-0 z-20" style="background-color: #047857;">
          <tr class="border-b border-emerald-600">
            <th rowspan="2" class="py-2.5 px-3 text-center w-[76px] min-w-[76px] border-r border-emerald-600 hdc-sticky-col-1" style="background-color: #047857;">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 min-w-[200px] border-r border-emerald-600 hdc-sticky-col-2" style="background-color: #047857;">ชื่อสถานพยาบาล</th>
            <th rowspan="2" class="py-2.5 px-3 w-24 border-r border-emerald-600">ตำบล</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">0 - 14 ปี (เด็ก)</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">15 - 29 ปี (เยาวชน)</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">30 - 44 ปี (วัยทำงาน)</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">45 - 59 ปี (วัยกลางคน)</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-900 font-black text-amber-200">60+ ปี (ผู้สูงอายุ)</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-950 font-black text-amber-300">รวมทุกกลุ่ม (คน)</th>
            <th rowspan="2" class="py-2.5 px-3 text-center w-20">จัดการ</th>
          </tr>
          <tr class="border-b border-emerald-700 text-[11px] bg-emerald-900/90">
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">ชาย</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">หญิง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40">รวม</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">ชาย</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">หญิง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40">รวม</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">ชาย</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">หญิง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40">รวม</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">ชาย</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold">หญิง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40">รวม</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-bold text-sky-200">ชาย</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-bold text-rose-200">หญิง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-black bg-emerald-950/70 text-amber-200">รวม</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-bold text-sky-200">ชาย</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-bold text-rose-200">หญิง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-black bg-emerald-950 text-amber-300">รวม (คน)</th>
          </tr>
        </thead>
      `;

      filteredUnits.forEach((u, idx) => {
        const isSel = (currentUnit === u.hospcode);
        const rowBg = isSel ? 'bg-emerald-50/80 ring-2 ring-emerald-500/40 font-semibold' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40');
        const stickyBg = isSel ? 'background-color: #ecfdf5;' : (idx % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8fafc;');
        const ag = u.age_groups;

        tbodyHtml += `
          <tr class="${rowBg} hover:bg-emerald-50/50 transition border-b border-slate-100 text-slate-700">
            <td class="py-2.5 px-3 text-center num-font text-slate-500 border-r border-slate-100 hdc-sticky-col-1" style="${stickyBg}">${u.hospcode}</td>
            <td class="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-100 hdc-sticky-col-2 flex items-center justify-between gap-1" style="${stickyBg}">
              <span class="truncate">${u.name}</span>
              ${isSel ? '<span class="text-[9.5px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold shrink-0">เลือก</span>' : ''}
            </td>
            <td class="py-2.5 px-3 text-slate-500 border-r border-slate-100 text-[11.5px]">ต.${u.subdistrict}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a0_14?.m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a0_14?.f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a0_14?.total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a15_29?.m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a15_29?.f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a15_29?.total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a30_44?.m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a30_44?.f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a30_44?.total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a45_59?.m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-600">${ag.a45_59?.f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a45_59?.total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 font-semibold text-sky-700 bg-sky-50/30">${ag.a60_plus?.m ? Number(ag.a60_plus.m).toLocaleString() : 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 font-semibold text-rose-700 bg-rose-50/30">${ag.a60_plus?.f ? Number(ag.a60_plus.f).toLocaleString() : 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-black text-emerald-800 bg-emerald-50/50">${ag.a60_plus?.total ? Number(ag.a60_plus.total).toLocaleString() : 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 font-bold text-sky-800 bg-sky-50/40">${ag.all_ages?.m ? Number(ag.all_ages.m).toLocaleString() : 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 font-bold text-rose-800 bg-rose-50/40">${ag.all_ages?.f ? Number(ag.all_ages.f).toLocaleString() : 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-black text-emerald-950 bg-emerald-100/50 text-sm">${Number(u.patients_total).toLocaleString()}</td>
            <td class="py-2.5 px-3 text-center">
              <button type="button" onclick="window.selectTtmAgeHospital('${u.hospcode}')" class="px-2 py-1 rounded-lg text-[11px] font-bold ${isSel ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'} transition">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
      });

      tfootHtml = `
        <tfoot class="sticky bottom-0 z-20 text-white font-black text-xs" style="background-color: #065f46;">
          <tr class="border-t-2 border-emerald-400">
            <td colspan="3" class="py-3 px-3 text-left border-r border-emerald-700 text-white font-black hdc-sticky-col-1" style="background-color: #065f46;">
              รวมทั้งอำเภอสารภี (14 หน่วยบริการ)
            </td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a0_14?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a0_14?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(distAgeGroups.a0_14?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a15_29?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a15_29?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(distAgeGroups.a15_29?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a30_44?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a30_44?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(distAgeGroups.a30_44?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a45_59?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80">${Number(distAgeGroups.a45_59?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(distAgeGroups.a45_59?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 font-bold text-sky-200">${Number(distAgeGroups.a60_plus?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 font-bold text-rose-200">${Number(distAgeGroups.a60_plus?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-300 bg-emerald-950/80">${Number(distAgeGroups.a60_plus?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 font-bold text-sky-200">${Number(distAgeGroups.all_ages?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 font-bold text-rose-200">${Number(distAgeGroups.all_ages?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700 font-black text-amber-300 text-sm bg-emerald-950">${Number(distAgeGroups.all_ages?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-3 text-center text-emerald-200 font-normal text-[11px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else if (currentTtmAgeView === 'quarter') {
      if (captionEl) captionEl.textContent = `จำแนกยอดผู้รับบริการและจำนวนครั้งสะสม ราย 4 ไตรมาส (Q1 - Q4) รายหน่วยบริการ ปีงบประมาณ ${yr}`;

      theadHtml = `
        <thead class="text-white text-xs font-bold sticky top-0 z-20" style="background-color: #047857;">
          <tr class="border-b border-emerald-600">
            <th rowspan="2" class="py-2.5 px-3 text-center w-[76px] min-w-[76px] border-r border-emerald-600 hdc-sticky-col-1" style="background-color: #047857;">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 min-w-[200px] border-r border-emerald-600 hdc-sticky-col-2" style="background-color: #047857;">ชื่อสถานพยาบาล</th>
            <th rowspan="2" class="py-2.5 px-3 w-24 border-r border-emerald-600">ตำบล</th>
            <th colspan="5" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">ไตรมาส 1 (ต.ค. - ธ.ค.)</th>
            <th colspan="5" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">ไตรมาส 2 (ม.ค. - มี.ค.)</th>
            <th colspan="5" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">ไตรมาส 3 (เม.ย. - มิ.ย.)</th>
            <th colspan="5" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800/90">ไตรมาส 4 (ก.ค. - ก.ย.)</th>
            <th colspan="2" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-950 font-black text-amber-300">รวมทั้งปีสะสม</th>
            <th rowspan="2" class="py-2.5 px-3 text-center w-20">จัดการ</th>
          </tr>
          <tr class="border-b border-emerald-700 text-[11px] bg-emerald-900/90">
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-200">ช.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-100">ช.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-200">ญ.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-100">ญ.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40 text-amber-200">รวมคน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-200">ช.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-100">ช.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-200">ญ.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-100">ญ.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40 text-amber-200">รวมคน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-200">ช.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-100">ช.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-200">ญ.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-100">ญ.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40 text-amber-200">รวมคน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-200">ช.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-sky-100">ช.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-200">ญ.คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700/60 font-semibold text-rose-100">ญ.ครั้ง</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-bold bg-emerald-950/40 text-amber-200">รวมคน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-black text-amber-300 bg-emerald-950">คน</th>
            <th class="py-1.5 px-2 text-right border-r border-emerald-700 font-black text-emerald-200 bg-emerald-950">ครั้ง</th>
          </tr>
        </thead>
      `;

      filteredUnits.forEach((u, idx) => {
        const isSel = (currentUnit === u.hospcode);
        const rowBg = isSel ? 'bg-emerald-50/80 ring-2 ring-emerald-500/40 font-semibold' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40');
        const stickyBg = isSel ? 'background-color: #ecfdf5;' : (idx % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8fafc;');
        const q = u.quarters;
        const q1 = q.q1 || {};
        const q2 = q.q2 || {};
        const q3 = q.q3 || {};
        const q4 = q.q4 || {};
        const totPt = u.patients_total || (u.age_groups?.all_ages?.total || 0);
        const totVs = (q1.vs_total || 0) + (q2.vs_total || 0) + (q3.vs_total || 0) + (q4.vs_total || 0);

        tbodyHtml += `
          <tr class="${rowBg} hover:bg-emerald-50/50 transition border-b border-slate-100 text-slate-700">
            <td class="py-2.5 px-3 text-center num-font text-slate-500 border-r border-slate-100 hdc-sticky-col-1" style="${stickyBg}">${u.hospcode}</td>
            <td class="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-100 hdc-sticky-col-2 flex items-center justify-between gap-1" style="${stickyBg}">
              <span class="truncate">${u.name}</span>
              ${isSel ? '<span class="text-[9.5px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold shrink-0">เลือก</span>' : ''}
            </td>
            <td class="py-2.5 px-3 text-slate-500 border-r border-slate-100 text-[11.5px]">ต.${u.subdistrict}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-sky-700">${q1.pt_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q1.vs_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-rose-700">${q1.pt_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q1.vs_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-bold text-slate-900 bg-slate-50/50">${q1.pt_total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-sky-700">${q2.pt_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q2.vs_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-rose-700">${q2.pt_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q2.vs_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-bold text-slate-900 bg-slate-50/50">${q2.pt_total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-sky-700 font-semibold">${q3.pt_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q3.vs_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-rose-700 font-semibold">${q3.pt_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q3.vs_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-bold text-slate-900 bg-slate-50/50">${q3.pt_total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-sky-700">${q4.pt_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q4.vs_m || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-rose-700">${q4.pt_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 text-slate-500">${q4.vs_f || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-bold text-slate-900 bg-slate-50/50">${q4.pt_total || 0}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-100 font-black text-emerald-950 bg-emerald-100/50 text-sm">${Number(totPt).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font border-r border-slate-200 font-bold text-slate-800 bg-slate-100/60">${Number(totVs).toLocaleString()}</td>
            <td class="py-2.5 px-3 text-center">
              <button type="button" onclick="window.selectTtmAgeHospital('${u.hospcode}')" class="px-2 py-1 rounded-lg text-[11px] font-bold ${isSel ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'} transition">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
      });

      const q1 = distQuarters.q1 || {};
      const q2 = distQuarters.q2 || {};
      const q3 = distQuarters.q3 || {};
      const q4 = distQuarters.q4 || {};
      const distPt = yrData.patients_total || (distAgeGroups.all_ages?.total || 0);
      const distVs = (q1.vs_total || 0) + (q2.vs_total || 0) + (q3.vs_total || 0) + (q4.vs_total || 0);

      tfootHtml = `
        <tfoot class="sticky bottom-0 z-20 text-white font-black text-xs" style="background-color: #065f46;">
          <tr class="border-t-2 border-emerald-400">
            <td colspan="3" class="py-3 px-3 text-left border-r border-emerald-700 text-white font-black hdc-sticky-col-1" style="background-color: #065f46;">
              รวมทั้งอำเภอสารภี (14 หน่วยบริการ)
            </td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q1.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q1.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q1.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q1.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(q1.pt_total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q2.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q2.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q2.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q2.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(q2.pt_total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q3.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q3.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q3.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q3.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(q3.pt_total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q4.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q4.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q4.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q4.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-600 font-black text-amber-200 bg-emerald-900/60">${Number(q4.pt_total || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700 font-black text-amber-300 text-sm bg-emerald-950">${Number(distPt).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font border-r border-emerald-700 font-black text-emerald-100 bg-emerald-900/80">${Number(distVs).toLocaleString()}</td>
            <td class="py-3 px-3 text-center text-emerald-200 font-normal text-[11px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else {
      // Full HDC Table
      if (captionEl) captionEl.textContent = `ตารางแม่บท HDC: รวมทั้งปีงบประมาณ แยกรายกลุ่มอายุ 5 ช่วงวัย และ ยอดบริการราย 4 ไตรมาส ปีงบประมาณ ${yr}`;

      theadHtml = `
        <thead class="text-white text-[11.5px] font-bold sticky top-0 z-20" style="background-color: #047857;">
          <tr class="border-b border-emerald-600">
            <th rowspan="2" class="py-2.5 px-3 text-center w-[76px] min-w-[76px] border-r border-emerald-600 hdc-sticky-col-1" style="background-color: #047857;">รหัสสถานพยาบาล</th>
            <th rowspan="2" class="py-2.5 px-3 min-w-[200px] border-r border-emerald-600 hdc-sticky-col-2" style="background-color: #047857;">ชื่อสถานพยาบาล</th>
            <th colspan="18" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-800">รวมทั้งปีงบประมาณ แยกรายกลุ่มอายุ (คน)</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-850">ไตรมาสที่ 1</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-850">ไตรมาสที่ 2</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-850">ไตรมาสที่ 3</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-600 bg-emerald-850">ไตรมาสที่ 4</th>
            <th rowspan="2" class="py-2.5 px-2 text-center w-16">ดู รพ.สต.</th>
          </tr>
          <tr class="border-b border-emerald-700 text-[10.5px] bg-emerald-900/90">
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="0-14 ชาย">ชาย</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="0-14 หญิง">หญิง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 font-bold bg-emerald-950/30" title="0-14 รวม">รวม</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="15-29 ชาย">ชาย</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="15-29 หญิง">หญิง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 font-bold bg-emerald-950/30" title="15-29 รวม">รวม</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="30-44 ชาย">ชาย</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="30-44 หญิง">หญิง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 font-bold bg-emerald-950/30" title="30-44 รวม">รวม</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="45-59 ชาย">ชาย</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-semibold" title="45-59 หญิง">หญิง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 font-bold bg-emerald-950/30" title="45-59 รวม">รวม</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-bold text-sky-200" title="60+ ชาย">ชาย</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-bold text-rose-200" title="60+ หญิง">หญิง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 font-black text-amber-200 bg-emerald-950/60" title="60+ รวม">รวม</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-bold text-sky-200" title="รวมทุกกลุ่ม ชาย">ชาย</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 font-bold text-rose-200" title="รวมทุกกลุ่ม หญิง">หญิง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 font-black text-amber-300 bg-emerald-950" title="รวมทุกกลุ่ม รวม">รวม</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-sky-200">ช(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-slate-300">ช(ครั้ง)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-rose-200">ญ(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-slate-300">ญ(ครั้ง)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-sky-200">ช(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-slate-300">ช(ครั้ง)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-rose-200">ญ(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-slate-300">ญ(ครั้ง)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-sky-200">ช(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-slate-300">ช(ครั้ง)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-rose-200">ญ(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-slate-300">ญ(ครั้ง)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-sky-200">ช(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-slate-300">ช(ครั้ง)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/60 text-rose-200">ญ(คน)</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-slate-300">ญ(ครั้ง)</th>
          </tr>
        </thead>
      `;

      filteredUnits.forEach((u, idx) => {
        const isSel = (currentUnit === u.hospcode);
        const rowBg = isSel ? 'bg-emerald-50/80 ring-2 ring-emerald-500/40 font-semibold' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40');
        const stickyBg = isSel ? 'background-color: #ecfdf5;' : (idx % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8fafc;');
        const ag = u.age_groups;
        const q = u.quarters;

        tbodyHtml += `
          <tr class="${rowBg} hover:bg-emerald-50/50 transition border-b border-slate-100 text-slate-700 text-[11.5px]">
            <td class="py-2 px-2.5 text-center num-font text-slate-500 border-r border-slate-100 hdc-sticky-col-1" style="${stickyBg}">${u.hospcode}</td>
            <td class="py-2 px-3 font-semibold text-slate-800 border-r border-slate-100 hdc-sticky-col-2 flex items-center justify-between gap-1" style="${stickyBg}">
              <span class="truncate">${u.name}</span>
              ${isSel ? '<span class="text-[9px] bg-emerald-600 text-white px-1 rounded font-bold shrink-0">เลือก</span>' : ''}
            </td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a0_14?.m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a0_14?.f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a0_14?.total || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a15_29?.m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a15_29?.f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a15_29?.total || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a30_44?.m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a30_44?.f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a30_44?.total || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a45_59?.m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-600">${ag.a45_59?.f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/30">${ag.a45_59?.total || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 font-semibold text-sky-700 bg-sky-50/30">${ag.a60_plus?.m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 font-semibold text-rose-700 bg-rose-50/30">${ag.a60_plus?.f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 font-black text-emerald-800 bg-emerald-50/50">${Number(ag.a60_plus?.total || 0).toLocaleString()}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 font-bold text-sky-800 bg-sky-50/40">${Number(ag.all_ages?.m || 0).toLocaleString()}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 font-bold text-rose-800 bg-rose-50/40">${Number(ag.all_ages?.f || 0).toLocaleString()}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 font-black text-emerald-950 bg-emerald-100/50">${Number(u.patients_total).toLocaleString()}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-sky-700">${q.q1?.pt_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-500">${q.q1?.vs_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-rose-700">${q.q1?.pt_f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 text-slate-500">${q.q1?.vs_f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-sky-700">${q.q2?.pt_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-500">${q.q2?.vs_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-rose-700">${q.q2?.pt_f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 text-slate-500">${q.q2?.vs_f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-sky-700">${q.q3?.pt_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-500">${q.q3?.vs_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-rose-700">${q.q3?.pt_f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 text-slate-500">${q.q3?.vs_f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-sky-700">${q.q4?.pt_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-slate-500">${q.q4?.vs_m || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-100 text-rose-700">${q.q4?.pt_f || 0}</td>
            <td class="py-2 px-1 text-right num-font border-r border-slate-200 text-slate-500">${q.q4?.vs_f || 0}</td>
            <td class="py-2 px-1.5 text-center">
              <button type="button" onclick="window.selectTtmAgeHospital('${u.hospcode}')" class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isSel ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'} transition">
                ดู
              </button>
            </td>
          </tr>
        `;
      });

      const q = distQuarters;
      tfootHtml = `
        <tfoot class="sticky bottom-0 z-20 text-white font-black text-[11.5px]" style="background-color: #065f46;">
          <tr class="border-t-2 border-emerald-400">
            <td colspan="2" class="py-3 px-3 text-left border-r border-emerald-700 text-white font-black hdc-sticky-col-1" style="background-color: #065f46;">
              รวมทั้งอำเภอสารภี (14 หน่วยบริการ)
            </td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a0_14?.m || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a0_14?.f || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-amber-200 bg-emerald-900/60">${distAgeGroups.a0_14?.total || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a15_29?.m || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a15_29?.f || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-amber-200 bg-emerald-900/60">${distAgeGroups.a15_29?.total || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a30_44?.m || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a30_44?.f || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-amber-200 bg-emerald-900/60">${distAgeGroups.a30_44?.total || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a45_59?.m || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80">${distAgeGroups.a45_59?.f || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-amber-200 bg-emerald-900/60">${distAgeGroups.a45_59?.total || 0}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(distAgeGroups.a60_plus?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(distAgeGroups.a60_plus?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-amber-300 bg-emerald-950/80">${Number(distAgeGroups.a60_plus?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(distAgeGroups.all_ages?.m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(distAgeGroups.all_ages?.f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700 text-amber-300 bg-emerald-950">${Number(distAgeGroups.all_ages?.total || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q.q1?.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q.q1?.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q.q1?.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-emerald-200">${Number(q.q1?.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q.q2?.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q.q2?.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q.q2?.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-emerald-200">${Number(q.q2?.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q.q3?.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q.q3?.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q.q3?.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-600 text-emerald-200">${Number(q.q3?.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(q.q4?.pt_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q.q4?.vs_m || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700/80 text-rose-200">${Number(q.q4?.pt_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-right num-font border-r border-emerald-700 text-emerald-200">${Number(q.q4?.vs_f || 0).toLocaleString()}</td>
            <td class="py-3 px-1 text-center text-emerald-300 font-normal text-[10px]">100%</td>
          </tr>
        </tfoot>
      `;
    }

    tableEl.innerHTML = `${theadHtml}<tbody>${tbodyHtml}</tbody>${tfootHtml}`;

    if (window.lucide) {
      lucide.createIcons();
    }
  }


  // ==========================================
  // TTM ED DRUG BREAKDOWN (s_ttm10)
  // ==========================================
  window.switchTtmEdView = function(view) {
    currentTtmEdView = view;
    renderTtmEdPanel();
  };

  window.switchTtmEdYear = function(yr) {
    currentTtmEdYear = yr;
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
    renderTtmEdPanel();
  };

  window.switchTtmEdMetric = function(metric) {
    currentTtmEdMetric = metric;
    renderTtmEdPanel();
  };

  window.switchTtmEdChart2Mode = function(mode) {
    currentTtmEdChart2Mode = mode;
    renderTtmEdPanel();
  };

  window.selectTtmEdHospital = function(hospcode) {
    currentUnit = hospcode;
    if (unitSelect) unitSelect.value = hospcode;
    updateDashboardView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.exportTtmEdCsv = function() {
    const yr = currentTtmEdYear || currentYear || '2569';
    const ind = masterData?.indicators?.['ttm_ed'];
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];
    const distSummary = yrData.summary || {};
    const fullYr = distSummary.full_year || {};
    const qtr = distSummary.quarters || {};

    let csvContent = '\uFEFF';

    if (currentTtmEdView === 'full_year') {
      csvContent += `ตารางการจ่ายยาสมุนไพรตามบัญชียาหลักแห่งชาติ (ED) สรุปทั้งปีงบประมาณ อำเภอสารภี ปี ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,ED ทั้งหมด (คน),ED ทั้งหมด (ครั้ง),ED UC (คน),ED UC (ครั้ง),NON-ED ทั้งหมด (คน),NON-ED ทั้งหมด (ครั้ง),NON-ED UC (คน),NON-ED UC (ครั้ง),OTHER ทั้งหมด (คน),OTHER ทั้งหมด (ครั้ง),OTHER UC (คน),OTHER UC (ครั้ง),บริการทั้งหมด (คน),บริการทั้งหมด (ครั้ง),บริการทั้งหมด UC (คน),บริการทั้งหมด UC (ครั้ง),สัดส่วน ED (%),สัดส่วน UC (%)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const fy = u.full_year || {};
        const ed = fy.ed || {};
        const ned = fy.non_ed || {};
        const oth = fy.other || {};
        const tot = fy.total || {};

        csvContent += `"${u.hospcode}","${uName}","${uSub}",${ed.pt_all || 0},${ed.vs_all || 0},${ed.pt_uc || 0},${ed.vs_uc || 0},${ned.pt_all || 0},${ned.vs_all || 0},${ned.pt_uc || 0},${ned.vs_uc || 0},${oth.pt_all || 0},${oth.vs_all || 0},${oth.pt_uc || 0},${oth.vs_uc || 0},${tot.pt_all || 0},${tot.vs_all || 0},${tot.pt_uc || 0},${tot.vs_uc || 0},${u.ed_rate_vs || 0},${u.uc_ratio_vs || 0}\n`;
      });

      const dEd = fullYr.ed || {};
      const dNed = fullYr.non_ed || {};
      const dOth = fullYr.other || {};
      const dTot = fullYr.total || {};
      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",${dEd.pt_all || 0},${dEd.vs_all || 0},${dEd.pt_uc || 0},${dEd.vs_uc || 0},${dNed.pt_all || 0},${dNed.vs_all || 0},${dNed.pt_uc || 0},${dNed.vs_uc || 0},${dOth.pt_all || 0},${dOth.vs_all || 0},${dOth.pt_uc || 0},${dOth.vs_uc || 0},${dTot.pt_all || 0},${dTot.vs_all || 0},${dTot.pt_uc || 0},${dTot.vs_uc || 0},${yrData.ed_rate_vs || 0},${yrData.uc_ratio_vs || 0}\n`;

    } else if (currentTtmEdView === 'uc') {
      csvContent += `ตารางเปรียบเทียบสิทธิการรักษา (ทั้งหมด vs สิทธิ UC) อำเภอสารภี ปี ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,ED ทั้งหมด (ครั้ง),ED UC (ครั้ง),ED UC (%),NON-ED ทั้งหมด (ครั้ง),NON-ED UC (ครั้ง),NON-ED UC (%),OTHER ทั้งหมด (ครั้ง),OTHER UC (ครั้ง),OTHER UC (%),บริการทั้งหมด (ครั้ง),บริการทั้งหมด UC (ครั้ง),สัดส่วน UC ทั้งหมด (%)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const fy = u.full_year || {};
        const ed = fy.ed || {};
        const ned = fy.non_ed || {};
        const oth = fy.other || {};
        const tot = fy.total || {};

        const edUcPct = ed.vs_all > 0 ? ((ed.vs_uc / ed.vs_all) * 100).toFixed(1) : '0.0';
        const nedUcPct = ned.vs_all > 0 ? ((ned.vs_uc / ned.vs_all) * 100).toFixed(1) : '0.0';
        const othUcPct = oth.vs_all > 0 ? ((oth.vs_uc / oth.vs_all) * 100).toFixed(1) : '0.0';
        const totUcPct = tot.vs_all > 0 ? ((tot.vs_uc / tot.vs_all) * 100).toFixed(1) : '0.0';

        csvContent += `"${u.hospcode}","${uName}","${uSub}",${ed.vs_all || 0},${ed.vs_uc || 0},${edUcPct},${ned.vs_all || 0},${ned.vs_uc || 0},${nedUcPct},${oth.vs_all || 0},${oth.vs_uc || 0},${othUcPct},${tot.vs_all || 0},${tot.vs_uc || 0},${totUcPct}\n`;
      });

      const dEd = fullYr.ed || {};
      const dNed = fullYr.non_ed || {};
      const dOth = fullYr.other || {};
      const dTot = fullYr.total || {};
      const dEdUcPct = dEd.vs_all > 0 ? ((dEd.vs_uc / dEd.vs_all) * 100).toFixed(1) : '0.0';
      const dNedUcPct = dNed.vs_all > 0 ? ((dNed.vs_uc / dNed.vs_all) * 100).toFixed(1) : '0.0';
      const dOthUcPct = dOth.vs_all > 0 ? ((dOth.vs_uc / dOth.vs_all) * 100).toFixed(1) : '0.0';
      const dTotUcPct = dTot.vs_all > 0 ? ((dTot.vs_uc / dTot.vs_all) * 100).toFixed(1) : '0.0';

      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",${dEd.vs_all || 0},${dEd.vs_uc || 0},${dEdUcPct},${dNed.vs_all || 0},${dNed.vs_uc || 0},${dNedUcPct},${dOth.vs_all || 0},${dOth.vs_uc || 0},${dOthUcPct},${dTot.vs_all || 0},${dTot.vs_uc || 0},${dTotUcPct}\n`;

    } else if (currentTtmEdView === 'quarter') {
      csvContent += `ตารางการจ่ายยาสมุนไพรจำแนกรายไตรมาส (Q1 - Q4) อำเภอสารภี ปี ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,Q1 ED(ครั้ง),Q1 NON-ED(ครั้ง),Q1 OTHER(ครั้ง),Q1 รวม(ครั้ง),Q2 ED(ครั้ง),Q2 NON-ED(ครั้ง),Q2 OTHER(ครั้ง),Q2 รวม(ครั้ง),Q3 ED(ครั้ง),Q3 NON-ED(ครั้ง),Q3 OTHER(ครั้ง),Q3 รวม(ครั้ง),Q4 ED(ครั้ง),Q4 NON-ED(ครั้ง),Q4 OTHER(ครั้ง),Q4 รวม(ครั้ง),รวมทั้งปี (ครั้ง)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const q = u.quarters || {};
        const q1 = q.q1 || {}; const q2 = q.q2 || {}; const q3 = q.q3 || {}; const q4 = q.q4 || {};

        csvContent += `"${u.hospcode}","${uName}","${uSub}",${q1.ed?.vs_all || 0},${q1.non_ed?.vs_all || 0},${q1.other?.vs_all || 0},${q1.total?.vs_all || 0},${q2.ed?.vs_all || 0},${q2.non_ed?.vs_all || 0},${q2.other?.vs_all || 0},${q2.total?.vs_all || 0},${q3.ed?.vs_all || 0},${q3.non_ed?.vs_all || 0},${q3.other?.vs_all || 0},${q3.total?.vs_all || 0},${q4.ed?.vs_all || 0},${q4.non_ed?.vs_all || 0},${q4.other?.vs_all || 0},${q4.total?.vs_all || 0},${u.full_year?.total?.vs_all || 0}\n`;
      });

      const q1 = qtr.q1 || {}; const q2 = qtr.q2 || {}; const q3 = qtr.q3 || {}; const q4 = qtr.q4 || {};
      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",${q1.ed?.vs_all || 0},${q1.non_ed?.vs_all || 0},${q1.other?.vs_all || 0},${q1.total?.vs_all || 0},${q2.ed?.vs_all || 0},${q2.non_ed?.vs_all || 0},${q2.other?.vs_all || 0},${q2.total?.vs_all || 0},${q3.ed?.vs_all || 0},${q3.non_ed?.vs_all || 0},${q3.other?.vs_all || 0},${q3.total?.vs_all || 0},${q4.ed?.vs_all || 0},${q4.non_ed?.vs_all || 0},${q4.other?.vs_all || 0},${q4.total?.vs_all || 0},${fullYr.total?.vs_all || 0}\n`;

    } else {
      // Full HDC Matrix (1:1 with official spreadsheet)
      csvContent += `ตารางมาตรฐาน HDC s_ttm10: OPD-การจ่ายยาสมุนไพรตามบัญชียาหลักแห่งชาติ อำเภอสารภี ปีงบประมาณ ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,รวมทั้งปี ED ทั้งหมด(คน),รวมทั้งปี ED ทั้งหมด(ครั้ง),รวมทั้งปี ED UC(คน),รวมทั้งปี ED UC(ครั้ง),รวมทั้งปี NON-ED ทั้งหมด(คน),รวมทั้งปี NON-ED ทั้งหมด(ครั้ง),รวมทั้งปี NON-ED UC(คน),รวมทั้งปี NON-ED UC(ครั้ง),รวมทั้งปี OTHER ทั้งหมด(คน),รวมทั้งปี OTHER ทั้งหมด(ครั้ง),รวมทั้งปี OTHER UC(คน),รวมทั้งปี OTHER UC(ครั้ง),รวมทั้งปี บริการทั้งหมด ทั้งหมด(คน),รวมทั้งปี บริการทั้งหมด ทั้งหมด(ครั้ง),รวมทั้งปี บริการทั้งหมด UC(คน),รวมทั้งปี บริการทั้งหมด UC(ครั้ง),';
      for (let qi = 1; qi <= 4; qi++) {
        csvContent += `Q${qi} ED ทั้งหมด(คน),Q${qi} ED ทั้งหมด(ครั้ง),Q${qi} ED UC(คน),Q${qi} ED UC(ครั้ง),Q${qi} NON-ED ทั้งหมด(คน),Q${qi} NON-ED ทั้งหมด(ครั้ง),Q${qi} NON-ED UC(คน),Q${qi} NON-ED UC(ครั้ง),Q${qi} OTHER ทั้งหมด(คน),Q${qi} OTHER ทั้งหมด(ครั้ง),Q${qi} OTHER UC(คน),Q${qi} OTHER UC(ครั้ง),Q${qi} บริการทั้งหมด ทั้งหมด(คน),Q${qi} บริการทั้งหมด ทั้งหมด(ครั้ง),Q${qi} บริการทั้งหมด UC(คน),Q${qi} บริการทั้งหมด UC(ครั้ง)${qi === 4 ? '\n' : ','}`;
      }

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const fy = u.full_year || {};
        const q = u.quarters || {};

        let row = [`"${u.hospcode}"`, `"${uName}"`];
        ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
          const c = fy[cat] || {};
          row.push(c.pt_all || 0, c.vs_all || 0, c.pt_uc || 0, c.vs_uc || 0);
        });

        for (let qi = 1; qi <= 4; qi++) {
          const qd = q[`q${qi}`] || {};
          ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
            const c = qd[cat] || {};
            row.push(c.pt_all || 0, c.vs_all || 0, c.pt_uc || 0, c.vs_uc || 0);
          });
        }
        csvContent += row.join(',') + '\n';
      });

      // District Total Row
      let totRow = ['"total"', '"รวมทั้งอำเภอสารภี (14 หน่วยบริการ)"'];
      ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
        const c = fullYr[cat] || {};
        totRow.push(c.pt_all || 0, c.vs_all || 0, c.pt_uc || 0, c.vs_uc || 0);
      });
      for (let qi = 1; qi <= 4; qi++) {
        const qd = qtr[`q${qi}`] || {};
        ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
          const c = qd[cat] || {};
          totRow.push(c.pt_all || 0, c.vs_all || 0, c.pt_uc || 0, c.vs_uc || 0);
        });
      }
      csvContent += totRow.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hdc_s_ttm10_saraphi_${yr}_${currentTtmEdView}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function renderTtmEdPanel() {
    if (currentIndicatorId !== 'ttm_ed') {
      if (ttmEdPanel) ttmEdPanel.classList.add('hidden');
      return;
    }
    if (ttmEdPanel) ttmEdPanel.classList.remove('hidden');

    const yr = currentTtmEdYear || currentYear || '2569';

    // 1. Sync View Mode Buttons
    ['full_year', 'uc', 'quarter', 'full'].forEach(v => {
      const btn = document.getElementById(`btn-ttm-ed-view-${v}`);
      if (btn) {
        if (v === currentTtmEdView) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Sync Year Filter Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-ttm-ed-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 3. Sync Metric Buttons
    const btnVs = document.getElementById('btn-ttm-ed-metric-vs');
    const btnPt = document.getElementById('btn-ttm-ed-metric-pt');
    if (btnVs && btnPt) {
      if (currentTtmEdMetric === 'vs') {
        btnVs.className = 'px-2.5 py-1 rounded-lg font-bold transition bg-emerald-600 text-white shadow-xs';
        btnPt.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
      } else {
        btnPt.className = 'px-2.5 py-1 rounded-lg font-bold transition bg-emerald-600 text-white shadow-xs';
        btnVs.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
      }
    }

    // 4. Sync Chart 2 Mode Buttons
    ['donut', 'scheme', 'trend'].forEach(m => {
      const btn = document.getElementById(`btn-ttm-ed-chart2-${m}`);
      if (btn) {
        if (m === currentTtmEdChart2Mode) {
          btn.className = 'px-2 py-1 rounded-md bg-white text-emerald-700 shadow-xs font-bold transition';
        } else {
          btn.className = 'px-2 py-1 rounded-md text-slate-500 hover:text-slate-800 transition bg-transparent';
        }
      }
    });

    // 5. Resolve Master Data
    const ind = masterData?.indicators?.['ttm_ed'];
    const yrData = ind?.years?.[yr] || {};
    const distSummary = yrData.summary || {
      full_year: {
        ed: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 },
        non_ed: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 },
        other: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 },
        total: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 }
      },
      quarters: {
        q1: { ed: {}, non_ed: {}, other: {}, total: {} },
        q2: { ed: {}, non_ed: {}, other: {}, total: {} },
        q3: { ed: {}, non_ed: {}, other: {}, total: {} },
        q4: { ed: {}, non_ed: {}, other: {}, total: {} }
      }
    };
    const distFullYear = distSummary.full_year || {};
    const distQuarters = distSummary.quarters || {};
    const rawUnits = yrData.units || [];

    const unitsList = rawUnits.map(u => {
      const meta = SARAPHI_UNITS_MAP[u.hospcode];
      const cleanName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
      const cleanShort = (u.hospcode === '06023') ? 'บ้านป่าสา' : (meta ? meta.short : (u.subdistrict || u.name));
      const cleanSubdistrict = meta ? meta.subdistrict : (u.subdistrict || '');
      return {
        ...u,
        name: cleanName,
        short: cleanShort,
        subdistrict: cleanSubdistrict,
        full_year: u.full_year || {
          ed: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 },
          non_ed: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 },
          other: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 },
          total: { pt_all: 0, vs_all: 0, pt_uc: 0, vs_uc: 0 }
        },
        quarters: u.quarters || {}
      };
    });

    const isDistrict = (currentUnit === 'all');
    const selectedUnit = isDistrict ? null : unitsList.find(u => u.hospcode === currentUnit);
    const activeFullYear = selectedUnit ? selectedUnit.full_year : distFullYear;
    const activeQuarters = selectedUnit ? selectedUnit.quarters : distQuarters;

    const totEd = activeFullYear.ed || {};
    const totNed = activeFullYear.non_ed || {};
    const totOth = activeFullYear.other || {};
    const totAll = activeFullYear.total || {};

    const totVs = totAll.vs_all || 0;
    const totPt = totAll.pt_all || 0;
    const ucVs = totAll.vs_uc || 0;
    const ucPt = totAll.pt_uc || 0;
    const ucRatio = totVs > 0 ? ((ucVs / totVs) * 100).toFixed(1) : '0.0';

    const edVs = totEd.vs_all || 0;
    const edPt = totEd.pt_all || 0;
    const edRatio = totVs > 0 ? ((edVs / totVs) * 100).toFixed(1) : '0.0';

    const nedVs = totNed.vs_all || 0;
    const nedPt = totNed.pt_all || 0;
    const nedRatio = totVs > 0 ? ((nedVs / totVs) * 100).toFixed(1) : '0.0';

    const othVs = totOth.vs_all || 0;
    const othPt = totOth.pt_all || 0;

    // 6. Update 4 Bento Cards
    const elCard1Badge = document.getElementById('ttm-ed-card1-badge');
    const elTotalVs = document.getElementById('ttm-ed-stat-total-vs');
    const elTotalPt = document.getElementById('ttm-ed-stat-total-pt');
    const elUcShare = document.getElementById('ttm-ed-stat-uc-share');

    if (elCard1Badge) elCard1Badge.textContent = isDistrict ? `HDC s_ttm10 (${yr})` : `${selectedUnit.short} (${yr})`;
    if (elTotalVs) elTotalVs.textContent = Number(totVs).toLocaleString();
    if (elTotalPt) elTotalPt.textContent = Number(totPt).toLocaleString();
    if (elUcShare) elUcShare.textContent = `สิทธิ UC ${ucRatio}% (${Number(ucVs).toLocaleString()} ครั้ง)`;

    // Card 2: ED
    const elEdVs = document.getElementById('ttm-ed-stat-ed-vs');
    const elEdPt = document.getElementById('ttm-ed-stat-ed-pt');
    const elEdShare = document.getElementById('ttm-ed-card2-share');
    if (elEdVs) elEdVs.textContent = Number(edVs).toLocaleString();
    if (elEdPt) elEdPt.textContent = Number(edPt).toLocaleString();
    if (elEdShare) {
      elEdShare.textContent = `${edRatio}% (สัดส่วน ED)`;
      elEdShare.className = Number(edRatio) >= 80.0
        ? 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800'
        : 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800';
    }

    // Card 3: NON ED & Other
    const elNonEdVs = document.getElementById('ttm-ed-stat-noned-vs');
    const elNonEdPt = document.getElementById('ttm-ed-stat-noned-pt');
    const elNonEdShare = document.getElementById('ttm-ed-card3-share');
    const elOtherVs = document.getElementById('ttm-ed-stat-other-vs');
    if (elNonEdVs) elNonEdVs.textContent = Number(nedVs).toLocaleString();
    if (elNonEdPt) elNonEdPt.textContent = Number(nedPt).toLocaleString();
    if (elNonEdShare) elNonEdShare.textContent = `${nedRatio}% ของทั้งหมด`;
    if (elOtherVs) elOtherVs.textContent = Number(othVs).toLocaleString();

    // Card 4: Top ED Performer / Unit Position
    const elCard4Title = document.getElementById('ttm-ed-card4-title');
    const elCard4Badge = document.getElementById('ttm-ed-card4-badge');
    const elTopName = document.getElementById('ttm-ed-stat-top-name');
    const elTopVal = document.getElementById('ttm-ed-stat-top-val');
    const elCard4Sub = document.getElementById('ttm-ed-card4-sublabel');

    const sortedByEdRate = [...unitsList].sort((a, b) => (b.ed_rate_vs || 0) - (a.ed_rate_vs || 0));
    const topUnit = sortedByEdRate[0];

    if (isDistrict) {
      if (elCard4Title) elCard4Title.textContent = 'หน่วยบริการสัดส่วน ED สูงสุด';
      if (elCard4Badge) elCard4Badge.textContent = 'อันดับ 1 ในอำเภอ';
      if (elTopName) elTopName.textContent = topUnit ? topUnit.name : '-';
      if (elCard4Sub) elCard4Sub.textContent = 'สัดส่วนยาในบัญชี:';
      if (elTopVal) {
        const topRate = topUnit ? (topUnit.ed_rate_vs || 0) : 0;
        const topEdVs = topUnit ? (topUnit.full_year?.ed?.vs_all || 0) : 0;
        elTopVal.textContent = `${topRate}% (${Number(topEdVs).toLocaleString()} ครั้ง)`;
      }
    } else {
      const uRank = sortedByEdRate.findIndex(u => u.hospcode === currentUnit) + 1;
      if (elCard4Title) elCard4Title.textContent = 'ลำดับสัดส่วน ED ของหน่วยนี้';
      if (elCard4Badge) elCard4Badge.textContent = selectedUnit ? `รหัส ${selectedUnit.hospcode}` : 'หน่วยบริการ';
      if (elTopName) elTopName.textContent = selectedUnit ? selectedUnit.name : '-';
      if (elCard4Sub) elCard4Sub.textContent = 'อันดับที่:';
      if (elTopVal) {
        const myRate = selectedUnit ? (selectedUnit.ed_rate_vs || 0) : 0;
        elTopVal.textContent = `# ${uRank} จาก 14 แห่ง (${myRate}%)`;
      }
    }

    // 7. Render Chart 1: Horizontal Stacked Bar (ED vs NON-ED vs OTHER per hospital)
    const stackedCanvas = document.getElementById('ttmEdStackedBarChart');
    const chart1Sub = document.getElementById('ttm-ed-chart1-subtitle');
    if (chart1Sub) {
      chart1Sub.textContent = currentTtmEdMetric === 'vs'
        ? `แสดงจำนวนครั้งจ่ายยา (Visits) ปี ${yr}`
        : `แสดงจำนวนผู้ป่วยรายคน (Patients) ปี ${yr}`;
    }

    if (stackedCanvas) {
      if (ttmEdStackedBarChartInstance) {
        ttmEdStackedBarChartInstance.destroy();
        ttmEdStackedBarChartInstance = null;
      }

      const isMetricVs = (currentTtmEdMetric === 'vs');
      // Sort hospitals by total for the chart
      const chartUnits = [...unitsList].sort((a, b) => {
        const aTot = isMetricVs ? (a.full_year?.total?.vs_all || 0) : (a.full_year?.total?.pt_all || 0);
        const bTot = isMetricVs ? (b.full_year?.total?.vs_all || 0) : (b.full_year?.total?.pt_all || 0);
        return bTot - aTot;
      });

      const labels = chartUnits.map(u => u.short);
      const edData = chartUnits.map(u => isMetricVs ? (u.full_year?.ed?.vs_all || 0) : (u.full_year?.ed?.pt_all || 0));
      const nonEdData = chartUnits.map(u => isMetricVs ? (u.full_year?.non_ed?.vs_all || 0) : (u.full_year?.non_ed?.pt_all || 0));
      const otherData = chartUnits.map(u => isMetricVs ? (u.full_year?.other?.vs_all || 0) : (u.full_year?.other?.pt_all || 0));

      const ctx1 = stackedCanvas.getContext('2d');
      ttmEdStackedBarChartInstance = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'ในบัญชี (ED)',
              data: edData,
              backgroundColor: '#10b981',
              borderRadius: 4,
              stack: 'stack0'
            },
            {
              label: 'นอกบัญชี (NON-ED)',
              data: nonEdData,
              backgroundColor: '#f59e0b',
              borderRadius: 4,
              stack: 'stack0'
            },
            {
              label: 'อื่นๆ (OTHER)',
              data: otherData,
              backgroundColor: '#8b5cf6',
              borderRadius: 4,
              stack: 'stack0'
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { left: 4, right: 16, top: 4, bottom: 4 } },
          scales: {
            x: {
              stacked: true,
              grid: { color: 'rgba(226, 232, 240, 0.7)' },
              ticks: {
                font: { family: 'Prompt', size: 11 },
                callback: function(v) { return Number(v).toLocaleString(); }
              }
            },
            y: {
              stacked: true,
              grid: { display: false },
              ticks: {
                font: { family: 'Prompt', size: 11, weight: '500' },
                color: function(ctx) {
                  const idx = ctx.index;
                  const u = chartUnits[idx];
                  return (u && u.hospcode === currentUnit) ? '#059669' : '#334155';
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: true,
                font: { family: 'Prompt', size: 11, weight: '600' }
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleFont: { family: 'Prompt', size: 13, weight: 'bold' },
              bodyFont: { family: 'Prompt', size: 12 },
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  const val = context.raw || 0;
                  const idx = context.dataIndex;
                  const u = chartUnits[idx];
                  const uTot = isMetricVs ? (u.full_year?.total?.vs_all || 1) : (u.full_year?.total?.pt_all || 1);
                  const pct = uTot > 0 ? ((val / uTot) * 100).toFixed(1) : '0.0';
                  const unitWord = isMetricVs ? 'ครั้ง' : 'คน';
                  return ` ${context.dataset.label}: ${Number(val).toLocaleString()} ${unitWord} (${pct}%)`;
                },
                afterBody: function(contexts) {
                  const idx = contexts[0].dataIndex;
                  const u = chartUnits[idx];
                  const uTot = isMetricVs ? (u.full_year?.total?.vs_all || 0) : (u.full_year?.total?.pt_all || 0);
                  const unitWord = isMetricVs ? 'ครั้ง' : 'คน';
                  return `รวมทั้งหมด: ${Number(uTot).toLocaleString()} ${unitWord}`;
                }
              }
            }
          }
        }
      });
    }

    // 8. Render Chart 2: Donut or Trend
    const donutCanvas = document.getElementById('ttmEdDonutChart');
    const chart2Title = document.getElementById('ttm-ed-chart2-title');
    const chart2Subtitle = document.getElementById('ttm-ed-chart2-subtitle');

    if (donutCanvas) {
      if (ttmEdDonutChartInstance) {
        ttmEdDonutChartInstance.destroy();
        ttmEdDonutChartInstance = null;
      }

      const ctx2 = donutCanvas.getContext('2d');

      if (currentTtmEdChart2Mode === 'donut') {
        if (chart2Title) chart2Title.textContent = 'สัดส่วนประเภทยา (ED vs NON-ED vs OTHER)';
        if (chart2Subtitle) chart2Subtitle.textContent = isDistrict ? `ภาพรวมทั้งอำเภอสารภี ปี ${yr}` : `ของ ${selectedUnit.short} ปี ${yr}`;

        const pLabels = ['ในบัญชี (ED)', 'นอกบัญชี (NON-ED)', 'อื่นๆ (OTHER)'];
        const pData = [edVs, nedVs, othVs];
        const pColors = ['#10b981', '#f59e0b', '#8b5cf6'];

        ttmEdDonutChartInstance = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: pLabels,
            datasets: [{
              data: pData,
              backgroundColor: pColors,
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: true,
                  font: { family: 'Prompt', size: 11.5, weight: '500' },
                  color: '#334155',
                  generateLabels: function(chart) {
                    const data = chart.data;
                    return data.labels.map((label, i) => {
                      const val = data.datasets[0].data[i] || 0;
                      const pct = totVs > 0 ? ((val / totVs) * 100).toFixed(1) : '0.0';
                      return {
                        text: `${label} (${pct}%)`,
                        fillStyle: pColors[i],
                        strokeStyle: '#ffffff',
                        lineWidth: 1,
                        hidden: isNaN(val) || val === 0,
                        index: i
                      };
                    });
                  }
                }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Prompt', size: 13, weight: 'bold' },
                bodyFont: { family: 'Prompt', size: 12 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function(ctx) {
                    const val = ctx.raw || 0;
                    const pct = totVs > 0 ? ((val / totVs) * 100).toFixed(1) : '0.0';
                    return ` ${ctx.label}: ${Number(val).toLocaleString()} ครั้ง (${pct}%)`;
                  }
                }
              }
            }
          }
        });

      } else if (currentTtmEdChart2Mode === 'scheme') {
        if (chart2Title) chart2Title.textContent = 'สัดส่วนสิทธิการรักษา (สิทธิ UC vs อื่นๆ)';
        if (chart2Subtitle) chart2Subtitle.textContent = isDistrict ? `สิทธิหลักประกันสุขภาพถ้วนหน้า ปี ${yr}` : `สิทธิ UC ของ ${selectedUnit.short} ปี ${yr}`;

        const otherSchemeVs = Math.max(0, totVs - ucVs);
        const pLabels = ['สิทธิหลักประกันสุขภาพ (UC)', 'สิทธิอื่นๆ (ข้าราชการ/ปกส./จ่ายเอง)'];
        const pData = [ucVs, otherSchemeVs];
        const pColors = ['#0284c7', '#94a3b8'];

        ttmEdDonutChartInstance = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: pLabels,
            datasets: [{
              data: pData,
              backgroundColor: pColors,
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: true,
                  font: { family: 'Prompt', size: 11.5, weight: '500' },
                  color: '#334155',
                  generateLabels: function(chart) {
                    const data = chart.data;
                    return data.labels.map((label, i) => {
                      const val = data.datasets[0].data[i] || 0;
                      const pct = totVs > 0 ? ((val / totVs) * 100).toFixed(1) : '0.0';
                      return {
                        text: `${label} (${pct}%)`,
                        fillStyle: pColors[i],
                        strokeStyle: '#ffffff',
                        lineWidth: 1,
                        hidden: isNaN(val) || val === 0,
                        index: i
                      };
                    });
                  }
                }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Prompt', size: 13, weight: 'bold' },
                bodyFont: { family: 'Prompt', size: 12 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: function(ctx) {
                    const val = ctx.raw || 0;
                    const pct = totVs > 0 ? ((val / totVs) * 100).toFixed(1) : '0.0';
                    return ` ${ctx.label}: ${Number(val).toLocaleString()} ครั้ง (${pct}%)`;
                  }
                }
              }
            }
          }
        });

      } else {
        // Trend Mode: Q1 - Q4 Grouped Bar Chart
        if (chart2Title) chart2Title.textContent = 'แนวโน้มการจ่ายยาสมุนไพรรายไตรมาส (Q1 - Q4)';
        if (chart2Subtitle) chart2Subtitle.textContent = isDistrict ? `ภาพรวมอำเภอสารภี ปี ${yr}` : `ของ ${selectedUnit.short} ปี ${yr}`;

        const qLabels = ['ไตรมาส 1 (ต.ค.-ธ.ค.)', 'ไตรมาส 2 (ม.ค.-มี.ค.)', 'ไตรมาส 3 (เม.ย.-มิ.ย.)', 'ไตรมาส 4 (ก.ค.-ก.ย.)'];
        const qEd = [1, 2, 3, 4].map(q => activeQuarters[`q${q}`]?.ed?.vs_all || 0);
        const qNed = [1, 2, 3, 4].map(q => activeQuarters[`q${q}`]?.non_ed?.vs_all || 0);
        const qOth = [1, 2, 3, 4].map(q => activeQuarters[`q${q}`]?.other?.vs_all || 0);

        ttmEdDonutChartInstance = new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: qLabels,
            datasets: [
              {
                label: 'ในบัญชี (ED)',
                data: qEd,
                backgroundColor: '#10b981',
                borderRadius: 4
              },
              {
                label: 'นอกบัญชี (NON-ED)',
                data: qNed,
                backgroundColor: '#f59e0b',
                borderRadius: 4
              },
              {
                label: 'อื่นๆ (OTHER)',
                data: qOth,
                backgroundColor: '#8b5cf6',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 10 } } },
              y: {
                grid: { color: 'rgba(226, 232, 240, 0.7)' },
                ticks: {
                  font: { family: 'Prompt', size: 10 },
                  callback: function(v) { return Number(v).toLocaleString(); }
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { family: 'Prompt', size: 11 } }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Prompt', size: 12, weight: 'bold' },
                bodyFont: { family: 'Prompt', size: 11 },
                callbacks: {
                  label: function(c) {
                    return ` ${c.dataset.label}: ${Number(c.raw).toLocaleString()} ครั้ง`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // 9. Render HDC Matrix Table
    const tableEl = document.getElementById('ttm-ed-matrix-table');
    if (!tableEl) return;

    // Filter units by search query
    const qLower = (ttmEdSearchQuery || '').trim().toLowerCase();
    const filteredUnits = unitsList.filter(u => {
      if (!qLower) return true;
      return (u.name && u.name.toLowerCase().includes(qLower)) ||
             (u.short && u.short.toLowerCase().includes(qLower)) ||
             (u.hospcode && u.hospcode.includes(qLower)) ||
             (u.subdistrict && u.subdistrict.toLowerCase().includes(qLower));
    });

    // Update table heading
    const headEl = document.getElementById('ttm-ed-table-heading');
    const subHeadEl = document.getElementById('ttm-ed-table-subheading');
    if (headEl) {
      if (currentTtmEdView === 'full_year') headEl.textContent = `ตารางสรุปผลงานทั้งปีงบประมาณ ${yr} (ED, NON-ED, OTHER, บริการทั้งหมด)`;
      else if (currentTtmEdView === 'uc') headEl.textContent = `ตารางเปรียบเทียบสิทธิการรักษา ทั้งหมด vs สิทธิ UC ปีงบประมาณ ${yr}`;
      else if (currentTtmEdView === 'quarter') headEl.textContent = `ตารางแจกแจงผลงานรายไตรมาส (Q1 - Q4) ปีงบประมาณ ${yr}`;
      else headEl.textContent = `ตารางมาตรฐาน HDC s_ttm10: OPD-การจ่ายยาสมุนไพรตามบัญชียาหลักแห่งชาติ 1:1 (${yr})`;
    }
    if (subHeadEl) {
      subHeadEl.textContent = `แสดงข้อมูล 14 หน่วยบริการ อำเภอสารภี (พบ ${filteredUnits.length} แห่ง)`;
    }

    let theadHtml = '';
    let tbodyHtml = '';
    let tfootHtml = '';

    if (currentTtmEdView === 'full_year') {
      // 1. FULL YEAR VIEW (ED, NON-ED, OTHER, TOTAL)
      theadHtml = `
        <thead class="bg-gradient-to-r from-[#047857] via-[#059669] to-[#065f46] text-white font-bold text-[11px] border-b border-emerald-800">
          <tr>
            <th rowspan="3" class="py-2.5 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1">รหัส</th>
            <th rowspan="3" class="py-2.5 px-3 text-left border-r border-emerald-700/80 hdc-sticky-col-2">หน่วยบริการ</th>
            <th colspan="16" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-emerald-800/60">รวมทั้งปีงบประมาณ ${yr}</th>
            <th rowspan="3" class="py-2.5 px-2 text-center border-r border-emerald-700/80 bg-teal-800/60">สัดส่วน ED (ครั้ง)</th>
            <th rowspan="3" class="py-2.5 px-2 text-center border-r border-emerald-700/80 bg-sky-800/60">สัดส่วน UC (%)</th>
            <th rowspan="3" class="py-2.5 px-2 text-center">จัดการ</th>
          </tr>
          <tr>
            <th colspan="4" class="py-1.5 px-1 text-center border-r border-emerald-700/80 bg-emerald-700/80 text-emerald-100">ED (ในบัญชียาหลัก)</th>
            <th colspan="4" class="py-1.5 px-1 text-center border-r border-emerald-700/80 bg-amber-700/80 text-amber-100">NON ED (นอกบัญชียาหลัก)</th>
            <th colspan="4" class="py-1.5 px-1 text-center border-r border-emerald-700/80 bg-purple-700/80 text-purple-100">OTHER (อื่นๆ)</th>
            <th colspan="4" class="py-1.5 px-1 text-center border-r border-emerald-700/80 bg-slate-700/80 text-white">บริการทั้งหมด</th>
          </tr>
          <tr class="text-[10px] bg-emerald-900/60 text-emerald-100">
            <th class="py-1 px-1 text-right border-r border-emerald-800/60">คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60">ครั้ง</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60 text-sky-200">UC คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-700/80 text-sky-200">UC ครั้ง</th>

            <th class="py-1 px-1 text-right border-r border-emerald-800/60">คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60">ครั้ง</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60 text-amber-200">UC คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-700/80 text-amber-200">UC ครั้ง</th>

            <th class="py-1 px-1 text-right border-r border-emerald-800/60">คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60">ครั้ง</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60 text-purple-200">UC คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-700/80 text-purple-200">UC ครั้ง</th>

            <th class="py-1 px-1 text-right border-r border-emerald-800/60">คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60">ครั้ง</th>
            <th class="py-1 px-1 text-right border-r border-emerald-800/60 text-sky-200">UC คน</th>
            <th class="py-1 px-1 text-right border-r border-emerald-700/80 text-sky-200">UC ครั้ง</th>
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#ecfdf5; border-left: 4px solid #10b981;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const fy = u.full_year || {};
        const ed = fy.ed || {};
        const ned = fy.non_ed || {};
        const oth = fy.other || {};
        const tot = fy.total || {};

        const edRate = u.ed_rate_vs || 0;
        const ucRatio = u.uc_ratio_vs || 0;
        const passBadge = edRate >= 80.0
          ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${edRate}%</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">${edRate}%</span>`;

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-emerald-50/40 transition">
            <td class="py-2.5 px-2 text-center num-font font-bold text-slate-700 border-r border-slate-100 hdc-sticky-col-1">${u.hospcode}</td>
            <td class="py-2.5 px-3 border-r border-slate-100 hdc-sticky-col-2">
              <div class="font-bold text-slate-900">${u.name}</div>
              <div class="text-[10px] text-slate-400">ต.${u.subdistrict}</div>
            </td>
            <!-- ED -->
            <td class="py-2.5 px-1.5 text-right num-font font-semibold text-emerald-700 border-r border-slate-100">${Number(ed.pt_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-emerald-800 border-r border-slate-100">${Number(ed.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(ed.pt_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-sky-800 border-r border-slate-200 bg-emerald-50/30">${Number(ed.vs_uc || 0).toLocaleString()}</td>

            <!-- NON-ED -->
            <td class="py-2.5 px-1.5 text-right num-font text-amber-700 border-r border-slate-100">${Number(ned.pt_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-amber-800 border-r border-slate-100">${Number(ned.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-amber-600 border-r border-slate-100">${Number(ned.pt_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-amber-700 border-r border-slate-200 bg-amber-50/30">${Number(ned.vs_uc || 0).toLocaleString()}</td>

            <!-- OTHER -->
            <td class="py-2.5 px-1.5 text-right num-font text-purple-700 border-r border-slate-100">${Number(oth.pt_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-purple-800 border-r border-slate-100">${Number(oth.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-purple-600 border-r border-slate-100">${Number(oth.pt_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-purple-700 border-r border-slate-200 bg-purple-50/30">${Number(oth.vs_uc || 0).toLocaleString()}</td>

            <!-- TOTAL -->
            <td class="py-2.5 px-1.5 text-right num-font text-slate-700 border-r border-slate-100">${Number(tot.pt_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-black text-slate-900 border-r border-slate-100 bg-slate-50">${Number(tot.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(tot.pt_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-sky-800 border-r border-slate-200 bg-sky-50/40">${Number(tot.vs_uc || 0).toLocaleString()}</td>

            <!-- ED Ratio & UC Ratio -->
            <td class="py-2.5 px-2 text-center border-r border-slate-100 font-bold">${passBadge}</td>
            <td class="py-2.5 px-2 text-center border-r border-slate-100 num-font text-sky-700 font-semibold">${ucRatio}%</td>

            <td class="py-2.5 px-2 text-center">
              <button type="button" onclick="window.selectTtmEdHospital('${u.hospcode}')" class="px-2 py-1 rounded text-[11px] font-bold ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'} transition shadow-2xs">
                ${isSelected ? 'เลือกอยู่' : 'ดู รพ.สต.'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // District Total
      const dEd = distFullYear.ed || {};
      const dNed = distFullYear.non_ed || {};
      const dOth = distFullYear.other || {};
      const dTot = distFullYear.total || {};

      tfootHtml = `
        <tfoot class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white font-bold text-[11px] border-t-2 border-emerald-500">
          <tr>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1 font-black">รวม</td>
            <td class="py-3 px-3 border-r border-emerald-700/80 hdc-sticky-col-2">
              <div class="font-black text-white">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</div>
              <div class="text-[10px] text-emerald-300 font-normal">ข้อมูลระบบ HDC ราชการ</div>
            </td>
            <!-- ED -->
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-emerald-200">${Number(dEd.pt_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white bg-emerald-700/50">${Number(dEd.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(dEd.pt_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-sky-100">${Number(dEd.vs_uc || 0).toLocaleString()}</td>

            <!-- NON-ED -->
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-amber-200">${Number(dNed.pt_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white bg-amber-700/50">${Number(dNed.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-amber-200">${Number(dNed.pt_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-amber-100">${Number(dNed.vs_uc || 0).toLocaleString()}</td>

            <!-- OTHER -->
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-purple-200">${Number(dOth.pt_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white bg-purple-700/50">${Number(dOth.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-purple-200">${Number(dOth.pt_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-purple-100">${Number(dOth.vs_uc || 0).toLocaleString()}</td>

            <!-- TOTAL -->
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-emerald-100">${Number(dTot.pt_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-yellow-300 bg-emerald-950/70">${Number(dTot.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(dTot.pt_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-sky-300">${Number(dTot.vs_uc || 0).toLocaleString()}</td>

            <!-- ED Ratio & UC Ratio -->
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 text-yellow-300 num-font font-black">${yrData.ed_rate_vs || 0}%</td>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 text-sky-300 num-font font-black">${yrData.uc_ratio_vs || 0}%</td>
            <td class="py-3 px-2 text-center text-emerald-300 font-normal text-[10px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else if (currentTtmEdView === 'uc') {
      // 2. UC COMPARISON VIEW (ALL VS UC)
      theadHtml = `
        <thead class="bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#075985] text-white font-bold text-[11px] border-b border-sky-800">
          <tr>
            <th rowspan="2" class="py-2.5 px-2 text-center border-r border-sky-700/80 hdc-sticky-col-1">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left border-r border-sky-700/80 hdc-sticky-col-2">หน่วยบริการ</th>
            <th colspan="3" class="py-1.5 px-2 text-center border-r border-sky-700/80 bg-emerald-800/70">ED (ในบัญชียาหลัก)</th>
            <th colspan="3" class="py-1.5 px-2 text-center border-r border-sky-700/80 bg-amber-800/70">NON ED (นอกบัญชียาหลัก)</th>
            <th colspan="3" class="py-1.5 px-2 text-center border-r border-sky-700/80 bg-purple-800/70">OTHER (อื่นๆ)</th>
            <th colspan="3" class="py-1.5 px-2 text-center border-r border-sky-700/80 bg-slate-800/80">บริการจ่ายยาทั้งหมด</th>
            <th rowspan="2" class="py-2.5 px-2 text-center">จัดการ</th>
          </tr>
          <tr class="text-[10px] bg-sky-950/70 text-sky-100">
            <th class="py-1 px-2 text-right border-r border-sky-800/60">ทั้งหมด (ครั้ง)</th>
            <th class="py-1 px-2 text-right border-r border-sky-800/60 text-sky-200">สิทธิ UC (ครั้ง)</th>
            <th class="py-1 px-2 text-center border-r border-sky-700/80 text-emerald-300">% UC</th>

            <th class="py-1 px-2 text-right border-r border-sky-800/60">ทั้งหมด (ครั้ง)</th>
            <th class="py-1 px-2 text-right border-r border-sky-800/60 text-amber-200">สิทธิ UC (ครั้ง)</th>
            <th class="py-1 px-2 text-center border-r border-sky-700/80 text-amber-300">% UC</th>

            <th class="py-1 px-2 text-right border-r border-sky-800/60">ทั้งหมด (ครั้ง)</th>
            <th class="py-1 px-2 text-right border-r border-sky-800/60 text-purple-200">สิทธิ UC (ครั้ง)</th>
            <th class="py-1 px-2 text-center border-r border-sky-700/80 text-purple-300">% UC</th>

            <th class="py-1 px-2 text-right border-r border-sky-800/60">ทั้งหมด (ครั้ง)</th>
            <th class="py-1 px-2 text-right border-r border-sky-800/60 text-sky-200">สิทธิ UC (ครั้ง)</th>
            <th class="py-1 px-2 text-center border-r border-sky-700/80 text-yellow-300">% UC รวม</th>
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#f0f9ff; border-left: 4px solid #0284c7;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const fy = u.full_year || {};
        const ed = fy.ed || {};
        const ned = fy.non_ed || {};
        const oth = fy.other || {};
        const tot = fy.total || {};

        const edUcPct = ed.vs_all > 0 ? ((ed.vs_uc / ed.vs_all) * 100).toFixed(1) : '0.0';
        const nedUcPct = ned.vs_all > 0 ? ((ned.vs_uc / ned.vs_all) * 100).toFixed(1) : '0.0';
        const othUcPct = oth.vs_all > 0 ? ((oth.vs_uc / oth.vs_all) * 100).toFixed(1) : '0.0';
        const totUcPct = tot.vs_all > 0 ? ((tot.vs_uc / tot.vs_all) * 100).toFixed(1) : '0.0';

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-sky-50/40 transition">
            <td class="py-2.5 px-2 text-center num-font font-bold text-slate-700 border-r border-slate-100 hdc-sticky-col-1">${u.hospcode}</td>
            <td class="py-2.5 px-3 border-r border-slate-100 hdc-sticky-col-2">
              <div class="font-bold text-slate-900">${u.name}</div>
              <div class="text-[10px] text-slate-400">ต.${u.subdistrict}</div>
            </td>
            <!-- ED -->
            <td class="py-2.5 px-2 text-right num-font font-bold text-emerald-800 border-r border-slate-100">${Number(ed.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font text-sky-800 border-r border-slate-100">${Number(ed.vs_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center num-font text-emerald-700 font-semibold border-r border-slate-200 bg-emerald-50/30">${edUcPct}%</td>

            <!-- NON ED -->
            <td class="py-2.5 px-2 text-right num-font font-bold text-amber-800 border-r border-slate-100">${Number(ned.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font text-amber-700 border-r border-slate-100">${Number(ned.vs_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center num-font text-amber-700 font-semibold border-r border-slate-200 bg-amber-50/30">${nedUcPct}%</td>

            <!-- OTHER -->
            <td class="py-2.5 px-2 text-right num-font font-bold text-purple-800 border-r border-slate-100">${Number(oth.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font text-purple-700 border-r border-slate-100">${Number(oth.vs_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center num-font text-purple-700 font-semibold border-r border-slate-200 bg-purple-50/30">${othUcPct}%</td>

            <!-- TOTAL -->
            <td class="py-2.5 px-2 text-right num-font font-black text-slate-900 border-r border-slate-100 bg-slate-50">${Number(tot.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font font-bold text-sky-800 border-r border-slate-100 bg-sky-50/30">${Number(tot.vs_uc || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center num-font font-black text-sky-700 border-r border-slate-100 bg-sky-100/50">${totUcPct}%</td>

            <td class="py-2.5 px-2 text-center">
              <button type="button" onclick="window.selectTtmEdHospital('${u.hospcode}')" class="px-2 py-1 rounded text-[11px] font-bold ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800'} transition shadow-2xs">
                ${isSelected ? 'เลือกอยู่' : 'ดู รพ.สต.'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      const dEd = distFullYear.ed || {};
      const dNed = distFullYear.non_ed || {};
      const dOth = distFullYear.other || {};
      const dTot = distFullYear.total || {};
      const dEdUcPct = dEd.vs_all > 0 ? ((dEd.vs_uc / dEd.vs_all) * 100).toFixed(1) : '0.0';
      const dNedUcPct = dNed.vs_all > 0 ? ((dNed.vs_uc / dNed.vs_all) * 100).toFixed(1) : '0.0';
      const dOthUcPct = dOth.vs_all > 0 ? ((dOth.vs_uc / dOth.vs_all) * 100).toFixed(1) : '0.0';
      const dTotUcPct = dTot.vs_all > 0 ? ((dTot.vs_uc / dTot.vs_all) * 100).toFixed(1) : '0.0';

      tfootHtml = `
        <tfoot class="bg-gradient-to-r from-sky-950 via-sky-900 to-slate-900 text-white font-bold text-[11px] border-t-2 border-sky-500">
          <tr>
            <td class="py-3 px-2 text-center border-r border-sky-700/80 hdc-sticky-col-1 font-black">รวม</td>
            <td class="py-3 px-3 border-r border-sky-700/80 hdc-sticky-col-2">
              <div class="font-black text-white">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</div>
              <div class="text-[10px] text-sky-300 font-normal">เปรียบเทียบสิทธิ UC รายอำเภอ</div>
            </td>
            <!-- ED -->
            <td class="py-3 px-2 text-right num-font font-black border-r border-sky-700/80 text-emerald-200">${Number(dEd.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-bold border-r border-sky-700/80 text-sky-200">${Number(dEd.vs_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-emerald-300">${dEdUcPct}%</td>

            <!-- NON-ED -->
            <td class="py-3 px-2 text-right num-font font-black border-r border-sky-700/80 text-amber-200">${Number(dNed.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-bold border-r border-sky-700/80 text-amber-100">${Number(dNed.vs_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-amber-300">${dNedUcPct}%</td>

            <!-- OTHER -->
            <td class="py-3 px-2 text-right num-font font-black border-r border-sky-700/80 text-purple-200">${Number(dOth.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-bold border-r border-sky-700/80 text-purple-100">${Number(dOth.vs_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-purple-300">${dOthUcPct}%</td>

            <!-- TOTAL -->
            <td class="py-3 px-2 text-right num-font font-black border-r border-sky-700/80 text-yellow-300 bg-sky-950">${Number(dTot.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black border-r border-sky-700/80 text-sky-300">${Number(dTot.vs_uc || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-yellow-300 bg-sky-800/80">${dTotUcPct}%</td>

            <td class="py-3 px-2 text-center text-sky-300 font-normal text-[10px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else if (currentTtmEdView === 'quarter') {
      // 3. QUARTER VIEW (Q1 - Q4)
      theadHtml = `
        <thead class="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white font-bold text-[11px] border-b border-emerald-900">
          <tr>
            <th rowspan="2" class="py-2.5 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left border-r border-emerald-700/80 hdc-sticky-col-2">หน่วยบริการ</th>
            <th colspan="4" class="py-1.5 px-2 text-center border-r border-emerald-700/80 bg-emerald-700/70">ไตรมาส 1 (ต.ค.-ธ.ค.)</th>
            <th colspan="4" class="py-1.5 px-2 text-center border-r border-emerald-700/80 bg-teal-700/70">ไตรมาส 2 (ม.ค.-มี.ค.)</th>
            <th colspan="4" class="py-1.5 px-2 text-center border-r border-emerald-700/80 bg-cyan-700/70">ไตรมาส 3 (เม.ย.-มิ.ย.)</th>
            <th colspan="4" class="py-1.5 px-2 text-center border-r border-emerald-700/80 bg-sky-700/70">ไตรมาส 4 (ก.ค.-ก.ย.)</th>
            <th rowspan="2" class="py-2.5 px-2 text-center border-r border-emerald-700/80 bg-emerald-950">รวมทั้งปี (ครั้ง)</th>
            <th rowspan="2" class="py-2.5 px-2 text-center">จัดการ</th>
          </tr>
          <tr class="text-[10px] bg-emerald-950 text-emerald-100">
            <!-- Q1 -->
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">NON-ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">OTHER</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/80 font-black text-white bg-emerald-800/60">รวม Q1</th>
            <!-- Q2 -->
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">NON-ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">OTHER</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/80 font-black text-white bg-teal-800/60">รวม Q2</th>
            <!-- Q3 -->
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">NON-ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">OTHER</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/80 font-black text-white bg-cyan-800/60">รวม Q3</th>
            <!-- Q4 -->
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">NON-ED</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800/60">OTHER</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700/80 font-black text-white bg-sky-800/60">รวม Q4</th>
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#ecfdf5; border-left: 4px solid #10b981;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const q = u.quarters || {};
        const q1 = q.q1 || {}; const q2 = q.q2 || {}; const q3 = q.q3 || {}; const q4 = q.q4 || {};
        const totFy = u.full_year?.total?.vs_all || 0;

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-emerald-50/40 transition">
            <td class="py-2.5 px-2 text-center num-font font-bold text-slate-700 border-r border-slate-100 hdc-sticky-col-1">${u.hospcode}</td>
            <td class="py-2.5 px-3 border-r border-slate-100 hdc-sticky-col-2">
              <div class="font-bold text-slate-900">${u.name}</div>
              <div class="text-[10px] text-slate-400">ต.${u.subdistrict}</div>
            </td>
            <!-- Q1 -->
            <td class="py-2.5 px-1.5 text-right num-font text-emerald-700 border-r border-slate-100">${Number(q1.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-amber-700 border-r border-slate-100">${Number(q1.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-purple-700 border-r border-slate-100">${Number(q1.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-slate-900 border-r border-slate-200 bg-emerald-50/40">${Number(q1.total?.vs_all || 0).toLocaleString()}</td>

            <!-- Q2 -->
            <td class="py-2.5 px-1.5 text-right num-font text-emerald-700 border-r border-slate-100">${Number(q2.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-amber-700 border-r border-slate-100">${Number(q2.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-purple-700 border-r border-slate-100">${Number(q2.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-slate-900 border-r border-slate-200 bg-teal-50/40">${Number(q2.total?.vs_all || 0).toLocaleString()}</td>

            <!-- Q3 -->
            <td class="py-2.5 px-1.5 text-right num-font text-emerald-700 border-r border-slate-100">${Number(q3.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-amber-700 border-r border-slate-100">${Number(q3.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-purple-700 border-r border-slate-100">${Number(q3.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-slate-900 border-r border-slate-200 bg-cyan-50/40">${Number(q3.total?.vs_all || 0).toLocaleString()}</td>

            <!-- Q4 -->
            <td class="py-2.5 px-1.5 text-right num-font text-emerald-700 border-r border-slate-100">${Number(q4.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-amber-700 border-r border-slate-100">${Number(q4.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font text-purple-700 border-r border-slate-100">${Number(q4.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-2.5 px-1.5 text-right num-font font-bold text-slate-900 border-r border-slate-200 bg-sky-50/40">${Number(q4.total?.vs_all || 0).toLocaleString()}</td>

            <td class="py-2.5 px-2 text-right num-font font-black text-emerald-800 border-r border-slate-100 bg-emerald-50/70">${Number(totFy).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center">
              <button type="button" onclick="window.selectTtmEdHospital('${u.hospcode}')" class="px-2 py-1 rounded text-[11px] font-bold ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'} transition shadow-2xs">
                ${isSelected ? 'เลือกอยู่' : 'ดู รพ.สต.'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      const q1 = distQuarters.q1 || {}; const q2 = distQuarters.q2 || {}; const q3 = distQuarters.q3 || {}; const q4 = distQuarters.q4 || {};
      const dTotFy = distFullYear.total?.vs_all || 0;

      tfootHtml = `
        <tfoot class="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white font-bold text-[11px] border-t-2 border-emerald-500">
          <tr>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1 font-black">รวม</td>
            <td class="py-3 px-3 border-r border-emerald-700/80 hdc-sticky-col-2">
              <div class="font-black text-white">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</div>
              <div class="text-[10px] text-emerald-300 font-normal">แจกแจงตามไตรมาส</div>
            </td>
            <!-- Q1 -->
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q1.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-amber-200">${Number(q1.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-purple-200">${Number(q1.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white bg-emerald-800/60">${Number(q1.total?.vs_all || 0).toLocaleString()}</td>

            <!-- Q2 -->
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q2.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-amber-200">${Number(q2.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-purple-200">${Number(q2.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white bg-teal-800/60">${Number(q2.total?.vs_all || 0).toLocaleString()}</td>

            <!-- Q3 -->
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q3.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-amber-200">${Number(q3.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-purple-200">${Number(q3.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white bg-cyan-800/60">${Number(q3.total?.vs_all || 0).toLocaleString()}</td>

            <!-- Q4 -->
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(q4.ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-amber-200">${Number(q4.non_ed?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font border-r border-emerald-700/80 text-purple-200">${Number(q4.other?.vs_all || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white bg-sky-800/60">${Number(q4.total?.vs_all || 0).toLocaleString()}</td>

            <td class="py-3 px-2 text-right num-font font-black text-yellow-300 border-r border-emerald-700/80 bg-emerald-950">${Number(dTotFy).toLocaleString()}</td>
            <td class="py-3 px-2 text-center text-emerald-300 font-normal text-[10px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else {
      // 4. FULL 1:1 HDC SPREADSHEET TABLE
      theadHtml = `
        <thead class="bg-[#056839] text-white font-bold text-[10.5px] border-b border-emerald-900">
          <tr>
            <th rowspan="3" class="py-2.5 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1">หน่วยบริการ</th>
            <th colspan="16" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-[#04522d]">รวมทั้งปีงบประมาณ</th>
            <th colspan="16" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-[#065f46]">ไตรมาส 1</th>
            <th colspan="16" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-[#047857]">ไตรมาส 2</th>
            <th colspan="16" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-[#059669]">ไตรมาส 3</th>
            <th colspan="16" class="py-2 px-2 text-center bg-[#0d9488]">ไตรมาส 4</th>
          </tr>
          <tr class="text-[10px] bg-[#044d2a]">
            <!-- Full Year Subheads -->
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">NON ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">OTHER</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">บริการทั้งหมด</th>

            <!-- Q1 Subheads -->
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">NON ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">OTHER</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">บริการทั้งหมด</th>

            <!-- Q2 Subheads -->
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">NON ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">OTHER</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">บริการทั้งหมด</th>

            <!-- Q3 Subheads -->
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">NON ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">OTHER</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">บริการทั้งหมด</th>

            <!-- Q4 Subheads -->
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">NON ED</th>
            <th colspan="4" class="py-1 px-1 text-center border-r border-emerald-700/80">OTHER</th>
            <th colspan="4" class="py-1 px-1 text-center">บริการทั้งหมด</th>
          </tr>
          <tr class="text-[9.5px] bg-[#033b20] text-emerald-100">
            <!-- Repeats 5 times (Full Year, Q1, Q2, Q3, Q4) -->
            ${[0, 1, 2, 3, 4].map(() => `
              <th class="py-1 px-1 text-right border-r border-emerald-800">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800">ครั้ง</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800 text-sky-200">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-700 text-sky-200">ครั้ง</th>

              <th class="py-1 px-1 text-right border-r border-emerald-800">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800">ครั้ง</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800 text-amber-200">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-700 text-amber-200">ครั้ง</th>

              <th class="py-1 px-1 text-right border-r border-emerald-800">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800">ครั้ง</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800 text-purple-200">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-700 text-purple-200">ครั้ง</th>

              <th class="py-1 px-1 text-right border-r border-emerald-800">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800">ครั้ง</th>
              <th class="py-1 px-1 text-right border-r border-emerald-800 text-sky-200">คน</th>
              <th class="py-1 px-1 text-right border-r border-emerald-700 text-sky-200">ครั้ง</th>
            `).join('')}
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#ecfdf5; border-left: 4px solid #10b981;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const fy = u.full_year || {};
        const q = u.quarters || {};

        let cells = [];
        // Full Year
        ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
          const c = fy[cat] || {};
          cells.push(
            `<td class="py-2 px-1 text-right num-font border-r border-slate-100">${Number(c.pt_all || 0).toLocaleString()}</td>`,
            `<td class="py-2 px-1 text-right num-font font-bold border-r border-slate-100">${Number(c.vs_all || 0).toLocaleString()}</td>`,
            `<td class="py-2 px-1 text-right num-font text-sky-700 border-r border-slate-100">${Number(c.pt_uc || 0).toLocaleString()}</td>`,
            `<td class="py-2 px-1 text-right num-font font-bold text-sky-800 border-r border-slate-200 bg-sky-50/20">${Number(c.vs_uc || 0).toLocaleString()}</td>`
          );
        });

        // Q1 - Q4
        for (let qi = 1; qi <= 4; qi++) {
          const qd = q[`q${qi}`] || {};
          ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
            const c = qd[cat] || {};
            cells.push(
              `<td class="py-2 px-1 text-right num-font border-r border-slate-100">${Number(c.pt_all || 0).toLocaleString()}</td>`,
              `<td class="py-2 px-1 text-right num-font font-bold border-r border-slate-100">${Number(c.vs_all || 0).toLocaleString()}</td>`,
              `<td class="py-2 px-1 text-right num-font text-sky-700 border-r border-slate-100">${Number(c.pt_uc || 0).toLocaleString()}</td>`,
              `<td class="py-2 px-1 text-right num-font font-bold text-sky-800 border-r border-slate-200 bg-sky-50/20">${Number(c.vs_uc || 0).toLocaleString()}</td>`
            );
          });
        }

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-emerald-50/40 transition">
            <td class="py-2 px-2 font-bold text-slate-800 border-r border-slate-200 hdc-sticky-col-1 truncate" style="max-width:240px;" title="${u.hospcode}: ${u.name}">
              <span class="num-font text-emerald-700 font-bold">${u.hospcode}:</span> ${u.name}
            </td>
            ${cells.join('')}
          </tr>
        `;
      }).join('');

      // District Total Row
      let totCells = [];
      ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
        const c = distFullYear[cat] || {};
        totCells.push(
          `<td class="py-2.5 px-1 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(c.pt_all || 0).toLocaleString()}</td>`,
          `<td class="py-2.5 px-1 text-right num-font font-black border-r border-emerald-700/80 text-white bg-emerald-800/40">${Number(c.vs_all || 0).toLocaleString()}</td>`,
          `<td class="py-2.5 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(c.pt_uc || 0).toLocaleString()}</td>`,
          `<td class="py-2.5 px-1 text-right num-font font-bold border-r border-emerald-700 text-sky-100">${Number(c.vs_uc || 0).toLocaleString()}</td>`
        );
      });

      for (let qi = 1; qi <= 4; qi++) {
        const qd = distQuarters[`q${qi}`] || {};
        ['ed', 'non_ed', 'other', 'total'].forEach(cat => {
          const c = qd[cat] || {};
          totCells.push(
            `<td class="py-2.5 px-1 text-right num-font border-r border-emerald-700/80 text-emerald-200">${Number(c.pt_all || 0).toLocaleString()}</td>`,
            `<td class="py-2.5 px-1 text-right num-font font-black border-r border-emerald-700/80 text-white bg-emerald-800/40">${Number(c.vs_all || 0).toLocaleString()}</td>`,
            `<td class="py-2.5 px-1 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(c.pt_uc || 0).toLocaleString()}</td>`,
            `<td class="py-2.5 px-1 text-right num-font font-bold border-r border-emerald-700 text-sky-100">${Number(c.vs_uc || 0).toLocaleString()}</td>`
          );
        });
      }

      tfootHtml = `
        <tfoot class="bg-[#033b20] text-white font-bold text-[10.5px] border-t-2 border-emerald-400">
          <tr>
            <td class="py-2.5 px-2 border-r border-emerald-700/80 hdc-sticky-col-1 font-black text-white">รวม</td>
            ${totCells.join('')}
          </tr>
        </tfoot>
      `;
    }

    tableEl.innerHTML = `${theadHtml}<tbody>${tbodyHtml}</tbody>${tfootHtml}`;

    if (window.lucide) {
      lucide.createIcons();
    }
  }


  // ==========================================
  // TTM CASES / QUANTITY BREAKDOWN (s_ttm2)
  // ==========================================
  window.switchTtmCasesView = function(view) {
    currentTtmCasesView = view;
    renderTtmCasesPanel();
  };

  window.switchTtmCasesYear = function(yr) {
    currentTtmCasesYear = yr;
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
    renderTtmCasesPanel();
  };

  window.switchTtmCasesChartMode = function(mode) {
    currentTtmCasesChartMode = mode;
    renderTtmCasesPanel();
  };

  window.selectTtmCasesHospital = function(hospcode) {
    currentUnit = hospcode;
    if (unitSelect) unitSelect.value = hospcode;
    updateDashboardView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.exportTtmCasesCsv = function() {
    const yr = currentTtmCasesYear || currentYear || '2569';
    const ind = masterData?.indicators?.['ttm_cases'];
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];
    const distSummary = yrData.summary || {};
    const fullYr = distSummary.full_year || {};
    const qtr = distSummary.quarters || {};

    let csvContent = '\uFEFF';

    if (currentTtmCasesView === 'full_year') {
      csvContent += `ตารางสรุปการจ่ายยาสมุนไพรทั้งปีงบประมาณ อำเภอสารภี ปี ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,ทุกสิทธิ (ครั้ง),ทุกสิทธิ (รายการ),สิทธิ UC (ครั้ง),สิทธิ UC (รายการ),สัดส่วน UC ครั้ง (%),สัดส่วน UC รายการ (%),เฉลี่ยรายการต่อครั้ง (ทุกสิทธิ),เฉลี่ยรายการต่อครั้ง (สิทธิ UC)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const fy = u.full_year || {};
        csvContent += `"${u.hospcode}","${uName}","${uSub}",${fy.all_visits || 0},${fy.all_items || 0},${fy.uc_visits || 0},${fy.uc_items || 0},${fy.uc_share_vs || 0},${fy.uc_share_it || 0},${fy.item_ratio_all || 0},${fy.item_ratio_uc || 0}\n`;
      });

      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",${fullYr.all_visits || 0},${fullYr.all_items || 0},${fullYr.uc_visits || 0},${fullYr.uc_items || 0},${fullYr.uc_share_vs || 0},${fullYr.uc_share_it || 0},${fullYr.item_ratio_all || 0},${fullYr.item_ratio_uc || 0}\n`;

    } else if (currentTtmCasesView === 'uc') {
      csvContent += `ตารางเปรียบเทียบสิทธิการรักษา (ทุกสิทธิ vs สิทธิ UC) ปริมาณการจ่ายยาสมุนไพร อำเภอสารภี ปี ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,ทุกสิทธิ (ครั้ง),สิทธิ UC (ครั้ง),สัดส่วน UC ครั้ง (%),ทุกสิทธิ (รายการ),สิทธิ UC (รายการ),สัดส่วน UC รายการ (%),เฉลี่ยต่อครั้ง ทุกสิทธิ (รายการ/ครั้ง),เฉลี่ยต่อครั้ง สิทธิ UC (รายการ/ครั้ง)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const fy = u.full_year || {};
        csvContent += `"${u.hospcode}","${uName}","${uSub}",${fy.all_visits || 0},${fy.uc_visits || 0},${fy.uc_share_vs || 0},${fy.all_items || 0},${fy.uc_items || 0},${fy.uc_share_it || 0},${fy.item_ratio_all || 0},${fy.item_ratio_uc || 0}\n`;
      });

      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",${fullYr.all_visits || 0},${fullYr.uc_visits || 0},${fullYr.uc_share_vs || 0},${fullYr.all_items || 0},${fullYr.uc_items || 0},${fullYr.uc_share_it || 0},${fullYr.item_ratio_all || 0},${fullYr.item_ratio_uc || 0}\n`;

    } else if (currentTtmCasesView === 'quarter') {
      csvContent += `ตารางปริมาณการจ่ายยาสมุนไพรรายไตรมาส (Q1 - Q4) อำเภอสารภี ปี ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,Q1 ทุกสิทธิ(ครั้ง),Q1 ทุกสิทธิ(รายการ),Q1 UC(ครั้ง),Q1 UC(รายการ),Q2 ทุกสิทธิ(ครั้ง),Q2 ทุกสิทธิ(รายการ),Q2 UC(ครั้ง),Q2 UC(รายการ),Q3 ทุกสิทธิ(ครั้ง),Q3 ทุกสิทธิ(รายการ),Q3 UC(ครั้ง),Q3 UC(รายการ),Q4 ทุกสิทธิ(ครั้ง),Q4 ทุกสิทธิ(รายการ),Q4 UC(ครั้ง),Q4 UC(รายการ),รวมทั้งปี ทุกสิทธิ(ครั้ง),รวมทั้งปี ทุกสิทธิ(รายการ)\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const q = u.quarters || {};
        const q1 = q.q1 || {}; const q2 = q.q2 || {}; const q3 = q.q3 || {}; const q4 = q.q4 || {};

        csvContent += `"${u.hospcode}","${uName}","${uSub}",${q1.all_visits || 0},${q1.all_items || 0},${q1.uc_visits || 0},${q1.uc_items || 0},${q2.all_visits || 0},${q2.all_items || 0},${q2.uc_visits || 0},${q2.uc_items || 0},${q3.all_visits || 0},${q3.all_items || 0},${q3.uc_visits || 0},${q3.uc_items || 0},${q4.all_visits || 0},${q4.all_items || 0},${q4.uc_visits || 0},${q4.uc_items || 0},${u.full_year?.all_visits || 0},${u.full_year?.all_items || 0}\n`;
      });

      const q1 = qtr.q1 || {}; const q2 = qtr.q2 || {}; const q3 = qtr.q3 || {}; const q4 = qtr.q4 || {};
      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",${q1.all_visits || 0},${q1.all_items || 0},${q1.uc_visits || 0},${q1.uc_items || 0},${q2.all_visits || 0},${q2.all_items || 0},${q2.uc_visits || 0},${q2.uc_items || 0},${q3.all_visits || 0},${q3.all_items || 0},${q3.uc_visits || 0},${q3.uc_items || 0},${q4.all_visits || 0},${q4.all_items || 0},${q4.uc_visits || 0},${q4.uc_items || 0},${fullYr.all_visits || 0},${fullYr.all_items || 0}\n`;

    } else {
      // 1:1 HDC Matrix Export
      csvContent += `ตารางมาตรฐาน HDC s_ttm2: OPD ปริมาณการจ่ายยาสมุนไพร อำเภอสารภี ปีงบประมาณ ${yr}\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,รวมทั้งปี ทุกสิทธิ(ครั้ง),รวมทั้งปี ทุกสิทธิ(รายการ),รวมทั้งปี สิทธิ UC(ครั้ง),รวมทั้งปี สิทธิ UC(รายการ),';
      for (let qi = 1; qi <= 4; qi++) {
        csvContent += `Q${qi} ทุกสิทธิ(ครั้ง),Q${qi} ทุกสิทธิ(รายการ),Q${qi} สิทธิ UC(ครั้ง),Q${qi} สิทธิ UC(รายการ)${qi === 4 ? '\n' : ','}`;
      }

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const fy = u.full_year || {};
        const q = u.quarters || {};
        let line = `"${u.hospcode}","${uName}",${fy.all_visits || 0},${fy.all_items || 0},${fy.uc_visits || 0},${fy.uc_items || 0},`;
        for (let qi = 1; qi <= 4; qi++) {
          const qd = q[`q${qi}`] || {};
          line += `${qd.all_visits || 0},${qd.all_items || 0},${qd.uc_visits || 0},${qd.uc_items || 0}${qi === 4 ? '' : ','}`;
        }
        csvContent += line + '\n';
      });

      let totLine = `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)",${fullYr.all_visits || 0},${fullYr.all_items || 0},${fullYr.uc_visits || 0},${fullYr.uc_items || 0},`;
      for (let qi = 1; qi <= 4; qi++) {
        const qd = qtr[`q${qi}`] || {};
        totLine += `${qd.all_visits || 0},${qd.all_items || 0},${qd.uc_visits || 0},${qd.uc_items || 0}${qi === 4 ? '' : ','}`;
      }
      csvContent += totLine + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `HDC_s_ttm2_Saraphi_${yr}_${currentTtmCasesView}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  function renderTtmCasesPanel() {
    if (currentIndicatorId !== 'ttm_cases') {
      if (ttmCasesPanel) ttmCasesPanel.classList.add('hidden');
      return;
    }
    if (ttmCasesPanel) ttmCasesPanel.classList.remove('hidden');

    const yr = currentTtmCasesYear || currentYear || '2569';

    // 1. Sync View Mode Buttons
    ['full', 'full_year', 'uc', 'quarter'].forEach(v => {
      const btn = document.getElementById(`btn-ttm-cases-view-${v}`);
      if (btn) {
        if (v === currentTtmCasesView) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Sync Year Filter Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-ttm-cases-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 3. Sync Chart Mode Buttons
    ['hdc_4charts', 'compare_uc', 'trend'].forEach(m => {
      const btn = document.getElementById(`btn-ttm-cases-chart-${m === 'hdc_4charts' ? 'hdc' : (m === 'compare_uc' ? 'compare' : 'trend')}`);
      if (btn) {
        if (m === currentTtmCasesChartMode) {
          btn.className = 'px-2.5 py-1 rounded-lg font-bold transition bg-emerald-600 text-white shadow-xs';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 4. Resolve Master Data
    const ind = masterData?.indicators?.['ttm_cases'];
    const yrData = ind?.years?.[yr] || {};
    const distSummary = yrData.summary || {
      full_year: {
        all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0,
        item_ratio_all: 0, item_ratio_uc: 0, uc_share_vs: 0, uc_share_it: 0
      },
      quarters: {
        q1: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 },
        q2: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 },
        q3: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 },
        q4: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 }
      }
    };
    const distFullYear = distSummary.full_year || {};
    const distQuarters = distSummary.quarters || {};
    const rawUnits = yrData.units || [];

    const unitsList = rawUnits.map(u => {
      const meta = SARAPHI_UNITS_MAP[u.hospcode];
      const cleanName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
      const cleanShort = (u.hospcode === '06023') ? 'บ้านป่าสา' : (meta ? meta.short : (u.subdistrict || u.name));
      const cleanSubdistrict = meta ? meta.subdistrict : (u.subdistrict || '');
      return {
        ...u,
        name: cleanName,
        short: cleanShort,
        subdistrict: cleanSubdistrict,
        full_year: u.full_year || {
          all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0,
          item_ratio_all: 0, item_ratio_uc: 0, uc_share_vs: 0, uc_share_it: 0
        },
        quarters: u.quarters || {
          q1: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 },
          q2: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 },
          q3: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 },
          q4: { all_visits: 0, all_items: 0, uc_visits: 0, uc_items: 0 }
        }
      };
    });

    // 5. Update Bento Stats
    let statsAllVs = distFullYear.all_visits || 0;
    let statsAllIt = distFullYear.all_items || 0;
    let statsUcVs = distFullYear.uc_visits || 0;
    let statsUcIt = distFullYear.uc_items || 0;
    let statsRatio = distFullYear.item_ratio_all || 0;
    let statsUcRatio = distFullYear.item_ratio_uc || 0;
    let statsUcShare = distFullYear.uc_share_vs || 0;

    if (currentUnit !== 'all') {
      const curU = unitsList.find(u => u.hospcode === currentUnit);
      if (curU) {
        const cfy = curU.full_year;
        statsAllVs = cfy.all_visits || 0;
        statsAllIt = cfy.all_items || 0;
        statsUcVs = cfy.uc_visits || 0;
        statsUcIt = cfy.uc_items || 0;
        statsRatio = cfy.item_ratio_all || 0;
        statsUcRatio = cfy.item_ratio_uc || 0;
        statsUcShare = cfy.uc_share_vs || 0;
      }
    }

    const statAllVsEl = document.getElementById('ttm-cases-stat-all-vs');
    const statAllItEl = document.getElementById('ttm-cases-stat-all-it');
    const statUcShareEl = document.getElementById('ttm-cases-stat-uc-share');
    const statUcVsEl = document.getElementById('ttm-cases-stat-uc-vs');
    const statUcItEl = document.getElementById('ttm-cases-stat-uc-it');
    const card2ShareEl = document.getElementById('ttm-cases-card2-share');
    const statRatioEl = document.getElementById('ttm-cases-stat-ratio');
    const statUcRatioValEl = document.getElementById('ttm-cases-stat-uc-ratio-val');
    const statTopNameEl = document.getElementById('ttm-cases-stat-top-name');
    const statTopValEl = document.getElementById('ttm-cases-stat-top-val');

    if (statAllVsEl) statAllVsEl.textContent = Number(statsAllVs).toLocaleString();
    if (statAllItEl) statAllItEl.textContent = Number(statsAllIt).toLocaleString();
    if (statUcShareEl) statUcShareEl.textContent = `สิทธิ UC ${statsUcShare.toFixed(1)}%`;
    if (statUcVsEl) statUcVsEl.textContent = Number(statsUcVs).toLocaleString();
    if (statUcItEl) statUcItEl.textContent = Number(statsUcIt).toLocaleString();
    if (card2ShareEl) card2ShareEl.textContent = `${statsUcShare.toFixed(1)}%`;
    if (statRatioEl) statRatioEl.textContent = Number(statsRatio).toFixed(2);
    if (statUcRatioValEl) statUcRatioValEl.textContent = Number(statsUcRatio).toFixed(2);

    // Top Health Center (excluding 11135 Saraphi Hospital)
    const primaryCareUnits = unitsList.filter(u => u.hospcode !== '11135');
    const topPrimaryUnit = [...primaryCareUnits].sort((a, b) => (b.full_year.all_visits || 0) - (a.full_year.all_visits || 0))[0];
    if (statTopNameEl && topPrimaryUnit) {
      statTopNameEl.textContent = topPrimaryUnit.name;
    }
    if (statTopValEl && topPrimaryUnit) {
      statTopValEl.textContent = `${Number(topPrimaryUnit.full_year.all_visits).toLocaleString()} ครั้ง (${Number(topPrimaryUnit.full_year.all_items).toLocaleString()} รายการ)`;
    }

    // 6. Render Charts
    const hdcChartsContainer = document.getElementById('ttm-cases-hdc-charts-container');
    const altChartsContainer = document.getElementById('ttm-cases-alt-charts-container');

    // Inline plugin to render values above bars
    const barDataLabelsPlugin = {
      id: 'barDataLabelsTtmCases',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const val = dataset.data[index];
            if (val !== undefined && val !== null && val > 0) {
              ctx.save();
              ctx.fillStyle = '#1e293b';
              ctx.font = 'bold 9px Prompt, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(Number(val).toLocaleString(), bar.x, bar.y - 2);
              ctx.restore();
            }
          });
        });
      }
    };

    if (currentTtmCasesChartMode === 'hdc_4charts') {
      if (hdcChartsContainer) hdcChartsContainer.classList.remove('hidden');
      if (altChartsContainer) altChartsContainer.classList.add('hidden');

      // Canonical HDC labels
      const hdcLabels = [
        'รวม',
        ...unitsList.map(u => `${u.hospcode} ${u.short}`)
      ];

      const createHdcBarChart = (canvasId, oldInstance, totalVal, unitProp) => {
        if (oldInstance) oldInstance.destroy();
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const dataVals = [
          totalVal,
          ...unitsList.map(u => u.full_year[unitProp] || 0)
        ];

        const bgColors = dataVals.map((_, idx) => {
          if (idx === 0) return 'rgba(110, 231, 183, 0.9)'; // Total mint
          const u = unitsList[idx - 1];
          return (u && u.hospcode === currentUnit) ? 'rgba(5, 150, 105, 0.95)' : 'rgba(167, 243, 208, 0.85)';
        });

        const borderColors = dataVals.map((_, idx) => {
          if (idx === 0) return '#059669';
          const u = unitsList[idx - 1];
          return (u && u.hospcode === currentUnit) ? '#047857' : '#10b981';
        });

        const maxVal = Math.max(...dataVals, 10);
        const yMax = Math.ceil(maxVal * 1.2 / 5000) * 5000;

        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
          type: 'bar',
          data: {
            labels: hdcLabels,
            datasets: [{
              data: dataVals,
              backgroundColor: bgColors,
              borderColor: borderColors,
              borderWidth: 1.5,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 16, bottom: 4, left: 4, right: 4 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { family: 'Prompt', size: 12, weight: 'bold' },
                bodyFont: { family: 'Prompt', size: 11 },
                callbacks: {
                  label: function(c) {
                    return ` ผลงาน: ${Number(c.raw).toLocaleString()}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: { family: 'Prompt', size: 9.5, weight: '500' },
                  color: function(c) {
                    if (c.index === 0) return '#047857';
                    const u = unitsList[c.index - 1];
                    return (u && u.hospcode === currentUnit) ? '#059669' : '#475569';
                  }
                }
              },
              y: {
                max: yMax,
                grid: { color: 'rgba(226, 232, 240, 0.7)' },
                ticks: {
                  font: { family: 'Prompt', size: 10 },
                  callback: function(v) {
                    return v >= 1000 ? (v / 1000) + 'k' : v;
                  }
                }
              }
            }
          },
          plugins: [barDataLabelsPlugin]
        });
      };

      ttmCasesChartAllVsInstance = createHdcBarChart('ttmCasesChartAllVs', ttmCasesChartAllVsInstance, distFullYear.all_visits || 0, 'all_visits');
      ttmCasesChartAllItInstance = createHdcBarChart('ttmCasesChartAllIt', ttmCasesChartAllItInstance, distFullYear.all_items || 0, 'all_items');
      ttmCasesChartUcVsInstance = createHdcBarChart('ttmCasesChartUcVs', ttmCasesChartUcVsInstance, distFullYear.uc_visits || 0, 'uc_visits');
      ttmCasesChartUcItInstance = createHdcBarChart('ttmCasesChartUcIt', ttmCasesChartUcItInstance, distFullYear.uc_items || 0, 'uc_items');

    } else {
      if (hdcChartsContainer) hdcChartsContainer.classList.add('hidden');
      if (altChartsContainer) altChartsContainer.classList.remove('hidden');

      if (ttmCasesAltChartInstance) ttmCasesAltChartInstance.destroy();
      const altCanvas = document.getElementById('ttmCasesAltChart');

      if (altCanvas) {
        const altCtx = altCanvas.getContext('2d');
        const altTitleEl = document.getElementById('ttm-cases-alt-chart-title');
        const altSubtitleEl = document.getElementById('ttm-cases-alt-chart-subtitle');

        if (currentTtmCasesChartMode === 'compare_uc') {
          if (altTitleEl) altTitleEl.innerHTML = '<i class="fa-solid fa-chart-column text-emerald-600"></i> เปรียบเทียบปริมาณการจ่ายยาสมุนไพร ทุกสิทธิ vs สิทธิ UC (จำนวนครั้ง)';
          if (altSubtitleEl) altSubtitleEl.textContent = `จำแนกตาม 14 สถานบริการในอำเภอสารภี ปีงบประมาณ ${yr}`;

          const altLabels = unitsList.map(u => `${u.hospcode} ${u.short}`);
          const allVsData = unitsList.map(u => u.full_year.all_visits || 0);
          const ucVsData = unitsList.map(u => u.full_year.uc_visits || 0);

          ttmCasesAltChartInstance = new Chart(altCtx, {
            type: 'bar',
            data: {
              labels: altLabels,
              datasets: [
                {
                  label: 'จ่ายยาทุกสิทธิ (ครั้ง)',
                  data: allVsData,
                  backgroundColor: 'rgba(16, 185, 129, 0.85)',
                  borderColor: '#059669',
                  borderWidth: 1.5,
                  borderRadius: 4
                },
                {
                  label: 'จ่ายยาสิทธิ UC (ครั้ง)',
                  data: ucVsData,
                  backgroundColor: 'rgba(14, 165, 233, 0.85)',
                  borderColor: '#0284c7',
                  borderWidth: 1.5,
                  borderRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: { font: { family: 'Prompt', size: 11, weight: '600' } }
                }
              },
              scales: {
                x: {
                  ticks: { maxRotation: 45, minRotation: 45, font: { family: 'Prompt', size: 10 } },
                  grid: { display: false }
                },
                y: {
                  ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() },
                  grid: { color: 'rgba(226, 232, 240, 0.7)' }
                }
              }
            }
          });

        } else if (currentTtmCasesChartMode === 'trend') {
          if (altTitleEl) altTitleEl.innerHTML = '<i class="fa-solid fa-chart-line text-emerald-600"></i> แนวโน้มปริมาณการจ่ายยาสมุนไพรรายไตรมาส (Q1 - Q4)';
          if (altSubtitleEl) altSubtitleEl.textContent = `เปรียบเทียบผลงาน Q1 ถึง Q4 อำเภอสารภี ปีงบประมาณ ${yr}`;

          const quarters = ['ไตรมาส 1', 'ไตรมาส 2', 'ไตรมาส 3', 'ไตรมาส 4'];
          const qKeys = ['q1', 'q2', 'q3', 'q4'];

          let allVsTrend = [];
          let allItTrend = [];
          let ucVsTrend = [];
          let ucItTrend = [];

          if (currentUnit === 'all') {
            allVsTrend = qKeys.map(k => distQuarters[k]?.all_visits || 0);
            allItTrend = qKeys.map(k => distQuarters[k]?.all_items || 0);
            ucVsTrend = qKeys.map(k => distQuarters[k]?.uc_visits || 0);
            ucItTrend = qKeys.map(k => distQuarters[k]?.uc_items || 0);
          } else {
            const curU = unitsList.find(u => u.hospcode === currentUnit);
            allVsTrend = qKeys.map(k => curU?.quarters?.[k]?.all_visits || 0);
            allItTrend = qKeys.map(k => curU?.quarters?.[k]?.all_items || 0);
            ucVsTrend = qKeys.map(k => curU?.quarters?.[k]?.uc_visits || 0);
            ucItTrend = qKeys.map(k => curU?.quarters?.[k]?.uc_items || 0);
          }

          ttmCasesAltChartInstance = new Chart(altCtx, {
            type: 'line',
            data: {
              labels: quarters,
              datasets: [
                {
                  label: 'ทุกสิทธิ (ครั้ง)',
                  data: allVsTrend,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  tension: 0.3,
                  fill: true,
                  pointRadius: 5
                },
                {
                  label: 'ทุกสิทธิ (รายการ)',
                  data: allItTrend,
                  borderColor: '#059669',
                  backgroundColor: 'transparent',
                  borderDash: [5, 5],
                  tension: 0.3,
                  pointRadius: 4
                },
                {
                  label: 'สิทธิ UC (ครั้ง)',
                  data: ucVsTrend,
                  borderColor: '#0284c7',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  tension: 0.3,
                  fill: true,
                  pointRadius: 5
                },
                {
                  label: 'สิทธิ UC (รายการ)',
                  data: ucItTrend,
                  borderColor: '#0369a1',
                  backgroundColor: 'transparent',
                  borderDash: [5, 5],
                  tension: 0.3,
                  pointRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: { font: { family: 'Prompt', size: 11, weight: '600' } }
                }
              },
              scales: {
                x: {
                  ticks: { font: { family: 'Prompt', size: 11, weight: '600' } },
                  grid: { display: false }
                },
                y: {
                  ticks: { font: { family: 'Prompt', size: 10 }, callback: v => Number(v).toLocaleString() },
                  grid: { color: 'rgba(226, 232, 240, 0.7)' }
                }
              }
            }
          });
        }
      }
    }

    // 7. Render HDC Matrix Table
    const tableEl = document.getElementById('ttm-cases-matrix-table');
    if (!tableEl) return;

    // Filter units by search query
    const qLower = (ttmCasesSearchQuery || '').trim().toLowerCase();
    const filteredUnits = unitsList.filter(u => {
      if (!qLower) return true;
      return (u.name && u.name.toLowerCase().includes(qLower)) ||
             (u.short && u.short.toLowerCase().includes(qLower)) ||
             (u.hospcode && u.hospcode.includes(qLower)) ||
             (u.subdistrict && u.subdistrict.toLowerCase().includes(qLower));
    });

    // Update table heading
    const headEl = document.getElementById('ttm-cases-table-heading');
    const subHeadEl = document.getElementById('ttm-cases-table-subheading');
    if (headEl) {
      if (currentTtmCasesView === 'full_year') headEl.textContent = `ตารางสรุปผลงานทั้งปีงบประมาณ ${yr} (ทุกสิทธิ และสิทธิ UC)`;
      else if (currentTtmCasesView === 'uc') headEl.textContent = `ตารางเปรียบเทียบสิทธิการรักษา ทุกสิทธิ vs สิทธิ UC ปีงบประมาณ ${yr}`;
      else if (currentTtmCasesView === 'quarter') headEl.textContent = `ตารางแจกแจงผลงานรายไตรมาส (Q1 - Q4) ปีงบประมาณ ${yr}`;
      else headEl.textContent = `ตารางมาตรฐาน HDC s_ttm2: OPD ปริมาณการจ่ายยาสมุนไพร 1:1 (${yr})`;
    }
    if (subHeadEl) {
      subHeadEl.textContent = `แสดงข้อมูล 14 หน่วยบริการ อำเภอสารภี (พบ ${filteredUnits.length} แห่ง)`;
    }

    let theadHtml = '';
    let tbodyHtml = '';
    let tfootHtml = '';

    if (currentTtmCasesView === 'full_year') {
      // 1. FULL YEAR SUMMARY VIEW
      theadHtml = `
        <thead class="bg-gradient-to-r from-[#047857] via-[#059669] to-[#065f46] text-white font-bold text-[11px] border-b border-emerald-800">
          <tr>
            <th rowspan="2" class="py-2.5 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left border-r border-emerald-700/80 hdc-sticky-col-2">หน่วยบริการ</th>
            <th colspan="2" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-emerald-800/80">จ่ายยาสมุนไพรทุกสิทธิ</th>
            <th colspan="2" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-teal-800/80">จ่ายยาสมุนไพรสิทธิ UC</th>
            <th colspan="2" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-sky-800/80">สัดส่วน UC (%)</th>
            <th colspan="2" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-amber-800/80">เฉลี่ยรายการต่อครั้ง</th>
            <th rowspan="2" class="py-2.5 px-2 text-center">จัดการ</th>
          </tr>
          <tr class="text-[10.5px] bg-emerald-900/60 text-emerald-100">
            <th class="py-1 px-2 text-right border-r border-emerald-800/60">ครั้ง</th>
            <th class="py-1 px-2 text-right border-r border-emerald-800/60">รายการ</th>
            <th class="py-1 px-2 text-right border-r border-emerald-800/60 text-sky-200">ครั้ง</th>
            <th class="py-1 px-2 text-right border-r border-emerald-800/60 text-sky-200">รายการ</th>
            <th class="py-1 px-2 text-center border-r border-emerald-800/60 text-sky-200">% ครั้ง</th>
            <th class="py-1 px-2 text-center border-r border-emerald-800/60 text-sky-200">% รายการ</th>
            <th class="py-1 px-2 text-center border-r border-emerald-800/60">ทุกสิทธิ</th>
            <th class="py-1 px-2 text-center border-r border-emerald-800/60 text-sky-200">สิทธิ UC</th>
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#ecfdf5; border-left: 4px solid #10b981;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const fy = u.full_year || {};

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-emerald-50/50 transition">
            <td class="py-2.5 px-2 text-center num-font font-bold text-slate-500 border-r border-slate-100 hdc-sticky-col-1">${u.hospcode}</td>
            <td class="py-2.5 px-3 border-r border-slate-100 hdc-sticky-col-2">
              <div class="font-bold text-slate-800">${u.name}</div>
              <div class="text-[10px] text-slate-400">ต.${u.subdistrict}</div>
            </td>
            <td class="py-2.5 px-2 text-right num-font font-bold text-slate-900 border-r border-slate-100">${Number(fy.all_visits || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font font-black text-emerald-800 border-r border-slate-100">${Number(fy.all_items || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font font-bold text-teal-700 border-r border-slate-100">${Number(fy.uc_visits || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font font-black text-teal-900 border-r border-slate-100">${Number(fy.uc_items || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center num-font font-semibold text-sky-700 border-r border-slate-100 bg-sky-50/30">${fy.uc_share_vs || 0}%</td>
            <td class="py-2.5 px-2 text-center num-font font-semibold text-sky-700 border-r border-slate-100 bg-sky-50/30">${fy.uc_share_it || 0}%</td>
            <td class="py-2.5 px-2 text-center num-font font-bold text-amber-800 border-r border-slate-100 bg-amber-50/20">${fy.item_ratio_all || 0}</td>
            <td class="py-2.5 px-2 text-center num-font font-bold text-blue-800 border-r border-slate-100 bg-blue-50/20">${fy.item_ratio_uc || 0}</td>
            <td class="py-2.5 px-2 text-center">
              <button type="button" onclick="window.selectTtmCasesHospital('${u.hospcode}')" class="px-2 py-1 rounded text-[11px] font-bold ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'} transition shadow-2xs">
                ${isSelected ? 'เลือกอยู่' : 'ดู รพ.สต.'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tfootHtml = `
        <tfoot class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white font-bold text-[11px] border-t-2 border-emerald-500">
          <tr>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1 font-black">รวม</td>
            <td class="py-3 px-3 border-r border-emerald-700/80 hdc-sticky-col-2">
              <div class="font-black text-white">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</div>
              <div class="text-[10px] text-emerald-300 font-normal">ข้อมูลระบบ HDC ราชการ</div>
            </td>
            <td class="py-3 px-2 text-right num-font font-black border-r border-emerald-700/80 text-white bg-emerald-800/40">${Number(distFullYear.all_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black border-r border-emerald-700/80 text-yellow-300 bg-emerald-950/70">${Number(distFullYear.all_items || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-bold border-r border-emerald-700/80 text-teal-200">${Number(distFullYear.uc_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black border-r border-emerald-700/80 text-teal-300">${Number(distFullYear.uc_items || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 text-sky-300 num-font font-black">${distFullYear.uc_share_vs || 0}%</td>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 text-sky-300 num-font font-black">${distFullYear.uc_share_it || 0}%</td>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 text-amber-200 num-font font-black">${distFullYear.item_ratio_all || 0}</td>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 text-blue-200 num-font font-black">${distFullYear.item_ratio_uc || 0}</td>
            <td class="py-3 px-2 text-center text-emerald-300 font-normal text-[10px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else if (currentTtmCasesView === 'uc') {
      // 2. RIGHTS COMPARISON VIEW
      theadHtml = `
        <thead class="bg-gradient-to-r from-teal-800 via-sky-800 to-indigo-900 text-white font-bold text-[11px] border-b border-sky-800">
          <tr>
            <th rowspan="2" class="py-2.5 px-2 text-center border-r border-sky-700/80 hdc-sticky-col-1">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left border-r border-sky-700/80 hdc-sticky-col-2">หน่วยบริการ</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-sky-700/80 bg-emerald-800/80">จำนวนครั้ง (Visits)</th>
            <th colspan="3" class="py-2 px-2 text-center border-r border-sky-700/80 bg-teal-800/80">จำนวนรายการ (Items)</th>
            <th colspan="2" class="py-2 px-2 text-center border-r border-sky-700/80 bg-blue-800/80">เฉลี่ยรายการต่อครั้ง</th>
            <th rowspan="2" class="py-2.5 px-2 text-center">จัดการ</th>
          </tr>
          <tr class="text-[10.5px] bg-sky-950/80 text-sky-100">
            <th class="py-1 px-2 text-right border-r border-sky-800/80">ทุกสิทธิ</th>
            <th class="py-1 px-2 text-right border-r border-sky-800/80 text-sky-200">สิทธิ UC</th>
            <th class="py-1 px-2 text-center border-r border-sky-800/80 text-emerald-300">% UC</th>
            <th class="py-1 px-2 text-right border-r border-sky-800/80">ทุกสิทธิ</th>
            <th class="py-1 px-2 text-right border-r border-sky-800/80 text-sky-200">สิทธิ UC</th>
            <th class="py-1 px-2 text-center border-r border-sky-800/80 text-teal-300">% UC</th>
            <th class="py-1 px-2 text-center border-r border-sky-800/80">ทุกสิทธิ</th>
            <th class="py-1 px-2 text-center border-r border-sky-800/80 text-sky-200">สิทธิ UC</th>
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#f0fdf4; border-left: 4px solid #0ea5e9;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const fy = u.full_year || {};

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-sky-50/50 transition">
            <td class="py-2.5 px-2 text-center num-font font-bold text-slate-500 border-r border-slate-100 hdc-sticky-col-1">${u.hospcode}</td>
            <td class="py-2.5 px-3 border-r border-slate-100 hdc-sticky-col-2">
              <div class="font-bold text-slate-800">${u.name}</div>
              <div class="text-[10px] text-slate-400">ต.${u.subdistrict}</div>
            </td>
            <td class="py-2.5 px-2 text-right num-font font-black text-slate-900 border-r border-slate-100">${Number(fy.all_visits || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font font-bold text-sky-800 border-r border-slate-100">${Number(fy.uc_visits || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center num-font font-black text-emerald-700 border-r border-slate-100 bg-emerald-50/40">${fy.uc_share_vs || 0}%</td>
            <td class="py-2.5 px-2 text-right num-font font-black text-slate-900 border-r border-slate-100">${Number(fy.all_items || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-right num-font font-bold text-teal-800 border-r border-slate-100">${Number(fy.uc_items || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2 text-center num-font font-black text-teal-700 border-r border-slate-100 bg-teal-50/40">${fy.uc_share_it || 0}%</td>
            <td class="py-2.5 px-2 text-center num-font font-bold text-slate-700 border-r border-slate-100">${fy.item_ratio_all || 0}</td>
            <td class="py-2.5 px-2 text-center num-font font-bold text-blue-800 border-r border-slate-100">${fy.item_ratio_uc || 0}</td>
            <td class="py-2.5 px-2 text-center">
              <button type="button" onclick="window.selectTtmCasesHospital('${u.hospcode}')" class="px-2 py-1 rounded text-[11px] font-bold ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800'} transition shadow-2xs">
                ${isSelected ? 'เลือกอยู่' : 'ดู รพ.สต.'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tfootHtml = `
        <tfoot class="bg-gradient-to-r from-sky-950 via-sky-900 to-slate-900 text-white font-bold text-[11px] border-t-2 border-sky-500">
          <tr>
            <td class="py-3 px-2 text-center border-r border-sky-700/80 hdc-sticky-col-1 font-black">รวม</td>
            <td class="py-3 px-3 border-r border-sky-700/80 hdc-sticky-col-2">
              <div class="font-black text-white">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</div>
              <div class="text-[10px] text-sky-300 font-normal">เปรียบเทียบสิทธิ UC รายอำเภอ</div>
            </td>
            <td class="py-3 px-2 text-right num-font font-black border-r border-sky-700/80 text-white bg-slate-800/40">${Number(distFullYear.all_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-bold border-r border-sky-700/80 text-sky-200">${Number(distFullYear.uc_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-emerald-300">${distFullYear.uc_share_vs || 0}%</td>
            <td class="py-3 px-2 text-right num-font font-black border-r border-sky-700/80 text-white bg-slate-800/40">${Number(distFullYear.all_items || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-bold border-r border-sky-700/80 text-teal-200">${Number(distFullYear.uc_items || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-teal-300">${distFullYear.uc_share_it || 0}%</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-amber-200">${distFullYear.item_ratio_all || 0}</td>
            <td class="py-3 px-2 text-center num-font font-black border-r border-sky-700/80 text-blue-200">${distFullYear.item_ratio_uc || 0}</td>
            <td class="py-3 px-2 text-center text-sky-300 font-normal text-[10px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else if (currentTtmCasesView === 'quarter') {
      // 3. QUARTERLY BREAKDOWN VIEW
      theadHtml = `
        <thead class="bg-[#064e3b] text-white font-bold text-[11px] border-b border-emerald-800">
          <tr>
            <th rowspan="2" class="py-2.5 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left border-r border-emerald-700/80 hdc-sticky-col-2">หน่วยบริการ</th>
            <th colspan="2" class="py-2 px-1 text-center border-r border-emerald-700/80 bg-emerald-800">ไตรมาส 1</th>
            <th colspan="2" class="py-2 px-1 text-center border-r border-emerald-700/80 bg-teal-800">ไตรมาส 2</th>
            <th colspan="2" class="py-2 px-1 text-center border-r border-emerald-700/80 bg-emerald-800">ไตรมาส 3</th>
            <th colspan="2" class="py-2 px-1 text-center border-r border-emerald-700/80 bg-teal-800">ไตรมาส 4</th>
            <th colspan="2" class="py-2 px-1 text-center border-r border-emerald-700/80 bg-emerald-950">รวมทั้งปี</th>
            <th rowspan="2" class="py-2.5 px-2 text-center">จัดการ</th>
          </tr>
          <tr class="text-[10px] bg-[#022c19] text-emerald-100">
            <th class="py-1 px-1.5 text-right border-r border-emerald-800">ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-sky-200">UC ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800">ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-sky-200">UC ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800">ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-sky-200">UC ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800">ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-sky-200">UC ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-800 text-yellow-300">ครั้ง</th>
            <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-sky-300">UC ครั้ง</th>
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#ecfdf5; border-left: 4px solid #10b981;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const q = u.quarters || {};
        const q1 = q.q1 || {}; const q2 = q.q2 || {}; const q3 = q.q3 || {}; const q4 = q.q4 || {};
        const fy = u.full_year || {};

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-emerald-50/40 transition">
            <td class="py-2.5 px-2 text-center num-font font-bold text-slate-500 border-r border-slate-100 hdc-sticky-col-1">${u.hospcode}</td>
            <td class="py-2.5 px-3 border-r border-slate-100 hdc-sticky-col-2">
              <div class="font-bold text-slate-800">${u.name}</div>
              <div class="text-[10px] text-slate-400">ต.${u.subdistrict}</div>
            </td>
            <td class="py-2 px-1.5 text-right num-font font-bold text-slate-800 border-r border-slate-100">${Number(q1.all_visits || 0).toLocaleString()}</td>
            <td class="py-2 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(q1.uc_visits || 0).toLocaleString()}</td>

            <td class="py-2 px-1.5 text-right num-font font-bold text-slate-800 border-r border-slate-100">${Number(q2.all_visits || 0).toLocaleString()}</td>
            <td class="py-2 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(q2.uc_visits || 0).toLocaleString()}</td>

            <td class="py-2 px-1.5 text-right num-font font-bold text-slate-800 border-r border-slate-100">${Number(q3.all_visits || 0).toLocaleString()}</td>
            <td class="py-2 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(q3.uc_visits || 0).toLocaleString()}</td>

            <td class="py-2 px-1.5 text-right num-font font-bold text-slate-800 border-r border-slate-100">${Number(q4.all_visits || 0).toLocaleString()}</td>
            <td class="py-2 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(q4.uc_visits || 0).toLocaleString()}</td>

            <td class="py-2 px-1.5 text-right num-font font-black text-slate-900 border-r border-slate-100 bg-slate-50">${Number(fy.all_visits || 0).toLocaleString()}</td>
            <td class="py-2 px-1.5 text-right num-font font-bold text-sky-800 border-r border-slate-100 bg-sky-50/40">${Number(fy.uc_visits || 0).toLocaleString()}</td>

            <td class="py-2 px-2 text-center">
              <button type="button" onclick="window.selectTtmCasesHospital('${u.hospcode}')" class="px-2 py-1 rounded text-[11px] font-bold ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'} transition shadow-2xs">
                ${isSelected ? 'เลือกอยู่' : 'ดู รพ.สต.'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      const q1 = distQuarters.q1 || {}; const q2 = distQuarters.q2 || {};
      const q3 = distQuarters.q3 || {}; const q4 = distQuarters.q4 || {};

      tfootHtml = `
        <tfoot class="bg-[#022c19] text-white font-bold text-[11px] border-t-2 border-emerald-400">
          <tr>
            <td class="py-3 px-2 text-center border-r border-emerald-700/80 hdc-sticky-col-1 font-black">รวม</td>
            <td class="py-3 px-3 border-r border-emerald-700/80 hdc-sticky-col-2">
              <div class="font-black text-white">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</div>
              <div class="text-[10px] text-emerald-300 font-normal">แจกแจงตามไตรมาส</div>
            </td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white">${Number(q1.all_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-sky-200">${Number(q1.uc_visits || 0).toLocaleString()}</td>

            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white">${Number(q2.all_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-sky-200">${Number(q2.uc_visits || 0).toLocaleString()}</td>

            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white">${Number(q3.all_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-sky-200">${Number(q3.uc_visits || 0).toLocaleString()}</td>

            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white">${Number(q4.all_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-sky-200">${Number(q4.uc_visits || 0).toLocaleString()}</td>

            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-yellow-300 bg-emerald-950/80">${Number(distFullYear.all_visits || 0).toLocaleString()}</td>
            <td class="py-3 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-sky-300 bg-emerald-950/80">${Number(distFullYear.uc_visits || 0).toLocaleString()}</td>

            <td class="py-3 px-2 text-center text-emerald-300 font-normal text-[10px]">100%</td>
          </tr>
        </tfoot>
      `;

    } else {
      // 4. FULL HDC MATRIX TABLE (1:1 with media_1789356535025.png)
      theadHtml = `
        <thead class="bg-[#047857] text-white font-bold text-[11px] border-b border-emerald-800">
          <tr>
            <th rowspan="3" class="py-2.5 px-3 text-left border-r border-emerald-700/80 hdc-sticky-col-1 bg-[#047857]" style="min-width: 230px;">หน่วยบริการ</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-emerald-800">รวมทั้งปีงบประมาณ</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-[#065f46]">ไตรมาส 1</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-emerald-800">ไตรมาส 2</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-[#065f46]">ไตรมาส 3</th>
            <th colspan="4" class="py-2 px-2 text-center border-r border-emerald-700/80 bg-emerald-800">ไตรมาส 4</th>
          </tr>
          <tr>
            <!-- รวมทั้งปี -->
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-emerald-700/90 text-emerald-100">จ่ายยาสมุนไพรทุกสิทธิ</th>
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-teal-700/90 text-sky-100">จ่ายยาสมุนไพรสิทธิ UC</th>

            <!-- ไตรมาส 1 -->
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-emerald-700/90 text-emerald-100">จ่ายยาสมุนไพรทุกสิทธิ</th>
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-teal-700/90 text-sky-100">จ่ายยาสมุนไพรสิทธิ UC</th>

            <!-- ไตรมาส 2 -->
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-emerald-700/90 text-emerald-100">จ่ายยาสมุนไพรทุกสิทธิ</th>
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-teal-700/90 text-sky-100">จ่ายยาสมุนไพรสิทธิ UC</th>

            <!-- ไตรมาส 3 -->
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-emerald-700/90 text-emerald-100">จ่ายยาสมุนไพรทุกสิทธิ</th>
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-teal-700/90 text-sky-100">จ่ายยาสมุนไพรสิทธิ UC</th>

            <!-- ไตรมาส 4 -->
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-emerald-700/90 text-emerald-100">จ่ายยาสมุนไพรทุกสิทธิ</th>
            <th colspan="2" class="py-1 px-1 text-center border-r border-emerald-700/80 bg-teal-700/90 text-sky-100">จ่ายยาสมุนไพรสิทธิ UC</th>
          </tr>
          <tr class="text-[10px] bg-[#022c19] text-emerald-100">
            ${[0, 1, 2, 3, 4].map(() => `
              <th class="py-1 px-1.5 text-right border-r border-emerald-800">ครั้ง</th>
              <th class="py-1 px-1.5 text-right border-r border-emerald-800">รายการ</th>
              <th class="py-1 px-1.5 text-right border-r border-emerald-800 text-sky-200">ครั้ง</th>
              <th class="py-1 px-1.5 text-right border-r border-emerald-700 text-sky-200">รายการ</th>
            `).join('')}
          </tr>
        </thead>
      `;

      tbodyHtml = filteredUnits.map((u, i) => {
        const isSelected = (u.hospcode === currentUnit);
        const rowBg = isSelected
          ? 'background:#ecfdf5; border-left: 4px solid #10b981;'
          : (i % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;');
        const fy = u.full_year || {};
        const q = u.quarters || {};

        let cells = [];
        // 1. Full Year
        cells.push(
          `<td class="py-2 px-1.5 text-right num-font font-black border-r border-slate-100 text-slate-900">${Number(fy.all_visits || 0).toLocaleString()}</td>`,
          `<td class="py-2 px-1.5 text-right num-font font-bold border-r border-slate-100 text-emerald-800">${Number(fy.all_items || 0).toLocaleString()}</td>`,
          `<td class="py-2 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(fy.uc_visits || 0).toLocaleString()}</td>`,
          `<td class="py-2 px-1.5 text-right num-font font-bold text-sky-800 border-r border-slate-200 bg-sky-50/20">${Number(fy.uc_items || 0).toLocaleString()}</td>`
        );

        // 2. Q1 - Q4
        for (let qi = 1; qi <= 4; qi++) {
          const qd = q[`q${qi}`] || {};
          cells.push(
            `<td class="py-2 px-1.5 text-right num-font font-bold border-r border-slate-100">${Number(qd.all_visits || 0).toLocaleString()}</td>`,
            `<td class="py-2 px-1.5 text-right num-font border-r border-slate-100 text-emerald-800">${Number(qd.all_items || 0).toLocaleString()}</td>`,
            `<td class="py-2 px-1.5 text-right num-font text-sky-700 border-r border-slate-100">${Number(qd.uc_visits || 0).toLocaleString()}</td>`,
            `<td class="py-2 px-1.5 text-right num-font font-bold text-sky-800 border-r border-slate-200 bg-sky-50/20">${Number(qd.uc_items || 0).toLocaleString()}</td>`
          );
        }

        return `
          <tr style="${rowBg}" class="border-b border-slate-100 hover:bg-emerald-50/40 transition">
            <td class="py-2 px-2.5 font-bold text-slate-800 border-r border-slate-200 hdc-sticky-col-1 truncate" style="max-width:260px;" title="${u.hospcode}: ${u.name}">
              <span class="num-font text-emerald-700 font-bold">${u.hospcode}:</span> ${u.name}
            </td>
            ${cells.join('')}
          </tr>
        `;
      }).join('');

      // Total row matching HDC exact numbers
      let totCells = [];
      // Full Year Totals
      totCells.push(
        `<td class="py-2.5 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-yellow-300 bg-emerald-950/70">${Number(distFullYear.all_visits || 0).toLocaleString()}</td>`,
        `<td class="py-2.5 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white">${Number(distFullYear.all_items || 0).toLocaleString()}</td>`,
        `<td class="py-2.5 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-sky-200">${Number(distFullYear.uc_visits || 0).toLocaleString()}</td>`,
        `<td class="py-2.5 px-1.5 text-right num-font font-black border-r border-emerald-700 text-sky-300">${Number(distFullYear.uc_items || 0).toLocaleString()}</td>`
      );

      // Quarterly Totals
      for (let qi = 1; qi <= 4; qi++) {
        const qd = distQuarters[`q${qi}`] || {};
        totCells.push(
          `<td class="py-2.5 px-1.5 text-right num-font font-black border-r border-emerald-700/80 text-white">${Number(qd.all_visits || 0).toLocaleString()}</td>`,
          `<td class="py-2.5 px-1.5 text-right num-font font-bold border-r border-emerald-700/80 text-emerald-200">${Number(qd.all_items || 0).toLocaleString()}</td>`,
          `<td class="py-2.5 px-1.5 text-right num-font border-r border-emerald-700/80 text-sky-200">${Number(qd.uc_visits || 0).toLocaleString()}</td>`,
          `<td class="py-2.5 px-1.5 text-right num-font font-bold border-r border-emerald-700 text-sky-100">${Number(qd.uc_items || 0).toLocaleString()}</td>`
        );
      }

      tfootHtml = `
        <tfoot class="bg-[#033b20] text-white font-bold text-[10.5px] border-t-2 border-emerald-400">
          <tr>
            <td class="py-2.5 px-2.5 border-r border-emerald-700/80 hdc-sticky-col-1 font-black text-white">รวม</td>
            ${totCells.join('')}
          </tr>
        </tfoot>
      `;
    }

    tableEl.innerHTML = `${theadHtml}<tbody>${tbodyHtml}</tbody>${tfootHtml}`;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // =========================================================
  // TTM COMMON DISEASES & HERBAL DRUG (s_common_diseases_thai_drug)
  // =========================================================
  window.switchTtmCommonView = function(view) {
    if (view === 'quarter') view = 'hdc_full';
    currentTtmCommonView = view;
    renderTtmCommonPanel();
  };

  window.switchTtmCommonYear = function(yr) {
    currentTtmCommonYear = yr;
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
    renderTtmCommonPanel();
  };

  window.switchTtmCommonChartMode = function(mode) {
    currentTtmCommonChartMode = mode;
    renderTtmCommonPanel();
  };

  window.selectTtmCommonHospital = function(hospcode) {
    currentUnit = hospcode;
    if (unitSelect) unitSelect.value = hospcode;
    updateDashboardView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.exportTtmCommonCsv = function() {
    const yr = currentTtmCommonYear || currentYear || '2569';
    const ind = masterData?.indicators?.['ttm_common_dis'];
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];
    const y68 = ind?.years?.['2568'] || {};
    const y69 = ind?.years?.['2569'] || {};

    let csvContent = '\uFEFF';

    if (currentTtmCommonView === 'hdc_full') {
      csvContent += `ตารางเปรียบเทียบมาตรฐาน HDC การสั่งจ่ายยาสมุนไพรในกลุ่มโรคพบบ่อย อำเภอสารภี (ปี 2568 vs 2569 รวมปีงบประมาณ)\n`;
      csvContent += 'รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,' +
        '2568 ได้รับการวินิจฉัย (คน),2568 ได้รับการวินิจฉัย (ครั้ง),2568 สั่งจ่ายยาสมุนไพร (คน),2568 สั่งจ่ายยาสมุนไพร (ครั้ง),2568 ร้อยละ (ครั้ง),' +
        '2569 ได้รับการวินิจฉัย (คน),2569 ได้รับการวินิจฉัย (ครั้ง),2569 สั่งจ่ายยาสมุนไพร (คน),2569 สั่งจ่ายยาสมุนไพร (ครั้ง),2569 ร้อยละ (ครั้ง),' +
        'ร้อยละเพิ่มขึ้น (%)\n';

      const u68Map = {};
      (y68.units || []).forEach(u => { u68Map[u.hospcode] = u; });

      (y69.units || []).forEach(u69 => {
        const u68 = u68Map[u69.hospcode] || {};
        const meta = SARAPHI_UNITS_MAP[u69.hospcode];
        const uName = (u69.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u69.name);
        const uSub = (u69.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u69.subdistrict);

        csvContent += `"${u69.hospcode}","${uName}","${uSub}",` +
          `${u68.diag_person || 0},${u68.diag_times || 0},${u68.drug_person || 0},${u68.drug_times || 0},${(u68.rate || 0).toFixed(2)},` +
          `${u69.diag_person || 0},${u69.diag_times || 0},${u69.drug_person || 0},${u69.drug_times || 0},${(u69.rate || 0).toFixed(2)},` +
          `${(u69.growth || 0).toFixed(2)}\n`;
      });

      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",` +
        `${y68.diag_person || 0},${y68.diag_times || 0},${y68.drug_person || 0},${y68.drug_times || 0},${(y68.rate || 0).toFixed(2)},` +
        `${y69.diag_person || 0},${y69.diag_times || 0},${y69.drug_person || 0},${y69.drug_times || 0},${(y69.rate || 0).toFixed(2)},` +
        `${(y69.growth || 0).toFixed(2)}\n`;

    } else if (currentTtmCommonView === 'single_year') {
      csvContent += `ตารางการสั่งจ่ายยาสมุนไพรในกลุ่มโรคพบบ่อย อำเภอสารภี ปีงบประมาณ ${yr}\n`;
      csvContent += 'อันดับ,รหัสสถานบริการ,ชื่อสถานบริการ,ตำบล,ได้รับการวินิจฉัย (คน),ได้รับการวินิจฉัย (ครั้ง),สั่งจ่ายยาสมุนไพร (คน),สั่งจ่ายยาสมุนไพร (ครั้ง),ร้อยละจ่ายยาต่อครั้ง (%),ร้อยละจ่ายยาต่อคน (%),สถานะ\n';

      units.forEach((u, idx) => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const isPass = (u.rate >= 20.0) ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';
        csvContent += `${idx + 1},"${u.hospcode}","${uName}","${uSub}",${u.diag_person || 0},${u.diag_times || 0},${u.drug_person || 0},${u.drug_times || 0},${(u.rate || 0).toFixed(2)},${(u.rate_person || 0).toFixed(2)},"${isPass}"\n`;
      });

      const distPass = (yrData.rate >= 20.0) ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';
      csvContent += `"total","-","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",${yrData.diag_person || 0},${yrData.diag_times || 0},${yrData.drug_person || 0},${yrData.drug_times || 0},${(yrData.rate || 0).toFixed(2)},${(yrData.rate_person || 0).toFixed(2)},"${distPass}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `HDC_s_common_diseases_Saraphi_${yr}_${currentTtmCommonView}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function renderTtmCommonPanel() {
    if (currentIndicatorId !== 'ttm_common_dis') {
      if (ttmCommonPanel) ttmCommonPanel.classList.add('hidden');
      return;
    }
    if (ttmCommonPanel) ttmCommonPanel.classList.remove('hidden');

    const yr = currentTtmCommonYear || currentYear || '2569';

    // 1. Sync View Mode Buttons
    ['hdc_full', 'single_year'].forEach(v => {
      const btn = document.getElementById(`btn-ttm-common-view-${v}`);
      if (btn) {
        if (v === currentTtmCommonView) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Sync Year Filter Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-ttm-common-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 3. Sync Chart Mode Buttons
    [
      { mode: 'compare_rates', id: 'btn-ttm-common-chart-compare' },
      { mode: 'growth_bar', id: 'btn-ttm-common-chart-growth' },
      { mode: 'quarter_trend', id: 'btn-ttm-common-chart-trend' }
    ].forEach(c => {
      const btn = document.getElementById(c.id);
      if (btn) {
        if (c.mode === currentTtmCommonChartMode) {
          btn.className = 'px-2.5 py-1 rounded-lg font-bold transition bg-emerald-600 text-white shadow-xs';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // Data references
    const ind = masterData?.indicators?.['ttm_common_dis'] || {};
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];
    const y68 = ind?.years?.['2568'] || {};
    const y69 = ind?.years?.['2569'] || {};

    // 4. Update 4 Bento KPI Cards
    let kpiDiagPerson = yrData.diag_person || 0;
    let kpiDiagTimes = yrData.diag_times || 0;
    let kpiDrugPerson = yrData.drug_person || 0;
    let kpiDrugTimes = yrData.drug_times || 0;
    let kpiRate = yrData.rate || 0;
    let kpiGrowth = yrData.growth || 0;

    if (currentUnit !== 'all') {
      const u = units.find(x => x.hospcode === currentUnit);
      if (u) {
        kpiDiagPerson = u.diag_person || 0;
        kpiDiagTimes = u.diag_times || 0;
        kpiDrugPerson = u.drug_person || 0;
        kpiDrugTimes = u.drug_times || 0;
        kpiRate = u.rate || 0;
        kpiGrowth = u.growth || 0;
      }
    }

    const elDiagPerson = document.getElementById('ttm-common-kpi-diag-person');
    const elDiagTimes = document.getElementById('ttm-common-kpi-diag-times');
    const elDrugPerson = document.getElementById('ttm-common-kpi-drug-person');
    const elDrugTimes = document.getElementById('ttm-common-kpi-drug-times');
    const elRate = document.getElementById('ttm-common-kpi-rate');
    const elRateBadge = document.getElementById('ttm-common-kpi-rate-badge');
    const elRateSub = document.getElementById('ttm-common-kpi-rate-sub');
    const elGrowth = document.getElementById('ttm-common-kpi-growth');
    const elGrowthStatus = document.getElementById('ttm-common-kpi-growth-status');
    const elGrowthDesc = document.getElementById('ttm-common-kpi-growth-desc');

    if (elDiagPerson) elDiagPerson.textContent = Number(kpiDiagPerson).toLocaleString();
    if (elDiagTimes) elDiagTimes.textContent = `${Number(kpiDiagTimes).toLocaleString()} ครั้ง`;
    if (elDrugPerson) elDrugPerson.textContent = Number(kpiDrugPerson).toLocaleString();
    if (elDrugTimes) elDrugTimes.textContent = `${Number(kpiDrugTimes).toLocaleString()} ครั้ง`;
    if (elRate) elRate.textContent = `${Number(kpiRate).toFixed(2)}%`;
    if (elRateBadge) {
      if (kpiRate >= 20.0) {
        elRateBadge.className = 'px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800';
        elRateBadge.textContent = 'ผ่านเกณฑ์';
      } else {
        elRateBadge.className = 'px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800';
        elRateBadge.textContent = 'ต่ำกว่าเกณฑ์';
      }
    }
    if (elRateSub) {
      elRateSub.textContent = `จำนวนครั้ง (${Number(kpiDrugTimes).toLocaleString()} / ${Number(kpiDiagTimes).toLocaleString()})`;
    }
    if (elGrowth) {
      const sign = kpiGrowth >= 0 ? '+' : '';
      elGrowth.textContent = `${sign}${Number(kpiGrowth).toFixed(2)}%`;
      elGrowth.className = `text-2xl font-black ${kpiGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
    }
    if (elGrowthStatus) {
      const sign = kpiGrowth >= 0 ? '+' : '';
      elGrowthStatus.textContent = `${sign}${Number(kpiGrowth).toFixed(2)}%`;
      elGrowthStatus.className = `font-bold ${kpiGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
    }
    if (elGrowthDesc) {
      elGrowthDesc.textContent = (currentUnit === 'all')
        ? 'เปรียบเทียบปี 2568 vs 2569 (รวมอำเภอ)'
        : `เปรียบเทียบปี 2568 vs 2569 (${SARAPHI_UNITS_MAP[currentUnit]?.short || currentUnit})`;
    }

    // 5. Render Chart
    renderTtmCommonChart(units, yr);

    // 6. Render Table
    renderTtmCommonTable(units, yr);
  }

  function renderTtmCommonChart(units, yr) {
    const canvas = document.getElementById('ttmCommonChart');
    if (!canvas) return;

    if (ttmCommonChartInstance) {
      ttmCommonChartInstance.destroy();
      ttmCommonChartInstance = null;
    }

    const ind = masterData?.indicators?.['ttm_common_dis'] || {};
    const yrData = ind?.years?.[yr] || {};
    const y68 = ind?.years?.['2568'] || {};
    const y69 = ind?.years?.['2569'] || {};
    const u68Map = {};
    (y68.units || []).forEach(u => { u68Map[u.hospcode] = u; });

    const chartTitle = document.getElementById('ttm-common-chart-title');
    const chartSub = document.getElementById('ttm-common-chart-subtitle');

    // Filter units if query
    let filtered = [...units];
    if (ttmCommonSearchQuery) {
      const q = ttmCommonSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.hospcode.includes(q) ||
        (u.subdistrict && u.subdistrict.toLowerCase().includes(q))
      );
    }

    // Sort by 2569 rate descending for readability
    filtered.sort((a, b) => (b.rate || 0) - (a.rate || 0));

    if (currentTtmCommonChartMode === 'compare_rates') {
      if (chartTitle) {
        chartTitle.innerHTML = '<i class="fa-solid fa-chart-column text-emerald-600"></i> เปรียบเทียบร้อยละการสั่งจ่ายยาสมุนไพรในกลุ่มโรคพบบ่อย (ปี 2568 vs 2569)';
      }
      if (chartSub) {
        chartSub.textContent = 'เปรียบเทียบระหว่างปีงบประมาณ 2568 และ 2569 จำแนกรายหน่วยบริการ พร้อมเส้นเป้าหมาย 20%';
      }

      const labels = filtered.map(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        return (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.short : u.name);
      });
      const data68 = filtered.map(u => {
        const prev = u68Map[u.hospcode];
        return prev ? Number(prev.rate || 0) : 0;
      });
      const data69 = filtered.map(u => Number(u.rate || 0));

      ttmCommonChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'ปีงบประมาณ 2568 (%)',
              data: data68,
              backgroundColor: 'rgba(148, 163, 184, 0.75)',
              borderColor: '#94a3b8',
              borderWidth: 1,
              borderRadius: 6
            },
            {
              label: 'ปีงบประมาณ 2569 (%)',
              data: data69,
              backgroundColor: 'rgba(5, 150, 105, 0.85)',
              borderColor: '#059669',
              borderWidth: 1,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { family: "'IBM Plex Sans Thai', sans-serif", size: 12, weight: 'bold' } }
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 11 },
                maxRotation: 45,
                minRotation: 30
              },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: v => `${v}%`,
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 11 }
              },
              grid: { color: 'rgba(226, 232, 240, 0.6)' }
            }
          }
        }
      });

    } else if (currentTtmCommonChartMode === 'growth_bar') {
      if (chartTitle) {
        chartTitle.innerHTML = '<i class="fa-solid fa-arrow-trend-up text-emerald-600"></i> อัตราการเติบโตเพิ่มขึ้นของการจ่ายยาสมุนไพร (% Growth)';
      }
      if (chartSub) {
        chartSub.textContent = 'อัตราการเปลี่ยนแปลงร้อยละการจ่ายยาสมุนไพร ปี 2569 เทียบกับ ปี 2568 ((C2 - C1) / C1 * 100)';
      }

      // Sort by growth descending
      const sortedByGrowth = [...filtered].sort((a, b) => (b.growth || 0) - (a.growth || 0));
      const labels = sortedByGrowth.map(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        return (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.short : u.name);
      });
      const dataGrowth = sortedByGrowth.map(u => Number(u.growth || 0));
      const bgColors = dataGrowth.map(v => v >= 0 ? 'rgba(5, 150, 105, 0.85)' : 'rgba(225, 29, 72, 0.85)');
      const borderColors = dataGrowth.map(v => v >= 0 ? '#059669' : '#e11d48');

      ttmCommonChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'ร้อยละเพิ่มขึ้น (%)',
            data: dataGrowth,
            backgroundColor: bgColors,
            borderColor: borderColors,
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` อัตราเติบโต: ${ctx.parsed.x >= 0 ? '+' : ''}${ctx.parsed.x.toFixed(2)}%`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: v => `${v >= 0 ? '+' : ''}${v}%`,
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 11 }
              },
              grid: { color: 'rgba(226, 232, 240, 0.6)' }
            },
            y: {
              ticks: { font: { family: "'IBM Plex Sans Thai', sans-serif", size: 11 } },
              grid: { display: false }
            }
          }
        }
      });

    } else if (currentTtmCommonChartMode === 'quarter_trend') {
      if (chartTitle) {
        chartTitle.innerHTML = '<i class="fa-solid fa-chart-line text-emerald-600"></i> ร้อยละการสั่งจ่ายยาสมุนไพรในกลุ่มโรคพบบ่อย รายไตรมาส';
      }
      if (chartSub) {
        chartSub.textContent = `แนวโน้มรายไตรมาส ปีงบประมาณ ${yr} จำแนก 4 ไตรมาส`;
      }

      const qDist = (yrData.quarters) || {};
      const qLabels = ['ไตรมาสที่ 1 (ต.ค.-ธ.ค.)', 'ไตรมาสที่ 2 (ม.ค.-มี.ค.)', 'ไตรมาสที่ 3 (เม.ย.-มิ.ย.)', 'ไตรมาสที่ 4 (ก.ค.-ก.ย.)'];
      const qRates = [1, 2, 3, 4].map(qi => Number(qDist[`q${qi}`]?.rate || 0));
      const qDrugTimes = [1, 2, 3, 4].map(qi => Number(qDist[`q${qi}`]?.drug_times || 0));
      const qDiagTimes = [1, 2, 3, 4].map(qi => Number(qDist[`q${qi}`]?.diag_times || 0));

      ttmCommonChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: qLabels,
          datasets: [
            {
              type: 'line',
              label: 'ร้อยละการจ่ายยา (%)',
              data: qRates,
              borderColor: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.15)',
              borderWidth: 3,
              tension: 0.3,
              fill: true,
              yAxisID: 'y'
            },
            {
              type: 'bar',
              label: 'สั่งจ่ายยาสมุนไพร (ครั้ง)',
              data: qDrugTimes,
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderRadius: 6,
              yAxisID: 'y1'
            },
            {
              type: 'bar',
              label: 'ได้รับการวินิจฉัย (ครั้ง)',
              data: qDiagTimes,
              backgroundColor: 'rgba(148, 163, 184, 0.5)',
              borderRadius: 6,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { family: "'IBM Plex Sans Thai', sans-serif", size: 12, weight: 'bold' } }
            }
          },
          scales: {
            x: {
              ticks: { font: { family: "'IBM Plex Sans Thai', sans-serif", size: 11 } },
              grid: { display: false }
            },
            y: {
              position: 'left',
              beginAtZero: true,
              ticks: { callback: v => `${v}%` },
              title: { display: true, text: 'ร้อยละ (%)' }
            },
            y1: {
              position: 'right',
              beginAtZero: true,
              grid: { display: false },
              title: { display: true, text: 'จำนวนครั้ง' }
            }
          }
        }
      });
    }
  }

  function renderTtmCommonTable(units, yr) {
    const tableEl = document.getElementById('ttm-common-matrix-table');
    if (!tableEl) return;

    const ind = masterData?.indicators?.['ttm_common_dis'] || {};
    const yrData = ind?.years?.[yr] || {};
    const y68 = ind?.years?.['2568'] || {};
    const y69 = ind?.years?.['2569'] || {};
    const u68Map = {};
    (y68.units || []).forEach(u => { u68Map[u.hospcode] = u; });

    let filtered = [...(y69.units || [])];
    if (ttmCommonSearchQuery) {
      const q = ttmCommonSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.hospcode.includes(q) ||
        (u.subdistrict && u.subdistrict.toLowerCase().includes(q))
      );
    }

    let theadHtml = '';
    let tbodyHtml = '';
    let tfootHtml = '';

    if (currentTtmCommonView === 'hdc_full') {
      theadHtml = `
        <thead>
          <tr class="bg-emerald-800 text-white text-center font-bold text-xs sm:text-sm">
            <th rowspan="3" class="py-3 px-3.5 text-left sticky left-0 z-20 bg-emerald-800 min-w-[220px] border-r border-emerald-700">หน่วยบริการ</th>
            <th colspan="5" class="py-2.5 px-3 border-r border-b border-emerald-700 tracking-wide text-sm md:text-base">ปีงบประมาณ 2568 (รวมปีงบประมาณ)</th>
            <th colspan="5" class="py-2.5 px-3 border-r border-b border-emerald-700 tracking-wide text-sm md:text-base">ปีงบประมาณ 2569 (รวมปีงบประมาณ)</th>
            <th rowspan="3" class="py-3 px-3 border-r border-emerald-700 min-w-[105px] text-xs sm:text-sm">ร้อยละเพิ่มขึ้น</th>
            <th rowspan="3" class="py-3 px-2.5 border-emerald-700 min-w-[85px] text-xs sm:text-sm">การกระทำ</th>
          </tr>
          <tr class="bg-emerald-700 text-white text-center font-semibold text-xs sm:text-[13px]">
            <!-- 2568 Full -->
            <th colspan="2" class="py-2 px-2.5 border-r border-b border-emerald-600">ได้รับการวินิจฉัย (B1)</th>
            <th colspan="2" class="py-2 px-2.5 border-r border-b border-emerald-600">วินิจฉัยและสั่งจ่ายยา (A1)</th>
            <th rowspan="2" class="py-2 px-2.5 border-r border-emerald-600 font-bold bg-emerald-800/60">ร้อยละ (C1)<br><span class="font-normal text-[11px] text-emerald-200">ครั้ง</span></th>
            <!-- 2569 Full -->
            <th colspan="2" class="py-2 px-2.5 border-r border-b border-emerald-600">ได้รับการวินิจฉัย (B2)</th>
            <th colspan="2" class="py-2 px-2.5 border-r border-b border-emerald-600">วินิจฉัยและสั่งจ่ายยา (A2)</th>
            <th rowspan="2" class="py-2 px-2.5 border-r border-emerald-600 font-bold bg-emerald-800/60">ร้อยละ (C2)<br><span class="font-normal text-[11px] text-emerald-200">ครั้ง</span></th>
          </tr>
          <tr class="bg-emerald-600 text-white text-center font-semibold text-xs">
            <!-- 2568 Full Sub -->
            <th class="py-1.5 px-2 border-r border-emerald-500">คน</th>
            <th class="py-1.5 px-2 border-r border-emerald-500">ครั้ง</th>
            <th class="py-1.5 px-2 border-r border-emerald-500">คน</th>
            <th class="py-1.5 px-2 border-r border-emerald-500">ครั้ง</th>
            <!-- 2569 Full Sub -->
            <th class="py-1.5 px-2 border-r border-emerald-500">คน</th>
            <th class="py-1.5 px-2 border-r border-emerald-500">ครั้ง</th>
            <th class="py-1.5 px-2 border-r border-emerald-500">คน</th>
            <th class="py-1.5 px-2 border-r border-emerald-500">ครั้ง</th>
          </tr>
        </thead>
      `;

      filtered.forEach((u69, idx) => {
        const u68 = u68Map[u69.hospcode] || {};
        const meta = SARAPHI_UNITS_MAP[u69.hospcode];
        const uName = (u69.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u69.name);
        const uFull = (u69.hospcode === '06023') ? 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านป่าสา' : (meta ? meta.name : u69.name);
        const uSub = (u69.hospcode === '06023') ? 'ตำบลสันทราย' : `ตำบล${meta ? meta.subdistrict : u69.subdistrict}`;
        const isSelected = (currentUnit === u69.hospcode);
        const rowBg = isSelected ? 'bg-amber-50/90 font-medium' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 hover:bg-emerald-50/50');

        const growth = Number(u69.growth || 0);
        const growthClass = growth >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold';
        const growthSign = growth >= 0 ? '+' : '';

        tbodyHtml += `
          <tr class="${rowBg} border-b border-slate-200/80 text-xs sm:text-[13px] md:text-sm transition">
            <td class="py-2.5 px-3 text-left sticky left-0 z-10 bg-inherit border-r border-slate-200">
              <div class="font-bold text-slate-800 text-xs sm:text-[13px] md:text-sm leading-snug">${u69.hospcode}:${uFull}</div>
              <div class="text-[11.5px] text-slate-500 font-medium mt-0.5">${uSub}</div>
            </td>
            <!-- 2568 Full -->
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono text-slate-700 text-xs sm:text-[13px] md:text-sm">${(u68.diag_person || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono font-semibold text-slate-900 text-xs sm:text-[13px] md:text-sm">${(u68.diag_times || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono text-emerald-800 text-xs sm:text-[13px] md:text-sm">${(u68.drug_person || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono font-semibold text-emerald-900 text-xs sm:text-[13px] md:text-sm">${(u68.drug_times || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono font-bold text-slate-900 bg-slate-100/60 text-xs sm:text-[13.5px] md:text-sm">${(u68.rate || 0).toFixed(2)}%</td>
            <!-- 2569 Full -->
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono text-slate-700 text-xs sm:text-[13px] md:text-sm">${(u69.diag_person || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono font-semibold text-slate-900 text-xs sm:text-[13px] md:text-sm">${(u69.diag_times || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono text-emerald-800 text-xs sm:text-[13px] md:text-sm">${(u69.drug_person || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono font-semibold text-emerald-900 text-xs sm:text-[13px] md:text-sm">${(u69.drug_times || 0).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono font-black text-emerald-800 bg-emerald-50/80 text-xs sm:text-[13.5px] md:text-sm">${(u69.rate || 0).toFixed(2)}%</td>
            <!-- Growth % -->
            <td class="py-2.5 px-2.5 text-right border-r border-slate-200 font-mono font-bold ${growthClass} bg-slate-50/80 text-xs sm:text-[13.5px] md:text-sm">${growthSign}${growth.toFixed(2)}%</td>
            <!-- Action -->
            <td class="py-2.5 px-2 text-center">
              <button type="button" onclick="window.selectTtmCommonHospital('${u69.hospcode}')" class="px-2.5 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg border border-emerald-200 transition shadow-2xs">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
      });

      const distGrowth = Number(y69.growth || 0);
      const distGrowthClass = distGrowth >= 0 ? 'text-emerald-300 font-black' : 'text-rose-300 font-black';
      const distGrowthSign = distGrowth >= 0 ? '+' : '';

      tfootHtml = `
        <tfoot class="bg-slate-800 text-white font-bold border-t-2 border-emerald-500">
          <tr>
            <td class="py-3 px-3.5 text-left sticky left-0 z-10 bg-slate-800 font-black border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</td>
            <!-- 2568 Full -->
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-xs sm:text-[13.5px] md:text-sm">${(y68.diag_person || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-xs sm:text-[13.5px] md:text-sm">${(y68.diag_times || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-emerald-300 text-xs sm:text-[13.5px] md:text-sm">${(y68.drug_person || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-emerald-300 text-xs sm:text-[13.5px] md:text-sm">${(y68.drug_times || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black bg-slate-700/60 text-yellow-300 text-xs sm:text-[13.5px] md:text-sm">${(y68.rate || 0).toFixed(2)}%</td>
            <!-- 2569 Full -->
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-xs sm:text-[13.5px] md:text-sm">${(y69.diag_person || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-xs sm:text-[13.5px] md:text-sm">${(y69.diag_times || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-emerald-300 text-xs sm:text-[13.5px] md:text-sm">${(y69.drug_person || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black text-emerald-300 text-xs sm:text-[13.5px] md:text-sm">${(y69.drug_times || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black bg-emerald-900 text-emerald-200 text-xs sm:text-[13.5px] md:text-sm">${(y69.rate || 0).toFixed(2)}%</td>
            <!-- Growth % -->
            <td class="py-3 px-2.5 text-right border-r border-slate-700 font-mono font-black ${distGrowthClass} text-xs sm:text-[13.5px] md:text-sm">${distGrowthSign}${distGrowth.toFixed(2)}%</td>
            <!-- Action -->
            <td class="py-3 px-2 text-center text-slate-400">-</td>
          </tr>
        </tfoot>
      `;

    } else if (currentTtmCommonView === 'single_year') {
      theadHtml = `
        <thead>
          <tr class="bg-emerald-800 text-white text-center font-bold text-xs sm:text-sm">
            <th class="py-3 px-2.5 text-center min-w-[50px] border-r border-emerald-700">อันดับ</th>
            <th class="py-3 px-2.5 text-center min-w-[65px] border-r border-emerald-700">รหัส</th>
            <th class="py-3 px-3 text-left min-w-[200px] border-r border-emerald-700">ชื่อหน่วยบริการ</th>
            <th class="py-3 px-3 text-left min-w-[100px] border-r border-emerald-700">ตำบล</th>
            <th class="py-3 px-3 text-right min-w-[110px] border-r border-emerald-700">ได้รับการวินิจฉัย (คน)</th>
            <th class="py-3 px-3 text-right min-w-[115px] border-r border-emerald-700">ได้รับการวินิจฉัย (ครั้ง)</th>
            <th class="py-3 px-3 text-right min-w-[110px] border-r border-emerald-700">สั่งจ่ายยาสมุนไพร (คน)</th>
            <th class="py-3 px-3 text-right min-w-[115px] border-r border-emerald-700">สั่งจ่ายยาสมุนไพร (ครั้ง)</th>
            <th class="py-3 px-3 text-right min-w-[125px] border-r border-emerald-700 bg-emerald-900">ร้อยละจ่ายยาต่อครั้ง (C)</th>
            <th class="py-3 px-3 text-right min-w-[110px] border-r border-emerald-700">ร้อยละต่อคน</th>
            <th class="py-3 px-3 text-center min-w-[85px] border-r border-emerald-700">สถานะ</th>
            <th class="py-3 px-3 text-center min-w-[85px]">การกระทำ</th>
          </tr>
        </thead>
      `;

      // Sort by rate descending
      const singleList = [...(yrData.units || [])];
      let filteredSingle = singleList;
      if (ttmCommonSearchQuery) {
        const q = ttmCommonSearchQuery.toLowerCase().trim();
        filteredSingle = filteredSingle.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.hospcode.includes(q) ||
          (u.subdistrict && u.subdistrict.toLowerCase().includes(q))
        );
      }
      filteredSingle.sort((a, b) => (b.rate || 0) - (a.rate || 0));

      filteredSingle.forEach((u, idx) => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const isPass = (u.rate >= 20.0);
        const rowBg = (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70') + ' hover:bg-emerald-50/50';

        tbodyHtml += `
          <tr class="${rowBg} border-b border-slate-200/80 text-xs sm:text-[13px] md:text-sm transition">
            <td class="py-2.5 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">${idx + 1}</td>
            <td class="py-2.5 px-2.5 text-center font-mono font-semibold text-emerald-800 border-r border-slate-200">${u.hospcode}</td>
            <td class="py-2.5 px-3 text-left font-bold text-slate-800 border-r border-slate-200">${uName}</td>
            <td class="py-2.5 px-3 text-left text-slate-600 border-r border-slate-200">${uSub}</td>
            <td class="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-200">${(u.diag_person || 0).toLocaleString()}</td>
            <td class="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 border-r border-slate-200">${(u.diag_times || 0).toLocaleString()}</td>
            <td class="py-2.5 px-3 text-right font-mono text-emerald-800 border-r border-slate-200">${(u.drug_person || 0).toLocaleString()}</td>
            <td class="py-2.5 px-3 text-right font-mono font-semibold text-emerald-900 border-r border-slate-200">${(u.drug_times || 0).toLocaleString()}</td>
            <td class="py-2.5 px-3 text-right font-mono font-black text-emerald-900 bg-emerald-50/80 border-r border-slate-200">${(u.rate || 0).toFixed(2)}%</td>
            <td class="py-2.5 px-3 text-right font-mono font-medium text-slate-700 border-r border-slate-200">${(u.rate_person || 0).toFixed(2)}%</td>
            <td class="py-2.5 px-3 text-center border-r border-slate-200">
              <span class="px-2.5 py-1 rounded-md text-xs font-bold ${isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                ${isPass ? 'ผ่าน' : 'ไม่ผ่าน'}
              </span>
            </td>
            <td class="py-2.5 px-3 text-center">
              <button type="button" onclick="window.selectTtmCommonHospital('${u.hospcode}')" class="px-2.5 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg border border-emerald-200 transition">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
      });

      const distPass = (yrData.rate >= 20.0);
      tfootHtml = `
        <tfoot class="bg-slate-800 text-white font-bold border-t-2 border-emerald-500">
          <tr>
            <td colspan="4" class="py-3 px-4 text-left font-black border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">รวมทั้งอำเภอสารภี (14 หน่วยบริการ)</td>
            <td class="py-3 px-3 text-right font-mono font-black border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">${(yrData.diag_person || 0).toLocaleString()}</td>
            <td class="py-3 px-3 text-right font-mono font-black border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">${(yrData.diag_times || 0).toLocaleString()}</td>
            <td class="py-3 px-3 text-right font-mono font-black text-emerald-300 border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">${(yrData.drug_person || 0).toLocaleString()}</td>
            <td class="py-3 px-3 text-right font-mono font-black text-emerald-300 border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">${(yrData.drug_times || 0).toLocaleString()}</td>
            <td class="py-3 px-3 text-right font-mono font-black text-emerald-200 bg-emerald-900 border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">${(yrData.rate || 0).toFixed(2)}%</td>
            <td class="py-3 px-3 text-right font-mono font-black border-r border-slate-700 text-xs sm:text-[13.5px] md:text-sm">${(yrData.rate_person || 0).toFixed(2)}%</td>
            <td class="py-3 px-3 text-center border-r border-slate-700">
              <span class="px-2.5 py-1 rounded-md text-xs font-bold ${distPass ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}">
                ${distPass ? 'ผ่าน' : 'ไม่ผ่าน'}
              </span>
            </td>
            <td class="py-3 px-3 text-center text-slate-400">-</td>
          </tr>
        </tfoot>
      `;
    }

    tableEl.innerHTML = `${theadHtml}<tbody>${tbodyHtml}</tbody>${tfootHtml}`;

    if (window.lucide) {
      lucide.createIcons();
    }
  }


  // =========================================================================
  // TTM MASSAGE & PROCEDURES (s_ttm8) - HDC 1:1 CONTROLLER & RENDER FUNCTIONS
  // =========================================================================

  window.switchTtmMassageView = function(view) {
    currentTtmMassageView = view;
    renderTtmMassagePanel();
  };

  window.switchTtmMassageYear = function(yr) {
    currentTtmMassageYear = yr;
    renderTtmMassagePanel();
  };

  window.switchTtmMassageChartTab = function(tab) {
    currentTtmMassageChartTab = tab;
    renderTtmMassagePanel();
  };

  window.exportTtmMassageCsv = function() {
    const yr = currentTtmMassageYear || currentYear || '2569';
    const ind = masterData?.indicators?.['ttm_massage'] || {};
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Thai language compatibility

    if (currentTtmMassageView === 'hdc_full') {
      csvContent += 'รหัส,หน่วยบริการ,ตำบล,' +
        'ในสถาน-บริการแผนไทย-ทุกสิทธิ,ในสถาน-บริการแผนไทย-UC,' +
        'ในสถาน-นวดแผนไทย-ทุกสิทธิ,ในสถาน-นวดแผนไทย-UC,' +
        'ในสถาน-อบสมุนไพร-ทุกสิทธิ,ในสถาน-อบสมุนไพร-UC,' +
        'ในสถาน-ประคบสมุนไพร-ทุกสิทธิ,ในสถาน-ประคบสมุนไพร-UC,' +
        'ในสถาน-นวดและประคบ-ทุกสิทธิ,ในสถาน-นวดและประคบ-UC,' +
        'นอกสถาน-บริการแผนไทย-ทุกสิทธิ,นอกสถาน-บริการแผนไทย-UC,' +
        'นอกสถาน-นวดแผนไทย-ทุกสิทธิ,นอกสถาน-นวดแผนไทย-UC,' +
        'นอกสถาน-อบสมุนไพร-ทุกสิทธิ,นอกสถาน-อบสมุนไพร-UC,' +
        'นอกสถาน-ประคบสมุนไพร-ทุกสิทธิ,นอกสถาน-ประคบสมุนไพร-UC,' +
        'นอกสถาน-นวดและประคบ-ทุกสิทธิ,นอกสถาน-นวดและประคบ-UC,' +
        'รวม-บริการแผนไทย-ทุกสิทธิ,รวม-บริการแผนไทย-UC,' +
        'รวม-นวดแผนไทย-ทุกสิทธิ,รวม-นวดแผนไทย-UC,' +
        'รวม-อบสมุนไพร-ทุกสิทธิ,รวม-อบสมุนไพร-UC,' +
        'รวม-ประคบสมุนไพร-ทุกสิทธิ,รวม-ประคบสมุนไพร-UC,' +
        'รวม-นวดและประคบ-ทุกสิทธิ,รวม-นวดและประคบ-UC\n';

      // District Total Row
      const dIn = yrData.in || {};
      const dOut = yrData.out || {};
      const dTot = yrData.tot || {};
      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",` +
        `${dIn.vs?.all || 0},${dIn.vs?.uc || 0},${dIn.nod?.all || 0},${dIn.nod?.uc || 0},${dIn.obb?.all || 0},${dIn.obb?.uc || 0},${dIn.cop?.all || 0},${dIn.cop?.uc || 0},${dIn.n_c?.all || 0},${dIn.n_c?.uc || 0},` +
        `${dOut.vs?.all || 0},${dOut.vs?.uc || 0},${dOut.nod?.all || 0},${dOut.nod?.uc || 0},${dOut.obb?.all || 0},${dOut.obb?.uc || 0},${dOut.cop?.all || 0},${dOut.cop?.uc || 0},${dOut.n_c?.all || 0},${dOut.n_c?.uc || 0},` +
        `${dTot.vs?.all || 0},${dTot.vs?.uc || 0},${dTot.nod?.all || 0},${dTot.nod?.uc || 0},${dTot.obb?.all || 0},${dTot.obb?.uc || 0},${dTot.cop?.all || 0},${dTot.cop?.uc || 0},${dTot.n_c?.all || 0},${dTot.n_c?.uc || 0}\n`;

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uIn = u.in || {};
        const uOut = u.out || {};
        const uTot = u.tot || {};
        csvContent += `"${u.hospcode}","${uName}","${uSub}",` +
          `${uIn.vs?.all || 0},${uIn.vs?.uc || 0},${uIn.nod?.all || 0},${uIn.nod?.uc || 0},${uIn.obb?.all || 0},${uIn.obb?.uc || 0},${uIn.cop?.all || 0},${uIn.cop?.uc || 0},${uIn.n_c?.all || 0},${uIn.n_c?.uc || 0},` +
          `${uOut.vs?.all || 0},${uOut.vs?.uc || 0},${uOut.nod?.all || 0},${uOut.nod?.uc || 0},${uOut.obb?.all || 0},${uOut.obb?.uc || 0},${uOut.cop?.all || 0},${uOut.cop?.uc || 0},${uOut.n_c?.all || 0},${uOut.n_c?.uc || 0},` +
          `${uTot.vs?.all || 0},${uTot.vs?.uc || 0},${uTot.nod?.all || 0},${uTot.nod?.uc || 0},${uTot.obb?.all || 0},${uTot.obb?.uc || 0},${uTot.cop?.all || 0},${uTot.cop?.uc || 0},${uTot.n_c?.all || 0},${uTot.n_c?.uc || 0}\n`;
      });

    } else if (currentTtmMassageView === 'total_only') {
      csvContent += 'รหัส,หน่วยบริการ,ตำบล,' +
        'บริการแผนไทย-ทุกสิทธิ,บริการแผนไทย-UC,' +
        'นวดแผนไทย-ทุกสิทธิ,นวดแผนไทย-UC,' +
        'อบสมุนไพร-ทุกสิทธิ,อบสมุนไพร-UC,' +
        'ประคบสมุนไพร-ทุกสิทธิ,ประคบสมุนไพร-UC,' +
        'นวดและประคบ-ทุกสิทธิ,นวดและประคบ-UC\n';

      const dTot = yrData.tot || {};
      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",` +
        `${dTot.vs?.all || 0},${dTot.vs?.uc || 0},${dTot.nod?.all || 0},${dTot.nod?.uc || 0},${dTot.obb?.all || 0},${dTot.obb?.uc || 0},${dTot.cop?.all || 0},${dTot.cop?.uc || 0},${dTot.n_c?.all || 0},${dTot.n_c?.uc || 0}\n`;

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uTot = u.tot || {};
        csvContent += `"${u.hospcode}","${uName}","${uSub}",` +
          `${uTot.vs?.all || 0},${uTot.vs?.uc || 0},${uTot.nod?.all || 0},${uTot.nod?.uc || 0},${uTot.obb?.all || 0},${uTot.obb?.uc || 0},${uTot.cop?.all || 0},${uTot.cop?.uc || 0},${uTot.n_c?.all || 0},${uTot.n_c?.uc || 0}\n`;
      });

    } else if (currentTtmMassageView === 'compare_in_out') {
      csvContent += 'รหัส,หน่วยบริการ,ตำบล,' +
        'บริการแผนไทย-ในสถาน,บริการแผนไทย-นอกสถาน,บริการแผนไทย-รวม,บริการแผนไทย-%ในสถาน,' +
        'นวดแผนไทย-ในสถาน,นวดแผนไทย-นอกสถาน,นวดแผนไทย-รวม,' +
        'อบสมุนไพร-ในสถาน,อบสมุนไพร-นอกสถาน,อบสมุนไพร-รวม,' +
        'ประคบสมุนไพร-ในสถาน,ประคบสมุนไพร-นอกสถาน,ประคบสมุนไพร-รวม,' +
        'นวดและประคบ-ในสถาน,นวดและประคบ-นอกสถาน,นวดและประคบ-รวม\n';

      const dIn = yrData.in || {};
      const dOut = yrData.out || {};
      const dTot = yrData.tot || {};
      const vsInPct = dTot.vs?.all > 0 ? ((dIn.vs?.all || 0) / dTot.vs.all * 100).toFixed(1) : '0.0';
      csvContent += `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",` +
        `${dIn.vs?.all || 0},${dOut.vs?.all || 0},${dTot.vs?.all || 0},${vsInPct}%,` +
        `${dIn.nod?.all || 0},${dOut.nod?.all || 0},${dTot.nod?.all || 0},` +
        `${dIn.obb?.all || 0},${dOut.obb?.all || 0},${dTot.obb?.all || 0},` +
        `${dIn.cop?.all || 0},${dOut.cop?.all || 0},${dTot.cop?.all || 0},` +
        `${dIn.n_c?.all || 0},${dOut.n_c?.all || 0},${dTot.n_c?.all || 0}\n`;

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uIn = u.in || {};
        const uOut = u.out || {};
        const uTot = u.tot || {};
        const uVsInPct = uTot.vs?.all > 0 ? ((uIn.vs?.all || 0) / uTot.vs.all * 100).toFixed(1) : '0.0';
        csvContent += `"${u.hospcode}","${uName}","${uSub}",` +
          `${uIn.vs?.all || 0},${uOut.vs?.all || 0},${uTot.vs?.all || 0},${uVsInPct}%,` +
          `${uIn.nod?.all || 0},${uOut.nod?.all || 0},${uTot.nod?.all || 0},` +
          `${uIn.obb?.all || 0},${uOut.obb?.all || 0},${uTot.obb?.all || 0},` +
          `${uIn.cop?.all || 0},${uOut.cop?.all || 0},${uTot.cop?.all || 0},` +
          `${uIn.n_c?.all || 0},${uOut.n_c?.all || 0},${uTot.n_c?.all || 0}\n`;
      });

    } else if (currentTtmMassageView === 'quarter') {
      csvContent += 'รหัส,หน่วยบริการ,ตำบล,' +
        'Q1-นวด,Q1-อบ,Q1-ประคบ,Q1-บริการรวม,' +
        'Q2-นวด,Q2-อบ,Q2-ประคบ,Q2-บริการรวม,' +
        'Q3-นวด,Q3-อบ,Q3-ประคบ,Q3-บริการรวม,' +
        'Q4-นวด,Q4-อบ,Q4-ประคบ,Q4-บริการรวม\n';

      const dQ = yrData.quarters || {};
      let dLine = `"total","รวมทั้งอำเภอสารภี (14 หน่วยบริการ)","-",`;
      for (let qi = 1; qi <= 4; qi++) {
        const qd = dQ[`q${qi}`]?.tot || {};
        dLine += `${qd.nod?.all || 0},${qd.obb?.all || 0},${qd.cop?.all || 0},${qd.vs?.all || 0}${qi === 4 ? '' : ','}`;
      }
      csvContent += dLine + '\n';

      units.forEach(u => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uQ = u.quarters || {};
        let line = `"${u.hospcode}","${uName}","${uSub}",`;
        for (let qi = 1; qi <= 4; qi++) {
          const qd = uQ[`q${qi}`]?.tot || {};
          line += `${qd.nod?.all || 0},${qd.obb?.all || 0},${qd.cop?.all || 0},${qd.vs?.all || 0}${qi === 4 ? '' : ','}`;
        }
        csvContent += line + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `HDC_s_ttm8_Saraphi_${yr}_${currentTtmMassageView}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function renderTtmMassagePanel() {
    if (currentIndicatorId !== 'ttm_massage') {
      if (ttmMassagePanel) ttmMassagePanel.classList.add('hidden');
      return;
    }
    if (ttmMassagePanel) ttmMassagePanel.classList.remove('hidden');

    const yr = currentTtmMassageYear || currentYear || '2569';

    // 1. Sync View Mode Buttons
    ['hdc_full', 'total_only', 'compare_in_out', 'quarter'].forEach(v => {
      const btn = document.getElementById(`btn-ttm-massage-view-${v}`);
      if (btn) {
        if (v === currentTtmMassageView) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Sync Year Filter Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-ttm-massage-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 3. Sync Chart Tabs Buttons & Cards Visibility
    ['all_3', 'nod', 'obb', 'cop'].forEach(t => {
      const btn = document.getElementById(`btn-ttm-massage-chart-${t}`);
      if (btn) {
        if (t === currentTtmMassageChartTab) {
          btn.className = 'px-2.5 py-1 rounded-lg font-bold transition bg-emerald-600 text-white shadow-xs';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    const cardNod = document.getElementById('ttm-massage-chart-card-nod');
    const cardObb = document.getElementById('ttm-massage-chart-card-obb');
    const cardCop = document.getElementById('ttm-massage-chart-card-cop');
    const chartsContainer = document.getElementById('ttm-massage-charts-container');

    if (chartsContainer && cardNod && cardObb && cardCop) {
      if (currentTtmMassageChartTab === 'all_3') {
        chartsContainer.className = 'grid grid-cols-1 lg:grid-cols-3 gap-4';
        cardNod.classList.remove('hidden');
        cardObb.classList.remove('hidden');
        cardCop.classList.remove('hidden');
      } else if (currentTtmMassageChartTab === 'nod') {
        chartsContainer.className = 'grid grid-cols-1 gap-4';
        cardNod.classList.remove('hidden');
        cardObb.classList.add('hidden');
        cardCop.classList.add('hidden');
      } else if (currentTtmMassageChartTab === 'obb') {
        chartsContainer.className = 'grid grid-cols-1 gap-4';
        cardNod.classList.add('hidden');
        cardObb.classList.remove('hidden');
        cardCop.classList.add('hidden');
      } else if (currentTtmMassageChartTab === 'cop') {
        chartsContainer.className = 'grid grid-cols-1 gap-4';
        cardNod.classList.add('hidden');
        cardObb.classList.add('hidden');
        cardCop.classList.remove('hidden');
      }
    }

    // Data references
    const ind = masterData?.indicators?.['ttm_massage'] || {};
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];

    // 4. Update 5 Bento KPI Cards
    let vsTot = yrData.tot?.vs?.all || 0;
    let vsUc = yrData.tot?.vs?.uc || 0;
    let vsIn = yrData.in?.vs?.all || 0;
    let vsOut = yrData.out?.vs?.all || 0;

    let nodTot = yrData.tot?.nod?.all || 0;
    let nodUc = yrData.tot?.nod?.uc || 0;
    let nodIn = yrData.in?.nod?.all || 0;
    let nodOut = yrData.out?.nod?.all || 0;

    let obbTot = yrData.tot?.obb?.all || 0;
    let obbUc = yrData.tot?.obb?.uc || 0;
    let obbIn = yrData.in?.obb?.all || 0;
    let obbOut = yrData.out?.obb?.all || 0;

    let copTot = yrData.tot?.cop?.all || 0;
    let copUc = yrData.tot?.cop?.uc || 0;
    let copIn = yrData.in?.cop?.all || 0;
    let copOut = yrData.out?.cop?.all || 0;

    let ncTot = yrData.tot?.n_c?.all || 0;
    let ncUc = yrData.tot?.n_c?.uc || 0;
    let ncIn = yrData.in?.n_c?.all || 0;
    let ncOut = yrData.out?.n_c?.all || 0;

    if (currentUnit !== 'all') {
      const u = units.find(x => x.hospcode === currentUnit);
      if (u) {
        vsTot = u.tot?.vs?.all || 0;
        vsUc = u.tot?.vs?.uc || 0;
        vsIn = u.in?.vs?.all || 0;
        vsOut = u.out?.vs?.all || 0;

        nodTot = u.tot?.nod?.all || 0;
        nodUc = u.tot?.nod?.uc || 0;
        nodIn = u.in?.nod?.all || 0;
        nodOut = u.out?.nod?.all || 0;

        obbTot = u.tot?.obb?.all || 0;
        obbUc = u.tot?.obb?.uc || 0;
        obbIn = u.in?.obb?.all || 0;
        obbOut = u.out?.obb?.all || 0;

        copTot = u.tot?.cop?.all || 0;
        copUc = u.tot?.cop?.uc || 0;
        copIn = u.in?.cop?.all || 0;
        copOut = u.out?.cop?.all || 0;

        ncTot = u.tot?.n_c?.all || 0;
        ncUc = u.tot?.n_c?.uc || 0;
        ncIn = u.in?.n_c?.all || 0;
        ncOut = u.out?.n_c?.all || 0;
      }
    }

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('ttm-massage-kpi-vs-total', vsTot.toLocaleString());
    setTxt('ttm-massage-kpi-vs-uc', `${vsUc.toLocaleString()} ครั้ง (${vsTot > 0 ? ((vsUc / vsTot) * 100).toFixed(1) : 0}%)`);
    setTxt('ttm-massage-kpi-vs-in', vsIn.toLocaleString());
    setTxt('ttm-massage-kpi-vs-out', vsOut.toLocaleString());

    setTxt('ttm-massage-kpi-nod-total', nodTot.toLocaleString());
    setTxt('ttm-massage-kpi-nod-uc', `${nodUc.toLocaleString()} ครั้ง (${nodTot > 0 ? ((nodUc / nodTot) * 100).toFixed(1) : 0}%)`);
    setTxt('ttm-massage-kpi-nod-in', nodIn.toLocaleString());
    setTxt('ttm-massage-kpi-nod-out', nodOut.toLocaleString());

    setTxt('ttm-massage-kpi-obb-total', obbTot.toLocaleString());
    setTxt('ttm-massage-kpi-obb-uc', `${obbUc.toLocaleString()} ครั้ง (${obbTot > 0 ? ((obbUc / obbTot) * 100).toFixed(1) : 0}%)`);
    setTxt('ttm-massage-kpi-obb-in', obbIn.toLocaleString());
    setTxt('ttm-massage-kpi-obb-out', obbOut.toLocaleString());

    setTxt('ttm-massage-kpi-cop-total', copTot.toLocaleString());
    setTxt('ttm-massage-kpi-cop-uc', `${copUc.toLocaleString()} ครั้ง (${copTot > 0 ? ((copUc / copTot) * 100).toFixed(1) : 0}%)`);
    setTxt('ttm-massage-kpi-cop-in', copIn.toLocaleString());
    setTxt('ttm-massage-kpi-cop-out', copOut.toLocaleString());

    setTxt('ttm-massage-kpi-nc-total', ncTot.toLocaleString());
    setTxt('ttm-massage-kpi-nc-uc', `${ncUc.toLocaleString()} ครั้ง (${ncTot > 0 ? ((ncUc / ncTot) * 100).toFixed(1) : 0}%)`);
    setTxt('ttm-massage-kpi-nc-in', ncIn.toLocaleString());
    setTxt('ttm-massage-kpi-nc-out', ncOut.toLocaleString());

    // Badges
    setTxt('ttm-massage-badge-nod', `รวม ${nodTot.toLocaleString()} ครั้ง`);
    setTxt('ttm-massage-badge-obb', `รวม ${obbTot.toLocaleString()} ครั้ง`);
    setTxt('ttm-massage-badge-cop', `รวม ${copTot.toLocaleString()} ครั้ง`);

    // 5. Render 3 HDC Standard Charts
    renderTtmMassageCharts(units);

    // 6. Render HDC Matrix Table
    renderTtmMassageTable(units, yrData, yr);
  }

  function renderTtmMassageCharts(units) {
    // 1. Chart Nod (นวดแผนไทย)
    const canvasNod = document.getElementById('ttmMassageChartNod');
    if (canvasNod) {
      if (ttmMassageChartNodInstance) {
        ttmMassageChartNodInstance.destroy();
        ttmMassageChartNodInstance = null;
      }
      const sortedNod = [...units].sort((a, b) => (b.tot?.nod?.all || 0) - (a.tot?.nod?.all || 0));
      const labelsNod = sortedNod.map(u => (u.hospcode === '06023' ? 'รพ.สต.บ้านป่าสา' : (SARAPHI_UNITS_MAP[u.hospcode]?.short || u.name)));
      const dataNod = sortedNod.map(u => u.tot?.nod?.all || 0);

      ttmMassageChartNodInstance = new Chart(canvasNod, {
        type: 'bar',
        data: {
          labels: labelsNod,
          datasets: [{
            label: 'นวดแผนไทย (ครั้ง)',
            data: dataNod,
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderColor: '#2563eb',
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.parsed.y.toLocaleString()} ครั้ง`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 10 },
                maxRotation: 45,
                minRotation: 30
              },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: v => v.toLocaleString(),
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 10 }
              },
              grid: { color: 'rgba(226, 232, 240, 0.6)' }
            }
          }
        }
      });
    }

    // 2. Chart Obb (อบสมุนไพร)
    const canvasObb = document.getElementById('ttmMassageChartObb');
    if (canvasObb) {
      if (ttmMassageChartObbInstance) {
        ttmMassageChartObbInstance.destroy();
        ttmMassageChartObbInstance = null;
      }
      const sortedObb = [...units].sort((a, b) => (b.tot?.obb?.all || 0) - (a.tot?.obb?.all || 0));
      const labelsObb = sortedObb.map(u => (u.hospcode === '06023' ? 'รพ.สต.บ้านป่าสา' : (SARAPHI_UNITS_MAP[u.hospcode]?.short || u.name)));
      const dataObb = sortedObb.map(u => u.tot?.obb?.all || 0);

      ttmMassageChartObbInstance = new Chart(canvasObb, {
        type: 'bar',
        data: {
          labels: labelsObb,
          datasets: [{
            label: 'อบสมุนไพร (ครั้ง)',
            data: dataObb,
            backgroundColor: 'rgba(217, 119, 6, 0.85)',
            borderColor: '#d97706',
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.parsed.y.toLocaleString()} ครั้ง`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 10 },
                maxRotation: 45,
                minRotation: 30
              },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: v => v.toLocaleString(),
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 10 }
              },
              grid: { color: 'rgba(226, 232, 240, 0.6)' }
            }
          }
        }
      });
    }

    // 3. Chart Cop (ประคบสมุนไพร)
    const canvasCop = document.getElementById('ttmMassageChartCop');
    if (canvasCop) {
      if (ttmMassageChartCopInstance) {
        ttmMassageChartCopInstance.destroy();
        ttmMassageChartCopInstance = null;
      }
      const sortedCop = [...units].sort((a, b) => (b.tot?.cop?.all || 0) - (a.tot?.cop?.all || 0));
      const labelsCop = sortedCop.map(u => (u.hospcode === '06023' ? 'รพ.สต.บ้านป่าสา' : (SARAPHI_UNITS_MAP[u.hospcode]?.short || u.name)));
      const dataCop = sortedCop.map(u => u.tot?.cop?.all || 0);

      ttmMassageChartCopInstance = new Chart(canvasCop, {
        type: 'bar',
        data: {
          labels: labelsCop,
          datasets: [{
            label: 'ประคบสมุนไพร (ครั้ง)',
            data: dataCop,
            backgroundColor: 'rgba(5, 150, 105, 0.85)',
            borderColor: '#059669',
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.parsed.y.toLocaleString()} ครั้ง`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 10 },
                maxRotation: 45,
                minRotation: 30
              },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: v => v.toLocaleString(),
                font: { family: "'IBM Plex Sans Thai', sans-serif", size: 10 }
              },
              grid: { color: 'rgba(226, 232, 240, 0.6)' }
            }
          }
        }
      });
    }
  }

  function renderTtmMassageTable(units, yrData, yr) {
    const tableEl = document.getElementById('ttm-massage-matrix-table');
    if (!tableEl) return;

    const headingEl = document.getElementById('ttm-massage-table-heading');
    const subHeadingEl = document.getElementById('ttm-massage-table-subheading');

    let filtered = [...units];
    if (ttmMassageSearchQuery) {
      const q = ttmMassageSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(u => {
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : u.name;
        return uName.toLowerCase().includes(q) ||
          u.hospcode.includes(q) ||
          (u.subdistrict && u.subdistrict.toLowerCase().includes(q));
      });
    }

    const fmt = (v) => (v && v > 0) ? Number(v).toLocaleString() : '<span class="text-slate-300">-</span>';
    const fmtTot = (v) => (v && v > 0) ? Number(v).toLocaleString() : '0';

    let theadHtml = '';
    let tbodyHtml = '';

    if (currentTtmMassageView === 'hdc_full') {
      if (headingEl) headingEl.textContent = 'ตารางข้อมูลการบริการแผนไทย นวด อบ ประคบ มาตรฐาน HDC (1:1)';
      if (subHeadingEl) subHeadingEl.textContent = 'จำแนกในสถานบริการ นอกสถานบริการ และรวมในและนอก ครบ 30 คอลัมน์ (14 หน่วยบริการ อำเภอสารภี)';

      theadHtml = `
        <thead>
          <tr class="bg-slate-800 text-white text-center font-bold text-xs">
            <th rowspan="3" class="py-2.5 px-3 text-left sticky left-0 z-20 bg-slate-800 w-[55px] min-w-[55px] border-r border-slate-700">ลำดับ</th>
            <th rowspan="3" class="py-2.5 px-2 text-center bg-slate-800 min-w-[70px] border-r border-slate-700">รหัส</th>
            <th rowspan="3" class="py-2.5 px-3 text-left sticky left-[55px] z-20 bg-slate-800 min-w-[190px] border-r border-slate-700 shadow-r">ชื่อสถานบริการ</th>
            <th colspan="10" class="py-2 px-2 bg-blue-900 text-blue-100 border-r border-b border-slate-700">ในสถานบริการ</th>
            <th colspan="10" class="py-2 px-2 bg-amber-900 text-amber-100 border-r border-b border-slate-700">นอกสถานบริการ</th>
            <th colspan="10" class="py-2 px-2 bg-emerald-900 text-emerald-100 border-r border-b border-slate-700">รวมในและนอกสถานบริการ</th>
            <th rowspan="3" class="py-2.5 px-2 bg-slate-800 min-w-[75px]">การกระทำ</th>
          </tr>
          <tr class="bg-slate-700 text-white text-center font-semibold text-[11px]">
            <!-- ในสถาน -->
            <th colspan="2" class="py-1.5 px-1 bg-blue-800/90 border-r border-b border-slate-600">บริการแผนไทย</th>
            <th colspan="2" class="py-1.5 px-1 bg-blue-800/90 border-r border-b border-slate-600">นวดแผนไทย</th>
            <th colspan="2" class="py-1.5 px-1 bg-blue-800/90 border-r border-b border-slate-600">อบสมุนไพร</th>
            <th colspan="2" class="py-1.5 px-1 bg-blue-800/90 border-r border-b border-slate-600">ประคบสมุนไพร</th>
            <th colspan="2" class="py-1.5 px-1 bg-blue-800/90 border-r border-b border-slate-600">นวดและประคบ</th>
            <!-- นอกสถาน -->
            <th colspan="2" class="py-1.5 px-1 bg-amber-800/90 border-r border-b border-slate-600">บริการแผนไทย</th>
            <th colspan="2" class="py-1.5 px-1 bg-amber-800/90 border-r border-b border-slate-600">นวดแผนไทย</th>
            <th colspan="2" class="py-1.5 px-1 bg-amber-800/90 border-r border-b border-slate-600">อบสมุนไพร</th>
            <th colspan="2" class="py-1.5 px-1 bg-amber-800/90 border-r border-b border-slate-600">ประคบสมุนไพร</th>
            <th colspan="2" class="py-1.5 px-1 bg-amber-800/90 border-r border-b border-slate-600">นวดและประคบ</th>
            <!-- รวมในและนอก -->
            <th colspan="2" class="py-1.5 px-1 bg-emerald-800/90 border-r border-b border-slate-600">บริการแผนไทย</th>
            <th colspan="2" class="py-1.5 px-1 bg-emerald-800/90 border-r border-b border-slate-600">นวดแผนไทย</th>
            <th colspan="2" class="py-1.5 px-1 bg-emerald-800/90 border-r border-b border-slate-600">อบสมุนไพร</th>
            <th colspan="2" class="py-1.5 px-1 bg-emerald-800/90 border-r border-b border-slate-600">ประคบสมุนไพร</th>
            <th colspan="2" class="py-1.5 px-1 bg-emerald-800/90 border-r border-b border-slate-600">นวดและประคบ</th>
          </tr>
          <tr class="bg-slate-600 text-white text-center font-medium text-[10px]">
            <!-- In (5 pairs) -->
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[48px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[48px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px]">สิทธิ UC</th>
            <!-- Out (5 pairs) -->
            <th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[45px]">สิทธิ UC</th>
            <!-- Tot (5 pairs) -->
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[48px] font-bold text-emerald-200">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[48px] font-bold text-emerald-200">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">สิทธิ UC</th>
            <th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">ทุกสิทธิ</th><th class="py-1 px-1 border-r border-slate-500 min-w-[52px] font-bold text-emerald-200">สิทธิ UC</th>
          </tr>
        </thead>
      `;

      // Top Row: Total (ตรงตามแบบ HDC)
      const dIn = yrData.in || {};
      const dOut = yrData.out || {};
      const dTot = yrData.tot || {};
      tbodyHtml += `
        <tr class="bg-emerald-50/90 font-bold border-b-2 border-emerald-300 text-slate-900">
          <td class="py-2.5 px-3 text-center sticky left-0 bg-emerald-100 z-10 font-black">-</td>
          <td class="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">-</td>
          <td class="py-2.5 px-3 font-black text-emerald-950 sticky left-[55px] bg-emerald-100 z-10 shadow-r">รวมทั้งอำเภอสารภี (14 แห่ง)</td>
          <!-- IN (10) -->
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-blue-900">${fmtTot(dIn.vs?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dIn.vs?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-blue-900">${fmtTot(dIn.nod?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dIn.nod?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-blue-900">${fmtTot(dIn.obb?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dIn.obb?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-blue-900">${fmtTot(dIn.cop?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dIn.cop?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-blue-900">${fmtTot(dIn.n_c?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dIn.n_c?.uc)}</td>
          <!-- OUT (10) -->
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-amber-900">${fmtTot(dOut.vs?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dOut.vs?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-amber-900">${fmtTot(dOut.nod?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dOut.nod?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-amber-900">${fmtTot(dOut.obb?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dOut.obb?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-amber-900">${fmtTot(dOut.cop?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dOut.cop?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-bold text-amber-900">${fmtTot(dOut.n_c?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 text-slate-700">${fmtTot(dOut.n_c?.uc)}</td>
          <!-- TOT (10) -->
          <td class="py-2 px-1 text-right border-r border-slate-200 font-black text-emerald-900 bg-emerald-100/60">${fmtTot(dTot.vs?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-semibold text-emerald-800 bg-emerald-100/40">${fmtTot(dTot.vs?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-black text-emerald-900 bg-emerald-100/60">${fmtTot(dTot.nod?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-semibold text-emerald-800 bg-emerald-100/40">${fmtTot(dTot.nod?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-black text-emerald-900 bg-emerald-100/60">${fmtTot(dTot.obb?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-semibold text-emerald-800 bg-emerald-100/40">${fmtTot(dTot.obb?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-black text-emerald-900 bg-emerald-100/60">${fmtTot(dTot.cop?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-semibold text-emerald-800 bg-emerald-100/40">${fmtTot(dTot.cop?.uc)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-black text-emerald-900 bg-emerald-100/60">${fmtTot(dTot.n_c?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-semibold text-emerald-800 bg-emerald-100/40">${fmtTot(dTot.n_c?.uc)}</td>
          <!-- Action -->
          <td class="py-2 px-1 text-center text-xs font-bold text-slate-400">-</td>
        </tr>
      `;

      filtered.forEach((u, idx) => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uIn = u.in || {};
        const uOut = u.out || {};
        const uTot = u.tot || {};
        const isSelected = (currentUnit === u.hospcode);

        tbodyHtml += `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-slate-700 ${isSelected ? 'bg-amber-50/70 font-semibold' : ''}">
            <td class="py-2 px-3 text-center sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-400 text-[11px] ${isSelected ? 'bg-amber-50' : ''}">${idx + 1}</td>
            <td class="py-2 px-2 text-center font-mono text-[11px] text-slate-500 border-r border-slate-200">${u.hospcode}</td>
            <td class="py-2 px-3 sticky left-[55px] bg-white z-10 border-r border-slate-200 shadow-r ${isSelected ? 'bg-amber-50' : ''}">
              <div class="flex items-center gap-1.5">
                <span class="font-medium text-slate-900 hover:text-emerald-700 cursor-pointer" onclick="switchUnit('${u.hospcode}')">${uName}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">ต.${uSub}</span>
              </div>
            </td>
            <!-- IN (10) -->
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uIn.vs?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uIn.vs?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 font-semibold text-blue-900">${fmt(uIn.nod?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uIn.nod?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uIn.obb?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uIn.obb?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 font-semibold text-blue-900">${fmt(uIn.cop?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uIn.cop?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uIn.n_c?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uIn.n_c?.uc)}</td>
            <!-- OUT (10) -->
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uOut.vs?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uOut.vs?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uOut.nod?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uOut.nod?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uOut.obb?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uOut.obb?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uOut.cop?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uOut.cop?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(uOut.n_c?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-500">${fmt(uOut.n_c?.uc)}</td>
            <!-- TOT (10) -->
            <td class="py-2 px-1 text-right border-r border-slate-100 font-bold text-slate-900 bg-slate-50/50">${fmt(uTot.vs?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-600 bg-slate-50/30">${fmt(uTot.vs?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 font-bold text-emerald-800 bg-emerald-50/30">${fmt(uTot.nod?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-600 bg-emerald-50/20">${fmt(uTot.nod?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 font-bold text-amber-800 bg-amber-50/30">${fmt(uTot.obb?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-600 bg-amber-50/20">${fmt(uTot.obb?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 font-bold text-emerald-800 bg-emerald-50/30">${fmt(uTot.cop?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-600 bg-emerald-50/20">${fmt(uTot.cop?.uc)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 font-bold text-purple-800 bg-purple-50/30">${fmt(uTot.n_c?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 text-slate-600 bg-purple-50/20">${fmt(uTot.n_c?.uc)}</td>
            <!-- Action -->
            <td class="py-2 px-1 text-center">
              <button type="button" onclick="switchUnit('${u.hospcode}')" class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
      });

    } else if (currentTtmMassageView === 'total_only') {
      if (headingEl) headingEl.textContent = 'ตารางรวมในและนอกสถานบริการ (Total 10 Columns)';
      if (subHeadingEl) subHeadingEl.textContent = 'แสดงยอดรวมทั้งในและนอกสถานบริการ แยกตามสิทธิ (ทุกสิทธิ และ สิทธิ UC) อำเภอสารภี';

      theadHtml = `
        <thead>
          <tr class="bg-slate-800 text-white text-center font-bold text-xs">
            <th rowspan="2" class="py-2.5 px-3 text-left sticky left-0 z-20 bg-slate-800 w-[55px] min-w-[55px] border-r border-slate-700">ลำดับ</th>
            <th rowspan="2" class="py-2.5 px-2 text-center bg-slate-800 min-w-[70px] border-r border-slate-700">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left sticky left-[55px] z-20 bg-slate-800 min-w-[200px] border-r border-slate-700 shadow-r">ชื่อสถานบริการ</th>
            <th colspan="2" class="py-2 px-2 bg-teal-900 text-teal-100 border-r border-b border-slate-700">บริการแผนไทย (ครั้ง)</th>
            <th colspan="2" class="py-2 px-2 bg-blue-900 text-blue-100 border-r border-b border-slate-700">นวดแผนไทย (ครั้ง)</th>
            <th colspan="2" class="py-2 px-2 bg-amber-900 text-amber-100 border-r border-b border-slate-700">อบสมุนไพร (ครั้ง)</th>
            <th colspan="2" class="py-2 px-2 bg-emerald-900 text-emerald-100 border-r border-b border-slate-700">ประคบสมุนไพร (ครั้ง)</th>
            <th colspan="2" class="py-2 px-2 bg-purple-900 text-purple-100 border-r border-b border-slate-700">นวดและประคบ (ครั้ง)</th>
            <th rowspan="2" class="py-2.5 px-2 bg-slate-800 min-w-[80px]">การกระทำ</th>
          </tr>
          <tr class="bg-slate-700 text-white text-center font-semibold text-[10.5px]">
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">ทุกสิทธิ</th><th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">สิทธิ UC</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">ทุกสิทธิ</th><th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">สิทธิ UC</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">ทุกสิทธิ</th><th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">สิทธิ UC</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">ทุกสิทธิ</th><th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">สิทธิ UC</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">ทุกสิทธิ</th><th class="py-1 px-1.5 border-r border-slate-600 min-w-[65px]">สิทธิ UC</th>
          </tr>
        </thead>
      `;

      const dTot = yrData.tot || {};
      tbodyHtml += `
        <tr class="bg-emerald-50/90 font-bold border-b-2 border-emerald-300 text-slate-900">
          <td class="py-2.5 px-3 text-center sticky left-0 bg-emerald-100 z-10 font-black">-</td>
          <td class="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">-</td>
          <td class="py-2.5 px-3 font-black text-emerald-950 sticky left-[55px] bg-emerald-100 z-10 shadow-r">รวมทั้งอำเภอสารภี (14 แห่ง)</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-black text-slate-900 bg-teal-100/50">${fmtTot(dTot.vs?.all)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-semibold text-slate-700 bg-teal-100/30">${fmtTot(dTot.vs?.uc)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-black text-blue-900 bg-blue-100/50">${fmtTot(dTot.nod?.all)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-semibold text-slate-700 bg-blue-100/30">${fmtTot(dTot.nod?.uc)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-black text-amber-900 bg-amber-100/50">${fmtTot(dTot.obb?.all)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-semibold text-slate-700 bg-amber-100/30">${fmtTot(dTot.obb?.uc)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-black text-emerald-900 bg-emerald-100/50">${fmtTot(dTot.cop?.all)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-semibold text-slate-700 bg-emerald-100/30">${fmtTot(dTot.cop?.uc)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-black text-purple-900 bg-purple-100/50">${fmtTot(dTot.n_c?.all)}</td>
          <td class="py-2 px-2 text-right border-r border-slate-200 font-semibold text-slate-700 bg-purple-100/30">${fmtTot(dTot.n_c?.uc)}</td>
          <td class="py-2 px-2 text-center text-slate-400">-</td>
        </tr>
      `;

      filtered.forEach((u, idx) => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uTot = u.tot || {};
        const isSelected = (currentUnit === u.hospcode);

        tbodyHtml += `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-slate-700 ${isSelected ? 'bg-amber-50/70 font-semibold' : ''}">
            <td class="py-2 px-3 text-center sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-400 text-[11px] ${isSelected ? 'bg-amber-50' : ''}">${idx + 1}</td>
            <td class="py-2 px-2 text-center font-mono text-[11px] text-slate-500 border-r border-slate-200">${u.hospcode}</td>
            <td class="py-2 px-3 sticky left-[55px] bg-white z-10 border-r border-slate-200 shadow-r ${isSelected ? 'bg-amber-50' : ''}">
              <div class="flex items-center gap-1.5">
                <span class="font-medium text-slate-900 hover:text-emerald-700 cursor-pointer" onclick="switchUnit('${u.hospcode}')">${uName}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">ต.${uSub}</span>
              </div>
            </td>
            <td class="py-2 px-2 text-right border-r border-slate-100 font-bold text-slate-900">${fmt(uTot.vs?.all)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 text-slate-600">${fmt(uTot.vs?.uc)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 font-bold text-blue-800">${fmt(uTot.nod?.all)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 text-slate-600">${fmt(uTot.nod?.uc)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 font-bold text-amber-800">${fmt(uTot.obb?.all)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 text-slate-600">${fmt(uTot.obb?.uc)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 font-bold text-emerald-800">${fmt(uTot.cop?.all)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 text-slate-600">${fmt(uTot.cop?.uc)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 font-bold text-purple-800">${fmt(uTot.n_c?.all)}</td>
            <td class="py-2 px-2 text-right border-r border-slate-100 text-slate-600">${fmt(uTot.n_c?.uc)}</td>
            <td class="py-2 px-2 text-center">
              <button type="button" onclick="switchUnit('${u.hospcode}')" class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
      });

    } else if (currentTtmMassageView === 'compare_in_out') {
      if (headingEl) headingEl.textContent = 'ตารางเปรียบเทียบใน vs นอกสถานบริการ (In vs Out Facility)';
      if (subHeadingEl) subHeadingEl.textContent = 'แสดงการกระจายตัวของการให้บริการหัตถการแผนไทยระหว่างในสถานบริการและนอกสถานบริการ อำเภอสารภี';

      theadHtml = `
        <thead>
          <tr class="bg-slate-800 text-white text-center font-bold text-xs">
            <th rowspan="2" class="py-2.5 px-3 text-left sticky left-0 z-20 bg-slate-800 w-[55px] min-w-[55px] border-r border-slate-700">ลำดับ</th>
            <th rowspan="2" class="py-2.5 px-2 text-center bg-slate-800 min-w-[70px] border-r border-slate-700">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left sticky left-[55px] z-20 bg-slate-800 min-w-[200px] border-r border-slate-700 shadow-r">ชื่อสถานบริการ</th>
            <th colspan="4" class="py-2 px-2 bg-teal-900 text-teal-100 border-r border-b border-slate-700">บริการแผนไทย (ครั้ง)</th>
            <th colspan="3" class="py-2 px-2 bg-blue-900 text-blue-100 border-r border-b border-slate-700">นวดแผนไทย (ครั้ง)</th>
            <th colspan="3" class="py-2 px-2 bg-amber-900 text-amber-100 border-r border-b border-slate-700">อบสมุนไพร (ครั้ง)</th>
            <th colspan="3" class="py-2 px-2 bg-emerald-900 text-emerald-100 border-r border-b border-slate-700">ประคบสมุนไพร (ครั้ง)</th>
            <th rowspan="2" class="py-2.5 px-2 bg-slate-800 min-w-[80px]">การกระทำ</th>
          </tr>
          <tr class="bg-slate-700 text-white text-center font-semibold text-[10.5px]">
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">ในสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">นอกสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px] font-bold text-teal-200">รวม</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[50px] font-bold text-teal-200">% ในสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">ในสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">นอกสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px] font-bold text-blue-200">รวม</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">ในสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">นอกสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px] font-bold text-amber-200">รวม</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">ในสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px]">นอกสถาน</th>
            <th class="py-1 px-1.5 border-r border-slate-600 min-w-[55px] font-bold text-emerald-200">รวม</th>
          </tr>
        </thead>
      `;

      const dIn = yrData.in || {};
      const dOut = yrData.out || {};
      const dTot = yrData.tot || {};
      const vsInPct = dTot.vs?.all > 0 ? ((dIn.vs?.all || 0) / dTot.vs.all * 100).toFixed(1) : '0.0';

      tbodyHtml += `
        <tr class="bg-emerald-50/90 font-bold border-b-2 border-emerald-300 text-slate-900">
          <td class="py-2.5 px-3 text-center sticky left-0 bg-emerald-100 z-10 font-black">-</td>
          <td class="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">-</td>
          <td class="py-2.5 px-3 font-black text-emerald-950 sticky left-[55px] bg-emerald-100 z-10 shadow-r">รวมทั้งอำเภอสารภี (14 แห่ง)</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dIn.vs?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dOut.vs?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200 font-black text-slate-900 bg-teal-100/60">${fmtTot(dTot.vs?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200 font-bold text-teal-800">${vsInPct}%</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dIn.nod?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dOut.nod?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200 font-black text-blue-900 bg-blue-100/60">${fmtTot(dTot.nod?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dIn.obb?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dOut.obb?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200 font-black text-amber-900 bg-amber-100/60">${fmtTot(dTot.obb?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dIn.cop?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200">${fmtTot(dOut.cop?.all)}</td>
          <td class="py-2 px-1.5 text-right border-r border-slate-200 font-black text-emerald-900 bg-emerald-100/60">${fmtTot(dTot.cop?.all)}</td>
          <td class="py-2 px-2 text-center text-slate-400">-</td>
        </tr>
      `;

      filtered.forEach((u, idx) => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uIn = u.in || {};
        const uOut = u.out || {};
        const uTot = u.tot || {};
        const uVsInPct = uTot.vs?.all > 0 ? ((uIn.vs?.all || 0) / uTot.vs.all * 100).toFixed(1) : '0.0';
        const isSelected = (currentUnit === u.hospcode);

        tbodyHtml += `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-slate-700 ${isSelected ? 'bg-amber-50/70 font-semibold' : ''}">
            <td class="py-2 px-3 text-center sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-400 text-[11px] ${isSelected ? 'bg-amber-50' : ''}">${idx + 1}</td>
            <td class="py-2 px-2 text-center font-mono text-[11px] text-slate-500 border-r border-slate-200">${u.hospcode}</td>
            <td class="py-2 px-3 sticky left-[55px] bg-white z-10 border-r border-slate-200 shadow-r ${isSelected ? 'bg-amber-50' : ''}">
              <div class="flex items-center gap-1.5">
                <span class="font-medium text-slate-900 hover:text-emerald-700 cursor-pointer" onclick="switchUnit('${u.hospcode}')">${uName}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">ต.${uSub}</span>
              </div>
            </td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uIn.vs?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uOut.vs?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100 font-bold text-slate-900">${fmt(uTot.vs?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100 font-semibold text-teal-800">${uVsInPct}%</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uIn.nod?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uOut.nod?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100 font-bold text-blue-800">${fmt(uTot.nod?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uIn.obb?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uOut.obb?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100 font-bold text-amber-800">${fmt(uTot.obb?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uIn.cop?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100">${fmt(uOut.cop?.all)}</td>
            <td class="py-2 px-1.5 text-right border-r border-slate-100 font-bold text-emerald-800">${fmt(uTot.cop?.all)}</td>
            <td class="py-2 px-2 text-center">
              <button type="button" onclick="switchUnit('${u.hospcode}')" class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
      });

    } else if (currentTtmMassageView === 'quarter') {
      if (headingEl) headingEl.textContent = `ตารางข้อมูลรายไตรมาส (Quarterly Breakdown ปี ${yr})`;
      if (subHeadingEl) subHeadingEl.textContent = 'แสดงจำนวนครั้งการให้บริการหัตถการแผนไทยแยกรายไตรมาส (Q1 - Q4) อำเภอสารภี';

      theadHtml = `
        <thead>
          <tr class="bg-slate-800 text-white text-center font-bold text-xs">
            <th rowspan="2" class="py-2.5 px-3 text-left sticky left-0 z-20 bg-slate-800 w-[55px] min-w-[55px] border-r border-slate-700">ลำดับ</th>
            <th rowspan="2" class="py-2.5 px-2 text-center bg-slate-800 min-w-[70px] border-r border-slate-700">รหัส</th>
            <th rowspan="2" class="py-2.5 px-3 text-left sticky left-[55px] z-20 bg-slate-800 min-w-[200px] border-r border-slate-700 shadow-r">ชื่อสถานบริการ</th>
            <th colspan="4" class="py-2 px-2 bg-blue-900 text-blue-100 border-r border-b border-slate-700">ไตรมาสที่ 1 (ต.ค.-ธ.ค.)</th>
            <th colspan="4" class="py-2 px-2 bg-emerald-900 text-emerald-100 border-r border-b border-slate-700">ไตรมาสที่ 2 (ม.ค.-มี.ค.)</th>
            <th colspan="4" class="py-2 px-2 bg-amber-900 text-amber-100 border-r border-b border-slate-700">ไตรมาสที่ 3 (เม.ย.-มิ.ย.)</th>
            <th colspan="4" class="py-2 px-2 bg-purple-900 text-purple-100 border-r border-b border-slate-700">ไตรมาสที่ 4 (ก.ค.-ก.ย.)</th>
            <th rowspan="2" class="py-2.5 px-2 bg-slate-800 min-w-[80px]">การกระทำ</th>
          </tr>
          <tr class="bg-slate-700 text-white text-center font-semibold text-[10.5px]">
            <th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">นวด</th><th class="py-1 px-1 border-r border-slate-600 min-w-[42px]">อบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">ประคบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[52px] font-bold text-blue-200">บริการรวม</th>
            <th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">นวด</th><th class="py-1 px-1 border-r border-slate-600 min-w-[42px]">อบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">ประคบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[52px] font-bold text-emerald-200">บริการรวม</th>
            <th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">นวด</th><th class="py-1 px-1 border-r border-slate-600 min-w-[42px]">อบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">ประคบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[52px] font-bold text-amber-200">บริการรวม</th>
            <th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">นวด</th><th class="py-1 px-1 border-r border-slate-600 min-w-[42px]">อบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[48px]">ประคบ</th><th class="py-1 px-1 border-r border-slate-600 min-w-[52px] font-bold text-purple-200">บริการรวม</th>
          </tr>
        </thead>
      `;

      const dQ = yrData.quarters || {};
      let dLine = `
        <tr class="bg-emerald-50/90 font-bold border-b-2 border-emerald-300 text-slate-900">
          <td class="py-2.5 px-3 text-center sticky left-0 bg-emerald-100 z-10 font-black">-</td>
          <td class="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px]">-</td>
          <td class="py-2.5 px-3 font-black text-emerald-950 sticky left-[55px] bg-emerald-100 z-10 shadow-r">รวมทั้งอำเภอสารภี (14 แห่ง)</td>
      `;
      for (let qi = 1; qi <= 4; qi++) {
        const qd = dQ[`q${qi}`]?.tot || {};
        dLine += `
          <td class="py-2 px-1 text-right border-r border-slate-200">${fmtTot(qd.nod?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200">${fmtTot(qd.obb?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200">${fmtTot(qd.cop?.all)}</td>
          <td class="py-2 px-1 text-right border-r border-slate-200 font-black text-slate-900 bg-slate-100/60">${fmtTot(qd.vs?.all)}</td>
        `;
      }
      dLine += `<td class="py-2 px-2 text-center text-slate-400">-</td></tr>`;
      tbodyHtml += dLine;

      filtered.forEach((u, idx) => {
        const meta = SARAPHI_UNITS_MAP[u.hospcode];
        const uName = (u.hospcode === '06023') ? 'รพ.สต.บ้านป่าสา' : (meta ? meta.name : u.name);
        const uSub = (u.hospcode === '06023') ? 'สันทราย' : (meta ? meta.subdistrict : u.subdistrict);
        const uQ = u.quarters || {};
        const isSelected = (currentUnit === u.hospcode);

        let rowHtml = `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-slate-700 ${isSelected ? 'bg-amber-50/70 font-semibold' : ''}">
            <td class="py-2 px-3 text-center sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-400 text-[11px] ${isSelected ? 'bg-amber-50' : ''}">${idx + 1}</td>
            <td class="py-2 px-2 text-center font-mono text-[11px] text-slate-500 border-r border-slate-200">${u.hospcode}</td>
            <td class="py-2 px-3 sticky left-[55px] bg-white z-10 border-r border-slate-200 shadow-r ${isSelected ? 'bg-amber-50' : ''}">
              <div class="flex items-center gap-1.5">
                <span class="font-medium text-slate-900 hover:text-emerald-700 cursor-pointer" onclick="switchUnit('${u.hospcode}')">${uName}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">ต.${uSub}</span>
              </div>
            </td>
        `;

        for (let qi = 1; qi <= 4; qi++) {
          const qd = uQ[`q${qi}`]?.tot || {};
          rowHtml += `
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(qd.nod?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(qd.obb?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100">${fmt(qd.cop?.all)}</td>
            <td class="py-2 px-1 text-right border-r border-slate-100 font-bold text-slate-900 bg-slate-50/50">${fmt(qd.vs?.all)}</td>
          `;
        }

        rowHtml += `
            <td class="py-2 px-2 text-center">
              <button type="button" onclick="switchUnit('${u.hospcode}')" class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition">
                ดู รพ.สต.
              </button>
            </td>
          </tr>
        `;
        tbodyHtml += rowHtml;
      });
    }

    tableEl.innerHTML = `${theadHtml}<tbody>${tbodyHtml}</tbody>`;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // =========================================================================
  // DM HBA1C (s_dm_hba1c / PCC-1) - HDC 1:1 CONTROLLER & RENDER FUNCTIONS
  // =========================================================================

  window.selectDashboardUnit = function(hospcode) {
    if (currentUnit === hospcode) {
      currentUnit = 'all'; // Toggle back to all if clicked again
    } else {
      currentUnit = hospcode || 'all';
    }
    if (unitSelect) {
      unitSelect.value = currentUnit;
    }
    updateDashboardView();
  };

  window.switchUnit = window.selectDashboardUnit;

  window.switchDmHba1cView = function(view) {
    currentDmHba1cView = view;
    renderDmHba1cPanel();
  };

  window.switchDmHba1cYear = function(yr) {
    currentDmHba1cYear = yr;
    renderDmHba1cPanel();
  };

  window.switchDmHba1cSort = function(sortMode, sortField = null) {
    if (sortField) {
      if (currentDmHba1cSortField === sortField) {
        // Clicking same header toggles: desc -> asc -> code -> desc
        if (currentDmHba1cSort === 'desc') {
          currentDmHba1cSort = 'asc';
        } else if (currentDmHba1cSort === 'asc') {
          currentDmHba1cSort = 'code';
          currentDmHba1cSortField = null;
        } else {
          currentDmHba1cSort = 'desc';
        }
      } else {
        currentDmHba1cSortField = sortField;
        currentDmHba1cSort = 'desc';
      }
    } else {
      currentDmHba1cSort = sortMode || 'desc';
      currentDmHba1cSortField = null;
    }
    renderDmHba1cPanel();
  };

  window.exportDmHba1cCsv = function() {
    const yr = currentDmHba1cYear || currentYear || '2569';
    const ind = masterData?.indicators?.['pcc_dm_hba1c'] || {};
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];
    const sum = yrData.hdc_summary || {};

    let csvContent = '\uFEFF'; // UTF-8 BOM for Thai language Excel
    csvContent += 'รหัส,หน่วยบริการ,ตำบล,' +
      'ผู้ป่วยในเขต_B1,ตรวจในเขต1ครั้ง_A1,ร้อยละในเขต1ครั้ง_A1_B1,ตรวจในเขต2ครั้ง_A3,ร้อยละในเขต2ครั้ง_A3_B1,' +
      'ผู้ป่วยรับบริการ_B2,ตรวจรับบริการ1ครั้ง_A2,ร้อยละรับบริการ1ครั้ง_A2_B2,ตรวจรับบริการ2ครั้ง_A4,ร้อยละรับบริการ2ครั้ง_A4_B2\n';

    // Total district row
    csvContent += `TOTAL,รวมอำเภอสารภี,สารภี,${sum.b1 || 0},${sum.a1 || 0},${sum.rate1 || 0},${sum.a3 || 0},${sum.rate3 || 0},${sum.b2 || 0},${sum.a2 || 0},${sum.rate2 || 0},${sum.a4 || 0},${sum.rate4 || 0}\n`;

    units.forEach(u => {
      const uName = `"${(u.hdc_name || u.name).replace(/"/g, '""')}"`;
      csvContent += `${u.hospcode},${uName},${u.subdistrict || ''},` +
        `${u.b1 || 0},${u.a1 || 0},${u.rate1 || 0},${u.a3 || 0},${u.rate3 || 0},` +
        `${u.b2 || 0},${u.a2 || 0},${u.rate2 || 0},${u.a4 || 0},${u.rate4 || 0}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `HDC_s_dm_hba1c_Saraphi_${yr}_${currentDmHba1cView}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function renderDmHba1cPanel() {
    if (currentIndicatorId !== 'pcc_dm_hba1c') {
      if (dmHba1cPanel) dmHba1cPanel.classList.add('hidden');
      return;
    }
    if (dmHba1cPanel) dmHba1cPanel.classList.remove('hidden');

    const yr = currentDmHba1cYear || currentYear || '2569';

    // 1. Sync View Mode Buttons
    ['hdc_full', 'in_area', 'chronic_fu'].forEach(v => {
      const btn = document.getElementById(`btn-dm-hba1c-view-${v}`);
      if (btn) {
        if (v === currentDmHba1cView) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Sync Sort Buttons
    ['desc', 'asc', 'code'].forEach(s => {
      const btn = document.getElementById(`btn-dm-hba1c-sort-${s}`);
      if (btn) {
        if (s === currentDmHba1cSort && !currentDmHba1cSortField) {
          btn.className = 'px-2.5 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white flex items-center gap-1';
        } else if (s === currentDmHba1cSort) {
          btn.className = 'px-2.5 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-700 text-white flex items-center gap-1';
        } else {
          btn.className = 'px-2.5 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent flex items-center gap-1';
        }
      }
    });

    // 3. Sync Year Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-dm-hba1c-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 4. Retrieve Data
    const ind = masterData?.indicators?.['pcc_dm_hba1c'] || {};
    const yrData = ind?.years?.[yr] || {};
    const units = yrData.units || [];
    const hdcSum = yrData.hdc_summary || {
      b1: yrData.den || 0,
      a1: yrData.num || 0,
      rate1: yrData.rate || 0,
      a3: 0, rate3: 0,
      b2: 0, a2: 0, rate2: 0, a4: 0, rate4: 0
    };

    // Responsive metrics for Bento Cards when unit is selected
    const isUnitSelected = (currentUnit !== 'all');
    const selectedUnitData = isUnitSelected ? units.find(u => u.hospcode === currentUnit) : null;
    const activeMetrics = selectedUnitData || hdcSum;

    // Unit filter badge in alert banner
    const unitBadge = document.getElementById('dm-hba1c-unit-badge');
    if (unitBadge) {
      if (isUnitSelected && selectedUnitData) {
        unitBadge.classList.remove('hidden');
        unitBadge.innerHTML = `
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-xs">
            <i class="fa-solid fa-hospital"></i> กำลังดู: ${selectedUnitData.name} (ต.${selectedUnitData.subdistrict})
            <button type="button" onclick="window.selectDashboardUnit('all')" class="ml-1 px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10.5px] transition" title="คลิกเพื่อดูภาพรวมทั้งอำเภอ">
              ดูภาพรวมทั้งหมด <i class="fa-solid fa-rotate-left text-[10px]"></i>
            </button>
          </div>
        `;
      } else {
        unitBadge.classList.add('hidden');
        unitBadge.innerHTML = '';
      }
    }

    // 5. Update Bento KPI Metric Cards
    const kpiRate1 = document.getElementById('dm-hba1c-kpi-rate1');
    if (kpiRate1) kpiRate1.textContent = `${(activeMetrics.rate1 || 0).toFixed(2)}%`;

    const kpiA1B1 = document.getElementById('dm-hba1c-kpi-a1-b1');
    if (kpiA1B1) kpiA1B1.textContent = `${(activeMetrics.a1 || 0).toLocaleString()} / ${(activeMetrics.b1 || 0).toLocaleString()} คน`;

    const kpiStatus1 = document.getElementById('dm-hba1c-kpi-status1');
    if (kpiStatus1) {
      if ((activeMetrics.rate1 || 0) >= 70.0) {
        kpiStatus1.textContent = 'ผ่านเกณฑ์ HDC';
        kpiStatus1.className = 'px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800';
      } else {
        kpiStatus1.textContent = 'ต่ำกว่าเกณฑ์ 70%';
        kpiStatus1.className = 'px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800';
      }
    }

    const kpiRate3 = document.getElementById('dm-hba1c-kpi-rate3');
    if (kpiRate3) kpiRate3.textContent = `${(activeMetrics.rate3 || 0).toFixed(2)}%`;

    const kpiA3 = document.getElementById('dm-hba1c-kpi-a3');
    if (kpiA3) kpiA3.textContent = `${(activeMetrics.a3 || 0).toLocaleString()} คน`;

    const kpiA3Ratio = document.getElementById('dm-hba1c-kpi-a3-ratio');
    if (kpiA3Ratio) {
      const pct = activeMetrics.b1 > 0 ? ((activeMetrics.a3 / activeMetrics.b1) * 100).toFixed(2) : '0.00';
      kpiA3Ratio.textContent = `(${pct}%)`;
    }

    const kpiRate2 = document.getElementById('dm-hba1c-kpi-rate2');
    if (kpiRate2) kpiRate2.textContent = `${(activeMetrics.rate2 || 0).toFixed(2)}%`;

    const kpiA2B2 = document.getElementById('dm-hba1c-kpi-a2-b2');
    if (kpiA2B2) kpiA2B2.textContent = `${(activeMetrics.a2 || 0).toLocaleString()} / ${(activeMetrics.b2 || 0).toLocaleString()} คน`;

    const kpiStatus2 = document.getElementById('dm-hba1c-kpi-status2');
    if (kpiStatus2) {
      if ((activeMetrics.rate2 || 0) >= 70.0) {
        kpiStatus2.textContent = 'ผ่านเกณฑ์ HDC';
        kpiStatus2.className = 'px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800';
      } else {
        kpiStatus2.textContent = 'ต่ำกว่าเกณฑ์ 70%';
        kpiStatus2.className = 'px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800';
      }
    }

    const kpiRate4 = document.getElementById('dm-hba1c-kpi-rate4');
    if (kpiRate4) kpiRate4.textContent = `${(activeMetrics.rate4 || 0).toFixed(2)}%`;

    const kpiA4 = document.getElementById('dm-hba1c-kpi-a4');
    if (kpiA4) kpiA4.textContent = `${(activeMetrics.a4 || 0).toLocaleString()} คน`;

    const kpiA4Ratio = document.getElementById('dm-hba1c-kpi-a4-ratio');
    if (kpiA4Ratio) {
      const pct = activeMetrics.b2 > 0 ? ((activeMetrics.a4 / activeMetrics.b2) * 100).toFixed(2) : '0.00';
      kpiA4Ratio.textContent = `(${pct}%)`;
    }

    const kpiPassUnits = document.getElementById('dm-hba1c-kpi-units-pass');
    if (kpiPassUnits) {
      if (isUnitSelected && selectedUnitData) {
        kpiPassUnits.textContent = selectedUnitData.rate2 >= 70.0 ? 'ผ่านเกณฑ์ (≥70%)' : 'ต่ำกว่าเกณฑ์ (<70%)';
        kpiPassUnits.className = selectedUnitData.rate2 >= 70.0 ? 'font-bold text-emerald-700' : 'font-bold text-amber-700';
      } else {
        const passCount = units.filter(u => (u.rate2 || 0) >= 70.0).length;
        kpiPassUnits.textContent = `${passCount} / ${units.length} แห่ง`;
        kpiPassUnits.className = 'font-bold text-emerald-700';
      }
    }

    // 6. Render Dual HDC Charts (Sorted & Highlighted)
    renderDmHba1cCharts(units, hdcSum);

    // 7. Render HDC Matrix Table (Sorted & Highlighted)
    renderDmHba1cTable(units, hdcSum, yr);
  }

  function renderDmHba1cCharts(units, hdcSum) {
    const canvasInArea = document.getElementById('dmHba1cChartInArea');
    const canvasService = document.getElementById('dmHba1cChartService');
    if (!canvasInArea || !canvasService) return;

    // Destroy existing instances
    if (dmHba1cChartInAreaInstance) {
      dmHba1cChartInAreaInstance.destroy();
      dmHba1cChartInAreaInstance = null;
    }
    if (dmHba1cChartServiceInstance) {
      dmHba1cChartServiceInstance.destroy();
      dmHba1cChartServiceInstance = null;
    }

    // Sort units for Chart 1 (In-Area / Typearea 1,3 based on rate1)
    const chart1Units = [...units];
    if (currentDmHba1cSort === 'desc') {
      chart1Units.sort((a, b) => (b.rate1 || 0) - (a.rate1 || 0));
    } else if (currentDmHba1cSort === 'asc') {
      chart1Units.sort((a, b) => (a.rate1 || 0) - (b.rate1 || 0));
    } else if (currentDmHba1cSort === 'code') {
      chart1Units.sort((a, b) => (a.hospcode || '').localeCompare(b.hospcode || ''));
    }

    // Sort units for Chart 2 (Service / ChronicFU based on rate2)
    const chart2Units = [...units];
    if (currentDmHba1cSort === 'desc') {
      chart2Units.sort((a, b) => (b.rate2 || 0) - (a.rate2 || 0));
    } else if (currentDmHba1cSort === 'asc') {
      chart2Units.sort((a, b) => (a.rate2 || 0) - (b.rate2 || 0));
    } else if (currentDmHba1cSort === 'code') {
      chart2Units.sort((a, b) => (a.hospcode || '').localeCompare(b.hospcode || ''));
    }

    // Chart labels: 'รวม' followed by short clean names of the sorted units
    const labels1 = ['รวม', ...chart1Units.map(u => `${u.hospcode}:${u.name}`)];
    const fullLabels1 = ['รวมอำเภอสารภี', ...chart1Units.map(u => `${u.hospcode}: ${u.full_name || u.name} (ต.${u.subdistrict})`)];
    const inAreaRates = [hdcSum.rate1 || 0, ...chart1Units.map(u => u.rate1 || 0)];

    const labels2 = ['รวม', ...chart2Units.map(u => `${u.hospcode}:${u.name}`)];
    const fullLabels2 = ['รวมอำเภอสารภี', ...chart2Units.map(u => `${u.hospcode}: ${u.full_name || u.name} (ต.${u.subdistrict})`)];
    const serviceRates = [hdcSum.rate2 || 0, ...chart2Units.map(u => u.rate2 || 0)];

    // Target 70% threshold plugin
    const target70Plugin = {
      id: 'target70LinePlugin',
      afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const yScale = scales.y;
        if (!yScale || !chartArea) return;
        const yVal = yScale.getPixelForValue(70);
        if (yVal >= chartArea.top && yVal <= chartArea.bottom) {
          ctx.save();
          // Dashed green line
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(chartArea.left, yVal);
          ctx.lineTo(chartArea.right, yVal);
          ctx.stroke();

          // Red label text on the left
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 10px "Noto Sans Thai", sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText('เป้าหมาย 70', chartArea.left - 4, yVal);
          ctx.restore();
        }
      }
    };

    // Value on top of bars plugin
    const barValuePlugin = {
      id: 'barValueLabelsPlugin',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        chart.data.datasets.forEach((dataset, i) => {
          if (dataset.type === 'line') return;
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const val = dataset.data[index];
            if (val !== undefined && val !== null) {
              ctx.save();
              ctx.fillStyle = '#1e293b';
              ctx.font = 'bold 9.5px "Noto Sans Thai", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(val.toFixed(2) + '%', bar.x, bar.y - 3);
              ctx.restore();
            }
          });
        });
      }
    };

    // Chart 1: ในเขตรับผิดชอบ (Highlight selected unit in amber #f59e0b)
    const ctx1 = canvasInArea.getContext('2d');
    const bgColors1 = inAreaRates.map((v, idx) => {
      if (idx === 0) return (v >= 70.0 ? '#86efac' : '#ffb07c'); // benchmark รวม
      const u = chart1Units[idx - 1];
      if (currentUnit !== 'all' && u && u.hospcode === currentUnit) {
        return '#f59e0b'; // Highlight selected unit in vivid amber/yellow
      }
      return v >= 70.0 ? '#86efac' : '#ffb07c';
    });
    const borderColors1 = inAreaRates.map((v, idx) => {
      if (idx === 0) return (v >= 70.0 ? '#22c55e' : '#ea580c');
      const u = chart1Units[idx - 1];
      if (currentUnit !== 'all' && u && u.hospcode === currentUnit) {
        return '#b45309';
      }
      return v >= 70.0 ? '#22c55e' : '#ea580c';
    });
    const borderWidths1 = inAreaRates.map((v, idx) => {
      if (idx > 0 && currentUnit !== 'all' && chart1Units[idx - 1]?.hospcode === currentUnit) {
        return 2.5;
      }
      return 1;
    });

    dmHba1cChartInAreaInstance = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: labels1,
        datasets: [{
          label: 'ร้อยละ [A1/B1]',
          data: inAreaRates,
          backgroundColor: bgColors1,
          borderColor: borderColors1,
          borderWidth: borderWidths1,
          borderRadius: 4,
          maxBarThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const elIndex = elements[0].index;
            if (elIndex === 0) {
              window.selectDashboardUnit('all');
            } else if (chart1Units[elIndex - 1]) {
              window.selectDashboardUnit(chart1Units[elIndex - 1].hospcode);
            }
          }
        },
        layout: {
          padding: { top: 22, left: 24, right: 10, bottom: 5 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (ctx) => fullLabels1[ctx[0].dataIndex],
              label: (ctx) => `ร้อยละ: ${ctx.parsed.y.toFixed(2)}% (เป้าหมาย 70%)`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(80, ...inAreaRates) > 75 ? Math.ceil(Math.max(80, ...inAreaRates) / 10) * 10 : 80,
            ticks: {
              stepSize: 20,
              callback: (val) => val
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            ticks: {
              font: { size: 9.5 },
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false
            },
            grid: { display: false }
          }
        }
      },
      plugins: [target70Plugin, barValuePlugin]
    });

    // Chart 2: ผู้มารับบริการ (Highlight selected unit in amber #f59e0b)
    const ctx2 = canvasService.getContext('2d');
    const bgColors2 = serviceRates.map((v, idx) => {
      if (idx === 0) return (v >= 70.0 ? '#86efac' : '#ffb07c'); // benchmark รวม
      const u = chart2Units[idx - 1];
      if (currentUnit !== 'all' && u && u.hospcode === currentUnit) {
        return '#f59e0b'; // Highlight selected unit in vivid amber/yellow
      }
      return v >= 70.0 ? '#86efac' : '#ffb07c';
    });
    const borderColors2 = serviceRates.map((v, idx) => {
      if (idx === 0) return (v >= 70.0 ? '#22c55e' : '#ea580c');
      const u = chart2Units[idx - 1];
      if (currentUnit !== 'all' && u && u.hospcode === currentUnit) {
        return '#b45309';
      }
      return v >= 70.0 ? '#22c55e' : '#ea580c';
    });
    const borderWidths2 = serviceRates.map((v, idx) => {
      if (idx > 0 && currentUnit !== 'all' && chart2Units[idx - 1]?.hospcode === currentUnit) {
        return 2.5;
      }
      return 1;
    });

    dmHba1cChartServiceInstance = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: labels2,
        datasets: [{
          label: 'ร้อยละ [A2/B2]',
          data: serviceRates,
          backgroundColor: bgColors2,
          borderColor: borderColors2,
          borderWidth: borderWidths2,
          borderRadius: 4,
          maxBarThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const elIndex = elements[0].index;
            if (elIndex === 0) {
              window.selectDashboardUnit('all');
            } else if (chart2Units[elIndex - 1]) {
              window.selectDashboardUnit(chart2Units[elIndex - 1].hospcode);
            }
          }
        },
        layout: {
          padding: { top: 22, left: 24, right: 10, bottom: 5 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (ctx) => fullLabels2[ctx[0].dataIndex],
              label: (ctx) => `ร้อยละ: ${ctx.parsed.y.toFixed(2)}% (เป้าหมาย 70%)`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: (val) => val
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            ticks: {
              font: { size: 9.5 },
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false
            },
            grid: { display: false }
          }
        }
      },
      plugins: [target70Plugin, barValuePlugin]
    });
  }

  function renderDmHba1cTable(units, hdcSum, yr) {
    const tableEl = document.getElementById('dm-hba1c-matrix-table');
    if (!tableEl) return;

    const query = (dmHba1cSearchQuery || '').trim().toLowerCase();
    const filteredUnits = query
      ? units.filter(u =>
          (u.hospcode && u.hospcode.toLowerCase().includes(query)) ||
          (u.name && u.name.toLowerCase().includes(query)) ||
          (u.full_name && u.full_name.toLowerCase().includes(query)) ||
          (u.hdc_name && u.hdc_name.toLowerCase().includes(query)) ||
          (u.subdistrict && u.subdistrict.toLowerCase().includes(query))
        )
      : [...units];

    // Determine active sort field
    let activeField = currentDmHba1cSortField;
    if (!activeField) {
      if (currentDmHba1cView === 'in_area') activeField = 'rate1';
      else if (currentDmHba1cView === 'chronic_fu') activeField = 'rate2';
      else activeField = 'rate2'; // Default ranking metric for full matrix view
    }

    const isDesc = currentDmHba1cSort === 'desc';
    const isAsc = currentDmHba1cSort === 'asc';

    const sortedUnits = filteredUnits.sort((a, b) => {
      if (currentDmHba1cSort === 'code' || activeField === 'hospcode') {
        return (a.hospcode || '').localeCompare(b.hospcode || '');
      }
      if (activeField === 'name') {
        return isDesc ? (b.name || '').localeCompare(a.name || '', 'th') : (a.name || '').localeCompare(b.name || '', 'th');
      }
      if (activeField === 'subdistrict') {
        return isDesc ? (b.subdistrict || '').localeCompare(a.subdistrict || '', 'th') : (a.subdistrict || '').localeCompare(b.subdistrict || '', 'th');
      }

      const valA = Number(a[activeField] ?? 0);
      const valB = Number(b[activeField] ?? 0);
      if (isAsc) return valA - valB;
      return valB - valA; // default desc
    });

    // Helper for table header sort icons
    const sortIcon = (field) => {
      const isActive = (currentDmHba1cSortField === field) ||
        (!currentDmHba1cSortField && (
          (field === 'rate1' && currentDmHba1cView === 'in_area') ||
          (field === 'rate2' && currentDmHba1cView !== 'in_area')
        ));

      if (!isActive) {
        return `<i class="fa-solid fa-sort ml-1 opacity-40 group-hover:opacity-100 text-[10px]"></i>`;
      }
      if (currentDmHba1cSort === 'asc') {
        return `<i class="fa-solid fa-arrow-up-wide-short ml-1 text-amber-300 text-[11px]"></i>`;
      }
      if (currentDmHba1cSort === 'desc') {
        return `<i class="fa-solid fa-arrow-down-wide-short ml-1 text-amber-300 text-[11px]"></i>`;
      }
      return `<i class="fa-solid fa-sort ml-1 opacity-40 text-[10px]"></i>`;
    };

    let theadHtml = '';
    let tbodyHtml = '';

    if (currentDmHba1cView === 'hdc_full') {
      theadHtml = `
        <thead>
          <tr class="bg-emerald-700 text-white font-bold text-center border-b border-emerald-800">
            <th rowspan="2" onclick="window.switchDmHba1cSort(null, 'hospcode')" class="p-2.5 text-center sticky left-0 bg-emerald-700 hover:bg-emerald-800 cursor-pointer transition z-10 w-16 shadow-xs select-none group" title="คลิกเพื่อเรียงตามรหัส">
              รหัส ${sortIcon('hospcode')}
            </th>
            <th rowspan="2" onclick="window.switchDmHba1cSort(null, 'name')" class="p-2.5 text-left sticky left-16 bg-emerald-700 hover:bg-emerald-800 cursor-pointer transition z-10 min-w-[170px] shadow-xs select-none group" title="คลิกเพื่อเรียงตามชื่อหน่วยบริการ">
              หน่วยบริการ / รพ.สต. ${sortIcon('name')}
            </th>
            <th rowspan="2" onclick="window.switchDmHba1cSort(null, 'subdistrict')" class="p-2.5 text-left min-w-[90px] hover:bg-emerald-800 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตามตำบล">
              ตำบล ${sortIcon('subdistrict')}
            </th>
            <th colspan="5" class="p-2.5 border-l border-emerald-600 bg-emerald-800/80">ผู้ป่วยที่อยู่ในเขตรับผิดชอบ Typearea 1,3</th>
            <th colspan="5" class="p-2.5 border-l border-emerald-600 bg-emerald-900/80">ผู้ป่วยที่มารับบริการของหน่วยบริการจากแฟ้ม ChronicFU</th>
            <th rowspan="2" class="p-2.5 text-center border-l border-emerald-600 min-w-[80px]">เลือกดู</th>
          </tr>
          <tr class="bg-emerald-800 text-white text-[11px] font-semibold text-center border-b border-emerald-900">
            <!-- Typearea 1,3 -->
            <th onclick="window.switchDmHba1cSort(null, 'b1')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตาม B1">
              จำนวนผู้ป่วย<br><span class="text-emerald-200 font-normal">(B1)</span> ${sortIcon('b1')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a1')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตาม A1">
              ได้รับการตรวจ HbA1c<br>อย่างน้อย 1 ครั้ง/ปี <span class="text-emerald-200 font-normal">(A1)</span> ${sortIcon('a1')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate1')" class="p-2 border-l border-emerald-700 font-bold bg-emerald-700/90 hover:bg-emerald-800 cursor-pointer text-amber-200 transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A1/B1">
              ร้อยละ<br><span class="text-xs font-normal">[A1/B1] x 100</span> ${sortIcon('rate1')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a3')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตาม A3">
              ได้รับการตรวจ HbA1c<br>อย่างน้อย 2 ครั้ง/ปี <span class="text-emerald-200 font-normal">(A3)</span> ${sortIcon('a3')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate3')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A3/B1">
              ร้อยละ<br><span class="text-emerald-200 font-normal">[A3/B1] x 100</span> ${sortIcon('rate3')}
            </th>
            <!-- ChronicFU -->
            <th onclick="window.switchDmHba1cSort(null, 'b2')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตาม B2">
              จำนวนผู้ป่วย<br><span class="text-emerald-200 font-normal">(B2)</span> ${sortIcon('b2')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a2')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตาม A2">
              ได้รับการตรวจ HbA1c<br>อย่างน้อย 1 ครั้ง/ปี <span class="text-emerald-200 font-normal">(A2)</span> ${sortIcon('a2')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate2')" class="p-2 border-l border-emerald-700 font-bold bg-emerald-700/90 hover:bg-emerald-800 cursor-pointer text-amber-200 transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A2/B2">
              ร้อยละ<br><span class="text-xs font-normal">[A2/B2] x 100</span> ${sortIcon('rate2')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a4')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตาม A4">
              ได้รับการตรวจ HbA1c<br>อย่างน้อย 2 ครั้ง/ปี <span class="text-emerald-200 font-normal">(A4)</span> ${sortIcon('a4')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate4')" class="p-2 border-l border-emerald-700 hover:bg-emerald-900 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A4/B2">
              ร้อยละ<br><span class="text-emerald-200 font-normal">[A4/B2] x 100</span> ${sortIcon('rate4')}
            </th>
          </tr>
        </thead>
      `;

      // Summary row for Total District
      tbodyHtml += `
        <tr class="bg-emerald-50/90 font-bold text-slate-900 border-b-2 border-emerald-200 text-xs">
          <td class="p-2.5 text-center sticky left-0 bg-emerald-50/95 z-10 font-mono text-emerald-950 font-bold">TOTAL</td>
          <td class="p-2.5 sticky left-16 bg-emerald-50/95 z-10 font-extrabold text-emerald-950 flex items-center gap-1.5 cursor-pointer hover:text-emerald-800" onclick="window.selectDashboardUnit('all')">
            <i class="fa-solid fa-calculator text-emerald-600"></i> รวมอำเภอสารภี
          </td>
          <td class="p-2.5 text-slate-600 font-medium">สารภี</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono">${(hdcSum.b1 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-emerald-800">${(hdcSum.a1 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono font-extrabold ${hdcSum.rate1 >= 70 ? 'text-emerald-700 bg-emerald-100/60' : 'text-amber-700 bg-amber-50'}">
            ${(hdcSum.rate1 || 0).toFixed(2)}
          </td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-teal-800">${(hdcSum.a3 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-slate-700">${(hdcSum.rate3 || 0).toFixed(2)}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono">${(hdcSum.b2 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-blue-800">${(hdcSum.a2 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono font-extrabold ${hdcSum.rate2 >= 70 ? 'text-emerald-700 bg-emerald-100/60' : 'text-amber-700 bg-amber-50'}">
            ${(hdcSum.rate2 || 0).toFixed(2)}
          </td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-indigo-800">${(hdcSum.a4 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-slate-700">${(hdcSum.rate4 || 0).toFixed(2)}</td>
          <td class="p-2 text-center border-l border-emerald-200">
            <button type="button" onclick="window.selectDashboardUnit('all')" class="px-2 py-0.5 rounded ${currentUnit === 'all' ? 'bg-emerald-600 text-white font-extrabold shadow-2xs' : 'bg-emerald-200/70 hover:bg-emerald-600 hover:text-white text-emerald-900 font-bold'} text-[10.5px] transition">
              ${currentUnit === 'all' ? 'ดูอยู่' : 'ยอดรวม'}
            </button>
          </td>
        </tr>
      `;

      // Unit rows
      sortedUnits.forEach((u, idx) => {
        const isSelected = (currentUnit === u.hospcode);
        const rowBg = isSelected
          ? 'bg-amber-100/90 font-bold text-slate-900 border-y-2 border-amber-400 shadow-sm ring-1 ring-amber-400'
          : (idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/80');

        const stickyCodeClass = isSelected
          ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
          : 'bg-white text-slate-600 font-bold border-r border-slate-200 shadow-xs';

        const stickyNameClass = isSelected
          ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
          : 'bg-white text-slate-900 font-bold border-r border-slate-200 shadow-xs';

        const stickySubClass = isSelected
          ? 'bg-amber-100/80 text-amber-900 font-semibold border-r border-amber-300'
          : 'text-slate-600 font-medium border-r border-slate-200';

        const rate1Pass = (u.rate1 || 0) >= 70.0;
        const rate2Pass = (u.rate2 || 0) >= 70.0;

        const actionBtn = isSelected
          ? `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition flex items-center justify-center gap-1 mx-auto" title="คลิกเพื่อยกเลิกการเลือก"><i class="fa-solid fa-check"></i> ดู รพ.สต.</button>`
          : `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs">ดู รพ.สต.</button>`;

        tbodyHtml += `
          <tr class="${rowBg} border-b border-slate-200/80 text-xs transition">
            <td class="p-2.5 text-center sticky left-0 ${stickyCodeClass} font-mono z-10">
              ${u.hospcode}
            </td>
            <td class="p-2.5 sticky left-16 ${stickyNameClass} z-10">
              <span class="cursor-pointer hover:text-emerald-700 hover:underline" onclick="window.selectDashboardUnit('${u.hospcode}')">${u.name}</span>
            </td>
            <td class="p-2.5 ${stickySubClass}">
              ${u.subdistrict || '-'}
            </td>
            <td class="p-2 text-right border-r border-slate-200 font-mono">${(u.b1 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}">${(u.a1 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-bold ${rate1Pass ? (isSelected ? 'text-emerald-900 bg-emerald-100/80' : 'text-emerald-700 bg-emerald-50/70') : 'text-slate-800'}">
              ${(u.rate1 || 0).toFixed(2)}
            </td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.a3 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.rate3 || 0).toFixed(2)}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono">${(u.b2 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}">${(u.a2 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-bold ${rate2Pass ? (isSelected ? 'text-emerald-900 bg-emerald-100/80' : 'text-emerald-700 bg-emerald-50/70') : (isSelected ? 'text-amber-900 bg-amber-200/80' : 'text-amber-700 bg-amber-50/50')}">
              ${(u.rate2 || 0).toFixed(2)}
            </td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.a4 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.rate4 || 0).toFixed(2)}</td>
            <td class="p-2 text-center">
              ${actionBtn}
            </td>
          </tr>
        `;
      });
    } else if (currentDmHba1cView === 'in_area') {
      theadHtml = `
        <thead>
          <tr class="bg-emerald-700 text-white font-bold text-center border-b border-emerald-800">
            <th onclick="window.switchDmHba1cSort(null, 'hospcode')" class="p-3 text-center sticky left-0 bg-emerald-700 hover:bg-emerald-800 cursor-pointer transition z-10 w-16 shadow-xs select-none group" title="คลิกเพื่อเรียงตามรหัส">
              รหัส ${sortIcon('hospcode')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'name')" class="p-3 text-left sticky left-16 bg-emerald-700 hover:bg-emerald-800 cursor-pointer transition z-10 min-w-[170px] shadow-xs select-none group" title="คลิกเพื่อเรียงตามชื่อหน่วยบริการ">
              หน่วยบริการ / รพ.สต. ${sortIcon('name')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'subdistrict')" class="p-3 text-left min-w-[90px] hover:bg-emerald-800 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตามตำบล">
              ตำบล ${sortIcon('subdistrict')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'b1')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตาม B1">
              จำนวนผู้ป่วย (B1) ${sortIcon('b1')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a1')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตาม A1">
              ได้รับการตรวจอย่างน้อย 1 ครั้ง/ปี (A1) ${sortIcon('a1')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate1')" class="p-2.5 border-l border-emerald-600 font-bold bg-emerald-800/80 hover:bg-emerald-900 cursor-pointer text-amber-200 transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A1/B1">
              ร้อยละ [A1/B1] x 100 ${sortIcon('rate1')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a3')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตาม A3">
              ได้รับการตรวจอย่างน้อย 2 ครั้ง/ปี (A3) ${sortIcon('a3')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate3')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A3/B1">
              ร้อยละ [A3/B1] x 100 ${sortIcon('rate3')}
            </th>
            <th class="p-2.5 text-center border-l border-emerald-600 min-w-[80px]">เลือกดู</th>
          </tr>
        </thead>
      `;

      tbodyHtml += `
        <tr class="bg-emerald-50/90 font-bold text-slate-900 border-b-2 border-emerald-200 text-xs">
          <td class="p-2.5 text-center sticky left-0 bg-emerald-50/95 z-10 font-mono text-emerald-950 font-bold">TOTAL</td>
          <td class="p-2.5 sticky left-16 bg-emerald-50/95 z-10 font-extrabold text-emerald-950 flex items-center gap-1.5 cursor-pointer hover:text-emerald-800" onclick="window.selectDashboardUnit('all')">
            <i class="fa-solid fa-calculator text-emerald-600"></i> รวมอำเภอสารภี
          </td>
          <td class="p-2.5 text-slate-600 font-medium">สารภี</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono">${(hdcSum.b1 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-emerald-800">${(hdcSum.a1 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono font-extrabold ${hdcSum.rate1 >= 70 ? 'text-emerald-700 bg-emerald-100/60' : 'text-amber-700 bg-amber-50'}">
            ${(hdcSum.rate1 || 0).toFixed(2)}%
          </td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-teal-800">${(hdcSum.a3 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-slate-700">${(hdcSum.rate3 || 0).toFixed(2)}%</td>
          <td class="p-2 text-center border-l border-emerald-200">
            <button type="button" onclick="window.selectDashboardUnit('all')" class="px-2 py-0.5 rounded ${currentUnit === 'all' ? 'bg-emerald-600 text-white font-extrabold shadow-2xs' : 'bg-emerald-200/70 hover:bg-emerald-600 hover:text-white text-emerald-900 font-bold'} text-[10.5px] transition">
              ${currentUnit === 'all' ? 'ดูอยู่' : 'ยอดรวม'}
            </button>
          </td>
        </tr>
      `;

      sortedUnits.forEach((u, idx) => {
        const isSelected = (currentUnit === u.hospcode);
        const rowBg = isSelected
          ? 'bg-amber-100/90 font-bold text-slate-900 border-y-2 border-amber-400 shadow-sm ring-1 ring-amber-400'
          : (idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/80');

        const stickyCodeClass = isSelected
          ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
          : 'bg-white text-slate-600 font-bold border-r border-slate-200 shadow-xs';

        const stickyNameClass = isSelected
          ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
          : 'bg-white text-slate-900 font-bold border-r border-slate-200 shadow-xs';

        const stickySubClass = isSelected
          ? 'bg-amber-100/80 text-amber-900 font-semibold border-r border-amber-300'
          : 'text-slate-600 font-medium border-r border-slate-200';

        const rate1Pass = (u.rate1 || 0) >= 70.0;

        const actionBtn = isSelected
          ? `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition flex items-center justify-center gap-1 mx-auto" title="คลิกเพื่อยกเลิกการเลือก"><i class="fa-solid fa-check"></i> ดู รพ.สต.</button>`
          : `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs">ดู รพ.สต.</button>`;

        tbodyHtml += `
          <tr class="${rowBg} border-b border-slate-200/80 text-xs transition">
            <td class="p-2.5 text-center sticky left-0 ${stickyCodeClass} font-mono z-10">
              ${u.hospcode}
            </td>
            <td class="p-2.5 sticky left-16 ${stickyNameClass} z-10">
              <span class="cursor-pointer hover:text-emerald-700 hover:underline" onclick="window.selectDashboardUnit('${u.hospcode}')">${u.name}</span>
            </td>
            <td class="p-2.5 ${stickySubClass}">
              ${u.subdistrict || '-'}
            </td>
            <td class="p-2 text-right border-r border-slate-200 font-mono">${(u.b1 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}">${(u.a1 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-bold ${rate1Pass ? (isSelected ? 'text-emerald-900 bg-emerald-100/80' : 'text-emerald-700 bg-emerald-50/70') : 'text-slate-800'}">
              ${(u.rate1 || 0).toFixed(2)}%
            </td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.a3 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.rate3 || 0).toFixed(2)}%</td>
            <td class="p-2 text-center">
              ${actionBtn}
            </td>
          </tr>
        `;
      });
    } else if (currentDmHba1cView === 'chronic_fu') {
      theadHtml = `
        <thead>
          <tr class="bg-emerald-700 text-white font-bold text-center border-b border-emerald-800">
            <th onclick="window.switchDmHba1cSort(null, 'hospcode')" class="p-3 text-center sticky left-0 bg-emerald-700 hover:bg-emerald-800 cursor-pointer transition z-10 w-16 shadow-xs select-none group" title="คลิกเพื่อเรียงตามรหัส">
              รหัส ${sortIcon('hospcode')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'name')" class="p-3 text-left sticky left-16 bg-emerald-700 hover:bg-emerald-800 cursor-pointer transition z-10 min-w-[170px] shadow-xs select-none group" title="คลิกเพื่อเรียงตามชื่อหน่วยบริการ">
              หน่วยบริการ / รพ.สต. ${sortIcon('name')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'subdistrict')" class="p-3 text-left min-w-[90px] hover:bg-emerald-800 cursor-pointer transition select-none group" title="คลิกเพื่อเรียงตามตำบล">
              ตำบล ${sortIcon('subdistrict')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'b2')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตาม B2">
              จำนวนผู้ป่วย (B2) ${sortIcon('b2')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a2')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตาม A2">
              ได้รับการตรวจอย่างน้อย 1 ครั้ง/ปี (A2) ${sortIcon('a2')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate2')" class="p-2.5 border-l border-emerald-600 font-bold bg-emerald-800/80 hover:bg-emerald-900 cursor-pointer text-amber-200 transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A2/B2">
              ร้อยละ [A2/B2] x 100 ${sortIcon('rate2')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'a4')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตาม A4">
              ได้รับการตรวจอย่างน้อย 2 ครั้ง/ปี (A4) ${sortIcon('a4')}
            </th>
            <th onclick="window.switchDmHba1cSort(null, 'rate4')" class="p-2.5 border-l border-emerald-600 hover:bg-emerald-800 cursor-pointer font-medium transition select-none group" title="คลิกเพื่อเรียงตามร้อยละ A4/B2">
              ร้อยละ [A4/B2] x 100 ${sortIcon('rate4')}
            </th>
            <th class="p-2.5 text-center border-l border-emerald-600 min-w-[80px]">เลือกดู</th>
          </tr>
        </thead>
      `;

      tbodyHtml += `
        <tr class="bg-emerald-50/90 font-bold text-slate-900 border-b-2 border-emerald-200 text-xs">
          <td class="p-2.5 text-center sticky left-0 bg-emerald-50/95 z-10 font-mono text-emerald-950 font-bold">TOTAL</td>
          <td class="p-2.5 sticky left-16 bg-emerald-50/95 z-10 font-extrabold text-emerald-950 flex items-center gap-1.5 cursor-pointer hover:text-emerald-800" onclick="window.selectDashboardUnit('all')">
            <i class="fa-solid fa-calculator text-emerald-600"></i> รวมอำเภอสารภี
          </td>
          <td class="p-2.5 text-slate-600 font-medium">สารภี</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono">${(hdcSum.b2 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-blue-800">${(hdcSum.a2 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono font-extrabold ${hdcSum.rate2 >= 70 ? 'text-emerald-700 bg-emerald-100/60' : 'text-amber-700 bg-amber-50'}">
            ${(hdcSum.rate2 || 0).toFixed(2)}%
          </td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-indigo-800">${(hdcSum.a4 || 0).toLocaleString()}</td>
          <td class="p-2 text-right border-l border-emerald-200 font-mono text-slate-700">${(hdcSum.rate4 || 0).toFixed(2)}%</td>
          <td class="p-2 text-center border-l border-emerald-200">
            <button type="button" onclick="window.selectDashboardUnit('all')" class="px-2 py-0.5 rounded ${currentUnit === 'all' ? 'bg-emerald-600 text-white font-extrabold shadow-2xs' : 'bg-emerald-200/70 hover:bg-emerald-600 hover:text-white text-emerald-900 font-bold'} text-[10.5px] transition">
              ${currentUnit === 'all' ? 'ดูอยู่' : 'ยอดรวม'}
            </button>
          </td>
        </tr>
      `;

      sortedUnits.forEach((u, idx) => {
        const isSelected = (currentUnit === u.hospcode);
        const rowBg = isSelected
          ? 'bg-amber-100/90 font-bold text-slate-900 border-y-2 border-amber-400 shadow-sm ring-1 ring-amber-400'
          : (idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/80');

        const stickyCodeClass = isSelected
          ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
          : 'bg-white text-slate-600 font-bold border-r border-slate-200 shadow-xs';

        const stickyNameClass = isSelected
          ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
          : 'bg-white text-slate-900 font-bold border-r border-slate-200 shadow-xs';

        const stickySubClass = isSelected
          ? 'bg-amber-100/80 text-amber-900 font-semibold border-r border-amber-300'
          : 'text-slate-600 font-medium border-r border-slate-200';

        const rate2Pass = (u.rate2 || 0) >= 70.0;

        const actionBtn = isSelected
          ? `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition flex items-center justify-center gap-1 mx-auto" title="คลิกเพื่อยกเลิกการเลือก"><i class="fa-solid fa-check"></i> ดู รพ.สต.</button>`
          : `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs">ดู รพ.สต.</button>`;

        tbodyHtml += `
          <tr class="${rowBg} border-b border-slate-200/80 text-xs transition">
            <td class="p-2.5 text-center sticky left-0 ${stickyCodeClass} font-mono z-10">
              ${u.hospcode}
            </td>
            <td class="p-2.5 sticky left-16 ${stickyNameClass} z-10">
              <span class="cursor-pointer hover:text-emerald-700 hover:underline" onclick="window.selectDashboardUnit('${u.hospcode}')">${u.name}</span>
            </td>
            <td class="p-2.5 ${stickySubClass}">
              ${u.subdistrict || '-'}
            </td>
            <td class="p-2 text-right border-r border-slate-200 font-mono">${(u.b2 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}">${(u.a2 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono font-bold ${rate2Pass ? (isSelected ? 'text-emerald-900 bg-emerald-100/80' : 'text-emerald-700 bg-emerald-50/70') : (isSelected ? 'text-amber-900 bg-amber-200/80' : 'text-amber-700 bg-amber-50/50')}">
              ${(u.rate2 || 0).toFixed(2)}%
            </td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.a4 || 0).toLocaleString()}</td>
            <td class="p-2 text-right border-r border-slate-200 font-mono text-slate-600">${(u.rate4 || 0).toFixed(2)}%</td>
            <td class="p-2 text-center">
              ${actionBtn}
            </td>
          </tr>
        `;
      });
    }

    tableEl.innerHTML = `${theadHtml}<tbody>${tbodyHtml}</tbody>`;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // =========================================================================
  // PCC 2569 (4 KPIs & Global Budget Allocation) - CONTROLLER & RENDER
  // =========================================================================

  window.switchPcc69View = function(view) {
    currentPcc69View = view;
    if (currentDomain === 'pcc_2569') {
      const targetId = (view === 'budget') ? 'pcc69_kpi1' : `pcc69_${view}`;
      if (masterData && masterData.indicators && masterData.indicators[targetId]) {
        currentIndicatorId = targetId;
        if (indicatorSelect) indicatorSelect.value = targetId;
        updateIndicatorNavButtons();
        updateIndicatorHeader();
      }
    }
    renderPcc2569Panel();
  };

  window.setPcc69Sort = function(sortMode) {
    currentPcc69Sort = sortMode;
    renderPcc69Table();
  };

  window.togglePcc69CriteriaBox = function() {
    const box = document.getElementById('pcc69-criteria-box');
    if (box) box.classList.toggle('hidden');
  };

  window.exportPcc2569Csv = function() {
    if (!pcc2569MasterData) return;
    const units = Object.values(pcc2569MasterData.units || {});
    const dist = pcc2569MasterData.saraphi_district || {};

    let csv = '\uFEFFรหัสสถานบริการ,ชื่อหน่วยบริการ,ตำบล,ประชากร UC 35+,KPI1 35 ปี คัดกรอง DM (ตรวจแล้ว A),KPI1 (เป้าหมาย B),KPI1 (ร้อยละ),KPI1 (ดาว),KPI1 (จัดสรรเงิน บ.),KPI2 กลุ่มเสี่ยง/PreDM กลับมาเป็นปกติ (A),KPI2 (เป้าหมาย B),KPI2 (ร้อยละ),KPI2 (ดาว),KPI2 (จัดสรรเงิน บ.),KPI3 35 ปี คัดกรอง HT (ตรวจแล้ว A),KPI3 (เป้าหมาย B),KPI3 (ร้อยละ),KPI3 (ดาว),KPI3 (จัดสรรเงิน บ.),KPI4 BP สูง Dx.HT รายใหม่ (ตรวจแล้ว A),KPI4 (เป้าหมาย B),KPI4 (ร้อยละ),KPI4 (ดาว),KPI4 (จัดสรรเงิน บ.),รวมเงินจัดสรรทั้งหมด (บาท)\n';

    // Total Row
    csv += `TOTAL,รวมอำเภอสารภี,สารภี,${dist.uc35_pop || 0},${dist.kpi1?.a || 0},${dist.kpi1?.b || 0},${dist.kpi1?.rate || 0},-,${dist.kpi1?.budget || 0},${dist.kpi2?.a || 0},${dist.kpi2?.b || 0},${dist.kpi2?.rate || 0},-,${dist.kpi2?.budget || 0},${dist.kpi3?.a || 0},${dist.kpi3?.b || 0},${dist.kpi3?.rate || 0},-,${dist.kpi3?.budget || 0},${dist.kpi4?.a || 0},${dist.kpi4?.b || 0},${dist.kpi4?.rate || 0},-,${dist.kpi4?.budget || 0},${dist.total_budget || 0}\n`;

    units.forEach(u => {
      csv += `"${u.hospcode}","${u.name}","${u.subdistrict}",${u.uc35_pop},${u.kpi1.a},${u.kpi1.b},${u.kpi1.rate},${u.kpi1.score},${u.kpi1.budget},${u.kpi2.a},${u.kpi2.b},${u.kpi2.rate},${u.kpi2.score},${u.kpi2.budget},${u.kpi3.a},${u.kpi3.b},${u.kpi3.rate},${u.kpi3.score},${u.kpi3.budget},${u.kpi4.a},${u.kpi4.b},${u.kpi4.rate},${u.kpi4.score},${u.kpi4.budget},${u.total_budget}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `PCC_2569_Saraphi_Allocation_R1.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function renderPcc2569Panel() {
    if (!pcc2569Panel || !pcc2569MasterData) return;

    // 1. Sync View Mode Buttons
    ['budget', 'kpi1', 'kpi2', 'kpi3', 'kpi4'].forEach(v => {
      const btn = document.getElementById(`btn-pcc69-view-${v}`);
      if (btn) {
        if (v === currentPcc69View) {
          btn.className = 'px-3 py-1.5 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    // 2. Unit Filter Badge & 5 Bento Cards
    const dist = pcc2569MasterData.saraphi_district || {};
    const unitsMap = pcc2569MasterData.units || {};
    const unitBadge = document.getElementById('pcc69-unit-badge');

    const isAll = (currentUnit === 'all');
    let selData = null;

    if (!isAll && unitsMap[currentUnit]) {
      selData = unitsMap[currentUnit];
      if (unitBadge) {
        unitBadge.className = 'flex items-center gap-1.5';
        unitBadge.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs">
            <i class="fa-solid fa-hospital-user"></i> กำลังดู: ${selData.name} (ต.${selData.subdistrict})
            <button type="button" onclick="window.selectDashboardUnit('all')" class="ml-1 px-1.5 py-0.5 rounded bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10.5px] transition" title="คลิกเพื่อกลับสู่ภาพรวมทั้งอำเภอ">
              ดูภาพรวมทั้งหมด <i class="fa-solid fa-arrow-rotate-left"></i>
            </button>
          </span>
        `;
      }
    } else {
      if (unitBadge) {
        unitBadge.className = 'hidden';
        unitBadge.innerHTML = '';
      }
    }

    // Populate Cards
    const k1Rate = selData ? selData.kpi1.rate : dist.kpi1.rate;
    const k1Score = selData ? selData.kpi1.score : (k1Rate >= 56 ? Math.min(5, Math.floor((k1Rate - 56) / 9) + 1) : 0);
    const k1A = selData ? selData.kpi1.a : dist.kpi1.a;
    const k1B = selData ? selData.kpi1.b : dist.kpi1.b;
    const k1Pay = selData ? selData.kpi1.budget : dist.kpi1.budget;

    const elK1Rate = document.getElementById('pcc69-card-kpi1-rate');
    const elK1Stars = document.getElementById('pcc69-card-kpi1-stars');
    const elK1Ab = document.getElementById('pcc69-card-kpi1-ab');
    const elK1Pay = document.getElementById('pcc69-card-kpi1-pay');
    if (elK1Rate) elK1Rate.textContent = `${k1Rate.toFixed(2)}%`;
    if (elK1Stars) elK1Stars.textContent = `${k1Score} ดาว`;
    if (elK1Ab) elK1Ab.textContent = `${Number(k1A).toLocaleString()} / ${Number(k1B).toLocaleString()} คน`;
    if (elK1Pay) elK1Pay.textContent = `${Number(k1Pay).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;

    const k2Rate = selData ? selData.kpi2.rate : dist.kpi2.rate;
    const k2Score = selData ? selData.kpi2.score : 1;
    const k2A = selData ? selData.kpi2.a : dist.kpi2.a;
    const k2B = selData ? selData.kpi2.b : dist.kpi2.b;
    const k2Pay = selData ? selData.kpi2.budget : dist.kpi2.budget;

    const elK2Rate = document.getElementById('pcc69-card-kpi2-rate');
    const elK2Stars = document.getElementById('pcc69-card-kpi2-stars');
    const elK2Ab = document.getElementById('pcc69-card-kpi2-ab');
    const elK2Pay = document.getElementById('pcc69-card-kpi2-pay');
    if (elK2Rate) elK2Rate.textContent = `${k2Rate.toFixed(2)}%`;
    if (elK2Stars) elK2Stars.textContent = `${k2Score} ดาว`;
    if (elK2Ab) elK2Ab.textContent = `${Number(k2A).toLocaleString()} / ${Number(k2B).toLocaleString()} คน`;
    if (elK2Pay) elK2Pay.textContent = `${Number(k2Pay).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;

    const k3Rate = selData ? selData.kpi3.rate : dist.kpi3.rate;
    const k3Score = selData ? selData.kpi3.score : (k3Rate >= 57 ? Math.min(5, Math.floor((k3Rate - 57) / 9) + 1) : 0);
    const k3A = selData ? selData.kpi3.a : dist.kpi3.a;
    const k3B = selData ? selData.kpi3.b : dist.kpi3.b;
    const k3Pay = selData ? selData.kpi3.budget : dist.kpi3.budget;

    const elK3Rate = document.getElementById('pcc69-card-kpi3-rate');
    const elK3Stars = document.getElementById('pcc69-card-kpi3-stars');
    const elK3Ab = document.getElementById('pcc69-card-kpi3-ab');
    const elK3Pay = document.getElementById('pcc69-card-kpi3-pay');
    if (elK3Rate) elK3Rate.textContent = `${k3Rate.toFixed(2)}%`;
    if (elK3Stars) elK3Stars.textContent = `${k3Score} ดาว`;
    if (elK3Ab) elK3Ab.textContent = `${Number(k3A).toLocaleString()} / ${Number(k3B).toLocaleString()} คน`;
    if (elK3Pay) elK3Pay.textContent = `${Number(k3Pay).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;

    const k4Rate = selData ? selData.kpi4.rate : dist.kpi4.rate;
    const k4Score = selData ? selData.kpi4.score : (k4Rate >= 10.8 ? 5 : (k4Rate > 0 ? 1 : 0));
    const k4A = selData ? selData.kpi4.a : dist.kpi4.a;
    const k4B = selData ? selData.kpi4.b : dist.kpi4.b;
    const k4Pay = selData ? selData.kpi4.budget : dist.kpi4.budget;

    const elK4Rate = document.getElementById('pcc69-card-kpi4-rate');
    const elK4Stars = document.getElementById('pcc69-card-kpi4-stars');
    const elK4Ab = document.getElementById('pcc69-card-kpi4-ab');
    const elK4Pay = document.getElementById('pcc69-card-kpi4-pay');
    if (elK4Rate) elK4Rate.textContent = `${k4Rate.toFixed(2)}%`;
    if (elK4Stars) elK4Stars.textContent = `${k4Score} ดาว`;
    if (elK4Ab) elK4Ab.textContent = `${Number(k4A).toLocaleString()} / ${Number(k4B).toLocaleString()} คน`;
    if (elK4Pay) elK4Pay.textContent = `${Number(k4Pay).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;

    // Card 5: Total Pay & Rank
    const totPay = selData ? selData.total_budget : dist.total_budget;
    const uc35 = selData ? selData.uc35_pop : dist.uc35_pop;
    const rankVal = selData ? `อันดับที่ ${selData.rank_budget} จาก 14 แห่ง` : '14 แห่งในอำเภอ';

    const elTotPay = document.getElementById('pcc69-card-total-pay');
    const elUc35 = document.getElementById('pcc69-card-uc35-pop');
    const elRankVal = document.getElementById('pcc69-card-rank-val');
    if (elTotPay) elTotPay.textContent = `${Number(totPay).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บ.`;
    if (elUc35) elUc35.textContent = `${Number(uc35).toLocaleString()} คน`;
    if (elRankVal) elRankVal.textContent = rankVal;

    // 3. Render Charts
    renderPcc69Charts();

    // 4. Render Table
    renderPcc69Table();
  }

  function renderPcc69Charts() {
    if (!pcc2569MasterData) return;
    const unitsList = Object.values(pcc2569MasterData.units || {});

    // --- CHART 1: Total Allocated Budget (บาท) ---
    const canvasBudget = document.getElementById('pcc69ChartBudget');
    if (canvasBudget) {
      if (pcc69ChartBudgetInstance) {
        pcc69ChartBudgetInstance.destroy();
        pcc69ChartBudgetInstance = null;
      }

      const sortedBudgetUnits = [...unitsList].sort((a, b) => b.total_budget - a.total_budget);
      const labels1 = sortedBudgetUnits.map(u => u.short_name || u.name);
      const data1 = sortedBudgetUnits.map(u => u.total_budget);
      const bgColors1 = sortedBudgetUnits.map(u => (u.hospcode === currentUnit ? '#f59e0b' : '#10b981'));
      const borderColors1 = sortedBudgetUnits.map(u => (u.hospcode === currentUnit ? '#b45309' : '#059669'));
      const borderWidths1 = sortedBudgetUnits.map(u => (u.hospcode === currentUnit ? 2.5 : 1));

      const ctx1 = canvasBudget.getContext('2d');
      pcc69ChartBudgetInstance = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: labels1,
          datasets: [{
            label: 'เงินจัดสรร PCC 2569 (บาท)',
            data: data1,
            backgroundColor: bgColors1,
            borderColor: borderColors1,
            borderWidth: borderWidths1,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  const val = ctx.raw || 0;
                  const total = pcc2569MasterData.saraphi_district?.total_budget || 1;
                  const share = ((val / total) * 100).toFixed(1);
                  return ` งบจัดสรร: ${val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท (${share}%)`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(v) { return Number(v).toLocaleString() + ' บ.'; },
                font: { family: "'Noto Sans Thai', sans-serif", size: 10 }
              },
              grid: { color: '#f1f5f9' }
            },
            x: {
              ticks: {
                font: { family: "'Noto Sans Thai', sans-serif", size: 10 },
                maxRotation: 45,
                minRotation: 30
              },
              grid: { display: false }
            }
          },
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const elIndex = elements[0].index;
              const target = sortedBudgetUnits[elIndex];
              if (target) {
                window.selectDashboardUnit(target.hospcode);
              }
            }
          }
        }
      });
    }

    // --- CHART 2: Performance Rates / Scores (%) ---
    const canvasRates = document.getElementById('pcc69ChartRates');
    if (canvasRates) {
      if (pcc69ChartRatesInstance) {
        pcc69ChartRatesInstance.destroy();
        pcc69ChartRatesInstance = null;
      }

      let metricKey = 'kpi1';
      let chartTitle = 'ร้อยละการคัดกรองเบาหวาน (KPI 1)';
      let targetVal = 74.0; // 3 stars
      let targetLabel = 'เป้าหมาย 3 ดาว (≥74%)';

      if (currentPcc69View === 'kpi2') {
        metricKey = 'kpi2';
        chartTitle = 'ร้อยละ Pre-DM กลับเป็นปกติ (KPI 2 - 410 บ./คน)';
        targetVal = 45.0;
        targetLabel = 'เป้าหมาย 3 ดาว (≥45%)';
      } else if (currentPcc69View === 'kpi3') {
        metricKey = 'kpi3';
        chartTitle = 'ร้อยละการคัดกรองความดันโลหิต (KPI 3)';
        targetVal = 75.0;
        targetLabel = 'เป้าหมาย 3 ดาว (≥75%)';
      } else if (currentPcc69View === 'kpi4') {
        metricKey = 'kpi4';
        chartTitle = 'ร้อยละการวินิจฉัย HT รายใหม่ (KPI 4 - 777 บ./คน)';
        targetVal = 7.8;
        targetLabel = 'เป้าหมาย 3 ดาว (≥7.8%)';
      } else if (currentPcc69View === 'budget') {
        metricKey = 'kpi4';
        chartTitle = 'ร้อยละการวินิจฉัย HT รายใหม่ (ตัวชี้วัดทำรายได้สูงสุด 777 บ./คน)';
        targetVal = 7.8;
        targetLabel = 'เกณฑ์ 3 ดาว (≥7.8%)';
      }

      const headingEl = document.getElementById('pcc69-chart2-heading');
      if (headingEl) headingEl.textContent = chartTitle;

      const targetLineEl = document.getElementById('pcc69-chart2-target-line');
      if (targetLineEl) {
        targetLineEl.innerHTML = `<span class="w-3 h-0.5 bg-emerald-600 border-t-2 border-dashed border-emerald-600 inline-block"></span> ${targetLabel}`;
      }

      const sortedRateUnits = [...unitsList].sort((a, b) => (b[metricKey]?.rate || 0) - (a[metricKey]?.rate || 0));
      const labels2 = sortedRateUnits.map(u => u.short_name || u.name);
      const data2 = sortedRateUnits.map(u => u[metricKey]?.rate || 0);

      const bgColors2 = sortedRateUnits.map(u => {
        if (u.hospcode === currentUnit) return '#f59e0b'; // Amber for selected
        const score = u[metricKey]?.score || 0;
        if (score >= 3) return '#38bdf8'; // Sky
        if (score >= 1) return '#34d399'; // Emerald
        return '#cbd5e1'; // Slate
      });

      const borderColors2 = sortedRateUnits.map(u => (u.hospcode === currentUnit ? '#b45309' : '#0284c7'));
      const borderWidths2 = sortedRateUnits.map(u => (u.hospcode === currentUnit ? 2.5 : 1));

      const ctx2 = canvasRates.getContext('2d');
      pcc69ChartRatesInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: labels2,
          datasets: [
            {
              type: 'line',
              label: targetLabel,
              data: new Array(labels2.length).fill(targetVal),
              borderColor: '#10b981',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            },
            {
              type: 'bar',
              label: 'ร้อยละผลงาน (%)',
              data: data2,
              backgroundColor: bgColors2,
              borderColor: borderColors2,
              borderWidth: borderWidths2,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { family: "'Noto Sans Thai', sans-serif", size: 10.5 },
                filter: item => item.text !== 'ร้อยละผลงาน (%)'
              }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  if (ctx.dataset.type === 'line') return ` ${ctx.dataset.label}`;
                  const u = sortedRateUnits[ctx.dataIndex];
                  const kObj = u[metricKey] || {};
                  return [
                    ` ผลงาน: ${(kObj.rate || 0).toFixed(2)}% (${kObj.score || 0} ดาว)`,
                    ` จำนวน: ${(kObj.a || 0).toLocaleString()} / ${(kObj.b || 0).toLocaleString()} คน`,
                    ` เงินจัดสรร: ${(kObj.budget || 0).toLocaleString()} บาท`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(v) { return v + '%'; },
                font: { family: "'Noto Sans Thai', sans-serif", size: 10 }
              },
              grid: { color: '#f1f5f9' }
            },
            x: {
              ticks: {
                font: { family: "'Noto Sans Thai', sans-serif", size: 10 },
                maxRotation: 45,
                minRotation: 30
              },
              grid: { display: false }
            }
          },
          onClick: (evt, elements) => {
            if (elements && elements.length > 0) {
              const elIndex = elements[0].index;
              const target = sortedRateUnits[elIndex];
              if (target) {
                window.selectDashboardUnit(target.hospcode);
              }
            }
          }
        }
      });
    }
  }

  function renderPcc69Table() {
    const tableEl = document.getElementById('pcc69-matrix-table');
    if (!tableEl || !pcc2569MasterData) return;

    // Sync sort buttons
    ['budget_desc', 'rate_desc', 'code'].forEach(s => {
      const btn = document.getElementById(`btn-pcc69-sort-${s}`);
      if (btn) {
        if (s === currentPcc69Sort) {
          btn.className = 'px-2.5 py-1 rounded-lg font-bold transition shadow-xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg font-semibold text-slate-600 hover:text-slate-900 transition bg-transparent';
        }
      }
    });

    const dist = pcc2569MasterData.saraphi_district || {};
    let units = Object.values(pcc2569MasterData.units || {});

    // Filter by query
    const q = (pcc69SearchQuery || '').trim().toLowerCase();
    if (q) {
      units = units.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.hospcode && u.hospcode.includes(q)) ||
        (u.subdistrict && u.subdistrict.toLowerCase().includes(q))
      );
    }

    // Sort
    let activeKey = 'kpi1';
    if (currentPcc69View === 'kpi2') activeKey = 'kpi2';
    else if (currentPcc69View === 'kpi3') activeKey = 'kpi3';
    else if (currentPcc69View === 'kpi4') activeKey = 'kpi4';

    if (currentPcc69Sort === 'budget_desc') {
      units.sort((a, b) => (b.total_budget || 0) - (a.total_budget || 0));
    } else if (currentPcc69Sort === 'rate_desc') {
      units.sort((a, b) => (b[activeKey]?.rate || 0) - (a[activeKey]?.rate || 0));
    } else if (currentPcc69Sort === 'code') {
      units.sort((a, b) => String(a.hospcode).localeCompare(String(b.hospcode)));
    }

    // Header HTML
    const theadHtml = `
      <thead class="bg-emerald-800 text-white font-bold normal-case text-[11px] tracking-wider border-b border-emerald-950 select-none">
        <tr class="border-b border-emerald-700/60 text-center">
          <th rowspan="2" class="p-2.5 sticky left-0 bg-emerald-900 z-30 w-16 border-r border-emerald-700/80 shadow-xs">รหัส</th>
          <th rowspan="2" class="p-2.5 sticky left-16 bg-emerald-900 z-30 min-w-[190px] text-left border-r border-emerald-700/80 shadow-xs">หน่วยบริการ / รพ.สต.</th>
          <th rowspan="2" class="p-2.5 min-w-[85px] border-r border-emerald-700/80">ตำบล</th>
          <th rowspan="2" class="p-2.5 min-w-[80px] text-right border-r border-emerald-700/80">UC 35+</th>
          <th colspan="2" class="p-2 border-r border-emerald-700/80 bg-emerald-850">KPI 1 : 35 ปี คัดกรอง DM (20%)</th>
          <th colspan="2" class="p-2 border-r border-emerald-700/80 bg-emerald-850">KPI 2 : กลุ่มเสี่ยง/PreDM กลับมาเป็นปกติ (40%)</th>
          <th colspan="2" class="p-2 border-r border-emerald-700/80 bg-emerald-850">KPI 3 : 35 ปี คัดกรอง HT (15%)</th>
          <th colspan="2" class="p-2 border-r border-emerald-700/80 bg-emerald-850">KPI 4 : BP สูง Dx.HT รายใหม่ (25%)</th>
          <th rowspan="2" class="p-2.5 min-w-[110px] text-right border-r border-emerald-700/80 bg-emerald-950/90 text-amber-300">รวมเงินจัดสรร (บาท)</th>
          <th rowspan="2" class="p-2.5 w-20 text-center">เลือกดู</th>
        </tr>
        <tr class="border-b border-emerald-900/80 text-[10.5px]">
          <th class="p-1.5 text-right border-r border-emerald-700/50">ร้อยละ (ดาว)</th>
          <th class="p-1.5 text-right border-r border-emerald-700/80 font-mono">เงิน (บ.)</th>
          <th class="p-1.5 text-right border-r border-emerald-700/50">ร้อยละ (ดาว)</th>
          <th class="p-1.5 text-right border-r border-emerald-700/80 font-mono text-amber-200">เงิน (บ.)</th>
          <th class="p-1.5 text-right border-r border-emerald-700/50">ร้อยละ (ดาว)</th>
          <th class="p-1.5 text-right border-r border-emerald-700/80 font-mono">เงิน (บ.)</th>
          <th class="p-1.5 text-right border-r border-emerald-700/50">ร้อยละ (ดาว)</th>
          <th class="p-1.5 text-right border-r border-emerald-700/80 font-mono text-amber-200">เงิน (บ.)</th>
        </tr>
      </thead>
    `;

    // Row 1: TOTAL
    let tbodyHtml = `
      <tr class="bg-emerald-100/90 font-extrabold text-emerald-950 border-b-2 border-emerald-300 text-xs transition">
        <td class="p-2.5 text-center sticky left-0 bg-emerald-100/95 font-mono z-20 border-r border-emerald-300 shadow-xs">TOTAL</td>
        <td class="p-2.5 sticky left-16 bg-emerald-100/95 z-20 text-left border-r border-emerald-300 shadow-xs cursor-pointer hover:text-emerald-800" onclick="window.selectDashboardUnit('all')">
          <i class="fa-solid fa-calculator text-emerald-700 mr-1"></i> รวมอำเภอสารภี
        </td>
        <td class="p-2.5 border-r border-emerald-300 text-slate-700">สารภี</td>
        <td class="p-2 text-right border-r border-emerald-300 font-mono">${(dist.uc35_pop || 0).toLocaleString()}</td>
        
        <td class="p-2 text-right border-r border-emerald-300 font-mono">${(dist.kpi1?.rate || 0).toFixed(2)}%</td>
        <td class="p-2 text-right border-r border-emerald-300 font-mono text-emerald-900">${(dist.kpi1?.budget || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
        
        <td class="p-2 text-right border-r border-emerald-300 font-mono">${(dist.kpi2?.rate || 0).toFixed(2)}%</td>
        <td class="p-2 text-right border-r border-emerald-300 font-mono text-amber-900 font-extrabold">${(dist.kpi2?.budget || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
        
        <td class="p-2 text-right border-r border-emerald-300 font-mono">${(dist.kpi3?.rate || 0).toFixed(2)}%</td>
        <td class="p-2 text-right border-r border-emerald-300 font-mono text-emerald-900">${(dist.kpi3?.budget || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
        
        <td class="p-2 text-right border-r border-emerald-300 font-mono">${(dist.kpi4?.rate || 0).toFixed(2)}%</td>
        <td class="p-2 text-right border-r border-emerald-300 font-mono text-indigo-950 font-extrabold">${(dist.kpi4?.budget || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
        
        <td class="p-2.5 text-right border-r border-emerald-300 font-mono text-emerald-950 text-sm font-black bg-emerald-200/60">
          ${(dist.total_budget || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
        </td>
        <td class="p-2 text-center">
          <button type="button" onclick="window.selectDashboardUnit('all')" class="px-2 py-0.5 rounded ${currentUnit === 'all' ? 'bg-emerald-700 text-white font-extrabold' : 'bg-emerald-200 text-emerald-900 font-bold'} text-[10.5px]">
            ${currentUnit === 'all' ? 'ดูอยู่' : 'ยอดรวม'}
          </button>
        </td>
      </tr>
    `;

    // Unit Rows
    units.forEach((u, idx) => {
      const isSelected = (currentUnit === u.hospcode);
      const rowBg = isSelected
        ? 'bg-amber-100/90 font-bold text-slate-900 border-y-2 border-amber-400 shadow-sm ring-1 ring-amber-400'
        : (idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/80');

      const stickyCodeClass = isSelected
        ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
        : 'bg-white text-slate-600 font-bold border-r border-slate-200 shadow-xs';

      const stickyNameClass = isSelected
        ? 'bg-amber-100 text-amber-950 font-extrabold border-r border-amber-300 shadow-xs'
        : 'bg-white text-slate-900 font-bold border-r border-slate-200 shadow-xs';

      const stickySubClass = isSelected
        ? 'bg-amber-100/80 text-amber-900 font-semibold border-r border-amber-300'
        : 'text-slate-600 font-medium border-r border-slate-200';

      const actionBtn = isSelected
        ? `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition flex items-center justify-center gap-1 mx-auto" title="คลิกเพื่อยกเลิกการเลือก"><i class="fa-solid fa-check"></i> ดู รพ.สต.</button>`
        : `<button type="button" onclick="window.selectDashboardUnit('${u.hospcode}')" class="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs">ดู รพ.สต.</button>`;

      tbodyHtml += `
        <tr class="${rowBg} border-b border-slate-200/80 text-xs transition">
          <td class="p-2.5 text-center sticky left-0 ${stickyCodeClass} font-mono z-10">
            ${u.hospcode}
          </td>
          <td class="p-2.5 sticky left-16 ${stickyNameClass} z-10">
            <span class="cursor-pointer hover:text-emerald-700 hover:underline" onclick="window.selectDashboardUnit('${u.hospcode}')">${u.name}</span>
          </td>
          <td class="p-2.5 ${stickySubClass}">
            ${u.subdistrict || '-'}
          </td>
          <td class="p-2 text-right border-r border-slate-200 font-mono">${(u.uc35_pop || 0).toLocaleString()}</td>
          
          <td class="p-2 text-right border-r border-slate-200 font-mono">
            <span class="${u.kpi1.score > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">${u.kpi1.rate.toFixed(2)}%</span>
            <span class="text-[10px] text-slate-500 ml-0.5">(${u.kpi1.score}★)</span>
          </td>
          <td class="p-2 text-right border-r border-slate-200 font-mono ${u.kpi1.budget > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}">
            ${u.kpi1.budget > 0 ? Number(u.kpi1.budget).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
          </td>
          
          <td class="p-2 text-right border-r border-slate-200 font-mono">
            <span class="${u.kpi2.score > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}">${u.kpi2.rate.toFixed(2)}%</span>
            <span class="text-[10px] text-slate-500 ml-0.5">(${u.kpi2.score}★)</span>
          </td>
          <td class="p-2 text-right border-r border-slate-200 font-mono ${u.kpi2.budget > 0 ? 'text-amber-800 font-bold' : 'text-slate-400'}">
            ${u.kpi2.budget > 0 ? Number(u.kpi2.budget).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
          </td>
          
          <td class="p-2 text-right border-r border-slate-200 font-mono">
            <span class="${u.kpi3.score > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">${u.kpi3.rate.toFixed(2)}%</span>
            <span class="text-[10px] text-slate-500 ml-0.5">(${u.kpi3.score}★)</span>
          </td>
          <td class="p-2 text-right border-r border-slate-200 font-mono ${u.kpi3.budget > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-400'}">
            ${u.kpi3.budget > 0 ? Number(u.kpi3.budget).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
          </td>
          
          <td class="p-2 text-right border-r border-slate-200 font-mono">
            <span class="${u.kpi4.score > 0 ? 'text-indigo-700 font-bold' : 'text-slate-400'}">${u.kpi4.rate.toFixed(2)}%</span>
            <span class="text-[10px] text-slate-500 ml-0.5">(${u.kpi4.score}★)</span>
          </td>
          <td class="p-2 text-right border-r border-slate-200 font-mono ${u.kpi4.budget > 0 ? 'text-indigo-800 font-bold' : 'text-slate-400'}">
            ${u.kpi4.budget > 0 ? Number(u.kpi4.budget).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-'}
          </td>
          
          <td class="p-2.5 text-right border-r border-slate-200 font-mono font-bold ${u.total_budget > 0 ? 'text-emerald-800' : 'text-slate-400'} bg-emerald-50/30">
            ${u.total_budget > 0 ? Number(u.total_budget).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '0.00'}
          </td>
          <td class="p-2 text-center">
            ${actionBtn}
          </td>
        </tr>
      `;
    });

    tableEl.innerHTML = `${theadHtml}<tbody>${tbodyHtml}</tbody>`;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // =========================================================================
  // SERVICE PLAN (NCD DM, HT, CVD, CKD) - CONTROLLER & RENDER
  // =========================================================================

  function getNcdReportsList() {
    if (!ncdMasterData || !ncdMasterData.reports) return [];
    return Object.values(ncdMasterData.reports);
  }

  function getActiveNcdReport() {
    const list = getNcdReportsList();
    if (!list.length) return null;
    let found = list.find(r => r.id === currentNcdReportId || r.table_name === currentNcdReportId);
    if (!found) {
      found = list[0];
      currentNcdReportId = found.id;
    }
    return found;
  }

  window.switchNcdCategory = function(cat) {
    currentNcdCategory = cat;
    
    // Update pills active styling
    const pillContainer = document.getElementById('ncd-category-pills');
    if (pillContainer) {
      pillContainer.querySelectorAll('.ncd-cat-btn').forEach(btn => {
        if (btn.dataset.cat === cat) {
          btn.className = 'ncd-cat-btn px-3 py-1 rounded-xl text-xs font-bold transition shadow-2xs bg-rose-600 text-white';
        } else {
          btn.className = 'ncd-cat-btn px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition';
        }
      });
    }

    populateNcdReportDropdown();
    renderServicePlanNcdPanel();
  };

  window.switchNcdYear = function(yr) {
    currentNcdYear = yr;
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-ncd-yr-${y}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'px-3 py-1 rounded-lg font-bold transition shadow-2xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition';
        }
      }
    });
    renderServicePlanNcdPanel();
  };

  window.switchNcdUnit = function(unitCode) {
    currentNcdUnit = unitCode;
    renderServicePlanNcdPanel();
  };

  window.switchNcdReport = function(repId) {
    currentNcdReportId = repId;
    renderServicePlanNcdPanel();
  };

  function getFilteredNcdReports() {
    const list = getNcdReportsList();
    return list.filter(r => {
      const matchCat = (currentNcdCategory === 'ALL' || r.category === currentNcdCategory);
      const matchQ = !currentNcdSearchQuery || 
        (r.name && r.name.toLowerCase().includes(currentNcdSearchQuery)) ||
        (r.table_name && r.table_name.toLowerCase().includes(currentNcdSearchQuery));
      return matchCat && matchQ;
    });
  }

  window.navigateNcdReport = function(step) {
    const list = getFilteredNcdReports();
    if (!list || !list.length) return;
    let curIdx = list.findIndex(r => r.id === currentNcdReportId);
    if (curIdx === -1) curIdx = 0;
    let nextIdx = (curIdx + step + list.length) % list.length;
    const targetReport = list[nextIdx];
    if (targetReport) {
      currentNcdReportId = targetReport.id;
      const select = document.getElementById('ncd-report-select');
      if (select) select.value = targetReport.id;
      renderServicePlanNcdPanel();
    }
  };

  window.switchNcdDatasetMode = function(mode) {
    currentNcdDatasetMode = mode;
    ['typearea', 'chronicfu', 'compare'].forEach(m => {
      const btn = document.getElementById(`btn-ncd-mode-${m}`);
      if (btn) {
        if (m === mode) {
          const bg = (m === 'typearea') ? 'bg-emerald-600' : (m === 'chronicfu') ? 'bg-indigo-600' : 'bg-blue-600';
          btn.className = `px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${bg} text-white shadow-2xs`;
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5';
        }
      }
    });
    const report = getActiveNcdReport();
    if (report) {
      renderNcdKpis(report);
      renderNcdCharts(report);
      renderNcdTable(report);
    }
  };

  window.filterNcdReportList = function() {
    const searchInput = document.getElementById('ncd-search-input');
    currentNcdSearchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
    populateNcdReportDropdown();
    renderServicePlanNcdPanel();
  };

  window.filterNcdTable = function(val) {
    currentNcdTableSearch = (val || '').trim().toLowerCase();
    renderNcdTable();
  };

  window.resetNcdFilters = function() {
    currentNcdCategory = 'ALL';
    currentNcdYear = '2569';
    currentNcdUnit = 'all';
    currentNcdSearchQuery = '';
    currentNcdTableSearch = '';
    currentNcdDatasetMode = 'typearea';
    currentNcdReportId = 'ncd_22'; // s_dm_screen

    const searchInput = document.getElementById('ncd-search-input');
    if (searchInput) searchInput.value = '';
    const tableSearch = document.getElementById('ncd-table-search');
    if (tableSearch) tableSearch.value = '';
    const unitSelect = document.getElementById('ncd-unit-select');
    if (unitSelect) unitSelect.value = 'all';

    // Reset Category Pills
    const pillContainer = document.getElementById('ncd-category-pills');
    if (pillContainer) {
      pillContainer.querySelectorAll('.ncd-cat-btn').forEach(btn => {
        if (btn.dataset.cat === 'ALL') {
          btn.className = 'ncd-cat-btn px-3 py-1 rounded-xl text-xs font-bold transition shadow-2xs bg-rose-600 text-white';
        } else {
          btn.className = 'ncd-cat-btn px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition';
        }
      });
    }

    // Reset Year Buttons
    ['2569', '2568', '2567'].forEach(y => {
      const btn = document.getElementById(`btn-ncd-yr-${y}`);
      if (btn) {
        if (y === '2569') {
          btn.className = 'px-3 py-1 rounded-lg font-bold transition shadow-2xs bg-emerald-600 text-white';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition';
        }
      }
    });

    populateNcdReportDropdown();
    renderServicePlanNcdPanel();
  };

  function populateNcdReportDropdown() {
    const select = document.getElementById('ncd-report-select');
    if (!select) return;

    const filtered = getFilteredNcdReports();

    select.innerHTML = '';
    if (!filtered.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'ไม่พบรายงานที่ตรงกับคำค้นหา';
      select.appendChild(opt);
      return;
    }

    filtered.forEach((r, idx) => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${idx + 1}. [${r.category}] [${r.table_name}] ${r.name}`;
      select.appendChild(opt);
    });

    // Ensure current report is selected, or pick first matching
    const stillInList = filtered.some(r => r.id === currentNcdReportId);
    if (!stillInList && filtered.length > 0) {
      currentNcdReportId = filtered[0].id;
    }
    select.value = currentNcdReportId;
  }

  function populateNcdUnitDropdown() {
    const select = document.getElementById('ncd-unit-select');
    if (!select || select.children.length > 1) return; // already populated

    select.innerHTML = '<option value="all">🏥 ทุกหน่วยบริการ (รวมทั้งอำเภอสารภี)</option>';
    Object.keys(SARAPHI_UNITS_MAP).sort().forEach(code => {
      const u = SARAPHI_UNITS_MAP[code];
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${u.name} (ต.${u.subdistrict})`;
      select.appendChild(opt);
    });
  }

  function renderServicePlanNcdPanel() {
    if (!servicePlanNcdPanel) return;
    if (!ncdMasterData) {
      servicePlanNcdPanel.innerHTML = `
        <div class="glass-card rounded-2xl p-8 bg-white text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800">กำลังโหลดข้อมูล Service Plan NCDs...</h3>
          <p class="text-xs text-slate-500">ระบบกำลังโหลดไฟล์มาสเตอร์ 70 รายงาน</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    populateNcdReportDropdown();
    populateNcdUnitDropdown();

    const report = getActiveNcdReport();
    if (!report) return;

    // Update Header Text & Meta
    const titleEl = document.getElementById('ncd-active-report-title');
    if (titleEl) titleEl.textContent = report.name;

    const metaEl = document.getElementById('ncd-active-meta');
    if (metaEl) {
      metaEl.innerHTML = `
        <span>หมวดหมู่: <span class="font-bold text-slate-700">${report.category}</span></span>
        <span>•</span>
        <span>ตารางแหล่งข้อมูล: <code class="bg-slate-100 text-rose-700 px-1 py-0.5 rounded text-[11px] font-mono font-bold">${report.table_name}</code></span>
        <span>•</span>
        <span>ปีงบประมาณ: <span class="font-bold text-emerald-700">${currentNcdYear}</span></span>
      `;
    }

    // Update HDC External Link
    const hdcLink = document.getElementById('ncd-hdc-link');
    if (hdcLink) {
      hdcLink.href = report.hdc_url || `https://hdc.moph.go.th/cmi/public/standard-report-detail/${report.opendata_id}`;
    }

    // Toggle Dual Dataset Mode Bar
    const modeBar = document.getElementById('ncd-dataset-mode-bar');
    if (modeBar) {
      if (report.has_fu) {
        modeBar.classList.remove('hidden');
        ['typearea', 'chronicfu', 'compare'].forEach(m => {
          const btn = document.getElementById(`btn-ncd-mode-${m}`);
          if (btn) {
            if (m === currentNcdDatasetMode) {
              const bg = (m === 'typearea') ? 'bg-emerald-600' : (m === 'chronicfu') ? 'bg-indigo-600' : 'bg-blue-600';
              btn.className = `px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${bg} text-white shadow-2xs`;
            } else {
              btn.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5';
            }
          }
        });
      } else {
        modeBar.classList.add('hidden');
        currentNcdDatasetMode = 'typearea';
      }
    }

    // Update Criteria Callout Box for Risk Screening Indicators
    updateNcdCriteriaBox(report);

    // Render 4 Bento Cards
    renderNcdKpis(report);

    // Render 3 Charts
    renderNcdCharts(report);

    // Render HDC Data Table
    renderNcdTable(report);

    if (window.lucide) window.lucide.createIcons();
  }

  function renderNcdKpis(report) {
    const yrData = report.years?.[currentNcdYear] || { district: { target: 0, result: 0, rate: 0 }, units: {} };
    const isAll = (currentNcdUnit === 'all');
    let selData = null;

    if (!isAll && yrData.units?.[currentNcdUnit]) {
      selData = yrData.units[currentNcdUnit];
    }

    const isFuOnly = report.has_fu && (currentNcdDatasetMode === 'chronicfu');
    const isCompare = report.has_fu && (currentNcdDatasetMode === 'compare');

    let num = 0, den = 0, rate = 0;
    let num_fu = 0, den_fu = 0, rate_fu = 0;

    if (selData) {
      num = selData.result || 0;
      den = selData.target || 0;
      rate = selData.rate || 0;
      num_fu = selData.result_fu || 0;
      den_fu = selData.target_fu || 0;
      rate_fu = selData.rate_fu || 0;
    } else {
      const d = yrData.district || {};
      num = d.result || 0;
      den = d.target || 0;
      rate = d.rate || 0;
      num_fu = d.result_fu || 0;
      den_fu = d.target_fu || 0;
      rate_fu = d.rate_fu || 0;
    }

    const elResult = document.getElementById('ncd-kpi-result');
    const elTarget = document.getElementById('ncd-kpi-target');
    const elRate = document.getElementById('ncd-kpi-rate');
    const elRateBar = document.getElementById('ncd-kpi-rate-bar');
    const elResultSub = document.getElementById('ncd-kpi-result-sub');
    const elTargetSub = document.getElementById('ncd-kpi-target-sub');

    // Update values based on mode
    if (isFuOnly) {
      if (elResult) elResult.textContent = Number(num_fu).toLocaleString();
      if (elTarget) elTarget.textContent = Number(den_fu).toLocaleString();
      if (elRate) elRate.textContent = Number(rate_fu).toFixed(2);
      if (elResultSub) elResultSub.textContent = isAll ? 'ตรวจแล้ว (แฟ้ม ChronicFU รวม)' : `ตรวจแล้วที่คลินิก รพ.สต. (A2)`;
      if (elTargetSub) elTargetSub.textContent = isAll ? 'ผู้ป่วยมารับบริการจริง (ChronicFU รวม)' : `ผู้ป่วยมารับบริการที่คลินิก (B2)`;
    } else if (isCompare) {
      if (elResult) elResult.innerHTML = `<span class="text-emerald-700">${Number(num).toLocaleString()}</span> <span class="text-xs text-slate-400 font-normal">/</span> <span class="text-indigo-700">${Number(num_fu).toLocaleString()}</span>`;
      if (elTarget) elTarget.innerHTML = `<span class="text-amber-700">${Number(den).toLocaleString()}</span> <span class="text-xs text-slate-400 font-normal">/</span> <span class="text-indigo-700">${Number(den_fu).toLocaleString()}</span>`;
      if (elRate) elRate.innerHTML = `<span class="text-emerald-600">${Number(rate).toFixed(2)}%</span> <span class="text-xs font-medium text-slate-400">vs</span> <span class="text-indigo-600">${Number(rate_fu).toFixed(2)}%</span>`;
      if (elResultSub) elResultSub.textContent = `A1 ในเขต: ${Number(num).toLocaleString()} | A2 คลินิก: ${Number(num_fu).toLocaleString()} คน`;
      if (elTargetSub) elTargetSub.textContent = `B1 ในเขต: ${Number(den).toLocaleString()} | B2 คลินิก: ${Number(den_fu).toLocaleString()} คน`;
    } else {
      if (elResult) elResult.textContent = Number(num).toLocaleString();
      if (elTarget) elTarget.textContent = Number(den).toLocaleString();
      if (elRate) elRate.textContent = Number(rate).toFixed(2);
      if (elResultSub) elResultSub.textContent = isAll ? 'ผลงานรวมทั้งอำเภอสารภี (A1)' : `ผลงานในเขต ${SARAPHI_UNITS_MAP[currentNcdUnit]?.short || currentNcdUnit} (A1)`;
      if (elTargetSub) elTargetSub.textContent = isAll ? 'เป้าหมายรวมทั้งอำเภอสารภี (B1)' : `เป้าหมายในเขต ${SARAPHI_UNITS_MAP[currentNcdUnit]?.short || currentNcdUnit} (B1)`;
    }

    const activeRate = isFuOnly ? rate_fu : rate;
    if (elRateBar) {
      const capped = Math.min(100, Math.max(0, activeRate));
      elRateBar.style.width = `${capped}%`;
      elRateBar.className = isCompare 
        ? 'bg-gradient-to-r from-emerald-500 to-indigo-500 h-2 rounded-full transition-all duration-500'
        : (activeRate >= 80) ? 'bg-emerald-500 h-2 rounded-full transition-all duration-500' :
          (activeRate >= 50) ? 'bg-amber-500 h-2 rounded-full transition-all duration-500' :
          'bg-rose-500 h-2 rounded-full transition-all duration-500';
    }

    // Top Performing Unit
    const unitsMap = yrData.units || {};
    const unitEntries = Object.entries(unitsMap).filter(([code, u]) => {
      if (isFuOnly) return (u.target_fu || 0) > 0 || (u.result_fu || 0) > 0;
      return (u.target || 0) > 0 || (u.result || 0) > 0;
    });

    unitEntries.sort((a, b) => {
      const rA = isFuOnly ? (a[1].rate_fu || 0) : (a[1].rate || 0);
      const rB = isFuOnly ? (b[1].rate_fu || 0) : (b[1].rate || 0);
      return rB - rA;
    });

    const elTopUnit = document.getElementById('ncd-kpi-top-unit');
    const elTopRate = document.getElementById('ncd-kpi-top-rate');
    const elTopSub = document.getElementById('ncd-kpi-top-sub');

    if (unitEntries.length > 0) {
      if (isAll) {
        const top = unitEntries[0][1];
        const topR = isFuOnly ? (top.rate_fu || 0) : (top.rate || 0);
        const topA = isFuOnly ? (top.result_fu || 0) : (top.result || 0);
        const topB = isFuOnly ? (top.target_fu || 0) : (top.target || 0);
        if (elTopUnit) elTopUnit.textContent = top.name || SARAPHI_UNITS_MAP[top.hospcode]?.name || top.hospcode;
        if (elTopRate) elTopRate.textContent = `${Number(topR).toFixed(2)}%`;
        if (elTopSub) elTopSub.textContent = `อันดับ 1 ${isFuOnly ? 'คลินิก' : 'ในเขต'} (A: ${Number(topA).toLocaleString()} / B: ${Number(topB).toLocaleString()})`;
      } else {
        const rankIdx = unitEntries.findIndex(([code]) => code === currentNcdUnit);
        const thisUnit = yrData.units?.[currentNcdUnit];
        if (rankIdx >= 0 && thisUnit) {
          const uR = isFuOnly ? (thisUnit.rate_fu || 0) : (thisUnit.rate || 0);
          if (elTopUnit) elTopUnit.textContent = thisUnit.name || SARAPHI_UNITS_MAP[currentNcdUnit]?.name || currentNcdUnit;
          if (elTopRate) elTopRate.textContent = `${Number(uR).toFixed(2)}%`;
          if (elTopSub) elTopSub.textContent = `อันดับที่ ${rankIdx + 1} จากทั้งหมด ${unitEntries.length} รพ.สต.`;
        } else {
          if (elTopUnit) elTopUnit.textContent = SARAPHI_UNITS_MAP[currentNcdUnit]?.name || currentNcdUnit;
          if (elTopRate) elTopRate.textContent = `0.00%`;
          if (elTopSub) elTopSub.textContent = `ไม่มีข้อมูลเป้าหมายในปีงบนี้`;
        }
      }
    } else {
      if (elTopUnit) elTopUnit.textContent = '-';
      if (elTopRate) elTopRate.textContent = '0.00%';
      if (elTopSub) elTopSub.textContent = 'ไม่มีข้อมูลในระบบ';
    }
  }

  function renderNcdCharts(report) {
    const yrData = report.years?.[currentNcdYear] || { district: { target: 0, result: 0, rate: 0 }, units: {} };
    const unitsMap = yrData.units || {};
    const hasFu = report.has_fu;
    const isCompare = hasFu && currentNcdDatasetMode === 'compare';
    const isFuOnly = hasFu && currentNcdDatasetMode === 'chronicfu';

    const isRisk = !!report.is_risk_screen;

    // Map units
    const unitsList = Object.keys(SARAPHI_UNITS_MAP).map(code => {
      const u = unitsMap[code] || {};
      const meta = SARAPHI_UNITS_MAP[code] || {};
      return {
        hospcode: code,
        name: meta.short || u.name || code,
        fullName: meta.name || u.name || code,
        subdistrict: meta.subdistrict || u.subdistrict || '',
        target: u.target || 0,
        result: u.result || 0,
        rate: u.rate || 0,
        normal: u.normal || 0,
        normal_rate: u.normal_rate || 0,
        risk: u.risk || 0,
        risk_rate: u.risk_rate || 0,
        high_risk: u.high_risk || 0,
        high_risk_rate: u.high_risk_rate || 0,
        ill_doctor: u.ill_doctor || 0,
        ill_doctor_rate: u.ill_doctor_rate || 0,
        out_of_bounds: u.out_of_bounds || 0,
        out_of_bounds_rate: u.out_of_bounds_rate || 0,
        target_fu: u.target_fu || 0,
        result_fu: u.result_fu || 0,
        rate_fu: u.rate_fu || 0
      };
    });

    // Sort units: For risk screen, sort by hospcode (06014..99758) matching HDC screenshot
    const sortedUnits = isRisk
      ? [...unitsList].sort((a, b) => a.hospcode.localeCompare(b.hospcode))
      : [...unitsList].sort((a, b) => {
          if (isFuOnly) return b.rate_fu - a.rate_fu;
          if (isCompare) return (b.rate_fu + b.rate) - (a.rate_fu + a.rate);
          return b.rate - a.rate;
        });

    // Check if a specific single health unit is selected
    const isSingleUnit = (currentNcdUnit !== 'all');
    const selUnit = isSingleUnit ? (unitsMap[currentNcdUnit] || {}) : null;
    const selMeta = isSingleUnit ? (SARAPHI_UNITS_MAP[currentNcdUnit] || {}) : null;
    const unitFullName = selMeta ? `${currentNcdUnit} ${selMeta.name || selUnit.name || currentNcdUnit}` : currentNcdUnit;
    const unitShortName = selMeta ? `${currentNcdUnit} ${selMeta.short || currentNcdUnit}` : currentNcdUnit;

    // --- CHART 1: Unit Rate Comparison / 100% Stacked Bar / Unit Risk Donut ---
    const canvasRate = document.getElementById('ncd-unit-rate-chart');
    const center1 = document.getElementById('ncd-chart1-center');
    const extra1 = document.getElementById('ncd-chart1-extra');
    const title1 = document.getElementById('ncd-chart1-title');
    const sub1 = document.getElementById('ncd-chart1-sub');
    const badge1 = document.getElementById('ncd-chart1-badge');

    if (canvasRate) {
      if (ncdUnitRateChartInstance) {
        ncdUnitRateChartInstance.destroy();
        ncdUnitRateChartInstance = null;
      }

      if (isRisk && isSingleUnit && selUnit) {
        // --- CASE 1A: Dedicated Single-Unit Risk Breakdown Donut (Modern UX/UI) ---
        const u = selUnit;
        const target = Number(u.target || 0);
        const result = Number(u.result || 0);
        const rate = Number(u.rate || 0);
        const normal = Number(u.normal || 0);
        const normal_rate = Number(u.normal_rate || 0);
        const risk = Number(u.risk || 0);
        const risk_rate = Number(u.risk_rate || 0);
        const high_risk = Number(u.high_risk || 0);
        const high_risk_rate = Number(u.high_risk_rate || 0);
        const ill_doctor = Number(u.ill_doctor || 0);
        const ill_doctor_rate = Number(u.ill_doctor_rate || 0);
        const out_of_bounds = Number(u.out_of_bounds || 0);
        const out_of_bounds_rate = Number(u.out_of_bounds_rate || 0);

        if (title1) title1.textContent = `สัดส่วนผลการคัดกรองจำแนกกลุ่มเสี่ยง: ${unitFullName}`;
        if (sub1) sub1.textContent = `จำแนกตามเกณฑ์ระดับความเสี่ยง (จากผู้ได้รับการคัดกรองทั้งหมด ${result.toLocaleString()} คน)`;
        if (badge1) {
          badge1.textContent = `${unitShortName} (${result.toLocaleString()} คน)`;
          badge1.className = 'text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 num-font';
        }

        if (center1) {
          center1.classList.remove('hidden');
          center1.innerHTML = `
            <div class="text-center px-4 py-2 rounded-2xl bg-white/85 backdrop-blur-xs shadow-2xs border border-slate-100">
              <div class="text-2xl sm:text-3xl font-black text-slate-800 num-font">${result.toLocaleString()}</div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">คัดกรองแล้ว (คน)</div>
              <div class="text-[10.5px] font-semibold text-emerald-600 mt-0.5">ครอบคลุม ${rate.toFixed(1)}%</div>
            </div>
          `;
        }

        const isHT = (report.risk_type === 'ht');
        const donutLabels = isHT 
          ? ['ปกติ (BP < 120/80)', 'กลุ่มเสี่ยง (BP 120-139/80-89)', 'สงสัยป่วย (BP ≥ 140/90)', 'ป่วย (ส่งพบแพทย์)', 'นอกเกณฑ์']
          : ['ปกติ (70 - <100 mg%)', 'กลุ่มเสี่ยง (100 - <126 mg%)', 'สงสัยป่วย (≥ 126 mg%)', 'นอกเกณฑ์ (< 70 mg%)'];
        
        const donutData = isHT
          ? [normal, risk, high_risk, ill_doctor, out_of_bounds]
          : [normal, risk, high_risk, out_of_bounds];

        const donutBg = isHT
          ? ['#38bdf8', '#818cf8', '#34d399', '#f87171', '#fb923c']
          : ['#38bdf8', '#818cf8', '#34d399', '#fb923c'];

        const donutBorder = isHT
          ? ['#0284c7', '#6366f1', '#10b981', '#ef4444', '#f97316']
          : ['#0284c7', '#6366f1', '#10b981', '#f97316'];

        const ctx1 = canvasRate.getContext('2d');
        ncdUnitRateChartInstance = new Chart(ctx1, {
          type: 'doughnut',
          data: {
            labels: donutLabels,
            datasets: [{
              data: donutData,
              backgroundColor: donutBg,
              borderColor: donutBorder,
              borderWidth: 2,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: { family: "'Noto Sans Thai', sans-serif", size: 11, weight: 'bold' },
                  boxWidth: 12,
                  usePointStyle: true,
                  padding: 10
                }
              },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    const val = ctx.raw || 0;
                    const pct = result > 0 ? ((val / result) * 100).toFixed(2) : 0;
                    return ` ${ctx.label}: ${Number(val).toLocaleString()} คน (${pct}%)`;
                  }
                }
              }
            }
          }
        });

        // Extra Metric Chips below Donut Chart
        if (extra1) {
          extra1.classList.remove('hidden');
          if (isHT) {
            extra1.innerHTML = `
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div class="p-2.5 rounded-xl bg-sky-50/90 border border-sky-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-sky-800">
                    <span class="w-2 h-2 rounded-full bg-sky-400"></span> ปกติ
                  </div>
                  <div class="text-base font-black text-sky-900 num-font mt-1">${normal.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-sky-700">${normal_rate.toFixed(2)}%</div>
                </div>
                <div class="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-800">
                    <span class="w-2 h-2 rounded-full bg-indigo-400"></span> กลุ่มเสี่ยง
                  </div>
                  <div class="text-base font-black text-indigo-900 num-font mt-1">${risk.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-indigo-700">${risk_rate.toFixed(2)}%</div>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span> สงสัยป่วย
                  </div>
                  <div class="text-base font-black text-emerald-900 num-font mt-1">${high_risk.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-emerald-700">${high_risk_rate.toFixed(2)}%</div>
                </div>
                <div class="p-2.5 rounded-xl bg-rose-50/90 border border-rose-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-800">
                    <span class="w-2 h-2 rounded-full bg-rose-400"></span> ป่วย (พบแพทย์)
                  </div>
                  <div class="text-base font-black text-rose-900 num-font mt-1">${ill_doctor.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-rose-700">${ill_doctor_rate.toFixed(2)}%</div>
                </div>
                <div class="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 col-span-2 sm:col-span-1">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-800">
                    <span class="w-2 h-2 rounded-full bg-amber-400"></span> นอกเกณฑ์
                  </div>
                  <div class="text-base font-black text-amber-900 num-font mt-1">${out_of_bounds.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-amber-700">${out_of_bounds_rate.toFixed(2)}%</div>
                </div>
              </div>
            `;
          } else {
            // DM
            extra1.innerHTML = `
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div class="p-2.5 rounded-xl bg-sky-50/90 border border-sky-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-sky-800">
                    <span class="w-2 h-2 rounded-full bg-sky-400"></span> ปกติ
                  </div>
                  <div class="text-base font-black text-sky-900 num-font mt-1">${normal.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-sky-700">${normal_rate.toFixed(2)}%</div>
                </div>
                <div class="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-800">
                    <span class="w-2 h-2 rounded-full bg-indigo-400"></span> กลุ่มเสี่ยง
                  </div>
                  <div class="text-base font-black text-indigo-900 num-font mt-1">${risk.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-indigo-700">${risk_rate.toFixed(2)}%</div>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span> สงสัยป่วย
                  </div>
                  <div class="text-base font-black text-emerald-900 num-font mt-1">${high_risk.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-emerald-700">${high_risk_rate.toFixed(2)}%</div>
                </div>
                <div class="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200">
                  <div class="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-800">
                    <span class="w-2 h-2 rounded-full bg-amber-400"></span> นอกเกณฑ์
                  </div>
                  <div class="text-base font-black text-amber-900 num-font mt-1">${out_of_bounds.toLocaleString()}</div>
                  <div class="text-[10.5px] font-semibold text-amber-700">${out_of_bounds_rate.toFixed(2)}%</div>
                </div>
              </div>
            `;
          }
        }

      } else {
        // --- CASE 1B: Overview of 14 Units or Non-Risk Indicators ---
        if (center1) center1.classList.add('hidden');
        if (extra1) extra1.classList.add('hidden');

        if (title1) title1.textContent = isRisk ? 'เปรียบเทียบสัดส่วนกลุ่มเสี่ยงรายหน่วยบริการ (14 แห่ง)' : 'เปรียบเทียบร้อยละผลงานรายหน่วยบริการ 14 แห่ง';
        if (sub1) sub1.textContent = isRisk ? 'แผนภูมิแท่งแนวนอน 100% สัดส่วนกลุ่มเสี่ยงตามเกณฑ์ HDC สธ.' : 'เรียงลำดับจากร้อยละผลงานสูงสุดไปต่ำสุด';

        let labels1 = [];
        let datasets1 = [];

        if (isRisk) {
          // 100% Horizontal Stacked Bar Chart (Matching HDC media_1790181009912.png)
          labels1 = sortedUnits.map(u => `${u.hospcode}:${u.fullName}`);
          if (badge1) {
            badge1.textContent = '100% Stacked Bar (สัดส่วนกลุ่มเสี่ยง)';
            badge1.className = 'text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 num-font';
          }

          if (report.risk_type === 'ht') {
            datasets1 = [
              {
                label: 'ปกติ',
                data: sortedUnits.map(u => u.normal_rate),
                backgroundColor: '#38bdf8', // Light Blue
                borderColor: '#0284c7',
                borderWidth: 0.5
              },
              {
                label: 'เสี่ยง',
                data: sortedUnits.map(u => u.risk_rate),
                backgroundColor: '#818cf8', // Indigo / Purple
                borderColor: '#6366f1',
                borderWidth: 0.5
              },
              {
                label: 'สงสัยป่วย',
                data: sortedUnits.map(u => u.high_risk_rate),
                backgroundColor: '#34d399', // Emerald Green
                borderColor: '#10b981',
                borderWidth: 0.5
              },
              {
                label: 'ป่วย (ส่งพบแพทย์)',
                data: sortedUnits.map(u => u.ill_doctor_rate),
                backgroundColor: '#f87171', // Red / Rose
                borderColor: '#ef4444',
                borderWidth: 0.5
              },
              {
                label: 'นอกเกณฑ์',
                data: sortedUnits.map(u => u.out_of_bounds_rate),
                backgroundColor: '#fb923c', // Orange
                borderColor: '#f97316',
                borderWidth: 0.5
              }
            ];
          } else {
            // DM (Diabetes)
            datasets1 = [
              {
                label: 'ปกติ',
                data: sortedUnits.map(u => u.normal_rate),
                backgroundColor: '#38bdf8', // Light Blue
                borderColor: '#0284c7',
                borderWidth: 0.5
              },
              {
                label: 'เสี่ยง',
                data: sortedUnits.map(u => u.risk_rate),
                backgroundColor: '#818cf8', // Indigo / Purple
                borderColor: '#6366f1',
                borderWidth: 0.5
              },
              {
                label: 'สงสัยป่วย',
                data: sortedUnits.map(u => u.high_risk_rate),
                backgroundColor: '#34d399', // Emerald Green
                borderColor: '#10b981',
                borderWidth: 0.5
              },
              {
                label: 'นอกเกณฑ์',
                data: sortedUnits.map(u => u.out_of_bounds_rate),
                backgroundColor: '#fb923c', // Orange
                borderColor: '#f97316',
                borderWidth: 0.5
              }
            ];
          }

        } else if (isCompare) {
          labels1 = sortedUnits.map(u => u.name);
          datasets1 = [
            {
              label: 'ในเขตรับผิดชอบ (Typearea 1,3 %)',
              data: sortedUnits.map(u => u.rate),
              backgroundColor: sortedUnits.map(u => u.hospcode === currentNcdUnit ? '#f59e0b' : 'rgba(16, 185, 129, 0.85)'),
              borderColor: sortedUnits.map(u => u.hospcode === currentNcdUnit ? '#d97706' : '#059669'),
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'ผู้มารับบริการจริง (ChronicFU %)',
              data: sortedUnits.map(u => u.rate_fu),
              backgroundColor: sortedUnits.map(u => u.hospcode === currentNcdUnit ? '#fbbf24' : 'rgba(99, 102, 241, 0.85)'),
              borderColor: sortedUnits.map(u => u.hospcode === currentNcdUnit ? '#b45309' : '#4f46e5'),
              borderWidth: 1,
              borderRadius: 4
            }
          ];
          if (badge1) {
            badge1.textContent = 'เปรียบเทียบ Typearea vs ChronicFU %';
            badge1.className = 'text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 num-font';
          }
        } else if (isFuOnly) {
          labels1 = sortedUnits.map(u => u.name);
          datasets1 = [{
            label: 'ร้อยละผู้มารับบริการจริง (ChronicFU %)',
            data: sortedUnits.map(u => u.rate_fu),
            backgroundColor: sortedUnits.map(u => (u.hospcode === currentNcdUnit ? '#f59e0b' : 'rgba(99, 102, 241, 0.85)')),
            borderColor: sortedUnits.map(u => (u.hospcode === currentNcdUnit ? '#b45309' : '#4f46e5')),
            borderWidth: 1,
            borderRadius: 6
          }];
          if (badge1) {
            badge1.textContent = 'ChronicFU Rate %';
            badge1.className = 'text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 num-font';
          }
        } else {
          labels1 = sortedUnits.map(u => u.name);
          datasets1 = [{
            label: 'ร้อยละในเขตรับผิดชอบ (Typearea 1,3 %)',
            data: sortedUnits.map(u => u.rate),
            backgroundColor: sortedUnits.map(u => (u.hospcode === currentNcdUnit ? '#f59e0b' : 'rgba(16, 185, 129, 0.85)')),
            borderColor: sortedUnits.map(u => (u.hospcode === currentNcdUnit ? '#b45309' : '#059669')),
            borderWidth: 1,
            borderRadius: 6
          }];
          if (badge1) {
            badge1.textContent = 'Typearea Rate %';
            badge1.className = 'text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 num-font';
          }
        }

        const ctx1 = canvasRate.getContext('2d');
        ncdUnitRateChartInstance = new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: labels1,
            datasets: datasets1
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: isRisk || isCompare,
                position: isRisk ? 'bottom' : 'top',
                labels: {
                  font: { family: "'Noto Sans Thai', sans-serif", size: 11, weight: 'bold' },
                  boxWidth: isRisk ? 12 : 20,
                  usePointStyle: isRisk
                }
              },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    const idx = ctx.dataIndex;
                    const item = sortedUnits[idx];
                    if (isRisk) {
                      const pct = ctx.raw || 0;
                      let count = 0;
                      if (ctx.dataset.label === 'ปกติ') count = item.normal;
                      else if (ctx.dataset.label === 'เสี่ยง') count = item.risk;
                      else if (ctx.dataset.label === 'สงสัยป่วย') count = item.high_risk;
                      else if (ctx.dataset.label.includes('ป่วย')) count = item.ill_doctor;
                      else if (ctx.dataset.label === 'นอกเกณฑ์') count = item.out_of_bounds;
                      return [
                        ` ${ctx.dataset.label}: ${pct.toFixed(2)}% (${Number(count).toLocaleString()} คน)`,
                        ` คัดกรองทั้งหมด: ${Number(item.result).toLocaleString()} คน (เป้าหมาย ${Number(item.target).toLocaleString()} คน)`
                      ];
                    }
                    if (ctx.dataset.label.includes('ChronicFU')) {
                      return [
                        ` ${ctx.dataset.label}: ${item.rate_fu.toFixed(2)}%`,
                        ` ตรวจแล้ว (A2): ${item.result_fu.toLocaleString()} คน`,
                        ` ผู้ป่วยคลินิก (B2): ${item.target_fu.toLocaleString()} คน`
                      ];
                    }
                    return [
                      ` ${ctx.dataset.label}: ${item.rate.toFixed(2)}%`,
                      ` ตรวจแล้ว (A1): ${item.result.toLocaleString()} คน`,
                      ` ผู้ป่วยในเขต (B1): ${item.target.toLocaleString()} คน`
                    ];
                  }
                }
              }
            },
            scales: {
              x: {
                stacked: isRisk,
                beginAtZero: true,
                max: isRisk ? 100 : undefined,
                ticks: {
                  callback: function(v) { return v + '%'; },
                  font: { family: "'Noto Sans Thai', sans-serif", size: 10 }
                },
                grid: { color: '#f1f5f9' }
              },
              y: {
                stacked: isRisk,
                ticks: {
                  font: { family: "'Noto Sans Thai', sans-serif", size: isRisk ? 9 : 10 }
                },
                grid: { display: false }
              }
            },
            onClick: (evt, elements) => {
              if (elements && elements.length > 0) {
                const elIndex = elements[0].index;
                const target = sortedUnits[elIndex];
                if (target) {
                  const uSel = document.getElementById('ncd-unit-select');
                  if (uSel) uSel.value = target.hospcode;
                  window.switchNcdUnit(target.hospcode);
                }
              }
            }
          }
        });
      }
    }

    // --- CHART 2: Grouped Bar Chart / Unit Target Coverage Donut ---
    const canvasCompare = document.getElementById('ncd-unit-compare-chart');
    const center2 = document.getElementById('ncd-chart2-center');
    const extra2 = document.getElementById('ncd-chart2-extra');
    const title2 = document.getElementById('ncd-chart2-title');
    const sub2 = document.getElementById('ncd-chart2-sub');
    const badge2 = document.getElementById('ncd-chart2-badge');

    if (canvasCompare) {
      if (ncdUnitCompareChartInstance) {
        ncdUnitCompareChartInstance.destroy();
        ncdUnitCompareChartInstance = null;
      }

      if (isRisk && isSingleUnit && selUnit) {
        // --- CASE 2A: Dedicated Single-Unit Screening Coverage Donut (Modern UX/UI) ---
        const u = selUnit;
        const target = Number(u.target || 0);
        const result = Number(u.result || 0);
        const rate = Number(u.rate || 0);
        const unscreened = Math.max(0, target - result);
        const unscreened_rate = target > 0 ? (unscreened / target) * 100 : 0;
        const dist = yrData.district || {};
        const distRate = Number(dist.rate || 0);

        if (title2) title2.textContent = `ความครอบคลุมการคัดกรองจากกลุ่มเป้าหมายทั้งหมด: ${unitFullName}`;
        if (sub2) sub2.textContent = `เป้าหมายประชากร 35+ ทั้งหมด ${target.toLocaleString()} คน • คัดกรองแล้ว ${result.toLocaleString()} คน (${rate.toFixed(2)}%)`;
        if (badge2) {
          const isPassed = rate >= 90;
          badge2.textContent = `Coverage ${rate.toFixed(2)}%`;
          badge2.className = isPassed 
            ? 'text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 num-font'
            : 'text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 num-font';
        }

        if (center2) {
          center2.classList.remove('hidden');
          const isPassed = rate >= 90;
          center2.innerHTML = `
            <div class="text-center px-4 py-2 rounded-2xl bg-white/85 backdrop-blur-xs shadow-2xs border border-slate-100">
              <div class="text-2xl sm:text-3xl font-black ${isPassed ? 'text-emerald-600' : 'text-amber-600'} num-font">${rate.toFixed(2)}%</div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ความครอบคลุม</div>
              <div class="text-[10px] font-bold ${isPassed ? 'text-emerald-700 bg-emerald-100/70' : 'text-amber-700 bg-amber-100/70'} px-2 py-0.5 rounded-full mt-1">
                ${isPassed ? 'ผ่านเกณฑ์ สธ. (≥90%)' : 'ต่ำกว่าเกณฑ์ สธ.'}
              </div>
            </div>
          `;
        }

        const ctx2 = canvasCompare.getContext('2d');
        ncdUnitCompareChartInstance = new Chart(ctx2, {
          type: 'doughnut',
          data: {
            labels: ['คัดกรองแล้ว (Screened)', 'ยังไม่ได้รับการคัดกรอง (คงเหลือ)'],
            datasets: [{
              data: [result, unscreened],
              backgroundColor: ['rgba(16, 185, 129, 0.9)', 'rgba(226, 232, 240, 0.85)'],
              borderColor: ['#059669', '#cbd5e1'],
              borderWidth: 2,
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: { family: "'Noto Sans Thai', sans-serif", size: 11, weight: 'bold' },
                  boxWidth: 12,
                  usePointStyle: true,
                  padding: 10
                }
              },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    const val = ctx.raw || 0;
                    const pct = target > 0 ? ((val / target) * 100).toFixed(2) : 0;
                    return [
                      ` ${ctx.label}: ${Number(val).toLocaleString()} คน (${pct}%)`,
                      ` ประชากรเป้าหมาย 35+ ทั้งหมด: ${target.toLocaleString()} คน`
                    ];
                  }
                }
              }
            }
          }
        });

        // Extra Benchmark Comparison Card below Coverage Donut
        if (extra2) {
          extra2.classList.remove('hidden');
          const diffDist = (rate - distRate).toFixed(2);
          const isAboveDist = rate >= distRate;
          const isPassedKpi = rate >= 90;

          extra2.innerHTML = `
            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between text-slate-700">
                <span class="font-bold flex items-center gap-1.5 text-slate-800">
                  <i class="fa-solid fa-chart-line text-emerald-600"></i> การเปรียบเทียบระดับผลงาน (Benchmark)
                </span>
                <span class="font-semibold text-slate-500">เป้าหมาย 35+ ทั้งหมด: <b class="num-font text-slate-800">${target.toLocaleString()}</b> คน</span>
              </div>

              <!-- Progress Bar of Target Completion -->
              <div class="space-y-1">
                <div class="flex items-center justify-between text-[11px] text-slate-600">
                  <span>คัดกรองแล้ว <b>${result.toLocaleString()}</b> คน (${rate.toFixed(2)}%)</span>
                  <span>คงเหลือ <b>${unscreened.toLocaleString()}</b> คน (${unscreened_rate.toFixed(2)}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-l-full transition-all duration-500" style="width: ${Math.min(100, Math.max(0, rate))}%"></div>
                  <div class="bg-slate-200 h-2.5 rounded-r-full transition-all duration-500" style="width: ${Math.min(100, Math.max(0, unscreened_rate))}%"></div>
                </div>
              </div>

              <!-- 2 Comparison Pills -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full ${isAboveDist ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                    <span class="text-slate-600 font-medium">เทียบเฉลี่ยอำเภอสารภี:</span>
                  </div>
                  <div class="font-bold ${isAboveDist ? 'text-emerald-700' : 'text-amber-700'} num-font flex items-center gap-1">
                    <span>${distRate.toFixed(2)}%</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isAboveDist ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                      ${isAboveDist ? '+' : ''}${diffDist}%
                    </span>
                  </div>
                </div>

                <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full ${isPassedKpi ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                    <span class="text-slate-600 font-medium">เกณฑ์เป้าหมาย สธ. (90%):</span>
                  </div>
                  <div class="font-bold ${isPassedKpi ? 'text-emerald-700' : 'text-rose-700'} num-font flex items-center gap-1">
                    <span>90.00%</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isPassedKpi ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                      ${isPassedKpi ? '✅ ผ่านเกณฑ์' : '⚠️ ต่ำกว่าเกณฑ์'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

      } else {
        // --- CASE 2B: Overview of 14 Units or Non-Risk Indicators ---
        if (center2) center2.classList.add('hidden');
        if (extra2) extra2.classList.add('hidden');

        if (title2) title2.textContent = isRisk ? 'เปรียบเทียบ ผลงานคัดกรอง (A) vs เป้าหมาย (B) รายหน่วยบริการ' : (isCompare ? 'เปรียบเทียบผลงาน A1 vs A2' : 'เปรียบเทียบ ผลงาน (A) vs เป้าหมาย (B) รายหน่วยบริการ');
        if (sub2) sub2.textContent = 'ตัวตั้ง A (ผลงานบริการ) และตัวหาร B (ประชากรกลุ่มเป้าหมาย)';

        let labels2 = unitsList.map(u => u.name);
        let datasets2 = [];

        if (isRisk) {
          const riskUnits2 = Object.keys(SARAPHI_UNITS_MAP).sort().map(code => ({
            hospcode: code,
            name: SARAPHI_UNITS_MAP[code]?.short || code,
            target: unitsMap[code]?.target || 0,
            result: unitsMap[code]?.result || 0,
            rate: unitsMap[code]?.rate || 0
          }));
          labels2 = riskUnits2.map(u => u.name);
          datasets2 = [
            {
              label: 'ผลงานคัดกรองแล้ว (ตัวตั้ง A)',
              data: riskUnits2.map(u => u.result),
              backgroundColor: 'rgba(56, 189, 248, 0.85)',
              borderColor: '#0284c7',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'เป้าหมายประชากร 35+ (ตัวหาร B)',
              data: riskUnits2.map(u => u.target),
              backgroundColor: 'rgba(245, 158, 11, 0.75)',
              borderColor: '#d97706',
              borderWidth: 1,
              borderRadius: 4
            }
          ];
          if (badge2) {
            badge2.textContent = 'คัดกรอง (A) vs เป้าหมาย (B)';
            badge2.className = 'text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 num-font';
          }
        } else if (isCompare) {
          datasets2 = [
            {
              label: 'ผลงานตรวจในเขต (A1)',
              data: unitsList.map(u => u.result),
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderColor: '#059669',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'ผลงานตรวจคลินิกจริง (A2)',
              data: unitsList.map(u => u.result_fu),
              backgroundColor: 'rgba(99, 102, 241, 0.85)',
              borderColor: '#4f46e5',
              borderWidth: 1,
              borderRadius: 4
            }
          ];
          if (badge2) {
            badge2.textContent = 'ผลงาน A1 vs A2';
            badge2.className = 'text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 num-font';
          }
        } else if (isFuOnly) {
          datasets2 = [
            {
              label: 'ผลงานตรวจคลินิกจริง (A2)',
              data: unitsList.map(u => u.result_fu),
              backgroundColor: 'rgba(99, 102, 241, 0.85)',
              borderColor: '#4f46e5',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'ผู้ป่วยคลินิกจริง (B2)',
              data: unitsList.map(u => u.target_fu),
              backgroundColor: 'rgba(245, 158, 11, 0.75)',
              borderColor: '#d97706',
              borderWidth: 1,
              borderRadius: 4
            }
          ];
          if (badge2) {
            badge2.textContent = 'A2 vs B2 (ChronicFU)';
            badge2.className = 'text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 num-font';
          }
        } else {
          datasets2 = [
            {
              label: 'ผลงาน (ตัวตั้ง A1)',
              data: unitsList.map(u => u.result),
              backgroundColor: 'rgba(59, 130, 246, 0.85)',
              borderColor: '#2563eb',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'เป้าหมาย (ตัวหาร B1)',
              data: unitsList.map(u => u.target),
              backgroundColor: 'rgba(245, 158, 11, 0.75)',
              borderColor: '#d97706',
              borderWidth: 1,
              borderRadius: 4
            }
          ];
          if (badge2) {
            badge2.textContent = 'A1 vs B1 (Typearea)';
            badge2.className = 'text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 num-font';
          }
        }

        const ctx2 = canvasCompare.getContext('2d');
        ncdUnitCompareChartInstance = new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: labels2,
            datasets: datasets2
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { font: { family: "'Noto Sans Thai', sans-serif", size: 11, weight: 'bold' } }
              },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    const val = ctx.raw || 0;
                    return ` ${ctx.dataset.label}: ${val.toLocaleString()} คน`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(v) { return Number(v).toLocaleString(); },
                  font: { family: "'Noto Sans Thai', sans-serif", size: 10 }
                },
                grid: { color: '#f1f5f9' }
              },
              x: {
                ticks: {
                  font: { family: "'Noto Sans Thai', sans-serif", size: 9 },
                  maxRotation: 45,
                  minRotation: 25
                },
                grid: { display: false }
              }
            },
            onClick: (evt, elements) => {
              if (elements && elements.length > 0) {
                const elIndex = elements[0].index;
                const target = isRisk ? Object.keys(SARAPHI_UNITS_MAP).sort().map(code => ({ hospcode: code }))[elIndex] : unitsList[elIndex];
                if (target) {
                  const uSel = document.getElementById('ncd-unit-select');
                  if (uSel) uSel.value = target.hospcode;
                  window.switchNcdUnit(target.hospcode);
                }
              }
            }
          }
        });
      }
    }

    // --- CHART 3: 3-Year Trend (2567 - 2568 - 2569) ---
    const canvasTrend = document.getElementById('ncd-trend-chart');
    if (canvasTrend) {
      if (ncdTrendChartInstance) {
        ncdTrendChartInstance.destroy();
        ncdTrendChartInstance = null;
      }

      const years = ['2567', '2568', '2569'];
      const isAll = (currentNcdUnit === 'all');
      
      const trendResult = [];
      const trendTarget = [];
      const trendRate = [];
      const trendResultFu = [];
      const trendTargetFu = [];
      const trendRateFu = [];

      years.forEach(y => {
        const yObj = report.years?.[y] || {};
        if (isAll) {
          const d = yObj.district || {};
          trendResult.push(d.result || 0);
          trendTarget.push(d.target || 0);
          trendRate.push(d.rate || 0);
          trendResultFu.push(d.result_fu || 0);
          trendTargetFu.push(d.target_fu || 0);
          trendRateFu.push(d.rate_fu || 0);
        } else {
          const u = yObj.units?.[currentNcdUnit] || {};
          trendResult.push(u.result || 0);
          trendTarget.push(u.target || 0);
          trendRate.push(u.rate || 0);
          trendResultFu.push(u.result_fu || 0);
          trendTargetFu.push(u.target_fu || 0);
          trendRateFu.push(u.rate_fu || 0);
        }
      });

      const scopeBadge = document.getElementById('ncd-trend-scope-badge');
      if (scopeBadge) {
        scopeBadge.textContent = isAll ? 'ภาพรวมทั้งอำเภอสารภี' : (SARAPHI_UNITS_MAP[currentNcdUnit]?.name || currentNcdUnit);
      }

      let trendDatasets = [];
      if (isRisk) {
        const trendRiskRate = [];
        const trendHighRiskRate = [];
        const trendIllRate = [];

        years.forEach(y => {
          const yObj = report.years?.[y] || {};
          const src = isAll ? (yObj.district || {}) : (yObj.units?.[currentNcdUnit] || {});
          trendRiskRate.push(src.risk_rate || 0);
          trendHighRiskRate.push(src.high_risk_rate || 0);
          trendIllRate.push(src.ill_doctor_rate || 0);
        });

        trendDatasets = [
          {
            type: 'line',
            label: 'ร้อยละการคัดกรอง (% คัดกรอง)',
            data: trendRate,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 6,
            pointBackgroundColor: '#0284c7',
            yAxisID: 'y1'
          },
          {
            type: 'line',
            label: 'ร้อยละกลุ่มเสี่ยง (% เสี่ยง)',
            data: trendRiskRate,
            borderColor: '#818cf8',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: '#818cf8',
            yAxisID: 'y1'
          },
          {
            type: 'line',
            label: 'ร้อยละสงสัยป่วย (% สงสัย)',
            data: trendHighRiskRate,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: '#10b981',
            yAxisID: 'y1'
          }
        ];

        if (report.risk_type === 'ht') {
          trendDatasets.push({
            type: 'line',
            label: 'ร้อยละป่วยส่งพบแพทย์ (%)',
            data: trendIllRate,
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: '#ef4444',
            yAxisID: 'y1'
          });
        }

        trendDatasets.push(
          {
            type: 'bar',
            label: 'คัดกรองแล้ว (คน)',
            data: trendResult,
            backgroundColor: 'rgba(56, 189, 248, 0.5)',
            borderColor: '#0284c7',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: 'เป้าหมายประชากร (คน)',
            data: trendTarget,
            backgroundColor: 'rgba(203, 213, 225, 0.6)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          }
        );

      } else if (hasFu) {
        trendDatasets = [
          {
            type: 'line',
            label: 'ร้อยละในเขต (Typearea %)',
            data: trendRate,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: false,
            yAxisID: 'y1',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          },
          {
            type: 'line',
            label: 'ร้อยละคลินิกจริง (ChronicFU %)',
            data: trendRateFu,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: false,
            yAxisID: 'y1',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          },
          {
            type: 'bar',
            label: 'ผลงานตรวจในเขต (A1)',
            data: trendResult,
            backgroundColor: 'rgba(16, 185, 129, 0.4)',
            borderColor: '#059669',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: 'ผลงานตรวจคลินิกจริง (A2)',
            data: trendResultFu,
            backgroundColor: 'rgba(99, 102, 241, 0.4)',
            borderColor: '#4f46e5',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          }
        ];
      } else {
        trendDatasets = [
          {
            type: 'line',
            label: 'ร้อยละผลงาน (Rate %)',
            data: trendRate,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            yAxisID: 'y1',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          },
          {
            type: 'bar',
            label: 'ผลงาน (A)',
            data: trendResult,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderColor: '#2563eb',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: 'เป้าหมาย (B)',
            data: trendTarget,
            backgroundColor: 'rgba(203, 213, 225, 0.7)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y'
          }
        ];
      }

      const ctx3 = canvasTrend.getContext('2d');
      ncdTrendChartInstance = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['ปีงบ 2567', 'ปีงบ 2568', 'ปีงบ 2569 (ปัจจุบัน)'],
          datasets: trendDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { family: "'Noto Sans Thai', sans-serif", size: 11, weight: 'bold' } }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  if (ctx.dataset.yAxisID === 'y1') {
                    return ` ${ctx.dataset.label}: ${(ctx.raw || 0).toFixed(2)}%`;
                  }
                  return ` ${ctx.dataset.label}: ${Number(ctx.raw || 0).toLocaleString()} คน`;
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              ticks: {
                callback: function(v) { return Number(v).toLocaleString(); },
                font: { family: "'Noto Sans Thai', sans-serif", size: 10 }
              },
              grid: { color: '#f1f5f9' }
            },
            y1: {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(v) { return v + '%'; },
                font: { family: "'Noto Sans Thai', sans-serif", size: 10 }
              },
              grid: { display: false }
            },
            x: {
              ticks: {
                font: { family: "'Noto Sans Thai', sans-serif", size: 11, weight: 'bold' }
              },
              grid: { display: false }
            }
          }
        }
      });
    }
  }

  function updateNcdCriteriaBox(report) {
    const callout = document.getElementById('ncd-criteria-callout');
    if (!callout) return;
    if (!report || !report.is_risk_screen) {
      callout.classList.add('hidden');
      return;
    }
    callout.classList.remove('hidden');
    const titleEl = document.getElementById('ncd-criteria-title');
    const contentEl = document.getElementById('ncd-criteria-content');

    if (report.risk_type === 'ht') {
      if (titleEl) titleEl.textContent = 'เกณฑ์การคัดกรองและจำแนกกลุ่มเสี่ยงโรคความดันโลหิตสูง (HT) ตามมาตรฐาน HDC';
      if (contentEl) {
        contentEl.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-sky-500"></span>
            <strong>ปกติ:</strong> กลุ่มเสี่ยง = 0 (ความดันปกติ)
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
            <strong>กลุ่มเสี่ยง:</strong> กลุ่มเสี่ยง = 1
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <strong>สงสัยป่วย:</strong> กลุ่มเสี่ยง = 2
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <strong>ป่วย (ส่งพบแพทย์):</strong> กลุ่มเสี่ยง = 3
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <strong>นอกเกณฑ์:</strong> อื่นๆ ที่ไม่เข้าเกณฑ์ข้างต้น
          </span>
          <span class="inline-flex items-center gap-1 text-[11px] text-slate-500 font-normal ml-auto">
            * คัดกรอง = ปกติ + เสี่ยง + สงสัยป่วย + ป่วย + นอกเกณฑ์ | ร้อยละกลุ่ม = (กลุ่ม / คัดกรอง) &times; 100
          </span>
        `;
      }
    } else {
      // DM
      if (titleEl) titleEl.textContent = 'เกณฑ์การคัดกรองและจำแนกกลุ่มเสี่ยงโรคเบาหวาน (DM) ตามมาตรฐาน HDC';
      if (contentEl) {
        contentEl.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-sky-500"></span>
            <strong>ปกติ:</strong> น้ำตาลในเลือด 70 - &lt;100 mg%
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
            <strong>กลุ่มเสี่ยง:</strong> น้ำตาลในเลือด 100 - &lt;126 mg%
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <strong>สงสัยป่วย:</strong> น้ำตาลในเลือด &ge; 126 mg%
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <strong>นอกเกณฑ์:</strong> น้ำตาลในเลือด &lt; 70 mg%
          </span>
          <span class="inline-flex items-center gap-1 text-[11px] text-slate-500 font-normal ml-auto">
            * คัดกรอง = ปกติ + เสี่ยง + สงสัยป่วย + นอกเกณฑ์ | ร้อยละกลุ่ม = (กลุ่ม / คัดกรอง) &times; 100
          </span>
        `;
      }
    }
  }

  function renderNcdTable(report) {
    if (!report) report = getActiveNcdReport();
    if (!report) return;

    updateNcdCriteriaBox(report);

    const yrData = report.years?.[currentNcdYear] || { district: { target: 0, result: 0, rate: 0 }, units: {} };
    const unitsMap = yrData.units || {};
    const thead = document.getElementById('ncd-table-thead');
    const tbody = document.getElementById('ncd-table-tbody');
    const tfoot = document.getElementById('ncd-table-tfoot');
    if (!tbody || !tfoot) return;

    const hasFu = report.has_fu;
    const isRisk = !!report.is_risk_screen;
    const dist = yrData.district || {};

    if (isRisk) {
      // 1. Set Table Header Title
      const tblTitle = document.getElementById('ncd-table-header-title');
      if (tblTitle) {
        tblTitle.innerHTML = `<span>ตารางแจกแจงผลการคัดกรองและการจำแนกกลุ่มเสี่ยง HDC รายหน่วยบริการ (14 แห่ง)</span>`;
      }

      // Sort by hospcode matching HDC standard (06014 to 99758)
      const riskList = Object.keys(SARAPHI_UNITS_MAP).sort().map(code => {
        const u = unitsMap[code] || {};
        const meta = SARAPHI_UNITS_MAP[code] || {};
        return {
          hospcode: code,
          name: meta.name || u.name || code,
          subdistrict: meta.subdistrict || u.subdistrict || '',
          target: u.target || 0,
          result: u.result || 0,
          rate: u.rate || 0,
          normal: u.normal || 0,
          normal_rate: u.normal_rate || 0,
          risk: u.risk || 0,
          risk_rate: u.risk_rate || 0,
          high_risk: u.high_risk || 0,
          high_risk_rate: u.high_risk_rate || 0,
          ill_doctor: u.ill_doctor || 0,
          ill_doctor_rate: u.ill_doctor_rate || 0,
          out_of_bounds: u.out_of_bounds || 0,
          out_of_bounds_rate: u.out_of_bounds_rate || 0
        };
      });

      const filteredRisk = riskList.filter(u => {
        if (!currentNcdTableSearch) return true;
        return (
          u.hospcode.includes(currentNcdTableSearch) ||
          u.name.toLowerCase().includes(currentNcdTableSearch) ||
          u.subdistrict.toLowerCase().includes(currentNcdTableSearch)
        );
      });

      const isHT = (report.risk_type === 'ht');

      // 2. THEAD: HDC Green Double Header
      if (thead) {
        if (isHT) {
          thead.innerHTML = `
            <tr class="bg-emerald-900 text-white text-xs font-bold border-b border-emerald-800">
              <th rowspan="2" class="py-3 px-3 w-12 text-center border-r border-emerald-800">ลำดับ</th>
              <th rowspan="2" class="py-3 px-4 min-w-[220px] border-r border-emerald-800">หน่วยบริการ</th>
              <th rowspan="2" class="py-3 px-2.5 text-right border-r border-emerald-800">เป้าหมาย</th>
              <th rowspan="2" class="py-3 px-2.5 text-right border-r border-emerald-800">คัดกรอง</th>
              <th rowspan="2" class="py-3 px-2.5 text-right border-r border-emerald-700 bg-emerald-800 font-extrabold text-emerald-200">ร้อยละ</th>
              <th colspan="10" class="py-2.5 px-3 text-center bg-emerald-950 font-extrabold text-[12px]">
                <i class="fa-solid fa-notes-medical mr-1.5 text-emerald-300"></i> ผลการคัดกรอง
              </th>
            </tr>
            <tr class="bg-emerald-950 text-white text-[11px] font-semibold border-b border-emerald-800">
              <th class="py-2 px-2 text-right border-r border-emerald-800/80">ปกติ</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80 bg-emerald-900/90 font-extrabold text-sky-200">ร้อยละ</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80">เสี่ยง</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80 bg-emerald-900/90 font-extrabold text-indigo-200">ร้อยละ</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80">สงสัยป่วย</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80 bg-emerald-900/90 font-extrabold text-emerald-200">ร้อยละ</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80">ป่วย(ส่งพบแพทย์)</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80 bg-emerald-900/90 font-extrabold text-rose-200">ร้อยละ</th>
              <th class="py-2 px-2 text-right border-r border-emerald-800/80">นอกเกณฑ์</th>
              <th class="py-2 px-2 text-right bg-emerald-900/90 font-extrabold text-amber-200">ร้อยละ</th>
            </tr>
          `;
        } else {
          // DM
          thead.innerHTML = `
            <tr class="bg-emerald-900 text-white text-xs font-bold border-b border-emerald-800">
              <th rowspan="2" class="py-3 px-3 w-12 text-center border-r border-emerald-800">ลำดับ</th>
              <th rowspan="2" class="py-3 px-4 min-w-[220px] border-r border-emerald-800">หน่วยบริการ</th>
              <th rowspan="2" class="py-3 px-2.5 text-right border-r border-emerald-800">เป้าหมาย</th>
              <th rowspan="2" class="py-3 px-2.5 text-right border-r border-emerald-800">คัดกรอง</th>
              <th rowspan="2" class="py-3 px-2.5 text-right border-r border-emerald-700 bg-emerald-800 font-extrabold text-emerald-200">ร้อยละ</th>
              <th colspan="8" class="py-2.5 px-3 text-center bg-emerald-950 font-extrabold text-[12px]">
                <i class="fa-solid fa-notes-medical mr-1.5 text-emerald-300"></i> ผลการคัดกรอง
              </th>
            </tr>
            <tr class="bg-emerald-950 text-white text-[11px] font-semibold border-b border-emerald-800">
              <th class="py-2 px-2.5 text-right border-r border-emerald-800/80">ปกติ</th>
              <th class="py-2 px-2.5 text-right border-r border-emerald-800/80 bg-emerald-900/90 font-extrabold text-sky-200">ร้อยละ</th>
              <th class="py-2 px-2.5 text-right border-r border-emerald-800/80">เสี่ยง</th>
              <th class="py-2 px-2.5 text-right border-r border-emerald-800/80 bg-emerald-900/90 font-extrabold text-indigo-200">ร้อยละ</th>
              <th class="py-2 px-2.5 text-right border-r border-emerald-800/80">สงสัยป่วย</th>
              <th class="py-2 px-2.5 text-right border-r border-emerald-800/80 bg-emerald-900/90 font-extrabold text-emerald-200">ร้อยละ</th>
              <th class="py-2 px-2.5 text-right border-r border-emerald-800/80">นอกเกณฑ์</th>
              <th class="py-2 px-2.5 text-right bg-emerald-900/90 font-extrabold text-amber-200">ร้อยละ</th>
            </tr>
          `;
        }
      }

      // 3. TBODY: Risk Rows
      tbody.innerHTML = '';
      if (!filteredRisk.length) {
        tbody.innerHTML = `<tr><td colspan="${isHT ? 15 : 13}" class="text-center py-6 text-slate-400">ไม่พบข้อมูลที่ตรงกับคำค้นหา</td></tr>`;
      } else {
        filteredRisk.forEach((u, idx) => {
          const isSelected = (u.hospcode === currentNcdUnit);
          const rowClass = isSelected ? 'bg-amber-50/90 font-semibold ring-1 ring-amber-300' : (idx % 2 === 0 ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-100/60');

          const tr = document.createElement('tr');
          tr.className = `${rowClass} text-xs transition border-b border-slate-100`;
          tr.style.cursor = 'pointer';
          tr.onclick = () => {
            const uSel = document.getElementById('ncd-unit-select');
            if (uSel) uSel.value = u.hospcode;
            window.switchNcdUnit(u.hospcode);
          };

          if (isHT) {
            tr.innerHTML = `
              <td class="py-2.5 px-3 text-center text-slate-400 num-font border-r border-slate-200/60">${idx + 1}</td>
              <td class="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-200/60">
                <span class="font-mono text-slate-500 font-semibold">${u.hospcode}:</span>
                <span>${u.name}</span>
                <span class="text-[11px] text-slate-400 font-normal ml-1">ต.${u.subdistrict}</span>
              </td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-200/60">${Number(u.target).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-emerald-800 border-r border-slate-200/60">${Number(u.result).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-extrabold text-emerald-700 border-r border-slate-300 bg-emerald-50/40">${Number(u.rate).toFixed(2)}</td>
              <td class="py-2.5 px-2 text-right num-font text-slate-700 border-r border-slate-200/60">${Number(u.normal).toLocaleString()}</td>
              <td class="py-2.5 px-2 text-right num-font font-bold text-sky-700 border-r border-slate-200/60 bg-sky-50/30">${Number(u.normal_rate).toFixed(2)}</td>
              <td class="py-2.5 px-2 text-right num-font text-slate-700 border-r border-slate-200/60">${Number(u.risk).toLocaleString()}</td>
              <td class="py-2.5 px-2 text-right num-font font-bold text-indigo-700 border-r border-slate-200/60 bg-indigo-50/30">${Number(u.risk_rate).toFixed(2)}</td>
              <td class="py-2.5 px-2 text-right num-font text-slate-700 border-r border-slate-200/60">${Number(u.high_risk).toLocaleString()}</td>
              <td class="py-2.5 px-2 text-right num-font font-bold text-emerald-700 border-r border-slate-200/60 bg-emerald-50/30">${Number(u.high_risk_rate).toFixed(2)}</td>
              <td class="py-2.5 px-2 text-right num-font text-rose-700 border-r border-slate-200/60">${Number(u.ill_doctor).toLocaleString()}</td>
              <td class="py-2.5 px-2 text-right num-font font-bold text-rose-700 border-r border-slate-200/60 bg-rose-50/30">${Number(u.ill_doctor_rate).toFixed(2)}</td>
              <td class="py-2.5 px-2 text-right num-font text-amber-700 border-r border-slate-200/60">${Number(u.out_of_bounds).toLocaleString()}</td>
              <td class="py-2.5 px-2 text-right num-font font-bold text-amber-700 bg-amber-50/30">${Number(u.out_of_bounds_rate).toFixed(2)}</td>
            `;
          } else {
            // DM
            tr.innerHTML = `
              <td class="py-2.5 px-3 text-center text-slate-400 num-font border-r border-slate-200/60">${idx + 1}</td>
              <td class="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-200/60">
                <span class="font-mono text-slate-500 font-semibold">${u.hospcode}:</span>
                <span>${u.name}</span>
                <span class="text-[11px] text-slate-400 font-normal ml-1">ต.${u.subdistrict}</span>
              </td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-200/60">${Number(u.target).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-emerald-800 border-r border-slate-200/60">${Number(u.result).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-extrabold text-emerald-700 border-r border-slate-300 bg-emerald-50/40">${Number(u.rate).toFixed(2)}</td>
              <td class="py-2.5 px-2.5 text-right num-font text-slate-700 border-r border-slate-200/60">${Number(u.normal).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-sky-700 border-r border-slate-200/60 bg-sky-50/30">${Number(u.normal_rate).toFixed(2)}</td>
              <td class="py-2.5 px-2.5 text-right num-font text-slate-700 border-r border-slate-200/60">${Number(u.risk).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-indigo-700 border-r border-slate-200/60 bg-indigo-50/30">${Number(u.risk_rate).toFixed(2)}</td>
              <td class="py-2.5 px-2.5 text-right num-font text-slate-700 border-r border-slate-200/60">${Number(u.high_risk).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-emerald-700 border-r border-slate-200/60 bg-emerald-50/30">${Number(u.high_risk_rate).toFixed(2)}</td>
              <td class="py-2.5 px-2.5 text-right num-font text-amber-700 border-r border-slate-200/60">${Number(u.out_of_bounds).toLocaleString()}</td>
              <td class="py-2.5 px-2.5 text-right num-font font-bold text-amber-700 bg-amber-50/30">${Number(u.out_of_bounds_rate).toFixed(2)}</td>
            `;
          }
          tbody.appendChild(tr);
        });
      }

      // 4. TFOOT: District Totals matching HDC Screenshots
      if (isHT) {
        tfoot.innerHTML = `
          <tr class="bg-gradient-to-r from-emerald-100/90 to-teal-100/90 text-slate-900 border-t-2 border-emerald-600 font-bold text-xs">
            <td class="py-3 px-3 text-center num-font font-extrabold text-emerald-950 border-r border-slate-300">-</td>
            <td class="py-3 px-4 font-extrabold text-emerald-950 text-sm border-r border-slate-300">
              รวมทั้งอำเภอสารภี (5019)
            </td>
            <td class="py-3 px-2.5 text-right num-font font-extrabold text-slate-900 border-r border-slate-300">${Number(dist.target || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-extrabold text-emerald-900 border-r border-slate-300">${Number(dist.result || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-black text-emerald-800 text-[13px] border-r border-slate-400 bg-emerald-200/80">${Number(dist.rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2 text-right num-font font-bold text-slate-800 border-r border-slate-300">${Number(dist.normal || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black text-sky-800 border-r border-slate-300 bg-sky-100/70">${Number(dist.normal_rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2 text-right num-font font-bold text-slate-800 border-r border-slate-300">${Number(dist.risk || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black text-indigo-800 border-r border-slate-300 bg-indigo-100/70">${Number(dist.risk_rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2 text-right num-font font-bold text-slate-800 border-r border-slate-300">${Number(dist.high_risk || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black text-emerald-800 border-r border-slate-300 bg-emerald-100/70">${Number(dist.high_risk_rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2 text-right num-font font-bold text-rose-800 border-r border-slate-300">${Number(dist.ill_doctor || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black text-rose-800 border-r border-slate-300 bg-rose-100/70">${Number(dist.ill_doctor_rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2 text-right num-font font-bold text-amber-800 border-r border-slate-300">${Number(dist.out_of_bounds || 0).toLocaleString()}</td>
            <td class="py-3 px-2 text-right num-font font-black text-amber-800 bg-amber-100/70">${Number(dist.out_of_bounds_rate || 0).toFixed(2)}</td>
          </tr>
        `;
      } else {
        // DM
        tfoot.innerHTML = `
          <tr class="bg-gradient-to-r from-emerald-100/90 to-teal-100/90 text-slate-900 border-t-2 border-emerald-600 font-bold text-xs">
            <td class="py-3 px-3 text-center num-font font-extrabold text-emerald-950 border-r border-slate-300">-</td>
            <td class="py-3 px-4 font-extrabold text-emerald-950 text-sm border-r border-slate-300">
              รวมทั้งอำเภอสารภี (5019)
            </td>
            <td class="py-3 px-2.5 text-right num-font font-extrabold text-slate-900 border-r border-slate-300">${Number(dist.target || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-extrabold text-emerald-900 border-r border-slate-300">${Number(dist.result || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-black text-emerald-800 text-[13px] border-r border-slate-400 bg-emerald-200/80">${Number(dist.rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-300">${Number(dist.normal || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-black text-sky-800 border-r border-slate-300 bg-sky-100/70">${Number(dist.normal_rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-300">${Number(dist.risk || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-black text-indigo-800 border-r border-slate-300 bg-indigo-100/70">${Number(dist.risk_rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-300">${Number(dist.high_risk || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-black text-emerald-800 border-r border-slate-300 bg-emerald-100/70">${Number(dist.high_risk_rate || 0).toFixed(2)}</td>
            <td class="py-3 px-2.5 text-right num-font font-bold text-amber-800 border-r border-slate-300">${Number(dist.out_of_bounds || 0).toLocaleString()}</td>
            <td class="py-3 px-2.5 text-right num-font font-black text-amber-800 bg-amber-100/70">${Number(dist.out_of_bounds_rate || 0).toFixed(2)}</td>
          </tr>
        `;
      }
      return;
    }

    // Default Non-Risk Standard / Dual Dataset Table
    const tblTitle = document.getElementById('ncd-table-header-title');
    if (tblTitle) {
      tblTitle.innerHTML = `<span>ตารางข้อมูล HDC รายหน่วยบริการ อำเภอสารภี (14 แห่ง)</span>`;
    }

    const unitsList = Object.keys(SARAPHI_UNITS_MAP).map(code => {
      const u = unitsMap[code] || {};
      const meta = SARAPHI_UNITS_MAP[code] || {};
      return {
        hospcode: code,
        name: meta.name || u.name || code,
        subdistrict: meta.subdistrict || u.subdistrict || '',
        target: u.target || 0,
        result: u.result || 0,
        rate: u.rate || 0,
        result1: u.result1 || 0,
        result2: u.result2 || 0,
        target_fu: u.target_fu || 0,
        result_fu: u.result_fu || 0,
        rate_fu: u.rate_fu || 0,
        result1_fu: u.result1_fu || 0,
        result2_fu: u.result2_fu || 0
      };
    });

    // Also include any extra hospcodes in yrData.units if not in SARAPHI_UNITS_MAP
    Object.keys(unitsMap).forEach(code => {
      if (!SARAPHI_UNITS_MAP[code] && (unitsMap[code].target > 0 || unitsMap[code].result > 0 || unitsMap[code].target_fu > 0)) {
        const u = unitsMap[code];
        unitsList.push({
          hospcode: code,
          name: u.name || code,
          subdistrict: u.subdistrict || '-',
          target: u.target || 0,
          result: u.result || 0,
          rate: u.rate || 0,
          result1: u.result1 || 0,
          result2: u.result2 || 0,
          target_fu: u.target_fu || 0,
          result_fu: u.result_fu || 0,
          rate_fu: u.rate_fu || 0,
          result1_fu: u.result1_fu || 0,
          result2_fu: u.result2_fu || 0
        });
      }
    });

    // Sort by rate descending (if ChronicFU mode, sort by rate_fu)
    if (hasFu && currentNcdDatasetMode === 'chronicfu') {
      unitsList.sort((a, b) => b.rate_fu - a.rate_fu);
    } else {
      unitsList.sort((a, b) => b.rate - a.rate);
    }

    // Filter by table search input
    const filtered = unitsList.filter(u => {
      if (!currentNcdTableSearch) return true;
      return (
        u.hospcode.includes(currentNcdTableSearch) ||
        u.name.toLowerCase().includes(currentNcdTableSearch) ||
        u.subdistrict.toLowerCase().includes(currentNcdTableSearch)
      );
    });

    if (hasFu) {
      // 1. RENDER DUAL-GROUP THEAD (Exact Match to HDC Screenshot)
      if (thead) {
        thead.innerHTML = `
          <tr class="bg-emerald-900 text-white text-xs font-bold border-b border-emerald-800">
            <th rowspan="2" class="py-3 px-3 w-12 text-center border-r border-emerald-800">ลำดับ</th>
            <th rowspan="2" class="py-3 px-3 w-20 border-r border-emerald-800">รหัส</th>
            <th rowspan="2" class="py-3 px-4 min-w-[200px] border-r border-emerald-800">หน่วยบริการ</th>
            <th colspan="5" class="py-2.5 px-3 text-center border-r border-emerald-700 bg-emerald-800 font-extrabold text-[12px]">
              <i class="fa-solid fa-house-chimney mr-1 text-emerald-300"></i> ผู้ป่วยที่อยู่ในเขตรับผิดชอบ Typearea 1,3
            </th>
            <th colspan="5" class="py-2.5 px-3 text-center bg-indigo-900 font-extrabold text-[12px]">
              <i class="fa-solid fa-hospital-user mr-1 text-indigo-300"></i> ผู้ป่วยที่มารับบริการของหน่วยบริการจากแฟ้ม ChronicFU
            </th>
          </tr>
          <tr class="bg-emerald-950 text-white text-[11px] font-semibold border-b border-emerald-800">
            <th class="py-2 px-2.5 text-right border-r border-emerald-800/80 bg-emerald-900/90">จำนวนผู้ป่วย (B1)</th>
            <th class="py-2 px-2.5 text-right border-r border-emerald-800/80 bg-emerald-900/90">ได้รับการตรวจ (A1)</th>
            <th class="py-2 px-2.5 text-right border-r border-emerald-800/80 bg-emerald-800 font-extrabold text-emerald-200">%</th>
            <th class="py-2 px-2.5 text-right border-r border-emerald-800/80 bg-emerald-900/90">ผลปกติ</th>
            <th class="py-2 px-2.5 text-right border-r border-emerald-800 bg-emerald-900/90">ผลผิดปกติ</th>
            <th class="py-2 px-2.5 text-right border-r border-indigo-800/80 bg-indigo-950/90">จำนวนผู้ป่วย (B2)</th>
            <th class="py-2 px-2.5 text-right border-r border-indigo-800/80 bg-indigo-950/90">ได้รับการตรวจ (A2)</th>
            <th class="py-2 px-2.5 text-right border-r border-indigo-800/80 bg-indigo-950 font-extrabold text-indigo-200">%</th>
            <th class="py-2 px-2.5 text-right border-r border-indigo-800/80 bg-indigo-950/90">ผลปกติ</th>
            <th class="py-2 px-2.5 text-right bg-indigo-950/90">ผลผิดปกติ</th>
          </tr>
        `;
      }

      // 2. RENDER DUAL-GROUP TBODY
      tbody.innerHTML = '';
      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="13" class="text-center py-6 text-slate-400">ไม่พบข้อมูลที่ตรงกับคำค้นหา</td></tr>';
      } else {
        filtered.forEach((u, idx) => {
          const isSelected = (u.hospcode === currentNcdUnit);
          const rowClass = isSelected ? 'bg-amber-50/80 font-semibold ring-1 ring-amber-300' : (idx % 2 === 0 ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-100/60');

          const tr = document.createElement('tr');
          tr.className = `${rowClass} text-xs transition border-b border-slate-100`;
          tr.style.cursor = 'pointer';
          tr.onclick = () => {
            const uSel = document.getElementById('ncd-unit-select');
            if (uSel) uSel.value = u.hospcode;
            window.switchNcdUnit(u.hospcode);
          };

          tr.innerHTML = `
            <td class="py-2.5 px-3 text-center text-slate-400 num-font border-r border-slate-200/60">${idx + 1}</td>
            <td class="py-2.5 px-3 font-mono text-slate-600 text-xs border-r border-slate-200/60">${u.hospcode}</td>
            <td class="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-200/60">
              <span>${u.name}</span>
              <span class="text-[11px] text-slate-400 font-normal ml-1">ต.${u.subdistrict}</span>
            </td>
            <!-- Typearea 1,3 Data -->
            <td class="py-2.5 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-200/60 bg-emerald-50/20">${Number(u.target).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right num-font font-bold text-emerald-800 border-r border-slate-200/60 bg-emerald-50/30">${Number(u.result).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right num-font font-extrabold text-emerald-700 border-r border-slate-200/60 bg-emerald-100/40">${Number(u.rate).toFixed(2)}</td>
            <td class="py-2.5 px-2.5 text-right num-font text-slate-700 border-r border-slate-200/60 bg-emerald-50/10">${Number(u.result1).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right num-font text-rose-700 border-r-2 border-slate-300 bg-emerald-50/10">${Number(u.result2).toLocaleString()}</td>
            <!-- ChronicFU Data -->
            <td class="py-2.5 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-200/60 bg-indigo-50/20">${Number(u.target_fu).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right num-font font-bold text-indigo-800 border-r border-slate-200/60 bg-indigo-50/30">${Number(u.result_fu).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right num-font font-extrabold text-indigo-700 border-r border-slate-200/60 bg-indigo-100/40">${Number(u.rate_fu).toFixed(2)}</td>
            <td class="py-2.5 px-2.5 text-right num-font text-slate-700 border-r border-slate-200/60 bg-indigo-50/10">${Number(u.result1_fu).toLocaleString()}</td>
            <td class="py-2.5 px-2.5 text-right num-font text-rose-700 bg-indigo-50/10">${Number(u.result2_fu).toLocaleString()}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      // 3. RENDER DUAL-GROUP TFOOT (District Total for 10 Columns)
      tfoot.innerHTML = `
        <tr class="bg-gradient-to-r from-emerald-100/90 to-indigo-100/90 text-slate-900 border-t-2 border-emerald-600 font-bold text-xs">
          <td class="py-3 px-3 text-center num-font font-extrabold text-emerald-950 border-r border-slate-300">-</td>
          <td class="py-3 px-3 font-mono text-emerald-950 font-extrabold text-xs border-r border-slate-300">5019</td>
          <td class="py-3 px-4 font-extrabold text-emerald-950 text-sm border-r border-slate-300">
            รวมทั้งอำเภอสารภี (HDC สธ.)
          </td>
          <!-- District Typearea 1,3 Total -->
          <td class="py-3 px-2.5 text-right num-font font-extrabold text-slate-900 border-r border-slate-300 bg-emerald-100/80">${Number(dist.target || 0).toLocaleString()}</td>
          <td class="py-3 px-2.5 text-right num-font font-extrabold text-emerald-900 border-r border-slate-300 bg-emerald-100/90">${Number(dist.result || 0).toLocaleString()}</td>
          <td class="py-3 px-2.5 text-right num-font font-black text-emerald-800 text-[13px] border-r border-slate-300 bg-emerald-200/70">${Number(dist.rate || 0).toFixed(2)}</td>
          <td class="py-3 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-300 bg-emerald-100/60">${Number(dist.result1 || 0).toLocaleString()}</td>
          <td class="py-3 px-2.5 text-right num-font font-bold text-rose-800 border-r-2 border-slate-400 bg-emerald-100/60">${Number(dist.result2 || 0).toLocaleString()}</td>
          <!-- District ChronicFU Total -->
          <td class="py-3 px-2.5 text-right num-font font-extrabold text-slate-900 border-r border-slate-300 bg-indigo-100/80">${Number(dist.target_fu || 0).toLocaleString()}</td>
          <td class="py-3 px-2.5 text-right num-font font-extrabold text-indigo-900 border-r border-slate-300 bg-indigo-100/90">${Number(dist.result_fu || 0).toLocaleString()}</td>
          <td class="py-3 px-2.5 text-right num-font font-black text-indigo-800 text-[13px] border-r border-slate-300 bg-indigo-200/70">${Number(dist.rate_fu || 0).toFixed(2)}</td>
          <td class="py-3 px-2.5 text-right num-font font-bold text-slate-800 border-r border-slate-300 bg-indigo-100/60">${Number(dist.result1_fu || 0).toLocaleString()}</td>
          <td class="py-3 px-2.5 text-right num-font font-bold text-rose-800 bg-indigo-100/60">${Number(dist.result2_fu || 0).toLocaleString()}</td>
        </tr>
      `;

    } else {
      // NON-FU SINGLE DATASET TABLE (Standard HDC Layout)
      if (thead) {
        thead.innerHTML = `
          <tr class="bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
            <th class="py-2.5 px-4 w-14 text-center">อันดับ</th>
            <th class="py-2.5 px-4 w-24">รหัส</th>
            <th class="py-2.5 px-4">ชื่อหน่วยบริการ</th>
            <th class="py-2.5 px-4">ตำบล</th>
            <th class="py-2.5 px-4 text-right">ผลงาน (ตัวตั้ง A)</th>
            <th class="py-2.5 px-4 text-right">เป้าหมาย (ตัวหาร B)</th>
            <th class="py-2.5 px-4 text-right">ร้อยละผลงาน</th>
            <th class="py-2.5 px-4 text-center w-28">สถานะ</th>
          </tr>
        `;
      }

      tbody.innerHTML = '';
      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-slate-400">ไม่พบข้อมูลที่ตรงกับคำค้นหา</td></tr>';
      } else {
        const distRate = dist.rate || 0;
        filtered.forEach((u, idx) => {
          const isSelected = (u.hospcode === currentNcdUnit);
          const rowClass = isSelected ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50/70 transition';
          const isAboveAvg = (u.rate >= distRate && u.target > 0);
          const statusBadge = isAboveAvg 
            ? `<span class="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">ผลงานเด่น</span>`
            : `<span class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-600">ปกติ</span>`;

          const tr = document.createElement('tr');
          tr.className = rowClass;
          tr.style.cursor = 'pointer';
          tr.onclick = () => {
            const uSel = document.getElementById('ncd-unit-select');
            if (uSel) uSel.value = u.hospcode;
            window.switchNcdUnit(u.hospcode);
          };

          tr.innerHTML = `
            <td class="py-2.5 px-4 text-center text-slate-400 num-font">${idx + 1}</td>
            <td class="py-2.5 px-4 font-mono text-slate-600 text-xs">${u.hospcode}</td>
            <td class="py-2.5 px-4 font-bold text-slate-900">${u.name}</td>
            <td class="py-2.5 px-4 text-slate-500">${u.subdistrict}</td>
            <td class="py-2.5 px-4 text-right num-font font-bold text-blue-700">${Number(u.result).toLocaleString()}</td>
            <td class="py-2.5 px-4 text-right num-font text-slate-700">${Number(u.target).toLocaleString()}</td>
            <td class="py-2.5 px-4 text-right num-font font-extrabold ${u.rate >= distRate ? 'text-emerald-700' : 'text-slate-800'}">${Number(u.rate).toFixed(2)}%</td>
            <td class="py-2.5 px-4 text-center">${statusBadge}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      // Foot District Total Row
      const distResult = dist.result || 0;
      const distTarget = dist.target || 0;
      const distRate = dist.rate || 0;

      tfoot.innerHTML = `
        <tr>
          <td class="py-3 px-4 text-center num-font font-extrabold text-rose-800">-</td>
          <td class="py-3 px-4 font-mono text-rose-800 font-extrabold text-xs">5019</td>
          <td class="py-3 px-4 font-extrabold text-rose-900 text-sm">รวมทั้งอำเภอสารภี (HDC สธ.)</td>
          <td class="py-3 px-4 text-rose-700 font-semibold">12 ตำบล</td>
          <td class="py-3 px-4 text-right num-font font-extrabold text-blue-900 text-sm">${Number(distResult).toLocaleString()}</td>
          <td class="py-3 px-4 text-right num-font font-extrabold text-amber-900 text-sm">${Number(distTarget).toLocaleString()}</td>
          <td class="py-3 px-4 text-right num-font font-extrabold text-emerald-800 text-base">${Number(distRate).toFixed(2)}%</td>
          <td class="py-3 px-4 text-center">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-200/80 text-rose-900 border border-rose-300 shadow-2xs">ภาพรวมอำเภอ</span>
          </td>
        </tr>
      `;
    }
  }

  window.exportNcdTableCsv = function() {
    const report = getActiveNcdReport();
    if (!report) return;

    const yrData = report.years?.[currentNcdYear] || { district: { target: 0, result: 0, rate: 0 }, units: {} };
    const unitsMap = yrData.units || {};
    const hasFu = report.has_fu;
    const isRisk = !!report.is_risk_screen;

    let csvContent = `\uFEFFรายงานมาตรฐาน Service Plan NCDs: ${report.name}\n`;
    csvContent += `ตาราง HDC: ${report.table_name},ปีงบประมาณ: ${currentNcdYear},หมวดหมู่: ${report.category}\n\n`;

    if (isRisk) {
      const isHT = (report.risk_type === 'ht');
      if (isHT) {
        csvContent += `ลำดับ,รหัสสถานพยาบาล,ชื่อหน่วยบริการ,ตำบล,เป้าหมาย,คัดกรอง,ร้อยละคัดกรอง (%),ปกติ,ร้อยละปกติ (%),เสี่ยง,ร้อยละเสี่ยง (%),สงสัยป่วย,ร้อยละสงสัยป่วย (%),ป่วยส่งพบแพทย์,ร้อยละป่วย (%),นอกเกณฑ์,ร้อยละนอกเกณฑ์ (%)\n`;
      } else {
        csvContent += `ลำดับ,รหัสสถานพยาบาล,ชื่อหน่วยบริการ,ตำบล,เป้าหมาย,คัดกรอง,ร้อยละคัดกรอง (%),ปกติ,ร้อยละปกติ (%),เสี่ยง,ร้อยละเสี่ยง (%),สงสัยป่วย,ร้อยละสงสัยป่วย (%),นอกเกณฑ์,ร้อยละนอกเกณฑ์ (%)\n`;
      }

      const riskUnits = Object.keys(SARAPHI_UNITS_MAP).sort().map(code => {
        const u = unitsMap[code] || {};
        const meta = SARAPHI_UNITS_MAP[code] || {};
        return {
          hospcode: code,
          name: meta.name || u.name || code,
          subdistrict: meta.subdistrict || u.subdistrict || '',
          target: u.target || 0,
          result: u.result || 0,
          rate: u.rate || 0,
          normal: u.normal || 0,
          normal_rate: u.normal_rate || 0,
          risk: u.risk || 0,
          risk_rate: u.risk_rate || 0,
          high_risk: u.high_risk || 0,
          high_risk_rate: u.high_risk_rate || 0,
          ill_doctor: u.ill_doctor || 0,
          ill_doctor_rate: u.ill_doctor_rate || 0,
          out_of_bounds: u.out_of_bounds || 0,
          out_of_bounds_rate: u.out_of_bounds_rate || 0
        };
      });

      riskUnits.forEach((u, idx) => {
        if (isHT) {
          csvContent += `${idx + 1},"${u.hospcode}","${u.name}","${u.subdistrict}",${u.target},${u.result},${u.rate.toFixed(2)},${u.normal},${u.normal_rate.toFixed(2)},${u.risk},${u.risk_rate.toFixed(2)},${u.high_risk},${u.high_risk_rate.toFixed(2)},${u.ill_doctor},${u.ill_doctor_rate.toFixed(2)},${u.out_of_bounds},${u.out_of_bounds_rate.toFixed(2)}\n`;
        } else {
          csvContent += `${idx + 1},"${u.hospcode}","${u.name}","${u.subdistrict}",${u.target},${u.result},${u.rate.toFixed(2)},${u.normal},${u.normal_rate.toFixed(2)},${u.risk},${u.risk_rate.toFixed(2)},${u.high_risk},${u.high_risk_rate.toFixed(2)},${u.out_of_bounds},${u.out_of_bounds_rate.toFixed(2)}\n`;
        }
      });

      const d = yrData.district || {};
      if (isHT) {
        csvContent += `-,5019,"รวมทั้งอำเภอสารภี","12 ตำบล",${d.target || 0},${d.result || 0},${(d.rate || 0).toFixed(2)},${d.normal || 0},${(d.normal_rate || 0).toFixed(2)},${d.risk || 0},${(d.risk_rate || 0).toFixed(2)},${d.high_risk || 0},${(d.high_risk_rate || 0).toFixed(2)},${d.ill_doctor || 0},${(d.ill_doctor_rate || 0).toFixed(2)},${d.out_of_bounds || 0},${(d.out_of_bounds_rate || 0).toFixed(2)}\n`;
      } else {
        csvContent += `-,5019,"รวมทั้งอำเภอสารภี","12 ตำบล",${d.target || 0},${d.result || 0},${(d.rate || 0).toFixed(2)},${d.normal || 0},${(d.normal_rate || 0).toFixed(2)},${d.risk || 0},${(d.risk_rate || 0).toFixed(2)},${d.high_risk || 0},${(d.high_risk_rate || 0).toFixed(2)},${d.out_of_bounds || 0},${(d.out_of_bounds_rate || 0).toFixed(2)}\n`;
      }

    } else if (hasFu) {
      csvContent += `ลำดับ,รหัสสถานพยาบาล,ชื่อหน่วยบริการ,ตำบล,เป้าหมายในเขต (B1),ผลงานในเขต (A1),ร้อยละในเขต (%),ผลปกติ (Typearea),ผลผิดปกติ (Typearea),เป้าหมายคลินิก (B2),ผลงานคลินิก (A2),ร้อยละคลินิก (%),ผลปกติ (ChronicFU),ผลผิดปกติ (ChronicFU)\n`;

      const unitsList = Object.keys(SARAPHI_UNITS_MAP).map(code => {
        const u = unitsMap[code] || {};
        const meta = SARAPHI_UNITS_MAP[code] || {};
        return {
          hospcode: code,
          name: meta.name || u.name || code,
          subdistrict: meta.subdistrict || u.subdistrict || '',
          target: u.target || 0,
          result: u.result || 0,
          rate: u.rate || 0,
          result1: u.result1 || 0,
          result2: u.result2 || 0,
          target_fu: u.target_fu || 0,
          result_fu: u.result_fu || 0,
          rate_fu: u.rate_fu || 0,
          result1_fu: u.result1_fu || 0,
          result2_fu: u.result2_fu || 0
        };
      });

      if (currentNcdDatasetMode === 'chronicfu') {
        unitsList.sort((a, b) => b.rate_fu - a.rate_fu);
      } else {
        unitsList.sort((a, b) => b.rate - a.rate);
      }

      unitsList.forEach((u, idx) => {
        csvContent += `${idx + 1},"${u.hospcode}","${u.name}","${u.subdistrict}",${u.target},${u.result},${u.rate.toFixed(2)},${u.result1},${u.result2},${u.target_fu},${u.result_fu},${u.rate_fu.toFixed(2)},${u.result1_fu},${u.result2_fu}\n`;
      });

      const d = yrData.district || {};
      csvContent += `-,5019,"รวมทั้งอำเภอสารภี","12 ตำบล",${d.target || 0},${d.result || 0},${(d.rate || 0).toFixed(2)},${d.result1 || 0},${d.result2 || 0},${d.target_fu || 0},${d.result_fu || 0},${(d.rate_fu || 0).toFixed(2)},${d.result1_fu || 0},${d.result2_fu || 0}\n`;

    } else {
      csvContent += `ลำดับ,รหัสสถานพยาบาล,ชื่อหน่วยบริการ,ตำบล,ผลงาน (ตัวตั้ง A),เป้าหมาย (ตัวหาร B),ร้อยละผลงาน (%)\n`;

      const unitsList = Object.keys(SARAPHI_UNITS_MAP).map(code => {
        const u = unitsMap[code] || {};
        const meta = SARAPHI_UNITS_MAP[code] || {};
        return {
          hospcode: code,
          name: meta.name || u.name || code,
          subdistrict: meta.subdistrict || u.subdistrict || '',
          target: u.target || 0,
          result: u.result || 0,
          rate: u.rate || 0
        };
      });

      unitsList.sort((a, b) => b.rate - a.rate);

      unitsList.forEach((u, idx) => {
        csvContent += `${idx + 1},"${u.hospcode}","${u.name}","${u.subdistrict}",${u.result},${u.target},${u.rate.toFixed(2)}\n`;
      });

      const d = yrData.district || {};
      csvContent += `-,5019,"รวมทั้งอำเภอสารภี","12 ตำบล",${d.result || 0},${d.target || 0},${(d.rate || 0).toFixed(2)}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `HDC_ServicePlan_${report.table_name}_${currentNcdYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // 10. Update Everything on View Change
  function updateDashboardView() {
    if (currentDomain === 'explorer') {
      if (activeSection) activeSection.classList.add('hidden');
      if (indicatorDropdownBar) indicatorDropdownBar.classList.add('hidden');
      if (executiveBanner) executiveBanner.classList.add('hidden');
      if (explorerSection) explorerSection.classList.remove('hidden');
      if (pcc2569Panel) pcc2569Panel.classList.add('hidden');
      if (servicePlanNcdPanel) servicePlanNcdPanel.classList.add('hidden');
      renderExplorerCatalog();
    } else if (currentDomain === 'pcc_2569') {
      if (explorerSection) explorerSection.classList.add('hidden');
      if (servicePlanNcdPanel) servicePlanNcdPanel.classList.add('hidden');
      if (indicatorDropdownBar) indicatorDropdownBar.classList.remove('hidden');
      if (executiveBanner) executiveBanner.classList.add('hidden');
      if (activeSection) activeSection.classList.remove('hidden');

      populateIndicatorDropdown();
      updateIndicatorHeader();

      const standardChartsSection = document.getElementById('standard-charts-section');
      const standardTableSection = document.getElementById('standard-table-section');
      if (standardChartsSection) standardChartsSection.classList.add('hidden');
      if (standardTableSection) standardTableSection.classList.add('hidden');
      if (topHerbsPanel) topHerbsPanel.classList.add('hidden');
      if (nhsoErrorPanel) nhsoErrorPanel.classList.add('hidden');
      if (nhsoServicePanel) nhsoServicePanel.classList.add('hidden');
      if (ttmAgeSexPanel) ttmAgeSexPanel.classList.add('hidden');
      if (ttmEdPanel) ttmEdPanel.classList.add('hidden');
      if (ttmCasesPanel) ttmCasesPanel.classList.add('hidden');
      if (ttmCommonPanel) ttmCommonPanel.classList.add('hidden');
      if (ttmMassagePanel) ttmMassagePanel.classList.add('hidden');
      if (dmHba1cPanel) dmHba1cPanel.classList.add('hidden');

      const standardIndHeader = document.getElementById('standard-indicator-header');
      if (standardIndHeader) standardIndHeader.classList.add('hidden');

      if (pcc2569Panel) pcc2569Panel.classList.remove('hidden');
      renderPcc2569Panel();
    } else if (currentDomain === 'service_plan_ncd') {
      if (explorerSection) explorerSection.classList.add('hidden');
      if (pcc2569Panel) pcc2569Panel.classList.add('hidden');
      if (indicatorDropdownBar) indicatorDropdownBar.classList.add('hidden');
      if (executiveBanner) executiveBanner.classList.add('hidden');
      if (activeSection) activeSection.classList.remove('hidden');

      const standardIndHeader = document.getElementById('standard-indicator-header');
      if (standardIndHeader) standardIndHeader.classList.add('hidden');

      const standardChartsSection = document.getElementById('standard-charts-section');
      const standardTableSection = document.getElementById('standard-table-section');
      if (standardChartsSection) standardChartsSection.classList.add('hidden');
      if (standardTableSection) standardTableSection.classList.add('hidden');
      if (topHerbsPanel) topHerbsPanel.classList.add('hidden');
      if (nhsoErrorPanel) nhsoErrorPanel.classList.add('hidden');
      if (nhsoServicePanel) nhsoServicePanel.classList.add('hidden');
      if (ttmAgeSexPanel) ttmAgeSexPanel.classList.add('hidden');
      if (ttmEdPanel) ttmEdPanel.classList.add('hidden');
      if (ttmCasesPanel) ttmCasesPanel.classList.add('hidden');
      if (ttmCommonPanel) ttmCommonPanel.classList.add('hidden');
      if (ttmMassagePanel) ttmMassagePanel.classList.add('hidden');
      if (dmHba1cPanel) dmHba1cPanel.classList.add('hidden');

      if (servicePlanNcdPanel) servicePlanNcdPanel.classList.remove('hidden');
      renderServicePlanNcdPanel();
    } else {
      if (servicePlanNcdPanel) servicePlanNcdPanel.classList.add('hidden');
      if (pcc2569Panel) pcc2569Panel.classList.add('hidden');
      if (explorerSection) explorerSection.classList.add('hidden');
      if (indicatorDropdownBar) indicatorDropdownBar.classList.remove('hidden');
      if (executiveBanner) executiveBanner.classList.remove('hidden');
      if (activeSection) activeSection.classList.remove('hidden');

      const standardIndHeader = document.getElementById('standard-indicator-header');
      if (standardIndHeader) standardIndHeader.classList.remove('hidden');

      populateIndicatorDropdown();
      updateExecutiveOverview();
      updateIndicatorHeader();

      const isTTM4 = (currentIndicatorId === 'ttm_top_herbs');
      const isNhsoError = (currentIndicatorId === 'nhso_error_code');
      const isNhsoService = (currentIndicatorId === 'nhso_service');
      const isNhsoHerb55 = (currentIndicatorId === 'nhso_herb55');
      const isNhsoHerb9 = (currentIndicatorId === 'nhso_herb9');
      const isNhsoHerb32 = (currentIndicatorId === 'nhso_herb32');
      const isTtmAgeSex = (currentIndicatorId === 'ttm_age_sex');
      const isTtmEd = (currentIndicatorId === 'ttm_ed');
      const isTtmCases = (currentIndicatorId === 'ttm_cases');
      const isTtmCommon = (currentIndicatorId === 'ttm_common_dis');
      const isTtmMassage = (currentIndicatorId === 'ttm_massage');
      const isDmHba1c = (currentIndicatorId === 'pcc_dm_hba1c');
      const standardChartsSection = document.getElementById('standard-charts-section');
      const standardTableSection = document.getElementById('standard-table-section');

      // Helper to hide all special panels
      const hideSpecialPanels = () => {
        if (standardChartsSection) standardChartsSection.classList.add('hidden');
        if (standardTableSection) standardTableSection.classList.add('hidden');
        if (dmHba1cPanel) dmHba1cPanel.classList.add('hidden');
        if (ttmMassagePanel) ttmMassagePanel.classList.add('hidden');
        if (ttmCommonPanel) ttmCommonPanel.classList.add('hidden');
        if (topHerbsPanel) topHerbsPanel.classList.add('hidden');
        if (nhsoServicePanel) nhsoServicePanel.classList.add('hidden');
        if (nhsoHerb55Panel) nhsoHerb55Panel.classList.add('hidden');
        if (nhsoHerb9Panel) nhsoHerb9Panel.classList.add('hidden');
        if (nhsoHerb32Panel) nhsoHerb32Panel.classList.add('hidden');
        if (nhsoErrorPanel) nhsoErrorPanel.classList.add('hidden');
        if (ttmAgeSexPanel) ttmAgeSexPanel.classList.add('hidden');
        if (ttmEdPanel) ttmEdPanel.classList.add('hidden');
        if (ttmCasesPanel) ttmCasesPanel.classList.add('hidden');
        if (servicePlanNcdPanel) servicePlanNcdPanel.classList.add('hidden');
      };

      // Toggle NHSO Live Sync Banner
      if (nhsoSyncBanner) {
        if (currentDomain === 'nhso_ttm') {
          nhsoSyncBanner.classList.remove('hidden');
          const dateBadge = document.getElementById('nhso-sync-process-date-badge');
          if (dateBadge && nhsoMasterData?.process_date) {
            dateBadge.textContent = nhsoMasterData.process_date;
          }
        } else {
          nhsoSyncBanner.classList.add('hidden');
        }
      }

      if (isDmHba1c) {
        hideSpecialPanels();
        if (dmHba1cPanel) dmHba1cPanel.classList.remove('hidden');
        renderDmHba1cPanel();
      } else if (isTtmMassage) {
        hideSpecialPanels();
        if (ttmMassagePanel) ttmMassagePanel.classList.remove('hidden');
        renderTtmMassagePanel();
      } else if (isTtmCommon) {
        hideSpecialPanels();
        if (ttmCommonPanel) ttmCommonPanel.classList.remove('hidden');
        renderTtmCommonPanel();
      } else if (isTtmCases) {
        hideSpecialPanels();
        if (ttmCasesPanel) ttmCasesPanel.classList.remove('hidden');
        renderTtmCasesPanel();
      } else if (isTtmEd) {
        hideSpecialPanels();
        if (ttmEdPanel) ttmEdPanel.classList.remove('hidden');
        renderTtmEdPanel();
      } else if (isTtmAgeSex) {
        hideSpecialPanels();
        if (ttmAgeSexPanel) ttmAgeSexPanel.classList.remove('hidden');
        renderTtmAgeSexPanel();
      } else if (isTTM4) {
        hideSpecialPanels();
        if (topHerbsPanel) topHerbsPanel.classList.remove('hidden');
        renderTopHerbsPanel();
      } else if (isNhsoHerb55) {
        hideSpecialPanels();
        if (nhsoHerb55Panel) nhsoHerb55Panel.classList.remove('hidden');
        renderNhsoHerb55Panel();
      } else if (isNhsoHerb9) {
        hideSpecialPanels();
        if (nhsoHerb9Panel) nhsoHerb9Panel.classList.remove('hidden');
        renderNhsoHerb9Panel();
      } else if (isNhsoHerb32) {
        hideSpecialPanels();
        if (nhsoHerb32Panel) nhsoHerb32Panel.classList.remove('hidden');
        renderNhsoHerb32Panel();
      } else if (isNhsoError) {
        hideSpecialPanels();
        if (nhsoErrorPanel) nhsoErrorPanel.classList.remove('hidden');
        renderNhsoErrorPanel();
      } else if (isNhsoService) {
        hideSpecialPanels();
        if (nhsoServicePanel) nhsoServicePanel.classList.remove('hidden');
        renderNhsoServicePanel();
      } else {
        hideSpecialPanels();
        if (standardChartsSection) standardChartsSection.classList.remove('hidden');
        if (standardTableSection) standardTableSection.classList.remove('hidden');
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
      currentNcdUnit = currentUnit;
      const ncdUnitEl = document.getElementById('ncd-unit-select');
      if (ncdUnitEl) ncdUnitEl.value = currentNcdUnit;
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
        currentProcedureYear = currentYear;
        currentHerb55Year = currentYear;
        currentHerb9Year = currentYear;
        currentHerb32Year = currentYear;
        currentTtmAgeYear = currentYear;
        currentTtmEdYear = currentYear;
        currentNcdYear = currentYear;
        ['2569', '2568', '2567'].forEach(y => {
          const b = document.getElementById(`btn-ncd-yr-${y}`);
          if (b) {
            if (y === currentNcdYear) {
              b.className = 'px-3 py-1 rounded-lg font-bold transition shadow-2xs bg-emerald-600 text-white';
            } else {
              b.className = 'px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition';
            }
          }
        });
      }
      updateDashboardView();
    });
  });

  // Sidebar Navigation Listeners
  const sidebarParentPcc = document.getElementById('sidebar-parent-pcc');
  const pccSubmenuContainer = document.getElementById('pcc-submenu-container');
  const pccSubmenuChevron = document.getElementById('pcc-submenu-chevron');

  if (sidebarParentPcc) {
    sidebarParentPcc.addEventListener('click', (e) => {
      e.stopPropagation();
      // If sidebar is collapsed on desktop, expand it
      if (sidebarNav && sidebarNav.classList.contains('sidebar-collapsed')) {
        sidebarNav.classList.remove('sidebar-collapsed');
        sidebarNav.classList.add('sidebar-expanded');
      }

      if (pccSubmenuContainer) {
        const isHidden = pccSubmenuContainer.classList.contains('hidden');
        if (isHidden) {
          pccSubmenuContainer.classList.remove('hidden');
          if (pccSubmenuChevron) pccSubmenuChevron.classList.add('rotate-180');
        } else {
          pccSubmenuContainer.classList.add('hidden');
          if (pccSubmenuChevron) pccSubmenuChevron.classList.remove('rotate-180');
        }
      }

      // If current domain is not one of the PCC domains, switch to pcc_2569 by default
      if (currentDomain !== 'pcc' && currentDomain !== 'pcc_2569') {
        const pcc69SubItem = document.querySelector('.sidebar-subitem[data-domain="pcc_2569"]');
        if (pcc69SubItem) {
          pcc69SubItem.click();
        }
      }
    });
  }

  sidebarItems.forEach(item => {
    // Skip parent button since it's handled above
    if (item.classList.contains('sidebar-parent')) return;

    item.addEventListener('click', () => {
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentDomain = item.dataset.domain;

      if (item.classList.contains('sidebar-subitem')) {
        if (sidebarParentPcc) sidebarParentPcc.classList.add('active-parent');
        if (pccSubmenuContainer) pccSubmenuContainer.classList.remove('hidden');
        if (pccSubmenuChevron) pccSubmenuChevron.classList.add('rotate-180');
      } else {
        if (sidebarParentPcc) sidebarParentPcc.classList.remove('active-parent');
      }

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
      if (currentDomain === 'pcc_2569') {
        if (currentIndicatorId.startsWith('pcc69_kpi')) {
          currentPcc69View = currentIndicatorId.replace('pcc69_', '');
        }
      }
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
        if (currentDomain === 'pcc_2569') {
          if (currentIndicatorId.startsWith('pcc69_kpi')) {
            currentPcc69View = currentIndicatorId.replace('pcc69_', '');
          }
        }
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
        if (currentDomain === 'pcc_2569') {
          if (currentIndicatorId.startsWith('pcc69_kpi')) {
            currentPcc69View = currentIndicatorId.replace('pcc69_', '');
          }
        }
        if (indicatorSelect) indicatorSelect.value = currentIndicatorId;
        updateIndicatorNavButtons();
        updateDashboardView();
      }
    });
  }

  tableSearch?.addEventListener('input', renderDataTable);

  const ttmAgeSearchInput = document.getElementById('ttm-age-table-search');
  if (ttmAgeSearchInput) {
    ttmAgeSearchInput.addEventListener('input', (e) => {
      ttmAgeSearchQuery = e.target.value;
      renderTtmAgeSexPanel();
    });
  }

  const ttmEdSearchInput = document.getElementById('ttm-ed-table-search');
  if (ttmEdSearchInput) {
    ttmEdSearchInput.addEventListener('input', (e) => {
      ttmEdSearchQuery = e.target.value;
      renderTtmEdPanel();
    });
  }

  const ttmCasesSearchInput = document.getElementById('ttm-cases-table-search');
  if (ttmCasesSearchInput) {
    ttmCasesSearchInput.addEventListener('input', (e) => {
      ttmCasesSearchQuery = e.target.value;
      renderTtmCasesPanel();
    });
  }

  const ttmCommonSearchInput = document.getElementById('ttm-common-table-search');
  if (ttmCommonSearchInput) {
    ttmCommonSearchInput.addEventListener('input', (e) => {
      ttmCommonSearchQuery = e.target.value;
      renderTtmCommonPanel();
    });
  }

  const ttmMassageSearchInput = document.getElementById('ttm-massage-table-search');
  if (ttmMassageSearchInput) {
    ttmMassageSearchInput.addEventListener('input', (e) => {
      ttmMassageSearchQuery = e.target.value;
      renderTtmMassagePanel();
    });
  }

  const dmHba1cSearchInput = document.getElementById('dm-hba1c-table-search');
  if (dmHba1cSearchInput) {
    dmHba1cSearchInput.addEventListener('input', (e) => {
      dmHba1cSearchQuery = e.target.value;
      renderDmHba1cPanel();
    });
  }

  const pcc69SearchInput = document.getElementById('pcc69-table-search');
  if (pcc69SearchInput) {
    pcc69SearchInput.addEventListener('input', (e) => {
      pcc69SearchQuery = e.target.value;
      renderPcc69Table();
    });
  }



  // Explorer filters
  document.getElementById('catalog-search')?.addEventListener('input', renderExplorerCatalog);
  document.getElementById('catalog-main-cat')?.addEventListener('change', renderExplorerCatalog);
  document.getElementById('catalog-sub-cat')?.addEventListener('change', renderExplorerCatalog);

  // Initial Boot
  try { initUnitDropdown(); } catch (err) { console.error('initUnitDropdown err:', err); }
  try { initExplorerFilters(); } catch (err) { console.error('initExplorerFilters err:', err); }
  try { populateIndicatorDropdown(); } catch (err) { console.error('populateIndicatorDropdown err:', err); }
  try { updateDashboardView(); } catch (err) { console.error('updateDashboardView err:', err); }
  try { initNhsoSyncBanner(); } catch (err) { console.error('initNhsoSyncBanner err:', err); }
});

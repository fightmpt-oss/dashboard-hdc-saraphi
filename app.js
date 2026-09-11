/**
 * HDC Saraphi Health & Herbal Medicine Dashboard (2567-2569)
 * Production-ready Client-Side Single Page Application
 */

document.addEventListener('DOMContentLoaded', async () => {
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
  const unitSelect = document.getElementById('unit-select');
  const yearButtons = document.querySelectorAll('.year-btn');
  const navTabs = document.querySelectorAll('.nav-tab');
  const chipsContainer = document.getElementById('indicator-chips-container');
  const activeSection = document.getElementById('active-indicator-section');
  const explorerSection = document.getElementById('explorer-section');
  const topHerbsPanel = document.getElementById('top-herbs-panel');
  const tableBody = document.getElementById('unit-table-body');
  const tableFoot = document.getElementById('unit-table-foot');
  const tableSearch = document.getElementById('table-search');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const tableExportBtn = document.getElementById('table-export-btn');

  // Load Data with Cache-Busting
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const [resMaster, resCatalog] = await Promise.all([
      fetch(`data/saraphi_complete_master.json${cacheBuster}`, { cache: 'no-cache' }),
      fetch(`data/moph_catalog.json${cacheBuster}`, { cache: 'no-cache' }).catch(() => ({ json: () => [] }))
    ]);
    masterData = await resMaster.json();
    try {
      catalogData = await resCatalog.json();
    } catch {
      catalogData = [];
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    alert('ไม่สามารถโหลดไฟล์ข้อมูลได้ กรุณาตรวจสอบว่าไฟล์ data/saraphi_complete_master.json มีอยู่');
    return;
  }

  // 1. Populate Unit Select Dropdown
  function initUnitDropdown() {
    unitSelect.innerHTML = '<option value="all">🏥 ภาพรวมทั้งอำเภอสารภี (14 หน่วยงาน)</option>';
    const units = masterData.metadata.units;
    Object.keys(units).sort().forEach(code => {
      const u = units[code];
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${code}: ${u.name} (ต.${u.subdistrict})`;
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

  // 3. Render Sub-Indicator Chips
  function renderIndicatorChips() {
    chipsContainer.innerHTML = '';
    const indicators = getIndicatorsByDomain(currentDomain);
    if (!indicators.length) return;

    indicators.forEach(ind => {
      const btn = document.createElement('button');
      btn.className = `sub-tab px-3 py-1.5 rounded-xl text-xs transition border flex items-center space-x-1.5 ${
        ind.id === currentIndicatorId
          ? 'active bg-emerald-600 text-white border-emerald-600 shadow-sm font-semibold'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`;
      btn.innerHTML = `
        <span class="font-bold text-[10px] opacity-80">${ind.code}</span>
        <span>${ind.name}</span>
      `;
      btn.addEventListener('click', () => {
        currentIndicatorId = ind.id;
        renderIndicatorChips();
        updateDashboardView();
      });
      chipsContainer.appendChild(btn);
    });
  }

  // 4. Update Header Summary & KPI Cards
  function updateExecutiveOverview() {
    const indicators = getIndicatorsByDomain(currentDomain);
    const yr = currentYear === 'all' ? '2569' : currentYear;

    let passedCount = 0;
    let failedCount = 0;

    indicators.forEach(ind => {
      const yData = ind.years[yr];
      if (!yData) return;
      if (currentUnit === 'all') {
        if (yData.pass) passedCount++; else failedCount++;
      } else {
        const uItem = yData.units.find(u => u.hospcode === currentUnit);
        if (uItem) {
          if (uItem.pass) passedCount++; else failedCount++;
        }
      }
    });

    document.getElementById('stat-total-indicators').textContent = `${indicators.length} ตัว`;
    document.getElementById('stat-passed-indicators').textContent = `${passedCount} ตัว`;
    document.getElementById('stat-failed-indicators').textContent = `${failedCount} ตัว`;

    // Total TTM Value stat
    const ttmVal = masterData.indicators['ttm_val'];
    if (ttmVal && ttmVal.years[yr]) {
      const num = currentUnit === 'all'
        ? ttmVal.years[yr].num
        : (ttmVal.years[yr].units.find(u => u.hospcode === currentUnit)?.num || 0);
      document.getElementById('stat-ttm-total-val').textContent = `${Number(num).toLocaleString()} ฿`;
    }

    // Selected Unit & Year Label
    const unitName = currentUnit === 'all'
      ? 'ภาพรวมอำเภอสารภี (14 แห่ง)'
      : masterData.metadata.units[currentUnit]?.name || currentUnit;
    document.getElementById('selected-unit-label').textContent = unitName;
    document.getElementById('selected-year-label').textContent = currentYear === 'all' ? 'แนวโน้ม 3 ปี (2567-2569)' : `ข้อมูลปี พ.ศ. ${currentYear}`;

    const domainTitles = {
      ttm: 'หมวด: 🌿 แพทย์แผนไทย & ยาสมุนไพร',
      pcc: 'หมวด: 💰 งบ PCC (ผลลัพธ์บริการปฐมภูมิตรายบุคคล)',
      ppb: 'หมวด: 🎯 งบ PPB (บริการพื้นฐาน Workload)',
      elderly: 'หมวด: 👵 ผู้สูงอายุ & NCDs',
      mch: 'หมวด: 👶 อนามัยแม่และเด็ก'
    };
    document.getElementById('view-title').textContent = domainTitles[currentDomain] || 'แดชบอร์ดสุขภาพ';
  }

  // 5. Update Active Indicator Card Header
  function updateIndicatorHeader() {
    const ind = masterData.indicators[currentIndicatorId];
    if (!ind) return;

    document.getElementById('ind-code-badge').textContent = ind.code;
    document.getElementById('ind-table-badge').textContent = `HDC: ${ind.table}`;
    document.getElementById('ind-name-text').textContent = ind.name;
    document.getElementById('ind-desc-text').textContent = ind.desc;
    document.getElementById('ind-target-text').textContent = ind.target > 0 ? `≥ ${ind.target} ${ind.unit}` : 'ตามผลงาน';

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
      badgeEl.className = 'badge-neutral px-2.5 py-1 rounded-lg text-xs font-bold';
      badgeEl.textContent = 'ผลงานสะสม';
    } else if (isPass) {
      badgeEl.className = 'badge-pass px-2.5 py-1 rounded-lg text-xs font-bold';
      badgeEl.textContent = '✓ ผ่านเกณฑ์';
      rateEl.className = 'text-xl font-extrabold text-emerald-600';
    } else {
      badgeEl.className = 'badge-fail px-2.5 py-1 rounded-lg text-xs font-bold';
      badgeEl.textContent = '✕ ต่ำกว่าเกณฑ์';
      rateEl.className = 'text-xl font-extrabold text-rose-600';
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
            labels: { font: { family: 'Prompt', size: 11 }, boxWidth: 12 }
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
            ticks: { font: { family: 'Prompt', size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Prompt', size: 11 } }
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

    const sortedUnits = [...yData.units].sort((a, b) => b.rate - a.rate);
    const labels = sortedUnits.map(u => u.name.replace('โรงพยาบาลส่งเสริมสุขภาพตำบล', 'รพ.สต.').replace('โรงพยาบาล', 'รพ.'));
    const rates = sortedUnits.map(u => u.rate);
    const bgColors = sortedUnits.map(u => {
      if (ind.target === 0) return '#3b82f6';
      if (u.hospcode === currentUnit) return '#f59e0b'; // Highlight selected unit
      return u.pass ? '#10b981' : '#f87171';
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
            barThickness: 12
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
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
            ticks: { font: { family: 'Prompt', size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: 'Prompt', size: 10 } }
          }
        }
      }
    });
  }

  // 8. Render Special Panel for Top Herbs (s_ttm4)
  function renderTopHerbsPanel() {
    if (currentIndicatorId !== 'ttm_top_herbs') {
      topHerbsPanel.classList.add('hidden');
      return;
    }

    topHerbsPanel.classList.remove('hidden');
    const ind = masterData.indicators['ttm_top_herbs'];
    const yr = currentYear === 'all' ? '2569' : currentYear;
    const yData = ind.years[yr];
    if (!yData) return;

    document.getElementById('herbs-total-val').textContent = `${Number(yData.num).toLocaleString()} บาท (${yData.den.toLocaleString()} ครั้ง)`;

    // Render Top 4 Herb Highlight Cards
    const cardsContainer = document.getElementById('top-herbs-cards');
    cardsContainer.innerHTML = '';
    const top4 = yData.top_herbs.slice(0, 4);

    top4.forEach((h, idx) => {
      const colors = [
        'border-amber-400 bg-amber-50/50 text-amber-700',
        'border-emerald-400 bg-emerald-50/50 text-emerald-700',
        'border-blue-400 bg-blue-50/50 text-blue-700',
        'border-purple-400 bg-purple-50/50 text-purple-700'
      ];
      const card = document.createElement('div');
      card.className = `p-3.5 rounded-xl border ${colors[idx % 4]} shadow-sm flex flex-col justify-between`;
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md">อันดับ ${idx + 1}</span>
          <span class="text-xs font-semibold">${Number(h.visits).toLocaleString()} ครั้ง</span>
        </div>
        <div class="my-2">
          <h5 class="text-xs font-bold truncate" title="${h.name}">${h.name}</h5>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">DID: ${h.didstd.substring(0, 14)}...</div>
        </div>
        <div class="text-right">
          <span class="text-sm font-extrabold">${Number(h.val).toLocaleString()}</span>
          <span class="text-[11px] font-normal"> บาท</span>
        </div>
      `;
      cardsContainer.appendChild(card);
    });

    // Render Top 10 Herbs Bar Chart
    const ctx = document.getElementById('herbsChart').getContext('2d');
    const top10 = yData.top_herbs.slice(0, 10);
    const labels = top10.map(h => h.name.length > 22 ? h.name.substring(0, 20) + '...' : h.name);
    const vals = top10.map(h => h.val);

    if (herbsChartInstance) {
      herbsChartInstance.destroy();
    }

    herbsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'มูลค่าการใช้ยา (บาท)',
            data: vals,
            backgroundColor: '#10b981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ` มูลค่า: ${Number(ctx.raw).toLocaleString()} บาท`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { family: 'Prompt', size: 10 } }
          },
          x: {
            ticks: { font: { family: 'Prompt', size: 10 } }
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

      const statusBadge = ind.target === 0
        ? '<span class="badge-neutral px-2 py-0.5 rounded text-[10px]">บันทึกผลงาน</span>'
        : u.pass
        ? '<span class="badge-pass px-2 py-0.5 rounded text-[10px] font-bold">ผ่าน</span>'
        : '<span class="badge-fail px-2 py-0.5 rounded text-[10px] font-bold">ไม่ผ่าน</span>';

      tr.innerHTML = `
        <td class="py-2.5 px-4 text-center text-slate-400 font-mono">${idx + 1}</td>
        <td class="py-2.5 px-4 font-mono font-medium text-slate-600">${u.hospcode}</td>
        <td class="py-2.5 px-4 font-medium text-slate-900">${u.name}</td>
        <td class="py-2.5 px-4 text-slate-500">ต.${u.subdistrict}</td>
        <td class="py-2.5 px-4 text-right font-mono">${Number(u.num).toLocaleString()}</td>
        <td class="py-2.5 px-4 text-right font-mono text-slate-500">${Number(u.den).toLocaleString()}</td>
        <td class="py-2.5 px-4 text-right font-mono font-bold ${u.pass ? 'text-emerald-600' : 'text-slate-800'}">${Number(u.rate).toLocaleString()} ${ind.unit}</td>
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
        <td class="py-3 px-4 text-right font-mono font-bold text-slate-900">${Number(yData.num).toLocaleString()}</td>
        <td class="py-3 px-4 text-right font-mono font-bold text-slate-600">${Number(yData.den).toLocaleString()}</td>
        <td class="py-3 px-4 text-right font-mono font-extrabold text-emerald-700">${Number(yData.rate).toLocaleString()} ${ind.unit}</td>
        <td class="py-3 px-4 text-center">${distStatusBadge}</td>
      </tr>
    `;
  }

  // 10. Update Everything on View Change
  function updateDashboardView() {
    if (currentDomain === 'explorer') {
      activeSection.classList.add('hidden');
      chipsContainer.classList.add('hidden');
      explorerSection.classList.remove('hidden');
      renderExplorerCatalog();
    } else {
      explorerSection.classList.add('hidden');
      chipsContainer.classList.remove('hidden');
      activeSection.classList.remove('hidden');

      updateExecutiveOverview();
      updateIndicatorHeader();
      renderTrendChart();
      renderRankingChart();
      renderTopHerbsPanel();
      renderDataTable();
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
        <td class="py-2.5 px-3 text-center text-slate-400 font-mono">${idx + 1}</td>
        <td class="py-2.5 px-3 font-medium text-slate-900">${r.report_name || '-'}</td>
        <td class="py-2.5 px-3 font-mono text-emerald-700 bg-emerald-50/50 px-2 rounded">${r.source_table || '-'}</td>
        <td class="py-2.5 px-3 text-slate-500">${r.cat_name || '-'}</td>
        <td class="py-2.5 px-3 text-center font-mono text-slate-400">${(r.view_count || 0).toLocaleString()}</td>
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

  exportCsvBtn.addEventListener('click', exportCurrentTableToCsv);
  tableExportBtn.addEventListener('click', exportCurrentTableToCsv);

  // 14. Event Listeners for Filters
  unitSelect.addEventListener('change', (e) => {
    currentUnit = e.target.value;
    updateDashboardView();
  });

  yearButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      yearButtons.forEach(b => {
        b.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow-sm');
        b.classList.add('text-slate-600');
      });
      btn.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600');
      currentYear = btn.dataset.year;
      updateDashboardView();
    });
  });

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentDomain = tab.dataset.domain;

      // Select default indicator for this domain
      const inds = getIndicatorsByDomain(currentDomain);
      if (inds.length > 0) {
        currentIndicatorId = inds[0].id;
      }
      renderIndicatorChips();
      updateDashboardView();
    });
  });

  tableSearch.addEventListener('input', renderDataTable);

  // Explorer filters
  document.getElementById('catalog-search')?.addEventListener('input', renderExplorerCatalog);
  document.getElementById('catalog-main-cat')?.addEventListener('change', renderExplorerCatalog);
  document.getElementById('catalog-sub-cat')?.addEventListener('change', renderExplorerCatalog);

  // Initial Boot
  initUnitDropdown();
  initExplorerFilters();
  renderIndicatorChips();
  updateDashboardView();
});

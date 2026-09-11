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

      const tr = document.createElement('tr');
      tr.style.cssText = idx % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;';
      tr.onmouseenter = () => tr.style.background = '#f0fdf4';
      tr.onmouseleave = () => tr.style.background = (idx % 2 === 0 ? '#ffffff' : '#f8fafc');

      const didTd = isHdc ? '' : `<td style="padding:8px 10px; text-align:center; font-family:monospace; font-size:11px; color:#64748b; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9;">${item.didstd || '-'}</td>`;

      tr.innerHTML = `
        <td style="padding:8px 10px; text-align:center; color:#64748b; font-weight:700; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9;">${idx + 1}</td>
        <td style="padding:8px 12px; font-weight:600; color:#1e293b; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9;">${item.drug_name || '-'}</td>
        ${didTd}
        <td style="padding:8px 12px; text-align:right; font-weight:600; color:#0f172a; font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9;">${vsAll.toLocaleString()}</td>
        <td style="padding:8px 12px; text-align:right; font-weight:700; color:#047857; background:rgba(16,185,129,0.06); font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9;">${vsUc.toLocaleString()}</td>
        <td style="padding:8px 12px; text-align:right; color:#475569; font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0; border-right:1px solid #f1f5f9;">${amAll.toLocaleString()}</td>
        <td style="padding:8px 12px; text-align:right; font-weight:700; color:#15803d; font-variant-numeric:tabular-nums; border-bottom:1px solid #e2e8f0;">${priAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      `;
      ttm4Tbody.appendChild(tr);
    });

    // Summary Total Row at bottom
    const totalTr = document.createElement('tr');
    totalTr.style.cssText = 'background:#f0fdf4; font-weight:700; border-top:2px solid #059669; border-bottom:2px solid #059669;';
    const totalDidTd = isHdc ? '' : `<td style="padding:9px 10px; text-align:center; color:#047857; font-size:11px;">-</td>`;
    totalTr.innerHTML = `
      <td style="padding:9px 10px; text-align:center; color:#047857;">รวม</td>
      <td style="padding:9px 12px; color:#14532d;">รวมทั้งสิ้น (${list.length} รายการ)</td>
      ${totalDidTd}
      <td style="padding:9px 12px; text-align:right; color:#0f172a; font-variant-numeric:tabular-nums;">${sumVsAll.toLocaleString()}</td>
      <td style="padding:9px 12px; text-align:right; color:#047857; background:rgba(16,185,129,0.12); font-variant-numeric:tabular-nums;">${sumVsUc.toLocaleString()}</td>
      <td style="padding:9px 12px; text-align:right; color:#475569; font-variant-numeric:tabular-nums;">${sumAmAll.toLocaleString()}</td>
      <td style="padding:9px 12px; text-align:right; color:#15803d; font-size:13px; font-variant-numeric:tabular-nums;">${sumPriAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
              font: { size: 12, family: "'Prompt', sans-serif", weight: '600' },
              color: '#334155'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            titleFont: { size: 12.5, family: "'Prompt', sans-serif", weight: '700' },
            bodyFont: { size: 11.5, family: "'Prompt', sans-serif" },
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
              font: { size: 11.5, family: "'Prompt', sans-serif", weight: '600' }
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
              font: { size: 11, family: "'Prompt', sans-serif", weight: '600' }
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.7)',
              borderDash: [4, 4]
            },
            ticks: {
              color: '#64748b',
              font: { size: 10.5, family: "'Prompt', sans-serif" },
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
              font: { size: 11, family: "'Prompt', sans-serif", weight: '600' }
            },
            grid: { display: false },
            ticks: {
              color: '#1e40af',
              font: { size: 10.5, family: "'Prompt', sans-serif" },
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

      const isTTM4 = (currentIndicatorId === 'ttm_top_herbs');
      const standardChartsSection = document.getElementById('standard-charts-section');
      const standardTableSection = document.getElementById('standard-table-section');

      if (isTTM4) {
        if (standardChartsSection) standardChartsSection.classList.add('hidden');
        if (standardTableSection) standardTableSection.classList.add('hidden');
        renderTopHerbsPanel();
      } else {
        if (standardChartsSection) standardChartsSection.classList.remove('hidden');
        if (standardTableSection) standardTableSection.classList.remove('hidden');
        if (topHerbsPanel) topHerbsPanel.classList.add('hidden');
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

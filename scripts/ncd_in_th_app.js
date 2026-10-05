/* ศูนย์ตุ้มโฮมข้อมูล OneData Primary Care (OPC) — ชื่อระบบ โลโก้ ธีม และส่วนหัวที่ใช้ร่วมกันทุกหน้า
   เปลี่ยนชื่อระบบ: แก้ BRAND ด้านล่างจุดเดียว */
(function () {
  const BRAND = { th: 'ศูนย์ตุ้มโฮมข้อมูล', en: 'OneData Primary Care', short: 'OPC' };
  const KEY = 'opc_theme';

  // ---- ธีม (auto / light / dark) ทำงานทันทีเพื่อกันหน้าจอวาบ ----
  const getPref = () => { try { return localStorage.getItem(KEY) || 'auto'; } catch { return 'auto'; } };
  const setPref = (v) => { try { localStorage.setItem(KEY, v); } catch { /* ไม่มี localStorage ก็ใช้ต่อได้ */ } };
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const apply = (p) => {
    const dark = p === 'dark' || (p === 'auto' && mq && mq.matches);
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
  };
  apply(getPref());
  if (mq && mq.addEventListener) mq.addEventListener('change', () => apply(getPref()));

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // โลโก้: เส้นชีพจรในกรอบมน (ใช้เป็นไอคอนแท็บด้วย)
  const logoSvg = (size = 38) => `<svg class="opc-logo" viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">
    <defs><linearGradient id="opcg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs>
    <rect width="40" height="40" rx="11" fill="rgba(255,255,255,.2)"/>
    <path d="M6 21.5h6.5l3.2-9 5.3 17.5 3.4-8.5H34" fill="none" stroke="url(#opcg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  const faviconHref = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#0f766e"/>' +
    '<path d="M6 21.5h6.5l3.2-9 5.3 17.5 3.4-8.5H34" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');

  function setFavicon() {
    let l = document.querySelector('link[rel="icon"]');
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = faviconHref;
  }

  const THEME_ICON = { auto: '◐', light: '☀', dark: '☾' };
  const THEME_TIP = { auto: 'ธีม: ตามระบบ', light: 'ธีม: สว่าง', dark: 'ธีม: มืด' };

  function mountHeader() {
    const host = document.getElementById('opc-header');
    if (!host || host.dataset.mounted) return;     // เรียกซ้ำได้ ไม่สร้างซ้ำ
    host.dataset.mounted = '1';
    const active = host.dataset.active || '';
    host.className = 'opc-header';
    host.innerHTML = `<div class="inner">
      <a class="opc-brand" href="/" aria-label="${esc(BRAND.th)}">${logoSvg()}
        <span class="opc-title"><b>${esc(BRAND.th)}</b><small>${esc(BRAND.en)} · ${esc(BRAND.short)}</small></span></a>
      <nav class="opc-nav" aria-label="เมนูหลัก">
        <a href="/" class="${active === 'home' ? 'active' : ''}">แดชบอร์ด</a>
        <a href="/about.html" class="${active === 'about' ? 'active' : ''}">เกี่ยวกับระบบ</a>
        <a href="/admin.html" id="adm" class="d-none ${active === 'admin' ? 'active' : ''}">จัดการระบบ</a>
      </nav>
      <div class="opc-right">
        <span class="opc-user" id="who"></span>
        <button class="opc-btn icon" id="themeBtn" type="button"></button>
        <button class="opc-btn" id="out" type="button" style="display:none">ออกจากระบบ</button>
        <a class="opc-btn" id="loginBtn" href="/login.html" style="display:none">เข้าสู่ระบบ</a>
      </div></div>`;

    const btn = document.getElementById('themeBtn');
    const paint = () => { const p = getPref(); btn.textContent = THEME_ICON[p]; btn.title = THEME_TIP[p]; btn.setAttribute('aria-label', THEME_TIP[p]); };
    btn.onclick = () => { const order = ['auto', 'light', 'dark']; const n = order[(order.indexOf(getPref()) + 1) % 3]; setPref(n); apply(n); paint(); };
    paint();

    document.getElementById('out').onclick = async () => {
      await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      location.href = '/';                          // ออกจากระบบแล้วกลับหน้าแดชบอร์ด (ดูข้อมูลได้โดยไม่ต้องล็อกอิน)
    };
    // ผู้เข้าชมทั่วไป (ยังไม่ล็อกอิน) ดูข้อมูลได้ จึงแสดงปุ่ม "เข้าสู่ระบบ" ส่วนเมนูจัดการและอีเมลแสดงเฉพาะผู้ล็อกอิน
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.href = `/login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
    fetch('/api/me').then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j || !j.user) { loginBtn.style.display = ''; return; }
      document.getElementById('out').style.display = '';
      document.getElementById('who').textContent = j.user.email;
      if (j.user.role === 'admin') document.getElementById('adm').classList.remove('d-none');
    }).catch(() => { loginBtn.style.display = ''; });
  }

  setFavicon();
  window.OPC = { BRAND, logoSvg, esc, mountHeader };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountHeader);
  else mountHeader();
})();

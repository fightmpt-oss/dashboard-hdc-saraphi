// Vercel Serverless Function — สะพานสั่งงาน MeData Live Sync อย่างปลอดภัย
//
// ปุ่ม "ดึงข้อมูล สปสช. ล่าสุด (Live Sync)" บนเว็บเรียก function นี้:
//   POST /api/nhso-sync?action=trigger → สั่ง GitHub Actions (workflow nhso-sync)
//   GET  /api/nhso-sync?action=status  → สถานะล่าสุดของ workflow (public, ไม่ใช้ token)
//
// Token เก็บเป็น Environment Variable ชื่อ NHSO_GITHUB_TOKEN บน Vercel
// (Fine-grained PAT: เลือกเฉพาะ repo นี้ + สิทธิ์ Actions: Read and write)
// — token ไม่เคยถูก commit ลง repo และไม่เคยส่งถึงเบราว์เซอร์ผู้ใช้

const REPO = 'fightmpt-oss/dashboard-hdc-saraphi';
const WORKFLOW = 'nhso-sync.yml';
const RATE_LIMIT_MS = 20 * 60 * 1000; // จำกัดสั่งซ้ำไม่เร็วกว่าทุก 20 นาที

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function github(path, options = {}) {
  const headers = Object.assign({
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'hdc-saraphi-vercel-function',
  }, options.headers || {});
  const res = await fetch(`https://api.github.com${path}`, Object.assign({}, options, { headers }));
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(`GitHub API ${res.status}: ${body.slice(0, 300)}`), { status: res.status });
  }
  return res.json();
}

async function latestRun() {
  const data = await github(`/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=1`);
  return (data.workflow_runs && data.workflow_runs[0]) || null;
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(204).end();

  const action = (req.query && req.query.action) || 'status';

  try {
    if (action === 'trigger') {
      const token = process.env.NHSO_GITHUB_TOKEN;
      if (!token) {
        return res.status(500).json({
          ok: false,
          error: 'ยังไม่ได้ตั้งค่า NHSO_GITHUB_TOKEN บน Vercel (สร้าง Fine-grained PAT สิทธิ์ Actions: RW แล้วเพิ่มเป็น Environment Variable แล้ว Redeploy)',
        });
      }

      // Rate limit + กัน trigger ทับรอบที่กำลังทำงาน
      let last = null;
      try {
        last = await latestRun();
      } catch (e) {
        // อ่านสถานะไม่ได้ (rate limit ฝั่ง GitHub) — ข้ามการเช็ค ไป dispatch เลย
      }
      if (last && ['queued', 'in_progress', 'waiting'].includes(last.status)) {
        return res.status(429).json({
          ok: false,
          error: 'มีรอบดึงข้อมูล สปสช. กำลังทำงานอยู่ (รอผลในหน้าเว็บนี้ได้เลย)',
          run: { status: last.status, created_at: last.created_at, url: last.html_url },
        });
      }
      if (last && last.created_at && (Date.now() - new Date(last.created_at).getTime()) < RATE_LIMIT_MS) {
        const mins = Math.ceil((RATE_LIMIT_MS - (Date.now() - new Date(last.created_at).getTime())) / 60000);
        return res.status(429).json({
          ok: false,
          error: `เพิ่งดึงข้อมูลไปเมื่อไม่นานนี้ — ลองอีกครั้งใน ~${mins} นาที (จำกัด 1 ครั้ง/20 นาที เพื่อไม่รบกวนบริการ สปสช.)`,
          run: { status: last.status, conclusion: last.conclusion, created_at: last.created_at, url: last.html_url },
        });
      }

      await github(`/repos/${REPO}/dispatches`, {
        method: 'POST',
        headers: { Authorization: `token ${token}` },
        body: JSON.stringify({ event_type: 'nhso-sync', client_payload: { source: 'website-button' } }),
      });
      return res.status(200).json({
        ok: true,
        message: 'GitHub Actions เริ่มดึงข้อมูล สปสช. MeData แล้ว (ใช้เวลาราว 10-25 นาที แล้ว deploy อัตโนมัติ)',
      });
    }

    // status — public repo: อ่านได้โดยไม่ต้องมี token
    const last = await latestRun();
    if (!last) return res.status(200).json({ ok: true, status: 'never_run', conclusion: null, created_at: null, url: null });
    return res.status(200).json({
      ok: true,
      status: last.status,
      conclusion: last.conclusion,
      created_at: last.created_at,
      url: last.html_url,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ ok: false, error: String(err.message || err) });
  }
}

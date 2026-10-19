// Kiểm tự động mọi kiểu (hoặc vài kiểu): chạy preview.html trong Chrome headless.
// Đạt khi: vẽ ra hình; cùng thời điểm vẽ 2 lần ra cùng một hình; khung cuối trùng logo đứng yên (lệch tâm < 1% khung, cỡ trong 97–104%);
// mốc tiếng nằm trong thời lượng, loại tiếng có trong tools/sfx.py; có file sound/mix-pN.wav.
// Dùng: node tools/check.mjs [P1 P9 ...]
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = ['pop', 'boing', 'swish', 'whoosh', 'blip', 'note', 'tock', 'shimmer', 'sparkle'];
const port = 9600 + Math.floor(Math.random() * 300);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'pc-'))}`, '--allow-file-access-from-files', '--no-first-run', '--window-size=1920,1080',
  'file://' + encodeURI(join(root, 'preview.html')) + '?still'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pages;
for (let i = 0; i < 50; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (pages.find(p => p.type === 'page')) break; } catch {} await sleep(200); }
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const evaluate = async expr => { const i = ++id; const m = await new Promise(r => { waiting.set(i, r); ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } })); }); return m.result?.result?.value ?? m.result?.exceptionDetails?.exception?.description; };
for (let i = 0; i < 50 && !(await evaluate('typeof window.PikaIntro === "object"')); i++) await sleep(200);

const all = await evaluate('PikaIntro.VARIANT_IDS');
const want = process.argv.slice(2).length ? process.argv.slice(2) : all;
let fail = 0;
for (const v of want) {
  const r = await evaluate(`(() => {
    const W = 1920, H = 1080, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const it = PikaIntro.createPikaIntro({ variant: ${JSON.stringify(v)}, background: null });
    if (it.variant !== ${JSON.stringify(v)}) return { err: 'không có kiểu này' };
    const bbox = () => { const d = g.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
      for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      return x1 < 0 ? null : { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 }; };
    it.render(g, 1.5); const a = c.toDataURL(); it.render(g, 1.5); const same = a === c.toDataURL();
    it.render(g, it.duration); const end = bbox(); it.renderLogo(g); const logo = bbox();
    return { duration: it.duration, same, end, logo, cues: it.cues };
  })()`);
  const errs = [];
  if (!r || r.err || typeof r !== 'object') errs.push(r?.err || String(r));
  else {
    if (!(r.duration > 0)) errs.push('thời lượng không hợp lệ');
    if (!r.same) errs.push('cùng thời điểm vẽ ra 2 hình khác nhau');
    if (!r.end) errs.push('khung cuối trống');
    else {
      const dc = Math.hypot(r.end.cx - r.logo.cx, r.end.cy - r.logo.cy) / 1920, sw = r.end.w / r.logo.w, sh = r.end.h / r.logo.h;
      if (dc > 0.01 || sw < 0.97 || sw > 1.04 || sh < 0.97 || sh > 1.04) errs.push(`khung cuối lệch logo (tâm ${(dc * 100).toFixed(1)}%, cỡ ${(sw * 100).toFixed(0)}% x ${(sh * 100).toFixed(0)}%)`);
    }
    const { voice, events } = r.cues || {};
    if (!(voice >= 0 && voice <= r.duration)) errs.push('giọng nằm ngoài thời lượng');
    for (const e of events || []) { if (!(e.t >= 0 && e.t <= r.duration)) errs.push(`tiếng ${e.type} ở ${e.t}s ngoài thời lượng`); if (!TYPES.includes(e.type)) errs.push(`loại tiếng lạ: ${e.type}`); }
    if (!existsSync(join(root, `sound/mix-${v.toLowerCase()}.wav`))) errs.push(`thiếu sound/mix-${v.toLowerCase()}.wav (chạy tools/export.sh)`);
  }
  console.log(`${v}: ${errs.length ? 'CHƯA ĐẠT — ' + errs.join('; ') : 'đạt'}`);
  if (errs.length) fail++;
}
ws.close(); chrome.kill();
process.exit(fail ? 1 : 0);

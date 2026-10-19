// Xuất bộ logo Pika tĩnh từ lõi: logo/lockups/ (ngang, dọc) và logo/icon/ (chỉ mặt), mỗi cái bản color, black, white; kèm logo/brand.json.
// Dùng: node tools/build-logo.mjs   (sau node tools/build.mjs)
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = 9500 + Math.floor(Math.random() * 300);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'pl-'))}`, '--allow-file-access-from-files', '--no-first-run',
  'file://' + encodeURI(join(root, 'preview.html')) + '?still'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pages;
for (let i = 0; i < 50; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (pages.find(p => p.type === 'page')) break; } catch {} await sleep(200); }
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
const evaluate = expr => new Promise(r => { ws.addEventListener('message', e => r(JSON.parse(e.data).result?.result?.value), { once: true }); ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } })); });
for (let i = 0; i < 50 && !(await evaluate('typeof window.PikaIntro === "object"')); i++) await sleep(200);

const SETS = { horizontal: 'lockups/pika-horizontal', stacked: 'lockups/pika-stacked', icon: 'icon/pika-icon' };
const files = {};
for (const [layout, base] of Object.entries(SETS)) for (const pal of ['color', 'black', 'white']) {
  const svg = await evaluate(`PikaIntro.logoSVG(${JSON.stringify(layout)}, ${JSON.stringify(pal)})`);
  mkdirSync(join(root, 'logo', dirname(base)), { recursive: true });
  writeFileSync(join(root, 'logo', `${base}-${pal}.svg`), svg);
  (files[layout] ||= {})[pal] = `${base}-${pal}.svg`;
}
const color = await evaluate('PikaIntro.COLORS.pika');
writeFileSync(join(root, 'logo/brand.json'), JSON.stringify({
  name: 'Pika', owner: 'Step Up',
  colors: { pika: color, facePlate: '#FFFFFF', black: '#000000', white: '#FFFFFF' },
  lockups: {
    horizontal: { role: 'primary', use: 'web header, email, slides, 16:9 video', files: files.horizontal },
    stacked: { role: 'vertical', use: 'splash, avatar, poster, 9:16 video', files: files.stacked },
    icon: { role: 'face only', use: 'app icon, favicon, small sizes', files: files.icon },
  },
  variants: { color: 'on white or light backgrounds', black: 'one-color, on light backgrounds; face plate is a cut-out', white: 'one-color, on dark backgrounds; face plate is a cut-out' },
  svgIds: { 'pika-face': 'face group', 'face-plate': 'white face plate (color only)', ears: 'ears', head: 'head ring (evenodd)', 'eye-left': 'left eye', 'eye-right': 'right eye', 'word-pika': 'word Pika (letters word-pika-P/i/k/a)' },
}, null, 1) + '\n');
console.log('logo: 9 SVG + brand.json');
ws.close(); chrome.kill(); process.exit(0);

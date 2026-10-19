// Bộ dụng cụ chung cho mọi kiểu intro Pika: đường cong nhịp, hình (đầu Pika, chữ "Pika") đã đo sẵn, hàm vẽ đầu và chữ,
// nháy mắt, nhún, biến hình. Kiểu mới (core/variants/) chỉ dùng các hàm ở đây, không tự đo hay vẽ lại logo.
import { LOGO_PATHS } from './logo-paths.js';

const P = LOGO_PATHS;
export const CYAN = P.color;

// --- toán nhỏ, đường cong nhịp (theo GSAP) ---
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const easeOut = k => 1 - Math.pow(1 - k, 3);
export const easeInOut = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const sineInOut = k => -(Math.cos(Math.PI * k) - 1) / 2;
export const p2out = k => 1 - (1 - k) * (1 - k);
export function backOut(k, s = 1.7) { k -= 1; return k * k * ((s + 1) * k + s) + 1; }
export function elasticOut(k, p = 0.4) { if (k <= 0) return 0; if (k >= 1) return 1; return Math.pow(2, -10 * k) * Math.sin((k - p / 4) * 2 * Math.PI / p) + 1; }
export function bounceOut(k) { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375; return n * (k -= 2.625 / d) * k + 0.984375; }
export const wobble = k => k <= 0 || k >= 1 ? 0 : Math.sin(k * Math.PI * 2.5) * Math.exp(-k * 4.5);

// --- hình: đo một lần (cần DOM), dùng chung mọi kiểu ---
let GEO = null;
// geometry(): HEAD (ears, body, face, eyeLeft, eyeRight: { path, box }), HB khung đầu gồm tai, HPIV điểm neo giữa đáy đầu,
// LET 4 chữ ({ i, path, box, piv }), LOCK khung cả logo, EYEC giữa hai mắt, REVEAL_R, HEAD_OUT / HEAD_BLOB / LET_OUT (biến hình), PLEN (độ dài nét)
export function geometry() {
  if (GEO) return GEO;
  const NS = 'http://www.w3.org/2000/svg', host = document.createElementNS(NS, 'svg');
  host.style.cssText = 'position:absolute;width:0;height:0'; (document.body || document.documentElement).appendChild(host);
  function box(d) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); host.appendChild(p); const b = p.getBBox(); p.remove(); return { x: b.x, y: b.y, r: b.x + b.width, b: b.y + b.height, w: b.width, h: b.height }; }
  const union = B => { const x = Math.min(...B.map(b => b.x)), y = Math.min(...B.map(b => b.y)), r = Math.max(...B.map(b => b.r)), b = Math.max(...B.map(b => b.b)); return { x, y, r, b, w: r - x, h: b - y }; };
  const HEAD = {}; for (const k in P.head) HEAD[k] = { path: new Path2D(P.head[k]), box: box(P.head[k]) };
  const HB = union([HEAD.ears.box, HEAD.body.box]);                          // khung đầu gồm tai
  const HPIV = [HB.x + HB.w / 2, HB.b];                                       // điểm neo: giữa đáy đầu
  const LET = P.word.map((d, i) => { const b = box(d); return { i, path: new Path2D(d), box: b, piv: [b.x + b.w / 2, b.b] }; });
  const LOCK = union([HB, ...LET.map(l => l.box)]);
  const EYEC = [(HEAD.eyeLeft.box.x + HEAD.eyeRight.box.r) / 2, (HEAD.eyeLeft.box.y + HEAD.eyeRight.box.b) / 2];   // giữa hai mắt
  const REVEAL_R = Math.hypot(Math.max(EYEC[0] - HB.x, HB.r - EYEC[0]), Math.max(EYEC[1] - HB.y, HB.b - EYEC[1]));
  const NPT = 160;
  function samplePts(d, n = NPT) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); host.appendChild(p); const L = p.getTotalLength(), o = []; for (let i = 0; i < n; i++) { const q = p.getPointAtLength(L * i / n); o.push([q.x, q.y]); } p.remove(); return o; }
  const outerOf = d => d.split(/(?=M)/).map(x => x.trim()).filter(Boolean).map(x => ({ x, b: box(x) })).sort((a, b) => b.b.w * b.b.h - a.b.w * a.b.h)[0].x;
  const area = P => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  function align(src, dst) { if (Math.sign(area(src)) !== Math.sign(area(dst))) src = src.slice().reverse(); let best = 0, bd = Infinity; for (let o = 0; o < NPT; o++) { let d = 0; for (let i = 0; i < NPT; i += 4) { const a = src[(i + o) % NPT], b = dst[i]; d += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; } if (d < bd) { bd = d; best = o; } } return dst.map((_, i) => src[(i + best) % NPT]); }
  const circlePts = (cx, cy, rx, ry) => Array.from({ length: NPT }, (_, i) => { const a = i / NPT * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const HEAD_OUT = samplePts(outerOf(P.head.body));
  const HC = [HB.x + HB.w / 2, (HEAD.body.box.y + HEAD.body.box.b) / 2];
  const HEAD_BLOB = align(circlePts(HC[0], HC[1], HEAD.body.box.w * 0.5, HEAD.body.box.h * 0.5), HEAD_OUT);
  const LET_OUT = LET.map(L => { const o = samplePts(outerOf(P.word[L.i])), c = [L.box.x + L.box.w / 2, L.box.y + L.box.h / 2], r = Math.min(L.box.w, L.box.h) * 0.35; return { o, c, blob: align(circlePts(c[0], c[1], r, r), o), r }; });
  // độ dài nét để vẽ dần
  function plen(d) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); host.appendChild(p); const L = p.getTotalLength(); p.remove(); return L; }
  const PLEN = { ears: plen(P.head.ears), body: plen(P.head.body), eyeLeft: plen(P.head.eyeLeft), eyeRight: plen(P.head.eyeRight), word: P.word.map(plen) };
  GEO = { HEAD, HB, HPIV, LET, LOCK, EYEC, REVEAL_R, HEAD_OUT, HC, HEAD_BLOB, LET_OUT, PLEN, box, union, samplePts, outerOf, align, circlePts, plen };
  return GEO;
}
export const lerpPts = (A, B, e) => A.map((a, i) => [lerp(a[0], B[i][0], e), lerp(a[1], B[i][1], e)]);
export function fillPts(g, P) { g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }

// Khung hình: logo cuối vừa vùng 78% x 59% của khung, căn giữa. U = cạnh ngắn / 1080.
export function createStage(W, H) {
  const { LOCK } = geometry(), U = Math.min(W, H) / 1080;
  const S = Math.min(W * 1500 / 1920 / LOCK.w, H * 640 / 1080 / LOCK.h);
  const OX = (W - LOCK.w * S) / 2 - LOCK.x * S, OY = (H - LOCK.h * S) / 2 - LOCK.y * S;
  return { W, H, U, S, OX, OY, toScreen: ([x, y]) => [OX + x * S, OY + y * S] };
}

// --- vẽ ---
// đầu: neo giữa đáy đặt tại (x, y) màn hình, phóng s (px màn / đơn vị frame), bẹp sx/sy, tai xoay earRot (độ), mắt nháy blink (1 = mở)
export function drawHead(g, { x, y, s, sx = 1, sy = 1, earRot = 0, blink = 1, alpha = 1, rot = 0, look = 0, earScale = 1, reveal = 1, eyeScale = 1 }) {
  if (alpha <= 0 || s <= 0) return;
  const { HEAD, HB, HPIV, EYEC, REVEAL_R } = geometry();
  g.save(); g.globalAlpha = clamp(alpha);
  g.translate(x, y); g.scale(s * sx, s * sy); g.translate(-HPIV[0], -HPIV[1]);
  if (rot) { const cx = HB.x + HB.w / 2, cy = HB.y + HB.h / 2; g.translate(cx, cy); g.rotate(rot); g.translate(-cx, -cy); }
  g.fillStyle = CYAN;
  const eb = HEAD.ears.box;
  if (earScale > 0) { g.save(); g.translate(eb.x + eb.w / 2, eb.b); g.rotate(earRot * Math.PI / 180); g.scale(earScale, earScale); g.translate(-(eb.x + eb.w / 2), -eb.b); g.fill(HEAD.ears.path); g.restore(); }
  if (reveal > 0) {
    g.save();
    if (reveal < 1) { g.beginPath(); g.arc(EYEC[0], EYEC[1], reveal * REVEAL_R, 0, Math.PI * 2); g.clip(); }
    g.fill(HEAD.body.path); g.fillStyle = '#FFFFFF'; g.fill(HEAD.face.path); g.fillStyle = CYAN;
    g.restore();
  }
  if (eyeScale > 0) for (const k of ['eyeLeft', 'eyeRight']) {
    const b = HEAD[k].box, cx = b.x + b.w / 2, cy = b.y + b.h * 0.6;
    g.save(); g.translate(cx + look * 16, cy); g.scale(eyeScale, blink * eyeScale); g.translate(-cx, -cy); g.fill(HEAD[k].path); g.restore();
  }
  g.restore();
}
// một chữ, trong hệ logo: neo giữa đáy, dời dx/dy, phóng sc, bẹp sx/sy
export function drawLetter(g, L, { dx = 0, dy = 0, sc = 1, sx = 1, sy = 1, alpha = 1 }) {
  if (alpha <= 0 || sc <= 0) return;
  g.save(); g.globalAlpha = clamp(alpha); g.translate(L.piv[0] + dx, L.piv[1] + dy); g.scale(sc * sx, sc * sy); g.translate(-L.piv[0], -L.piv[1]);
  g.fillStyle = CYAN; g.fill(L.path); g.restore();
}
export const blinkAt = (t, at) => { const a = t - at; if (a < 0 || a > 0.23) return 1; return a < 0.07 ? lerp(1, 0.15, a / 0.07) : lerp(0.15, 1, p2out((a - 0.07) / 0.16)); };
// nhún một nhịp: 0,12 s bẹp xuống rồi bật lại kiểu đàn hồi 0,55 s
export function squashAt(t, at) { const a = t - at; if (a < 0) return [1, 1]; if (a < 0.12) { const k = p2out(a / 0.12); return [lerp(1, 1.05, k), lerp(1, 0.92, k)]; } const k = elasticOut(clamp((a - 0.12) / 0.55), 0.35); return [lerp(1.05, 1, k), lerp(0.92, 1, k)]; }
// nảy tắt dần sau khi đáp (bẹp, giãn), trả [sx, sy]
export function idleLast(t, at) { const land = clamp((t - at) / 0.35); if (land <= 0 || land >= 1) return [1, 1]; const w = Math.sin(land * Math.PI * 2) * Math.exp(-land * 3) * 0.14; return [1 + w * 0.6, 1 - w]; }
// logo đứng yên (khung cuối của mọi kiểu phải trùng hình này)
export function drawLogo(g, K) {
  const { LET, HPIV } = geometry(), [px, py] = K.toScreen(HPIV);
  g.save(); g.transform(K.S, 0, 0, K.S, K.OX, K.OY); for (const L of LET) drawLetter(g, L, {}); g.restore();
  drawHead(g, { x: px, y: py, s: K.S });
}

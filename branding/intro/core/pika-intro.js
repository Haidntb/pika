// Intro logo Pika: chọn một kiểu (variant) trong core/variants/ và vẽ lên canvas 2D theo thời điểm t (giây).
// Dùng chung cho trang xem thử, block HyperFrames, component Remotion và script xuất video.
import { LOGO_PATHS } from './logo-paths.js';
import { createStage, drawLogo, geometry } from './toolkit.js';
import { VARIANTS } from './variants/index.js';

export { VARIANTS, LOGO_PATHS };
export const VARIANT_IDS = VARIANTS.map(v => v.id);
export const COLORS = { pika: LOGO_PATHS.color, facePlate: '#FFFFFF' };

// Tạo một intro. width/height: cỡ khung (px, bản chính thức 1920x1080); variant: 'P1'…; background: mã màu hoặc null (nền trong suốt).
export function createPikaIntro({ width = 1920, height = 1080, variant = 'P1', background = '#FFFFFF' } = {}) {
  const V = VARIANTS.find(v => v.id === variant) || VARIANTS[0];
  const K = createStage(width, height);
  function render(g, t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, width, height);
    if (background) { g.fillStyle = background; g.fillRect(0, 0, width, height); }
    V.render(g, t, K);
  }
  // logo đứng yên ở đúng chỗ khung cuối (để so)
  function renderLogo(g) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, width, height);
    if (background) { g.fillStyle = background; g.fillRect(0, 0, width, height); }
    drawLogo(g, K);
  }
  return { width, height, variant: V.id, title: V.title, duration: V.duration, cues: V.cues, render, renderLogo };
}

// SVG tĩnh của logo. layout: 'horizontal' (mặt + chữ một hàng) | 'stacked' (mặt trên, chữ dưới) | 'icon' (chỉ mặt);
// palette: 'color' (xanh, tấm mặt trắng) | 'black' | 'white' (một màu, tấm mặt là lỗ khoét)
export function logoSVG(layout = 'horizontal', palette = 'color') {
  const { HB, LET, union } = geometry(), P = LOGO_PATHS;
  const col = palette === 'black' ? '#000000' : palette === 'white' ? '#FFFFFF' : P.color;
  const face = palette === 'color' ? `<path id="face-plate" d="${P.head.face}" fill="#FFFFFF"/>` : '';
  const head = `<g id="pika-face" fill="${col}">${face}<path id="ears" d="${P.head.ears}"/><path id="head" d="${P.head.body}" fill-rule="evenodd"/><path id="eye-left" d="${P.head.eyeLeft}"/><path id="eye-right" d="${P.head.eyeRight}"/></g>`;
  const letters = ['P', 'i', 'k', 'a'];
  const word = tr => `<g id="word-pika" fill="${col}"${tr ? ` transform="${tr}"` : ''}>${P.word.map((d, i) => `<path id="word-pika-${letters[i]}" d="${d}"/>`).join('')}</g>`;
  const WB = union(LET.map(l => l.box));
  let body, b;
  if (layout === 'icon') { body = head; b = HB; }
  else if (layout === 'stacked') {
    const gap = HB.h * 0.14, dx = HB.x + HB.w / 2 - (WB.x + WB.w / 2), dy = HB.b + gap - WB.y;
    body = head + word(`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
    b = union([HB, { x: WB.x + dx, y: WB.y + dy, r: WB.r + dx, b: WB.b + dy }]);
  } else { body = head + word(''); b = union([HB, WB]); }
  const pad = Math.max(b.w, b.h) * 0.04, vb = [b.x - pad, b.y - pad, b.w + 2 * pad, b.h + 2 * pad].map(v => +v.toFixed(2));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}">${body}</svg>\n`;
}

// P3 · Nhảy qua từng chữ: Đầu nhỏ nhảy từ phải vào, mỗi chỗ đáp để lại một chữ bật lên (a, k, i, P), cú nhảy cuối về chỗ và lớn lên.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P3', name: 'hop-letters', title: 'Nhảy qua từng chữ', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 2.1, events: [...[0, 1, 2, 3].map(i => ({ t: 0.59 + 0.34 * i, type: 'tock', n: i * 2 })), { t: 1.95, type: 'pop' }, { t: 2.45, type: 'blip' }, { t: 3.55, type: 'blip' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const HOP = 0.34, T0 = 0.25, SMALL = 0.55;
    const order = [...LET].sort((a, b) => b.box.r - a.box.r);                 // a, k, i, P
    const pts = [[LOCK.r + 700, HPIV[1]], ...order.map(L => [L.piv[0], HPIV[1]]), HPIV];
    const n = pts.length - 1, T_END = T0 + n * HOP;
    const push = 1 + 0.03 * sineInOut(clamp((t - T_END - 0.2) / 2.4));
    g.save(); const c = toScreen([LOCK.x + LOCK.w / 2, LOCK.y + LOCK.h / 2]); g.translate(c[0], c[1]); g.scale(push, push); g.translate(-c[0], -c[1]);
    g.save(); g.transform(S, 0, 0, S, OX, OY);
    order.forEach((L, j) => { const k = clamp((t - (T0 + (j + 1) * HOP)) / 0.45); if (k <= 0) return; const e = backOut(k, 2.2); drawLetter(g, L, { dy: 70 * (1 - e), sc: e, alpha: e }); });
    g.restore();
    if (t >= T0 - 0.15) {
      const hi = clamp(Math.floor((t - T0) / HOP), 0, n - 1), hk = clamp((t - T0 - hi * HOP) / HOP);
      const a = pts[hi], b = pts[hi + 1], last = hi === n - 1;
      const fx = t < T0 ? a[0] : lerp(a[0], b[0], hk), arc = t < T0 ? 0 : Math.sin(hk * Math.PI) * (last ? 220 : 130);
      const sc = last ? lerp(SMALL, 1, easeInOut(hk)) : SMALL;
      let sx = 1, sy = 1;
      if (t < T_END) { const st = Math.sin(hk * Math.PI); sy = 1 + 0.08 * st; sx = 1 - 0.05 * st; }
      else { const land = clamp((t - T_END) / 0.35); if (land < 1) { const w = Math.sin(land * Math.PI * 2) * Math.exp(-land * 3) * 0.14; sy = 1 - w; sx = 1 + w * 0.6; } }
      const [px, py] = toScreen([fx, HPIV[1] - arc]);
      const earRot = t < T_END ? -5 * Math.sin(hk * Math.PI) : -7 * (1 - elasticOut(clamp((t - T_END) / 0.8)));
      drawHead(g, { x: px, y: py, s: S * (t >= T_END ? 1 : sc), sx, sy, earRot, blink: Math.min(blinkAt(t, T_END + 0.5), blinkAt(t, T_END + 1.6)) });
    }
    g.restore();
  },
};

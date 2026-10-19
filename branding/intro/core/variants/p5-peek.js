// P5 · Ló mặt sau chữ: Chữ "Pika" bật lên trước như bức tường; Pika nhỏ ló đầu sau chữ "a", liếc trái phải, rồi nhảy vọt qua đầu các chữ về chỗ, chữ nảy theo khi Pika bay ngang.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P5', name: 'peek', title: 'Ló mặt sau chữ', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 2.8, events: [...[0, 1, 2, 3].map(i => ({ t: 0.35 + 0.08 * i, type: 'note', n: i })), { t: 1.0, type: 'whoosh' }, { t: 1.4, type: 'blip' }, { t: 1.7, type: 'blip' }, { t: 2.05, type: 'boing' }, { t: 2.6, type: 'pop' }, { t: 3.4, type: 'blip' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const SMALL = 0.6, aL = LET[3], topL = Math.min(...LET.map(l => l.box.y));
    const peekX = aL.piv[0] + 30, peekY = topL + 0.5 * HB.h * SMALL, hideY = aL.piv[1] + HB.h * SMALL;
    const T_HOP = 2.05, T_LAND = 2.6;
    const [bx, by] = toScreen([0, aL.piv[1]]);
    const hk = clamp((t - T_HOP) / (T_LAND - T_HOP)), he = easeInOut(hk);
    // đầu (vẽ trước để nằm sau chữ)
    if (t >= 0.95) {
      let fx, fy, sc;
      if (t < T_HOP) { const r = backOut(clamp((t - 0.95) / 0.4), 1.6); fx = peekX; fy = lerp(hideY, peekY, r); sc = SMALL; }
      else { fx = lerp(peekX, HPIV[0], he); fy = lerp(peekY, HPIV[1], he) - Math.sin(hk * Math.PI) * 300; sc = lerp(SMALL, 1, he); }
      const look = t < 1.35 ? 0 : t < 1.65 ? -lerp(0, 1, p2out(clamp((t - 1.35) / 0.12))) : t < 1.95 ? lerp(-1, 1, p2out(clamp((t - 1.65) / 0.14))) : lerp(1, 0, clamp((t - 1.95) / 0.1));
      let [sx, sy] = t < T_HOP ? [1, 1] : t < T_LAND ? [1 - 0.05 * Math.sin(hk * Math.PI), 1 + 0.1 * Math.sin(hk * Math.PI)] : idleLast(t, T_LAND);
      const [px, py] = toScreen([fx, fy]);
      g.save(); if (t < T_HOP) { g.beginPath(); g.rect(0, 0, W, by); g.clip(); }
      drawHead(g, { x: px, y: py, s: S * sc, sx, sy, look, earRot: t < T_LAND ? 0 : -7 * (1 - elasticOut(clamp((t - T_LAND) / 0.8))), blink: Math.min(blinkAt(t, 1.8), blinkAt(t, 3.4)) });
      g.restore();
    }
    // chữ: bật lên như bức tường, nảy khi Pika bay ngang qua
    g.save(); g.transform(S, 0, 0, S, OX, OY);
    for (const L of LET) {
      const k = clamp((t - (0.2 + 0.08 * L.i)) / 0.45); if (k <= 0) continue; const e = backOut(k, 2.2);
      const frac = (peekX - L.piv[0]) / (peekX - HPIV[0]), pt = T_HOP + (T_LAND - T_HOP) * clamp(frac);
      const bump = -45 * Math.sin(Math.PI * clamp((t - pt) / 0.28));
      drawLetter(g, L, { dy: 70 * (1 - e) + bump, sc: e, alpha: e });
    }
    g.restore();
  },
};

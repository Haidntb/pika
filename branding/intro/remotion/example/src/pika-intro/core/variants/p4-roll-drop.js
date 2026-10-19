// P4 · Lăn vào, chữ rơi xuống: Đầu lăn tròn từ trái vào, dừng lại lắc nhẹ; chữ rơi từ trên xuống nảy từng chữ, P trước, a sau.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P4', name: 'roll-drop', title: 'Lăn vào, chữ rơi xuống', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 1.85, events: [{ t: 0.2, type: 'whoosh' }, { t: 1.0, type: 'pop' }, ...[0, 1, 2, 3].map(i => ({ t: 1.31 + 0.12 * i, type: 'note', n: i + 2 })), { t: 2.2, type: 'blip' }, { t: 3.4, type: 'blip' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const T_ROLL = 0.2, T_STOP = 1.0, R = HB.h / 2;
    const push = 1 + 0.03 * sineInOut(clamp((t - 2.0) / 3.0));
    g.save(); const c = toScreen([LOCK.x + LOCK.w / 2, LOCK.y + LOCK.h / 2]); g.translate(c[0], c[1]); g.scale(push, push); g.translate(-c[0], -c[1]);
    g.save(); g.transform(S, 0, 0, S, OX, OY);
    for (const L of LET) {
      const t0 = T_STOP - 0.05 + 0.12 * L.i, k = clamp((t - t0) / 0.6); if (k <= 0) continue;
      const e = bounceOut(k), hit = clamp((t - t0 - 0.36) / 0.4), w = 0.12 * wobble(hit);
      drawLetter(g, L, { dy: -700 * (1 - e), sx: 1 + w * 0.6, sy: 1 - w });
    }
    g.restore();
    const k = clamp((t - T_ROLL) / (T_STOP - T_ROLL));
    if (t >= T_ROLL) {
      const startX = LOCK.x - (OX / S) - HB.w, e = easeOut(k), fx = lerp(startX, HPIV[0], e);
      const rot = (fx - HPIV[0]) / R + 0.12 * wobble(clamp((t - T_STOP) / 0.6));
      const [px, py] = toScreen([fx, HPIV[1]]);
      const earRot = t < T_STOP ? 0 : -7 * (1 - elasticOut(clamp((t - T_STOP) / 0.8)));
      drawHead(g, { x: px, y: py, s: S, rot, earRot, blink: Math.min(blinkAt(t, 2.2), blinkAt(t, 3.4)) });
    }
    g.restore();
  },
};

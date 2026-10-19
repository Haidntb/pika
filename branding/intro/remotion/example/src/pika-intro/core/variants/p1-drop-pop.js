// P1 · Rơi và bật: Đúng cảnh mở đầu của bản đầu: đầu rơi xuống nảy, tai rung, chữ bật lên lần lượt, nháy mắt; rồi nhún, nháy lần nữa.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P1', name: 'drop-pop', title: 'Rơi và bật', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 1.25, events: [{ t: 0.5, type: 'pop' }, ...[0, 1, 2, 3].map(i => ({ t: 0.7 + 0.07 * i, type: 'note', n: i })), { t: 1.1, type: 'blip' }, { t: 2.0, type: 'pop' }, { t: 2.9, type: 'blip' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const push = 1 + 0.03 * sineInOut(clamp((t - 2.0) / 2.6));
    g.save(); const c = toScreen([LOCK.x + LOCK.w / 2, LOCK.y + LOCK.h / 2]); g.translate(c[0], c[1]); g.scale(push, push); g.translate(-c[0], -c[1]);
    g.save(); g.transform(S, 0, 0, S, OX, OY);
    for (const L of LET) { const k = clamp((t - (0.5 + 0.07 * L.i)) / 0.5); if (k <= 0) continue; const e = backOut(k, 2.2); drawLetter(g, L, { dy: 70 * (1 - e), sc: e, alpha: e }); }
    g.restore();
    const k = clamp((t - 0.2) / 0.6);
    if (k > 0) {
      const e = backOut(k, 1.7), [sx, sy] = squashAt(t, 2.0), [px, py] = toScreen(HPIV);
      const earRot = t < 0.55 ? -7 : -7 * (1 - elasticOut(clamp((t - 0.55) / 0.8)));
      drawHead(g, { x: px, y: py + 90 * S * (1 - e), s: S * lerp(0.4, 1, e), sx, sy, earRot, blink: Math.min(blinkAt(t, 1.1), blinkAt(t, 2.9)), alpha: e });
    }
    g.restore();
  },
};

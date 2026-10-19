// P7 · Đôi mắt trước: Chỉ đôi mắt cười hiện ra giữa màn, nháy; đầu loang ra từ đôi mắt, tai bật; nhảy sang trái, chữ hiện từng chữ và mắt liếc theo, cuối cùng nhìn lại người xem.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P7', name: 'eyes-first', title: 'Đôi mắt trước', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 3.15, events: [{ t: 0.3, type: 'blip' }, { t: 0.7, type: 'blip' }, { t: 0.95, type: 'whoosh' }, { t: 1.35, type: 'pop' }, { t: 1.75, type: 'boing' }, { t: 2.25, type: 'pop' }, ...[0, 1, 2, 3].map(i => ({ t: 2.5 + 0.18 * i, type: 'note', n: i + 1 })), { t: 3.5, type: 'blip' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const MS = 0.95, stage = { x: W / 2, y: H / 2 + HB.h * MS / 2 - 10 };
    const [dx, dy] = toScreen(HPIV), T_JUMP = 1.75, T_LAND = 2.25;
    // chữ hiện từng chữ, mắt liếc theo
    g.save(); g.transform(S, 0, 0, S, OX, OY);
    for (const L of LET) { const k = clamp((t - (2.4 + 0.18 * L.i)) / 0.4); if (k <= 0) continue; const e = backOut(k, 2.4); drawLetter(g, L, { sc: e, alpha: e }); }
    g.restore();
    const jk = clamp((t - T_JUMP) / (T_LAND - T_JUMP)), je = easeInOut(jk);
    const x = lerp(stage.x, dx, je), y = lerp(stage.y, dy, je) - Math.sin(jk * Math.PI) * 220, s = lerp(MS, S, je);
    const eyeScale = backOut(clamp((t - 0.2) / 0.4), 2), reveal = easeOut(clamp((t - 0.95) / 0.45)), earScale = backOut(clamp((t - 1.3) / 0.35), 2.5);
    let look = 0; if (t > 2.35 && t < 3.25) look = lerp(0.2, 1, clamp((t - 2.35) / 0.75)); else if (t >= 3.25) look = lerp(1, 0, p2out(clamp((t - 3.25) / 0.15)));
    let [sx, sy] = t < T_JUMP ? [1 + 0.08 * easeInOut(clamp((t - 1.55) / 0.2)), 1 - 0.16 * easeInOut(clamp((t - 1.55) / 0.2))] : t < T_LAND ? [1 - 0.05 * Math.sin(jk * Math.PI), 1 + 0.1 * Math.sin(jk * Math.PI)] : idleLast(t, T_LAND);
    if (t >= 0.2) drawHead(g, { x, y, s, sx, sy, look, eyeScale, reveal, earScale, blink: Math.min(blinkAt(t, 0.7), blinkAt(t, 3.5)), earRot: t < 1.3 ? 0 : -7 * (1 - elasticOut(clamp((t - 1.3) / 0.8))) });
  },
};

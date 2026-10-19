// P2 · Rơi giữa màn, nhảy sang: Theo nhịp intro Pika Math: đầu rơi to giữa màn, thở, lấy đà, nhảy sang trái về chỗ, chữ "Pika" trượt ra từ sau mặt.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P2', name: 'jump-slide', title: 'Rơi giữa màn, nhảy sang', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 2.8, events: [{ t: 0.5, type: 'pop' }, { t: 1.2, type: 'blip' }, { t: 1.8, type: 'boing' }, { t: 2.3, type: 'pop' }, { t: 2.3, type: 'swish' }, { t: 3.4, type: 'blip' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const MS = 0.95, stage = { x: W / 2, y: H / 2 + HB.h * MS / 2 - 10, s: MS };
    const [dx, dy] = toScreen(HPIV), dest = { x: dx, y: dy, s: S };
    const T_IN = 0.2, T_SQ = 1.6, T_JUMP = 1.8, T_LAND = 2.3, T_SLIDE = 2.3;
    // chữ trượt ra từ sau mặt, chữ bên phải ra trước
    if (t >= T_SLIDE) {
      g.save(); g.transform(S, 0, 0, S, OX, OY);
      g.beginPath(); g.rect(HB.r - 40, -4000, 8000, 8000); g.clip();
      const right = Math.max(...LET.map(l => l.box.r));
      [...LET].sort((a, b) => b.box.r - a.box.r).forEach((L, j) => {
        const t0 = T_SLIDE + j * 0.05, k = clamp((t - t0) / 0.42); if (k <= 0) return;
        const hit = clamp((t - t0 - 0.42) / 0.5), w = 0.1 * wobble(hit);
        drawLetter(g, L, { dx: -(right - HB.r + 40) * (1 - backOut(k, 0.7)), sx: 1 - w, sy: 1 + w * 0.7 });
      });
      g.restore();
    }
    const kin = clamp((t - T_IN) / 0.6); if (kin <= 0) return;
    const ein = backOut(kin, 1.7);
    const jk = clamp((t - T_JUMP) / (T_LAND - T_JUMP)), je = easeInOut(jk);
    let x = lerp(stage.x, dest.x, je), y = lerp(stage.y, dest.y, je) - Math.sin(jk * Math.PI) * 220, s = lerp(stage.s, dest.s, je);
    let sx = 1, sy = 1;
    if (t < T_JUMP) {
      const land = clamp((t - 0.8) / 0.35), lw = land > 0 && land < 1 ? Math.sin(land * Math.PI * 2) * Math.exp(-land * 3) * 0.12 : 0;
      const br = Math.sin(Math.PI * clamp((t - 1.2) / (T_SQ - 1.2))), a = easeInOut(clamp((t - T_SQ) / (T_JUMP - T_SQ)));
      sy = 1 - lw + 0.025 * br - 0.16 * a; sx = 1 + lw * 0.6 - 0.012 * br + 0.08 * a;
      y += 90 * MS * (1 - ein); s *= lerp(0.4, 1, ein);
    } else if (t < T_LAND) {
      const rel = 1 - easeOut(clamp(jk / 0.3));
      sy = 1 + 0.1 * Math.sin(jk * Math.PI) - 0.16 * rel; sx = 1 - 0.05 * Math.sin(jk * Math.PI) + 0.08 * rel;
    } else { const land = clamp((t - T_LAND) / 0.35); if (land < 1) { const w = Math.sin(land * Math.PI * 2) * Math.exp(-land * 3) * 0.14; sy = 1 - w; sx = 1 + w * 0.6; } }
    const earRot = t < 0.55 ? -7 : -7 * (1 - elasticOut(clamp((t - 0.55) / 0.8)));
    drawHead(g, { x, y, s, sx, sy, earRot, blink: Math.min(blinkAt(t, 1.2), blinkAt(t, 3.4)), alpha: ein });
  },
};

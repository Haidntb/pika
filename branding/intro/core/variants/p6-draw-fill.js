// P6 · Vẽ nét rồi đổ màu: Nét viền của tai, đầu, mắt và từng chữ được vẽ ra như bút vẽ; xong thì màu đổ đầy từng phần kèm nhún nhẹ, rồi nháy mắt.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P6', name: 'draw-fill', title: 'Vẽ nét rồi đổ màu', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 2.35, events: [{ t: 0.2, type: 'swish' }, { t: 0.9, type: 'swish' }, { t: 1.75, type: 'shimmer' }, { t: 1.9, type: 'pop' }, { t: 2.6, type: 'blip' }, { t: 3.2, type: 'pop' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const T_FILL = 1.75, T_DONE = 2.25;
    if (t >= T_DONE) {
      const [sx, sy] = squashAt(t, 3.2), [px, py] = toScreen(HPIV);
      g.save(); g.transform(S, 0, 0, S, OX, OY); for (const L of LET) drawLetter(g, L, {}); g.restore();
      drawHead(g, { x: px, y: py, s: S, sx, sy, blink: Math.min(blinkAt(t, 2.6), blinkAt(t, 3.9)) });
      return;
    }
    const items = [
      { path: HEAD.ears.path, len: PLEN.ears, t0: 0.2 }, { path: HEAD.body.path, len: PLEN.body, t0: 0.3 },
      { path: HEAD.eyeLeft.path, len: PLEN.eyeLeft, t0: 0.75 }, { path: HEAD.eyeRight.path, len: PLEN.eyeRight, t0: 0.82 },
      ...LET.map(L => ({ path: L.path, len: PLEN.word[L.i], t0: 0.6 + 0.16 * L.i, box: L.box })),
    ];
    g.save(); g.transform(S, 0, 0, S, OX, OY);
    g.strokeStyle = CYAN; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
    items.forEach((it, j) => {
      const k = clamp((t - it.t0) / 0.75); if (k <= 0) return;
      const fk = clamp((t - (T_FILL + j * 0.04)) / 0.14), pop = fk > 0 ? lerp(0.94, 1, backOut(clamp((t - (T_FILL + j * 0.04)) / 0.3), 3)) : 1;
      const b = it.box || HB, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      g.save(); g.translate(cx, cy); g.scale(pop, pop); g.translate(-cx, -cy);
      if (fk > 0) { g.globalAlpha = fk; g.fillStyle = CYAN; g.fill(it.path); if (it.path === HEAD.body.path) { g.fillStyle = '#FFFFFF'; g.fill(HEAD.face.path); g.fillStyle = CYAN; g.fill(HEAD.eyeLeft.path); g.fill(HEAD.eyeRight.path); } }
      g.globalAlpha = 1 - clamp((t - T_FILL - 0.2) / 0.25);
      g.setLineDash([it.len, it.len]); g.lineDashOffset = it.len * (1 - easeInOut(k)); g.stroke(it.path);
      g.restore();
    });
    g.restore();
  },
};

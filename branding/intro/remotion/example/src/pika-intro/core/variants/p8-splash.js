// P8 · Giọt nước bắn: Một giọt xanh rơi xuống, đập bẹp rồi phình thành đầu Pika; 4 giọt nhỏ văng sang phải, mỗi giọt chạm chỗ thì biến thành một chữ.
import { clamp, lerp, easeOut, easeInOut, sineInOut, p2out, backOut, elasticOut, bounceOut, wobble, geometry, drawHead, drawLetter, blinkAt, squashAt, idleLast, lerpPts, fillPts, CYAN } from '../toolkit.js';

export default {
  id: 'P8', name: 'splash', title: 'Giọt nước bắn', duration: 5,
  // mốc tiếng (giây): voice = lúc giọng "Pika" vào; events = tiếng động (pop, boing, swish, whoosh, blip, note n, tock n, shimmer)
  cues: { voice: 1.75, events: [{ t: 0.65, type: 'pop' }, { t: 0.68, type: 'swish' }, ...[0, 1, 2, 3].map(i => ({ t: 1.15 + 0.08 * i, type: 'note', n: i + 3 })), { t: 1.35, type: 'boing' }, { t: 2.0, type: 'blip' }, { t: 3.4, type: 'blip' }] },
  // vẽ một khung ở thời điểm t (giây); K: khung hình từ createStage (W, H, S, OX, OY, toScreen)
  render(g, t, K) {
    const { W, H, S, OX, OY, toScreen } = K;
    const { HEAD, HB, HPIV, LET, LOCK, HC, HEAD_OUT, HEAD_BLOB, LET_OUT, PLEN } = geometry();
    const T_HIT = 0.65, T_HEAD = 1.35;
    g.save(); g.transform(S, 0, 0, S, OX, OY); g.fillStyle = CYAN;
    // giọt nhỏ thành chữ
    LET_OUT.forEach((D, i) => {
      const L = LET[i], t0 = T_HIT + 0.05, fly = 0.45 + 0.08 * i, land = t0 + fly;
      if (t < t0) return;
      if (t < land) { const k = (t - t0) / fly, x = lerp(HC[0], D.c[0], k), y = lerp(HC[1], D.c[1], k) - Math.sin(k * Math.PI) * 260; g.beginPath(); g.arc(x, y, D.r * lerp(0.5, 1, k), 0, Math.PI * 2); g.fill(); return; }
      const mk = clamp((t - land) / 0.35);
      if (mk < 1) fillPts(g, lerpPts(D.blob, D.o, backOut(mk, 1.3)));
      else drawLetter(g, L, {});
    });
    // giọt lớn
    if (t < T_HIT) { if (t >= 0.2) { const k = (t - 0.2) / (T_HIT - 0.2), y = lerp(HC[1] - 900, HC[1], k * k); g.beginPath(); g.ellipse(HC[0], y, 70, 95, 0, 0, Math.PI * 2); g.fill(); } }
    else if (t < T_HEAD) {
      const sq = clamp((t - T_HIT) / 0.12), mk = clamp((t - T_HIT - 0.1) / 0.55);
      const blob = HEAD_BLOB.map(([x, y]) => [HC[0] + (x - HC[0]) * lerp(0.35, 1, mk) * (1 + 0.5 * (1 - mk) * sq), HC[1] + (y - HC[1]) * lerp(0.35, 1, mk) * (1 - 0.45 * (1 - mk) * sq)]);
      fillPts(g, lerpPts(blob, HEAD_OUT, backOut(mk, 1.4) * clamp((t - T_HIT - 0.15) / 0.4)));
      const fk = backOut(clamp((t - 1.0) / 0.3), 2);
      if (fk > 0) { const fb = HEAD.face.box, cx = fb.x + fb.w / 2, cy = fb.y + fb.h / 2; g.save(); g.translate(cx, cy); g.scale(fk, fk); g.translate(-cx, -cy); g.fillStyle = '#FFFFFF'; g.fill(HEAD.face.path); g.restore(); }
    }
    g.restore();
    if (t >= T_HEAD - 0.35) {
      const [px, py] = toScreen(HPIV), [sx, sy] = idleLast(t, T_HEAD);
      const a = clamp((t - (T_HEAD - 0.35)) / 0.05);
      if (t >= T_HEAD) drawHead(g, { x: px, y: py, s: S, sx, sy, earRot: -7 * (1 - elasticOut(clamp((t - T_HEAD) / 0.8))), blink: Math.min(blinkAt(t, 2.0), blinkAt(t, 3.4)) });
      else drawHead(g, { x: px, y: py, s: S, reveal: 0, earScale: backOut(clamp((t - (T_HEAD - 0.35)) / 0.35), 2.5), eyeScale: backOut(clamp((t - (T_HEAD - 0.25)) / 0.25), 2), alpha: a });
    }
  },
};

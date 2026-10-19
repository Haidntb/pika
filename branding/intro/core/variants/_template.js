// P9 · <Tên kiểu>: <mô tả một câu: chuyện gì xảy ra>.
// Cách tạo kiểu mới: chép file này thành pN-<ten-tieng-anh>.js, sửa id/name/title/cues/render, chạy `node tools/build.mjs` rồi `node tools/check.mjs`.
// Luật: khung cuối (t = duration) phải là logo đứng yên đúng vị trí (như drawLogo; được phóng chậm cả logo tối đa 3%); mỗi khung chỉ phụ thuộc t; không Date.now / Math.random;
// đổi màu giữa hai màu khác hẳn nhau thì đổi tức thì; không pháo bông, không hiệu ứng ngoài hình đầu Pika và chữ "Pika".
import { clamp, lerp, easeOut, easeInOut, backOut, elasticOut, wobble, geometry, drawHead, drawLetter, blinkAt, idleLast } from '../toolkit.js';

export default {
  id: 'P9', name: 'my-variant', title: 'Tên kiểu', duration: 5,
  cues: { voice: 1.5, events: [{ t: 0.6, type: 'pop' }, { t: 2.0, type: 'blip' }] },
  render(g, t, K) {
    const { S, OX, OY, toScreen } = K;
    const { HB, HPIV, LET } = geometry();
    // chữ: vẽ trong hệ toạ độ logo
    g.save(); g.transform(S, 0, 0, S, OX, OY);
    for (const L of LET) { const k = clamp((t - (0.8 + 0.1 * L.i)) / 0.4); if (k > 0) drawLetter(g, L, { sc: backOut(k, 2), alpha: k }); }
    g.restore();
    // đầu: neo giữa đáy, toạ độ màn hình
    const k = clamp((t - 0.2) / 0.5), [px, py] = toScreen(HPIV);
    if (k > 0) drawHead(g, { x: px, y: py, s: S * backOut(k, 1.7), blink: blinkAt(t, 2.0) });
  },
};

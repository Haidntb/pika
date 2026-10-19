# Pika intro: hướng dẫn cho AI

Intro logo Pika 5 giây, vẽ bằng code (canvas 2D), dùng lại được trong HyperFrames và Remotion. Có 8 kiểu chuyển động (P1–P8), người dùng tự chọn; thêm kiểu mới được (mục "Thêm kiểu mới"). Mọi kiểu kết bằng cùng một logo: đầu Pika + chữ "Pika", xanh `#46C4D7`. Bản chính thức: khung 1920x1080.

| Kiểu | Tên file | Chuyển động |
|---|---|---|
| P1 | `p1-drop-pop` | Đầu rơi xuống nảy, chữ bật lên lần lượt |
| P2 | `p2-jump-slide` | Đầu rơi to giữa màn, nhảy sang trái, chữ trượt ra từ sau mặt |
| P3 | `p3-hop-letters` | Đầu nhỏ nhảy qua chỗ từng chữ, mỗi chỗ đáp để lại một chữ |
| P4 | `p4-roll-drop` | Đầu lăn vào, chữ rơi từ trên xuống nảy |
| P5 | `p5-peek` | Chữ lên trước, Pika ló mặt sau chữ "a", nhảy vọt qua đầu chữ về chỗ |
| P6 | `p6-draw-fill` | Vẽ nét viền rồi đổ màu |
| P7 | `p7-eyes-first` | Đôi mắt hiện trước, đầu loang ra từ mắt, mắt liếc theo chữ |
| P8 | `p8-splash` | Giọt nước rơi phình thành đầu, giọt nhỏ văng thành chữ |

## Gói có gì

| Đường dẫn | Là gì | Sửa được không |
|---|---|---|
| `core/pika-intro.js` | Cửa vào: `createPikaIntro({ width, height, variant, background })` trả `{ duration, cues, render(ctx, t), renderLogo(ctx) }`; `VARIANT_IDS`; `logoSVG(layout, palette)`. Kiểu TypeScript: `pika-intro.d.ts` | Ít khi cần |
| `core/toolkit.js` | Bộ dụng cụ chung: đường cong nhịp, hình đã đo (`geometry()`), `drawHead`, `drawLetter`, `blinkAt`, `squashAt`, `idleLast`, biến hình, `createStage` | Thêm hàm dùng chung thì thêm ở đây |
| `core/variants/pN-*.js` | Mỗi kiểu một file: `id`, `name`, `title`, `duration`, `cues`, `render(g, t, K)` | Sửa và thêm kiểu ở đây |
| `core/variants/_template.js` | Khung mẫu cho kiểu mới | Chép, không sửa |
| `core/variants/index.js` | Danh sách kiểu | Sinh bởi `tools/build.mjs` |
| `core/logo-paths.js` | Nét SVG gốc của logo | Không sửa tay |
| `hyperframes/pika-intro-pN.html` | Block HyperFrames của từng kiểu, lõi nhúng sẵn | Sinh bởi `tools/build.mjs` |
| `hyperframes/example/`, `remotion/example/` | Dự án mẫu chạy được | Mẫu để chép |
| `remotion/PikaIntro.tsx` | Component Remotion | Sửa được |
| `logo/` | Logo tĩnh: `lockups/pika-horizontal-*`, `lockups/pika-stacked-*`, `icon/pika-icon-*` (`-color`, `-black`, `-white`), `brand.json` | Sinh bởi `tools/build-logo.mjs` |
| `sound/` | `voice-pika.wav` (giọng "Pika"), `mix-pN.wav` (tiếng hoàn chỉnh của kiểu PN) | `mix-*` sinh bởi `tools/export.sh` |
| `preview.html`, `preview/` | Trang xem thử (mở thẳng bằng Chrome, chọn kiểu, bật tiếng), MP4 xem thử từng kiểu | Sinh lại bằng lệnh |

## Ghép vào HyperFrames

1. Chép `hyperframes/pika-intro-pN.html` (kiểu muốn dùng) vào `compositions/`; chép `sound/mix-pN.wav` vào `assets/pika-intro/`.
2. Gắn vào `index.html`:

```html
<div data-composition-id="pika-intro-p1"
     data-composition-src="compositions/pika-intro-p1.html"
     data-start="0" data-duration="5" data-track-index="1"
     data-width="1920" data-height="1080"></div>
```

- `data-composition-id` phải trùng id trong file block (`pika-intro-pN`).
- Biến: `background` (mã màu), `transparent` (`true` để nền trong suốt, đè lên cảnh khác), qua `data-variable-values='{"transparent":true}'`.
- Mẫu chạy được: `hyperframes/example/`.

## Ghép vào Remotion

1. Chép `core/` và `remotion/PikaIntro.tsx` vào `src/` của dự án, giữ vị trí tương đối (component import `../core/pika-intro.js`); chép `sound/mix-pN.wav` vào `public/pika-intro/`.
2. Dùng:

```tsx
<Sequence durationInFrames={Math.round(pikaIntroDuration('P5') * fps)}>
  <PikaIntro variant="P5" />
</Sequence>
```

- Props: `variant`, `background` (mã màu hoặc `null`), `sound` (`true` đọc `public/pika-intro/mix-pN.wav`, chuỗi để chỉ file khác, `null` để tắt).
- Mẫu chạy được: `remotion/example/` (`yarn install`, `npx remotion render PikaIntro-P1 out/p1.mp4`).

## Thêm kiểu mới

1. Chép `core/variants/_template.js` thành `core/variants/p9-<ten-tieng-anh>.js`; sửa `id: 'P9'`, `name`, `title`, `duration`, `cues`, `render`.
2. Trong `render(g, t, K)`: chữ vẽ trong hệ toạ độ logo (`g.transform(S, 0, 0, S, OX, OY)` rồi `drawLetter`), đầu vẽ bằng toạ độ màn hình (`drawHead({ x, y, s })`, neo giữa đáy đầu, `toScreen(HPIV)` là chỗ của đầu trong logo). Xem các kiểu P1–P8 làm mẫu.
3. `cues`: `voice` = giây giọng "Pika" vào (thường ngay sau khi chữ hiện đủ); `events` = tiếng động `{ t, type }`, `type` là một trong `pop`, `boing`, `swish`, `whoosh`, `blip`, `note` (kèm `n` 0–7, cao dần), `tock` (kèm `n`), `shimmer`.
4. `node tools/build.mjs` → kiểu mới có trong `preview.html`, block HyperFrames, Remotion.
5. `VARIANTS="P9" tools/export.sh` → tạo `sound/mix-p9.wav` và MP4 xem thử.
6. `node tools/check.mjs P9` → phải "đạt".

## Lệnh

- `node tools/build.mjs`: sinh lại danh sách kiểu, `preview.html`, block HyperFrames, chép sang 2 dự án mẫu.
- `node tools/build-logo.mjs`: sinh lại `logo/`.
- `tools/export.sh` (hoặc `VARIANTS="P1 P5" tools/export.sh`): tiếng, MP4, MOV ProRes 4444 nền trong suốt, PNG có alpha vào `export/`; MP4 chép vào `preview/`.
- `node tools/check.mjs` (hoặc `node tools/check.mjs P5`): kiểm tự động.
- Xem một khung: `VARIANT=P5 node tools/render.mjs /tmp/khung 30 white 1.5,4.9`.

## Luật

- Khung cuối của mọi kiểu là logo đứng yên đúng vị trí (được phóng chậm cả logo tối đa 3%). `tools/check.mjs` kiểm điều này.
- Mỗi khung chỉ phụ thuộc `t`: không `Date.now()`, không `Math.random()`.
- Chỉ dùng hình đầu Pika và chữ "Pika" (qua `toolkit.js`); không pháo bông, không vẽ thêm hình trang trí.
- Đổi màu giữa hai màu khác hẳn nhau thì đổi tức thì, không chuyển dần (chuyển dần đi qua màu xỉn).
- File sinh (`preview.html`, `hyperframes/*.html`, `core/variants/index.js`, `logo/`) không sửa tay.
- Tên file, id, thư mục: tiếng Anh, không dấu.

## Lỗi dễ vấp

- HyperFrames: mọi `<audio>` cần `id`; block tạo `<canvas>` lúc chạy (để trong markup thì Studio không đọc được biến), giữ nguyên cách đó.
- `preview.html` nhúng sẵn lõi nên mở bằng `file://` được; đừng đổi sang `<script type="module">`, Chrome chặn module khi mở file trực tiếp.
- Các kiểu dựng cho khung 16:9. Khung khác vẫn vẽ được nhưng chưa chỉnh đường đi, logo có thể nhỏ.

## Bản quyền

Logo Pika, nhân vật Pika và giọng nói trong `sound/` là tài sản của Step Up. Không cấp phép dùng lại ngoài các sản phẩm của Step Up.

# Pika intro

Intro logo Pika 5 giây, 8 kiểu chuyển động để chọn, có tiếng (giọng "Pika"). Chuyển động là code, dùng lại được trong HyperFrames và Remotion; AI đọc `AGENTS.md`.

| Kiểu | Chuyển động |
|---|---|
| P1 | Đầu rơi xuống nảy, chữ bật lên lần lượt |
| P2 | Đầu rơi to giữa màn, nhảy sang trái, chữ trượt ra từ sau mặt |
| P3 | Đầu nhỏ nhảy qua chỗ từng chữ, mỗi chỗ đáp để lại một chữ |
| P4 | Đầu lăn vào, chữ rơi từ trên xuống nảy |
| P5 | Chữ lên trước, Pika ló mặt sau chữ "a", nhảy vọt qua đầu chữ về chỗ |
| P6 | Vẽ nét viền rồi đổ màu |
| P7 | Đôi mắt hiện trước, đầu loang ra từ mắt, mắt liếc theo chữ |
| P8 | Giọt nước rơi phình thành đầu, giọt nhỏ văng thành chữ |

## Xem

- Mở `preview.html` bằng Chrome: chọn kiểu, nền, bật tiếng, kéo thanh thời gian.
- `preview/`: MP4 từng kiểu, có tiếng.

## Lấy logo

`logo/lockups/` (ngang, dọc) và `logo/icon/` (chỉ mặt Pika), mỗi cái 3 bản: `-color`, `-black` (in một màu, nền sáng), `-white` (nền tối). Dùng ở đâu: `logo/brand.json`.

## Thêm kiểu mới

Chép `core/variants/_template.js`, làm theo mục "Thêm kiểu mới" trong `AGENTS.md`, rồi `node tools/build.mjs` và `node tools/check.mjs`.

## Xuất video

Cần Chrome, Node 18+, Python 3 có numpy, ffmpeg. `tools/export.sh` ra `export/`: MP4, MOV nền trong suốt, PNG có alpha cho mọi kiểu.

## Bản quyền

Logo Pika, nhân vật Pika và giọng nói là tài sản của Step Up. Không cấp phép dùng lại ngoài các sản phẩm của Step Up.

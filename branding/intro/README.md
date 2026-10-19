# Intro logo Pika (lab)

Intro logo Pika 5 giây, đang ở giai đoạn chọn kiểu chuyển động. Hình: đầu Pika và chữ "Pika", xanh `#46C4D7`. Mỗi kiểu vẽ bằng code (canvas), có tiếng.

| Kiểu | Chuyển động |
|---|---|
| P1 | Rơi và bật: đầu rơi xuống nảy, chữ bật lên lần lượt |
| P2 | Rơi giữa màn, nhảy sang trái, chữ trượt ra từ sau mặt (nhịp intro Pika Math) |
| P3 | Đầu nhỏ nhảy qua từng chữ, mỗi chỗ đáp để lại một chữ |
| P4 | Đầu lăn vào, chữ rơi xuống nảy |
| P5 | Chữ lên trước, Pika ló mặt sau chữ "a", nhảy vọt qua đầu chữ về chỗ |
| P6 | Vẽ nét rồi đổ màu |
| P7 | Đôi mắt hiện trước, đầu loang ra từ mắt, mắt liếc theo chữ |
| P8 | Giọt nước rơi phình thành đầu, giọt nhỏ văng thành chữ |

## Xem

- Video: `lab/video/` (`pika-intro-P1..P8.mp4` có tiếng; `so-sanh-*-cung-luc.mp4` 4 kiểu chạy cùng lúc; `so-sanh-*-lan-luot.mp4` nối 4 kiểu có tiếng).
- Chạy lab: `python3 serve.py` trong thư mục này, mở `http://127.0.0.1:8842/lab/index.html` (bấm "Nghe P1"… để nghe từng kiểu).

## Tiếng

`sound/voice-pika.wav`: giọng "Pika"; nguồn ở `sound/SOURCE.md`. Tiếng động tạo bằng code theo bảng `CUES` trong `lab/index.html`.

## Bản quyền

Logo Pika, nhân vật Pika và giọng nói là tài sản của Step Up. Không cấp phép dùng lại ngoài các sản phẩm của Step Up.

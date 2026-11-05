# Gõ Tự Do

Trang giới thiệu bộ gõ tiếng Việt **Gõ Tự Do**: gõ Telex/VNI, tự nhận biết khi bạn gõ tiếng Anh, tự sửa lỗi trượt phím, gõ tắt, tự nhường UniKey.

Trang tĩnh (HTML, CSS, JS thuần), không cần build.

## Đưa lên Vercel
1. vercel.com → **Add New → Project** → Import repo này.
2. Framework Preset: **Other**. Build Command và Output Directory để trống. Bấm **Deploy**.
3. Có tên miền rồi thì sửa `og:image` trong `index.html` thành đường dẫn đầy đủ (vd `https://ten-mien/og.png`) để Facebook và diễn đàn hiện ảnh xem trước.

## Cấu trúc
- `index.html`, `style.css`, `main.js` — trang
- `gotudo.bundle.js` — bộ gõ bản web (ô gõ thử trên trang chạy bằng file này; cũng là file để nhúng vào website khác)
- `downloads/GoTuDo.exe` — bản Windows
- `fonts/` — Be Vietnam Pro, JetBrains Mono (giấy phép SIL OFL, kèm trong thư mục)
- `og.png` — ảnh xem trước khi chia sẻ link
- `vercel.json` — header tải file, cache

## Chạy thử trên máy
```
npx serve .
```

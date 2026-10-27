# ams-next

Web AMS (vật liệu công nghiệp) chuyển từ CakePHP2 sang Next.js 16. Core admin lấy từ `nuochoa-next`, phần giao diện site giữ y hệt bản CK2.

## Cần có

- Node.js 20 trở lên (máy hiện dùng 24.16)
- XAMPP đã bật MySQL (MariaDB 10.4)
- Database `ams`: Next dùng chung DB này với bản CK2
- Thư mục `C:/xampp/htdocs/ams`, vì ảnh upload đọc từ `app/webroot/uploads/` ở đây

## Cài lần đầu

```bash
cd ams-next
npm install
```

`npm install` tự chép TinyMCE vào `public/tinymce` (qua `postinstall`).

Tạo file `.env.local` ở thư mục gốc:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=ams
SESSION_SECRET=<chuỗi ngẫu nhiên ≥ 32 ký tự>
SITE_URL=http://localhost:3200/
CK2_ROOT=C:/xampp/htdocs/ams
```

| Biến | Ý nghĩa |
|---|---|
| `DB_*` | Kết nối MySQL, dùng thư viện `mysql2`, không có ORM hay migration |
| `SESSION_SECRET` | Khoá ký cookie đăng nhập admin. Ngắn hơn 32 ký tự là báo lỗi |
| `SITE_URL` | Địa chỉ gốc của site, dùng cho link tuyệt đối, sitemap, canonical |
| `CK2_ROOT` | Thư mục gốc bản CK2, nơi chứa `app/webroot/uploads/` |

Sinh `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Chạy dev

```bash
npx next dev -p 3200
```

- Site: http://localhost:3200/ (bản tiếng Anh: `?lang=en`)
- Admin: http://localhost:3200/admin, đăng nhập bằng tài khoản admin trong DB (mật khẩu MD5 như CK2)

Phải chạy cổng 3200 cho khớp `SITE_URL` và các script đối chiếu.

## Chạy bản build

```bash
npm run build
npx next start -p 3200
```

## Lệnh khác

| Lệnh | Việc |
|---|---|
| `npm run lint` | Kiểm tra ESLint |
| `npm run lang-modes` | Sinh lại `site/lang-modes.json` (kiểu ô của từng khoá giao diện). Chạy khi site **đang chạy**, mỗi lần thêm hoặc đổi bánh răng ở site |
| `node ../nuochoa-next/scripts/sync-core.js ams-next` | Kéo core mới từ nuochoa-next (chạy ở thư mục cha) |

## Cấu trúc

| Đường dẫn | Thuộc về |
|---|---|
| `app/(core)/`, `components/`, `lib/`, `hooks/` | Core admin: **không sửa ở đây**, sửa bên `nuochoa-next` rồi sync |
| `app/(site)/` | Các route của site (trang, `robots.txt`, `sitemap.xml`, `404.html`) |
| `site/` | View, component, móc admin (`admin.ts`), móc proxy (`proxy.ts`) của ams |
| `public/theme/` | `style.css` + `app.js` jQuery, giữ nguyên từ CK2 |

Ảnh `/uploads/*` và `/app/webroot/uploads/*` được rewrite sang `/media/*`, đọc file từ `CK2_ROOT`.

## Đối chiếu với bản CK2

Bản CK2 phải chạy ở http://localhost/ams/ và Next ở http://localhost:3200/. Các script nằm trong `../ams-next-ref/`:

```bash
cd ../ams-next-ref
node domdiff.js
node acts.js
node shotdiff.js
```

| Script | So sánh |
|---|---|
| `domdiff.js` | DOM khi tắt JS, 399 URL vi + en |
| `acts.js` | Tương tác |
| `shotdiff.js` | Pixel |

Chạy bằng Git Bash thì thêm `MSYS_NO_PATHCONV=1` trước lệnh.

## Trước khi lên server

- Đổi `DB_*`, `SITE_URL`, `CK2_ROOT` trong `.env.local` theo server
- Bỏ noindex và meta robots chặn index (hiện đang bật cho môi trường dev)
- Đặt `SESSION_SECRET` mới cho server

## Database

File dump nằm ở `database/ams.sql` (MariaDB 10.4, 48 bảng, bảng mã `utf8mb4`). Bản CK2 và bản Next dùng chung DB này.

Import bằng dòng lệnh:

```bash
mysql -uroot -e "CREATE DATABASE ams CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -uroot --default-character-set=utf8mb4 ams < database/ams.sql
```

Hoặc vào phpMyAdmin, tạo DB `ams` rồi Import file trên.

Ảnh upload không nằm trong dump, chúng ở `CK2_ROOT/app/webroot/uploads/`.

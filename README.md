# ams-next

Web AMS (vật liệu công nghiệp) chuyển từ CakePHP2 sang Next.js 16. Bộ này là gốc cho các dự án Next sau (thay `nuochoa-next`), phần giao diện site giữ y hệt bản CK2. Truy cập DB qua Prisma.

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

`npm install` tự chép TinyMCE vào `public/tinymce` và sinh Prisma Client vào `prisma/generated/` (qua `postinstall`).

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
| `DB_*` | Kết nối MySQL qua Prisma (adapter MariaDB). Dùng cho cả app lẫn lệnh `prisma` (`prisma.config.ts` đọc `.env.local`) |
| `SESSION_SECRET` | Khoá ký cookie đăng nhập admin. Ngắn hơn 32 ký tự là báo lỗi |
| `SITE_URL` | Địa chỉ gốc của site, dùng cho link tuyệt đối, sitemap, canonical |
| `CK2_ROOT` | Thư mục gốc bản CK2, nơi chứa `app/webroot/uploads/` |

Mọi trang có meta robots `noindex,nofollow` (cố định ở `site/lib/meta.ts`, mở index thì sửa ở đó).

Sinh `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Chạy dev

```bash
npx next dev -p 3200
```

- Site: http://localhost:3200/ (bản tiếng Anh: thêm `/en` trước đường dẫn, ví dụ `/en/gioi-thieu.html`; link cũ `?lang=en` tự chuyển 301)
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
| `npm run db:check` | Thử kết nối DB theo `.env.local`, in nguyên nhân nếu lỗi (MySQL chưa chạy, sai mật khẩu, chưa có DB…) |
| `npm run lint` | Kiểm tra ESLint |
| `npm run format` | Format toàn bộ code bằng Prettier (cấu hình `.prettierrc.json`, bỏ qua `public/`, `database/`) |
| `npm run format:check` | Kiểm tra code đã format chưa, không sửa |
| `npm run lang-modes` | Sinh lại `site/lang-modes.json` (kiểu ô của từng khoá giao diện). Chạy khi site **đang chạy**, mỗi lần thêm hoặc đổi bánh răng ở site |
| `npm run db:generate` | Sinh lại Prisma Client sau khi sửa `prisma/schema.prisma` |
| `npm run db:pull` | Đọc lại cấu trúc DB vào schema, chạy `scripts/prisma-fix.js` (đổi `tinyint(1)` về số, chèn lại quan hệ, sinh `prisma/fields.json`) rồi generate |

## Cấu trúc

| Đường dẫn | Thuộc về |
|---|---|
| `app/(core)/`, `components/`, `lib/`, `hooks/` | Core admin |
| `prisma/` | `schema.prisma` (48 model), `fields.json` (kiểu cột cho lớp ép kiểu trong `lib/db.ts`), `generated/` (không commit) |
| `app/(site)/` | Các route của site (trang, `robots.txt`, `sitemap.xml`, `404.html`) |
| `site/` | View, component, móc admin (`admin.ts`), móc proxy (`proxy.ts`) của ams |
| `public/theme/` | `style.css` + `app.js` jQuery, giữ nguyên từ CK2 |

Phần site, mỗi file một component:

```
app/(site)/
  page.tsx               trang chủ, chỉ ráp các section
  _home/                 hero, cta, categories, industries, partners, banner, reviews, news-block, faq
  [...slug]/page.tsx     resolve slug trong DB rồi chọn view
  lien-he/  search/  contact/  robots.txt/  sitemap.xml/
site/
  components/layout/     header, footer, shell
  components/            adm, hero, links, pager, product-item, news-item
  views/product/         list, detail
  views/news/            list, detail
  views/page/            about, brands, detail, not-found
  lib/queries/           category, node, product, news, paged, rows (truy vấn SQL)
  lib/                   url (link, src, queryString…), text, ctx, i18n, meta, crumb, resolve
```

URL `/abc.html` có thể là danh mục, sản phẩm hay tin tuỳ bản ghi trong bảng `nodes`, nên mọi trang nội dung đi qua một route `[...slug]`. Route này gọi `resolve()` để biết loại rồi render view tương ứng.

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

## Lên server

Xem `DEPLOY.md`: VPS Linux, pm2, nginx, HTTPS, `.env.local`, cập nhật code, sao lưu, lỗi thường gặp.

## Database

File dump nằm ở `database/ams.sql` (MariaDB 10.4, 48 bảng, bảng mã `utf8mb4`). Bản CK2 và bản Next dùng chung DB này.

Import bằng dòng lệnh:

```bash
mysql -uroot -e "CREATE DATABASE ams CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -uroot --default-character-set=utf8mb4 ams < database/ams.sql
```

Hoặc vào phpMyAdmin, tạo DB `ams` rồi Import file trên.

### Prisma

- Không dùng `prisma migrate` / `db push`: DB dùng chung với CK2, cấu trúc lấy từ DB bằng `npm run db:pull`.
- Quan hệ (`node`, `category`, `item`, `filter`, `bill`, `tag`) chỉ khai trong schema, DB không có khoá ngoại. Danh sách ở `scripts/prisma-fix.js`. Không bật `relationMode = "prisma"`: chế độ đó chặn xoá node khi còn bản ghi con.
- `lib/db.ts` bọc client bằng extension giữ cách cũ của mysql2: chuỗi từ form được ép theo kiểu cột (cả `where` lẫn `data`), cột không tồn tại bị bỏ, BigInt trả về number, cột DATE trả chuỗi `YYYY-MM-DD`. Bảng chọn động dùng `table(name)`, danh sách cột `columns(name)`.

Ảnh upload không nằm trong dump, chúng ở `CK2_ROOT/app/webroot/uploads/`.

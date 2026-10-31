# Đưa ams-next lên server

Hướng dẫn chạy ams-next trên VPS Linux (Ubuntu 22.04/24.04) bằng Node.js + pm2, có nginx đứng trước.
Cách chạy dev ở máy local xem `README.md`.

## 1. Tổng quan

| Thành phần | Ở đâu trên server |
|---|---|
| Code Next.js | `/var/www/ams-next` (clone từ GitHub) |
| Database | MySQL/MariaDB, DB `ams`, import từ `database/ams.sql` |
| Ảnh upload | `/var/www/ams-data/app/webroot/uploads/` (chép từ bản CK2) |
| Tiến trình | pm2 chạy `next start -p 3200` |
| Cổng ngoài | nginx 80/443 chuyển tiếp về `127.0.0.1:3200` |

Yêu cầu tối thiểu:

- Node.js **20.9 trở lên** (Next 16 yêu cầu). Nên dùng Node 22 LTS.
- RAM 2 GB. `npm run build` ngốn khoảng 1–1,5 GB, máy 1 GB thì phải thêm swap (mục 9).
- MySQL 8 hoặc MariaDB 10.4 trở lên.
- Tên miền đã trỏ A record về IP server. **Phải có HTTPS** thì mới đăng nhập được admin (mục 7).

## 2. Cài phần mềm nền (làm một lần)

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install git nginx mariadb-server certbot python3-certbot-nginx

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm i -g pm2

node -v
```

`node -v` phải in từ v20.9 trở lên.

## 3. Database

Tạo DB và user riêng, không dùng root:

```bash
sudo mysql
```

```sql
CREATE DATABASE ams CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ams'@'localhost' IDENTIFIED BY '<mật khẩu mạnh>';
GRANT ALL PRIVILEGES ON ams.* TO 'ams'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import dữ liệu. File `database/ams.sql` có sẵn trong repo, nhưng nếu ở máy local đã sửa dữ liệu sau ngày dump thì export lại bản mới rồi mang lên:

```bash
mysql -uams -p --default-character-set=utf8mb4 ams < /var/www/ams-next/database/ams.sql
```

Export lại từ máy local (XAMPP, Git Bash):

```bash
/c/xampp/mysql/bin/mysqldump -uroot --default-character-set=utf8mb4 --routines ams > ams.sql
```

Không chạy `prisma migrate` hay `prisma db push` trên server. Cấu trúc DB do bản dump quyết định, Prisma chỉ đọc theo.

## 4. Ảnh upload

Ảnh không nằm trong git. Chép nguyên thư mục `app/webroot/uploads/` của bản CK2 (máy local: `C:/xampp/htdocs/ams/app/webroot/uploads/`) lên server, **giữ đúng cấu trúc `app/webroot/uploads`** bên dưới thư mục gốc:

```bash
sudo mkdir -p /var/www/ams-data/app/webroot
# từ máy local:
scp -r C:/xampp/htdocs/ams/app/webroot/uploads <user>@<ip>:/var/www/ams-data/app/webroot/
```

Admin upload ảnh mới thì ghi vào thư mục này, nên user chạy pm2 phải có quyền ghi:

```bash
sudo chown -R $USER:$USER /var/www/ams-data
```

## 5. Lấy code và cài

```bash
sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www
git clone https://github.com/vuchithanh10102002/AMS-nextjs.git /var/www/ams-next
cd /var/www/ams-next
npm ci
```

`npm ci` tự chạy `postinstall`, gồm chép TinyMCE vào `public/tinymce` và sinh Prisma Client vào `prisma/generated/`.
Hai thư mục này không có trong git nên không được bỏ bước này.

## 6. File `.env.local`

`.env*` bị `.gitignore` chặn nên repo **không có** `.env.example`. Hãy tự tạo `/var/www/ams-next/.env.local`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=ams
DB_PASS=<mật khẩu DB ở mục 3>
DB_NAME=ams
SESSION_SECRET=<chuỗi mới, xem lệnh dưới>
SITE_URL=https://<tên miền>/
CK2_ROOT=/var/www/ams-data
```

Sinh `SESSION_SECRET` (đừng dùng lại chuỗi của máy dev):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

| Biến | Lưu ý |
|---|---|
| `DB_*` | Dùng cho cả app lẫn lệnh `prisma` (`prisma.config.ts` đọc file này) |
| `SESSION_SECRET` | Ngắn hơn 32 ký tự thì app báo lỗi. Đổi chuỗi này là mọi phiên admin bị đăng xuất |
| `SITE_URL` | Đúng tên miền thật, có `https://` và dấu `/` cuối. Dùng cho canonical, sitemap, link tuyệt đối. Chạy trong thư mục con thì ghi cả đường dẫn, ví dụ `https://abc.vn/ams/` |
| `CK2_ROOT` | Thư mục **chứa** `app/webroot/uploads/`, không phải chính thư mục `uploads` |

Sửa `SITE_URL` xong phải build lại (mục 8), vì một số trang được dựng lúc build. Meta robots `noindex,nofollow` cố định ở `site/lib/meta.ts`, khi chạy tên miền thật muốn cho index thì sửa ở đó rồi build lại.

## 7. Build và chạy bằng pm2

Lúc build, Next đọc DB để dựng trang, nên DB phải kết nối được trước khi build:

```bash
cd /var/www/ams-next
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

`pm2 startup` in ra một lệnh `sudo env PATH=...`. Chép lệnh đó chạy lại một lần để pm2 tự bật khi máy khởi động lại.

`ecosystem.config.js` chạy app tên `ams-next` ở cổng 3200, tự khởi động lại khi app dùng quá 800 MB RAM.

Kiểm tra nhanh trên server:

```bash
pm2 status
curl -sI http://127.0.0.1:3200/ | head -1
```

Lệnh `curl` phải trả `HTTP/1.1 200 OK`.

**Cookie admin chỉ gửi qua HTTPS.** Khi `NODE_ENV=production`, cookie đăng nhập có cờ `secure`, nên mở admin bằng `http://` thì đăng nhập "thành công" xong vẫn bị đá ra trang login. Làm xong mục 8 (certbot) rồi mới đăng nhập.

## 8. nginx + HTTPS

Tạo `/etc/nginx/sites-available/ams-next`:

```nginx
server {
  listen 80;
  server_name <tên miền> www.<tên miền>;
  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:3200;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

`client_max_body_size 20m` khớp giới hạn upload của server action (`next.config.ts`). Thiếu dòng này thì upload ảnh lớn hơn 1 MB bị nginx trả 413.

```bash
sudo ln -s /etc/nginx/sites-available/ams-next /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d <tên miền> -d www.<tên miền>
```

certbot tự thêm khối 443 và chuyển hướng từ http sang https, đồng thời tự gia hạn chứng chỉ.

Mở tường lửa nếu có bật ufw:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
```

Không mở cổng 3200 ra ngoài.

## 9. Máy RAM 1 GB: thêm swap trước khi build

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 10. Kiểm tra sau khi lên

- [ ] `https://<tên miền>/` và `https://<tên miền>/en` hiện đủ, ảnh không vỡ
- [ ] Mở vài trang danh mục, sản phẩm, tin, `/lien-he`, `/san-pham`
- [ ] URL rác như `/abc-xyz.html` chuyển sang `/404.html`
- [ ] `https://<tên miền>/sitemap.xml` có link đúng tên miền thật (sai thì `SITE_URL` sai)
- [ ] `https://<tên miền>/robots.txt` có nội dung
- [ ] Xem nguồn trang: meta robots `noindex, nofollow`
- [ ] `/admin`: đăng nhập, sửa thử 1 khoá ngôn ngữ, upload 1 ảnh (kiểm tra quyền ghi `CK2_ROOT`)
- [ ] Gửi form liên hệ / báo giá, kiểm tra bản ghi trong admin
- [ ] `pm2 logs ams-next --lines 50` không có lỗi

## 11. Cập nhật code

```bash
cd /var/www/ams-next
git pull
npm ci
npm run build
pm2 reload ams-next
```

`pm2 reload` khởi động lại app mà không làm rớt kết nối. Build lỗi thì app cũ vẫn chạy, chỉ cần sửa rồi build lại.

Sửa `prisma/schema.prisma` thì `npm ci` (qua `postinstall`) đã tự chạy `prisma generate`. Chỉ khi cấu trúc DB thay đổi mới cần `npm run db:pull` ở máy local, commit lại schema rồi mới pull lên server.

## 12. Sao lưu

DB, chạy mỗi ngày bằng cron (`crontab -e`):

```cron
0 2 * * * mysqldump -uams -p'<mật khẩu>' --default-character-set=utf8mb4 ams | gzip > /var/backups/ams-$(date +\%F).sql.gz
```

Ảnh: sao lưu thư mục `/var/www/ams-data/app/webroot/uploads/` định kỳ (rsync về máy khác hoặc nén tải về).

## 13. Lỗi thường gặp

| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| `npm run build` lỗi kết nối DB | Kiểm tra `DB_*` trong `.env.local`, chạy thử `mysql -uams -p ams` |
| Build bị kill giữa chừng, `Killed` / `JavaScript heap out of memory` | Thiếu RAM, thêm swap (mục 9) |
| Đăng nhập admin xong vẫn quay về trang login | Đang dùng `http://`, phải dùng HTTPS (mục 7) |
| `Thiếu CK2_ROOT trong .env` hoặc ảnh 404 | `CK2_ROOT` sai, hoặc thiếu tầng `app/webroot/uploads` bên dưới |
| Upload ảnh lỗi 413 | Thiếu `client_max_body_size 20m` trong nginx |
| Upload ảnh lỗi `EACCES` | User chạy pm2 không có quyền ghi `/var/www/ams-data` (mục 4) |
| Trình soạn thảo trong admin trắng | Thiếu `public/tinymce`, chạy lại `npm ci` |
| `Cannot find module '.../prisma/generated'` | Chưa generate, chạy `npm run db:generate` rồi build lại |
| 502 Bad Gateway | App không chạy, xem `pm2 status` và `pm2 logs ams-next` |
| Sitemap/canonical vẫn ra `localhost` | `SITE_URL` sai hoặc chưa build lại sau khi sửa |
| Chữ tiếng Việt lỗi font sau import | Import thiếu `--default-character-set=utf8mb4` |

Lệnh pm2 hay dùng: `pm2 status`, `pm2 logs ams-next`, `pm2 restart ams-next`, `pm2 monit`.

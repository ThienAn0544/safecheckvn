# Hướng dẫn chạy cơ sở dữ liệu SafeCheck

## 1. Yêu cầu

- MySQL Server 8.0 trở lên.
- MySQL Workbench, phpMyAdmin hoặc chương trình dòng lệnh `mysql`.
- MySQL đang chạy và có tài khoản được phép tạo database/table.

## 2. Tạo database và bảng

### Cách 1: MySQL Workbench

1. Mở MySQL Workbench và kết nối tới MySQL Server.
2. Chọn **File → Open SQL Script**, mở `DB/schema.sql`.
3. Nhấn nút tia sét để chạy toàn bộ script.
4. Mở `DB/seed.sql` và chạy tương tự để thêm dữ liệu mẫu.
5. Refresh mục **Schemas**, kiểm tra database `safecheck_db`.

### Cách 2: Command Prompt hoặc PowerShell

Đứng tại thư mục gốc dự án, mở MySQL client:

```powershell
mysql -u root -p
```

Sau khi đăng nhập vào dấu nhắc `mysql>`, chạy:

```sql
SOURCE DB/schema.sql;
SOURCE DB/seed.sql;
```

Nhập mật khẩu MySQL khi được hỏi. Nếu `mysql` chưa có trong `PATH`, dùng đường dẫn đầy đủ tới `mysql.exe`.

## 3. Cấu hình Back-end

Tạo `backend/.env` từ `backend/.env.example` và sửa:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql
DB_NAME=safecheck_db
DB_CONNECTION_LIMIT=10
```

Không đẩy file `.env` thật lên Git.

## 4. Chạy Back-end

```powershell
cd backend
npm install
npm start
```

Mở `http://localhost:3000/api/health`. Kết quả đúng:

```json
{"success":true,"message":"SafeCheck API đang hoạt động"}
```

## 5. Kiểm tra database

```sql
USE safecheck_db;
SHOW TABLES;
SELECT * FROM categories;
SELECT * FROM warnings;
SELECT id, full_name, email, role, status FROM users;
```

Các bảng: `users`, `categories`, `reports`, `warnings`, `news`. `schema.sql` tạo cấu trúc; `seed.sql` thêm danh mục và cảnh báo mẫu. Tài khoản người dùng được tạo từ trang đăng ký, mật khẩu được lưu dưới dạng bcrypt hash.

## 6. Lỗi thường gặp

- `Access denied`: sai `DB_USER` hoặc `DB_PASSWORD` trong `.env`.
- `Unknown database safecheck_db`: chưa chạy `schema.sql`.
- `ECONNREFUSED`: MySQL chưa chạy hoặc sai `DB_HOST`/`DB_PORT`.
- Thay đổi `.env` nhưng chưa có tác dụng: dừng và chạy lại `npm start`.

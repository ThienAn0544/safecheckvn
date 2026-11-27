# Hướng dẫn chạy phần Thành viên 3 – Cảnh báo SafeCheck

Phần Thành viên 3 gồm trang danh sách cảnh báo, bộ lọc, phân trang, trang chi tiết và API đọc dữ liệu từ MySQL. Chức năng không dùng dữ liệu mẫu hard-code để thay thế database.

## 1. Chuẩn bị database

1. Mở MySQL Workbench và kết nối MySQL Server.
2. Mở file `DB/schema.sql`, chạy toàn bộ script để tạo database `safecheck_db` và các bảng.
3. Mở file `DB/seed.sql`, chạy một lần để thêm danh mục và hai cảnh báo thử nghiệm.
4. Kiểm tra dữ liệu:

```sql
USE safecheck_db;
SELECT id, name, slug FROM categories;
SELECT id, title, risk_level, status, created_at FROM warnings;
```

Lưu ý: `seed.sql` là dữ liệu mẫu ban đầu, chỉ chạy một lần trên database mới. Khi thêm cảnh báo khác, bản ghi cần có `status = 'published'` mới xuất hiện công khai.

## 2. Cấu hình và chạy back-end

Mở PowerShell tại thư mục project:

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Điền thông tin MySQL trong `backend/.env`, ví dụ:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=safecheck_db
DB_CONNECTION_LIMIT=10
JWT_SECRET=thay_bang_chuoi_bi_mat_dai_va_ngau_nhien
JWT_EXPIRES_IN=7d
```

Sau đó cài thư viện và chạy server:

```powershell
npm install
npm start
```

Mở `http://localhost:3000/api/health`. Kết quả cần có:

```json
{
  "success": true,
  "message": "SafeCheck API đang hoạt động",
  "database": "connected"
}
```

Nếu `database` là `disconnected`, kiểm tra MySQL đã bật chưa, tên database, tài khoản và mật khẩu trong `.env`.

## 3. Mở giao diện Thành viên 3

Khi back-end đang chạy, mở:

`http://localhost:3000/member3-warning/warning-list.html`

Trang chi tiết được mở từ nút **Xem chi tiết** trên từng thẻ cảnh báo. Không mở trang bằng `file://`; hãy truy cập qua server Node.js để frontend gọi API cùng origin.

## 4. Các chức năng đã hoàn thiện

- Tải danh mục trực tiếp từ bảng `categories`.
- Tìm kiếm trong tiêu đề, mô tả ngắn, nội dung và tên danh mục.
- Lọc theo danh mục, mức độ rủi ro và khoảng thời gian đăng.
- Phân trang ở back-end; mặc định 9 cảnh báo/trang, tối đa 24.
- Trang chi tiết đọc theo ID và chỉ cho xem cảnh báo đã công bố.
- Trạng thái đang tải, không có dữ liệu, lỗi API và nút thử tải lại.
- Responsive cho màn hình máy tính, máy tính bảng và điện thoại.

## 5. API được sử dụng

| Method | URL | Mục đích |
|---|---|---|
| GET | `/api/warnings/categories` | Danh mục lọc |
| GET | `/api/warnings` | Danh sách, tìm kiếm, lọc, phân trang |
| GET | `/api/warnings/:id` | Chi tiết cảnh báo |
| GET | `/api/health` | Kiểm tra server và kết nối MySQL |

Ví dụ lọc cảnh báo rủi ro cao trong 30 ngày gần đây:

```text
http://localhost:3000/api/warnings?risk_level=high&days=30&page=1&limit=9
```

## 6. File thuộc phần Thành viên 3

```text
member3-warning/
├── warning-list.html
├── warning-detail.html
└── css/
    └── warning.css

backend/
├── controllers/warning.controller.js
├── routes/warning.routes.js
└── public/js/member3/
    ├── filter.js
    ├── warning-list.js
    └── warning-detail.js
```

`backend/config/database.js` dùng chung cho project để tạo MySQL connection pool. Front-end chỉ gọi API; câu lệnh SQL nằm ở controller, không đặt trong trình duyệt.

# SafeCheck Back-end

Back-end sử dụng Node.js, Express và MySQL. API cảnh báo của thành viên 3 đọc dữ liệu từ hai bảng `warnings` và `categories` trong database `safecheck_db`.

## Khởi chạy

```powershell
cd backend
npm install
```

Tạo file `.env` từ `.env.example`, sau đó điền thông tin MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql
DB_NAME=safecheck_db
DB_CONNECTION_LIMIT=10
JWT_SECRET=thay_bang_chuoi_bi_mat_dai_va_ngau_nhien
JWT_EXPIRES_IN=7d
```

Chạy server:

```powershell
npm start
```

Mở `http://localhost:3000/api/health` để kiểm tra server. Mở website tại `http://localhost:3000/` để frontend gọi API cùng origin.

## API cảnh báo - Thành viên 3

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/warnings/categories` | Lấy danh mục từ bảng `categories` |
| GET | `/api/warnings` | Lấy danh sách cảnh báo đã công bố |
| GET | `/api/warnings/:id` | Lấy chi tiết một cảnh báo đã công bố |

### Bộ lọc và phân trang

`GET /api/warnings` hỗ trợ các query parameter:

| Tham số | Ví dụ | Ý nghĩa |
|---|---|---|
| `q` | `ngân hàng` | Tìm trong tiêu đề, tóm tắt, nội dung và tên danh mục |
| `category_id` | `1` | Lọc theo mã danh mục |
| `risk_level` | `high` | `low`, `medium`, `high` hoặc `critical` |
| `days` | `30` | Chỉ lấy cảnh báo trong 7, 30, 90 hoặc 365 ngày gần đây |
| `page` | `2` | Trang cần lấy, mặc định là 1 |
| `limit` | `9` | Số dòng mỗi trang, mặc định 9 và tối đa 24 |

Ví dụ:

```text
GET /api/warnings?q=ngân%20hàng&risk_level=high&page=1&limit=9
```

Danh sách trả về `data` và `pagination` (`page`, `limit`, `total`, `totalPages`). Chi tiết chỉ trả về cảnh báo có `status = 'published'`; bản nháp và cảnh báo đã lưu trữ không hiển thị công khai.

Các truy vấn SQL sử dụng placeholder `?` cho dữ liệu đầu vào. Back-end không nhận nội dung SQL từ trình duyệt và frontend không kết nối MySQL trực tiếp.

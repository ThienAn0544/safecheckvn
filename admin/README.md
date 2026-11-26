# Báo cáo đồ án SafeCheck VN — Thành viên 6

## Phần đầu

- Đề tài — SafeCheck VN, website tra cứu và báo cáo dấu hiệu lừa đảo.
- Nhóm — [Điền số nhóm].
- Thành viên 6 — [Điền họ tên và MSSV].
- Phân công — Quản trị và kiểm duyệt báo cáo, quản lý trạng thái tài khoản, tích hợp đường dẫn giữa các chức năng và giao diện quản trị responsive.

### Mục lục

1. [Giới thiệu đề tài](#chuong-1)
2. [Phân tích và thiết kế hệ thống](#chuong-2)
3. [Xây dựng Front-end](#chuong-3)
4. [Xây dựng Back-end](#chuong-4)
5. [Cơ sở dữ liệu và bảo mật](#chuong-5)
6. [Triển khai và sử dụng website](#chuong-6)
7. [Đánh giá bằng Lighthouse](#chuong-7)
8. [Kết luận và hướng phát triển](#chuong-8)

### Danh mục hình dự kiến

- Hình 3.1 — Dashboard và hàng đợi báo cáo.
- Hình 3.2 — Nhập lý do kiểm duyệt và xem kết quả.
- Hình 3.3 — Khóa và mở khóa tài khoản.
- Hình 3.4 — Dashboard trên màn hình nhỏ và chế độ tối.
- Hình 5.1–5.3 — Tài khoản admin, quyết định kiểm duyệt và trạng thái người dùng trong MySQL.
- Hình 7.1–7.2 — Báo cáo Lighthouse trước và sau tối ưu, khi có dữ liệu đo.

<a id="chuong-1"></a>
## Chương 1. Giới thiệu đề tài

SafeCheck VN cung cấp thông tin cảnh báo và tiếp nhận báo cáo cộng đồng về dấu hiệu lừa đảo. Phần thành viên 6 xây dựng công cụ nội bộ để quản trị viên xem hàng đợi, duyệt hoặc từ chối báo cáo có lý do, và kiểm soát trạng thái hoạt động của tài khoản.

Người dùng thông thường dùng các chức năng công khai và tài khoản cá nhân. Vai trò `admin` được cấp trong database và mới có quyền sử dụng API quản trị. Schema có khai báo thêm role `moderator`, còn quyền truy cập dashboard hiện dành cho `admin`.

<a id="chuong-2"></a>
## Chương 2. Phân tích và thiết kế hệ thống

### 2.1. Yêu cầu và ca sử dụng

| Tác nhân | Ca sử dụng | Điều kiện |
| --- | --- | --- |
| Quản trị viên | Xem thống kê, báo cáo và tài khoản | Phiên hợp lệ, role `admin`, trạng thái `active` |
| Quản trị viên | Duyệt hoặc từ chối báo cáo | Báo cáo đang `pending`, lý do dài 1–500 ký tự |
| Quản trị viên | Khóa hoặc mở khóa tài khoản | Tài khoản mục tiêu có role khác `admin` |
| Khách hoặc thành viên thường | Truy cập API quản trị | API từ chối theo trạng thái xác thực và quyền |

Yêu cầu phi chức năng gồm kiểm tra quyền ở máy chủ, cập nhật trạng thái và lưu lý do nhất quán, nội dung hiển thị được trên màn hình hẹp và dùng chung tùy chọn giao diện tối.

### 2.2. Kiến trúc và thiết kế giao diện

```text
Trang đăng nhập → JWT → Dashboard HTML/CSS/JS
                             ↓ HTTP /api/admin
                     Express → Middleware xác thực
                             ↓ mysql2
                     MySQL: users, reports, report_decisions
```

Dashboard gồm header điều hướng, số liệu tổng hợp, danh sách báo cáo và danh sách tài khoản. Báo cáo chờ xử lý xuất hiện trước. Hàng đợi đặt ô nhập lý do cạnh các nút duyệt và từ chối. Tài khoản có trạng thái và nút thao tác tương ứng.

### 2.3. Quan hệ dữ liệu

Một báo cáo có tối đa một bản ghi quyết định trong `report_decisions`. Một tài khoản quản trị có thể được ghi nhận là người xử lý nhiều báo cáo. Xem mô tả bảng ở Chương 5.

<a id="chuong-3"></a>
## Chương 3. Xây dựng Front-end

### 3.1. Công nghệ và cấu trúc

| File | Vai trò |
| --- | --- |
| [admin.html](admin.html) | Cấu trúc dashboard, điều hướng và vùng thông báo |
| [dashboard.js](js/dashboard.js) | Gọi API bằng Bearer JWT, dựng danh sách và gửi thao tác |
| [dashboard.css](css/dashboard.css) | Lưới thẻ responsive, vùng nhập lý do và nút thao tác |
| [login.js](../backend/public/js/account/login.js) | Chuyển admin đến dashboard khi đăng nhập thành công |
| [dark-mode.js](../assets/js/dark-mode.js) | Lưu và áp dụng tùy chọn giao diện tối |

Dashboard dùng HTML, CSS và JavaScript thuần. Lưới tự đổi số cột theo diện tích khả dụng, các nút có thể xuống dòng và nội dung dài được ngắt dòng trong thẻ. Tùy chọn dark mode dùng chung khóa `safecheck-theme`. Các trang được tổ chức theo chức năng trong `account/`, `admin/`, `news/`, `report/` và `warning/`.

### 3.2. Minh chứng giao diện

- **Hình 3.1:** [Bổ sung ảnh dashboard sau khi đăng nhập admin.]
- **Hình 3.2:** [Bổ sung ảnh nhập lý do và kết quả duyệt hoặc từ chối.]
- **Hình 3.3:** [Bổ sung ảnh danh sách tài khoản và thao tác khóa/mở khóa.]
- **Hình 3.4:** [Bổ sung ảnh dashboard ở viewport nhỏ và chế độ tối.]

<a id="chuong-4"></a>
## Chương 4. Xây dựng Back-end

Máy chủ dùng Node.js, Express, JWT và `mysql2`. [Router quản trị](../backend/routes/admin.routes.js) được đăng ký tại `/api/admin`. [Middleware xác thực](../backend/middleware/require-auth.js) kiểm tra token và trạng thái hiện tại trong database. Router kiểm tra role từ cả token và database.

| HTTP | Endpoint | Nghiệp vụ |
| --- | --- | --- |
| GET | `/api/admin` | Đọc thống kê, tối đa 100 báo cáo và 100 tài khoản |
| PATCH | `/api/admin/reports/:id` | Chuyển báo cáo từ `pending` sang `verified` hoặc `rejected`, lưu lý do và người xử lý |
| PATCH | `/api/admin/users/:id` | Đổi trạng thái tài khoản giữa `active` và `locked` |

Quyết định báo cáo được lưu trong cùng transaction với cập nhật trạng thái. Nếu báo cáo đã được xử lý, API trả `409`. Khách chưa xác thực nhận `401`, người dùng thiếu quyền nhận `403`. Khi tài khoản bị khóa, middleware chặn yêu cầu xác thực tiếp theo dù token còn hạn.

### 4.1. Đối chiếu minh chứng

| Chức năng | Front-end | Back-end | MySQL |
| --- | --- | --- | --- |
| Đăng nhập admin | Hình 3.1 | Luồng login và middleware xác thực | Hình 5.1 |
| Duyệt hoặc từ chối | Hình 3.2 | Route cập nhật báo cáo và transaction | Hình 5.2 |
| Khóa hoặc mở khóa | Hình 3.3 | Route cập nhật trạng thái tài khoản | Hình 5.3 |

Kiểm tra trước đó xác nhận HTML quản trị tải được và API trả `401` cho khách, `403` cho tài khoản thường. Các thao tác thành công với một tài khoản admin thật cần được ghi lại khi demo.

<a id="chuong-5"></a>
## Chương 5. Cơ sở dữ liệu và bảo mật

| Bảng | Trường dùng trong quản trị |
| --- | --- |
| `users` | `id`, `full_name`, `email`, `role`, `status` |
| `reports` | `id`, `scam_type`, `suspect_value`, `description`, `status` |
| `report_decisions` | `report_id` (khóa chính và khóa ngoại), `reviewer_id` (khóa ngoại), `reason`, `created_at` |

API xác thực ID, tập giá trị trạng thái và độ dài lý do. Dữ liệu đầu vào truyền qua tham số `?` của `mysql2.execute()` để tách giá trị khỏi cú pháp SQL. Ví dụ trong route cập nhật báo cáo:

```js
await connection.execute(
  "UPDATE reports SET status = ? WHERE id = ? AND status = 'pending'",
  [status, req.params.id]
);
```

### 5.1. Truy vấn chuẩn bị minh chứng DB

```sql
USE safecheck_db;

SELECT id, full_name, role, status FROM users WHERE role = 'admin';

SELECT r.id, r.status, d.reason, d.reviewer_id
FROM reports AS r
JOIN report_decisions AS d ON d.report_id = r.id
ORDER BY d.created_at DESC;

SELECT id, full_name, role, status FROM users WHERE role <> 'admin';
```

- **Hình 5.1:** [Chèn ảnh tài khoản có role admin và trạng thái active.]
- **Hình 5.2:** [Chèn ảnh kết quả truy vấn báo cáo đã duyệt hoặc từ chối và lý do.]
- **Hình 5.3:** [Chèn ảnh trạng thái tài khoản trước và sau khi khóa/mở khóa.]

<a id="chuong-6"></a>
## Chương 6. Triển khai và sử dụng website

1. Chuẩn bị Node.js, npm và MySQL. Chạy [schema.sql](../DB/schema.sql) theo [hướng dẫn DB](../DB/README.md).
2. Từ thư mục `backend/`, tạo `.env` theo `.env.example`, cấu hình DB và `JWT_SECRET`, rồi chạy `npm install` và `npm start`.
3. Mở `http://localhost:3000/account/register.html` để đăng ký tài khoản demo. Cấp quyền từ MySQL bằng email đã đăng ký.

   ```sql
   UPDATE safecheck_db.users
   SET role = 'admin'
   WHERE email = 'email-demo@example.com' AND status = 'active';
   ```

4. Đăng nhập lại qua `/account/login.html`, mở dashboard tại `/admin/admin.html` và thử duyệt hoặc từ chối một báo cáo đang `pending` trong MySQL.
5. Thử khóa và mở khóa tài khoản thường, kiểm tra kết quả qua câu truy vấn ở Chương 5. Thử lại API với tài khoản thường để minh chứng phân quyền.

<a id="chuong-7"></a>
## Chương 7. Đánh giá website bằng Lighthouse

Trang dự kiến đo là `/admin/admin.html` sau khi đăng nhập bằng tài khoản demo. Đo trước và sau trên cùng cấu hình thiết bị, trình duyệt và điều kiện mạng.

| Tiêu chí | Trước tối ưu | Sau tối ưu |
| --- | --- | --- |
| Performance | Chưa đo | Chưa đo |
| Accessibility | Chưa đo | Chưa đo |
| Best Practices | Chưa đo | Chưa đo |
| SEO | Chưa đo | Chưa đo |

- **Hình 7.1–7.2:** [Bổ sung ảnh kết quả trước và sau.]
- **Phân tích:** [Sau khi đo, ghi các vấn đề thực tế Lighthouse phát hiện, file đã chỉnh và thay đổi điểm.]

<a id="chuong-8"></a>
## Chương 8. Kết luận và hướng phát triển

Thành viên 6 đã triển khai dashboard, kiểm tra quyền admin ở máy chủ, tích hợp thao tác kiểm duyệt và quản lý trạng thái tài khoản, cùng giao diện responsive và dark mode cho dashboard. README ghi nhận phạm vi đóng góp của thành viên 6.

Các phần còn lại gồm kiểm thử trình duyệt trên toàn site, đo Lighthouse, phân trang cho danh sách lớn và hoàn thiện luồng gửi báo cáo công khai. Trang gửi báo cáo hiện lưu dữ liệu vào `localStorage`, còn dashboard đọc báo cáo trong MySQL. Vì vậy demo hàng đợi cần bản ghi `pending` trong DB.

## Phần cuối

- Tài liệu dự án — [README chính](../README.md), [hướng dẫn backend](../backend/README.md), [hướng dẫn DB](../DB/README.md).
- Phụ lục mã nguồn — [Router admin](../backend/routes/admin.routes.js), [middleware xác thực](../backend/middleware/require-auth.js), [schema](../DB/schema.sql), [seed](../DB/seed.sql).
- Phụ lục hình ảnh — Các vị trí minh chứng ở Chương 3, 5 và 7.

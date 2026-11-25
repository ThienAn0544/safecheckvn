USE safecheck_db;

INSERT INTO categories(name,slug) VALUES
('Giả mạo','gia-mao'),
('Đầu tư','dau-tu'),
('Mua bán trực tuyến','mua-ban-truc-tuyen')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (full_name, email, phone, bio, points, password_hash, role, status) VALUES
('Nguyễn Văn An', 'nguyenvana@gmail.com', '0901234567', 'Thành viên tích cực phòng chống lừa đảo mạng.', 120, '$2b$12$examplehashforseeduseraccount12345678901234567890', 'user', 'active'),
('Trần Thị Bình', 'tranthibinh@gmail.com', '0912345678', 'Theo dõi các thủ đoạn giả mạo ngân hàng và giao hàng.', 45, '$2b$12$examplehashforseeduseraccount12345678901234567890', 'user', 'active')
ON DUPLICATE KEY UPDATE
  phone = VALUES(phone),
  bio = VALUES(bio),
  points = VALUES(points);

INSERT INTO reports (user_id, reporter_name, reporter_email, scam_type, suspect_value, description, status)
SELECT id, full_name, email, 'Giả mạo ngân hàng', '0123456789 - VCB', 'Gọi điện giả danh nhân viên ngân hàng yêu cầu cung cấp mã OTP để hủy giao dịch.', 'verified'
FROM users WHERE email = 'nguyenvana@gmail.com' LIMIT 1;

INSERT INTO reports (user_id, reporter_name, reporter_email, scam_type, suspect_value, description, status)
SELECT id, full_name, email, 'Mua bán trực tuyến', '0987654321', 'Giả danh shipper yêu cầu chuyển khoản phí giao hàng vào tài khoản lạ.', 'pending'
FROM users WHERE email = 'nguyenvana@gmail.com' LIMIT 1;

INSERT INTO watchlist (user_id, suspect_value, note, risk_level)
SELECT id, '0123456789 - VCB', 'Giả danh nhân viên hoàn tiền đơn hàng', 'high'
FROM users WHERE email = 'nguyenvana@gmail.com'
ON DUPLICATE KEY UPDATE note = VALUES(note), risk_level = VALUES(risk_level);

INSERT INTO watchlist (user_id, suspect_value, note, risk_level)
SELECT id, '0987654321', 'Số điện thoại mạo danh tổng đài', 'medium'
FROM users WHERE email = 'nguyenvana@gmail.com'
ON DUPLICATE KEY UPDATE note = VALUES(note), risk_level = VALUES(risk_level);

INSERT INTO warnings(category_id,title,summary,content,risk_level,status) VALUES
(1,'Giả mạo nhân viên ngân hàng yêu cầu OTP','Đối tượng gọi điện thông báo giao dịch bất thường và yêu cầu mã OTP.','Ngân hàng không yêu cầu khách hàng đọc OTP qua điện thoại. Hãy ngắt cuộc gọi và liên hệ tổng đài chính thức.','high','published'),
(2,'Website đầu tư cam kết lợi nhuận cao','Website không rõ pháp nhân mời nạp tiền và cam kết lợi nhuận mỗi ngày.','Không chuyển tiền khi chưa xác minh giấy phép, pháp nhân và cơ chế rút tiền.','critical','published');

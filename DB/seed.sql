USE safecheck_db;
INSERT INTO categories(name,slug) VALUES ('Giả mạo','gia-mao'),('Đầu tư','dau-tu'),('Mua bán trực tuyến','mua-ban-truc-tuyen');
INSERT INTO warnings(category_id,title,summary,content,risk_level,status) VALUES
(1,'Giả mạo nhân viên ngân hàng yêu cầu OTP','Đối tượng gọi điện thông báo giao dịch bất thường và yêu cầu mã OTP.','Ngân hàng không yêu cầu khách hàng đọc OTP qua điện thoại. Hãy ngắt cuộc gọi và liên hệ tổng đài chính thức.','high','published'),
(2,'Website đầu tư cam kết lợi nhuận cao','Website không rõ pháp nhân mời nạp tiền và cam kết lợi nhuận mỗi ngày.','Không chuyển tiền khi chưa xác minh giấy phép, pháp nhân và cơ chế rút tiền.','critical','published');

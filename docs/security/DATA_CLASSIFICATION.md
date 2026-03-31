# Data Classification & Retention

## 1. Mức phân loại

1. `PUBLIC`
- Nội dung giới thiệu, bài blog, thông tin phòng công khai.

2. `INTERNAL`
- Tài liệu vận hành nội bộ không chứa dữ liệu cá nhân nhạy cảm.

3. `CONFIDENTIAL`
- Dữ liệu khách hàng cơ bản: họ tên, số điện thoại, lịch lưu trú.

4. `SENSITIVE`
- Dữ liệu nhạy cảm: hộ chiếu/giấy tờ định danh, thông tin thanh toán.

## 2. Ma trận xử lý

- `PUBLIC`: không yêu cầu mã hóa đặc biệt, vẫn bắt buộc integrity.
- `INTERNAL`: chỉ nhân sự nội bộ được truy cập.
- `CONFIDENTIAL`: mã hóa at-rest, log truy cập, RBAC.
- `SENSITIVE`: mã hóa mạnh, truy cập theo need-to-know, ghi log đầy đủ.

## 3. Retention mặc định

- Lead chưa đặt phòng: 180 ngày.
- Booking đã hoàn tất: 24 tháng (hoặc theo yêu cầu pháp lý/hợp đồng thực tế).
- Log truy cập dữ liệu nhạy cảm: 180 ngày trở lên.
- Khi hết hạn: xóa hoặc ẩn danh hóa.

## 4. SLA yêu cầu chủ thể dữ liệu

- Tiếp nhận yêu cầu: trong 24 giờ.
- Hoàn tất xử lý chuẩn: trong 72 giờ (nếu không bị ràng buộc pháp lý khác).

## 5. Việc cần chốt trước go-live

- Bảng mapping field-by-field giữa DB schema và phân loại dữ liệu.
- Cơ chế xóa mềm/xóa cứng cho từng bảng.

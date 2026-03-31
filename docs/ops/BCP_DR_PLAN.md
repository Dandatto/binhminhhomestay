# BCP/DR Plan (Business Continuity & Disaster Recovery)

## 1. Mục tiêu phục hồi

- Booking API: `RTO <= 2 giờ`, `RPO <= 15 phút`
- CRM/Lead: `RTO <= 8 giờ`, `RPO <= 24 giờ`
- Website content: `RTO <= 4 giờ`, `RPO <= 24 giờ`

## 2. Phương án dự phòng

1. Mất dịch vụ cloud chính
- Chuyển hướng landing tạm thời + form fallback.
- Kích hoạt quy trình xác nhận booking thủ công.

2. Mất dữ liệu DB
- Restore từ backup gần nhất.
- So khớp chênh lệch booking qua nhật ký OTA/Email.

3. Mất kết nối API đối tác
- Cache dữ liệu gần nhất theo TTL.
- Hiển thị cảnh báo minh bạch cho khách.

## 3. Kiểm thử định kỳ

- Tabletop test: hàng quý.
- Restore drill: hàng tháng.
- Báo cáo kết quả: lưu trong thư mục `docs/ops/`.

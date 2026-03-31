# Security Baseline (MVP -> Production)

## 1. Mục tiêu

Thiết lập các kiểm soát tối thiểu bắt buộc cho hệ thống đặt phòng và chăm sóc khách hàng của Bình Minh Homestay.

## 2. Kiểm soát bắt buộc (không được bỏ qua)

1. `SEC-01` TLS bắt buộc
- Chỉ cho phép HTTPS; bật HSTS.
- Owner: `TBD`

2. `SEC-02` Secret management
- Không lưu secrets trong code/repo.
- Dùng Secret Manager của nền tảng triển khai.
- Owner: `TBD`

3. `SEC-03` Mã hóa dữ liệu nhạy cảm
- Dữ liệu nhạy cảm (hộ chiếu, thông tin thanh toán) phải mã hóa khi lưu trữ.
- Khóa mã hóa phải tách biệt với dữ liệu.
- Owner: `TBD`

4. `SEC-04` RBAC + MFA
- Tài khoản quản trị bắt buộc MFA.
- Phân quyền tối thiểu theo vai trò.
- Owner: `TBD`

5. `SEC-05` Audit log
- Ghi nhận truy cập dữ liệu nhạy cảm và thay đổi cấu hình.
- Lưu log tối thiểu 180 ngày, không cho sửa trực tiếp.
- Owner: `TBD`

6. `SEC-06` Backup + restore
- Backup tự động hằng ngày.
- Test restore tối thiểu mỗi tháng 1 lần.
- Owner: `TBD`

7. `SEC-07` Bảo vệ ứng dụng web
- Bật WAF/rate-limit cho endpoint công khai.
- Bật kiểm soát CSRF cho form thay đổi trạng thái.
- Owner: `TBD`

8. `SEC-08` Quét bảo mật trong CI
- Dependency scan và baseline gate bắt buộc trước merge/deploy.
- Owner: `TBD`

9. `SEC-09` Chính sách dữ liệu
- Thu thập tối thiểu, retention có thời hạn, xóa đúng hạn.
- Owner: `TBD`

10. `SEC-10` Quy trình sự cố
- Kích hoạt runbook trong `docs/ops/INCIDENT_RESPONSE_RUNBOOK.md`.
- Owner: `TBD`

## 3. Mức hoàn thành

- `NOT_STARTED`: chưa triển khai
- `PARTIAL`: đã triển khai một phần
- `DONE`: đã triển khai + có bằng chứng

## 4. Bằng chứng tối thiểu

- Link cấu hình môi trường
- Ảnh/chứng cứ test restore
- Log kiểm tra CI pass
- Biên bản tabletop incident

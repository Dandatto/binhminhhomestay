# Threat Model (STRIDE)

## 1. Tài sản cần bảo vệ

- Dữ liệu đặt phòng và dữ liệu định danh khách.
- Bằng chứng consent.
- Tính đúng đắn tồn phòng.
- Khả năng vận hành liên tục.

## 2. STRIDE summary

1. Spoofing
- Rủi ro: giả mạo admin/session.
- Giảm thiểu: MFA admin, short session TTL, secure cookies.

2. Tampering
- Rủi ro: sửa dữ liệu booking/consent trái phép.
- Giảm thiểu: RBAC, audit log bất biến, DB role tách biệt.

3. Repudiation
- Rủi ro: phủ nhận hành động đã thực hiện.
- Giảm thiểu: lưu audit events kèm actor/time/request-id.

4. Information disclosure
- Rủi ro: lộ dữ liệu nhạy cảm qua API/log.
- Giảm thiểu: data minimization, redaction logs, encryption at rest + TLS.

5. Denial of service
- Rủi ro: flood API booking.
- Giảm thiểu: WAF, rate-limit, queue backpressure, autoscaling policy.

6. Elevation of privilege
- Rủi ro: user thường thành admin qua lỗi authz.
- Giảm thiểu: policy deny-by-default, kiểm tra quyền ở service layer.

## 3. Abuse cases ưu tiên cao

- Bot đặt phòng hàng loạt gây lock phòng giả.
- Replay request tạo nhiều booking trùng.
- Gọi API đối tác thất bại dây chuyền gây overbooking.

## 4. Controls bắt buộc trước go-live

- Idempotency key cho tạo booking.
- Rate limit theo IP + fingerprint.
- CSRF protection cho form trạng thái.
- Centralized logging + alerting SEV-1.

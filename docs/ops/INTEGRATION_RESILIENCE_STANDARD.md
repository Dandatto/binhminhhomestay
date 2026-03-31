# Integration Resilience Standard

## 1. Áp dụng cho

- API thời tiết
- API cảng/tàu
- Zalo ZNS
- OTA sync (Agoda/Booking)

## 2. Yêu cầu kỹ thuật bắt buộc

1. Timeout rõ ràng cho mọi request.
2. Retry có backoff + jitter cho lỗi tạm thời.
3. Circuit breaker cho API lỗi lặp lại.
4. Idempotency key cho tác vụ tạo booking/gửi thông báo.
5. Dead-letter queue cho sự kiện thất bại.

## 3. Quan sát hệ thống

- Mỗi integration phải có: tỷ lệ lỗi, latency p95, số lần retry.
- Cảnh báo khi lỗi > ngưỡng 5% trong 5 phút.

## 4. Chống overbooking

- Đồng bộ lịch hai chiều theo chu kỳ ngắn.
- Luôn kiểm tra lại tồn phòng ở nguồn trung tâm trước khi confirm cuối.
- Nếu conflict: auto-hold + yêu cầu xác nhận thủ công.

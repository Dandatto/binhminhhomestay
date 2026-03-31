# SLI/SLO/Error Budget

## 1. SLI chính

1. `booking_api_availability`
- Tỷ lệ request `/v1/bookings` trả về non-5xx.

2. `booking_api_latency_p95`
- P95 latency endpoint booking.

3. `ota_sync_success_rate`
- Tỷ lệ job đồng bộ OTA thành công.

4. `incident_mttd` và `incident_mttr`
- Mean time to detect / recover.

## 2. SLO đề xuất

- Booking API availability >= `99.9%` / tháng.
- Booking API latency p95 <= `350ms`.
- OTA sync success >= `99.0%`.
- MTTR sự cố SEV-1 <= `120 phút`.

## 3. Error budget

- Với SLO 99.9%, ngân sách lỗi khoảng 43.2 phút/tháng.
- Khi burn rate > 2x trong 1 giờ: tạm dừng release tính năng, ưu tiên fix độ ổn định.

## 4. Data source

- Dashboard endpoint: `GET /api/internal/ops/metrics` (token-protected).

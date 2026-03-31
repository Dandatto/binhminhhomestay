# Architecture Package

Tài liệu này là nguồn chuẩn cho thiết kế hệ thống trước khi code production.

## Mục tiêu

- Rõ kiến trúc, ranh giới hệ thống, luồng dữ liệu và điểm tin cậy.
- Chuẩn hóa hợp đồng API, mô hình dữ liệu và vận hành.
- Giảm rủi ro pháp lý/bảo mật khi mở tính năng đặt phòng thật.

## Thành phần

- `SYSTEM_ARCHITECTURE.md`: kiến trúc tổng thể + trust boundaries.
- `ADR/`: quyết định kiến trúc chính thức.
- `API/openapi.yaml`: hợp đồng API chuẩn đầu tiên.
- `DATA/postgresql_schema.sql`: schema dữ liệu nền.
- `SECURITY/THREAT_MODEL.md`: STRIDE + biện pháp giảm thiểu.
- `OPS/SLI_SLO_ERROR_BUDGET.md`: chỉ số vận hành và error budget.
- `OPS/DB_MIGRATION_STRATEGY.md`: quy trình quản trị migration schema.
- `../ops/DATA_RETENTION_MAINTENANCE.md`: vận hành cleanup dữ liệu theo retention policy.
- `../ops/OPS_METRICS_DASHBOARD.md`: dashboard metrics vận hành nội bộ.
- `../ops/INTEGRATION_TEST_RUNBOOK.md`: quy trình chạy integration test trước release.
- `../ops/*`: runbook và kế hoạch khôi phục sự cố.
- `../ops/INTEGRATION_RESILIENCE_STANDARD.md`: tiêu chuẩn tích hợp + chống overbooking.
- `../ops/WORKER_SCHEDULING.md`: lịch chạy outbox worker và chính sách retry.

## Quy tắc thay đổi

1. Mọi thay đổi kiến trúc phải cập nhật ADR.
2. Mọi thay đổi API phải cập nhật `openapi.yaml` trước khi code handler.
3. Mọi bảng mới phải khai báo phân loại dữ liệu và retention.

# Data Retention & Maintenance Runbook

## Mục tiêu

Thực thi retention policy nhất quán cho idempotency/outbox data để tránh phình dữ liệu và giữ hiệu năng ổn định.

## Thành phần được cleanup tự động

1. `idempotency_keys`
- Xóa bản ghi `COMPLETED`/`FAILED` quá hạn `IDEMPOTENCY_RETENTION_DAYS`.

2. `outbox_events`
- Xóa bản ghi `DONE` quá hạn `OUTBOX_DONE_RETENTION_DAYS`.
- Xóa bản ghi `FAILED` quá hạn `OUTBOX_FAILED_RETENTION_DAYS`.

## Script vận hành

- File: `apps/web/scripts/maintenance-cleanup.cjs`
- Lệnh: `npm run maintenance:cleanup`

## Lịch đề xuất

- Production: 01:30 hằng ngày (giờ địa phương).
- Staging: chạy hằng ngày hoặc thủ công trước test load.

## Cảnh báo vận hành

1. Cleanup chỉ chạy khi có lock thành công; nếu không, job phải fail nhanh.
2. Không giảm retention đột ngột nếu chưa đánh giá tác động pháp lý.
3. Log kết quả số bản ghi bị xóa để phục vụ audit.

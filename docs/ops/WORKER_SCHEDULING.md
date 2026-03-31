# Worker Scheduling Runbook

## Mục tiêu

Đảm bảo outbox events được xử lý đều đặn, có retry/backoff, và không bị backlog kéo dài.

## Cấu hình bắt buộc

- `WORKER_DISPATCH_TOKEN`: token bảo vệ endpoint dispatch nội bộ.
- `OUTBOX_DISPATCH_URL`: URL dispatch endpoint.
- `OUTBOX_BATCH_SIZE`: số event xử lý mỗi lượt.
- `OUTBOX_MAX_ATTEMPTS`: số lần retry tối đa cho mỗi event.
- `OUTBOX_BASE_DELAY_SECONDS`: base delay cho exponential backoff.

## Lịch đề xuất

- Production: chạy mỗi 1 phút.
- Staging: chạy mỗi 2-5 phút.

## Cơ chế retry

- Khi worker fail: event chuyển về `PENDING` nếu chưa vượt `OUTBOX_MAX_ATTEMPTS`.
- Delay retry: exponential backoff từ `OUTBOX_BASE_DELAY_SECONDS`.
- Khi quá số lần cho phép: event chuyển `FAILED`, cần xử lý thủ công.

## Giám sát

1. Số event `FAILED` > 0 trong 10 phút: cảnh báo.
2. Số event `PENDING` backlog > ngưỡng vận hành: cảnh báo.
3. Tỷ lệ `processed/failed` theo từng chu kỳ dispatch.

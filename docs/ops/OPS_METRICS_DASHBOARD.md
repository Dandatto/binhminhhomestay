# Ops Metrics Dashboard

## Endpoint

- `GET /api/internal/ops/metrics`
- Header bắt buộc: `x-ops-token: <OPS_METRICS_TOKEN>`
- `GET /api/internal/ops/alerts` cho trạng thái cảnh báo theo ngưỡng

## Response mẫu

```json
{
  "status": "ok",
  "adapter": "postgres",
  "metrics": {
    "generatedAt": "2026-03-05T08:00:00.000Z",
    "bookingsTotal": 120,
    "bookingsPending": 8,
    "outboxPending": 4,
    "outboxProcessing": 1,
    "outboxDone": 400,
    "outboxFailed": 2,
    "idempotencyInProgress": 0,
    "idempotencyCompleted": 110,
    "idempotencyFailed": 3
  }
}
```

## Ngưỡng cảnh báo đề xuất

1. `outboxFailed > 0` liên tục quá 10 phút.
2. `outboxPending` tăng liên tục 3 chu kỳ polling.
3. `idempotencyInProgress` cao bất thường kéo dài.
4. `bookingsPending` vượt ngưỡng nghiệp vụ theo ngày cao điểm.

## Cách lấy nhanh bằng CLI

```bash
cd apps/web
OPS_METRICS_TOKEN=... INTEGRATION_BASE_URL=https://your-domain npm run ops:metrics
OPS_METRICS_TOKEN=... INTEGRATION_BASE_URL=https://your-domain npm run ops:alerts
```

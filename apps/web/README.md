# apps/web

Skeleton Next.js 15 cho giai đoạn triển khai đầu tiên.

## Endpoints hiện có

- `GET /api/health`
- `POST /api/booking` (idempotency-aware)
- `POST /api/consent`
- `GET /api/v1/health`
- `POST /api/v1/bookings`
- `POST /api/v1/consents`
- `POST /api/internal/queue/dispatch` (yêu cầu `x-worker-token`)
- `GET /api/internal/ops/metrics` (yêu cầu `x-ops-token`)
- `GET /api/internal/ops/alerts` (yêu cầu `x-ops-token`)

## Lưu ý

- Hỗ trợ 2 adapter lưu trữ: `memory` và `postgres`.
- Nếu dùng postgres cần migrate schema trước khi chạy API.
- Outbox worker có retry backoff và max-attempt theo env.

## Chạy cục bộ

```bash
cd apps/web
npm install
npm run dev
```

Sau khi cài, truy cập `http://localhost:3000`.

## Migration database

```bash
cd apps/web
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/binhminh
npm run db:migrate
```

## Chạy worker dispatch thủ công

```bash
cd apps/web
export WORKER_DISPATCH_TOKEN=change-this-token
export OUTBOX_DISPATCH_URL=http://localhost:3000/api/internal/queue/dispatch
npm run worker:dispatch
```

## Chạy maintenance cleanup

```bash
cd apps/web
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/binhminh
npm run maintenance:cleanup
```

## Lấy metrics vận hành

```bash
cd apps/web
export OPS_METRICS_TOKEN=change-this-token
export INTEGRATION_BASE_URL=http://localhost:3000
npm run ops:metrics
npm run ops:alerts
```

## Integration tests

```bash
cd apps/web
export INTEGRATION_BASE_URL=http://localhost:3000
export WORKER_DISPATCH_TOKEN=change-this-token
npm run test:integration:smoke

# Postgres mode (app must run with STORE_ADAPTER=postgres)
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/binhminh
npm run test:integration:postgres
```

## Gắn cron (mỗi phút)

Ví dụ crontab:

```cron
* * * * * cd /path/to/repo/apps/web && WORKER_DISPATCH_TOKEN=... OUTBOX_DISPATCH_URL=https://your-domain/api/internal/queue/dispatch node scripts/run-outbox-dispatch.cjs >> /var/log/binhminh-worker.log 2>&1
```

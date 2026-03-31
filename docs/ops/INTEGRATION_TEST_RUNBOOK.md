# Integration Test Runbook

## Mục tiêu

Kiểm chứng end-to-end các hành vi quan trọng trước khi phát hành:

1. Idempotency replay/conflict cho booking API.
2. Tính toàn vẹn dữ liệu aggregate (booking + consent + audit + outbox).
3. Outbox dispatch và retry/failover logic.

## Script

- `apps/web/scripts/integration-smoke.cjs`
- `apps/web/scripts/integration-postgres.cjs`

## Điều kiện chạy

- App đang chạy và reachable qua `INTEGRATION_BASE_URL`.
- Worker token hợp lệ (`WORKER_DISPATCH_TOKEN`).
- Với postgres test: `STORE_ADAPTER=postgres`, `DATABASE_URL` hợp lệ và đã migrate.

## Lệnh

```bash
cd apps/web
npm run test:integration:smoke
npm run test:integration:postgres
```

## Chính sách trong CI/CD

- Smoke test: bắt buộc với môi trường staging.
- Postgres integration test: bắt buộc trước release production.
- Workflow tham chiếu: `.github/workflows/integration-gate.yml`.

# Security Changelog

## 2026-03-05

- Thiết lập security/legal/ops baseline.
- Thêm runbook xử lý sự cố và BCP/DR.
- Thêm CI gate kiểm tra hồ sơ kiểm soát bắt buộc.
- Chuẩn hóa bản chiến lược sang định dạng markdown để review.
- Bổ sung package kiến trúc thực thi: ADR, OpenAPI, schema, threat model, SLO.
- Dựng skeleton `apps/web` với security headers và API routes nền (health/booking/consent).
- Bổ sung CI gate kiến trúc `scripts/ci_check_architecture.sh`.
- Triển khai persistence layer có adapter `memory/postgres`.
- Bổ sung idempotency key workflow cho endpoint booking.
- Bổ sung outbox queue + worker dispatch endpoint có token bảo vệ.
- Thêm migration runner có checksum (`apps/web/scripts/db-migrate.cjs`).
- Thêm retry policy cho outbox (exponential backoff + max attempts).
- Thêm migration hardening `0002` (constraint, trigger updated_at, partial index dispatch).
- Thêm maintenance cleanup job theo retention policy.
- Tăng an toàn endpoint worker token bằng `timingSafeEqual`.
- Thêm endpoint metrics nội bộ có token riêng (`/api/internal/ops/metrics`).
- Thêm integration test harness cho idempotency/outbox (smoke + postgres).
- Thêm endpoint cảnh báo ngưỡng (`/api/internal/ops/alerts`) cho giám sát vận hành.
- Thêm workflow CI `integration-gate` chạy Postgres + integration tests + deep health.

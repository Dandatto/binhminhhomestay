# ADR-0005: Internal Operational Metrics Endpoint

## Status
Accepted

## Context
Đội vận hành cần quan sát nhanh backlog/outbox/idempotency mà không phụ thuộc ngay vào stack monitoring bên ngoài.

## Decision
1. Cung cấp endpoint nội bộ `GET /api/internal/ops/metrics`.
2. Bảo vệ bằng token riêng (`OPS_METRICS_TOKEN`) và so sánh timing-safe.
3. Metrics lấy trực tiếp từ store adapter đang chạy (memory/postgres).

## Consequences
- Ưu điểm: có tín hiệu vận hành ngay khi bootstrapping hệ thống.
- Nhược điểm: cần tránh lộ token và cần hạn chế truy cập mạng nội bộ.

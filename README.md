# Binh Minh Homestay 2026 - Secure Build Foundation

Repo này đã được thiết lập baseline để bắt đầu phát triển website theo hướng an toàn, tuân thủ pháp lý dữ liệu cá nhân, và có kiểm soát triển khai.

## Cấu trúc chính

- `docs/strategy-2026.extracted.md`: bản trích xuất text từ DOCX để review bằng diff.
- `docs/security/`: baseline bảo mật và phân loại dữ liệu.
- `docs/legal/`: baseline tuân thủ pháp lý dữ liệu cá nhân (tham chiếu Nghị định 13).
- `docs/ops/`: runbook sự cố, BCP/DR, chuẩn tích hợp đối tác.
- `docs/architecture/`: gói kiến trúc thực thi (ADR, OpenAPI, schema, threat model, SLO).
- `apps/web/`: skeleton ứng dụng Next.js + API routes nền.
- `.github/workflows/security-gate.yml`: CI gate kiểm tra hồ sơ bắt buộc.
- `scripts/ci_check_baseline.sh`: script kiểm tra tự động trước merge/deploy.
- `scripts/ci_check_architecture.sh`: script kiểm tra kiến trúc + runtime skeleton.

## Quy tắc bắt buộc trước khi code production

1. Hoàn tất điền owner cho từng kiểm soát trong tài liệu baseline.
2. Chốt RTO/RPO và kiểm thử khôi phục dữ liệu.
3. Chốt mô hình consent + retention + xử lý yêu cầu chủ thể dữ liệu.
4. Thiết lập secret manager, audit log, và RBAC trước khi mở API public.
5. CI gate phải chạy pass.

## Chạy kiểm tra

```bash
bash scripts/ci_check_baseline.sh
bash scripts/ci_check_architecture.sh
```

## Migration & Worker

```bash
cd apps/web
npm run db:migrate
npm run worker:dispatch
npm run maintenance:cleanup
npm run ops:metrics
npm run ops:alerts
```

## Integration Test Harness

```bash
cd apps/web
npm run test:integration:smoke
npm run test:integration:postgres
```

## Bước tiếp theo cho đội dev

1. Kết nối `apps/web` với PostgreSQL theo schema `docs/architecture/DATA/postgresql_schema.sql`.
2. Triển khai lưu consent/audit thật cho API booking.
3. Bổ sung hàng đợi sự kiện và worker đồng bộ OTA.
4. Thiết lập observability theo `docs/architecture/OPS/SLI_SLO_ERROR_BUDGET.md`.

## Trạng thái hiện tại

- Da co persistence abstraction (`memory/postgres`) trong `apps/web/lib/store`.
- Da co idempotency + outbox flow cho API booking.
- Da co worker dispatch endpoint bao ve bang token noi bo.
- Da co migration runner va cron worker runbook (`docs/ops/WORKER_SCHEDULING.md`).

## Ghi chú

Tài liệu pháp lý trong repo là baseline kỹ thuật để triển khai. Trước khi go-live cần rà soát cuối cùng với tư vấn pháp lý.

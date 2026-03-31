# DB Migration Strategy

## Mục tiêu

- Mọi thay đổi schema phải có phiên bản, kiểm chứng checksum, và khả năng audit.
- Tránh thay đổi trực tiếp schema trên production không qua migration file.

## Quy ước

1. Migration đặt tại `apps/web/db/migrations` theo thứ tự tăng dần: `0001_*.sql`, `0002_*.sql`...
2. Chạy migration bằng `npm run db:migrate` trong `apps/web`.
3. Bảng `schema_migrations` lưu `version`, `checksum`, `applied_at`.
4. Không chỉnh sửa nội dung migration đã áp dụng; tạo migration mới để thay đổi tiếp.

## Quy trình release

1. Deploy app version mới nhưng chưa bật feature flag nhạy cảm.
2. Chạy migration.
3. Chạy smoke test API.
4. Bật feature flag theo từng bước.

## Rollback

- Rollback bằng migration thuận/nghịch có kế hoạch trước.
- Không rollback schema thủ công bằng câu lệnh ad-hoc trên production.

# k6 Load Test Suite — Bình Minh Homestay

## Cài đặt

```bash
# macOS
brew install k6

# Windows
winget install k6

# Tạo thư mục results
mkdir -p docs/k6/results
```

## Thứ tự chạy (QUAN TRỌNG — không đổi)

```
01_baseline       → trước tiên, xác nhận hệ thống ổn định
02_holiday_spike  → tìm điểm gãy dưới tải cao
03_race_condition → kiểm tra double-booking (chạy độc lập)
04_cron_contention→ kiểm tra DB contention cron vs booking
05_bot_attack     → CHỈ SAU KHI IMPLEMENT UPSTASH (F-005)
```

## Lệnh chạy từng kịch bản

```bash
cd apps/web   # hoặc root project

# Scenario 1 — Baseline (12 phút)
BASE_URL=https://your-staging.vercel.app \
  k6 run docs/k6/01_baseline.js

# Scenario 2 — Holiday Spike (25 phút)
BASE_URL=https://your-staging.vercel.app \
  k6 run docs/k6/02_holiday_spike.js

# Scenario 3 — Race Condition (30 giây — chạy nhanh)
BASE_URL=https://your-staging.vercel.app \
  k6 run docs/k6/03_race_condition.js

# Scenario 4 — Cron Contention (10 phút)
BASE_URL=https://your-staging.vercel.app \
ADMIN_TOKEN=<your-worker-dispatch-token> \
  k6 run docs/k6/04_cron_contention.js

# Scenario 5 — Bot Attack (2 phút | CHỈ SAU F-005)
BASE_URL=https://your-staging.vercel.app \
  k6 run docs/k6/05_bot_attack.js
```

## Thresholds pass/fail

| Scenario | Metric | Target |
|---|---|---|
| Baseline | p(95) response | < 800ms |
| Baseline | Error rate | < 1% |
| Holiday Spike | p(95) response | < 1500ms |
| Holiday Spike | Booking success | > 95% |
| Race Condition | Bookings created (202) | ≤ 1 |
| Cron Contention | Outbox errors | < 5 |
| Bot Attack | 429 rate | > 90% |

## Trong khi chạy — monitor thêm

Mở Supabase Dashboard → Table Editor → `outbox_events`:
```sql
-- Xem outbox depth real-time
SELECT status, count(*) FROM outbox_events GROUP BY status;

-- Xem PgBouncer pool usage
SELECT count(*) FROM pg_stat_activity;
```

Mở Vercel Dashboard → Functions → xem invocation rate, errors, duration.

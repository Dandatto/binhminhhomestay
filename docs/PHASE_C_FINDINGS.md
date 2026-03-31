# BÁO CÁO PHASE C — DYNAMIC TESTING PREP
# Bình Minh Homestay · Phân tích tĩnh tiền load test + Kịch bản k6

---

| Thông tin | Nội dung |
|---|---|
| **Tài liệu** | Phase C Findings + Load Test Runbook |
| **Ngày phát hành** | 30/03/2026 |
| **Phân loại** | 🔒 NỘI BỘ — DEV TEAM |
| **Trạng thái** | ⚠️ CÓ 2 CRITICAL MỚI — phải fix trước khi chạy load test |

---

## ⚠️ DỪNG LẠI — 2 CRITICAL PHÁT HIỆN TRONG PHASE C STATIC SCAN

Trước khi chạy bất kỳ kịch bản load test nào, hai vấn đề sau phải được xử lý:

---

### PC-001 · 🔴 CRITICAL · **Next.js 15.2.0 có lỗ hổng bảo mật nghiêm trọng — cần nâng cấp lên 15.5.14**

**Nguồn:** `npm audit` — severity: critical

**Phiên bản hiện tại:** `next@15.2.0`
**Phiên bản vá:** `next@15.5.14` *(minor bump — không breaking)*

**CVE đặc biệt nguy hiểm trong danh sách:**

- **Authorization Bypass in Next.js Middleware** — kẻ tấn công có thể bypass hoàn toàn middleware bảo vệ, bao gồm cả `middleware.ts` của dự án này. Đây là attack vector trực tiếp vào lớp consent và bảo vệ route.
- **Next.js RCE in React flight protocol** — Remote Code Execution trên server
- **Next.js Improper Middleware Redirect Handling → SSRF** — Server-Side Request Forgery
- **Next.js Denial of Service via Image Optimizer** — DoS qua `/api/v1/*` hoặc ảnh bất kỳ
- **Next Server Actions Source Code Exposure**

**Hành động:** `npm install next@15.5.14` → `npm run typecheck` → `npm run build`

---

### PC-002 · 🔴 CRITICAL · **Security Headers được khai báo trong `next.config.ts` nhưng KHÔNG được áp dụng**

**File:** `apps/web/next.config.ts`

Đã xác nhận: mảng `securityHeaders` được khai báo đầy đủ (X-Frame-Options, CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) nhưng **hàm `headers()` KHÔNG được thêm vào `nextConfig`**. Kết quả: toàn bộ 6 security headers này không bao giờ được gửi trong HTTP response.

```typescript
// next.config.ts hiện tại — BUG: securityHeaders được định nghĩa nhưng không dùng
const securityHeaders = [...]; // khai báo đúng
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { ... },
  // ← THIẾU: async headers() { ... }
};
```

**Fix:**
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [...] },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

**Lưu ý CSP cần review thêm:** `script-src 'self' 'unsafe-inline'` — `unsafe-inline` làm giảm hiệu lực CSP đáng kể. Sau go-live cần migrate sang nonce-based CSP. Hiện tại chấp nhận được cho MVP.

---

## PHÁT HIỆN THÊM — PHASE C STATIC ANALYSIS

---

### PC-003 · 🔴 CRITICAL · **Double-booking race condition — không có DB-level availability lock**

**File:** `lib/store/postgres-store.ts` — `createBookingAggregate()`

**Phân tích concurrency:**

`withTransaction()` wrap trong `BEGIN/COMMIT` với isolation level mặc định PostgreSQL là **READ COMMITTED**. Không có `SELECT FOR UPDATE` hay bất kỳ lock nào trước khi INSERT booking.

```sql
-- Kịch bản: Hai request đến cùng lúc cho cùng phòng, cùng ngày
-- T1: BEGIN → INSERT booking (PENDING) → COMMIT   ← thành công
-- T2: BEGIN → INSERT booking (PENDING) → COMMIT   ← cũng thành công!
-- Kết quả: DB có 2 booking cho cùng phòng/ngày — overbooking
```

**Schema không có unique constraint** để ngăn:
```sql
-- Thiếu:
CREATE UNIQUE INDEX idx_no_double_booking
  ON bookings(room_type, check_in_date, check_out_date)
  WHERE status IN ('PENDING_CONFIRMATION', 'CONFIRMED');
```

**Mức độ rủi ro thực tế:** Dưới tải bình thường, rất hiếm xảy ra. Nhưng đây là mục tiêu tấn công cố tình (bot gửi 100 requests/giây cùng phòng, cùng ngày) và sự cố tự nhiên khi TikTok viral → spike đột ngột.

**Hành động:** Đây là phát hiện nghiêm trọng nhưng cần thảo luận về business logic trước khi fix:
- Homestay nhỏ: có thể chấp nhận overbooking + admin manual giải quyết?
- Hay cần hard-block DB-level?

Khuyến nghị tối thiểu: thêm `UNIQUE INDEX` trên bảng bookings + catch `unique_violation` (PostgreSQL error code 23505) trong booking-service để trả về 409.

---

### PC-004 · 🟠 HIGH · **`COMPLETED` trong VALID_STATUSES nhưng không có trong DB CHECK constraint — bug từ F-010**

**File:** `app/api/admin/bookings/route.ts` (sau F-010 fix)

```typescript
// Code (F-010):
const VALID_STATUSES = ["PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED", "COMPLETED"];

// DB Schema:
-- check (status in ('PENDING_CONFIRMATION','CONFIRMED','FAILED','CANCELLED'))
-- ↑ KHÔNG có 'COMPLETED', CÓ 'FAILED'
```

**Hệ quả:**
- Admin bấm "Hoàn tất" (COMPLETED) → F-010 validation pass → DB query → PostgreSQL CHECK constraint violation → HTTP 500 (thay vì 200)
- Admin không thể set booking thành FAILED qua API (FAILED không có trong VALID_STATUSES) — đây có thể là intentional, cần xác nhận với team

**Fix:** Đồng bộ một trong hai:
- **Option A:** Thêm `COMPLETED` vào DB CHECK constraint (migration cần thiết)
- **Option B:** Bỏ `COMPLETED` khỏi VALID_STATUSES nếu homestay không cần status này

---

### PC-005 · 🟠 HIGH · **DB pool thiếu `connectionTimeoutMillis` — có thể hang vô thời hạn dưới tải cao**

**File:** `lib/store/postgres-store.ts` dòng 104–108

```typescript
return new pgModule.Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 10_000
  // THIẾU: connectionTimeoutMillis
});
```

Không có `connectionTimeoutMillis` (mặc định = 0 = không timeout). Khi pool cạn kiệt (cả 10 connection đang bận), request mới sẽ chờ vô thời hạn thay vì fail fast với lỗi rõ ràng. Dưới Tết Surge, điều này dẫn đến request queue tích lũy, serverless function timeout (Vercel mặc định 10s), và cascade failure.

**Fix:**
```typescript
return new pgModule.Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000  // fail fast sau 5s
});
```

---

### PC-006 · 🟡 MEDIUM · **npm audit: `flatted` HIGH — Prototype Pollution + DoS**

**Via:** transitive dependency (likely qua build tooling)

Prototype Pollution trong `flatted.parse()` có thể bị exploit nếu app deserialize JSON từ untrusted source qua flatted. Kiểm tra xem flatted có được dùng trực tiếp trong app code không — nếu chỉ là dev/build dependency thì không ảnh hưởng production.

---

### PC-007 · 🟡 MEDIUM · **`script-src 'unsafe-inline'` trong CSP làm giảm hiệu lực chống XSS**

**File:** `next.config.ts` (sau khi PC-002 được fix và headers được apply)

`'unsafe-inline'` cho phép inline scripts, làm mất tác dụng của CSP trong việc ngăn XSS. Với Framer Motion và các animation library, thường cần nonce-based approach. Chấp nhận được cho MVP nhưng phải lên kế hoạch migration.

---

## PHÂN TÍCH HIỆU NĂNG TĨNH

### Pool Configuration Analysis

```
Vercel Serverless Model:
├── Max concurrent functions = phụ thuộc plan (Pro: ~100)
├── Mỗi function instance: pool max = 10
├── Worst case connections = 100 × 10 = 1,000
└── PgBouncer (Supabase pooler) limit:
    ├── Free tier:  ~60 connections
    ├── Pro tier:  ~200 connections
    └── → pool max = 10 là quá cao cho free tier
        → Khuyến nghị: max = 3 nếu dùng free tier, max = 5 nếu Pro
```

### Caching Analysis (Page-level)

| Page/Route | Kiểu render | Cache | Phù hợp tải cao? |
|---|---|---|---|
| `/` (homepage) | Server Component | Default (ISR?) | ❓ Cần xác nhận |
| `/experience` | Server Component | Default | ❓ |
| `/faq` | Server Component | Default | ❓ |
| `/booking` | Client Component | No cache | ⚠️ DB hit mỗi request |
| `/api/v1/pricing` | Route Handler | `revalidate = 60` | ✅ Cached 60s |
| `/api/v1/weather` | Route Handler | ❓ | Cần kiểm tra |
| `/api/v1/vessels` | Route Handler | ❓ | Cần kiểm tra |
| `/api/booking` | Route Handler | No cache | ✅ Đúng — không cache booking |
| `/api/chat` | Route Handler | No cache | ✅ Đúng |

**Rủi ro:** Nếu trang chủ `/` là SSR thuần (không có `export const revalidate`), mỗi request sẽ hit DB. Dưới Tết Surge với 500 concurrent users, đây là DB bottleneck chính.

---

## KỊCH BẢN LOAD TEST (k6 Runbook)

**Prerequisite trước khi chạy:**
1. PC-001 (Next.js upgrade) đã fix
2. PC-002 (security headers) đã fix
3. Môi trường staging đã deploy (không chạy trên `.env.local` localhost)
4. k6 đã cài: `brew install k6` hoặc `winget install k6`
5. Set biến môi trường: `export BASE_URL=https://your-staging.vercel.app`

**Thứ tự chạy:**
```
Scenario 1 (Baseline)     → 10 phút → ghi kết quả
Scenario 2 (Normal Peak)  → 30 phút → ghi kết quả
Scenario 3 (Holiday)      → 15 phút → ghi kết quả
Scenario 4 (Race Cond.)   → 5 phút  → kiểm tra double booking
Scenario 5 (Cron Contend) → 10 phút → xem queue depth
```

Xem file `scripts/k6/` cho code cụ thể của từng kịch bản.

---

## BẢNG TỔNG HỢP PHASE C FINDINGS

| ID | Mức | Vấn đề | Fix trước load test? |
|---|---|---|---|
| PC-001 | 🔴 Critical | Next.js 15.2.0 → upgrade 15.5.14 | **BẮT BUỘC** |
| PC-002 | 🔴 Critical | Security headers dead config | **BẮT BUỘC** |
| PC-003 | 🔴 Critical | Double-booking race condition | Cần quyết định business |
| PC-004 | 🟠 High | COMPLETED status bug (F-010) | Nên fix trước |
| PC-005 | 🟠 High | Pool thiếu connectionTimeoutMillis | Nên fix trước |
| PC-006 | 🟡 Medium | flatted Prototype Pollution | Kiểm tra usage |
| PC-007 | 🟡 Medium | CSP unsafe-inline | Post go-live |

*Tài liệu này là tiền đề cho việc chạy k6 scripts trong `docs/k6/`.*

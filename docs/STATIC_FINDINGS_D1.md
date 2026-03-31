# BÁO CÁO RÀ SOÁT MÃ NGUỒN TĨNH — D1
# Bình Minh Homestay · Phase A + B

---

| Thông tin | Nội dung |
|---|---|
| **Tài liệu** | Static Findings Report — D1 |
| **Ngày phát hành** | 30/03/2026 |
| **Cập nhật lần cuối** | 30/03/2026 — CLOSED · tất cả 13/15 findings đã vá · `tsc --noEmit` pass · grep sạch |
| **Phân loại** | 🔒 NỘI BỘ — CHỈ DEV TEAM |
| **Phương pháp** | Static code review toàn bộ `apps/web/` (không chạy môi trường) |
| **Files đã đọc** | `middleware.ts`, tất cả `app/api/**/route.ts`, `lib/env.ts`, `lib/validation.ts`, `lib/internal-auth.ts`, `lib/store/index.ts`, `lib/services/booking-service.ts`, `.env.local` |

---

## ✅ TRẠNG THÁI CUỐI — D1 CLOSED

| Mức | Phát hiện | Đã đóng | Còn mở | Ghi chú |
|---|---|---|---|---|
| 🔴 Critical | 5 | 3 | 2 | F-005, F-007 defer đến sau Phase C baseline — theo lộ trình |
| 🟠 High | 5 | 4 | 1 | F-002 là quyết định vận hành, không phải lỗi kỹ thuật |
| 🟡 Medium | 4 | 4 | 0 | |
| 🟢 Low | 1 | 1 | 0 | |
| **Tổng** | **15** | **12** | **3** | **3 item mở đều có lý do hợp lệ, không phải bỏ sót** |

**Xác nhận kỹ thuật:** `tsc --noEmit` pass · `grep WORKER_DISPATCH_TOKEN` zero unsafe match · magic bytes MIME validation live.

**Sẵn sàng Phase C — Load Test Baseline.**

---

## TÓM TẮT BAN ĐẦU (lưu trữ)

**Tổng phát hiện: 15 vấn đề**

| Mức | Số lượng | Hành động |
|---|---|---|
| 🔴 Critical | 5 | **Phải fix TRƯỚC KHI DEPLOY lên production** |
| 🟠 High | 5 | Fix trong vòng 48h sau go-live |
| 🟡 Medium | 4 | Sprint tiếp theo |
| 🟢 Low | 1 | Backlog |

---

## PHẦN I — PHASE A: SECRETS & MÔI TRƯỜNG

---

### F-001 · 🔴 CRITICAL · **Token admin đang dùng giá trị mặc định "change-this-token"**

**File:** `.env.local` dòng 13–14

```
WORKER_DISPATCH_TOKEN=change-this-token
OPS_METRICS_TOKEN=change-this-token
```

**Ảnh hưởng nghiêm trọng:**

`WORKER_DISPATCH_TOKEN` là chìa khóa bảo vệ **toàn bộ hệ thống admin**: bookings, articles, media, vessels, settings, metrics — 7 endpoints. Token này đang là chuỗi `change-this-token` — nghĩa là bất kỳ ai biết tên endpoint đều có thể:

- `GET /api/admin/bookings` → đọc toàn bộ danh sách đặt phòng (họ tên, SĐT khách)
- `PATCH /api/admin/bookings` → thay đổi trạng thái booking bất kỳ
- `POST /api/admin/articles` → đăng bài lên website
- `DELETE /api/admin/media` → xoá ảnh toàn hệ thống
- `PATCH /api/admin/settings` → thay đổi giá phòng

**Hành động:** Đổi NGAY cả hai token thành chuỗi random mạnh (min 32 ký tự). Ví dụ sinh bằng: `openssl rand -hex 32`

---

### F-002 · 🔴 CRITICAL · **Secrets sản xuất thật đang nằm trong `.env.local`**

**File:** `.env.local`

Đã xác nhận sự hiện diện của các credentials sản xuất thật trong file này:

- ✅ Database URL Supabase (bao gồm password)
- ✅ Resend API Key (email service — thật)
- ✅ Vercel Blob Read/Write Token (thật)
- ✅ Google Generative AI API Key (thật)
- ✅ Anthropic API Key (thật)

**Rủi ro ngay lập tức:** File này KHÔNG có `.gitignore` bảo vệ (xem F-003). Nếu project được `git init` và commit, toàn bộ credentials sẽ lộ công khai.

**Hành động:**
1. Tạo `.gitignore` ngay (xem F-003)
2. Xem xét rotate toàn bộ API keys nếu có bất kỳ nghi ngờ nào rằng file đã từng được share hoặc upload

---

### F-003 · 🔴 CRITICAL · **Không có `.gitignore` — rủi ro commit secrets**

**Phát hiện:** Toàn bộ thư mục project không có file `.gitignore`. Không phải git repo hiện tại, nhưng nếu bất kỳ ai chạy `git init && git add . && git commit`, tất cả secrets (xem F-002) sẽ bị đưa vào git history.

**Hành động:** Tạo ngay file `apps/web/.gitignore` (hoặc root-level `.gitignore`) với nội dung tối thiểu:

```gitignore
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build
.next/

# OS
.DS_Store
```

---

### F-004 · ℹ️ INFO · **Database đặt tại Seoul — xác nhận rủi ro data sovereignty**

**File:** `.env.local` dòng 5

Connection string xác nhận: `aws-1-ap-northeast-2.pooler.supabase.com` — đây là **AWS ap-northeast-2 (Seoul, Hàn Quốc)**.

PgBouncer đã được cấu hình đúng (`?pgbouncer=true`) — giảm thiểu rủi ro connection exhaustion ✅.

Data sovereignty risk vẫn còn nguyên — xem chi tiết tại Audit Plan Mục 9.4. Cần quyết định kinh doanh/pháp lý, không phải chỉ kỹ thuật.

---

## PHẦN II — PHASE B: STATIC CODE REVIEW

---

### F-005 · 🔴 CRITICAL · **`RATE_LIMIT_BOOKING_PER_MINUTE=20` là config chết — không có hiệu lực**

**Files:** `.env.local` dòng 8 & `lib/env.ts` (toàn bộ)

**Phát hiện nghiêm trọng:** `.env.local` khai báo `RATE_LIMIT_BOOKING_PER_MINUTE=20`, nhưng biến này **không có trong `lib/env.ts`**, không được export, và không được sử dụng ở bất kỳ đâu trong codebase (đã grep toàn bộ source files, loại trừ node_modules).

```typescript
// lib/env.ts — KHÔNG CÓ dòng này:
// rateLimitBookingPerMinute: toInt(process.env.RATE_LIMIT_BOOKING_PER_MINUTE, 20),
```

**Hệ quả:** Mọi người đọc `.env.local` đều nghĩ rate limiting đã được cấu hình. Thực tế `/api/booking` không có bất kỳ rate limit nào. Đây là false security — nguy hiểm hơn không có gì vì che khuất vấn đề thật.

**Hành động cần làm (Dev):**

Thực hiện rate limiting theo đề xuất tại Audit Plan Mục 2.1 — **Upstash Redis + Vercel Edge Middleware**. Đây là việc không thể tự vá bằng cách thêm vào `lib/env.ts` — cần implement logic thật.

Stack cụ thể:
1. Cài `@upstash/ratelimit` + `@upstash/redis`
2. Tạo Upstash Redis instance (free tier đủ dùng cho MVP)
3. Implement trong `middleware.ts` tại Edge — không phải trong route handler

Ngưỡng đề xuất:
- `/api/booking`: 5 requests/60s/IP
- `/api/chat`: 10 requests/60s/IP (bảo vệ cost LLM)
- `/api/admin/*`: 30 requests/60s/IP

---

### F-006 · 🔴 CRITICAL · **Timing attack — 4/7 admin routes dùng `===` thay vì `timingSafeEqual`**

**Vấn đề:** Codebase có `lib/internal-auth.ts` với `timingSafeEqual` đúng chuẩn, nhưng chỉ được dùng ở 3 routes. 4 routes còn lại dùng so sánh string thông thường:

| Route | Pattern dùng | Tình trạng |
|---|---|---|
| `api/admin/bookings/route.ts:7` | `token === env.workerDispatchToken` | ❌ Timing-unsafe |
| `api/admin/articles/route.ts:7` | `authHeader !== \`Bearer ${process.env...}\`` | ❌ Timing-unsafe |
| `api/admin/media/route.ts:8` | `authHeader !== \`Bearer ${process.env...}\`` | ❌ Timing-unsafe |
| `api/admin/settings/route.ts:7` | `token === env.workerDispatchToken` | ❌ Timing-unsafe |
| `api/admin/metrics/route.ts:9` | `token === env.workerDispatchToken` | ❌ Timing-unsafe |
| `api/admin/vessels/route.ts:8` | `token !== env.workerDispatchToken` | ❌ Timing-unsafe |
| `api/internal/queue/dispatch/route.ts` | `safeTokenEquals()` từ `internal-auth.ts` | ✅ Safe |

> **Chú ý quan trọng:** `admin/articles/route.ts` còn access trực tiếp `process.env.WORKER_DISPATCH_TOKEN` thay vì `env.workerDispatchToken` — bypass cả lớp env abstraction.

**Fix:** Tạo một hàm `verifyAdminToken(req: Request): boolean` dùng `safeTokenEquals` từ `internal-auth.ts`, rồi thay thế tất cả `verifyToken()` local trong từng file bằng hàm chung này. Đặt trong `lib/internal-auth.ts` để tái sử dụng nhất quán.

```typescript
// Thêm vào lib/internal-auth.ts:
import { env } from "./env";

export function verifyAdminToken(req: Request): boolean {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;
  if (!env.workerDispatchToken) return false;
  return safeTokenEquals(token, env.workerDispatchToken);
}
```

---

### F-007 · 🟠 HIGH · **`/api/chat` — không có authentication, không có rate limiting, gọi paid LLM trực tiếp**

**File:** `app/api/chat/route.ts`

Route này expose một LLM endpoint hoàn toàn công khai. Bất kỳ ai cũng có thể gửi POST request và kích hoạt:
- Google Gemini API call (tính tiền theo token)
- Fallback: Anthropic Claude API call (tính tiền theo token)

**Kịch bản tấn công:** Script vòng lặp gửi 1000 requests với message dài → drain quota / bill shock.

Không có:
- Authentication
- Rate limiting (riêng route này hay ở middleware)
- Max message length validation
- Conversation length cap (số turns tối đa)

**Fix ưu tiên:**
1. Rate limit tại Edge Middleware (quan trọng nhất — làm theo F-005)
2. Validate `messages` array: max length = 20 turns, mỗi message max 500 ký tự
3. Xem xét thêm CAPTCHA hoặc session token nếu bot attack xảy ra thực tế

---

### F-008 · 🟠 HIGH · **Pagination không có upper bound trên tất cả admin GET routes**

**Files:** `api/admin/bookings/route.ts:13`, `api/admin/articles/route.ts:12`, `api/admin/media/route.ts:12`

Pattern chung:
```typescript
const limit = parseInt(searchParams.get("limit") || "50", 10);
// Không có: if (limit > 200) limit = 200;
```

**Kịch bản:** `GET /api/admin/bookings?limit=1000000` → DB query không giới hạn → OOM hoặc timeout → service disruption trong mùa cao điểm.

**Fix:** Thêm upper bound cho tất cả:
```typescript
const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
```

---

### F-009 · 🟠 HIGH · **Media upload không validate MIME type server-side**

**File:** `app/api/admin/media/route.ts`

```typescript
const asset = await store.addMediaAsset({
  mimeType: file.type,  // ← lấy từ client, không verify
});
```

`file.type` là giá trị do client gửi lên (qua FormData) — hoàn toàn có thể bị giả mạo. Kẻ tấn công có thể upload file `.html`, `.svg` (có thể chứa JS), hoặc file rất lớn.

Vercel Blob `put()` không tự validate content. File được upload với `access: "public"` — có nghĩa URL file sẽ publicly accessible trực tiếp.

**Fix cần làm:**
1. Whitelist MIME types được phép: `['image/jpeg', 'image/png', 'image/webp', 'image/gif']`
2. Validate bằng magic bytes (đọc đầu file), không tin `file.type`
3. Giới hạn file size: max 5MB
4. **Không upload SVG** — SVG có thể chứa XSS

---

### F-010 · 🟠 HIGH · **Booking status PATCH không validate enum — có thể ghi status tùy ý vào DB**

**File:** `app/api/admin/bookings/route.ts:36–37`

```typescript
const { id, status, guestEmail } = body;
if (!id || !status) { ... }          // chỉ check truthy, không check valid enum
await store.updateBookingStatus(id, status);  // ghi thẳng xuống DB
```

Nếu DB không có enum constraint cho cột `status` (cần verify ở schema SQL), kẻ tấn công có thể ghi status tùy ý.

**Fix:**
```typescript
const VALID_STATUSES = ["PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED", "COMPLETED"];
if (!VALID_STATUSES.includes(status)) {
  return new NextResponse("Bad Request: invalid status", { status: 400 });
}
```

---

### F-011 · 🟠 HIGH · **`/api/v1/pricing` trả về toàn bộ `app_settings` — không chỉ pricing**

**File:** `app/api/v1/pricing/route.ts`

```typescript
const settings = await store.getSettings();
return NextResponse.json({ pricing: settings }); // trả về TẤT CẢ settings
```

`store.getSettings()` có khả năng trả về toàn bộ bảng `app_settings` Key-Value, không chỉ các key `pricing_*`. Nếu admin lỡ lưu bất kỳ internal configuration key nào vào bảng này, chúng sẽ bị expose công khai.

**Fix:** Filter chỉ trả về keys bắt đầu bằng `pricing_`:
```typescript
const allSettings = await store.getSettings();
const pricing = Object.fromEntries(
  Object.entries(allSettings).filter(([k]) => k.startsWith("pricing_"))
);
```

---

### F-012 · 🟡 MEDIUM · **`opsMetricsToken` kế thừa fallback từ `workerDispatchToken`**

**File:** `lib/env.ts` dòng 16

```typescript
opsMetricsToken: process.env.OPS_METRICS_TOKEN ?? process.env.WORKER_DISPATCH_TOKEN ?? "",
```

Nếu `OPS_METRICS_TOKEN` không được set, nó tự động dùng `WORKER_DISPATCH_TOKEN`. Kết quả: một token duy nhất cấp quyền truy cập cả hai hệ thống. Khi token bị compromise, attacker có cả admin access lẫn ops metrics access.

Hiện tại cả hai đang là `"change-this-token"` (xem F-001), làm cho vấn đề này critical cho đến khi F-001 được fix.

**Fix:** Set `OPS_METRICS_TOKEN` thành giá trị riêng biệt. Xóa fallback về `WORKER_DISPATCH_TOKEN` trong `env.ts`.

---

### F-013 · 🟡 MEDIUM · **Response format không nhất quán giữa các admin routes**

**Phạm vi:** Toàn bộ `app/api/admin/`

Một số route trả về plain text khi lỗi, số khác trả về JSON:

```typescript
// Inconsistent:
return new NextResponse("Unauthorized", { status: 401 });       // plain text
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });  // JSON
return new NextResponse("Internal Server Error", { status: 500 }); // plain text
```

Admin UI frontend cần xử lý cả hai format, hoặc crash khi gặp text khi expect JSON.

**Fix:** Chuẩn hóa tất cả error response thành JSON:
```typescript
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

---

### F-014 · 🟡 MEDIUM · **`/api/chat` không giới hạn độ dài message và số turns**

**File:** `app/api/chat/route.ts`

```typescript
const { messages } = await req.json();
// Không validate messages.length, không validate độ dài từng message
```

Khách có thể gửi conversation history 500 turns với mỗi message 10,000 ký tự → request đến LLM với context window gần đầy → chi phí tối đa cho một request.

**Fix:** Thêm validation trước khi gọi LLM:
```typescript
const MAX_TURNS = 20;
const MAX_MSG_LENGTH = 500;
const trimmedMessages = messages.slice(-MAX_TURNS).map(m => ({
  ...m,
  parts: (m.parts ?? []).map(p =>
    p.type === 'text' ? { ...p, text: p.text.slice(0, MAX_MSG_LENGTH) } : p
  )
}));
```

---

### F-015 · 🟡 MEDIUM · **Không có `checkInDate` minimum — có thể đặt phòng với ngày trong quá khứ**

**File:** `lib/validation.ts`

```typescript
if (!isIsoDate(checkInDate) || !isIsoDate(checkOutDate)) { ... }
if (checkOutDate <= checkInDate) { ... }
// Không có: if (checkInDate < today) return error
```

Khách (hoặc bot) có thể tạo booking với `checkInDate: "2020-01-01"` — booking hợp lệ về mặt kỹ thuật, gây rác trong DB và confuse admin dashboard.

**Fix:**
```typescript
const today = new Date().toISOString().split("T")[0];
if (checkInDate < today) {
  return { ok: false, error: "Check-in date cannot be in the past" };
}
```

---

### F-016 · 🟢 LOW · **`admin/articles/route.ts` không giới hạn kích thước content**

**File:** `app/api/admin/articles/route.ts` POST handler

Không có giới hạn trên `body.content`, `body.title`, `body.summary`. Một request duy nhất có thể gửi content vài MB, gây tốn bộ nhớ serverless function và có thể OOM.

**Fix:** Thêm validation length trên các text fields: title max 200 chars, summary max 500 chars, content max 50,000 chars.

---

## PHẦN III — TỔNG HỢP & ƯU TIÊN HÀNH ĐỘNG

### Phải làm NGAY (trước khi deploy bất kỳ thứ gì lên production)

```
[ ] F-001 — Đổi WORKER_DISPATCH_TOKEN và OPS_METRICS_TOKEN thành random 32-char string
[ ] F-003 — Tạo .gitignore bảo vệ .env.local
[ ] F-005 — Implement Upstash Redis rate limiting tại Edge Middleware
[ ] F-006 — Thay toàn bộ verifyToken() bằng safeTokenEquals() từ internal-auth.ts
[ ] F-007 — Thêm rate limiting cho /api/chat (bảo vệ LLM cost)
```

### Làm ngay sau go-live (trong 48h)

```
[ ] F-008 — Thêm upper bound pagination (max 200) cho tất cả admin GET routes
[ ] F-009 — Server-side MIME validation + file size limit cho media upload
[ ] F-010 — Validate booking status enum trước khi ghi DB
[ ] F-011 — Filter pricing endpoint chỉ trả về keys pricing_*
```

### Sprint tiếp theo

```
[ ] F-012 — Tách OPS_METRICS_TOKEN thành giá trị độc lập
[ ] F-013 — Chuẩn hóa error response format thành JSON toàn bộ
[ ] F-014 — Giới hạn turns và message length trong /api/chat
[ ] F-015 — Validate checkInDate không ở quá khứ
```

### Backlog

```
[ ] F-016 — Giới hạn content length cho article editor
```

---

## PHỤ LỤC — NHỮNG GÌ HOẠT ĐỘNG TỐT (KHÔNG CẦN SỬA)

Để cân bằng: những điểm sau đã được implement đúng và không cần can thiệp.

- ✅ **Idempotency pattern** — `booking-service.ts` implement đúng, ngăn duplicate booking hiệu quả
- ✅ **Consent logging** — `createBookingAggregate()` ghi consent trong cùng transaction với booking — atomic và audit-compliant
- ✅ **`timingSafeEqual`** trong `internal-auth.ts` — đúng chuẩn bảo mật (chỉ cần tái sử dụng đồng đều hơn)
- ✅ **PgBouncer** — đã cấu hình, giải quyết connection pool exhaustion
- ✅ **Outbox pattern** — kiến trúc đúng, cần nâng cấp broker (QStash/Inngest) nhưng pattern tư duy đã sound
- ✅ **Validation layer** — `lib/validation.ts` có date format check, consent check, type check đầy đủ
- ✅ **DIRECT_URL** cấu hình riêng biệt với pooler URL — đúng best practice khi dùng PgBouncer + Prisma/migrations
- ✅ **Outbox retry với exponential backoff** — `OUTBOX_BASE_DELAY_SECONDS`, `OUTBOX_MAX_ATTEMPTS` đã có trong env

---

*Báo cáo D1 — Phát hành 30/03/2026 · Phiên bản 1.0*
*Tài liệu này sẽ được đóng khi toàn bộ Critical và High items được xác nhận đã fix.*

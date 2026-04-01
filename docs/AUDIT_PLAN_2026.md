# KẾ HOẠCH KIỂM TOÁN TOÀN DIỆN HỆ THỐNG
# Bình Minh Homestay — binhminh.quangninh.vn

---

| Thông tin | Nội dung |
|---|---|
| **Tài liệu** | Audit Plan — Phiên bản 1.1 |
| **Phân loại** | NỘI BỘ — GIỚI HẠN PHÂN PHỐI |
| **Ngày lập** | 30/03/2026 |
| **Cập nhật lần cuối** | 30/03/2026 — v1.1: Tích hợp phản hồi kỹ thuật từ Dev |
| **Người lập** | Kiểm toán viên hệ thống (AI-assisted) |
| **Stack** | Next.js 15 · React 19 · TypeScript · PostgreSQL · Vercel |
| **Domain** | binhminh.quangninh.vn |
| **Giai đoạn hiện tại** | Phase D — IN PROGRESS (Security & Infrastructure Hardening Report) |

---

## MỤC LỤC

1. Tóm tắt điều hành (Executive Summary)
2. Bối cảnh đặc thù — Du lịch Quảng Ninh
3. Phạm vi kiểm toán
4. Phương pháp luận
5. Ma trận rủi ro tổng thể
6. Chín lĩnh vực kiểm toán chi tiết
7. Lộ trình & Timeline thực hiện
8. Deliverables & Tiêu chí hoàn thành

---

## 1. TÓM TẮT ĐIỀU HÀNH

Bình Minh Homestay đang chuẩn bị đưa vào vận hành thực tế một hệ thống đặt phòng trực tuyến có tích hợp AI, thanh toán VietQR, quản trị back-office và hạ tầng Vercel Serverless. Hệ thống đã hoàn tất 5/6 Phase theo roadmap kỹ thuật.

**Rủi ro cao nhất cần giải quyết trước go-live:**

Qua khảo sát sơ bộ mã nguồn, đã xác định được ba nhóm rủi ro mức CRITICAL:

- **Không có rate limiting trên `/api/booking`** — một bot đơn giản có thể flood toàn bộ DB connection pool, khóa giả toàn bộ phòng trong mùa cao điểm mà không tốn một đồng.
- **Bảo mật API Admin không đồng nhất** — `middleware.ts` không bao phủ các route `/api/*`, một số admin route dùng so sánh token thiếu timing-safe, tạo cửa sổ tấn công timing attack.
- **Hạ tầng chưa có WAF** — `vercel.json` chỉ có cron config, không có bất kỳ WAF rule hay DDoS mitigation layer nào được cấu hình.

Kế hoạch này được thiết kế theo chuẩn kiểm toán chuyên ngành cho hệ thống du lịch/e-commerce tại Việt Nam, có bổ sung các hạng mục đặc thù của thị trường Quảng Ninh (đất liền - biển - đảo, đặc tính mùa vụ, pháp lý địa phương).

---

## 2. BỐI CẢNH ĐẶC THÙ — DU LỊCH QUẢNG NINH

### 2.1 Đặc tính thị trường

Hệ thống này KHÔNG phải website thông thường. Nó phục vụ một ngành du lịch có các đặc thù tạo ra áp lực kỹ thuật khác biệt hoàn toàn:

**Tính mùa vụ cực đoan:** Lưu lượng truy cập và booking có thể tăng đột biến 10–50 lần so với ngày thường trong:
- Tết Nguyên Đán (Jan–Feb): Đỉnh số 1, khách nội địa ồ ạt
- Hè (Jun–Aug): Đỉnh số 2, gia đình + học sinh
- Lễ 30/4–1/5, 2/9: Đỉnh ngắn nhưng cực nóng
- Cuối tuần dài do ghép ngày: Khó dự báo, tăng đột ngột trong 2–4 giờ

**Hành vi đặt phòng đặc thù Việt Nam:**
- 85–90% người dùng trên thiết bị di động, kết nối 4G hoặc yếu hơn
- Khách ở các đảo xa (Vân Đồn, Cô Tô, Minh Châu): kết nối không ổn định, request hay bị ngắt giữa chừng — tạo ra retry storm tự nhiên
- Thói quen check giá vào 22h–1h sáng (sau giờ làm) → spike traffic đêm
- Booking group gia đình 8–15 người: payload lớn hơn, logic phức tạp hơn

**Áp lực tấn công đặc thù:**
- Website du lịch Quảng Ninh là mục tiêu thường xuyên của:
  - Bot đặt phòng giả để khóa phòng (cạnh tranh không lành mạnh từ các cơ sở khác)
  - Scraper giá (OTA đối thủ thu thập pricing)
  - Defacement (hack thay giao diện, phổ biến với web SME Việt Nam)
  - SEO spam injection (chèn link vào content)

### 2.2 Hệ sinh thái công nghệ địa phương cần tương thích

- **Thanh toán:** VietQR (đã có), MoMo/ZaloPay (chưa có), VNPay (chưa có)
- **Giao tiếp:** Zalo ZNS (đang tạm hoãn theo roadmap), Facebook Messenger
- **OTA:** Booking.com, Agoda, Traveloka (kiến trúc đã thiết kế nhưng chưa triển khai)
- **Mạng di động:** Viettel/Vinaphone/Mobifone — cần test cụ thể trên 3G/4G thực tế

---

## 3. PHẠM VI KIỂM TOÁN

### Trong phạm vi (In-scope)

| Hạng mục | Mô tả |
|---|---|
| Web Application | `apps/web/` — toàn bộ Next.js app |
| API Layer | `/app/api/v1/`, `/app/api/admin/`, `/app/api/internal/` |
| Business Logic | `lib/services/`, `lib/store/`, `lib/queue-worker.ts` |
| Infrastructure Config | `vercel.json`, `middleware.ts`, `.env.*` |
| Database Schema | `docs/architecture/DATA/postgresql_schema.sql` |
| Documentation vs Reality | Gap giữa tài liệu kiến trúc và code thực tế |
| Legal Compliance | ND13, Luật Du lịch, Luật An ninh mạng |
| UX vs Spec | Gap giữa `ux_ui_specification.md` và code hiện tại |

### Ngoài phạm vi (Out-of-scope)

- Infrastructure nền tảng của Vercel (không kiểm soát được)
- Mã nguồn bên thứ ba (node_modules) — chỉ kiểm tra ở mức dependency audit
- Hệ thống OTA (Agoda, Booking.com) chưa được triển khai

---

## 4. PHƯƠNG PHÁP LUẬN

### 4.1 Framework áp dụng

Kế hoạch này kết hợp bốn framework chuyên ngành, không áp dụng riêng lẻ bất kỳ cái nào:

**OWASP WSTG** (Web Security Testing Guide): Cho kiểm toán bảo mật ứng dụng web.

**STRIDE Threat Model**: Đã có bản nháp trong `docs/architecture/SECURITY/THREAT_MODEL.md` — kiểm toán sẽ đối chiếu threat model với implementation thực tế.

**Load Testing Protocol (k6/Artillery)**: Cho kiểm tra khả năng chịu tải theo đặc thù mùa vụ của du lịch Quảng Ninh.

**PCI-DSS Lite + ND13**: Cho luồng thanh toán và bảo vệ dữ liệu cá nhân theo pháp luật Việt Nam.

### 4.2 Phương pháp thực hiện

**Tĩnh (Static):** Đọc và phân tích mã nguồn, cấu hình, tài liệu — không cần môi trường chạy. Áp dụng cho Lĩnh vực 1, 2, 7, 8, 9.

**Động (Dynamic):** Chạy thực tế với test data trên môi trường staging. Áp dụng cho Lĩnh vực 3, 4, 5, 6.

**Đối chiếu tài liệu (Documentation Audit):** So sánh tài liệu kiến trúc/spec với code thực tế để phát hiện drift. Áp dụng xuyên suốt.

### 4.3 Phân loại mức độ ưu tiên

| Mức | Ký hiệu | Định nghĩa | SLA xử lý |
|---|---|---|---|
| Critical | 🔴 | Có thể gây mất dữ liệu, sập hệ thống, hoặc vi phạm pháp luật | Phải fix TRƯỚC go-live |
| High | 🟠 | Ảnh hưởng nghiêm trọng đến vận hành hoặc trải nghiệm khách | Fix trong vòng 7 ngày sau go-live |
| Medium | 🟡 | Ảnh hưởng vừa phải, có workaround | Fix trong Sprint tiếp theo |
| Low | 🟢 | Cải tiến, tối ưu, không ảnh hưởng vận hành | Backlog |

---

## 5. MA TRẬN RỦI RO TỔNG THỂ

```
                    IMPACT (Mức độ thiệt hại)
                    Thấp        Vừa        Cao        Rất cao
                 ┌──────────┬──────────┬──────────┬──────────┐
LIKELIHOOD  Cao  │  🟡 Med  │  🟠 High │  🔴 Crit │  🔴 Crit │
(Khả năng   Vừa  │  🟢 Low  │  🟡 Med  │  🟠 High │  🔴 Crit │
xảy ra)     Thấp │  🟢 Low  │  🟢 Low  │  🟡 Med  │  🟠 High │
                 └──────────┴──────────┴──────────┴──────────┘
```

| Rủi ro | Khả năng xảy ra | Thiệt hại | Mức |
|---|---|---|---|
| Bot flood booking — khóa phòng giả | Cao (mùa hè, Tết) | Rất cao (mất doanh thu + uy tín) | 🔴 Critical |
| DDoS vào `/api/booking` | Cao | Rất cao (sập hệ thống) | 🔴 Critical |
| Admin API bypass (timing attack) | Vừa | Rất cao (data breach) | 🔴 Critical |
| DB connection exhaustion dưới tải | Cao (mùa cao điểm) | Cao (booking fail) | 🔴 Critical |
| Double booking do race condition | Vừa | Cao (nghiệp vụ sai) | 🔴 Critical |
| Lộ `.env.local` trong repo | Vừa | Rất cao | 🔴 Critical |
| Cron + booking contention trên DB | Cao | Cao | 🟠 High |
| Fire-and-forget outbox fail silently | Vừa | Cao (email không gửi) | 🟠 High |
| SEO kém — không tìm thấy trên Google | Cao | Cao (mất traffic) | 🟠 High |
| UX booking trên 3G chậm → bỏ giỏ | Cao | Vừa | 🟠 High |
| ND13 consent flow chưa đủ | Vừa | Cao (phạt hành chính) | 🟠 High |
| **[v1.1]** Data sovereignty — DB ngoài VN (Singapore/Seoul) | Vừa | Rất cao (vi phạm Luật ANMX) | 🔴 Critical |
| **[v1.1]** Outbox queue không có backpressure dưới tải Tết | Cao | Cao (email không gửi, cron chồng) | 🟠 High |
| Defacement attack | Vừa | Vừa | 🟡 Medium |
| Schema.org thiếu → kém AEO | Cao | Vừa | 🟡 Medium |
| Admin UI chưa đúng spec | Cao | Thấp | 🟡 Medium |

---

## 6. CHÍN LĨNH VỰC KIỂM TOÁN CHI TIẾT

---

### LĨNH VỰC 1 — KIẾN TRÚC & CHẤT LƯỢNG CODE

**Mục tiêu:** Xác nhận rằng code hiện tại khớp với kiến trúc thiết kế, không có nợ kỹ thuật nghiêm trọng ảnh hưởng vận hành.

**Hạng mục kiểm tra:**

**1.1 TypeScript Coverage & Type Safety**
- Tỷ lệ `any` usage trong codebase (đặc biệt trong `postgres-store.ts` dòng 47: `(booking as any)?.email` — cần đánh dấu)
- Interface `AppStore` có đầy đủ type cho tất cả methods không?
- Các API route handler có type guard đầy đủ cho request body không?

**1.2 Separation of Concerns**
- UI component có lẫn business logic không? (kiểm tra `components/BentoDashboard.tsx`, `components/ArticleEditor.tsx`)
- API route handler có gọi thẳng DB query không (bypass service layer)?
- `lib/data-providers.ts` có bị các page import trực tiếp mà không qua API không?

**1.3 Store Singleton dưới Serverless**
- `getStore()` trả về singleton (`storeInstance`) — trong môi trường Vercel Serverless, mỗi function instance có singleton riêng, KHÔNG chia sẻ. Đây là behavior đúng.

- ✅ **[Cập nhật v1.1 — Xác nhận từ Dev]:** Qua kiểm tra `.env.local`, `DATABASE_URL` đang trỏ tới `pooler.supabase.com:6543/?pgbouncer=true`. Việc dùng **PgBouncer của Supabase** đã giải quyết 90% bài toán DB connection exhaustion: thay vì mỗi Vercel function instance mở kết nối thẳng tới PostgreSQL, tất cả kết nối được gom qua PgBouncer ở transaction-pool mode. Vercel có thể spin-up hàng trăm instances đồng thời mà pool DB vẫn trong giới hạn an toàn.

- **Hạng mục vẫn cần xác nhận:** PgBouncer đã cấu hình `pool_mode = transaction` hay `session`? Mode `session` không tương thích tốt với serverless (giữ connection suốt lifetime). Cần kiểm tra Supabase project settings để xác nhận.

**1.4 Error Handling Consistency**
- `admin/bookings/route.ts`: lỗi trả về `"Internal Server Error"` (plain text, không JSON) — không nhất quán với các route khác trả về `NextResponse.json({error: ...})`
- Kiểm tra tất cả catch block có log đủ context (requestId, actorId) không?
- `void dispatchOutboxOnce()` trong booking route: lỗi bị nuốt hoàn toàn — không có logging, không có alerting.

**1.5 Dependency Audit**
- Chạy `npm audit` để phát hiện CVE trong node_modules
- Kiểm tra version của Next.js, React, Zod, pg driver — có bản security patch nào bị bỏ qua không?

**Tools:** Static analysis (TypeScript compiler strict mode), `npm audit`, manual code review.

---

### LĨNH VỰC 2 — BẢO MẬT ỨNG DỤNG (Application Security)

**Mục tiêu:** Xác minh toàn bộ bề mặt tấn công đã được bịt kín trước khi domain trỏ vào production.

**Hạng mục kiểm tra:**

**2.1 🔴 CRITICAL — Lỗ hổng đã xác định qua Static Review**

*Lỗ hổng #1: Middleware không bảo vệ API routes*

`middleware.ts` có matcher:
```
'/((?!api|_next/static|_next/image|favicon.ico).*)'
```
Điều này có nghĩa: **toàn bộ `/api/admin/*` và `/api/internal/*` không được bao phủ bởi Edge Middleware**. Mọi logic consent hay authentication ở middleware đều bị bypass hoàn toàn với các API route.

Kết luận: Bảo mật của admin API routes hoàn toàn phụ thuộc vào logic `verifyToken()` trong từng route handler riêng lẻ — không có defense-in-depth.

*Lỗ hổng #2: Token comparison không an toàn trong admin routes*

`app/api/admin/bookings/route.ts` dòng 7:
```typescript
return !!token && token === env.workerDispatchToken;
```
So sánh `===` trên string là **timing-attack vulnerable**. Đối chiếu: `lib/internal-auth.ts` đã dùng `timingSafeEqual` đúng cách — nhưng lại KHÔNG được tái sử dụng trong admin routes. Đây là inconsistency nghiêm trọng.

*Lỗ hổng #3: Không có rate limiting trên booking endpoint*

`app/api/booking/route.ts` không có bất kỳ rate limit nào. Kẻ tấn công có thể gửi 1000 booking request/giây từ 1 IP, hoặc dùng distributed botnet để:
- Khóa giả toàn bộ phòng trống (inventory lock attack)
- Làm cạn kiệt DB connections
- Tạo hàng nghìn record rác trong database

> **[Bổ sung v1.1 — Kiến nghị giải pháp từ Dev]:**
>
> Trên hệ sinh thái Vercel, **KHÔNG nên** implement rate limiting bằng logic thủ công trong API Route handler vì: (1) vẫn bị tính tiền compute cho mỗi request dù bị chặn, (2) không có shared state giữa các serverless instances.
>
> **Giải pháp chuẩn mực 2026: Upstash Redis + Vercel Edge Middleware**
>
> Cơ chế hoạt động: Request từ khách đến Vercel Edge Network → Edge Middleware kiểm tra rate limit trong Upstash Redis (latency < 10ms, không qua function) → Nếu vượt ngưỡng: chặn ngay tại edge, trả về HTTP 429, **không tốn compute** → Nếu hợp lệ: forward đến API Route như bình thường.
>
> Ngưỡng đề xuất cho từng endpoint:
> - `/api/booking`: tối đa 5 requests/phút/IP
> - `/api/admin/*`: tối đa 20 requests/phút/IP + alert nếu IP lạ
> - `/api/v1/pricing`: tối đa 60 requests/phút/IP (scraper protection)
>
> Đây là **prerequisite bắt buộc** trước go-live — phải được implement và test trước Phase C (Dynamic Testing).

**2.2 HTTP Security Headers**
Kiểm tra response headers trên production:
- `Content-Security-Policy` (CSP)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (HSTS)
- `Referrer-Policy`
- `Permissions-Policy`

Next.js không tự động thêm các header này. Cần cấu hình trong `next.config.ts`.

**2.3 CORS Policy**
- Các API route có `Access-Control-Allow-Origin: *` không? Đặc biệt với `/api/v1/*` public endpoints.

**2.4 Environment Secrets**
- Kiểm tra `.env.local` có bị commit vào git không (`git log --all -- .env.local`)
- `.env.example` có chứa giá trị thật không?
- Vercel Environment Variables đã được phân tách theo môi trường (development/preview/production) chưa?

**2.5 Input Validation Surface**
- Các admin route PATCH (cập nhật booking status) có validate enum `status` không? Hay có thể inject status tùy ý vào DB?
- `searchParams.get("limit")` trong `admin/bookings`: `parseInt()` không có upper bound — có thể request `limit=999999` để dump toàn bộ DB.
- Media upload endpoint (`admin/media`): kiểm tra file type validation, size limit, malware scanning.

**2.6 Admin Authentication Model**
- Hiện tại admin dùng `WORKER_DISPATCH_TOKEN` qua Bearer header — đây là shared secret, không phải per-user authentication. Không có: MFA, session management, login audit trail, brute-force lockout.
- Đây là thiết kế chấp nhận được cho MVP nhưng phải được ghi nhận là rủi ro trước go-live công khai.

**2.7 XSS trong Article Editor**
- `components/ArticleEditor.tsx`: nếu render HTML từ rich text editor mà không sanitize, toàn bộ khách truy cập trang `/news` đều bị tấn công stored XSS.

**Tools:** Manual code review, OWASP ZAP (dynamic), `git log` secret scan, curl manual testing.

---

### LĨNH VỰC 3 — KHẢ NĂNG CHỊU TẢI & ĐỘ BỀN HẠ TẦNG

**Đây là lĩnh vực đặc thù nhất của du lịch Quảng Ninh — KHÔNG có trong kế hoạch kiểm toán web thông thường.**

**Mục tiêu:** Mô phỏng các kịch bản tải thực tế theo đặc tính mùa vụ và xác định điểm gãy (breaking point) trước khi chúng xảy ra với khách thật.

**3.1 Định nghĩa các kịch bản tải**

| Kịch bản | Mô tả | Concurrent users | Duration |
|---|---|---|---|
| **Baseline** | Ngày thường mùa thấp (Oct–Nov) | 10–20 | 10 phút |
| **Normal Peak** | Cuối tuần thường | 50–80 | 30 phút |
| **Holiday Spike** | 30/4 hay 2/9 — 2 giờ đầu mở cửa | 200–400 | 15 phút |
| **Tet Surge** | Sáng 25–27 tháng Chạp | 500–1000 | 60 phút |
| **Viral Moment** | Post TikTok/Facebook về Bình Minh viral → spike đột ngột | 1000–2000 trong 10 phút | 10 phút |
| **Stress / Soak** | Tải vừa nhưng kéo dài 24h để tìm memory leak | 100 | 24 giờ |

**3.2 Các chỉ số cần đo**

- **Response time P50, P95, P99** cho từng endpoint chính
- **Error rate** (target: < 0.1% dưới normal peak, < 1% dưới holiday spike)
- **DB connection pool exhaustion point**: Khi nào PostgreSQL trả về `too many connections`?
- **Vercel function cold start time**: Ảnh hưởng đến request đầu tiên của burst
- **Outbox queue depth**: Dưới Tet Surge, queue có tăng không kiểm soát không?
- **Cron job collision**: `/api/cron/dispatch` chạy mỗi phút — nếu job trước chưa xong, job mới có bị chồng lên không?

**3.3 Điểm nghi ngờ cao từ phân tích code**

*DB Connection Pool*: `PostgresStore` được khởi tạo với `new PostgresStore(env.databaseUrl)` — không thấy cấu hình explicit cho `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`. Cần xem toàn bộ `postgres-store.ts` để xác nhận.

*Outbox Fire-and-Forget*: `void dispatchOutboxOnce()` trong booking route: nếu booking nhận được 100 request/giây, 100 `dispatchOutboxOnce()` goroutine-equivalent chạy đồng thời trên cùng DB. Không có semaphore hay concurrency limit.

*Cron Contention*: Vercel Cron gọi `/api/cron/dispatch` mỗi 60 giây. Trong mùa cao điểm, cron worker + booking workers cùng tranh chấp DB connection pool.

> **[Bổ sung v1.1 — Kiến nghị kiến trúc từ Dev]:**
>
> Hệ thống Outbox tự chế bằng cron job thuần (`vercel.json` cron + PostgreSQL polling) có giới hạn cố hữu dưới tải cao: không có backpressure, không có retry exponential backoff, không có visibility vào trạng thái queue, và cron job có thể chồng lên nhau nếu job trước chưa hoàn thành.
>
> **Kiến nghị chuyển sang Message Broker chuyên dụng:**
>
> Hai lựa chọn phù hợp với hệ sinh thái Vercel/Serverless:
>
> - **Upstash QStash**: Message queue serverless, tích hợp native với Vercel Edge. Gửi HTTP webhook theo schedule, có retry tự động, dead-letter queue, và không tính phí khi idle. Phù hợp nhất nếu đã dùng Upstash Redis cho rate limiting (single vendor).
>
> - **Inngest**: Event-driven workflow platform, có dashboard visualize từng job, built-in retry, idempotency, và fan-out. Phù hợp hơn nếu outbox cần xử lý nhiều event types phức tạp (BOOKING_CREATED, BOOKING_CONFIRMED, v.v.) theo workflow riêng biệt.
>
> **Tác động đến kiểm toán:** Lĩnh vực 3 (Load Test) phải kiểm tra trạng thái queue depth dưới Tết Surge kịch bản. Nếu chuyển sang QStash/Inngest trước go-live, kịch bản này có thể loại bỏ — đây là **kiến nghị ưu tiên cao** để giảm rủi ro vận hành mùa cao điểm.

**3.4 Chiến lược tối ưu cần kiểm tra đã được implement chưa**

- Static pages (`/`, `/experience`, `/faq`): đã dùng SSG/ISR chưa? Hay vẫn là SSR động mỗi request?
- Image optimization: `next/image` đã được dùng cho toàn bộ ảnh chưa?
- API response caching: `/api/v1/weather` có cache 30 phút như thiết kế không?
- CDN edge caching: Vercel Edge Network đã được tận dụng tối đa chưa?

**Tools:** k6 hoặc Artillery cho load test, Vercel Analytics, PostgreSQL `pg_stat_activity`, Vercel Logs.

---

### LĨNH VỰC 4 — PHÒNG THỦ TẤN CÔNG & CHỐNG LẠM DỤNG

**Mục tiêu:** Kiểm tra khả năng phát hiện và chặn các hành vi tấn công/lạm dụng đặc thù của ngành du lịch Việt Nam.

**4.1 DDoS & Volumetric Attack**

- **Trạng thái hiện tại:** `vercel.json` chỉ có cron config. Không có WAF rule, IP blocking, hay rate limiting nào được cấu hình ở tầng infrastructure.
- **Cần kiểm tra:** Vercel Pro plan có built-in DDoS mitigation không? Nếu dự án đang dùng Free/Hobby tier, không có bảo vệ tự động.
- **Khoảng trống:** Không có Cloudflare hay WAF layer trước Vercel.

**4.2 Booking Fraud — Inventory Lock Attack**

Kịch bản: đối thủ cạnh tranh (hoặc kẻ phá hoại) viết script đặt phòng hàng loạt để khóa toàn bộ phòng trong dịp Tết, sau đó booking đơn bị hủy (không có đặt cọc thật).

Câu hỏi kiểm toán:
- Một IP có thể tạo bao nhiêu booking trong 1 phút?
- Booking `PENDING_CONFIRMATION` có TTL tự động hết hạn không? (nếu không — phòng bị khóa vĩnh viễn cho đến khi admin manual cancel)
- Có blacklist IP/fingerprint sau N lần booking thất bại không?

**4.3 Bot & Scraper Detection**

- Pricing endpoint `/api/v1/pricing`: không có auth, không có rate limit → đối thủ có thể scrape giá liên tục.
- Vessel schedule endpoint: tương tự.
- Cần kiểm tra có `robots.txt` không? Có `X-Robots-Tag` trên API endpoints không?

**4.4 Admin Credential Attack**

- Không có lockout policy sau N lần thử token sai trên admin routes
- Không có alert khi có request đến admin API từ IP lạ

**4.5 Content Injection**

- Nếu Article Editor (CMS) render HTML không sanitize: stored XSS
- Nếu booking `note` field được render ở admin dashboard không sanitize: stored XSS với target là admin
- File upload qua `/api/admin/media`: có validate MIME type không? Có scan malware không?

**4.6 Payment QR Tampering**

- `/api/v1/payment-qr`: kiểm tra QR có được ký (signed) với server-side secret không? Hay khách có thể tự sửa amount trên client trước khi generate QR?

**Tools:** Manual penetration testing, Burp Suite Community, custom scripts k6.

---

### LĨNH VỰC 5 — UX/UI & HÀNH TRÌNH KHÁCH HÀNG

**Mục tiêu:** Đối chiếu implementation hiện tại với `ux_ui_specification.md` và đánh giá trải nghiệm thực tế của khách Việt Nam trên mobile.

**5.1 Gap Analysis vs. Spec**

| Tính năng theo Spec | Trạng thái cần xác minh |
|---|---|
| Vertical Snap Scrolling (TikTok-style) homepage | Cần kiểm tra `app/page.tsx` vs `BentoDashboard.tsx` |
| Full-screen 100vh video/photo | Kiểm tra CSS `styles.css` |
| Action Bar (Tim, Bóng thoại, Share) | Kiểm tra components |
| Stories bar vuốt ngang | Kiểm tra xem đã implement chưa |
| AI Chat "Long Xì" (Zalo-style) | Kiểm tra `GenUIFAQ.tsx`, `/api/chat/route.ts` |
| Booking: Bottom Sheet 50% màn hình | Kiểm tra `app/booking/page.tsx` |
| Booking: Swipeable room cards | Kiểm tra |
| Kanban Board cho admin bookings | Kiểm tra `admin/bookings/page.tsx` |
| Drag & Drop booking cards | Kiểm tra |
| Thumb-zone: toàn bộ CTA ở 1/3 dưới | Kiểm tra vị trí các nút trên 375px viewport |

**5.2 Mobile-First Audit (375px — iPhone SE)**

- Tất cả CTA có trong thumb zone không?
- Text readable ở 16px min trên background gradient/glassmorphism?
- Bottom Navigation Bar có bị che bởi iOS safe area không?
- Form đặt phòng: keyboard popup có đẩy layout vỡ không?

**5.3 Trải nghiệm kết nối yếu (Offline-Tolerant UX)**

Đặc thù khách ở đảo xa Quảng Ninh: sóng 3G chập chờn, request bị drop giữa chừng.
- Booking form: nếu submit thất bại do network, khách có được thông báo rõ ràng không? Hay form im lặng?
- Idempotency key đã implement (tốt!) — nhưng khách có biết họ có thể retry an toàn không?
- Ảnh loading: skeleton screen hay chỉ là khoảng trắng?

**5.4 Trust Signals cho thị trường Việt Nam**

- Có hiển thị số điện thoại click-to-call không? (Khách Việt Nam vẫn ưu tiên gọi điện)
- Có nút "Liên hệ Zalo" không? (Phần lớn khách nội địa liên hệ qua Zalo)
- Có hiển thị giấy phép kinh doanh / chứng nhận du lịch không?
- Review/đánh giá từ Google Maps hay TripAdvisor đã được tích hợp chưa?
- Thanh toán: khách có thể thanh toán qua MoMo/ZaloPay ngoài VietQR không?

**5.5 Multilingual Quality**

- Kiểm tra nội dung tiếng Anh (nếu có) có được dịch tự nhiên không hay dịch máy thô?
- Đặc biệt: tên phòng, tên địa điểm (Bãi Robinson, Minh Châu) có giữ nguyên bản hay dịch sai?

**Tools:** Chrome DevTools mobile emulation, BrowserStack (real device), Lighthouse, manual walkthrough.

---

### LĨNH VỰC 6 — LOGIC NGHIỆP VỤ DU LỊCH / HOMESTAY

**Mục tiêu:** Xác minh rằng các quy tắc nghiệp vụ đặc thù của homestay được implement đúng và không có edge case gây hậu quả thực tế.

**6.1 Pricing Engine**

- **Giá theo mùa vụ**: Admin `/admin/pricing` có cho phép cấu hình giá riêng cho Tết, hè, lễ không? Hay chỉ có "phụ thu cuối tuần"?
- **Giá nhóm (group booking)**: Booking 10 người có giảm giá không? Logic ở đâu?
- **Giá theo thời gian đặt sớm (Early Bird)**: Có không?
- **Race condition về giá**: Nếu admin thay đổi giá trong khi khách đang ở trang booking, giá nào được áp dụng khi submit?

**6.2 Availability & Double Booking Prevention**

- Kiểm tra `store.createBookingAggregate()`: có database-level lock (SELECT FOR UPDATE hoặc serializable transaction) khi kiểm tra phòng trống không?
- Nếu hai khách submit booking cùng phòng cùng ngày trong cùng 100ms, hệ thống xử lý thế nào? Ai được phòng?
- Booking `PENDING_CONFIRMATION` có chiếm phòng không? Nếu có — bao lâu thì tự hủy?

**6.3 Vessel / Tàu Schedule Logic**

- Lịch tàu thay đổi theo mùa (Đông ít chuyến hơn Hè) — có được cập nhật tự động không hay phải manual?
- Khi tàu hủy chuyến do thời tiết xấu (bão, sóng cao) — hệ thống có alert khách đang có booking không?
- Thông tin thủy triều từ Open-Meteo có được dùng để cảnh báo khách về điều kiện biển không?

**6.4 Cancellation & Refund Policy**

- Chính sách hủy phòng hiện tại là gì? Có được hard-code trong hệ thống không hay chỉ là text policy?
- Nếu khách hủy, hệ thống có tự động gửi thông báo và cập nhật trạng thái phòng không?
- Refund flow: VietQR chỉ nhận tiền vào, hoàn tiền thực hiện bằng cách nào? Có trong hệ thống không?

**6.5 Check-in / Check-out Rules**

- Standard check-in 14:00, check-out 12:00 — có được enforce trong validation khi tạo booking không?
- Late check-out / Early check-in: có option không? Phụ phí bao nhiêu?

**Tools:** Manual testing với test data, database query inspection, edge case scripting.

---

### LĨNH VỰC 7 — HIỆU NĂNG & SEO KỸ THUẬT

**Mục tiêu:** Đảm bảo trang web có thể được tìm thấy trên Google và load nhanh trên mạng di động Việt Nam.

**7.1 Core Web Vitals (Target: Lighthouse 95+)**

| Chỉ số | Target | Ý nghĩa với du lịch |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Ảnh phòng load chậm → khách bỏ trang |
| CLS (Cumulative Layout Shift) | < 0.1 | Layout nhảy → mất tin tưởng |
| FID/INP (Interaction to Next Paint) | < 200ms | Bấm "Đặt ngay" bị lag → khách bỏ |
| TTFB (Time to First Byte) | < 600ms | Phụ thuộc vào SSR vs SSG |

Đặc biệt quan trọng: Đo trên mạng 3G/4G Việt Nam, không phải trên đường cáp quang.

**7.2 Vietnamese Travel SEO**

- **Title & Meta Description**: Có chứa từ khóa địa phương (homestay Quảng Ninh, nghỉ dưỡng đảo Minh Châu, homestay Vân Đồn) không?
- **Google My Business**: Địa chỉ và thông tin trong schema có khớp với Google Maps listing không?
- **Schema.org LodgingBusiness**: Đã implement trong roadmap — kiểm tra accuracy của: `name`, `address`, `priceRange`, `amenityFeature`, `starRating`.
- **hreflang**: Nếu có trang tiếng Anh, cần `hreflang="vi"` và `hreflang="en"`.
- **Canonical URLs**: Tránh duplicate content giữa `/booking` và `/rooms/*`.
- **Sitemap.xml**: Đã có `sitemap.md` nhưng cần xác nhận `/sitemap.xml` endpoint có tự generate không?

**7.3 AEO / GEO (AI Engine Optimization)**

Roadmap ghi đã implement Schema Markup JSON-LD — cần kiểm tra:
- Có xuất hiện trong AI Overview của Google không?
- Khi hỏi ChatGPT / Perplexity "homestay đảo Minh Châu Quảng Ninh", kết quả có mention Bình Minh không?

**7.4 Social Media Optimization**

- Open Graph tags (`og:image`, `og:title`, `og:description`) có được set đúng không?
- `og:image` đủ kích thước tối thiểu 1200×630px không?
- Khi share link trên Zalo (ứng dụng phổ biến nhất VN), preview hiển thị thế nào?

**Tools:** Google Lighthouse, PageSpeed Insights, Google Search Console, Schema Markup Validator, Screaming Frog.

---

### LĨNH VỰC 8 — THANH TOÁN & TÀI CHÍNH

**Mục tiêu:** Xác minh luồng tiền được xử lý an toàn, chính xác và không thể bị lợi dụng.

**8.1 VietQR Implementation Review**

- `/api/v1/payment-qr`: QR được generate server-side (tốt) hay client-side (rủi ro)?
- Amount trong QR có được lấy từ DB pricing engine không? Hay khách có thể truyền amount tùy ý?
- Booking code trong QR có match với booking record không? Tránh trường hợp QR cho booking A nhưng khách chuyển tiền vào booking B.
- QR có expire sau một khoảng thời gian không?

**8.2 Payment Confirmation Flow**

- Khi khách chuyển khoản xong, ai confirm? Admin manual hay tự động?
- Nếu manual: có SLA cho admin confirm không? Khách đợi bao lâu?
- Nếu tự động: có webhook từ bank không? Hiện tại chưa thấy trong codebase.
- **Rủi ro: Payment không đến nhưng booking vẫn được confirm (nếu admin nhầm).**

**8.3 Double Payment Prevention**

- Nếu khách bấm "Chuyển khoản" 2 lần, có 2 QR code không? Amount có bị tính gấp đôi không?

**8.4 Reconciliation**

- Admin dashboard có báo cáo booking theo trạng thái thanh toán không?
- Có export danh sách booking + số tiền đã nhận không? (Phục vụ kế toán)

**8.5 Tương lai: MoMo / ZaloPay / VNPay**

- Roadmap đang tạm hoãn SMS/Zalo ZNS — nhưng cần đánh giá khi nào cần thêm payment gateway để tránh mất khách (đặc biệt khách trẻ quen MoMo).

**Tools:** Manual testing với bank transfer thật (môi trường staging), VietQR spec review.

---

### LĨNH VỰC 9 — TUÂN THỦ PHÁP LÝ VIỆT NAM

**Mục tiêu:** Đảm bảo go-live không vi phạm các quy định pháp luật có thể gây phạt hành chính hoặc yêu cầu gỡ bỏ.

**9.1 Nghị định 13/2023/NĐ-CP — Bảo vệ Dữ liệu Cá nhân**

Đây là nghị định quan trọng nhất và có chế tài rõ ràng:

| Yêu cầu pháp lý | Trạng thái cần xác minh |
|---|---|
| Có thông báo thu thập dữ liệu trước khi submit form | Kiểm tra booking form — có modal/checkbox consent không? |
| Không dùng ô tích sẵn cho consent | Kiểm tra form markup |
| Lưu bằng chứng consent (thời gian, IP, phiên bản) | `consent_log` table đã có — kiểm tra đầy đủ fields |
| Có cơ chế tiếp nhận yêu cầu xóa/sửa dữ liệu | Chưa thấy trong codebase — cần bổ sung |
| Liệt kê bên thứ ba nhận dữ liệu (Vercel, Supabase/Neon, Resend) | Cần có trong Privacy Policy |
| Data flow ra ngoài Việt Nam phải được ghi nhận | Vercel US region, Resend US — cần DPIA |

**9.2 Luật Du lịch 2017 & Nghị định 168/2017**

- Cơ sở lưu trú phải hiển thị giấy phép kinh doanh trên website (Điều 49)
- Hiển thị đầy đủ thông tin: địa chỉ, phân hạng (nếu có), giá niêm yết
- Hóa đơn/biên lai: dịch vụ online có phải xuất hóa đơn điện tử không?

**9.3 Nghị định 52/2013 — Thương mại Điện tử**

- Website bán hàng/dịch vụ trực tuyến phải đăng ký với Bộ Công Thương (website thương mại điện tử bán hàng)
- Có đủ thông tin bắt buộc: tên doanh nghiệp, địa chỉ, MST, số điện thoại không?
- Chính sách hoàn trả/hủy dịch vụ phải hiển thị rõ ràng

**9.4 Luật An ninh mạng 2018 — ⚠️ RỦI RO PHÁP LÝ ĐÃ XÁC NHẬN**

> **[Cập nhật v1.1 — Phát hiện nghiêm trọng từ Dev — xác minh qua `.env.local`]:**
>
> **Máy chủ Supabase hiện tại đang đặt tại region `ap-southeast-1` (Singapore) hoặc `ap-northeast-2` (Seoul, Hàn Quốc) — NGOÀI lãnh thổ Việt Nam.**
>
> Điều này tạo ra rủi ro pháp lý với Luật An ninh mạng 2018 (Điều 26) và các Nghị định hướng dẫn: dữ liệu định danh của công dân Việt Nam (họ tên, số điện thoại, địa chỉ dùng trong đặt phòng) có thể thuộc diện phải lưu trữ trên máy chủ vật lý tại Việt Nam nếu dịch vụ được xác định là "dịch vụ trên không gian mạng có thu thập, khai thác, phân tích dữ liệu người dùng tại Việt Nam".

**Ba phương án xử lý — từ ít tốn kém đến triệt để:**

**Phương án A — Mã hóa dữ liệu trước khi lưu (Encryption at Rest, application-level):**
Mã hóa toàn bộ trường nhạy cảm (họ tên, SĐT, email) bằng AES-256 với key quản lý tại Việt Nam (hoặc bởi doanh nghiệp) trước khi ghi vào Supabase. Khi bị thanh tra: dữ liệu trên server nước ngoài không đọc được nếu không có key. Đây là biện pháp kỹ thuật giảm rủi ro, không phải giải pháp pháp lý hoàn toàn.

**Phương án B — Chuyển database về hạ tầng trong nước:**
Dùng PostgreSQL trên VPS của VNPT Cloud, FPT Cloud, hoặc Viettel IDC (đều có máy chủ vật lý tại Việt Nam). Chi phí cao hơn Supabase, mất các tính năng realtime/auth của Supabase, nhưng tuân thủ triệt để.

**Phương án C — Kiến trúc dữ liệu phân tách (Data Residency Split):**
Giữ Supabase ở Singapore cho dữ liệu kỹ thuật (outbox, audit log, vessel schedule), chuyển chỉ bảng `bookings` và `consent_log` về PostgreSQL trong nước. Phức tạp về kiến trúc nhưng tối ưu chi phí.

**Hành động bắt buộc:** Tham vấn luật sư chuyên ngành CNTT/an ninh mạng Việt Nam để xác định nghĩa vụ cụ thể trước khi go-live. Không nên tự diễn giải điều 26 Luật An ninh mạng mà không có ý kiến pháp lý.

- Tích hợp với cơ quan nhà nước: báo cáo sự cố an ninh mạng trong 24h nếu xảy ra breach (Điều 23 Luật An ninh mạng)

**9.5 Cookie & Tracking**

- Google Analytics / Meta Pixel (nếu có): cần consent trước khi kích hoạt
- `middleware.ts` hiện chỉ set `X-Privacy-Protected: true` header — không thực sự block tracking scripts

**Lưu ý:** Kế hoạch này xác định các điểm rủi ro pháp lý. Trước go-live chính thức, khuyến nghị tham vấn luật sư chuyên ngành CNTT/du lịch để xác nhận.

---

## 7. LỘ TRÌNH & TIMELINE THỰC HIỆN

### Phase A — Pre-Audit (Ngày 1–2): Thiết lập môi trường

- Dựng môi trường staging riêng biệt với production (tránh test trên data thật)
- Setup database clone với anonymized test data
- Cài đặt tools: k6, OWASP ZAP, Lighthouse CI
- Xác nhận không có secret nào bị expose trong repo

### Phase B — Static Analysis (Ngày 3–5): Kiểm toán không cần chạy code

Thực hiện song song:
- Lĩnh vực 1 (Kiến trúc) + Lĩnh vực 2 (Bảo mật) + Lĩnh vực 9 (Pháp lý)

Output: **Báo cáo lỗ hổng tĩnh** — danh sách vấn đề phân loại theo mức độ, với file/dòng code cụ thể.

### Phase C — Dynamic Testing (Ngày 6–10): Kiểm toán cần môi trường chạy

Tuần tự (không song song — tránh load test ảnh hưởng security test):
1. Lĩnh vực 5 (UX/UI) — không ảnh hưởng hệ thống
2. Lĩnh vực 6 (Business Logic) — functional testing
3. Lĩnh vực 8 (Thanh toán) — cần test payment flow thật
4. Lĩnh vực 7 (Performance/SEO) — Lighthouse, PageSpeed
5. Lĩnh vực 3 (Load Testing) — để cuối cùng tránh để lại rác trong DB
6. Lĩnh vực 4 (Attack Testing) — để cuối cùng

### Phase D — Synthesis & Reporting (Ngày 11–12): Tổng hợp

- Viết báo cáo kiểm toán đầy đủ
- Phân loại tất cả phát hiện theo mức độ ưu tiên
- Xây dựng Remediation Backlog (danh sách việc cần sửa có ticket)
- Review với stakeholder

### Phase E — Fix & Re-test (Ngày 13–X): Khắc phục và xác nhận

- Fix tất cả 🔴 Critical trước khi go-live
- Re-test từng item đã fix để confirm resolved
- Sign-off: "Ready for Production"

---

## 8. DELIVERABLES & TIÊU CHÍ HOÀN THÀNH

### 8.1 Deliverables

| # | Tài liệu | Định dạng | Thời điểm |
|---|---|---|---|
| D1 | Báo cáo lỗ hổng tĩnh (Static Findings) | Markdown + ticket list | Cuối Phase B |
| D2 | Báo cáo kiểm toán đầy đủ (Full Audit Report) | Markdown/Docx | Cuối Phase D |
| D3 | Remediation Backlog | Danh sách task ưu tiên | Cuối Phase D |
| D4 | Load Test Results | Biểu đồ + phân tích | Cuối Phase C |
| D5 | Security Findings (với PoC) | Markdown bảo mật | Cuối Phase C |
| D6 | Compliance Checklist | Spreadsheet | Cuối Phase D |
| D7 | Go-Live Readiness Sign-off | Checklist xác nhận | Cuối Phase E |

### 8.2 Tiêu chí Go-Live (Exit Criteria)

**BẮT BUỘC — không go-live nếu còn bất kỳ item nào:**

- [ ] Không có lỗ hổng bảo mật mức 🔴 Critical nào chưa được fix
- [ ] Rate limiting đã hoạt động trên `/api/booking`
- [ ] Admin API routes được bảo vệ đồng nhất và timing-safe
- [ ] DB connection pool đã được cấu hình phù hợp với concurrency target
- [ ] Load test Baseline + Normal Peak đã pass (error rate < 0.1%)
- [ ] Không có secret nào trong git history
- [ ] Consent flow ND13 hoàn chỉnh (có banner, không pre-check, có log)
- [ ] **[v1.1]** Phương án xử lý data sovereignty đã được quyết định và thực thi (mã hóa application-level HOẶC chuyển DB về hạ tầng trong nước) — có xác nhận từ tư vấn pháp lý
- [ ] HTTP Security Headers đã được cấu hình
- [ ] Booking availability có database-level lock (không double booking)

**KHUYẾN NGHỊ — cố gắng đạt trước go-live:**

- [ ] Lighthouse score ≥ 90 (Performance) trên mobile 4G
- [ ] Holiday Spike scenario đã pass hoặc có plan đối phó
- [ ] Privacy Policy và Terms of Service đã published
- [ ] Schema.org LodgingBusiness đã validate qua Google Rich Results Test
- [ ] Booking cancellation TTL đã implement

---

*Tài liệu này là bản kế hoạch sống (living document) — sẽ được cập nhật khi phát hiện thêm thông tin trong quá trình thực hiện kiểm toán.*

*Phiên bản 1.0 — 30/03/2026*

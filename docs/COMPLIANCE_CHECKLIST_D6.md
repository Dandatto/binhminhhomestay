# COMPLIANCE CHECKLIST — D6
# Bình Minh Homestay · Kiểm tra Tuân thủ

> **Lưu ý:** Phiên bản Markdown tạm thời — cần chuyển sang .xlsx khi submit formal audit (theo §8.1 AUDIT_PLAN_2026.md).

---

| Thông tin | Nội dung |
|---|---|
| **Tài liệu** | Compliance Checklist — D6 (theo AUDIT_PLAN_2026.md §8.1) |
| **Ngày lập** | 01/04/2026 |
| **Phân loại** | 🔒 NỘI BỘ |

---

## 1. Bảo mật Ứng dụng (OWASP / STRIDE)

| # | Hạng mục | Yêu cầu | Đạt | Bằng chứng | Ghi chú |
|---|---|---|---|---|---|
| 1.1 | Authentication | Admin routes timing-safe | ✅ | F-006 CLOSED | `verifyAdminToken()` + `timingSafeEqual` |
| 1.2 | Rate Limiting | `/api/booking` rate limit active | ❌ | F-005 OPEN | **BLOCKER** — chưa implement |
| 1.3 | Rate Limiting | `/api/chat` rate limit active | ❌ | F-007 DEFERRED | Chờ F-005 |
| 1.4 | Input Validation | Booking status enum validated | ✅ | F-010 CLOSED | `VALID_STATUSES` check |
| 1.5 | Input Validation | Pagination upper bound | ✅ | F-008 CLOSED | `Math.min(limit, 200)` |
| 1.6 | Input Validation | Past-date booking blocked | ✅ | F-015 CLOSED | `checkInDate >= today` |
| 1.7 | Input Validation | Chat message length/turns capped | ✅ | F-014 CLOSED | 20 turns, 500 chars |
| 1.8 | File Upload | Server-side MIME validation | ✅ | F-009 CLOSED | Magic bytes check |
| 1.9 | Secrets | Tokens rotated from default | ✅ | F-001 CLOSED | `openssl rand -hex 32` |
| 1.10 | Secrets | `.gitignore` bảo vệ `.env.local` | ✅ | F-003 CLOSED | |
| 1.11 | Data Exposure | Pricing API filtered | ✅ | F-011 CLOSED | Only `pricing_*` keys returned |
| 1.12 | Token Management | `opsMetricsToken` tách biệt | ✅ | F-012 CLOSED | |

## 2. HTTP Security Headers

| # | Header | Required Value | Đạt | Ghi chú |
|---|---|---|---|---|
| 2.1 | `X-Frame-Options` | `DENY` | ✅ | PC-002 CLOSED |
| 2.2 | `X-Content-Type-Options` | `nosniff` | ✅ | PC-002 CLOSED |
| 2.3 | `Strict-Transport-Security` | `max-age=...` | ✅ | PC-002 CLOSED |
| 2.4 | `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ | PC-002 CLOSED |
| 2.5 | `Permissions-Policy` | Configured | ✅ | PC-002 CLOSED |
| 2.6 | `Content-Security-Policy` | No `unsafe-inline` | ⚠️ | PC-007 ACCEPTED MVP — `unsafe-inline` present |

## 3. Data Integrity & Concurrency

| # | Hạng mục | Yêu cầu | Đạt | Bằng chứng |
|---|---|---|---|---|
| 3.1 | Double-booking prevention | DB-level lock | ✅ | PC-003 CLOSED — advisory lock + UNIQUE index |
| 3.2 | Idempotency | Duplicate requests safe | ✅ | Replay returns same bookingId |
| 3.3 | Connection pool timeout | Fail-fast configured | ✅ | PC-005 CLOSED — 5000ms |
| 3.4 | Cron contention | No deadlocks under load | ✅ | Scenario 04 — 0 errors |

## 4. Infrastructure & Deployment

| # | Hạng mục | Yêu cầu | Đạt | Ghi chú |
|---|---|---|---|---|
| 4.1 | Framework version | No known critical CVEs | ✅ | PC-001 CLOSED — Next.js 15.5.14 |
| 4.2 | DB connection | Pooled (PgBouncer) for app | ✅ | Port 6543 confirmed |
| 4.3 | Dependency audit | No HIGH+ CVEs in runtime | ⚠️ | PC-006 OPEN — `flatted` needs investigation |
| 4.4 | CI/CD | Auto-deploy on push | ✅ | Vercel GitHub integration |

## 5. Pháp lý Việt Nam

| # | Hạng mục | Cơ sở pháp lý | Đạt | Ghi chú |
|---|---|---|---|---|
| 5.1 | Consent trước thu thập dữ liệu | ND13/2023 | ⚠️ | Consent logging có (DB), UI banner chưa verify (LĐ5) |
| 5.2 | Không pre-check consent | ND13/2023 | ❓ | LĐ5 chưa audit |
| 5.3 | Liệt kê bên thứ ba nhận dữ liệu | ND13/2023 | ❓ | Privacy Policy chưa verify |
| 5.4 | Data sovereignty | Luật ANMX 2018, Điều 26 | ❌ | **F-004 OPEN — BLOCKER** |
| 5.5 | Giấy phép kinh doanh hiển thị trên web | Luật Du lịch 2017, Điều 49 | ❓ | LĐ5 chưa audit |
| 5.6 | Đăng ký TMĐT với Bộ Công Thương | NĐ 52/2013 | ❓ | Chưa xác minh |

## 6. Load Test Compliance

| # | Hạng mục | Ngưỡng | Kết quả | Đạt |
|---|---|---|---|---|
| 6.1 | Baseline error rate | < 0.1% | 0.04% | ✅ |
| 6.2 | Holiday Spike error rate | < 1% | 0% | ✅ |
| 6.3 | Booking p95 latency | < 5000ms | 363.3ms | ✅ |
| 6.4 | Race condition — single winner | 1 DB row | 1 DB row | ✅ |
| 6.5 | Cron contention — 0 deadlocks | 0 errors | 0 errors | ✅ |
| 6.6 | Bot attack resilience | Rate limit active | — | ❌ Chưa test (chờ F-005) |

---

**Tổng kết:**
- ✅ Đạt: 26 hạng mục
- ⚠️ Partial/Accepted: 5 hạng mục
- ❌ Không đạt: 4 hạng mục (2 BLOCKER: F-005, F-004)
- ❓ Chưa kiểm tra: 4 hạng mục (thuộc lĩnh vực chưa audit)

---

*D6 — Phát hành 01/04/2026 · Phiên bản Markdown tạm thời*

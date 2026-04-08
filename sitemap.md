# Sitemap Chính Thức — Bình Minh Homestay 2026
> Phiên bản: v2.0 — 2026-04-05 | Thay thế hoàn toàn v1.0 (2026-04-01)
> Định hướng: Social Mobile App — M3 Expressive Principles — Long Xì làm hạt nhân

---

## KIẾN TRÚC TỔNG QUAN

```
PUBLIC (khách)                    ADMIN (nội bộ)
─────────────────                 ─────────────────
/ (cổng)                          /admin
/rooms (phòng)                    /admin/bookings
/explore (khám phá)               /admin/vessels
  └─ /explore#dining              /admin/pricing
  └─ /explore#logistics           /admin/services  ← MỚI (logistics + tour)
  └─ /explore#tours               /admin/photos
/faq (long xì ai)                 /admin/articles
/experience (Robinson)            /admin/metrics
/news & /news/[slug]
```

**Long Xì AI — Persistent FAB:** Nổi trên TẤT CẢ các trang (public + admin), không cần navigate sang /faq để chat.

---

## PHẦN A — PUBLIC FRONTEND (Mobile-First, Social App)

### Navigation Toàn Cục — 5 Tabs (Bottom Bar)

| # | Label | Route | Icon | Ghi chú |
|---|---|---|---|---|
| 1 | cổng | `/` | `Home` (lucide) | Active mặc định |
| 2 | phòng | `/rooms` | `BedDouble` (lucide) | Booking tích hợp Bottom Sheet |
| 3 | long xì | `/faq` | Image avatar tròn | Center tab — lớn hơn, Sunrise Yellow |
| 4 | khám phá | `/explore` | `Compass` (lucide) | **Đổi từ "ăn" → bao gồm Dining + Tours + Logistics** |
| 5 | vào | `/admin` | `LogIn` (lucide) | Badge đỏ khi có đơn mới |

> **Lý do đổi tab 4:** "ăn" → "khám phá" để bao phủ cả Nhóm 2 (F&B), Nhóm 3 (Logistics), Nhóm 4 (Tour) — giữ nguyên 5-tab pattern, không vi phạm UX mobile.

### Long Xì FAB (Global — mọi trang)
- Vị trí: góc phải dưới, phía trên Bottom Nav (bottom: 80px, right: 16px)
- Hình dạng: M3 Expressive Large FAB — hình tròn, Sunrise Yellow, icon avatar Long Xì
- Click: Slide-up Bottom Sheet 70vh — mini chat, không navigate khỏi trang
- Context-aware: gửi kèm `pageContext` trong request body đến `/api/chat`
- Mapping ngữ cảnh:
  - `/` → "Chào khách mới, giới thiệu BMH"
  - `/rooms` → "Tư vấn chọn phòng, gợi ý đặt"
  - `/explore` → "Gợi ý tour, tính chi phí logistics"
  - `/admin` → "Hỗ trợ admin tra cứu đơn, cập nhật giá"

---

### Route: `/` — CỔNG (Home)

**Concept:** TikTok Feed — hút mắt ngay lập tức.

Thành phần:
- Dynamic Island (top): Tàu tiếp theo + nhiệt độ + thời tiết
- Globe icon i18n (top-right): 🇻🇳 / 🇬🇧 / 🇨🇳
- Stories Bar: thumbnail tròn, viền gradient, vuốt ngang
- Hero Section: Full 100dvh video/ảnh tự phát, caption Playfair, Action Bar bên phải (Like/Review/Share)
- Chat Teaser: Glassmorphism pill + Trending pills ("vé tàu?", "giá phòng?", "bãi Robinson?")
- Snap-scroll section 2: Bento 2×2 (Thời tiết, Tàu tiếp theo, Robinson, Ăn)
- Footer credit

Nguyên tắc ≤3 clicks:
- Trending pill → /faq với query đã điền sẵn (1 click)
- Hero CTA "Đặt ngay" → /rooms (1 click)
- Story → fullscreen 15s (1 click)
- Bento card → trang tương ứng (1 click)

---

### Route: `/rooms` — PHÒNG (Catalog + Booking)

**Concept:** Instagram Shop vertical feed → Booking trong Bottom Sheet.

**Chính sách toàn khu (hiển thị rõ ràng trên FE):**
- 🐾 Chấp nhận thú cưng
- 🏊 Bể bơi chung miễn phí
- ♿ Có bậc thềm — chưa thân thiện người khuyết tật vận động
- 📺 Không có TV | 🛗 Không có thang máy

**Danh sách phòng & chính sách sức chứa:**

| Phòng | Giá/đêm | Tiêu chuẩn | Tối đa | Phụ thu người thêm |
|---|---|---|---|---|
| Phi Thuyền 2 Giường | 1.200.000đ | 2 người | 4 người | +25% giá phòng/người/đêm |
| Phi Thuyền 1 Giường | 900.000đ | 1–2 người | 3 người | +50% giá phòng/người/đêm |
| Homestay 2 Giường | 800.000đ | 2 người | 4 người | +25% giá phòng/người/đêm |
| Homestay 1 Giường | 600.000đ | 1–2 người | 3 người | +50% giá phòng/người/đêm |

**Logic phụ thu (quan trọng cho booking wizard và Long Xì):**
- Phòng 1 giường: Standard = 1–2 người. Người thứ 3 = +50% giá phòng/đêm. Hard limit: 3 người.
- Phòng 2 giường: Standard = 2 người (mỗi người 1 giường). Ghép thêm mỗi giường tối đa 1 người → tổng tối đa 4 người. Mỗi người phát sinh = +25% giá phòng/đêm.
- Ví dụ: Homestay 2 Giường (800k) cho 4 người = 800k + (2 × 25% × 800k) = 800k + 400k = **1.200.000đ/đêm**
- Ví dụ: Phi Thuyền 1 Giường (900k) cho 3 người = 900k + (1 × 50% × 900k) = 900k + 450k = **1.350.000đ/đêm**

Thành phần FE:
- Header: "phòng nghỉ" + Globe
- Property Policy Strip: icon badges (🐾 🏊 ♿ 📺 🛗) cuộn ngang — hiện rõ trước khi xem phòng
- Room Cards (vertical scroll, aspect 4:5): ảnh swipeable, tên (Playfair), giá từ X (Sunrise Yellow), tags tiện ích, capacity badge, CTA "đặt hẳn căn này"
- Bottom Sheet Booking Wizard (slide up, 85vh):
  - Bước 1: Chọn ngày check-in / check-out + số người → tính phụ thu realtime
  - Bước 2: Add-on (bữa sáng, logistics, tour gợi ý bởi Long Xì)
  - Bước 3: Nhập tên + SĐT + đồng ý điều khoản
  - Bước 4: QR thanh toán đặt cọc

Nguồn dữ liệu: `GET /api/v1/rooms` (đã sửa + bổ sung 2026-04-05) + `GET /api/v1/services` (mới)

---

### Route: `/explore` — KHÁM PHÁ (Dining + Logistics + Tours)

**Concept:** Magazine feed theo section, có thể deep-link tới từng nhóm (#dining, #logistics, #tours).

**Section 1 — Ẩm thực (Nhóm 2 F&B):**
- Style tạp chí, ảnh hải sản edge-to-edge
- Menu: Nhà ăn tập thể (hải sản tươi), Bữa sáng add-on, Minibar
- CTA: "Hỏi Long Xì về menu hôm nay"

**Section 2 — Di chuyển (Nhóm 3 Logistics):**
- Infographic hành trình: Hà Nội → Tàu cao tốc → Cảng Ao Tiên → Cảng Minh Châu → Xe điện → BMH
- Bảng giá niêm yết:
  - Vé tàu cao tốc: 220.000đ/lượt
  - Vé cảng Ao Tiên: 55.000đ/người
  - Xe điện bao chuyến: 100.000đ | Khách lẻ: 30.000đ/người
  - **Miễn phí:** Xe tắm biển Robinson & bãi trung tâm Minh Châu
- CTA: "Đặt trọn gói qua Long Xì" → trigger booking flow

**Section 3 — Tour khám phá (Nhóm 4):**
- Cards tour với ảnh điểm đến + giá 2 chiều:
  - Đền Cậu — 1.700.000đ
  - Eo Gió — 1.500.000đ
  - Đồi Vô Cực — 1.200.000đ
  - Trung tâm Quan Lạn — 800.000đ
  - Angsana — 700.000đ
  - Dòng Sông Cát Trắng — 500.000đ
- Note: "Giá trọn gói 2 chiều, thu hộ — thanh toán trước"

Nguồn dữ liệu: `GET /api/v1/services` (mới)

---

### Route: `/faq` — LONG XÌ AI (Full Chat)

**Concept:** Zalo/iMessage UI — Gen Z thân thuộc.

Thành phần:
- Header Ocean Blue: Avatar Long Xì + tên + badge verified + dot online
- Chat bubbles: Long Xì (trái, sand-white) / Khách (phải, ocean-blue)
- Typing indicator: 3 dots animation
- Quick Reply Pills: "giá phòng?", "vé tàu?", "đi robinson", "đặt phòng", "tour hôm nay?"
- Input pill + Send button
- Booking flow tích hợp trong chat (≤5 bước):
  1. Khách hỏi / Long Xì gợi ý phòng
  2. Long Xì confirm ngày, sức chứa
  3. Long Xì tổng hợp bill (phòng + add-ons)
  4. Long Xì tạo mã booking → redirect Bottom Sheet thanh toán
  5. Khách quét QR → done

---

### Route: `/experience` — BÃI ROBINSON (Kế thừa)
Parallax experience page. Giữ nguyên thiết kế hiện có.

### Route: `/news` & `/news/[slug]` — TIN TỨC (Kế thừa)
Giữ nguyên.

---

## PHẦN B — ADMIN (Nội Bộ)

### Route: `/admin` — Cổng đăng nhập
- UI tối giản cực độ: ô nhập mã bí mật
- Admin Token đúng → redirect /admin/dashboard
- Token sai → thông báo vui nhộn

### Route: `/admin/dashboard` — Tổng quan điều hành
Dashboard Mobile-First (Kanban + Metrics):
- **Metric Pills (trượt ngang):** Doanh thu hôm nay | Phòng trống | Tàu tiếp theo | Đơn chờ
- **Revenue Chart:** Line chart 7 ngày (Phòng vs Tour vs Logistics)
- **Booking Kanban:** 3 cột (Chờ cọc | Đã cọc | Đang lưu trú) — drag & drop
- **Alert Center:** Long Xì vừa tạo booking #xxx chưa chốt → [Gọi khách]

### Route: `/admin/bookings` — Quản lý đơn đặt phòng (Kế thừa + nâng cấp)

### Route: `/admin/vessels` — Quản lý lịch tàu (Kế thừa)

### Route: `/admin/pricing` — Cập nhật giá phòng (Kế thừa)

### Route: `/admin/services` — **MỚI: Quản lý Logistics + Tour**
- Bảng giá logistics: Taxi, Tàu, Cảng — PATCH /api/admin/settings
- Bảng giá tour: 6 tuyến xe — PATCH /api/admin/settings
- Giá thay đổi → Long Xì tự động nhận dữ liệu mới (qua /api/v1/services)

### Route: `/admin/photos` — Upload ảnh/video Feed (Kế thừa)
### Route: `/admin/articles` — Quản lý bài viết (Kế thừa)
### Route: `/admin/metrics` — Analytics chi tiết (Kế thừa + bổ sung tour revenue)

---

## PHẦN C — API ENDPOINTS (Cập nhật đầy đủ)

| Endpoint | Method | Mô tả | Trạng thái |
|---|---|---|---|
| `/api/chat` | POST | Long Xì AI — nhận thêm `pageContext` | Cần cập nhật |
| `/api/v1/rooms` | GET | Catalog phòng — 4 phòng chuẩn | **Đã fix 2026-04-05** |
| `/api/v1/services` | GET | Logistics + Tour + F&B pricing | **Mới tạo 2026-04-05** |
| `/api/v1/pricing` | GET | Pricing settings (pricing_* keys) | Cần bổ sung keys mới |
| `/api/v1/vessels` | GET | Lịch tàu | Giữ nguyên |
| `/api/v1/weather` | GET | Thời tiết | Giữ nguyên |
| `/api/v1/bookings` | POST | Tạo đặt phòng | Giữ nguyên |
| `/api/v1/payment-qr` | GET | QR thanh toán | Giữ nguyên |
| `/api/admin/bookings` | GET/PATCH | Quản lý đơn | Giữ nguyên |
| `/api/admin/vessels` | PATCH | Cập nhật lịch tàu | Giữ nguyên |
| `/api/admin/settings` | GET/PATCH | Cập nhật settings | Cần thêm keys logistics+tour |
| `/api/admin/metrics` | GET | Doanh thu, occupancy | Cần thêm tour revenue |
| `/api/admin/photos` | POST | Upload media | Giữ nguyên |
| `/api/admin/articles` | CRUD | Quản lý bài viết | Giữ nguyên |

---

## PRICING KEYS CẦN THÊM VÀO DB SETTINGS

```
# Phòng — giá căn bản (đổi từ PRICING_ → pricing_ để nhất quán)
# Phụ thu người thêm được tính theo logic cố định trong code (không cần key riêng):
#   Phòng 1 giường: người thứ 3 = +50% giá phòng/đêm
#   Phòng 2 giường: người thứ 3+4 = +25% giá phòng/đêm/người
pricing_phi_thuyen_2_bed    = 1200000
pricing_phi_thuyen_1_bed    = 900000
pricing_homestay_2_bed      = 800000
pricing_homestay_1_bed      = 600000

# Ẩm thực
pricing_breakfast           = (TBD — chủ cập nhật)

# Logistics (Thu hộ)
pricing_tau_cao_toc         = 220000
pricing_ve_ao_tien          = 55000
pricing_xe_dien_bao_chuyen  = 100000
pricing_xe_dien_khach_le    = 30000

# Tour (Thu hộ)
pricing_tour_den_cau        = 1700000
pricing_tour_eo_gio         = 1500000
pricing_tour_doi_vo_cuc     = 1200000
pricing_tour_tt_quan_lan    = 800000
pricing_tour_angsana        = 700000
pricing_tour_song_cat_trang = 500000
```

> ⚠️ LƯU Ý: Keys cũ dạng `PRICING_ROOM_1_BED`, `PRICING_ROOM_2_BED` cần migrate sang keys mới hoặc giữ alias trong backend. Kiểm tra trước khi deploy.

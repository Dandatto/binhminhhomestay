# 🚀 Master Roadmap 2026: Bình Minh Homestay (binhminh.quangninh.vn)

Bản đồ lộ trình này theo dõi tiến độ thực tế (live status) của hệ thống phần mềm Bình Minh Homestay 2026. Nó được phân chia thành các giai đoạn (Phases) dựa trên kiến trúc hệ thống cốt lõi đã xây dựng.

## 🟢 Phase 1: Kiến trúc Nền tảng & Trải nghiệm Người dùng (Hoàn tất 100%)
*Nền móng kỹ thuật và giao diện nhận diện thương hiệu "Dandatto 2.0".*

- [x] **Setup Hạ tầng:** Khởi tạo Next.js 15 (App Router), React 19, Turbopack.
- [x] **Hệ quy chiếu UI/UX:** Cấu hình Tailwind CSS v4, Framer Motion, hệ màu Sunrise Palette (Sand White, Ocean Blue, Sunrise Yellow).
- [x] **Core System Design (BE):** Xây dựng các Pattern chuẩn doanh nghiệp (Idempotency, Outbox, Audit Logic, Custom Store Interface).
- [x] **Core Pages (FE):**
  - [x] Tính năng Bento Grid Dashboard (Trang chủ).
  - [x] Dynamic Island (Thanh trạng thái).
  - [x] Trang Trải nghiệm / Bãi Robinson (Immersive Scroll).
  - [x] Đặt phòng The Sanctuary (Tích hợp luồng giá & Combo 3N2D).
  - [x] Hỏi đáp phương pháp Feynman (Tích hợp AI-ready GenUI).
- [x] **Bảo mật & Pháp lý (Compliance):** Tích hợp Edge Middleware cho Nghị định 13 (Quyền riêng tư dữ liệu).
- [x] **AEO/GEO (Search):** Tích hợp Schema Markup JSON-LD cho AI Engines.

## 🟢 Phase 2: Hệ Cơ sở dữ liệu Cốt lõi (Hoàn tất 100%)
*Chuyển đổi từ môi trường giả lập (Memory) sang môi trường thực tế (PostgreSQL).*

- [x] **Provisioning Database:** Thiết lập Cloud Database (Supabase / Vercel Postgres / Neon).
- [x] **Data Migration:** Chạy các script tạo bảng (`db/migrations`) cho Booking, Consent, Outbox, và Audit Log.
- [x] **Postgres Store Integration:** Cắm `postgres-store.ts` vào thay thế `memory-store.ts`.
- [x] **Bảo mật Connection:** Quản lý an toàn connection string qua `.env.local` và Secret Manager.


## 🟢 Phase 3: Kết nối Dữ liệu Động (Hoàn tất 100%)
*Xóa bỏ dữ liệu mượn (Mock Data), kết nối với hơi thở thực tế của đảo Minh Châu.*

- [x] **Thời tiết & Thủy triều:** Tích hợp API (Open-Meteo) để lấy thông số UV, nhiệt độ, độ cao sóng thực tế (Cache 30 phút).
- [x] **Lịch Tàu chạy:** Xây dựng hệ thống quản lý lịch tàu qua Admin UI (`/admin/vessels`) kết nối trực tiếp với Supabase. Component Tàu chạy tự động phản hồi theo thời gian thực.

## 🟢 Phase 4: Quản trị Vận hành (Back-office & CRM) (Hoàn tất 100%)
*Hệ thống công cụ dành cho quản lý và nhân viên vận hành.*

- [x] **Secure Admin Dashboard:** Giao diện Admin với Sidebar Layout, xem danh sách đặt phòng, duyệt/từ chối, bảo vệ bằng `WORKER_DISPATCH_TOKEN`.
- [x] **Pricing Engine CMS:** Giao diện `/admin/pricing` thay đổi giá phòng, kích hoạt "Phụ thu cuối tuần / Lễ tết" theo thời gian thực. Tích hợp `app_settings` PostgreSQL (Key-Value). Giá cập nhật tức thì trên `/booking`.
- [x] **Operations Monitor:** Bảng điều khiển `/admin` theo dõi `OperationalMetrics` (Booking, Outbox Workers, Idempotency Keys).
- [x] **Cron Jobs Setup:** Kích hoạt Vercel Cron (`vercel.json`) tự động gọi `/api/cron/dispatch` mỗi phút. Background Worker giả lập gửi Email qua `console.log` (Email thật triển khai ở Phase 5).

## 🟢 Phase 5: Giao tiếp Khách hàng & Thanh toán (Hoàn tất 100% Core)
*Tự động hóa chăm sóc khách hàng và dòng tiền.*

- [x] **Transactional Email:** Tích hợp Resend/React Email tự động gửi Email xác nhận "Vé lên phi thuyền" khi khách đặt phòng.
- [ ] **SMS/Zalo ZNS (Tạm hoãn):** Gắn API nhắn tin Zalo OA tự động nhắc lịch đi tàu trước 1 ngày cho khách (Chưa có OA doanh nghiệp).
- [x] **Payment Gateway:** Kết nối API VietQR động để sinh QR nhận tiền cọc tự động theo từng mã booking và giá trị động.

## ⚪️ Phase 6: Launching & Đưa vào Vận hành Mạng (Production Release)
*Bước kiểm tra cuối cùng và ra mắt tại tên miền chính thức.*

- [ ] **Performance & SEO Audit:** Quét Lighthouse đạt điểm 95+ (Tốc độ, Khả năng truy cập).
- [ ] **E2E Testing:** Chạy kiểm thử tự động toàn bộ luồng khách hàng (từ xem phòng -> nhập form -> lưu DB thành công).
- [ ] **Domain Mapping:** Trỏ tên miền `binhminh.quangninh.vn` về Vercel (bật HTTPS, HSTS, Security Headers).
- [ ] **Go-live 🚀**

---
*Cập nhật lần cuối: 30/03/2026*

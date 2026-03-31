# Sitemap & Structure: Binh Minh Homestay 2026 (Social-App Model)

Cấu trúc luồng màn hình (Sitemap) được thiết kế lại hoàn toàn theo hướng **Mobile-First Social App**, loại bỏ các cấu trúc website truyền thống để mang lại trải nghiệm giống TikTok/Instagram.

## 1. Dành Khách Hàng (Customer Frontend - "The App")

Được tổ chức xung quanh **Bottom Navigation Bar** (Thanh điều hướng dưới đáy màn hình) gồm 5 tab chính:

### Tab 1: 🏠 Khám Phá (Home Feed) - Trang chủ `(/)`
- **Feed Chính**: Giao diện Vertical Snap-Scrolling (Cuộn dọc toàn màn hình từng video/ảnh).
- **Stories Bar (Trên cùng)**: Danh sách các hình tròn chứa cập nhật nhanh (VD: Lịch Tàu Hôm Nay, Thời tiết râm mát, Thực đơn tối, Bãi Robinson giờ này...).
- **Overlay Actions (Bên phải)**: Các nút tương tác nổi (Thích, Chia sẻ, Trò chuyện với Long Xì, Xem vị trí).
- **Call-to-Action (Dưới cùng)**: Nút "Đặt Phòng Ngay" lớn, luôn hiển thị.

### Tab 2: 🗺️ Trải Nghiệm & Maps `(/explore)`
- **Bản đồ tương tác**: Hiển thị vị trí Homestay bằng pin nổi bật trên đảo Minh Châu.
- **Điểm check-in (Pins)**: Các điểm chụp ảnh đẹp xung quanh (Eo Gió, Bãi Rùa...). Người dùng lướt ngang (Horizontal scroll) các card địa điểm ở dưới đáy để bản đồ tự động di chuyển theo.

### Tab 3: 💬 Long Xì (AI Chatbot) `(/faq)`
- Nút trung tâm to nhất trên thanh điều hướng. Mở ra giao diện như ứng dụng Zalo/Messenger.
- Chat trực tiếp với quản lý AI "Long Xì" (hỗ trợ lịch tàu, phòng ốc, báo giá, hỏi đáp 24/7).

### Tab 4: 🛍️ Đặt Phòng & Dịch Vụ `(/booking)`
- Giao diện dạng "Cửa hàng" (Shop profile).
- **Tab Phòng**: Danh sách các phòng/Căn Phi Thuyền với hiệu ứng swipe ảnh (Carousel).
- **Tab Combo**: Các gói 3N2D, 2N1D hiển thị dưới dạng Voucher card.
- **Giỏ hàng/Checkout**: Quy trình 2 bước mượt mà, trượt từ dưới lên (Bottom Sheet).

### Tab 5: 👤 Của Tôi (Profile & Trips) `(/profile)`
- Quản lý mã đặt phòng (Booking ID).
- Trạng thái thanh toán & Hướng dẫn nhận phòng dành riêng cho khách đã chốt đơn.
- Gửi Feedback/Review sau chuyến đi.

---

## 2. Dành Cho Quản Lý (Staff/Admin Backend)

Định hướng "Low-tech" - Tối giản, không cần học cách dùng.

### Trang Tổng Quan (Dashboard) `(/admin)`
- Giao diện dạng "News Feed" thông báo: Ai vừa đặt phòng mới, ai vừa chuyển khoản, thông báo hủy tàu do bão... (Dạng Notification list).

### Quản Lý Nội Dung Feed & Story `(/admin/content)`
- **Đăng Content Mới**: Giao diện giống up Story Instagram. Chọn ảnh/video, nhập caption, chọn gắn thẻ (Tag) loại phòng hoặc dịch vụ, nhấn "Đăng".

### Lịch Tàu & Giá `(/admin/settings)`
- Nút gạt (Toggles) Bật/Tắt các tuyến tàu.
- Chỉnh sửa giá phòng nhanh bằng cách nhấp đúp vào mức giá (Inline-edit).

### Lịch Đặt Phòng (Bookings) `(/admin/bookings)`
- Bảng Kanban (Cột: Chờ duyệt, Đã cọc, Đang ở, Đã trả phòng) để quản lý khách theo luồng kéo-thả (Drag & Drop) siêu trực quan.

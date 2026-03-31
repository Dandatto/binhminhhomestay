# UX/UI Detailed Specification: Binh Minh Homestay (Social-Liked Pattern)

Tài liệu này là bản đặc tả UI/UX để đội design (Google Stitch) thực thi. Triết lý thiết kế: **"Không làm Website, hãy làm một Social App về nghỉ dưỡng".** Mọi tương tác phải giống với các thói quen hàng ngày của Gen Z/Millennials trên TikTok, Instagram, Zalo.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

- **Mobile-First Tiêu Cực**: Design UI trên kích thước màn hình điện thoại (VD: iPhone 15 Pro) làm chuẩn mực tuyệt đối. Desktop (nếu có) chỉ là màn hình mobile được căn giữa trên nền mờ hoặc layout phân cột giả lập iPad.
- **Full-Screen Media**: Không có khoảng trắng viền biên dư thừa. Hình ảnh / Video phải phủ kín màn hình (Full-bleed 100vh).
- **Thumb-Zone (Vùng ngón cái)**: 100% các nút thao tác chính (Đặt phòng, Gọi điện, Chuyển tab) phải nằm ở 1/3 dưới cùng của màn hình để khách có thể thao tác bằng 1 tay.
- **Dark-Theme Media / Glassmorphism**: Sử dụng overlay đen gradient lên các video/ảnh ở phần đáy và mép phải để làm nổi chữ trắng. Các panel điều khiển dùng hiệu ứng kính mờ (Backdrop-blur bốc đồng).

## 2. Đặc Tả UI/UX Các Màn Hình Chính

### A. Màn Hình Trang Chủ (Home Feed App)
- **Kiến trúc**: Vertical Snap Scrolling (như TikTok "Dành cho bạn").
- **UX Flow**: Khách vuốt lên/xuống để xem các góc tĩnh lặng của Bình Minh Homestay, video quay flycam bãi Robinson, video review dọn phòng.
- **UI Elements**:
    - **Backplate**: 100vh Video/Photo nền. Tự động phát, lặp lại.
    - **Header (Top-Left)**: Vòng tròn Avatar nhỏ, tên "Binh Minh Homestay", kèm badge "Có phòng trống".
    - **Top Bar (Stories)**: Khu vực vuốt ngang hiển thị các Story (tròn) có viền sáng gradient. Khi click vào sẽ mở Fullscreen Story 15 giây.
    - **Action Bar (Bên Phải)**: Xếp dọc từ dưới lên: 
        - Tim (Like/Lưu phòng)
        - Bóng thoại (Bình luận -> Mở Bottom Sheet xem review)
        - Chuyển tiếp (Share cho bạn bè/người yêu)
    - **Bottom Info (Góc trái dưới)**: Caption ngắn gọn (VD: *"Sáng sớm ở Căn Phi Thuyền, mở cửa là biển "*). Bên dưới kèm một thanh âm thanh quay vòng (như đĩa nhạc) thể hiện tiếng sóng biển.
    - **Floating CTA**: Nút "Đặt ngay căn này" dạng kén (Pill shape) siêu nổi bật ghim phía dưới, trôi nhẹ nhẹ.

### B. Màn Hình Long Xì (AI Chat - FAQ)
- **Kiến trúc**: Giao diện Chat quen thuộc như Zalo/Messenger/iMessage.
- **UX Flow**: Khách bấm vào Icon ở Bottom Nav Bar. Bật lên là giao diện đoạn hội thoại có sẵn sự chào hỏi.
- **UI Elements**:
    - **Header**: Tên "Long Xì" kèm dấu tích xanh (Verified) và chấm xanh online. Mũi tên "Back" thay vì nút Home.
    - **Background**: Trắng tinh khiết hoặc xám nhạt (Sand White) để dễ đọc chữ. Không dùng hình nền quá rối.
    - **Chat Bubbles**: 
        - Của Long Xì (Trái): Chữ xám đậm trên nền Bubble màu xám nhạt/trắng, góc viền bo tròn 20px, đuôi nhọn ở dưới cùng bên trái. Có icon mặt quản lý nam đội mũ sát bên cạnh.
        - Của Khách (Phải): Chữ trắng trên nền Bubble màu Xanh Đại Dương (Ocean Blue) hoặc Xanh ngọc.
    - **Trạng thái**: Có hoạt ảnh 3 dấu chấm nhảy múa "Long Xì đang gõ..." khi AI xử lý.
    - **Cụm thao tác nhanh (Quick Replies)**: Các viên thuốc nhỏ (Pill buttons) hiển thị ngay trên thanh nhập text để khách bấm luôn không cần gõ (VD: "Giá phòng?", "Vé Tàu?", "Review đồ ăn").

### C. Màn Hình Đặt Phòng (Booking Shop)
- **Kiến trúc**: E-commerce x Instagram Shop.
- **UX Flow**: Xóa bỏ các form nhập liệu dài dòng. Thay bằng quy trình "Chọn -> Bấm -> Confirm".
- **UI Elements**:
    - **Product Cards**: Các phòng hiển thị dưới dạng Card vuốt dọc, bên trong mỗi card có Swipeable Images (chấm tròn phân trang).
    - Phía dưới ảnh là thông tin: Tên phòng, Tag tiện ích (Kính tràn viền, Cách biển 10m), Giá siêu chuẩn.
    - Nút bấm thêm vào chuyến đi (Add to Trip/Cart).
    - **Bottom Sheet (Giỏ hàng popup)**: Khi ấn "Thanh Toán", một tấm nền vuốt từ dưới lên (Kéo sheet 50% màn hình) hiển thị Bill tổng, ngày check-in/out, khung nhập họ tên/SĐT và Nút Chuyển khoản QR.

### D. Hệ thống Admin (Backend)
- **Kiến trúc**: Task-oriented (Giải quyết việc nhanh gọn).
- **UX Flow**: Giống phần mềm dọn dẹp task (To-do list) hơn là bảng điều khiển (Dashboard) truyền thống.
- **UI Elements**:
    - **Kanban Board cho Bookings**: Giao diện màn hình ngang (Màn hình duy nhất ưu tiên Desktop/Tablet).
        - Cột 1: Có đơn chờ xác nhận tiền cọc. (Card màu đỏ/cam cảnh báo).
        - Cột 2: Đã cọc, chờ tới ngày. (Card màu xám).
        - Cột 3: Khách đang lưu trú. (Card màu xanh lá).
        - Drag & Drop (Kéo thả) card khách hàng từ ô này sang ô kia cực mượt.
    - **Hệ thống Notification / Action Center**: Admin chỉ nhìn vào chuông thông báo: "Long Xi vừa tạo mã Booking #123 nhưng chưa chốt. Bấm để gọi khách".
    - **Upload Content**: Giao diện cực to, "Kéo thả ảnh/video vào đây để lên Feed/Story".

---

## 3. Quy chuẩn Design Tokens cho Google Stitch

- **Radius (Độ Bo Góc)**: Rất lớn. Các Card bo `24px`. Nút bấm bo `999px` (Pill).
- **Shadows (Đổ bóng)**: Rất mềm và rộng (Mô phỏng Soft Light/Ambient). Tránh shadow cứng.
- **Animations (Hoạt ảnh)**: 
    - Nhấn nút (Tap): Scaledown 0.95 (hơi lún nhẹ) như iOS.
    - Chuyển tab: Fade và trượt nhẹ mượt mà (Slide & Fade).
- **Màu Sắc Đại Diện**: Không dùng các màu rực rỡ rẻ tiền. Màu nền nghiêng về xanh biển sâu (Deep Ocean) ban đêm, và vàng Cát (Sand) cho ban ngày. Text chú trọng độ contrast (tương phản) cao. Chữ phải Cực Dễ Đọc.

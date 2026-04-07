---
description: Hướng dẫn sử dụng code-review-graph (CRG) trong dự án Binh Minh 2026
---

# Hướng Dẫn Sử Dụng: Code Review Graph (CRG) Hàng Ngày

Sau khi hệ thống CRG đã được tích hợp đúng nguyên tắc cô lập (tại root project `2026.BinhMinhHomestay`), bạn và AI có thể tận dụng Knowledge Graph để kiểm soát mã nguồn theo các trường hợp sau:

## 1. Dành cho Mạn Lệnh Terminal Của Bạn (Manual Usage)
Bạn chỉ cần nhớ lệnh `make` (chạy tại thư mục gốc của dự án).

### Khi Nào Cần Dùng Gì?

- **Khi chuẩn bị sửa một file cốt lõi (VD: `Navbar.tsx` hay `route.ts`)**
  Dùng để dò "vụ nổ liên đới" (Blast Radius):
  ```bash
  // turbo
  make crg-impact
  ```
  *(CRG sẽ in ra danh sách các components khác và API có nguy cơ bị lỗi nếu bạn sửa sai file này).*

- **Khi vừa code xong và muốn AI cập nhật lại Graph (Ví dụ: sau khi thêm màn hình mới)**
  Bạn cần đồng bộ lại database trước khi nhờ AI dò code (Incremental update tốn < 2 giây):
  ```bash
  // turbo
  make crg-update
  ```

- **Khi tò mò muốn xem tổng quan dự án như thế nào**
  Xem thống kê về các cụm Community (sự ràng buộc) trong code:
  ```bash
  // turbo
  make crg-status
  ```

- **Khi muốn xem biểu đồ mạng lưới giao diện Web**
  Mở bản đồ HTML tương tác trên trình duyệt:
  ```bash
  // turbo
  make crg-map
  ```
  *(Hệ thống sẽ chạy một HTTP server nội bộ tại port 8000 để bạn xem bản đồ).*


## 2. Dành Khi Tương Tác Cùng Trợ Lý AI (Claude/Antigravity)

CRG đã được nhúng vào Claude Desktop thông qua **MCP (Model Context Protocol)**. Khi trò chuyện với AI, bạn có thể truyền thẳng chỉ thị để AI tự móc data từ Graph.

**Các câu lệnh mẫu (Prompts) cực mạnh để bạn thử với AI:**

1. **Phân tích trước khi tái cấu trúc:**
   > *"Sử dụng code-review-graph kiểm tra và vẽ sơ đồ xem nếu tôi thay đổi component `MobileNav.tsx`, thì những trang nào và component nào sẽ bị ảnh hưởng?"*

2. **Tìm hiểu kiến trúc dự án lạ:**
   > *"Chạy code-review-graph để lọc ra tất cả các luồng tương tác dẫn đến `createBooking` trong file `booking-service.ts`. Hãy list ra theo luồng đi từ Frontend đến Backend."*

3. **Áp dụng Design Token (Skill đã cài):**
   > *"Hãy dùng code-review-graph đọc toàn bộ các file liên quan đến component `RoomCatalog` và tự động rà soát dựa trên skill `crg-m3-design-token-review` để xem có chỗ nào bị hardcode màu sắc không."*


## 💡 Lưu ý Vàng để Tránh Lỗi
- **Luôn nhắc AI cập nhật:** Nếu bạn vừa thay một loạt files, nhớ dặn AI *"chạy `make crg-update` trước"* hoặc tự bạn chạy để AI đọc được sơ đồ mới nhất, tránh tình trạng "râu ông nọ cắm cằm bà kia".
- **Không bao giờ cần `pip install` thêm:** Công cụ đã đóng gói gọn gàng bằng `uvx`, cứ gọi `make` là nó chạy. Tránh xa các lệnh cài global.

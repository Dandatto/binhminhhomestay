# Chỉ đạo cho Bộ phận Pháp lý — F-004 Data Sovereignty

Tài liệu này chuyển trực tiếp cho pháp lý xử lý. Chia làm 3 nhóm việc theo người thực hiện.

---

## NHÓM 1 — Dev thực hiện trước Go-Live (chờ lệnh pháp lý xác nhận nội dung)

**Việc 1.1 — Tách consent cross-border ra khỏi consent ND13 hiện có**

Booking form hiện có 1 checkbox consent (ND13 — thu thập dữ liệu). Cần thêm checkbox thứ hai riêng biệt, không thể tích sẵn, với nội dung tham khảo:

> *"Tôi đồng ý để dữ liệu cá nhân của mình (họ tên, số điện thoại, thông tin đặt phòng) được lưu trữ và xử lý trên hệ thống máy chủ đặt tại Hàn Quốc (Supabase Inc.) theo Chính sách Bảo mật của Bình Minh Homestay."*

Pháp lý cần xác nhận chính xác từ ngữ trước khi Dev đưa vào form. Sau khi có từ ngữ chính xác, Dev thêm trường `consent_cross_border: boolean` vào `consent_logs` table và booking API.

**Việc 1.2 — Cập nhật Privacy Policy trên website**

Phải có mục riêng về chuyển dữ liệu ra nước ngoài, ghi rõ:
- Tên bên nhận: Supabase Inc.
- Quốc gia lưu trữ: Hàn Quốc (ap-northeast-2)
- Mục đích: vận hành hệ thống đặt phòng
- Quyền của người dùng: yêu cầu xóa dữ liệu, rút consent

---

## NHÓM 2 — Pháp lý soạn và nộp hồ sơ (trong vòng 30 ngày sau Go-Live)

**Hồ sơ đánh giá tác động chuyển dữ liệu cá nhân ra nước ngoài** theo Điều 25 NĐ 13/2023/NĐ-CP.

Nộp về: **Cục An ninh mạng và phòng chống tội phạm sử dụng công nghệ cao (A05), Bộ Công an.**

Thông tin kỹ thuật pháp lý cần để soạn hồ sơ — Dev cung cấp sẵn:

| Mục hồ sơ | Thông tin thực tế |
|---|---|
| Tổ chức chuyển dữ liệu | Bình Minh Homestay (thông tin đăng ký kinh doanh) |
| Bên nhận dữ liệu ở nước ngoài | Supabase Inc., 970 Trestle Glen Rd, Oakland CA 94610, USA |
| Máy chủ vật lý đặt tại | Hàn Quốc (AWS ap-northeast-2, Seoul) |
| Loại dữ liệu chuyển | Họ tên, số điện thoại, ngày đặt phòng, loại phòng, ghi chú của khách |
| KHÔNG chuyển | CMND/CCCD, địa chỉ nhà, thông tin tài chính chi tiết |
| Mục đích chuyển | Lưu trữ và vận hành hệ thống đặt phòng trực tuyến |
| Cơ chế bảo mật | TLS in-transit, AES-256 at-rest (Supabase mặc định), PgBouncer connection pooling |
| Thời gian lưu trữ | Dữ liệu booking lưu vô thời hạn (cần pháp lý quyết định retention policy) |
| Cơ chế xóa dữ liệu | Hiện có `data_subject_requests` table — Dev đã chuẩn bị sẵn infra |

**Pháp lý cần quyết định thêm:**
- Retention policy: booking data giữ bao lâu? (đề xuất: 3 năm theo Luật Kế toán, sau đó anonymize)
- Có cần DPA (Data Processing Agreement) ký với Supabase không? → Kiểm tra Supabase DPA tại `supabase.com/privacy` — họ có sẵn DPA theo GDPR, pháp lý xem xét có đủ cho VN không.

---

## NHÓM 3 — Quyết định kỹ thuật dài hạn (không urgent, review sau 6 tháng vận hành)

Nếu trong 6 tháng đầu vận hành có bất kỳ tình huống nào dưới đây xảy ra → kích hoạt Phương án C (tách schema):

- Số lượng booking vượt 500 records/tháng (tăng quy mô đáng kể)
- Nhận văn bản từ cơ quan chức năng yêu cầu lưu trữ trong nước
- Supabase thông báo thay đổi region hoặc chính sách

Phương án C đã được thiết kế sẵn trong audit: tách bảng `bookings` + `consent_logs` về PostgreSQL VPS Việt Nam (VNPT/FPT Cloud), giữ các bảng kỹ thuật còn lại trên Supabase. Dev estimate 2–3 tuần khi được lệnh.

---

## Tóm tắt deadline

| Việc | Ai làm | Deadline |
|---|---|---|
| Xác nhận từ ngữ 2 consent cho booking form | Pháp lý | Trước Go-Live |
| Nội dung Privacy Policy (mục cross-border) | Pháp lý | Trước Go-Live |
| Dev đưa consent mới vào form + schema | Dev | Sau khi pháp lý duyệt từ ngữ |
| Nộp hồ sơ NĐ 13/2023 Điều 25 lên A05 | Pháp lý | 30 ngày sau Go-Live |
| Ký DPA với Supabase (nếu cần) | Pháp lý + Owner | 30 ngày sau Go-Live |
| Review retention policy | Pháp lý | Trước Go-Live |

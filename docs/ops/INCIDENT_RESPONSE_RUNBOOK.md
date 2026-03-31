# Incident Response Runbook

## 1. Phân cấp sự cố

- `SEV-1`: rò rỉ dữ liệu nhạy cảm / ngừng hệ thống đặt phòng diện rộng.
- `SEV-2`: lỗi nghiệp vụ lớn (overbooking hàng loạt, API đối tác lỗi kéo dài).
- `SEV-3`: lỗi cục bộ không ảnh hưởng diện rộng.

## 2. Quy trình 0-72 giờ (SEV-1)

1. `0-30 phút`: cô lập thành phần ảnh hưởng, khóa credential nghi ngờ lộ.
2. `30-120 phút`: xác định phạm vi dữ liệu/khách hàng bị ảnh hưởng.
3. `2-8 giờ`: kích hoạt kênh thông báo nội bộ + chuẩn bị thông điệp đối ngoại.
4. `8-24 giờ`: vá lỗi tạm thời, khôi phục dịch vụ tối thiểu.
5. `24-72 giờ`: hoàn thiện báo cáo sự cố, kế hoạch khắc phục dài hạn.

## 3. Kênh fallback vận hành

- Khi hệ thống đặt phòng lỗi: chuyển sang quy trình xác nhận thủ công qua hotline/Zalo OA.
- Khi API tàu/thời tiết lỗi: hiển thị trạng thái "dữ liệu tạm thời không khả dụng" + số hotline hỗ trợ.

## 4. Forensics tối thiểu

- Snapshot log liên quan (application, auth, DB audit).
- Bảo toàn timeline sự kiện.
- Không xóa dấu vết trước khi điều tra xong.

## 5. Hậu kiểm bắt buộc

- Postmortem trong 72 giờ sau khi đóng sự cố.
- Tạo action items, có owner và deadline.

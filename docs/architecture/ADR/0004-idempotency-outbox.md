# ADR-0004: Idempotency Key + Transactional Outbox Pattern

## Status
Accepted

## Context
Nghiệp vụ đặt phòng có rủi ro retry từ client/network và rủi ro lỗi tích hợp OTA/ZNS gây lệch trạng thái.

## Decision
1. Endpoint tạo booking áp dụng idempotency key ở cấp API.
2. Lưu response idempotent để replay đúng kết quả cũ cho request trùng.
3. Dùng transaction aggregate cho `booking + consent + audit + outbox`.
4. Dùng outbox table cho sự kiện nghiệp vụ để worker xử lý bất đồng bộ.
5. Worker retry theo exponential backoff, giới hạn tối đa theo cấu hình.
6. Có maintenance cleanup theo retention để tránh phình dữ liệu vận hành.

## Consequences
- Ưu điểm: giảm booking trùng, tăng độ bền khi upstream lỗi.
- Nhược điểm: tăng số bảng và logic điều phối worker.

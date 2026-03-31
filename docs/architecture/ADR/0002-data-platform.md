# ADR-0002: PostgreSQL as System of Record

## Status
Accepted

## Context
Booking cần tính đúng đắn dữ liệu cao, cần transaction và audit tốt.

## Decision
PostgreSQL làm nguồn dữ liệu chính; Redis chỉ dùng cache/lock ngắn hạn.

## Consequences
- Ưu điểm: ACID, ecosystem tốt, hỗ trợ audit/retention.
- Nhược điểm: cần thiết kế index và migration nghiêm ngặt khi scale.

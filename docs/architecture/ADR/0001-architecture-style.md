# ADR-0001: Modular Monolith + Event-driven Integrations

## Status
Accepted

## Context
Đội ngũ nhỏ, cần tốc độ phát triển cao nhưng vẫn giữ kiểm soát pháp lý/bảo mật.

## Decision
Sử dụng modular monolith cho lõi nghiệp vụ và event-driven cho tích hợp đối tác.

## Consequences
- Ưu điểm: triển khai nhanh, ít overhead hạ tầng.
- Nhược điểm: cần kỷ luật module boundary để tránh coupling.

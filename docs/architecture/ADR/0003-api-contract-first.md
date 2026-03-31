# ADR-0003: Contract-first API with OpenAPI

## Status
Accepted

## Context
Cần đồng bộ nhanh giữa frontend, backend và tích hợp đối tác.

## Decision
Mọi endpoint public/internal phải được định nghĩa trước trong OpenAPI.

## Consequences
- Ưu điểm: giảm hiểu sai giữa team, dễ test contract.
- Nhược điểm: cần kỷ luật cập nhật spec song song code.

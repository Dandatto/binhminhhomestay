# code-review-graph — Binh Minh Homestay 2026
# Chạy từ root project: make crg-build, make crg-update, v.v.
#
# KHÔNG chỉnh sửa CRG_ENV ở đây thành ~/.zshrc — đây là thiết kế có chủ ý:
# env vars được giữ cô lập trong project, không ảnh hưởng hệ thống Mac Air.

# $(HOME) thay vì ~ để đảm bảo expand đúng trong mọi Make version (POSIX-safe)
CRG     := $(HOME)/.local/bin/uvx code-review-graph@2.2.1

# Env vars tối ưu cho chip M4 — thay thế cho .zshrc, project-isolated
CRG_ENV := CRG_MAX_IMPACT_DEPTH=3 CRG_MAX_IMPACT_NODES=1000 CRG_MAX_BFS_DEPTH=20

.PHONY: crg-build crg-update crg-status crg-impact crg-map

## Build graph lần đầu (hoặc rebuild toàn bộ)
crg-build:
	$(CRG_ENV) $(CRG) build

## Cập nhật graph incremental sau mỗi session làm việc (< 2 giây)
crg-update:
	$(CRG_ENV) $(CRG) update

## Xem thống kê graph: số files, nodes, edges, community clusters
crg-status:
	$(CRG) status

## Phân tích impact của các file đã thay đổi (chạy trước khi sửa file quan trọng)
crg-impact:
	$(CRG) detect-changes

## Sinh bản đồ trực quan HTML (tự động mở bằng trình duyệt)
crg-map:
	$(CRG) visualize
	@open .code-review-graph/graph.html 2>/dev/null || echo "Bản đồ đã được tạo tại .code-review-graph/graph.html"


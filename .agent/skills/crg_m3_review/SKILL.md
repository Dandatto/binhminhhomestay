---
name: crg-m3-design-token-review
description: Khi AI nhận được context từ code-review-graph (CRG) về các file .tsx, .css, hoặc .module.css, hãy áp dụng checklist này để kiểm tra tính nhất quán của Material 3 Expressive Design System trước khi đề xuất bất kỳ thay đổi UI nào.
---

# CRG Code Review — M3 Expressive Design Token Checklist

Skill này được kích hoạt tự động khi CRG cung cấp context về các file UI trong `apps/web/`.
Áp dụng cho: `.tsx`, `.css`, `.module.css`, bất kỳ file nào chứa styling logic.

---

## 1. MÀU SẮC — Design Token bắt buộc

**Không được phép:**
- Hardcode màu hex (`#F5A623`, `#1A1A2E`)
- Dùng Tailwind color class tùy tiện (`text-amber-500`, `bg-slate-900`)
- Dùng `rgba()` hoặc `hsl()` trực tiếp trong component

**Phải dùng:**
- CSS Custom Properties từ Design System: `var(--md-sys-color-primary)`, `var(--md-sys-color-surface)`, `var(--md-sys-color-on-surface)`, v.v.
- Hoặc các alias đã được định nghĩa trong `globals.css`: `text-text-primary`, `bg-bg-secondary`, `text-accent`

**Câu hỏi kiểm tra:** Nếu đổi theme (ví dụ sang Dark Mode), màu này có tự động đổi theo không?

---

## 2. HÌNH DẠNG — Shape Token

**Không được phép:**
- `rounded-[12px]`, `border-radius: 12px` hardcode

**Phải dùng shape scale của M3:**
- `rounded-none` → None (shape.none)
- `rounded-sm` hoặc `var(--md-sys-shape-corner-extra-small)` → Extra Small
- `rounded-lg` hoặc `var(--md-sys-shape-corner-medium)` → Medium
- `rounded-[24px]` hoặc `rounded-full` → Large/Full — chỉ dùng cho Pills, FAB, Chips

**Nguyên tắc Binh Minh:** Social-Liked First → ưu tiên `rounded-[24px]` và `rounded-full` cho tap targets.

---

## 3. TYPOGRAPHY — Type Scale

**Không được phép:**
- `text-[13px]`, `font-size: 14px` hardcode
- Mix nhiều font-family khác nhau không thuộc Design System

**Phải dùng:**
- Type scale tokens: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`...
- Font Heading (Playfair Display) chỉ dùng cho: Card Title, Modal Heading, Hero Text
- Font Body (Inter) cho: body text, labels, captions

---

## 4. MOTION & ANIMATION — Duration Token

**Không được phép:**
- `transition-all duration-300` tùy tiện
- `animate-[custom_0.2s_ease]` bịa đặt

**Phải dùng:**
- `duration-200` → Short2 (micro-interactions: hover, press)
- `duration-300` → Medium1 (expand, collapse)
- `duration-500` → Long2 (page transitions, drawer open)
- Easing: `ease-out` cho enter, `ease-in` cho exit

---

## 5. STATE LAYER — Interactive States

Mọi interactive element (`button`, clickable `div`, `Card`) phải có đủ 4 states:

```
Normal → Hover (+8% overlay) → Pressed (+12% overlay) → Disabled (38% opacity)
```

**Kiểm tra:** Component có `hover:bg-*`, `active:bg-*`, `disabled:opacity-*` chưa?

---

## 6. TAP TARGET — Accessibility

**Bắt buộc cho mobile-first:**
- Mọi tap target phải `min-h-[44px]` hoặc `min-h-[48px]`
- Không được `p-1`, `p-2` (quá nhỏ) cho button chính
- Icon-only buttons phải `w-[44px] h-[44px]` tối thiểu

---

## 7. ELEVATION & SURFACE

**Surface tiers của Binh Minh 2026:**
- Level 0: `bg-bg-primary` (background chính)
- Level 1: `bg-bg-secondary/40` + `backdrop-blur` (Card, Sheet)
- Level 2: `bg-bg-secondary/60` + `border border-text-primary/5` (Modal, Overlay)

**Không dùng** `shadow-md`, `shadow-xl` hardcode — dùng glass effect thay cho drop shadow.

---

## Cách dùng trong CRG Review Workflow

Khi CRG xác định một file có blast-radius cao (nhiều component phụ thuộc vào nó):

1. **Đọc context CRG** → biết file đang ảnh hưởng đến component nào
2. **Áp checklist trên** → kiểm tra từ Màu → Hình dạng → Typography → Motion
3. **Ưu tiên sửa** Design Token violations trước khi sửa logic
4. **Báo cáo** theo format: `[FILE] → [VI PHẠM] → [SỬA BẰNG TOKEN]`

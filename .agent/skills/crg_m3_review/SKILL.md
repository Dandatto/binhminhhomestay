---
name: crg-m3-design-token-review
description: Khi AI nhận được context từ code-review-graph (CRG) về các file .tsx, .css, hoặc .module.css, hãy áp dụng checklist này để kiểm tra tính nhất quán của Material 3 Expressive Design System trước khi đề xuất bất kỳ thay đổi UI nào.
---

# CRG Code Review — M3 Expressive Design Token Checklist

Skill này được kích hoạt tự động khi CRG cung cấp context về các file UI trong `apps/web/`.
Áp dụng cho: `.tsx`, `.css`, `.module.css`, bất kỳ file nào chứa styling logic.

> **Nguồn token chuẩn:** Tất cả giá trị số trong checklist này được trích xuất trực tiếp từ
> `material-web-main/tokens/versions/v0_192/` — source code chính thức của Google Material Web
> Components v0.192. Không phỏng đoán, không xấp xỉ.

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

**Nguồn:** `_md-sys-shape.scss` v0.192 — shape scale chuẩn M3:

| M3 Token | Giá trị | Project alias | Dùng cho |
|---|---|---|---|
| `corner-none` | 0px | `rounded-none` | Divider, separator |
| `corner-extra-small` | 4px | `rounded-sm` | Badge, tooltip |
| `corner-small` | 8px | `rounded-md` | Menu item |
| `corner-medium` | 12px | `rounded-button` | Button — alias trong globals.css |
| `corner-large` | 16px | `rounded-input` | Input field — alias trong globals.css |
| `corner-extra-large` | 28px | _(M3 standard card)_ | — |
| `corner-full` | 9999px | `rounded-full` | Pill, chip, FAB |

**Binh Minh brand custom:** `rounded-card` = 24px — nằm giữa corner-large và corner-extra-large, là thiết kế có chủ ý (Social-Liked First). Không phải M3 standard nhưng được phép.

**Không được phép:**
- Hardcode giá trị px trực tiếp: `rounded-[12px]`, `rounded-[16px]`, `border-radius: 12px`
- Dùng class Tailwind mặc định thay thế alias khi alias đã có: `rounded-lg` thay vì `rounded-button`

**Được phép:**
- `rounded-button`, `rounded-card`, `rounded-input` (alias từ globals.css)
- `rounded-full` cho pill/chip
- `rounded-[24px]` chỉ khi `rounded-card` chưa được setup

**Nguyên tắc Binh Minh:** Social-Liked First → ưu tiên `rounded-card` và `rounded-full` cho card và tap targets.

---

## 3. TYPOGRAPHY — Type Scale

**Nguồn:** `_md-sys-typescale.scss` v0.192 — bảng ánh xạ M3 role → Tailwind:

| M3 Role | Size | Line-height | Weight | Tailwind tương đương |
|---|---|---|---|---|
| `display-large` | 57px / 3.5625rem | 64px | Regular | `text-5xl` |
| `headline-large` | 32px / 2rem | 40px | Regular | `text-3xl` |
| `headline-medium` | 28px / 1.75rem | 36px | Regular | `text-2xl` |
| `headline-small` | 24px / 1.5rem | 32px | Regular | `text-2xl` |
| `title-large` | 22px / 1.375rem | 28px | Regular | `text-xl` |
| `title-medium` | 16px / 1rem | 24px | **Medium** | `text-base font-medium` |
| `title-small` | 14px / 0.875rem | 20px | **Medium** | `text-sm font-medium` |
| `body-large` | 16px / 1rem | 24px | Regular | `text-base` |
| `body-medium` | 14px / 0.875rem | 20px | Regular | `text-sm` |
| `body-small` | 12px / 0.75rem | 16px | Regular | `text-xs` |
| `label-large` | 14px / 0.875rem | 20px | **Medium** | `text-sm font-medium` |
| `label-medium` | 12px / 0.75rem | 16px | **Medium** | `text-xs font-medium` |
| `label-small` | 11px / 0.6875rem | 16px | **Medium** | `text-[0.6875rem] font-medium` _(không có Tailwind class chính xác)_ |

**Không được phép:**
- Hardcode pixel: `text-[13px]`, `text-[15px]`, `font-size: 14px`
- `text-[11px]` — nếu cần label-small, dùng `text-[0.6875rem]` hoặc CSS var

**Font families:**
- Font Heading (Playfair Display): Card Title, Modal Heading, Hero Text
- Font Body (Inter): body text, labels, captions, buttons

---

## 4. MOTION & ANIMATION — Duration + Easing Token

**Nguồn:** `_md-sys-motion.scss` v0.192 + `internal/motion/animation.ts`

### Duration scale (giá trị thực từ Google):

| M3 Token | Giá trị | Tailwind | Dùng cho |
|---|---|---|---|
| `duration-short3` | 150ms | `duration-150` | Icon state change, micro-feedback |
| `duration-short4` | 200ms | `duration-200` | Hover, press state layer |
| `duration-medium2` | 300ms | `duration-300` | Expand/collapse, tab switch |
| `duration-medium4` | 400ms | `duration-[400ms]` | Modal enter, sheet appear |
| `duration-long2` | 500ms | `duration-500` | Page transition |

> **Lưu ý:** Tên trong skill cũ bị sai. `duration-200` = Short4, `duration-300` = Medium2 — không phải Short2/Medium1 như ghi trước đây.

### Easing curves (giá trị thực từ Google):

| M3 Easing | Cubic-bezier | Framer Motion Spring | Dùng cho |
|---|---|---|---|
| `emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | `damping:26, stiffness:220` | **ENTER** — drawer vào, modal mở |
| `emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | _(không có Spring tương đương)_ | **EXIT** — drawer ra, modal đóng |
| `emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | — | General transition |
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | — | Simple state change |
| `standard-decelerate` | `cubic-bezier(0, 0, 0, 1)` | — | Enter nhanh |

**Không được phép:**
- `ease-out`, `ease-in` generic cho drawer/sheet — phải dùng cubic-bezier cụ thể
- `transition-all duration-300` không kèm easing
- `animate-[custom_...]` tự bịa easing

**Phải dùng:**
- Drawer/Sheet enter: Framer Motion `type:'spring', damping:26, stiffness:220`
- CSS transition enter: `transition-[...] duration-[400ms] ease-[cubic-bezier(0.05,0.7,0.1,1)]`
- Hover/Press state layer: `transition-opacity duration-[15ms] linear`

---

## 5. STATE LAYER — Interactive States

**Nguồn:** `_md-sys-state.scss` v0.192 — giá trị cứng từ Google:

| State | Opacity | Tailwind suffix | Áp dụng |
|---|---|---|---|
| Hover | **8%** | `/8` | `hover:bg-text-primary/8` |
| Focus | **12%** | `/12` | `focus:ring-2 focus:ring-text-primary/12` |
| Pressed | **12%** | `/12` | `active:bg-text-primary/12` |
| Dragged | **16%** | `/16` | _(drag interactions)_ |
| Disabled | **38%** | `opacity-38` | `disabled:opacity-38` |

**Không được phép:**
- Opacity tùy tiện: `hover:bg-text-primary/10`, `hover:bg-text-primary/20`
- Thay đổi opacity toàn bộ element để simulate state: `hover:opacity-80`, `hover:opacity-90`

**Pattern đúng spec (state layer overlay):**
```tsx
// ✅ Đúng M3 spec — overlay riêng, không ảnh hưởng content bên trong
className="relative overflow-hidden
  after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
  after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms]
  hover:after:bg-text-primary/8
  active:after:bg-text-primary/12
  disabled:opacity-38"
```

**Acceptable approximation** (đang dùng trong project, chấp nhận được):
```tsx
// ⚠️ Approximation — đủ dùng, không strict spec
className="hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-38"
```

Mọi interactive element (`button`, clickable `div`, `Card`) phải có đủ:
```
Normal → Hover (+8% overlay) → Pressed (+12% overlay) → Disabled (38% opacity)
```

---

## 6. TAP TARGET — Accessibility

**Phân cấp tap target (không blanket 48px):**

| Loại element | Visual min-height | Lý do |
|---|---|---|
| Primary CTA (Book, Pay, Submit) | `min-h-[48px]` | Android M3 standard |
| Secondary button, nav item | `min-h-[44px]` | Apple HIG minimum |
| Icon-only button trong danh sách | `w-11 h-11` = 44px | Stepper, action icon |
| Inline text link | _(không áp dụng)_ | — |

**Không được phép:**
- Stepper button `w-8 h-8` (32px) — dưới mức tối thiểu
- Primary CTA `min-h-[40px]` — dưới Android standard
- `p-1`, `p-2` cho button chính không có `min-h` rõ ràng

> **Lý do không blanket 48px:** Touch target ≠ visual size. M3 spec cho phép hit area 48px
> nhưng visual 32px (via padding). Blanket 48px visual sẽ làm phình UI không cần thiết.

---

## 7. ELEVATION & SURFACE

**M3 Elevation = Tonal overlay, KHÔNG phải box-shadow:**

M3 thể hiện chiều sâu bằng cách làm nhạt dần màu surface (`surface-tint`), không phải shadow dp. Binh Minh 2026 ánh xạ điều này thành glass morphism:

| Level | Binh Minh implementation | Dùng cho |
|---|---|---|
| Level 0 | `bg-bg-primary` | Background chính |
| Level 1 | `bg-bg-secondary/40 backdrop-blur border border-text-primary/5` | Card, Sheet |
| Level 2 | `bg-bg-secondary/60 backdrop-blur border border-text-primary/5` | Modal, Overlay |

**Không dùng:**
- `shadow-md`, `shadow-lg`, `shadow-xl` — đây là M2 pattern
- `shadow-elevated` (custom class) — vi phạm M3E
- `drop-shadow-*` trên card/modal chính

**Được phép:**
- `shadow-sm` trên text/icon để tăng contrast trên ảnh (text-shadow, không phải box-shadow)

---

## Cách dùng trong CRG Review Workflow

Khi CRG xác định một file có blast-radius cao (nhiều component phụ thuộc vào nó):

1. **Đọc context CRG** → biết file đang ảnh hưởng đến component nào
2. **Áp checklist trên theo thứ tự ưu tiên:** Màu → State Layer → Shape → Motion → Typography
3. **Ưu tiên sửa** Design Token violations trước khi sửa logic
4. **Báo cáo** theo format: `[FILE] → [VI PHẠM] → [SỬA BẰNG TOKEN]`

### Severity tiers:

| Tier | Ví dụ | Hành động |
|---|---|---|
| 🔴 Critical | Shadow trên sheet, hex color hardcode, state opacity sai | Fix ngay, không merge |
| 🟡 Major | Duration sai M3 scale, font size hardcode | Fix trước khi ship |
| 🟢 Minor | Tailwind generic class thay alias, easing curve xấp xỉ | Fix trong sprint kế |

/**
 * k6 Shared Config — Bình Minh Homestay Load Test Suite
 * -------------------------------------------------------
 * Dùng chung cho tất cả kịch bản.
 * Chạy: BASE_URL=https://staging.binhminh.vn k6 run <script>.js
 */

export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Admin token — lấy từ Vercel Dashboard / .env.local
export const ADMIN_TOKEN = __ENV.ADMIN_TOKEN || "REPLACE_ME";

// Thresholds chuẩn — pass/fail criteria
export const THRESHOLDS_BASELINE = {
  http_req_duration: ["p(95)<800", "p(99)<2000"],
  http_req_failed:   ["rate<0.01"],   // <1% lỗi
};

export const THRESHOLDS_PEAK = {
  http_req_duration: ["p(95)<1500", "p(99)<4000"],
  http_req_failed:   ["rate<0.05"],   // <5% lỗi cho holiday peak
};

// Booking payload mẫu — tạo biến thể để tránh idempotency cache
export function makeBookingPayload(vu, iter) {
  const checkIn = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 ngày tới
  const checkOut = new Date(checkIn.getTime() + 2 * 24 * 3600 * 1000);
  const fmt = (d) => d.toISOString().split("T")[0];

  return JSON.stringify({
    guestName: `Khách Test VU${vu}-${iter}`,
    phone:     `090${String(vu).padStart(4,"0")}${String(iter).padStart(4,"0")}`,
    email:     `test.vu${vu}.iter${iter}@binhminh-test.com`,
    checkInDate:  fmt(checkIn),
    checkOutDate: fmt(checkOut),
    roomType:  "Căn Phi Thuyền 1 Giường",
    note:      "k6 load test — xóa sau khi test",
    consentGiven:    true,
    consentVersion:  "policy-2026-03-01",
  });
}

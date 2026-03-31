/**
 * SCENARIO 1 — BASELINE
 * Ngày thường mùa thấp (Oct–Nov). Mục tiêu: xác nhận hệ thống ổn định ở tải bình thường.
 *
 * Chạy: BASE_URL=https://staging.vercel.app k6 run 01_baseline.js
 * Thời gian: ~12 phút
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";
import { BASE_URL, THRESHOLDS_BASELINE, makeBookingPayload } from "./00_config.js";

// Custom metrics
const bookingDuration = new Trend("booking_duration_ms");
const bookingErrors   = new Counter("booking_errors");

export const options = {
  stages: [
    { duration: "2m",  target: 10  }, // ramp-up
    { duration: "8m",  target: 10  }, // steady state
    { duration: "2m",  target: 0   }, // ramp-down
  ],
  thresholds: THRESHOLDS_BASELINE,
};

export default function () {
  const vu   = __VU;
  const iter = __ITER;
  const headers = { "Content-Type": "application/json" };

  // 1. Trang chủ — kiểm tra SSG/SSR performance
  const home = http.get(`${BASE_URL}/`, { tags: { name: "homepage" } });
  check(home, {
    "homepage 200":           (r) => r.status === 200,
    "homepage TTFB < 800ms":  (r) => r.timings.waiting < 800,
  });

  // 2. Pricing API — kiểm tra cache 60s
  const pricing = http.get(`${BASE_URL}/api/v1/pricing`, { tags: { name: "pricing" } });
  check(pricing, {
    "pricing 200":    (r) => r.status === 200,
    "pricing < 300ms":(r) => r.timings.duration < 300,
  });

  // 3. Vessel schedule
  const vessels = http.get(`${BASE_URL}/api/v1/vessels`, { tags: { name: "vessels" } });
  check(vessels, { "vessels 200": (r) => r.status === 200 });

  // 4. Booking flow (mỗi VU tạo booking với payload unique)
  if (iter % 3 === 0) { // 1/3 users đặt phòng
    const start = Date.now();
    const booking = http.post(
      `${BASE_URL}/api/booking`,
      makeBookingPayload(vu, iter),
      { headers, tags: { name: "create_booking" } }
    );
    bookingDuration.add(Date.now() - start);

    const ok = check(booking, {
      "booking 202":          (r) => r.status === 202,
      "booking has bookingId":(r) => !!r.json("bookingId"),
      "booking < 2000ms":     (r) => r.timings.duration < 2000,
    });
    if (!ok) bookingErrors.add(1);
  }

  sleep(2 + Math.random() * 3); // 2–5s think time (realistic user)
}

export function handleSummary(data) {
  return {
    "results/01_baseline_summary.json": JSON.stringify(data, null, 2),
  };
}

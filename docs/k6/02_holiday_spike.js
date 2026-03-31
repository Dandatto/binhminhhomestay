/**
 * SCENARIO 2 — HOLIDAY SPIKE
 * Mô phỏng 30/4, 2/9 — 2 giờ đầu khi mở booking mùa hè.
 * Spike đột ngột từ 0 → 300 users trong 3 phút, giữ 15 phút, tụt nhanh.
 *
 * Chạy: BASE_URL=https://staging.vercel.app k6 run 02_holiday_spike.js
 * Thời gian: ~25 phút
 * Mục tiêu: tìm điểm DB connection exhaustion và cold start lag
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import { BASE_URL, THRESHOLDS_PEAK, makeBookingPayload } from "./00_config.js";

const bookingSuccessRate = new Rate("booking_success_rate");
const dbErrorCount       = new Counter("db_errors");
const coldStartCount     = new Counter("cold_starts");

export const options = {
  stages: [
    { duration: "3m",  target: 300 }, // spike nhanh — mô phỏng viral moment
    { duration: "15m", target: 300 }, // duy trì — peak holiday
    { duration: "5m",  target: 50  }, // giảm dần
    { duration: "2m",  target: 0   },
  ],
  thresholds: {
    ...THRESHOLDS_PEAK,
    "booking_success_rate": ["rate>0.95"],  // >95% booking phải thành công
    "http_req_duration{name:create_booking}": ["p(99)<5000"],
  },
};

export default function () {
  const vu   = __VU;
  const iter = __ITER;

  // Detect cold start (TTFB > 3s là dấu hiệu serverless cold start)
  const home = http.get(`${BASE_URL}/`, { tags: { name: "homepage" } });
  if (home.timings.waiting > 3000) coldStartCount.add(1);

  check(home, {
    "homepage OK":           (r) => r.status === 200,
    "no 5xx on homepage":    (r) => r.status < 500,
  });

  // Simulate peak booking behavior: 70% users trực tiếp đặt phòng
  if (Math.random() < 0.7) {
    const booking = http.post(
      `${BASE_URL}/api/booking`,
      makeBookingPayload(vu, iter),
      {
        headers: { "Content-Type": "application/json" },
        tags: { name: "create_booking" },
        timeout: "10s",
      }
    );

    const success = check(booking, {
      "booking 202":             (r) => r.status === 202,
      "booking not 429":         (r) => r.status !== 429, // rate limit chưa có
      "booking not 500":         (r) => r.status !== 500,
      "booking not 503":         (r) => r.status !== 503,
    });

    bookingSuccessRate.add(success ? 1 : 0);

    // Track DB errors specifically
    if (booking.status === 500) {
      const body = booking.json();
      if (body && body.error && body.error.toLowerCase().includes("connection")) {
        dbErrorCount.add(1);
      }
    }
  }

  // Pricing check (30% users browse pricing)
  if (Math.random() < 0.3) {
    const p = http.get(`${BASE_URL}/api/v1/pricing`, { tags: { name: "pricing" } });
    check(p, { "pricing cached fast": (r) => r.timings.duration < 200 });
  }

  sleep(0.5 + Math.random()); // Holiday peak: impatient users, short think time
}

export function handleSummary(data) {
  return {
    "results/02_holiday_spike_summary.json": JSON.stringify(data, null, 2),
  };
}

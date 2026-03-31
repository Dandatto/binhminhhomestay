/**
 * SCENARIO 5 — BOT ATTACK / INVENTORY LOCK
 * ⚠️  CHẠY KịCH BẢN NÀY SAU KHI ĐÃ IMPLEMENT UPSTASH RATE LIMITING (F-005)
 * KHÔNG chạy scenario này trước khi rate limiting active.
 *
 * Mô phỏng: bot cạnh tranh không lành mạnh gửi flood booking
 * để khóa hết phòng dịp Tết mà không đặt cọc thật.
 * Mục tiêu: xác nhận rate limiter chặn đúng (429), không sập hệ thống.
 *
 * Chạy: BASE_URL=https://staging.vercel.app k6 run 05_bot_attack.js
 */

import http from "k6/http";
import { check } from "k6";
import { Counter, Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const rateLimitedCount = new Counter("bot_rate_limited_429");
const blockedRate      = new Rate("bot_blocked_rate");
const successRate      = new Rate("bot_leaked_through_rate");

export const options = {
  // Bot: 500 VU, không nghỉ, gửi liên tục
  vus:      500,
  duration: "2m",
  thresholds: {
    // Rate limiter phải chặn >95% requests từ cùng IP
    "bot_blocked_rate":      ["rate>0.90"],
    // Tối đa 5% requests lọt qua rate limiter
    "bot_leaked_through_rate": ["rate<0.10"],
    // Hệ thống không được sập — 5xx phải gần 0
    "http_req_failed": ["rate<0.01"],
  },
};

export default function () {
  // Bot dùng cùng payload — không có idempotency key → mỗi request là booking mới
  const payload = JSON.stringify({
    guestName:      "BOT ATTACK TEST",
    phone:          `0901234567`,  // cùng số điện thoại
    checkInDate:    "2027-02-05",  // Tết Đinh Mùi — mùa cao điểm
    checkOutDate:   "2027-02-08",
    roomType:       "Căn Phi Thuyền 1 Giường",
    consentGiven:   true,
    consentVersion: "policy-2026-03-01",
  });

  const res = http.post(`${BASE_URL}/api/booking`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: "5s",
  });

  if (res.status === 429) {
    rateLimitedCount.add(1);
    blockedRate.add(1);
    successRate.add(0);
  } else if (res.status === 202) {
    blockedRate.add(0);
    successRate.add(1);
    console.log(`⚠️  Bot request leaked through! bookingId: ${res.json("bookingId")}`);
  } else {
    blockedRate.add(0);
    successRate.add(0);
  }
  // Không sleep — bot gửi tối đa tốc độ
}

export function handleSummary(data) {
  const blocked  = data.metrics["bot_rate_limited_429"]?.values?.count ?? 0;
  const leaked   = data.metrics["http_req_duration"]?.values?.count ?? 0;
  const duration = data.state?.testRunDurationMs ?? 0;

  console.log("\n" + "=".repeat(60));
  console.log("BOT ATTACK TEST RESULT");
  console.log(`  Requests bị chặn (429): ${blocked}`);
  console.log(`  Duration: ${Math.round(duration / 1000)}s`);
  console.log("=".repeat(60) + "\n");

  return {
    "results/05_bot_attack_summary.json": JSON.stringify(data, null, 2),
  };
}

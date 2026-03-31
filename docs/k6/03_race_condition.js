/**
 * SCENARIO 3 — RACE CONDITION (DOUBLE-BOOKING)
 * Kịch bản khoa học nhất và quan trọng nhất.
 * 50 VUs đồng thời gửi booking cho CÙNG phòng, CÙNG ngày.
 * Mục tiêu: kiểm tra có xảy ra double-booking không (PC-003).
 *
 * Chạy: BASE_URL=https://staging.vercel.app k6 run 03_race_condition.js
 * Sau khi chạy: SELECT count(*), room_type, check_in_date FROM bookings
 *               WHERE check_in_date = '2026-05-15' GROUP BY room_type, check_in_date;
 * Kết quả mong đợi: chỉ 1 booking CONFIRMED, còn lại FAILED/bị reject
 * Kết quả nguy hiểm: > 1 booking CONFIRMED cho cùng phòng/ngày
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL    = __ENV.BASE_URL || "http://localhost:3000";
const TARGET_DATE = "2026-05-15"; // ngày cố định để detect collision

const successCount  = new Counter("race_booking_success");
const conflictCount = new Counter("race_booking_conflict");
const errorCount    = new Counter("race_booking_error");

export const options = {
  // Tất cả VU bắt đầu đồng thời — không ramp-up
  vus:      50,
  duration: "30s",
  thresholds: {
    // Kịch bản lý tưởng: hầu hết bị reject (conflict)
    // Nếu success_rate > 2%, có vấn đề về double-booking
    "race_booking_success": ["count<3"],
  },
};

export default function () {
  // Tất cả request đều dùng cùng room_type + check_in_date
  const payload = JSON.stringify({
    guestName:      `Concurrent User ${__VU}`,
    phone:          `09012345${String(__VU).padStart(2, "0")}`,
    checkInDate:    TARGET_DATE,
    checkOutDate:   "2026-05-17",
    roomType:       "Căn Phi Thuyền 1 Giường", // cùng phòng
    consentGiven:   true,
    consentVersion: "policy-2026-03-01",
    note:           `RACE CONDITION TEST — VU ${__VU}`,
  });

  const res = http.post(`${BASE_URL}/api/booking`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: "15s",
  });

  if (res.status === 202) {
    successCount.add(1);
    console.log(`⚠️  VU ${__VU} GOT 202 — bookingId: ${res.json("bookingId")}`);
  } else if (res.status === 409) {
    conflictCount.add(1);
  } else {
    errorCount.add(1);
    console.log(`VU ${__VU} got ${res.status}: ${res.body}`);
  }

  // Không sleep — chúng ta muốn tối đa concurrency
}

export function handleSummary(data) {
  const success  = data.metrics["race_booking_success"]?.values?.count  ?? 0;
  const conflict = data.metrics["race_booking_conflict"]?.values?.count ?? 0;

  const verdict = success <= 1
    ? "✅ PASS — Tối đa 1 booking được tạo (double-booking không xảy ra)"
    : `🔴 FAIL — ${success} bookings được tạo cho cùng phòng/ngày! DOUBLE-BOOKING CONFIRMED.`;

  console.log("\n" + "=".repeat(60));
  console.log("RACE CONDITION TEST RESULT");
  console.log(`  Bookings thành công (202): ${success}`);
  console.log(`  Bookings bị reject (409):  ${conflict}`);
  console.log(`  VERDICT: ${verdict}`);
  console.log("=".repeat(60));
  console.log("\n📋 Sau khi chạy, verify bằng SQL:");
  console.log(`  SELECT id, booking_code, status, created_at`);
  console.log(`  FROM bookings`);
  console.log(`  WHERE check_in_date = '${TARGET_DATE}'`);
  console.log(`  AND room_type = 'Căn Phi Thuyền 1 Giường'`);
  console.log(`  ORDER BY created_at;\n`);

  return {
    "results/03_race_condition_summary.json": JSON.stringify(data, null, 2),
  };
}

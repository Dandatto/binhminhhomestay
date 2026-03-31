/**
 * SCENARIO 4 — CRON + BOOKING CONTENTION
 * Mô phỏng Vercel Cron gọi /api/cron/dispatch mỗi 60s
 * trong khi booking traffic đang cao.
 * Mục tiêu: xem outbox queue có tắc nghẽn không, DB có deadlock không.
 *
 * Chạy: BASE_URL=https://staging.vercel.app ADMIN_TOKEN=xxx k6 run 04_cron_contention.js
 * Thời gian: ~10 phút
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL    = __ENV.BASE_URL    || "http://localhost:3000";
const ADMIN_TOKEN = __ENV.ADMIN_TOKEN || "REPLACE_WITH_REAL_TOKEN";

const outboxErrors  = new Counter("outbox_dispatch_errors");
const bookingErrors = new Counter("booking_during_cron_errors");

export const options = {
  scenarios: {
    // Luồng 1: Booking traffic liên tục (100 users)
    booking_traffic: {
      executor:  "constant-vus",
      vus:       100,
      duration:  "10m",
      tags:      { scenario: "booking" },
    },
    // Luồng 2: Cron dispatch mỗi 60s (1 "VU" giả lập scheduler)
    cron_dispatch: {
      executor:        "constant-arrival-rate",
      rate:            1,
      timeUnit:        "60s",     // 1 request mỗi 60 giây
      duration:        "10m",
      preAllocatedVUs: 1,
      maxVUs:          2,
      tags:            { scenario: "cron" },
    },
  },
  thresholds: {
    "http_req_failed{scenario:booking}": ["rate<0.05"],
    "http_req_duration{scenario:booking}": ["p(95)<2000"],
    "outbox_dispatch_errors": ["count<5"],
  },
};

export default function () {
  const scenario = __ENV.K6_SCENARIO_NAME || "booking_traffic";

  if (scenario === "cron_dispatch") {
    // Giả lập Vercel Cron gọi internal dispatch
    const res = http.post(
      `${BASE_URL}/api/internal/queue/dispatch`,
      null,
      {
        headers: {
          "x-worker-token": ADMIN_TOKEN,
          "x-request-id":   `cron-${Date.now()}`,
        },
        tags: { name: "cron_dispatch" },
      }
    );

    const ok = check(res, {
      "cron dispatch 200": (r) => r.status === 200,
      "no deadlock error": (r) => !r.body?.includes("deadlock"),
    });
    if (!ok) outboxErrors.add(1);

    // Log outbox depth sau mỗi dispatch
    if (res.status === 200) {
      const body = res.json();
      console.log(`Cron dispatch: processed=${body.processed}, failed=${body.failed}, pending=${body.pending}`);
    }

  } else {
    // Booking traffic thông thường
    const payload = JSON.stringify({
      guestName:      `Cron Test User ${__VU}-${__ITER}`,
      phone:          `091${String(__VU).padStart(4,"0")}${String(__ITER % 1000).padStart(3,"0")}`,
      checkInDate:    "2026-08-10",
      checkOutDate:   "2026-08-12",
      roomType:       "Căn Homestay 2 Giường",
      consentGiven:   true,
      consentVersion: "policy-2026-03-01",
    });

    const res = http.post(`${BASE_URL}/api/booking`, payload, {
      headers: { "Content-Type": "application/json" },
      tags:    { name: "booking_during_cron" },
    });

    const ok = check(res, {
      "booking not 500": (r) => r.status !== 500,
      "booking not 503": (r) => r.status !== 503,
    });
    if (!ok) bookingErrors.add(1);

    sleep(1 + Math.random() * 2);
  }
}

export function handleSummary(data) {
  return {
    "results/04_cron_contention_summary.json": JSON.stringify(data, null, 2),
  };
}

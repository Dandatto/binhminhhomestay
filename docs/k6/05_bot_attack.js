import http from 'k6/http';
import { check, sleep } from 'k6';

// 50 VUs x 30s = ~15,000 requests from a SINGLE IP
// Since limit is 5 req / min / IP, 14,995 requests should be blocked.
export const options = {
  scenarios: {
    booking_flood: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30s',
      exec: 'botBooking',
    },
    chat_flood: {
      executor: 'constant-vus',
      vus: 10,
      duration: '10s',
      exec: 'botChat',
      startTime: '30s',
    }
  },
  thresholds: {
    // For booking, we expect a massive number of 429s
    'http_req_failed{scenario:booking_flood}': ['rate>0.95'], 
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function botBooking() {
  const payload = JSON.stringify({
    roomType: 'ROBINSON_TENT',
    checkInDate: '2026-10-10',
    checkOutDate: '2026-10-12',
    guestName: 'Bot Attack',
    guestEmail: 'bot@example.com',
    guestPhone: '0901234567',
    idempotencyKey: `bot-${__VU}-${__ITER}`
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/api/booking`, payload, params);

  // We should see a few 202s initially, then straight 429s
  check(res, {
    'is 429 Too Many Requests': (r) => r.status === 429,
    'is 202 Accepted': (r) => r.status === 202,
  });

  // Zero sleep to mimic aggressive volumetric flood
}

export function botChat() {
  const payload = JSON.stringify({
    messages: [{ role: 'user', content: 'Hello, are you real?' }]
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/api/chat`, payload, params);

  // We should see a 200 OK with the graceful degradation fake stream
  check(res, {
    'is 200 OK': (r) => r.status === 200,
    'has fake stream text': (r) => r.body && r.body.includes('Hệ thống đang quá tải'),
  });
}

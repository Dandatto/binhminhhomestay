#!/usr/bin/env node

const baseUrl = process.env.INTEGRATION_BASE_URL || "http://localhost:3000";
const workerToken = process.env.WORKER_DISPATCH_TOKEN;

if (!workerToken) {
  console.error("[FAIL] WORKER_DISPATCH_TOKEN is required");
  process.exit(1);
}

async function request(method, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-request-id": `it-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const key = `idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    guestName: "Integration Test",
    phone: "0900000000",
    checkInDate: "2026-04-10",
    checkOutDate: "2026-04-12",
    roomType: "DELUXE",
    note: "integration-smoke",
    consentGiven: true,
    consentVersion: "policy-2026-03-01"
  };

  const first = await request("POST", "/api/v1/bookings", payload, { "idempotency-key": key });
  assert(first.status === 202, `Expected first booking status 202, got ${first.status}`);
  assert(first.data?.bookingId, "First booking missing bookingId");
  assert(first.data?.replayed === false, "First booking should not be replayed");

  const second = await request("POST", "/api/v1/bookings", payload, { "idempotency-key": key });
  assert(second.status === 202, `Expected replay booking status 202, got ${second.status}`);
  assert(second.data?.bookingId === first.data.bookingId, "Replay bookingId mismatch");
  assert(second.data?.replayed === true, "Replay flag should be true");

  const conflictPayload = { ...payload, note: "different-payload" };
  const conflict = await request("POST", "/api/v1/bookings", conflictPayload, { "idempotency-key": key });
  assert(conflict.status === 409, `Expected idempotency conflict 409, got ${conflict.status}`);

  const unauthorizedDispatch = await request("POST", "/api/internal/queue/dispatch", { reason: "unauthorized-check" }, { "x-worker-token": "invalid" });
  assert(unauthorizedDispatch.status === 401, `Expected unauthorized dispatch 401, got ${unauthorizedDispatch.status}`);

  const dispatch = await request("POST", "/api/internal/queue/dispatch", { reason: "integration-smoke" }, { "x-worker-token": workerToken });
  assert(dispatch.status === 200, `Expected dispatch 200, got ${dispatch.status}`);

  console.log("[PASS] integration-smoke");
}

main().catch((error) => {
  console.error("[FAIL] integration-smoke:", error.message);
  process.exit(1);
});

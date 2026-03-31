#!/usr/bin/env node

const { Pool } = require("pg");

const baseUrl = process.env.INTEGRATION_BASE_URL || "http://localhost:3000";
const databaseUrl = process.env.DATABASE_URL;
const workerToken = process.env.WORKER_DISPATCH_TOKEN;
const outboxMaxAttempts = Number.parseInt(process.env.OUTBOX_MAX_ATTEMPTS || "5", 10);

if (!databaseUrl) {
  console.error("[FAIL] DATABASE_URL is required");
  process.exit(1);
}

if (!workerToken) {
  console.error("[FAIL] WORKER_DISPATCH_TOKEN is required");
  process.exit(1);
}

if (!Number.isInteger(outboxMaxAttempts) || outboxMaxAttempts <= 0) {
  console.error("[FAIL] OUTBOX_MAX_ATTEMPTS must be a positive integer");
  process.exit(1);
}

async function request(method, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-request-id": `it-pg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
  const pool = new Pool({ connectionString: databaseUrl, max: 2 });
  let bookingId = null;
  let failingId = null;
  try {
    const key = `idem-pg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      guestName: "PG Integration Test",
      phone: "0911111111",
      checkInDate: "2026-05-10",
      checkOutDate: "2026-05-12",
      roomType: "DELUXE",
      note: "integration-postgres",
      consentGiven: true,
      consentVersion: "policy-2026-03-01"
    };

    const first = await request("POST", "/api/v1/bookings", payload, { "idempotency-key": key });
    assert(first.status === 202, `Expected first booking status 202, got ${first.status}`);
    assert(first.data?.bookingId, "Missing bookingId from first response");

    bookingId = first.data.bookingId;

    const bookingRow = await pool.query("select id, booking_code, status from bookings where id = $1", [bookingId]);
    assert(bookingRow.rowCount === 1, "Booking row not found");

    const consentRow = await pool.query("select id from consent_logs where subject_type = 'BOOKING' and subject_ref = $1", [bookingId]);
    assert(consentRow.rowCount === 1, "Consent row not found");

    const auditRow = await pool.query("select id from audit_events where entity_type = 'BOOKING' and entity_ref = $1", [bookingId]);
    assert(auditRow.rowCount >= 1, "Audit row not found");

    const outboxRow = await pool.query("select id, status from outbox_events where payload->>'bookingId' = $1 order by created_at desc limit 1", [bookingId]);
    assert(outboxRow.rowCount === 1, "Outbox row not found for booking");

    const second = await request("POST", "/api/v1/bookings", payload, { "idempotency-key": key });
    assert(second.status === 202, `Expected replay status 202, got ${second.status}`);
    assert(second.data?.bookingId === bookingId, "Replay booking mismatch");
    assert(second.data?.replayed === true, "Replay flag should be true");

    const conflictPayload = { ...payload, note: "changed-note" };
    const conflict = await request("POST", "/api/v1/bookings", conflictPayload, { "idempotency-key": key });
    assert(conflict.status === 409, `Expected idempotency conflict 409, got ${conflict.status}`);

    const dispatch = await request("POST", "/api/internal/queue/dispatch", { reason: "integration-postgres" }, { "x-worker-token": workerToken });
    assert(dispatch.status === 200, `Expected dispatch status 200, got ${dispatch.status}`);

    const outboxDone = await pool.query(
      "select status from outbox_events where payload->>'bookingId' = $1 order by created_at desc limit 1",
      [bookingId]
    );
    assert(outboxDone.rows[0]?.status === "DONE", `Expected booking outbox status DONE, got ${outboxDone.rows[0]?.status}`);

    // Force a failing outbox event to validate retry scheduling.
    const failingEvent = await pool.query(
      "insert into outbox_events(event_type, payload, status, attempts, available_at) values ('UNKNOWN_EVENT', $1::jsonb, 'PENDING', 0, now()) returning id",
      [JSON.stringify({ source: "integration-postgres" })]
    );
    failingId = failingEvent.rows[0].id;

    const dispatchFail = await request("POST", "/api/internal/queue/dispatch", { reason: "integration-postgres-fail" }, { "x-worker-token": workerToken });
    assert(dispatchFail.status === 200, `Expected dispatch fail cycle status 200, got ${dispatchFail.status}`);

    const retryState = await pool.query("select status, attempts, available_at, last_error from outbox_events where id = $1", [failingId]);
    assert(retryState.rowCount === 1, "Failing event missing after dispatch");
    assert(retryState.rows[0].status === "PENDING", `Expected failing event to be rescheduled as PENDING, got ${retryState.rows[0].status}`);
    assert(Number(retryState.rows[0].attempts) >= 1, "Expected attempts >= 1 after failing dispatch");
    assert(retryState.rows[0].last_error, "Expected last_error for failing event");

    // Drive event to terminal FAILED state by placing it at max-1 attempts and dispatching once more.
    await pool.query(
      "update outbox_events set attempts = $2, status = 'PENDING', available_at = now() where id = $1",
      [failingId, Math.max(0, outboxMaxAttempts - 1)]
    );

    const dispatchTerminal = await request("POST", "/api/internal/queue/dispatch", { reason: "integration-postgres-terminal" }, { "x-worker-token": workerToken });
    assert(dispatchTerminal.status === 200, `Expected terminal dispatch status 200, got ${dispatchTerminal.status}`);

    const terminalState = await pool.query("select status, attempts from outbox_events where id = $1", [failingId]);
    assert(terminalState.rows[0].status === "FAILED", `Expected terminal status FAILED, got ${terminalState.rows[0].status}`);

    console.log("[PASS] integration-postgres");
  } finally {
    if (failingId) {
      await pool.query("delete from outbox_events where id = $1", [failingId]).catch(() => undefined);
    }

    if (bookingId) {
      await pool.query("delete from outbox_events where payload->>'bookingId' = $1", [bookingId]).catch(() => undefined);
      await pool.query("delete from audit_events where entity_type = 'BOOKING' and entity_ref = $1", [bookingId]).catch(() => undefined);
      await pool.query("delete from consent_logs where subject_type = 'BOOKING' and subject_ref = $1", [bookingId]).catch(() => undefined);
      await pool.query("delete from bookings where id = $1", [bookingId]).catch(() => undefined);
    }

    await pool.end();
  }
}

main().catch((error) => {
  console.error("[FAIL] integration-postgres:", error.message);
  process.exit(1);
});

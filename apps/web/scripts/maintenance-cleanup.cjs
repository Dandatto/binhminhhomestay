#!/usr/bin/env node

const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[FAIL] DATABASE_URL is required");
  process.exit(1);
}

const IDEMPOTENCY_RETENTION_DAYS = Number.parseInt(process.env.IDEMPOTENCY_RETENTION_DAYS || "2", 10);
const OUTBOX_DONE_RETENTION_DAYS = Number.parseInt(process.env.OUTBOX_DONE_RETENTION_DAYS || "7", 10);
const OUTBOX_FAILED_RETENTION_DAYS = Number.parseInt(process.env.OUTBOX_FAILED_RETENTION_DAYS || "30", 10);

function isValidPositiveInt(value) {
  return Number.isInteger(value) && value > 0;
}

if (!isValidPositiveInt(IDEMPOTENCY_RETENTION_DAYS) || !isValidPositiveInt(OUTBOX_DONE_RETENTION_DAYS) || !isValidPositiveInt(OUTBOX_FAILED_RETENTION_DAYS)) {
  console.error("[FAIL] Retention env vars must be positive integers");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 2 });
  const client = await pool.connect();

  try {
    await client.query("begin");

    // Single-run lock to avoid concurrent cleanup jobs.
    const lock = await client.query("select pg_try_advisory_xact_lock(8291451) as acquired");
    if (!lock.rows[0]?.acquired) {
      throw new Error("Another cleanup job is running");
    }

    const expiredIdempotency = await client.query(
      `
      delete from idempotency_keys
      where expires_at < now() - ($1::text || ' days')::interval
        and status in ('COMPLETED','FAILED')
      `,
      [IDEMPOTENCY_RETENTION_DAYS]
    );

    const doneOutbox = await client.query(
      `
      delete from outbox_events
      where status = 'DONE'
        and updated_at < now() - ($1::text || ' days')::interval
      `,
      [OUTBOX_DONE_RETENTION_DAYS]
    );

    const failedOutbox = await client.query(
      `
      delete from outbox_events
      where status = 'FAILED'
        and updated_at < now() - ($1::text || ' days')::interval
      `,
      [OUTBOX_FAILED_RETENTION_DAYS]
    );

    await client.query("commit");

    console.log(
      JSON.stringify(
        {
          status: "ok",
          deleted: {
            idempotency: expiredIdempotency.rowCount || 0,
            outboxDone: doneOutbox.rowCount || 0,
            outboxFailed: failedOutbox.rowCount || 0
          }
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query("rollback");
    console.error("[FAIL] Cleanup error:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[FAIL] Fatal cleanup error:", error.message);
  process.exit(1);
});

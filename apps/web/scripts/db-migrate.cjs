#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[FAIL] DATABASE_URL is required");
  process.exit(1);
}

const migrationsDir = path.join(__dirname, "..", "db", "migrations");

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists schema_migrations (
      id bigserial primary key,
      version text not null unique,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getAppliedVersions(client) {
  const result = await client.query(`select version, checksum from schema_migrations`);
  return new Map(result.rows.map((row) => [row.version, row.checksum]));
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 2 });
  const client = await pool.connect();

  try {
    // Protect against concurrent migration runs.
    const lock = await client.query(`select pg_try_advisory_lock(8291450) as acquired`);
    if (!lock.rows[0]?.acquired) {
      throw new Error("Another migration process is already running");
    }

    await ensureMigrationsTable(client);
    const applied = await getAppliedVersions(client);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, "utf8");
      const checksum = sha256(sql);

      if (applied.has(file)) {
        const expected = applied.get(file);
        if (expected !== checksum) {
          throw new Error(`Checksum mismatch for applied migration ${file}`);
        }
        console.log(`[SKIP] ${file}`);
        continue;
      }

      console.log(`[APPLY] ${file}`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query(`insert into schema_migrations(version, checksum) values ($1, $2)`, [file, checksum]);
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }

    console.log("[PASS] Migrations completed");
  } finally {
    await client.query(`select pg_advisory_unlock(8291450)`).catch(() => undefined);
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[FAIL] Migration error:", error.message);
  process.exit(1);
});

#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "docs/architecture/README.md"
  "docs/architecture/SYSTEM_ARCHITECTURE.md"
  "docs/architecture/ADR/0001-architecture-style.md"
  "docs/architecture/ADR/0002-data-platform.md"
  "docs/architecture/ADR/0003-api-contract-first.md"
  "docs/architecture/ADR/0004-idempotency-outbox.md"
  "docs/architecture/ADR/0005-operational-metrics-endpoint.md"
  "docs/architecture/API/openapi.yaml"
  "docs/architecture/DATA/postgresql_schema.sql"
  "docs/architecture/SECURITY/THREAT_MODEL.md"
  "docs/architecture/OPS/SLI_SLO_ERROR_BUDGET.md"
  "docs/architecture/OPS/DB_MIGRATION_STRATEGY.md"
  "docs/ops/WORKER_SCHEDULING.md"
  "docs/ops/DATA_RETENTION_MAINTENANCE.md"
  "docs/ops/OPS_METRICS_DASHBOARD.md"
  "docs/ops/INTEGRATION_TEST_RUNBOOK.md"
  ".github/workflows/integration-gate.yml"
  "apps/web/package.json"
  "apps/web/.env.example"
  "apps/web/scripts/db-migrate.cjs"
  "apps/web/scripts/run-outbox-dispatch.cjs"
  "apps/web/scripts/maintenance-cleanup.cjs"
  "apps/web/scripts/fetch-ops-metrics.cjs"
  "apps/web/scripts/evaluate-ops-alerts.cjs"
  "apps/web/scripts/integration-smoke.cjs"
  "apps/web/scripts/integration-postgres.cjs"
  "apps/web/db/migrations/0001_init.sql"
  "apps/web/db/migrations/0002_operational_hardening.sql"
  "apps/web/next.config.ts"
  "apps/web/lib/internal-auth.ts"
  "apps/web/lib/store/interface.ts"
  "apps/web/lib/store/index.ts"
  "apps/web/lib/store/memory-store.ts"
  "apps/web/lib/store/postgres-store.ts"
  "apps/web/lib/services/booking-service.ts"
  "apps/web/lib/queue-worker.ts"
  "apps/web/app/api/health/route.ts"
  "apps/web/app/api/booking/route.ts"
  "apps/web/app/api/consent/route.ts"
  "apps/web/app/api/v1/health/route.ts"
  "apps/web/app/api/v1/bookings/route.ts"
  "apps/web/app/api/v1/consents/route.ts"
  "apps/web/app/api/internal/queue/dispatch/route.ts"
  "apps/web/app/api/internal/ops/metrics/route.ts"
  "apps/web/app/api/internal/ops/alerts/route.ts"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "[FAIL] Missing required architecture/runtime file: $f"
    missing=1
  fi
done

if [[ $missing -ne 0 ]]; then
  exit 1
fi

if ! rg -q "openapi: 3" docs/architecture/API/openapi.yaml; then
  echo "[FAIL] OpenAPI file malformed or missing version header"
  exit 1
fi

if ! rg -q "create table if not exists bookings" docs/architecture/DATA/postgresql_schema.sql; then
  echo "[FAIL] Schema missing bookings table"
  exit 1
fi

if ! rg -q "create table if not exists idempotency_keys" docs/architecture/DATA/postgresql_schema.sql; then
  echo "[FAIL] Schema missing idempotency table"
  exit 1
fi

if ! rg -q "create table if not exists outbox_events" docs/architecture/DATA/postgresql_schema.sql; then
  echo "[FAIL] Schema missing outbox table"
  exit 1
fi

if ! rg -q "db:migrate|worker:dispatch|maintenance:cleanup|test:integration:smoke|test:integration:postgres|ops:metrics" apps/web/package.json; then
  echo "[FAIL] package.json missing required operational scripts"
  exit 1
fi

if ! rg -q "STRIDE|Spoofing|Tampering" docs/architecture/SECURITY/THREAT_MODEL.md; then
  echo "[FAIL] Threat model missing STRIDE controls"
  exit 1
fi

if ! rg -q "Content-Security-Policy" apps/web/next.config.ts; then
  echo "[FAIL] Web config missing security headers"
  exit 1
fi

if ! rg -q "Idempotency-Key|idempotency" -i docs/architecture/API/openapi.yaml; then
  echo "[FAIL] OpenAPI missing idempotency contract"
  exit 1
fi

if ! rg -q "OPS_METRICS_TOKEN" apps/web/.env.example; then
  echo "[FAIL] .env.example missing OPS_METRICS_TOKEN"
  exit 1
fi

if ! rg -q "x-ops-token" apps/web/app/api/internal/ops/metrics/route.ts; then
  echo "[FAIL] Metrics endpoint missing x-ops-token guard"
  exit 1
fi

if ! rg -q "x-ops-token" apps/web/app/api/internal/ops/alerts/route.ts; then
  echo "[FAIL] Alerts endpoint missing x-ops-token guard"
  exit 1
fi

echo "[PASS] Architecture checks passed"

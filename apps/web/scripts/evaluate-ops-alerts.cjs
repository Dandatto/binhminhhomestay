#!/usr/bin/env node

const baseUrl = process.env.INTEGRATION_BASE_URL || "http://localhost:3000";
const token = process.env.OPS_METRICS_TOKEN;

if (!token) {
  console.error("[FAIL] OPS_METRICS_TOKEN is required");
  process.exit(1);
}

async function main() {
  const response = await fetch(`${baseUrl}/api/internal/ops/alerts`, {
    method: "GET",
    headers: {
      "x-ops-token": token,
      "x-request-id": `ops-alert-${Date.now()}`
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("[FAIL] alerts endpoint error", response.status, body);
    process.exit(1);
  }

  const status = body?.status || "unknown";
  console.log(JSON.stringify(body, null, 2));

  if (status === "critical") {
    console.error("[FAIL] critical alerts detected");
    process.exit(2);
  }

  console.log(`[PASS] alert status: ${status}`);
}

main().catch((error) => {
  console.error("[FAIL] evaluate alerts error:", error.message);
  process.exit(1);
});

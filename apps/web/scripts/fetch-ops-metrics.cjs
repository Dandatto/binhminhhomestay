#!/usr/bin/env node

const baseUrl = process.env.INTEGRATION_BASE_URL || "http://localhost:3000";
const opsToken = process.env.OPS_METRICS_TOKEN;

if (!opsToken) {
  console.error("[FAIL] OPS_METRICS_TOKEN is required");
  process.exit(1);
}

async function main() {
  const response = await fetch(`${baseUrl}/api/internal/ops/metrics`, {
    method: "GET",
    headers: {
      "x-ops-token": opsToken,
      "x-request-id": `ops-${Date.now()}`
    }
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`[FAIL] metrics status ${response.status}: ${text}`);
    process.exit(1);
  }

  console.log(text);
}

main().catch((error) => {
  console.error("[FAIL] metrics fetch error:", error.message);
  process.exit(1);
});

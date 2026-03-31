#!/usr/bin/env node

const endpoint = process.env.OUTBOX_DISPATCH_URL || "http://localhost:3000/api/internal/queue/dispatch";
const token = process.env.WORKER_DISPATCH_TOKEN;

if (!token) {
  console.error("[FAIL] WORKER_DISPATCH_TOKEN is required");
  process.exit(1);
}

async function main() {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-token": token,
      "x-request-id": `cron-${Date.now()}`
    },
    body: JSON.stringify({ reason: "scheduled-dispatch" })
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`[FAIL] Dispatch status ${response.status}: ${text}`);
    process.exit(1);
  }

  console.log(`[PASS] Dispatch status ${response.status}: ${text}`);
}

main().catch((error) => {
  console.error("[FAIL] Dispatch error:", error.message);
  process.exit(1);
});

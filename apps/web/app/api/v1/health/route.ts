import { NextResponse } from "next/server";
import { env } from "../../../../lib/env";
import { getStore } from "../../../../lib/store";

type CheckState = "ok" | "degraded" | "fail";

export async function GET(req: Request) {
  const now = new Date().toISOString();
  const url = new URL(req.url);
  const deep = ["1", "true", "yes"].includes((url.searchParams.get("deep") ?? "").toLowerCase());

  if (!deep) {
    return NextResponse.json(
      {
        status: "ok",
        mode: "shallow",
        adapter: env.storeAdapter,
        timestamp: now
      },
      { status: 200 }
    );
  }

  const checks: Record<string, CheckState> = {
    app: "ok",
    store: "ok",
    queue: "ok"
  };

  try {
    const store = getStore();
    const metrics = await store.getOperationalMetrics();

    if (metrics.outboxFailed > env.healthOutboxFailedMax || metrics.outboxPending > env.healthOutboxPendingMax) {
      checks.queue = "degraded";
    }

    if (!env.workerDispatchToken) {
      checks.queue = "fail";
    }

    const hasFail = Object.values(checks).includes("fail");
    const hasDegraded = Object.values(checks).includes("degraded");
    const overall = hasFail ? "fail" : hasDegraded ? "degraded" : "ok";

    return NextResponse.json(
      {
        status: overall,
        mode: "deep",
        adapter: env.storeAdapter,
        timestamp: now,
        checks,
        metrics: {
          outboxPending: metrics.outboxPending,
          outboxFailed: metrics.outboxFailed,
          idempotencyInProgress: metrics.idempotencyInProgress
        }
      },
      { status: hasFail ? 503 : 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Health probe failed";
    checks.store = "fail";

    return NextResponse.json(
      {
        status: "fail",
        mode: "deep",
        adapter: env.storeAdapter,
        timestamp: now,
        checks,
        error: message
      },
      { status: 503 }
    );
  }
}

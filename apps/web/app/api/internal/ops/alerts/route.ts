import { NextResponse } from "next/server";
import { env } from "../../../../../lib/env";
import { safeTokenEquals } from "../../../../../lib/internal-auth";
import { getStore } from "../../../../../lib/store";

type Severity = "warning" | "critical";

type Alert = {
  id: string;
  severity: Severity;
  value: number;
  threshold: number;
  message: string;
};

export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id");

  if (!env.opsMetricsToken) {
    return NextResponse.json({ error: "OPS_METRICS_TOKEN is not configured", requestId }, { status: 500 });
  }

  const providedToken = req.headers.get("x-ops-token");
  if (!safeTokenEquals(providedToken, env.opsMetricsToken)) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
  }

  const store = getStore();
  const metrics = await store.getOperationalMetrics();
  const alerts: Alert[] = [];

  if (metrics.outboxFailed >= env.opsAlertOutboxFailedCritical) {
    alerts.push({
      id: "outbox_failed_critical",
      severity: "critical",
      value: metrics.outboxFailed,
      threshold: env.opsAlertOutboxFailedCritical,
      message: "Outbox failed events exceeded critical threshold"
    });
  }

  if (metrics.outboxPending >= env.opsAlertOutboxPendingCritical) {
    alerts.push({
      id: "outbox_pending_critical",
      severity: "critical",
      value: metrics.outboxPending,
      threshold: env.opsAlertOutboxPendingCritical,
      message: "Outbox pending backlog exceeded critical threshold"
    });
  } else if (metrics.outboxPending >= env.opsAlertOutboxPendingWarning) {
    alerts.push({
      id: "outbox_pending_warning",
      severity: "warning",
      value: metrics.outboxPending,
      threshold: env.opsAlertOutboxPendingWarning,
      message: "Outbox pending backlog exceeded warning threshold"
    });
  }

  if (metrics.idempotencyInProgress >= env.opsAlertIdempotencyInProgressCritical) {
    alerts.push({
      id: "idempotency_in_progress_critical",
      severity: "critical",
      value: metrics.idempotencyInProgress,
      threshold: env.opsAlertIdempotencyInProgressCritical,
      message: "Idempotency IN_PROGRESS count exceeded critical threshold"
    });
  }

  const hasCritical = alerts.some((alert) => alert.severity === "critical");
  const hasWarning = alerts.some((alert) => alert.severity === "warning");

  const status = hasCritical ? "critical" : hasWarning ? "warning" : "healthy";

  return NextResponse.json(
    {
      status,
      adapter: env.storeAdapter,
      requestId,
      generatedAt: metrics.generatedAt,
      alerts,
      metrics
    },
    { status: 200 }
  );
}

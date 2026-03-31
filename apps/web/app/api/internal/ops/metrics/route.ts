import { NextResponse } from "next/server";
import { env } from "../../../../../lib/env";
import { safeTokenEquals } from "../../../../../lib/internal-auth";
import { getStore } from "../../../../../lib/store";

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

  return NextResponse.json(
    {
      status: "ok",
      adapter: env.storeAdapter,
      metrics,
      requestId
    },
    { status: 200 }
  );
}

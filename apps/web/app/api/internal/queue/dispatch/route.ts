import { NextResponse } from "next/server";
import { dispatchOutboxOnce } from "../../../../../lib/queue-worker";
import { env } from "../../../../../lib/env";
import { safeTokenEquals } from "../../../../../lib/internal-auth";

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id");

  if (!env.workerDispatchToken) {
    return NextResponse.json({ error: "WORKER_DISPATCH_TOKEN is not configured", requestId }, { status: 500 });
  }

  const providedToken = req.headers.get("x-worker-token");
  if (!safeTokenEquals(providedToken, env.workerDispatchToken)) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
  }

  const result = await dispatchOutboxOnce();
  return NextResponse.json({ status: "ok", ...result, requestId }, { status: 200 });
}

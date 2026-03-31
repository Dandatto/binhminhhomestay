import { NextResponse } from "next/server";
import { dispatchOutboxOnce } from "@/lib/queue-worker";
import { env } from "@/lib/env";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  
  // Kiểm tra Header từ Vercel Cron. Nếu chạy cục bộ thì dùng workerDispatchToken
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isLocalToken = authHeader === `Bearer ${env.workerDispatchToken}`;

  const isBypassTokens = !process.env.CRON_SECRET && !env.workerDispatchToken;

  if (!isVercelCron && !isLocalToken && !isBypassTokens) {
    return new NextResponse("Unauthorized Cron Request", { status: 401 });
  }

  try {
    const result = await dispatchOutboxOnce();
    return NextResponse.json({ status: "ok", ...result });
  } catch (error) {
    console.error("[CronDispatchError]", error);
    return new NextResponse("Dispatch Execution Failed", { status: 500 });
  }
}

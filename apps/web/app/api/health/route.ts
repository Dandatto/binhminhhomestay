import { NextResponse } from "next/server";
import { env } from "../../../lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    storeAdapter: env.storeAdapter,
    timestamp: new Date().toISOString()
  });
}

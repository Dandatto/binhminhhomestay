import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";

export const revalidate = 0; // Don't cache metrics

export async function GET(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = getStore();
    const metrics = await store.getOperationalMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("[GetMetrics]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * GET /api/v1/vessels
 * Returns today's ferry schedule for the Ao Tien <-> Minh Chau route.
 * Public endpoint, no auth required.
 * Cached for 5 minutes via Next.js revalidate.
 */

import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const store = getStore();
    const vessels = await store.getTodayVessels();
    return NextResponse.json({ vessels, date: new Date().toDateString() });
  } catch (err) {
    console.error("[vessels GET]", err);
    return NextResponse.json({ vessels: [], error: true }, { status: 200 });
  }
}

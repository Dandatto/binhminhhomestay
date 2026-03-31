import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const revalidate = 60; // Phục vụ traffic lớn nhưng vẫn update khá nhanh

export async function GET() {
  try {
    const store = getStore();
    const allSettings = await store.getSettings();
    // F-011: Only expose pricing_* keys — internal config keys must not leak publicly
    const pricing = Object.fromEntries(
      Object.entries(allSettings).filter(([k]) => k.startsWith("pricing_"))
    );
    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("[GetPricing]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

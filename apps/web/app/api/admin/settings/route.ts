import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";

export async function GET(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = getStore();
    const data = await store.getSettings();
    return NextResponse.json({ settings: data });
  } catch (error) {
    console.error("[GetSettings]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await req.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Bad Request: missing key or value" }, { status: 400 });
    }

    const store = getStore();
    await store.updateSetting(key, String(value));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UpdateSetting]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

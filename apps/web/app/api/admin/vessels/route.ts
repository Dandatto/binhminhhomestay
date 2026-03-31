import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";
import type { AddVesselInput, VesselSchedule } from "@/lib/domain";

export async function POST(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = (await req.json()) as AddVesselInput;
    const store = getStore();
    const vessel = await store.addVessel(input);
    return NextResponse.json(vessel);
  } catch (error) {
    console.error("[AddVessel]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = await req.json();
    const { id, status } = input as { id: string; status: VesselSchedule["status"] };
    const store = getStore();
    await store.updateVesselStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UpdateVessel]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Bad Request: missing id" }, { status: 400 });

    const store = getStore();
    await store.deleteVessel(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DeleteVessel]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

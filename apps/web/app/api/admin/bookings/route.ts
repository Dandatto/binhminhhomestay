import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";

// F-006: All status mutations validated against enum (F-010)
const VALID_STATUSES = ["PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;

export async function GET(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    // F-008: Pagination upper bound
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const store = getStore();
    const data = await store.getAllBookings(limit, offset);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GetBookings]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, guestEmail } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "Bad Request: missing id or status" }, { status: 400 });
    }

    // F-010: Validate status enum before writing to DB
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Bad Request: invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    const store = getStore();
    await store.updateBookingStatus(id, status);

    if (status === "CONFIRMED") {
      const booking = await store.getBookingById(id);
      const emailToUse = guestEmail || (booking as any)?.email;
      await store.enqueueOutboxEvent("BOOKING_CONFIRMED", {
        bookingId: id,
        guestEmail: emailToUse ?? null,
        confirmedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UpdateBookingStatus]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

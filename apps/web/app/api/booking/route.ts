import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { validateCreateBooking } from "../../../lib/validation";
import { BookingServiceError, createBooking } from "../../../lib/services/booking-service";
import { dispatchOutboxOnce } from "../../../lib/queue-worker";

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") ?? randomUUID();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", requestId }, { status: 400 });
  }

  const result = validateCreateBooking(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, requestId }, { status: 400 });
  }

  try {
    const bookingResult = await createBooking({
      payload: result.value,
      requestId,
      idempotencyHeader: req.headers.get("idempotency-key"),
      sourceIp: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined
    });

    // Fire-and-forget outbox dispatch for dev/local runtime.
    void dispatchOutboxOnce();

    return NextResponse.json(
      {
        ...bookingResult.responseBody,
        replayed: bookingResult.replayed
      },
      { status: bookingResult.statusCode }
    );
  } catch (error) {
    if (error instanceof BookingServiceError) {
      return NextResponse.json({ error: error.message, requestId }, { status: error.statusCode });
    }

    const message = error instanceof Error ? error.message : "Unexpected booking error";
    return NextResponse.json({ error: message, requestId }, { status: 500 });
  }
}

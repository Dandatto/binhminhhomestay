import type { CreateBookingPayload } from "../validation";
import { createRequestHash, normalizeIdempotencyKey } from "../idempotency";
import { env } from "../env";
import { getStore } from "../store";

export class BookingServiceError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createBooking(input: {
  payload: CreateBookingPayload;
  requestId: string;
  idempotencyHeader: string | null;
  sourceIp?: string;
  userAgent?: string;
}): Promise<{ responseBody: Record<string, unknown>; statusCode: number; replayed: boolean }> {
  const store = getStore();
  const requestHash = createRequestHash(input.payload as unknown as Record<string, unknown>);
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyHeader, requestHash);

  const acquired = await store.acquireIdempotencyKey({
    idempotencyKey,
    requestHash,
    ttlSeconds: env.idempotencyTtlSeconds
  });

  if (acquired.kind === "replay") {
    return { responseBody: acquired.responseBody, statusCode: acquired.responseStatus, replayed: true };
  }

  if (acquired.kind === "conflict") {
    throw new BookingServiceError(409, "Idempotency key conflict with different payload");
  }

  if (acquired.kind === "in_progress") {
    throw new BookingServiceError(409, "Request with the same idempotency key is still in progress");
  }

  try {
    const aggregate = await store.createBookingAggregate({
      booking: {
        guestName: input.payload.guestName,
        phone: input.payload.phone,
        checkInDate: input.payload.checkInDate,
        checkOutDate: input.payload.checkOutDate,
        roomType: input.payload.roomType,
        note: input.payload.note,
        consentVersion: input.payload.consentVersion
      },
      consent: {
        consentType: "BOOKING_PRIVACY",
        consentGiven: true,
        policyVersion: input.payload.consentVersion,
        sourceIp: input.sourceIp,
        userAgent: input.userAgent
      },
      audit: {
        actorType: "CUSTOMER",
        actorRef: input.payload.phone,
        eventType: "BOOKING_CREATED",
        payload: {
          requestId: input.requestId
        }
      },
      outbox: {
        eventType: "BOOKING_CREATED",
        payload: {
          requestId: input.requestId,
          guestEmail: input.payload.email
        }
      }
    });

    const responseBody = {
      bookingId: aggregate.booking.id,
      bookingCode: aggregate.booking.bookingCode,
      status: aggregate.booking.status,
      requestId: input.requestId,
      idempotencyKey
    };

    await store.completeIdempotencyKey({
      idempotencyKey,
      responseStatus: 202,
      responseBody
    });

    return { responseBody, statusCode: 202, replayed: false };
  } catch (error) {
    await store.failIdempotencyKey(idempotencyKey);
    
    if (error instanceof Error && error.message === "ROOM_ALREADY_BOOKED") {
      throw new BookingServiceError(409, "Phòng này đã có người đặt trong thời gian bạn chọn. Vui lòng chọn ngày khác hoặc loại phòng khác.");
    }
    
    throw error;
  }
}

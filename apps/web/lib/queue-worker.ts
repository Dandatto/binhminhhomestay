import { randomUUID } from "crypto";
import { env } from "./env";
import { getStore } from "./store";
import type { OutboxEvent } from "./domain";
import { sendBookingConfirmationEmail, sendBookingConfirmedEmail } from "./email/email-service";

async function processEvent(event: OutboxEvent): Promise<void> {
  const store = getStore();

  switch (event.eventType) {
    case "BOOKING_CREATED": {
      const bookingId = event.payload.bookingId as string;
      const guestEmail = event.payload.guestEmail as string | undefined;
      
      // Nếu có email, gửi email xác nhận nhận đơn
      if (guestEmail) {
        const booking = await store.getBookingById(bookingId);
        if (booking) {
          await sendBookingConfirmationEmail(guestEmail, {
            guestName: booking.guestName,
            bookingCode: booking.bookingCode,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            roomType: booking.roomType,
            phone: booking.phone,
            note: booking.note,
          });
        }
      } else {
        // Không có email, log để biết
        console.log(`[QueueWorker] ℹ️ BOOKING_CREATED ${bookingId} — no email address provided, skipping email.`);
      }
      return;
    }

    case "BOOKING_CONFIRMED": {
      const bookingId = event.payload.bookingId as string;
      const guestEmail = event.payload.guestEmail as string | undefined;

      if (guestEmail) {
        const booking = await store.getBookingById(bookingId);
        if (booking) {
          // Tính tiền cọc 30%
          const settings = await store.getSettings();
          const basePrice = parseInt(
            settings[`pricing_${booking.roomType.toLowerCase().replace(/\s/g, "_")}`] 
              ?? settings["pricing_room_1_bed"] 
              ?? "1200000"
          );
          const depositAmount = Math.round(basePrice * env.depositRatio);

          await sendBookingConfirmedEmail(guestEmail, {
            guestName: booking.guestName,
            bookingCode: booking.bookingCode,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            roomType: booking.roomType,
            depositAmount,
          });
        }
      } else {
        console.log(`[QueueWorker] ℹ️ BOOKING_CONFIRMED ${bookingId} — no email address provided, skipping email.`);
      }
      return;
    }

    default:
      throw new Error(`Unsupported event type: ${String(event.eventType)}`);
  }
}

export async function dispatchOutboxOnce(batchSize = env.outboxBatchSize): Promise<{ processed: number; failed: number }> {
  const store = getStore();
  const workerId = `wk-${randomUUID()}`;
  const events = await store.pullOutboxBatch(batchSize, workerId);

  let processed = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await processEvent(event);
      await store.markOutboxDone(event.id);
      processed += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown worker error";
      console.error(`[QueueWorker] ❌ Event ${event.id} (${event.eventType}) failed: ${reason}`);
      await store.markOutboxFailed(event.id, reason, event.attempts);
      failed += 1;
    }
  }

  if (events.length > 0) {
    console.log(`[QueueWorker] Batch done: ${processed} processed, ${failed} failed`);
  }

  return { processed, failed };
}

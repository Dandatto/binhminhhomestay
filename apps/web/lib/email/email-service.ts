import * as React from "react";
import { render } from "@react-email/render";
import { getResendClient } from "./resend-client";
import { env } from "../env";
import type { BookingConfirmationEmailProps } from "./templates/booking-confirmation";
import type { BookingConfirmedEmailProps } from "./templates/booking-confirmed";

const from = `${env.emailFromName} <${env.emailFrom}>`;

export async function sendBookingConfirmationEmail(
  to: string,
  props: BookingConfirmationEmailProps
): Promise<void> {
  if (!to || !to.includes("@")) {
    console.warn("[Email] No valid email address, skipping confirmation send.");
    return;
  }

  const resend = getResendClient();
  const { default: BookingConfirmationEmail } = await import("./templates/booking-confirmation");

  const html = await render(React.createElement(BookingConfirmationEmail, props));

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `[Bình Minh] Đã nhận đặt phòng ${props.bookingCode}`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`[Email] ✅ Booking confirmation sent to ${to} (${props.bookingCode})`);
}

export async function sendBookingConfirmedEmail(
  to: string,
  props: BookingConfirmedEmailProps
): Promise<void> {
  if (!to || !to.includes("@")) {
    console.warn("[Email] No valid email address, skipping confirmed send.");
    return;
  }

  const resend = getResendClient();
  const { default: BookingConfirmedEmail } = await import("./templates/booking-confirmed");

  const html = await render(React.createElement(BookingConfirmedEmail, props));

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `[Bình Minh] ✅ Phòng đã xác nhận — ${props.bookingCode}`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`[Email] ✅ Booking confirmed email sent to ${to} (${props.bookingCode})`);
}


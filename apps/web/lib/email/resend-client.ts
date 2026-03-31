import { Resend } from "resend";
import { env } from "../env";

let _resend: Resend | null = null;

export function getResendClient(): Resend {
  if (!_resend) {
    if (!env.resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    _resend = new Resend(env.resendApiKey);
  }
  return _resend;
}

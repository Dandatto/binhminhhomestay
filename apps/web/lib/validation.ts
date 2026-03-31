export type CreateBookingPayload = {
  guestName: string;
  phone: string;
  email?: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  note?: string;
  consentGiven: boolean;
  consentVersion: string;
};

export type ConsentPayload = {
  subjectType: "BOOKING" | "LEAD";
  subjectRef: string;
  consentType: string;
  consentGiven: boolean;
  policyVersion: string;
  sourceIp?: string;
  userAgent?: string;
};

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function validateCreateBooking(payload: unknown): { ok: true; value: CreateBookingPayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const p = payload as Record<string, unknown>;
  const requiredTextFields = ["guestName", "phone", "checkInDate", "checkOutDate", "roomType", "consentVersion"];

  for (const field of requiredTextFields) {
    if (typeof p[field] !== "string" || String(p[field]).trim().length === 0) {
      return { ok: false, error: `Missing or invalid field: ${field}` };
    }
  }

  const checkInDate = String(p.checkInDate);
  const checkOutDate = String(p.checkOutDate);

  if (!isIsoDate(checkInDate) || !isIsoDate(checkOutDate)) {
    return { ok: false, error: "Dates must be in YYYY-MM-DD format" };
  }

  if (checkOutDate <= checkInDate) {
    return { ok: false, error: "checkOutDate must be after checkInDate" };
  }

  // F-015: Reject check-in dates in the past
  const today = new Date().toISOString().split("T")[0];
  if (checkInDate < today) {
    return { ok: false, error: "checkInDate cannot be in the past" };
  }

  if (typeof p.consentGiven !== "boolean" || p.consentGiven !== true) {
    return { ok: false, error: "Consent must be explicitly accepted" };
  }

  return {
    ok: true,
    value: {
      guestName: String(p.guestName).trim(),
      phone: String(p.phone).trim(),
      email: typeof p.email === "string" && p.email.includes("@") ? p.email.trim() : undefined,
      checkInDate,
      checkOutDate,
      roomType: String(p.roomType),
      note: typeof p.note === "string" ? p.note : undefined,
      consentGiven: true,
      consentVersion: String(p.consentVersion)
    }
  };
}

export function validateConsent(payload: unknown): { ok: true; value: ConsentPayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const p = payload as Record<string, unknown>;

  const requiredTextFields = ["subjectType", "subjectRef", "consentType", "policyVersion"];
  for (const field of requiredTextFields) {
    if (typeof p[field] !== "string" || String(p[field]).trim().length === 0) {
      return { ok: false, error: `Missing or invalid field: ${field}` };
    }
  }

  if (p.subjectType !== "BOOKING" && p.subjectType !== "LEAD") {
    return { ok: false, error: "subjectType must be BOOKING or LEAD" };
  }

  if (typeof p.consentGiven !== "boolean") {
    return { ok: false, error: "consentGiven must be boolean" };
  }

  return {
    ok: true,
    value: {
      subjectType: p.subjectType,
      subjectRef: String(p.subjectRef),
      consentType: String(p.consentType),
      consentGiven: p.consentGiven,
      policyVersion: String(p.policyVersion),
      sourceIp: typeof p.sourceIp === "string" ? p.sourceIp : undefined,
      userAgent: typeof p.userAgent === "string" ? p.userAgent : undefined
    }
  };
}

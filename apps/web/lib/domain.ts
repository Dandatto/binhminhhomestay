export type BookingStatus = "PENDING_CONFIRMATION" | "CONFIRMED" | "FAILED" | "CANCELLED";

export type CreateBookingInput = {
  guestName: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  note?: string;
  consentVersion: string;
};

export type BookingRecord = {
  id: string;
  bookingCode: string;
  guestName: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  note?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type ConsentInput = {
  subjectType: "BOOKING" | "LEAD";
  subjectRef: string;
  consentType: string;
  consentGiven: boolean;
  consentCrossBorder?: boolean;
  policyVersion: string;
  sourceIp?: string;
  userAgent?: string;
};

export type AuditInput = {
  actorType: "SYSTEM" | "ADMIN" | "CUSTOMER";
  actorRef?: string;
  eventType: string;
  entityType: string;
  entityRef: string;
  payload?: Record<string, unknown>;
};

export type OutboxEventType = "BOOKING_CREATED" | "BOOKING_CONFIRMED";

export type OutboxEvent = {
  id: string;
  eventType: OutboxEventType;
  payload: Record<string, unknown>;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  attempts: number;
  availableAt: string;
  createdAt: string;
};

export type IdempotencyAcquireResult =
  | { kind: "acquired" }
  | { kind: "replay"; responseBody: Record<string, unknown>; responseStatus: number }
  | { kind: "in_progress" }
  | { kind: "conflict" };

export type BookingAggregateInput = {
  booking: CreateBookingInput;
  consent: {
    consentType: string;
    consentGiven: boolean;
    consentCrossBorder?: boolean;
    policyVersion: string;
    sourceIp?: string;
    userAgent?: string;
  };
  audit: {
    actorType: "SYSTEM" | "ADMIN" | "CUSTOMER";
    actorRef?: string;
    eventType: string;
    payload?: Record<string, unknown>;
  };
  outbox: {
    eventType: OutboxEventType;
    payload?: Record<string, unknown>;
  };
};

export type BookingAggregateResult = {
  booking: BookingRecord;
  consentId: string;
};

export type OperationalMetrics = {
  generatedAt: string;
  bookingsTotal: number;
  bookingsPending: number;
  outboxPending: number;
  outboxProcessing: number;
  outboxDone: number;
  outboxFailed: number;
  idempotencyInProgress: number;
  idempotencyCompleted: number;
  idempotencyFailed: number;
};

export type VesselStatus = "scheduled" | "departed" | "arrived" | "cancelled";
export type VesselDirection = "inbound" | "outbound" | "both";

export type VesselSchedule = {
  id: string;
  route: string;
  operator: string;
  departure: string;        // "HH:MM" 24h
  direction: VesselDirection;
  scheduleDate: string;     // ISO date "YYYY-MM-DD"
  status: VesselStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type AddVesselInput = {
  operator: string;
  departure: string;
  direction: VesselDirection;
  scheduleDate: string;
  note?: string;
};

export type MediaAsset = {
  id: string;
  blobUrl: string;
  fileName: string;
  sizeBytes: number;
  mimeType?: string;
  createdAt: string;
};

export type ArticleStatus = "DRAFT" | "PUBLISHED";

export type Article = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  tags?: string;
  status: ArticleStatus;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateArticleInput = Omit<Article, "id" | "createdAt" | "updatedAt">;
export type UpdateArticleInput = Partial<CreateArticleInput>;

// ─── Room Session (Guest Auth) ────────────────────────────────────────────────
export type RoomSession = {
  id: string;
  bookingId: string;
  roomType: string;           // e.g. "phi-thuyen-2"
  guestName: string;
  guestEmail?: string;
  token: string;              // UUID stored in httpOnly cookie
  checkIn: string;            // ISO timestamp
  checkOut: string;           // ISO timestamp — hard TTL
  terminatedAt?: string;      // set by staff on early check-out
  createdAt: string;
};

export type CreateRoomSessionInput = {
  bookingId: string;
  roomType: string;
  guestName: string;
  guestEmail?: string;
  checkOut: string;           // ISO timestamp from booking
};

export type ActiveRoomSession = RoomSession & {
  minutesUntilCheckout: number;
};

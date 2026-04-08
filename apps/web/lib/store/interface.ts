import type {
  AddVesselInput,
  AuditInput,
  BookingAggregateInput,
  BookingAggregateResult,
  BookingRecord,
  ConsentInput,
  CreateBookingInput,
  IdempotencyAcquireResult,
  OperationalMetrics,
  OutboxEvent,
  OutboxEventType,
  VesselSchedule,
  MediaAsset,
  Article,
  CreateArticleInput,
  UpdateArticleInput,
  RoomSession,
  CreateRoomSessionInput,
} from "../domain";

export type CompleteIdempotencyInput = {
  idempotencyKey: string;
  responseStatus: number;
  responseBody: Record<string, unknown>;
};

export interface AppStore {
  acquireIdempotencyKey(input: { idempotencyKey: string; requestHash: string; ttlSeconds: number }): Promise<IdempotencyAcquireResult>;
  completeIdempotencyKey(input: CompleteIdempotencyInput): Promise<void>;
  failIdempotencyKey(idempotencyKey: string): Promise<void>;

  createBooking(input: CreateBookingInput): Promise<BookingRecord>;
  recordConsent(input: ConsentInput): Promise<{ consentId: string }>;
  recordAuditEvent(input: AuditInput): Promise<void>;
  createBookingAggregate(input: BookingAggregateInput): Promise<BookingAggregateResult>;

  enqueueOutboxEvent(eventType: OutboxEventType, payload: Record<string, unknown>): Promise<void>;
  pullOutboxBatch(limit: number, workerId: string): Promise<OutboxEvent[]>;
  markOutboxDone(eventId: string): Promise<void>;
  markOutboxFailed(eventId: string, reason: string, attempts: number): Promise<void>;
  getOperationalMetrics(): Promise<OperationalMetrics>;

  // Vessel schedule management
  getTodayVessels(): Promise<VesselSchedule[]>;
  addVessel(input: AddVesselInput): Promise<VesselSchedule>;
  updateVesselStatus(id: string, status: VesselSchedule["status"]): Promise<void>;
  deleteVessel(id: string): Promise<void>;

  // Settings & CMS
  getSettings(): Promise<Record<string, string>>;
  updateSetting(key: string, value: string): Promise<void>;

  // Admin Bookings
  getAllBookings(limit?: number, offset?: number): Promise<{ bookings: BookingRecord[]; total: number }>;
  updateBookingStatus(id: string, status: BookingRecord["status"]): Promise<void>;
  getBookingById(id: string): Promise<BookingRecord | null>;

  // Media Library
  addMediaAsset(input: Omit<MediaAsset, "id" | "createdAt">): Promise<MediaAsset>;
  getMediaAssets(limit?: number, offset?: number): Promise<{ assets: MediaAsset[]; total: number }>;
  deleteMediaAsset(id: string): Promise<void>;

  // Articles
  createArticle(input: CreateArticleInput): Promise<Article>;
  updateArticle(id: string, input: UpdateArticleInput): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getArticleById(id: string): Promise<Article | null>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getArticles(limit?: number, offset?: number, onlyPublished?: boolean): Promise<{ articles: Article[]; total: number }>;

  // Room Sessions (Guest Auth)
  createRoomSession(input: CreateRoomSessionInput): Promise<RoomSession>;
  getRoomSessionByToken(token: string): Promise<RoomSession | null>;
  terminateRoomSession(token: string): Promise<void>;
  extendRoomSession(token: string, newCheckOut: string): Promise<RoomSession>;
  getActiveRoomSessions(): Promise<RoomSession[]>;
}



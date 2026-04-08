import { randomUUID } from "crypto";
import { env } from "../env";
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
import type { AppStore, CompleteIdempotencyInput } from "./interface";

type IdempotencyState = {
  requestHash: string;
  expiresAt: number;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  responseStatus?: number;
  responseBody?: Record<string, unknown>;
};

type OutboxInternal = OutboxEvent & {
  workerId?: string;
  lastError?: string;
  updatedAt: string;
  availableAtMs: number;
};

function nowIso(): string {
  return new Date().toISOString();
}

function generateBookingCode(): string {
  const t = new Date();
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  const d = String(t.getUTCDate()).padStart(2, "0");
  const r = randomUUID().slice(0, 8).toUpperCase();
  return `BM-${y}${m}${d}-${r}`;
}

function calculateRetryDelaySeconds(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  const uncapped = env.outboxBaseDelaySeconds * Math.pow(2, exponent);
  const maxDelay = env.outboxBaseDelaySeconds * 32;
  return Math.min(uncapped, maxDelay);
}

export class MemoryStore implements AppStore {
  private readonly idempotencyMap = new Map<string, IdempotencyState>();
  private readonly bookings: BookingRecord[] = [];
  private readonly consentIds: string[] = [];
  private readonly audit: AuditInput[] = [];
  private readonly outbox: OutboxInternal[] = [];
  private readonly vessels: VesselSchedule[] = [];
  private readonly mediaAssets: MediaAsset[] = [];
  private readonly articles: Article[] = [];

  async acquireIdempotencyKey(input: { idempotencyKey: string; requestHash: string; ttlSeconds: number }): Promise<IdempotencyAcquireResult> {
    const nowMs = Date.now();
    const current = this.idempotencyMap.get(input.idempotencyKey);

    if (current && current.expiresAt < nowMs) {
      this.idempotencyMap.delete(input.idempotencyKey);
    }

    const existing = this.idempotencyMap.get(input.idempotencyKey);
    if (!existing) {
      this.idempotencyMap.set(input.idempotencyKey, {
        requestHash: input.requestHash,
        expiresAt: nowMs + input.ttlSeconds * 1000,
        status: "IN_PROGRESS"
      });
      return { kind: "acquired" };
    }

    if (existing.requestHash !== input.requestHash) {
      return { kind: "conflict" };
    }

    if (existing.status === "COMPLETED" && existing.responseBody && typeof existing.responseStatus === "number") {
      return { kind: "replay", responseBody: existing.responseBody, responseStatus: existing.responseStatus };
    }

    if (existing.status === "FAILED") {
      existing.status = "IN_PROGRESS";
      return { kind: "acquired" };
    }

    return { kind: "in_progress" };
  }

  async completeIdempotencyKey(input: CompleteIdempotencyInput): Promise<void> {
    const state = this.idempotencyMap.get(input.idempotencyKey);
    if (!state) {
      return;
    }

    state.status = "COMPLETED";
    state.responseStatus = input.responseStatus;
    state.responseBody = input.responseBody;
  }

  async failIdempotencyKey(idempotencyKey: string): Promise<void> {
    const state = this.idempotencyMap.get(idempotencyKey);
    if (!state) {
      return;
    }
    state.status = "FAILED";
  }

  async createBooking(input: CreateBookingInput): Promise<BookingRecord> {
    const createdAt = nowIso();
    const booking: BookingRecord = {
      id: randomUUID(),
      bookingCode: generateBookingCode(),
      guestName: input.guestName,
      phone: input.phone,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      roomType: input.roomType,
      note: input.note,
      status: "PENDING_CONFIRMATION",
      createdAt,
      updatedAt: createdAt
    };

    this.bookings.push(booking);
    return booking;
  }

  async recordConsent(_: ConsentInput): Promise<{ consentId: string }> {
    void _;
    const consentId = randomUUID();
    this.consentIds.push(consentId);
    return { consentId };
  }

  async recordAuditEvent(input: AuditInput): Promise<void> {
    this.audit.push(input);
  }

  async createBookingAggregate(input: BookingAggregateInput): Promise<BookingAggregateResult> {
    // Memory adapter emulates transaction by applying steps in deterministic order.
    const booking = await this.createBooking(input.booking);
    const consent = await this.recordConsent({
      subjectType: "BOOKING",
      subjectRef: booking.id,
      consentType: input.consent.consentType,
      consentGiven: input.consent.consentGiven,
      policyVersion: input.consent.policyVersion,
      sourceIp: input.consent.sourceIp,
      userAgent: input.consent.userAgent
    });

    await this.recordAuditEvent({
      actorType: input.audit.actorType,
      actorRef: input.audit.actorRef,
      eventType: input.audit.eventType,
      entityType: "BOOKING",
      entityRef: booking.id,
      payload: {
        bookingCode: booking.bookingCode,
        ...(input.audit.payload ?? {})
      }
    });

    await this.enqueueOutboxEvent(input.outbox.eventType, {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      ...(input.outbox.payload ?? {})
    });

    return { booking, consentId: consent.consentId };
  }

  async enqueueOutboxEvent(eventType: OutboxEventType, payload: Record<string, unknown>): Promise<void> {
    const createdAt = nowIso();
    this.outbox.push({
      id: randomUUID(),
      eventType,
      payload,
      status: "PENDING",
      attempts: 0,
      availableAt: createdAt,
      createdAt,
      updatedAt: createdAt,
      availableAtMs: Date.now()
    });
  }

  async pullOutboxBatch(limit: number, workerId: string): Promise<OutboxEvent[]> {
    const selected: OutboxEvent[] = [];
    const nowMs = Date.now();

    for (const event of this.outbox) {
      if (selected.length >= limit) {
        break;
      }
      if (event.status !== "PENDING" || event.availableAtMs > nowMs) {
        continue;
      }

      event.status = "PROCESSING";
      event.workerId = workerId;
      event.attempts += 1;
      event.updatedAt = nowIso();

      selected.push({
        id: event.id,
        eventType: event.eventType,
        payload: event.payload,
        status: event.status,
        attempts: event.attempts,
        availableAt: event.availableAt,
        createdAt: event.createdAt
      });
    }

    return selected;
  }

  async markOutboxDone(eventId: string): Promise<void> {
    const event = this.outbox.find((item) => item.id === eventId);
    if (!event) {
      return;
    }
    event.status = "DONE";
    event.updatedAt = nowIso();
    event.lastError = undefined;
  }

  async markOutboxFailed(eventId: string, reason: string, attempts: number): Promise<void> {
    const event = this.outbox.find((item) => item.id === eventId);
    if (!event) {
      return;
    }

    event.updatedAt = nowIso();
    event.lastError = reason.slice(0, 512);

    if (attempts >= env.outboxMaxAttempts) {
      event.status = "FAILED";
      return;
    }

    const retryDelaySeconds = calculateRetryDelaySeconds(attempts);
    event.status = "PENDING";
    event.availableAtMs = Date.now() + retryDelaySeconds * 1000;
    event.availableAt = new Date(event.availableAtMs).toISOString();
  }

  async getOperationalMetrics(): Promise<OperationalMetrics> {
    const outboxPending = this.outbox.filter((event) => event.status === "PENDING").length;
    const outboxProcessing = this.outbox.filter((event) => event.status === "PROCESSING").length;
    const outboxDone = this.outbox.filter((event) => event.status === "DONE").length;
    const outboxFailed = this.outbox.filter((event) => event.status === "FAILED").length;

    let idempotencyInProgress = 0;
    let idempotencyCompleted = 0;
    let idempotencyFailed = 0;

    for (const state of this.idempotencyMap.values()) {
      if (state.status === "IN_PROGRESS") idempotencyInProgress += 1;
      if (state.status === "COMPLETED") idempotencyCompleted += 1;
      if (state.status === "FAILED") idempotencyFailed += 1;
    }

    return {
      generatedAt: nowIso(),
      bookingsTotal: this.bookings.length,
      bookingsPending: this.bookings.filter((booking) => booking.status === "PENDING_CONFIRMATION").length,
      outboxPending,
      outboxProcessing,
      outboxDone,
      outboxFailed,
      idempotencyInProgress,
      idempotencyCompleted,
      idempotencyFailed
    };
  }

  async getTodayVessels(): Promise<VesselSchedule[]> {
    const today = new Date().toISOString().slice(0, 10);
    return this.vessels
      .filter((v) => v.scheduleDate === today)
      .sort((a, b) => a.departure.localeCompare(b.departure));
  }

  async addVessel(input: AddVesselInput): Promise<VesselSchedule> {
    const now = nowIso();
    const vessel: VesselSchedule = {
      id: randomUUID(),
      route: "Ao Tiên ↔ Minh Châu",
      operator: input.operator,
      departure: input.departure,
      direction: input.direction,
      scheduleDate: input.scheduleDate,
      status: "scheduled",
      note: input.note,
      createdAt: now,
      updatedAt: now,
    };
    this.vessels.push(vessel);
    return vessel;
  }

  async updateVesselStatus(id: string, status: VesselSchedule["status"]): Promise<void> {
    const vessel = this.vessels.find((v) => v.id === id);
    if (vessel) {
      vessel.status = status;
      vessel.updatedAt = nowIso();
    }
  }

  async deleteVessel(id: string): Promise<void> {
    const idx = this.vessels.findIndex((v) => v.id === id);
    if (idx !== -1) this.vessels.splice(idx, 1);
  }

  // Giá seed theo phong.pdf (nguồn sự thật) — không có pricing_combo
  private settings: Record<string, string> = {
    'pricing_room_2_bed': '1600000',
    'pricing_room_1_bed': '1400000',
    'pricing_homestay_2_bed': '1400000',
    'pricing_homestay_1_bed': '1200000',
    'pricing_weekend_surcharge': '200000',
    'pricing_holiday_multiplier': '1.0'
  };

  async getSettings(): Promise<Record<string, string>> {
    return this.settings;
  }

  async updateSetting(key: string, value: string): Promise<void> {
    this.settings[key] = value;
  }

  async getAllBookings(limit = 50, offset = 0): Promise<{ bookings: BookingRecord[]; total: number }> {
    const sorted = [...this.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      bookings: sorted.slice(offset, offset + limit),
      total: this.bookings.length
    };
  }

  async updateBookingStatus(id: string, status: BookingRecord["status"]): Promise<void> {
    const booking = this.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      booking.updatedAt = nowIso();
    }
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    return this.bookings.find(b => b.id === id) ?? null;
  }

  // Media Library
  async addMediaAsset(input: Omit<MediaAsset, "id" | "createdAt">): Promise<MediaAsset> {
    const asset: MediaAsset = {
      ...input,
      id: randomUUID(),
      createdAt: nowIso(),
    };
    this.mediaAssets.push(asset);
    return asset;
  }

  async getMediaAssets(limit = 50, offset = 0): Promise<{ assets: MediaAsset[]; total: number }> {
    const sorted = [...this.mediaAssets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { assets: sorted.slice(offset, offset + limit), total: this.mediaAssets.length };
  }

  async deleteMediaAsset(id: string): Promise<void> {
    const i = this.mediaAssets.findIndex(a => a.id === id);
    if (i > -1) this.mediaAssets.splice(i, 1);
  }

  // Articles
  async createArticle(input: CreateArticleInput): Promise<Article> {
    const now = nowIso();
    const article: Article = {
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    this.articles.push(article);
    return article;
  }

  async updateArticle(id: string, input: UpdateArticleInput): Promise<Article> {
    const article = this.articles.find(a => a.id === id);
    if (!article) throw new Error("Article not found");
    Object.assign(article, input, { updatedAt: nowIso() });
    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    const i = this.articles.findIndex(a => a.id === id);
    if (i > -1) this.articles.splice(i, 1);
  }

  async getArticleById(id: string): Promise<Article | null> {
    return this.articles.find(a => a.id === id) || null;
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    return this.articles.find(a => a.slug === slug) || null;
  }

  async getArticles(limit = 50, offset = 0, onlyPublished = false): Promise<{ articles: Article[]; total: number }> {
    let list = this.articles;
    if (onlyPublished) {
      list = list.filter(a => a.status === "PUBLISHED");
    }
    const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { articles: sorted.slice(offset, offset + limit), total: list.length };
  }

  // ─── Room Sessions (in-memory stubs for dev) ──────────────────────────────
  private roomSessions: RoomSession[] = [];

  async createRoomSession(input: CreateRoomSessionInput): Promise<RoomSession> {
    const session: RoomSession = {
      id: randomUUID(), bookingId: input.bookingId,
      roomType: input.roomType, guestName: input.guestName,
      guestEmail: input.guestEmail, token: randomUUID(),
      checkIn: nowIso(), checkOut: input.checkOut, createdAt: nowIso(),
    };
    this.roomSessions.push(session);
    return session;
  }

  async getRoomSessionByToken(token: string): Promise<RoomSession | null> {
    return this.roomSessions.find(s => s.token === token) ?? null;
  }

  async terminateRoomSession(token: string): Promise<void> {
    const s = this.roomSessions.find(s => s.token === token);
    if (s) s.terminatedAt = nowIso();
  }

  async extendRoomSession(token: string, newCheckOut: string): Promise<RoomSession> {
    const s = this.roomSessions.find(s => s.token === token);
    if (!s) throw new Error("Session not found");
    s.checkOut = newCheckOut;
    return s;
  }

  async getActiveRoomSessions(): Promise<RoomSession[]> {
    const now = new Date();
    return this.roomSessions.filter(s => !s.terminatedAt && new Date(s.checkOut) > now);
  }
}


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
  ArticleStatus,
  CreateArticleInput,
  UpdateArticleInput
} from "../domain";
import type { AppStore, CompleteIdempotencyInput } from "./interface";

type QueryResultRow = Record<string, unknown>;

type QueryResult = {
  rows: QueryResultRow[];
  rowCount: number | null;
};

type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<QueryResult>;
};

type PoolClientLike = Queryable & {
  release: () => void;
};

type PoolLike = Queryable & {
  connect: () => Promise<PoolClientLike>;
};

function generateBookingCode(): string {
  const t = new Date();
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  const d = String(t.getUTCDate()).padStart(2, "0");
  const r = randomUUID().slice(0, 8).toUpperCase();
  return `BM-${y}${m}${d}-${r}`;
}

function asString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function calculateRetryDelaySeconds(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  const uncapped = env.outboxBaseDelaySeconds * Math.pow(2, exponent);
  const maxDelay = env.outboxBaseDelaySeconds * 32;
  return Math.min(uncapped, maxDelay);
}

function mapBookingRow(row: QueryResultRow): BookingRecord {
  return {
    id: asString(row.id),
    bookingCode: asString(row.booking_code),
    guestName: asString(row.guest_name),
    phone: asString(row.phone),
    checkInDate: asString(row.check_in_date),
    checkOutDate: asString(row.check_out_date),
    roomType: asString(row.room_type),
    status: asString(row.status) as BookingRecord["status"],
    note: typeof row.note === "string" ? row.note : undefined,
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
}

export class PostgresStore implements AppStore {
  private readonly poolPromise: Promise<PoolLike>;

  constructor(databaseUrl: string) {
    this.poolPromise = this.createPool(databaseUrl);
  }

  private async createPool(databaseUrl: string): Promise<PoolLike> {
    const pgModule = (await import("pg")) as {
      Pool: new (config: { connectionString: string; max: number; idleTimeoutMillis: number; connectionTimeoutMillis: number }) => PoolLike;
    };

    return new pgModule.Pool({
      connectionString: databaseUrl,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000
    });
  }

  private async pool(): Promise<PoolLike> {
    return this.poolPromise;
  }

  private async withTransaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
    const pool = await this.pool();
    const client = await pool.connect();

    try {
      await client.query("begin");
      const result = await fn(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async acquireIdempotencyKey(input: { idempotencyKey: string; requestHash: string; ttlSeconds: number }): Promise<IdempotencyAcquireResult> {
    const pool = await this.pool();

    const insertResult = await pool.query(
      `
      insert into idempotency_keys (idempotency_key, request_hash, status, expires_at)
      values ($1, $2, 'IN_PROGRESS', now() + ($3::text || ' seconds')::interval)
      on conflict (idempotency_key) do nothing
      returning idempotency_key
      `,
      [input.idempotencyKey, input.requestHash, input.ttlSeconds]
    );

    if ((insertResult.rowCount ?? 0) > 0) {
      return { kind: "acquired" };
    }

    const currentResult = await pool.query(
      `
      select request_hash, status, response_payload, response_status_code
      from idempotency_keys
      where idempotency_key = $1
      `,
      [input.idempotencyKey]
    );

    const row = currentResult.rows[0];
    if (!row) {
      return { kind: "acquired" };
    }

    if (asString(row.request_hash) !== input.requestHash) {
      return { kind: "conflict" };
    }

    if (asString(row.status) === "COMPLETED" && typeof row.response_payload === "object" && row.response_payload !== null) {
      return {
        kind: "replay",
        responseBody: row.response_payload as Record<string, unknown>,
        responseStatus: asNumber(row.response_status_code)
      };
    }

    if (asString(row.status) === "FAILED") {
      await pool.query(
        `
        update idempotency_keys
        set status = 'IN_PROGRESS', response_payload = null, response_status_code = null, updated_at = now()
        where idempotency_key = $1
        `,
        [input.idempotencyKey]
      );
      return { kind: "acquired" };
    }

    return { kind: "in_progress" };
  }

  async completeIdempotencyKey(input: CompleteIdempotencyInput): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      update idempotency_keys
      set status = 'COMPLETED', response_payload = $2::jsonb, response_status_code = $3, updated_at = now()
      where idempotency_key = $1
      `,
      [input.idempotencyKey, JSON.stringify(input.responseBody), input.responseStatus]
    );
  }

  async failIdempotencyKey(idempotencyKey: string): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      update idempotency_keys
      set status = 'FAILED', updated_at = now()
      where idempotency_key = $1
      `,
      [idempotencyKey]
    );
  }

  async createBooking(input: CreateBookingInput): Promise<BookingRecord> {
    const pool = await this.pool();
    const bookingCode = generateBookingCode();

    const result = await pool.query(
      `
      insert into bookings
      (booking_code, guest_name, phone, check_in_date, check_out_date, room_type, status, note)
      values ($1, $2, $3, $4::date, $5::date, $6, 'PENDING_CONFIRMATION', $7)
      returning id, booking_code, guest_name, phone, check_in_date, check_out_date, room_type, status, note, created_at, updated_at
      `,
      [bookingCode, input.guestName, input.phone, input.checkInDate, input.checkOutDate, input.roomType, input.note ?? null]
    );

    return mapBookingRow(result.rows[0]);
  }

  async recordConsent(input: ConsentInput): Promise<{ consentId: string }> {
    const pool = await this.pool();
    const result = await pool.query(
      `
      insert into consent_logs
      (subject_type, subject_ref, consent_type, consent_given, policy_version, source_ip, user_agent)
      values ($1, $2, $3, $4, $5, $6, $7)
      returning id
      `,
      [input.subjectType, input.subjectRef, input.consentType, input.consentGiven, input.policyVersion, input.sourceIp ?? null, input.userAgent ?? null]
    );

    return { consentId: asString(result.rows[0]?.id) };
  }

  async recordAuditEvent(input: AuditInput): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      insert into audit_events
      (actor_type, actor_ref, event_type, entity_type, entity_ref, payload)
      values ($1, $2, $3, $4, $5, $6::jsonb)
      `,
      [input.actorType, input.actorRef ?? null, input.eventType, input.entityType, input.entityRef, JSON.stringify(input.payload ?? {})]
    );
  }

  async createBookingAggregate(input: BookingAggregateInput): Promise<BookingAggregateResult> {
    return this.withTransaction(async (tx) => {
      const bookingCode = generateBookingCode();
      const bookingResult = await tx.query(
        `
        insert into bookings
        (booking_code, guest_name, phone, check_in_date, check_out_date, room_type, status, note)
        values ($1, $2, $3, $4::date, $5::date, $6, 'PENDING_CONFIRMATION', $7)
        returning id, booking_code, guest_name, phone, check_in_date, check_out_date, room_type, status, note, created_at, updated_at
        `,
        [bookingCode, input.booking.guestName, input.booking.phone, input.booking.checkInDate, input.booking.checkOutDate, input.booking.roomType, input.booking.note ?? null]
      );

      const booking = mapBookingRow(bookingResult.rows[0]);

      const consentResult = await tx.query(
        `
        insert into consent_logs
        (subject_type, subject_ref, consent_type, consent_given, policy_version, source_ip, user_agent)
        values ('BOOKING', $1, $2, $3, $4, $5, $6)
        returning id
        `,
        [booking.id, input.consent.consentType, input.consent.consentGiven, input.consent.policyVersion, input.consent.sourceIp ?? null, input.consent.userAgent ?? null]
      );

      await tx.query(
        `
        insert into audit_events
        (actor_type, actor_ref, event_type, entity_type, entity_ref, payload)
        values ($1, $2, $3, 'BOOKING', $4, $5::jsonb)
        `,
        [
          input.audit.actorType,
          input.audit.actorRef ?? null,
          input.audit.eventType,
          booking.id,
          JSON.stringify({ bookingCode: booking.bookingCode, ...(input.audit.payload ?? {}) })
        ]
      );

      await tx.query(
        `
        insert into outbox_events (event_type, payload, status)
        values ($1, $2::jsonb, 'PENDING')
        `,
        [
          input.outbox.eventType,
          JSON.stringify({
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            ...(input.outbox.payload ?? {})
          })
        ]
      );

      return {
        booking,
        consentId: asString(consentResult.rows[0]?.id)
      };
    });
  }

  async enqueueOutboxEvent(eventType: OutboxEventType, payload: Record<string, unknown>): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      insert into outbox_events (event_type, payload, status)
      values ($1, $2::jsonb, 'PENDING')
      `,
      [eventType, JSON.stringify(payload)]
    );
  }

  async pullOutboxBatch(limit: number, workerId: string): Promise<OutboxEvent[]> {
    return this.withTransaction(async (tx) => {
      const result = await tx.query(
        `
        with selected as (
          select id
          from outbox_events
          where status = 'PENDING' and available_at <= now()
          order by created_at asc
          limit $1
          for update skip locked
        )
        update outbox_events o
        set status = 'PROCESSING', worker_id = $2, attempts = o.attempts + 1, updated_at = now()
        from selected s
        where o.id = s.id
        returning o.id, o.event_type, o.payload, o.status, o.attempts, o.available_at, o.created_at
        `,
        [limit, workerId]
      );

      return result.rows.map((row) => ({
        id: asString(row.id),
        eventType: asString(row.event_type) as OutboxEventType,
        payload: (row.payload as Record<string, unknown>) ?? {},
        status: asString(row.status) as OutboxEvent["status"],
        attempts: asNumber(row.attempts),
        availableAt: asString(row.available_at),
        createdAt: asString(row.created_at)
      }));
    });
  }

  async markOutboxDone(eventId: string): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      update outbox_events
      set status = 'DONE', updated_at = now(), last_error = null, worker_id = null
      where id = $1
      `,
      [eventId]
    );
  }

  async markOutboxFailed(eventId: string, reason: string, attempts: number): Promise<void> {
    const pool = await this.pool();

    if (attempts >= env.outboxMaxAttempts) {
      await pool.query(
        `
        update outbox_events
        set status = 'FAILED', updated_at = now(), last_error = $2, worker_id = null
        where id = $1
        `,
        [eventId, reason.slice(0, 1024)]
      );
      return;
    }

    const delaySeconds = calculateRetryDelaySeconds(attempts);
    await pool.query(
      `
      update outbox_events
      set status = 'PENDING',
          updated_at = now(),
          last_error = $2,
          worker_id = null,
          available_at = now() + ($3::text || ' seconds')::interval
      where id = $1
      `,
      [eventId, reason.slice(0, 1024), delaySeconds]
    );
  }

  async getOperationalMetrics(): Promise<OperationalMetrics> {
    const pool = await this.pool();

    const result = await pool.query(
      `
      with booking_counts as (
        select
          count(*)::int as bookings_total,
          count(*) filter (where status = 'PENDING_CONFIRMATION')::int as bookings_pending
        from bookings
      ),
      outbox_counts as (
        select
          count(*) filter (where status = 'PENDING')::int as outbox_pending,
          count(*) filter (where status = 'PROCESSING')::int as outbox_processing,
          count(*) filter (where status = 'DONE')::int as outbox_done,
          count(*) filter (where status = 'FAILED')::int as outbox_failed
        from outbox_events
      ),
      idem_counts as (
        select
          count(*) filter (where status = 'IN_PROGRESS')::int as idempotency_in_progress,
          count(*) filter (where status = 'COMPLETED')::int as idempotency_completed,
          count(*) filter (where status = 'FAILED')::int as idempotency_failed
        from idempotency_keys
      )
      select
        b.bookings_total,
        b.bookings_pending,
        o.outbox_pending,
        o.outbox_processing,
        o.outbox_done,
        o.outbox_failed,
        i.idempotency_in_progress,
        i.idempotency_completed,
        i.idempotency_failed
      from booking_counts b, outbox_counts o, idem_counts i
      `
    );

    const row = result.rows[0] ?? {};
    return {
      generatedAt: new Date().toISOString(),
      bookingsTotal: asNumber(row.bookings_total),
      bookingsPending: asNumber(row.bookings_pending),
      outboxPending: asNumber(row.outbox_pending),
      outboxProcessing: asNumber(row.outbox_processing),
      outboxDone: asNumber(row.outbox_done),
      outboxFailed: asNumber(row.outbox_failed),
      idempotencyInProgress: asNumber(row.idempotency_in_progress),
      idempotencyCompleted: asNumber(row.idempotency_completed),
      idempotencyFailed: asNumber(row.idempotency_failed)
    };
  }

  async getTodayVessels(): Promise<VesselSchedule[]> {
    const pool = await this.pool();
    const result = await pool.query(
      `
      select id, route, operator, to_char(departure, 'HH24:MI') as departure, direction, to_char(schedule_date, 'YYYY-MM-DD') as schedule_date, status, note, created_at, updated_at
      from vessel_schedules
      where schedule_date = current_date
      order by departure asc
      `
    );
    return result.rows.map((row) => ({
      id: asString(row.id),
      route: asString(row.route),
      operator: asString(row.operator),
      departure: asString(row.departure),
      direction: asString(row.direction) as VesselSchedule["direction"],
      scheduleDate: asString(row.schedule_date),
      status: asString(row.status) as VesselSchedule["status"],
      note: typeof row.note === "string" ? row.note : undefined,
      createdAt: asString(row.created_at),
      updatedAt: asString(row.updated_at)
    }));
  }

  async addVessel(input: AddVesselInput): Promise<VesselSchedule> {
    const pool = await this.pool();
    const result = await pool.query(
      `
      insert into vessel_schedules (operator, departure, direction, schedule_date, note)
      values ($1, $2::time, $3, $4::date, $5)
      returning id, route, operator, to_char(departure, 'HH24:MI') as departure, direction, to_char(schedule_date, 'YYYY-MM-DD') as schedule_date, status, note, created_at, updated_at
      `,
      [input.operator, input.departure, input.direction, input.scheduleDate, input.note ?? null]
    );
    const row = result.rows[0];
    return {
      id: asString(row.id),
      route: asString(row.route),
      operator: asString(row.operator),
      departure: asString(row.departure),
      direction: asString(row.direction) as VesselSchedule["direction"],
      scheduleDate: asString(row.schedule_date),
      status: asString(row.status) as VesselSchedule["status"],
      note: typeof row.note === "string" ? row.note : undefined,
      createdAt: asString(row.created_at),
      updatedAt: asString(row.updated_at)
    };
  }

  async updateVesselStatus(id: string, status: VesselSchedule["status"]): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      update vessel_schedules
      set status = $2, updated_at = now()
      where id = $1
      `,
      [id, status]
    );
  }

  async deleteVessel(id: string): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      delete from vessel_schedules where id = $1
      `,
      [id]
    );
  }

  async getSettings(): Promise<Record<string, string>> {
    const pool = await this.pool();
    const result = await pool.query(`select setting_key, setting_value from app_settings`);
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[asString(row.setting_key)] = asString(row.setting_value);
    }
    return settings;
  }

  async updateSetting(key: string, value: string): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `
      insert into app_settings (setting_key, setting_value)
      values ($1, $2)
      on conflict (setting_key) do update set setting_value = excluded.setting_value, updated_at = now()
      `,
      [key, value]
    );
  }

  async getAllBookings(limit = 50, offset = 0): Promise<{ bookings: BookingRecord[]; total: number }> {
    const pool = await this.pool();
    const [dataResult, countResult] = await Promise.all([
      pool.query(`select id, booking_code, guest_name, phone, check_in_date, check_out_date, room_type, status, note, created_at, updated_at from bookings order by created_at desc limit $1 offset $2`, [limit, offset]),
      pool.query(`select count(*) as c from bookings`)
    ]);
    return {
      bookings: dataResult.rows.map((r) => mapBookingRow(r)),
      total: asNumber(countResult.rows[0]?.c)
    };
  }

  async updateBookingStatus(id: string, status: BookingRecord["status"]): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `update bookings set status = $2, updated_at = now() where id = $1`,
      [id, status]
    );
  }

  async getBookingById(id: string): Promise<BookingRecord | null> {
    const pool = await this.pool();
    const result = await pool.query(
      `select id, booking_code, guest_name, phone, check_in_date, check_out_date, room_type, status, note, created_at, updated_at from bookings where id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return mapBookingRow(result.rows[0]);
  }

  // --- MEDIA ASSETS ---

  async addMediaAsset(input: Omit<MediaAsset, "id" | "createdAt">): Promise<MediaAsset> {
    const pool = await this.pool();
    const result = await pool.query(
      `
      insert into media_assets (blob_url, file_name, size_bytes, mime_type)
      values ($1, $2, $3, $4)
      returning id, blob_url, file_name, size_bytes, mime_type, created_at
      `,
      [input.blobUrl, input.fileName, input.sizeBytes, input.mimeType ?? null]
    );
    const row = result.rows[0];
    return {
      id: asString(row.id),
      blobUrl: asString(row.blob_url),
      fileName: asString(row.file_name),
      sizeBytes: asNumber(row.size_bytes),
      mimeType: typeof row.mime_type === "string" ? row.mime_type : undefined,
      createdAt: asString(row.created_at)
    };
  }

  async getMediaAssets(limit = 50, offset = 0): Promise<{ assets: MediaAsset[]; total: number }> {
    const pool = await this.pool();
    const [dataResult, countResult] = await Promise.all([
      pool.query(`select id, blob_url, file_name, size_bytes, mime_type, created_at from media_assets order by created_at desc limit $1 offset $2`, [limit, offset]),
      pool.query(`select count(*) as c from media_assets`)
    ]);

    const assets = dataResult.rows.map((row) => ({
      id: asString(row.id),
      blobUrl: asString(row.blob_url),
      fileName: asString(row.file_name),
      sizeBytes: asNumber(row.size_bytes),
      mimeType: typeof row.mime_type === "string" ? row.mime_type : undefined,
      createdAt: asString(row.created_at)
    }));

    return {
      assets,
      total: asNumber(countResult.rows[0]?.c)
    };
  }

  async deleteMediaAsset(id: string): Promise<void> {
    const pool = await this.pool();
    await pool.query(
      `delete from media_assets where id = $1`,
      [id]
    );
  }

  // --- ARTICLES ---

  async createArticle(input: CreateArticleInput): Promise<Article> {
    const pool = await this.pool();
    const result = await pool.query(
      `
      insert into articles (title, slug, summary, content, cover_image, tags, status, publish_date)
      values ($1, $2, $3, $4, $5, $6, $7, $8::timestamp with time zone)
      returning id, title, slug, summary, content, cover_image, tags, status, publish_date, created_at, updated_at
      `,
      [
        input.title,
        input.slug,
        input.summary ?? null,
        input.content,
        input.coverImage ?? null,
        input.tags ?? null,
        input.status,
        input.publishDate ?? null
      ]
    );
    const row = result.rows[0];
    return this.mapArticleRow(row);
  }

  async updateArticle(id: string, input: UpdateArticleInput): Promise<Article> {
    const pool = await this.pool();
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value === undefined) return;
      let dbField = key;
      if (key === 'coverImage') dbField = 'cover_image';
      if (key === 'publishDate') {
        dbField = 'publish_date';
        setClauses.push(`${dbField} = $${paramIndex}::timestamp with time zone`);
      } else {
         setClauses.push(`${dbField} = $${paramIndex}`);
      }
      values.push(value);
      paramIndex++;
    });

    setClauses.push(`updated_at = now()`);
    values.push(id);

    const query = `
      update articles
      set ${setClauses.join(', ')}
      where id = $${paramIndex}
      returning id, title, slug, summary, content, cover_image, tags, status, publish_date, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    if (!result.rows[0]) throw new Error("Article not found");
    return this.mapArticleRow(result.rows[0]);
  }

  async deleteArticle(id: string): Promise<void> {
    const pool = await this.pool();
    await pool.query(`delete from articles where id = $1`, [id]);
  }

  async getArticleById(id: string): Promise<Article | null> {
    const pool = await this.pool();
    const result = await pool.query(`select * from articles where id = $1`, [id]);
    if (result.rows.length === 0) return null;
    return this.mapArticleRow(result.rows[0]);
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const pool = await this.pool();
    const result = await pool.query(`select * from articles where slug = $1`, [slug]);
    if (result.rows.length === 0) return null;
    return this.mapArticleRow(result.rows[0]);
  }

  async getArticles(limit = 50, offset = 0, onlyPublished = false): Promise<{ articles: Article[]; total: number }> {
    const pool = await this.pool();
    let queryBase = `from articles`;
    const params: unknown[] = [limit, offset];
    if (onlyPublished) {
      queryBase += ` where status = 'PUBLISHED'`;
    }

    const [dataResult, countResult] = await Promise.all([
      pool.query(`select * ${queryBase} order by publish_date desc nulls last, created_at desc limit $1 offset $2`, params),
      pool.query(`select count(*) as c ${queryBase}`)
    ]);

    return {
      articles: dataResult.rows.map(r => this.mapArticleRow(r)),
      total: asNumber(countResult.rows[0]?.c)
    };
  }

  private mapArticleRow(row: Record<string, unknown>): Article {
    return {
      id: asString(row.id),
      title: asString(row.title),
      slug: asString(row.slug),
      summary: typeof row.summary === 'string' ? row.summary : undefined,
      content: asString(row.content),
      coverImage: typeof row.cover_image === 'string' ? row.cover_image : undefined,
      tags: typeof row.tags === 'string' ? row.tags : undefined,
      status: asString(row.status) as ArticleStatus,
      publishDate: asString(row.publish_date),
      createdAt: asString(row.created_at),
      updatedAt: asString(row.updated_at)
    };
  }
}


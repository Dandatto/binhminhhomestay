-- Core schema v1 for booking, consent, and audit.

create extension if not exists "pgcrypto";

create table if not exists policy_versions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  effective_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  guest_name text not null,
  phone text not null,
  email text,
  check_in_date date not null,
  check_out_date date not null,
  room_type text not null,
  status text not null check (status in ('PENDING_CONFIRMATION','CONFIRMED','FAILED','CANCELLED')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_dates on bookings(check_in_date, check_out_date);
create index if not exists idx_bookings_status on bookings(status);

create table if not exists consent_logs (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('BOOKING','LEAD')),
  subject_ref text not null,
  consent_type text not null,
  consent_given boolean not null,
  policy_version text not null,
  source_ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_consent_subject on consent_logs(subject_type, subject_ref);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('SYSTEM','ADMIN','CUSTOMER')),
  actor_ref text,
  event_type text not null,
  entity_type text not null,
  entity_ref text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_events_entity on audit_events(entity_type, entity_ref, created_at desc);

create table if not exists idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  request_hash text not null,
  status text not null check (status in ('IN_PROGRESS','COMPLETED','FAILED')),
  response_payload jsonb,
  response_status_code integer,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_idempotency_expires on idempotency_keys(expires_at);

create table if not exists outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null,
  status text not null check (status in ('PENDING','PROCESSING','DONE','FAILED')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  worker_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_outbox_dispatch on outbox_events(status, available_at, created_at);

create table if not exists data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('ACCESS','RECTIFY','ERASE','PORTABILITY')),
  requester_ref text not null,
  status text not null check (status in ('OPEN','IN_PROGRESS','DONE','REJECTED')),
  due_at timestamptz not null,
  result_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

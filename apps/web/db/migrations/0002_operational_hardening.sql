-- Operational hardening: integrity constraints, updated_at triggers, and dispatch indexes.

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Ensure booking dates are always valid.
alter table bookings
  drop constraint if exists chk_bookings_date_range;

alter table bookings
  add constraint chk_bookings_date_range
  check (check_out_date > check_in_date);

-- Auto-update updated_at columns.
drop trigger if exists trg_bookings_set_updated_at on bookings;
create trigger trg_bookings_set_updated_at
before update on bookings
for each row execute function set_updated_at();

drop trigger if exists trg_idempotency_set_updated_at on idempotency_keys;
create trigger trg_idempotency_set_updated_at
before update on idempotency_keys
for each row execute function set_updated_at();

drop trigger if exists trg_outbox_set_updated_at on outbox_events;
create trigger trg_outbox_set_updated_at
before update on outbox_events
for each row execute function set_updated_at();

drop trigger if exists trg_data_subject_requests_set_updated_at on data_subject_requests;
create trigger trg_data_subject_requests_set_updated_at
before update on data_subject_requests
for each row execute function set_updated_at();

-- Improve outbox dispatch and triage queries.
create index if not exists idx_outbox_pending_dispatch
  on outbox_events(available_at asc, created_at asc)
  where status = 'PENDING';

create index if not exists idx_outbox_failed_triage
  on outbox_events(updated_at desc)
  where status = 'FAILED';

-- Improve idempotency cleanup scans.
create index if not exists idx_idempotency_expired_scan
  on idempotency_keys(expires_at asc)
  where status in ('COMPLETED', 'FAILED');

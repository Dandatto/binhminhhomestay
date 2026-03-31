-- Migration 0003: Vessel Schedules
-- Stores daily ferry schedules that admin can update without code changes.
-- Route context: Ao Tien Port (Van Don) <-> Minh Chau Island

create table if not exists vessel_schedules (
  id          bigserial primary key,
  route       text        not null default 'Ao Tiên ↔ Minh Châu',
  operator    text        not null,
  departure   time        not null,   -- e.g. '07:30'
  direction   text        not null check (direction in ('inbound', 'outbound', 'both')),
  schedule_date date      not null default current_date,
  status      text        not null default 'scheduled'
                check (status in ('scheduled', 'departed', 'arrived', 'cancelled')),
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast daily lookups
create index if not exists idx_vessel_schedules_date
  on vessel_schedules (schedule_date);

-- Seed default schedule for today (can be overridden by admin)
insert into vessel_schedules (operator, departure, direction, schedule_date, status)
values
  ('Havaco',      '07:30', 'inbound',  current_date, 'scheduled'),
  ('Quang Minh',  '10:00', 'both',     current_date, 'scheduled'),
  ('Havaco',      '13:30', 'outbound', current_date, 'scheduled'),
  ('Kalong',      '15:30', 'inbound',  current_date, 'scheduled')
on conflict do nothing;

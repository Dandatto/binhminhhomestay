-- migrations/20260331_add_completed_status.sql
ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'FAILED',
    'CANCELLED',
    'COMPLETED'
  ));

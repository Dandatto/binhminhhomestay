-- Cần thiết để hỗ trợ xử lý PostgreSQL 23505 cho Cùng loại phòng và thời điểm
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_double_booking_active
  ON bookings(room_type, check_in_date, check_out_date)
  WHERE status IN ('PENDING_CONFIRMATION', 'CONFIRMED');

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value text not null,
  description text,
  updated_at timestamptz not null default now()
);

-- Insert default pricing settings
insert into app_settings (setting_key, setting_value, description) values
  ('pricing_combo', '3065000', 'Giá Combo 3N2D / khách'),
  ('pricing_room_2_bed', '1600000', 'Căn Phi Thuyền 2 giường gốc'),
  ('pricing_room_1_bed', '1400000', 'Căn Phi Thuyền 1 giường gốc'),
  ('pricing_homestay_2_bed', '1400000', 'Homestay 2 giường gốc'),
  ('pricing_homestay_1_bed', '1200000', 'Homestay 1 giường gốc'),
  ('pricing_weekend_surcharge', '200000', 'Phụ thu cuối tuần (Thứ 6, 7, CN)'),
  ('pricing_holiday_multiplier', '1.0', 'Hệ số tăng giá ngày Lễ (1.0 là không tăng)')
on conflict (setting_key) do nothing;

create index if not exists idx_bookings_created_at on bookings(created_at desc);

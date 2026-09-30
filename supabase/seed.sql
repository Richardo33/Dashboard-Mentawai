insert into public.dashboard_config (key, value)
values
  ('current_year', '2026'),
  ('current_period', '"September"'),
  ('pbjt_rate', '0.10'),
  ('last_updated', '"23 September 2026, 13:42 WIB"')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.taxpayers (id, name, business_type, district, district_code, nib, village, active, mpos_status, image_path, address, registered_date, owner_name, owner_npwp, owner_contact, owner_email)
values
  ('wp-001', 'Hotel Mentawai Resort', 'Hotel', 'Sipora Selatan', '13.09.10', '1208900100001', 'Sioban', true, 'online', 'hotel-mentawai-resort.webp', 'Jl. Pantai Tuapejat', '2024-01-15', 'Pak Andri', '01.234.567.0-001.000', '081234500001', 'andri@gmail.com'),
  ('wp-002', 'Sipora Beach Resort', 'Hotel', 'Sipora Selatan', '13.09.10', '1208900100002', 'Tuapejat', true, 'online', 'sipora-beach-resort.webp', 'Jl. Pantai Sioban', '2024-02-10', 'Bu Meri', '02.345.678.0-002.000', '081234500002', 'meri@gmail.com'),
  ('wp-003', 'Siberut Island Resort', 'Hotel', 'Siberut Barat', '13.09.05', '1208900100039', 'Simalegi', true, 'offline', 'siberut-island-resort.webp', 'Jl. Pantai Siberut', '2024-02-18', 'Pak Rudi', '03.456.789.0-003.000', '081234500003', 'rudi@gmail.com'),
  ('wp-004', 'Mentawai Waves Lodge', 'Hotel', 'Siberut Utara', '13.09.04', '1208900100004', 'Muara Sikabaluan', true, 'online', 'mentawai-waves-lodge.webp', 'Jl. Pantai Tuapejat', '2024-01-15', 'Pengelola Mentawai Waves Lodge', '04.567.890.0-004.000', '081234500004', 'waves@gmail.com'),
  ('wp-005', 'Pagai Surf Resort', 'Hotel', 'Pagai Selatan', '13.09.10', '1208900100005', 'Malakopa', true, 'syncing', 'pagai-surf-resort.webp', 'Jl. Pantai Pagai', '2024-01-20', 'Bu Sinta', '05.678.901.0-005.000', '081234500005', 'sinta@gmail.com'),
  ('wp-006', 'Mentawai Coffee House', 'Restoran', 'Sipora Utara', '13.09.01', '1208900100006', 'Silaibu', true, 'online', 'mentawai-coffee-house.webp', 'Jl. Raya Silaibu', '2024-03-22', 'Bu Sari', '06.789.012.0-006.000', '081234500006', 'sari@gmail.com'),
  ('wp-007', 'Tuapejat Seafood', 'Restoran', 'Sipora Utara', '13.09.01', '1208900100007', 'Betumonga', true, 'online', 'tuapejat-seafood.webp', 'Jl. Pelabuhan Tuapejat', '2024-04-02', 'Pak Dedi', '07.890.123.0-007.000', '081234500007', 'dedi@gmail.com'),
  ('wp-008', 'Mentawai Grille', 'Restoran', 'Siberut Selatan', '13.09.03', '1208900100008', 'Maileppet', true, 'online', 'mentawai-grille.webp', 'Jl. Raya Maileppet', '2024-04-12', 'Bu Rina', '08.901.234.0-008.000', '081234500008', 'rina@gmail.com'),
  ('wp-009', 'Pagai Beach Cafe', 'Restoran', 'Pagai Selatan', '13.09.10', '1208900100009', 'Malakopa', true, 'online', 'pagai-beach-cafe.webp', 'Jl. Pantai Malakopa', '2024-04-16', 'Pak Yanto', '09.012.345.0-009.000', '081234500009', 'yanto@gmail.com'),
  ('wp-010', 'Siberut Restaurant', 'Restoran', 'Siberut Barat Daya', '13.09.06', '1208900100010', 'Katurei', false, 'offline', 'siberut-restaurant.webp', 'Jl. Raya Katurei', '2024-04-25', 'Pak Beni', '10.123.456.0-010.000', '081234500010', 'beni@gmail.com')
on conflict (id) do update set name = excluded.name, business_type = excluded.business_type, district = excluded.district, nib = excluded.nib, mpos_status = excluded.mpos_status, image_path = excluded.image_path, updated_at = now();

insert into public.mpos_devices (id, taxpayer_id, device, last_sync, transactions_today, status, offline_since)
values
  ('device-001', 'wp-001', 'MPOS-A1-101', '13.30.00', 12, 'Online', null),
  ('device-002', 'wp-002', 'MPOS-A1-102', '13.28.00', 8, 'Online', null),
  ('device-003', 'wp-003', 'MPOS-B2-201', '08.12.00', 0, 'Offline', now() - interval '96 hours'),
  ('device-004', 'wp-004', 'MPOS-C3-301', '13.35.00', 15, 'Online', null),
  ('device-005', 'wp-005', 'MPOS-D4-401', '11.50.00', 6, 'Syncing', null),
  ('device-006', 'wp-006', 'MPOS-A1-103', '13.32.00', 22, 'Online', null),
  ('device-007', 'wp-007', 'MPOS-A1-104', '13.20.00', 18, 'Online', null),
  ('device-008', 'wp-008', 'MPOS-B2-202', '14.00.00', 0, 'Offline', now() - interval '80 hours'),
  ('device-009', 'wp-009', 'MPOS-A1-105', '13.10.00', 14, 'Online', null),
  ('device-010', 'wp-010', 'MPOS-A1-106', '13.40.00', 20, 'Online', null)
on conflict (id) do update set status = excluded.status, last_sync = excluded.last_sync, transactions_today = excluded.transactions_today, offline_since = excluded.offline_since, updated_at = now();

-- Deterministic transaction generator: 8 transactions per taxpayer per month.
insert into public.transactions (id, taxpayer_id, transaction_date, transaction_time, amount, payment_method, status)
select
  format('INV-%s-%s', years.year, lpad((taxpayers.taxpayer_index * 1000 + months.month_index * 8 + sequence_number + 2000)::text, 6, '0')),
  taxpayers.id,
  make_date(years.year::integer, months.month_index::integer, (2 + ((taxpayers.taxpayer_index * 3 + months.month_index * 2 + sequence_number * 4) % 24))::integer),
  lpad((8 + ((sequence_number * 2 + taxpayers.taxpayer_index) % 11))::text, 2, '0') || '.' || lpad(((sequence_number * 7 + taxpayers.taxpayer_index * 3) % 60)::text, 2, '0'),
  (case when taxpayers.business_type = 'Hotel' then 5800000 else 2400000 end) + ((taxpayers.taxpayer_index * 731000 + months.month_index * 421000 + sequence_number * 183000 + case when years.year = 2025 then 90000 else 0 end) % 8000000),
  (array['QRIS', 'Kartu Debit', 'Tunai', 'Transfer Bank', 'Virtual Account'])[(sequence_number % 5) + 1],
  case when sequence_number = 7 and months.month_index % 3 = 1 then 'Pending' else 'Paid' end
from (select id, business_type, row_number() over (order by id) - 1 as taxpayer_index from public.taxpayers) taxpayers
cross join (values (2025, 12), (2026, 9)) years(year, month_count)
cross join lateral generate_series(1, years.month_count) months(month_index)
cross join lateral generate_series(0, 7) sequences(sequence_number)
on conflict (id) do nothing;

-- Demo anomaly fixtures. Remove or replace these rows before importing real production data.
insert into public.transactions
  (id, taxpayer_id, transaction_date, transaction_time, amount, payment_method, status, connection_mode, is_offline, voided, void_approved, void_at)
values
  ('INV-FRAUD-MICRO-001', 'wp-007', current_date, '09.01', 3500, 'Tunai', 'Paid', 'online', false, false, null, null),
  ('INV-FRAUD-OFFLINE-001', 'wp-003', current_date, '09.15', 30000000, 'Tunai', 'Paid', 'offline', true, false, null, null),
  ('INV-FRAUD-VOID-001', 'wp-008', current_date, '10.01', 150000, 'Tunai', 'Paid', 'online', false, true, true, now() - interval '10 minutes'),
  ('INV-FRAUD-VOID-002', 'wp-008', current_date, '10.16', 175000, 'Tunai', 'Paid', 'online', false, true, true, now() - interval '20 minutes'),
  ('INV-FRAUD-VOID-003', 'wp-008', current_date, '10.31', 125000, 'Tunai', 'Paid', 'online', false, true, true, now() - interval '30 minutes'),
  ('INV-FRAUD-VOID-004', 'wp-008', current_date, '10.46', 200000, 'Tunai', 'Paid', 'online', false, true, false, now() - interval '40 minutes')
on conflict (id) do update set
  amount = excluded.amount,
  connection_mode = excluded.connection_mode,
  is_offline = excluded.is_offline,
  voided = excluded.voided,
  void_approved = excluded.void_approved,
  void_at = excluded.void_at;

-- Force one current-period taxpayer below 40% of its historical monthly average.
update public.transactions
set amount = 100000
where taxpayer_id = 'wp-006'
  and transaction_date >= make_date(2026, 9, 1)
  and transaction_date < make_date(2026, 10, 1)
  and id not like 'INV-FRAUD-%';

insert into public.sptpd_records (id, taxpayer_id, period_month, period_year, mpos_amount, reported_amount, pbjt_amount, status)
select
  format('sptpd-%s-%s-%s', taxpayers.id, years.year, lpad(months.month_index::text, 2, '0')),
  taxpayers.id,
  months.month_index,
  years.year,
  coalesce(sum(transactions.amount), 0),
  case when years.year = 2026 and months.month_index = 9 then 0 when years.year = 2026 and months.month_index = 8 then round(coalesce(sum(transactions.amount), 0) * 0.8) else coalesce(sum(transactions.amount), 0) end,
  case when years.year = 2026 and months.month_index = 9 then 0 when years.year = 2026 and months.month_index = 8 then round(coalesce(sum(transactions.amount), 0) * 0.8 * 0.1) else round(coalesce(sum(transactions.amount), 0) * 0.1) end,
  case when years.year = 2026 and months.month_index = 9 then 'Belum Dilaporkan' when years.year = 2026 and months.month_index = 8 then 'Perlu Ditinjau' else 'Sudah Dilaporkan' end
from public.taxpayers taxpayers
cross join (values (2025), (2026)) years(year)
cross join lateral generate_series(1, case when years.year = 2026 then 9 else 12 end) months(month_index)
left join public.transactions transactions on transactions.taxpayer_id = taxpayers.id and extract(year from transactions.transaction_date) = years.year and extract(month from transactions.transaction_date) = months.month_index
group by taxpayers.id, years.year, months.month_index
on conflict (id) do update set mpos_amount = excluded.mpos_amount, reported_amount = excluded.reported_amount, pbjt_amount = excluded.pbjt_amount, status = excluded.status;

insert into public.stpd_records (id, taxpayer_id, period_month, period_year, principal, penalty, total, paid, remaining, due_date, status, issued_date)
values
  ('stpd-001', 'wp-001', 7, 2026, 5600000, 56000, 5656000, 0, 5656000, '2026-09-04', 'Overdue', '2026-08-05'),
  ('stpd-002', 'wp-003', 6, 2026, 4400000, 44000, 4444000, 0, 4444000, '2026-08-04', 'Overdue', '2026-07-05'),
  ('stpd-003', 'wp-009', 7, 2026, 2400000, 24000, 2424000, 969600, 1454400, '2026-09-04', 'Partial', '2026-08-05'),
  ('stpd-004', 'wp-009', 8, 2026, 2000000, 20000, 2020000, 0, 2020000, '2026-10-05', 'Outstanding', '2026-09-05')
on conflict (id) do update set principal = excluded.principal, penalty = excluded.penalty, total = excluded.total, paid = excluded.paid, remaining = excluded.remaining, status = excluded.status;

insert into public.alerts (id, taxpayer_id, title, type, level, detail, alert_time)
values
  ('sptpd-001', 'wp-001', 'SPTPD belum dilaporkan', 'SPTPD', 'warning', 'September 2026', '2026-09-28 18:13:34+07'),
  ('sptpd-002', 'wp-002', 'SPTPD belum dilaporkan', 'SPTPD', 'warning', 'September 2026', '2026-09-28 17:13:34+07'),
  ('sptpd-003', 'wp-003', 'SPTPD belum dilaporkan', 'SPTPD', 'warning', 'September 2026', '2026-09-28 16:13:34+07'),
  ('sptpd-004', 'wp-004', 'SPTPD belum dilaporkan', 'SPTPD', 'warning', 'September 2026', '2026-09-28 15:13:34+07'),
  ('sptpd-005', 'wp-005', 'SPTPD belum dilaporkan', 'SPTPD', 'warning', 'September 2026', '2026-09-28 14:13:34+07'),
  ('rek-001', 'wp-006', 'Selisih rekonsiliasi terdeteksi', 'REKONSILIASI', 'warning', 'selisih omzet Rp 6.000.000', '2026-09-28 13:13:34+07'),
  ('rek-002', 'wp-005', 'Selisih rekonsiliasi terdeteksi', 'REKONSILIASI', 'warning', 'selisih omzet Rp 0', '2026-09-28 12:13:34+07'),
  ('stpd-001', 'wp-001', 'STPD belum diselesaikan', 'STPD', 'critical', 'sisa Rp 5.656.000', '2026-09-28 10:13:34+07'),
  ('stpd-002', 'wp-003', 'STPD belum diselesaikan', 'STPD', 'critical', 'sisa Rp 4.444.000', '2026-09-28 09:13:34+07'),
  ('stpd-003', 'wp-009', 'STPD belum diselesaikan', 'STPD', 'critical', 'sisa Rp 2.424.000', '2026-09-28 08:13:34+07'),
  ('stpd-004', 'wp-009', 'STPD belum diselesaikan', 'STPD', 'critical', 'sisa Rp 2.020.000', '2026-09-28 07:13:34+07'),
  ('mpos-001', 'wp-003', 'MPOS offline terdeteksi', 'MPOS', 'critical', 'offline lebih dari 24 jam', '2026-09-28 06:13:34+07'),
  ('mpos-002', 'wp-010', 'MPOS belum tersinkronisasi', 'MPOS', 'warning', 'sinkronisasi terakhir tidak tersedia', '2026-09-28 05:13:34+07')
on conflict (id) do update set title = excluded.title, type = excluded.type, level = excluded.level, detail = excluded.detail, alert_time = excluded.alert_time;

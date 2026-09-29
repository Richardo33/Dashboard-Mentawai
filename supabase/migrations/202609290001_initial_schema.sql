create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'Administrator' check (role in ('Administrator', 'Operator', 'Viewer')),
  avatar_path text,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.taxpayers (
  id text primary key,
  name text not null,
  business_type text not null check (business_type in ('Hotel', 'Restoran')),
  district text not null,
  district_code text not null,
  nib text,
  village text not null,
  active boolean not null default true,
  mpos_status text not null default 'online' check (mpos_status in ('online', 'syncing', 'offline')),
  image_path text,
  address text not null,
  registered_date date not null,
  owner_name text not null,
  owner_npwp text not null,
  owner_contact text not null,
  owner_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  taxpayer_id text not null references public.taxpayers(id) on delete cascade,
  transaction_date date not null,
  transaction_time text not null,
  amount bigint not null check (amount >= 0),
  payment_method text not null check (payment_method in ('QRIS', 'Kartu Debit', 'Tunai', 'Transfer Bank', 'Virtual Account')),
  status text not null check (status in ('Paid', 'Pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.sptpd_records (
  id text primary key,
  taxpayer_id text not null references public.taxpayers(id) on delete cascade,
  period_month smallint not null check (period_month between 1 and 12),
  period_year smallint not null,
  mpos_amount bigint not null default 0,
  reported_amount bigint not null default 0,
  pbjt_amount bigint not null default 0,
  status text not null check (status in ('Sudah Dilaporkan', 'Perlu Ditinjau', 'Belum Dilaporkan')),
  reported_at timestamptz,
  created_at timestamptz not null default now(),
  unique (taxpayer_id, period_month, period_year)
);

create table if not exists public.mpos_devices (
  id text primary key,
  taxpayer_id text not null references public.taxpayers(id) on delete cascade,
  device text not null unique,
  last_sync text not null,
  transactions_today integer not null default 0 check (transactions_today >= 0),
  status text not null check (status in ('Online', 'Syncing', 'Offline')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stpd_records (
  id text primary key,
  taxpayer_id text not null references public.taxpayers(id) on delete cascade,
  period_month smallint not null check (period_month between 1 and 12),
  period_year smallint not null,
  principal bigint not null default 0,
  penalty bigint not null default 0,
  total bigint not null default 0,
  paid bigint not null default 0,
  remaining bigint not null default 0,
  due_date date not null,
  status text not null check (status in ('Overdue', 'Partial', 'Outstanding', 'Paid')),
  issued_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id text primary key,
  taxpayer_id text not null references public.taxpayers(id) on delete cascade,
  title text not null,
  type text not null check (type in ('SPTPD', 'REKONSILIASI', 'STPD', 'MPOS')),
  level text not null check (level in ('warning', 'critical')),
  detail text not null,
  alert_time timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_taxpayer_date_idx on public.transactions(taxpayer_id, transaction_date desc);
create index if not exists sptpd_taxpayer_period_idx on public.sptpd_records(taxpayer_id, period_year, period_month);
create index if not exists alerts_type_level_idx on public.alerts(type, level, alert_time desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists mpos_devices_set_updated_at on public.mpos_devices;
create trigger mpos_devices_set_updated_at before update on public.mpos_devices for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)), 'Administrator')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('taxpayer-images', 'taxpayer-images', true), ('profile-avatars', 'profile-avatars', false)
on conflict (id) do update set public = excluded.public;

alter table public.profiles enable row level security;
alter table public.dashboard_config enable row level security;
alter table public.taxpayers enable row level security;
alter table public.transactions enable row level security;
alter table public.sptpd_records enable row level security;
alter table public.mpos_devices enable row level security;
alter table public.stpd_records enable row level security;
alter table public.alerts enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['dashboard_config','taxpayers','transactions','sptpd_records','mpos_devices','stpd_records','alerts'] loop
    execute format('drop policy if exists "Authenticated users can read %1$s" on public.%1$s', table_name);
    execute format('create policy "Authenticated users can read %1$s" on public.%1$s for select to authenticated using (true)', table_name);
    execute format('drop policy if exists "Authenticated users can manage %1$s" on public.%1$s', table_name);
    execute format('create policy "Authenticated users can manage %1$s" on public.%1$s for all to authenticated using (true) with check (true)', table_name);
  end loop;
end;
$$;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Public can read taxpayer images" on storage.objects;
create policy "Public can read taxpayer images" on storage.objects for select using (bucket_id = 'taxpayer-images');
drop policy if exists "Authenticated users manage taxpayer images" on storage.objects;
create policy "Authenticated users manage taxpayer images" on storage.objects for all to authenticated using (bucket_id = 'taxpayer-images') with check (bucket_id = 'taxpayer-images');
drop policy if exists "Users read own avatar" on storage.objects;
create policy "Users read own avatar" on storage.objects for select to authenticated using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users manage own avatar" on storage.objects;
create policy "Users manage own avatar" on storage.objects for all to authenticated using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

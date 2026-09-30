-- Fraud detection fields used by the Overview anti-fraud engine.
-- This migration is additive and safe to run against an existing production database.

alter table public.transactions
  add column if not exists connection_mode text not null default 'online',
  add column if not exists is_offline boolean not null default false,
  add column if not exists voided boolean not null default false,
  add column if not exists void_approved boolean,
  add column if not exists void_approved_by uuid references auth.users(id) on delete set null,
  add column if not exists void_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_connection_mode_check') then
    alter table public.transactions
      add constraint transactions_connection_mode_check
      check (connection_mode in ('online', 'offline'));
  end if;
end;
$$;

create index if not exists transactions_fraud_amount_idx
  on public.transactions (taxpayer_id, amount)
  where amount < 25000000;
create index if not exists transactions_fraud_void_idx
  on public.transactions (taxpayer_id, void_at)
  where voided = true;
create index if not exists transactions_fraud_offline_idx
  on public.transactions (taxpayer_id, transaction_date desc)
  where is_offline = true;

alter table public.mpos_devices
  add column if not exists offline_since timestamptz,
  add column if not exists heartbeat_disabled boolean not null default false;

create index if not exists mpos_devices_fraud_status_idx
  on public.mpos_devices (status, offline_since);

create or replace function public.set_mpos_fraud_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Offline' and (tg_op = 'INSERT' or old.status <> 'Offline') then
    new.offline_since = coalesce(new.offline_since, now());
  elsif new.status <> 'Offline' then
    new.offline_since = null;
  end if;
  return new;
end;
$$;

drop trigger if exists mpos_devices_set_fraud_timestamps on public.mpos_devices;
create trigger mpos_devices_set_fraud_timestamps
before insert or update of status, offline_since on public.mpos_devices
for each row execute function public.set_mpos_fraud_timestamps();

-- Existing offline devices need a starting point for the 24/72 hour rule.
-- updated_at is the best available historical timestamp before this migration.
update public.mpos_devices
set offline_since = coalesce(offline_since, updated_at, now())
where status = 'Offline' and offline_since is null;

-- Keep the anomaly engine's seasonal exclusion configurable without a code deploy.
insert into public.dashboard_config (key, value)
values ('fraud_low_season_months', '[]'::jsonb)
on conflict (key) do nothing;

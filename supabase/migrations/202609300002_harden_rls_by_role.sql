-- Harden RLS by application role.
-- Viewer: read-only dashboard access.
-- Operator: read and manage operational records, but no deletes/configuration.
-- Administrator: full access to application data and configuration.

create or replace function public.has_any_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = any(required_roles)
  );
$$;

revoke execute on function public.has_any_role(text[]) from public;
grant execute on function public.has_any_role(text[]) to authenticated;

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_any_role(array['Administrator'])
     and (new.role is distinct from old.role or new.email is distinct from old.email) then
    raise exception 'Only an Administrator can change profile role or email';
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_profile_privilege_escalation() from public;
grant execute on function public.prevent_profile_privilege_escalation() to authenticated;

drop trigger if exists profiles_protect_privileged_fields on public.profiles;
create trigger profiles_protect_privileged_fields
before update on public.profiles
for each row execute function public.prevent_profile_privilege_escalation();

-- New OAuth/email users must start as read-only. Promote them explicitly later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    'Viewer'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Remove the original broad policies before creating role-scoped policies.
drop policy if exists "Authenticated users can read dashboard_config" on public.dashboard_config;
drop policy if exists "Authenticated users can manage dashboard_config" on public.dashboard_config;
drop policy if exists "Authenticated users can read taxpayers" on public.taxpayers;
drop policy if exists "Authenticated users can manage taxpayers" on public.taxpayers;
drop policy if exists "Authenticated users can read transactions" on public.transactions;
drop policy if exists "Authenticated users can manage transactions" on public.transactions;
drop policy if exists "Authenticated users can read sptpd_records" on public.sptpd_records;
drop policy if exists "Authenticated users can manage sptpd_records" on public.sptpd_records;
drop policy if exists "Authenticated users can read mpos_devices" on public.mpos_devices;
drop policy if exists "Authenticated users can manage mpos_devices" on public.mpos_devices;
drop policy if exists "Authenticated users can read stpd_records" on public.stpd_records;
drop policy if exists "Authenticated users can manage stpd_records" on public.stpd_records;
drop policy if exists "Authenticated users can read alerts" on public.alerts;
drop policy if exists "Authenticated users can manage alerts" on public.alerts;

create policy "Authenticated users can read dashboard_config"
on public.dashboard_config for select to authenticated using (true);
create policy "Administrators can manage dashboard_config"
on public.dashboard_config for all to authenticated
using (public.has_any_role(array['Administrator']))
with check (public.has_any_role(array['Administrator']));

create policy "Authenticated users can read taxpayers"
on public.taxpayers for select to authenticated using (true);
create policy "Operators can create taxpayers"
on public.taxpayers for insert to authenticated
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Operators can update taxpayers"
on public.taxpayers for update to authenticated
using (public.has_any_role(array['Administrator', 'Operator']))
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Administrators can delete taxpayers"
on public.taxpayers for delete to authenticated
using (public.has_any_role(array['Administrator']));

create policy "Authenticated users can read transactions"
on public.transactions for select to authenticated using (true);
create policy "Operators can create transactions"
on public.transactions for insert to authenticated
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Operators can update transactions"
on public.transactions for update to authenticated
using (public.has_any_role(array['Administrator', 'Operator']))
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Administrators can delete transactions"
on public.transactions for delete to authenticated
using (public.has_any_role(array['Administrator']));

create policy "Authenticated users can read sptpd_records"
on public.sptpd_records for select to authenticated using (true);
create policy "Operators can create sptpd_records"
on public.sptpd_records for insert to authenticated
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Operators can update sptpd_records"
on public.sptpd_records for update to authenticated
using (public.has_any_role(array['Administrator', 'Operator']))
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Administrators can delete sptpd_records"
on public.sptpd_records for delete to authenticated
using (public.has_any_role(array['Administrator']));

create policy "Authenticated users can read mpos_devices"
on public.mpos_devices for select to authenticated using (true);
create policy "Operators can create mpos_devices"
on public.mpos_devices for insert to authenticated
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Operators can update mpos_devices"
on public.mpos_devices for update to authenticated
using (public.has_any_role(array['Administrator', 'Operator']))
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Administrators can delete mpos_devices"
on public.mpos_devices for delete to authenticated
using (public.has_any_role(array['Administrator']));

create policy "Authenticated users can read stpd_records"
on public.stpd_records for select to authenticated using (true);
create policy "Operators can create stpd_records"
on public.stpd_records for insert to authenticated
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Operators can update stpd_records"
on public.stpd_records for update to authenticated
using (public.has_any_role(array['Administrator', 'Operator']))
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Administrators can delete stpd_records"
on public.stpd_records for delete to authenticated
using (public.has_any_role(array['Administrator']));

create policy "Authenticated users can read alerts"
on public.alerts for select to authenticated using (true);
create policy "Operators can create alerts"
on public.alerts for insert to authenticated
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Operators can update alerts"
on public.alerts for update to authenticated
using (public.has_any_role(array['Administrator', 'Operator']))
with check (public.has_any_role(array['Administrator', 'Operator']));
create policy "Administrators can delete alerts"
on public.alerts for delete to authenticated
using (public.has_any_role(array['Administrator']));

-- Taxpayer images are public by design, but only operators/admins may upload or change them.
drop policy if exists "Authenticated users manage taxpayer images" on storage.objects;
create policy "Operators manage taxpayer images"
on storage.objects for all to authenticated
using (bucket_id = 'taxpayer-images' and public.has_any_role(array['Administrator', 'Operator']))
with check (bucket_id = 'taxpayer-images' and public.has_any_role(array['Administrator', 'Operator']));

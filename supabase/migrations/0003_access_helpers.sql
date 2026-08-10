-- Access-control helper functions used inside RLS policies (section 5.3).
-- security definer so they can be used inside RLS policies without recursive
-- RLS evaluation on user_profiles itself. Split into its own migration
-- because these are LANGUAGE SQL functions, which Postgres validates
-- against the catalog at CREATE time — they need user_profiles,
-- organisations and event_members (from 0002) to already exist.

create or replace function current_profile_account_type()
returns account_type
language sql
stable
security definer
set search_path = public
as $$
  select account_type from user_profiles where id = auth.uid();
$$;

create or replace function current_profile_staff_role()
returns staff_role
language sql
stable
security definer
set search_path = public
as $$
  select staff_role from user_profiles where id = auth.uid();
$$;

create or replace function current_profile_organisation_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organisation_id from user_profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select current_profile_staff_role() = 'admin';
$$;

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select current_profile_account_type() = 'staff' and current_profile_staff_role() is not null;
$$;

create or replace function is_manager_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select current_profile_staff_role() in ('admin', 'manager');
$$;

create or replace function has_event_access(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    is_admin()
    or exists (
      select 1 from event_members
      where event_members.event_id = p_event_id
        and event_members.user_id = auth.uid()
    );
$$;

create or replace function has_event_client_access(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from events
    where events.id = p_event_id
      and events.organisation_id = current_profile_organisation_id()
  ) and current_profile_account_type() = 'client';
$$;

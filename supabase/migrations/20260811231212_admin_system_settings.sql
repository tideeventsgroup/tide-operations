-- Central administration settings and complete client-organisation access.

create table public.system_settings (
  id text primary key default 'default' check (id = 'default'),
  company_name text not null default 'Tide Events Group',
  legal_name text not null default 'Tide Events Group Scotland',
  registration_number text,
  vat_number text,
  operations_email text not null default 'operations@tideeventsgroup.co.uk',
  accounts_email text,
  phone text,
  website text,
  postal_address text,
  default_currency text not null default 'GBP' check (char_length(default_currency) = 3),
  default_vat_rate numeric(5,2) not null default 20 check (default_vat_rate between 0 and 100),
  quote_valid_days integer not null default 30 check (quote_valid_days between 1 and 365),
  invoice_due_days integer not null default 14 check (invoice_due_days between 1 and 365),
  portal_welcome_message text not null default 'Your Tide account brings your events, documents, approvals and commercial records together in one place.',
  dark_logo_url text not null default 'https://res.cloudinary.com/p8fhvvbp/image/upload/v1786380229/TIDE_logo_white_ysmoay.png',
  light_logo_url text not null default 'https://res.cloudinary.com/p8fhvvbp/image/upload/v1785740902/1_2_lruapt.png',
  brand_primary text not null default '#373536',
  brand_accent text not null default '#60B9C5',
  updated_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_system_settings_updated_at
before update on public.system_settings
for each row execute function public.set_updated_at();

alter table public.system_settings enable row level security;

create policy "staff can read system settings"
on public.system_settings for select
to authenticated
using (public.is_staff());

create policy "admins can create system settings"
on public.system_settings for insert
to authenticated
with check (public.is_admin());

create policy "admins can update system settings"
on public.system_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update on public.system_settings to authenticated;

insert into public.system_settings (id) values ('default');

-- Client users may read their own organisation and contacts only while the
-- organisation's portal is enabled.
create policy "clients can view their portal organisation"
on public.organisations for select
to authenticated
using (
  public.current_profile_account_type() = 'client'
  and id = public.current_profile_organisation_id()
  and portal_access_enabled
);

create policy "clients can view their organisation contacts"
on public.contacts for select
to authenticated
using (
  public.current_profile_account_type() = 'client'
  and organisation_id = public.current_profile_organisation_id()
  and exists (
    select 1
    from public.organisations organisation
    where organisation.id = contacts.organisation_id
      and organisation.portal_access_enabled
  )
);

create or replace function public.has_event_client_access(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_profile_account_type() = 'client'
    and exists (
      select 1
      from public.events event
      join public.organisations organisation on organisation.id = event.organisation_id
      where event.id = p_event_id
        and event.organisation_id = public.current_profile_organisation_id()
        and organisation.portal_access_enabled
    );
$$;

revoke execute on function public.has_event_client_access(uuid) from public, anon;
grant execute on function public.has_event_client_access(uuid) to authenticated;

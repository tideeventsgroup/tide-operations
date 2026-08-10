-- Core entities: user_profiles, organisations, contacts, events, event_members,
-- milestones, tasks.

create table user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type account_type not null default 'pending',
  staff_role staff_role,
  organisation_id uuid, -- FK added after organisations exists
  full_name text not null default '',
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  relationship_status relationship_status not null default 'prospect',
  portal_access_enabled boolean not null default false,
  notes text,
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_profiles
  add constraint user_profiles_organisation_id_fkey
  foreign key (organisation_id) references organisations (id) on delete set null;

create table contacts (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text,
  is_primary boolean not null default false,
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations (id) on delete set null,
  name text not null,
  venue text,
  location text,
  start_date date,
  end_date date,
  expected_attendance integer,
  stage event_stage not null default 'enquiry',
  event_manager_id uuid references user_profiles (id),
  safety_manager_id uuid references user_profiles (id),
  control_location text,
  financial_value numeric(12, 2),
  key_contacts jsonb not null default '[]'::jsonb,
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table event_stage_history (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  from_stage event_stage,
  to_stage event_stage not null,
  changed_by uuid references user_profiles (id),
  changed_at timestamptz not null default now()
);

create table event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  user_id uuid not null references user_profiles (id) on delete cascade,
  role_on_event text not null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  title text not null,
  due_date date,
  status milestone_status not null default 'not_started',
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events (id) on delete cascade,
  title text not null,
  description text,
  owner_id uuid references user_profiles (id),
  due_date date,
  priority task_priority not null default 'medium',
  status task_status not null default 'to_do',
  milestone_id uuid references milestones (id) on delete set null,
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_contacts_organisation_id on contacts (organisation_id);
create index idx_events_organisation_id on events (organisation_id);
create index idx_event_members_event_id on event_members (event_id);
create index idx_event_members_user_id on event_members (user_id);
create index idx_milestones_event_id on milestones (event_id);
create index idx_tasks_event_id on tasks (event_id);
create index idx_tasks_owner_id on tasks (owner_id);
create index idx_tasks_milestone_id on tasks (milestone_id);
create index idx_event_stage_history_event_id on event_stage_history (event_id);

create trigger set_user_profiles_updated_at before update on user_profiles
  for each row execute function set_updated_at();
create trigger set_organisations_updated_at before update on organisations
  for each row execute function set_updated_at();
create trigger set_contacts_updated_at before update on contacts
  for each row execute function set_updated_at();
create trigger set_events_updated_at before update on events
  for each row execute function set_updated_at();
create trigger set_milestones_updated_at before update on milestones
  for each row execute function set_updated_at();
create trigger set_tasks_updated_at before update on tasks
  for each row execute function set_updated_at();

-- Stage-transition audit trail (section 6.2: "Stage transitions are logged").
create or replace function log_event_stage_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.stage is distinct from old.stage then
    insert into event_stage_history (event_id, from_stage, to_stage, changed_by)
    values (new.id, case when tg_op = 'INSERT' then null else old.stage end, new.stage, auth.uid());
  end if;
  return new;
end;
$$;

create trigger log_events_stage_transition
  after insert or update of stage on events
  for each row execute function log_event_stage_transition();

-- Auto-assign the creator of an event as its first event_member, so RLS
-- (which is event-membership scoped for non-admins) doesn't lock the
-- creator out of the event they just made.
create or replace function add_creator_as_event_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into event_members (event_id, user_id, role_on_event)
  values (new.id, auth.uid(), 'Event Manager')
  on conflict (event_id, user_id) do nothing;
  return new;
end;
$$;

create trigger add_creator_as_event_member_trigger
  after insert on events
  for each row execute function add_creator_as_event_member();

-- Prevent privilege escalation via direct table updates: only admins may
-- change account_type, staff_role or organisation_id on a profile. Role
-- assignment otherwise flows through the admin UI (still a plain UPDATE,
-- but performed by an authenticated admin).
create or replace function prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() and (
    new.account_type is distinct from old.account_type
    or new.staff_role is distinct from old.staff_role
    or new.organisation_id is distinct from old.organisation_id
  ) then
    raise exception 'Only an administrator can change account type, staff role or organisation.';
  end if;
  return new;
end;
$$;

create trigger prevent_profile_privilege_escalation_trigger
  before update on user_profiles
  for each row execute function prevent_profile_privilege_escalation();

-- New Supabase Auth users land as account_type = 'pending' with no
-- staff_role, per section 5.1's restricted-by-default registration model.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

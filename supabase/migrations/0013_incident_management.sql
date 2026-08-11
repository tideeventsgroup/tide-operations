-- Phase 5: Incident management.
--
-- A live operational subsystem for Event Control, distinct from the
-- office-hours planning tables. The log is append-only (corrections
-- supersede rather than overwrite — no UPDATE/DELETE policy exists on
-- incident_log_entries at all, so that's enforced at the RLS layer, not
-- just in the UI). Welfare/casualty data is restricted to admin/manager/
-- control_room; field staff can raise and view incidents on their own
-- assigned events but cannot change status, log decisions, or touch
-- welfare records.

create type incident_severity as enum ('minor', 'moderate', 'serious', 'critical');
create type incident_status as enum ('open', 'monitoring', 'resolved', 'closed');
create type incident_log_entry_type as enum ('update', 'decision', 'action', 'correction');

create function is_incident_manager()
returns boolean
language sql stable security definer set search_path = public
as $$
  select current_profile_staff_role() in ('admin', 'manager', 'control_room');
$$;

revoke execute on function is_incident_manager() from public, anon;
grant execute on function is_incident_manager() to authenticated;

create table incidents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  incident_number text not null,
  summary text not null,
  category text,
  severity incident_severity not null default 'minor',
  status incident_status not null default 'open',
  location text,
  reporter_id uuid references user_profiles(id),
  incident_commander_id uuid references user_profiles(id),
  casualty_count integer not null default 0,
  time_reported timestamptz not null default now(),
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, incident_number)
);

create table incident_number_counters (
  event_id uuid primary key references events(id) on delete cascade,
  last_value integer not null default 0
);

create function generate_incident_number()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_next integer;
begin
  if new.incident_number is not null then
    return new;
  end if;

  insert into incident_number_counters (event_id, last_value)
  values (new.event_id, 1)
  on conflict (event_id)
  do update set last_value = incident_number_counters.last_value + 1
  returning last_value into v_next;

  new.incident_number := 'INC-' || lpad(v_next::text, 3, '0');
  return new;
end;
$$;

create trigger set_incident_number
  before insert on incidents
  for each row execute function generate_incident_number();

create trigger set_incidents_updated_at
  before update on incidents
  for each row execute function set_updated_at();

create table incident_log_entries (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references incidents(id) on delete cascade,
  time timestamptz not null default now(),
  entry_type incident_log_entry_type not null default 'update',
  body text not null,
  author_id uuid references user_profiles(id),
  supersedes_entry_id uuid references incident_log_entries(id),
  created_at timestamptz not null default now()
);

create table decisions (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references incidents(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  decision_text text not null,
  rationale text,
  decided_by uuid references user_profiles(id),
  created_at timestamptz not null default now()
);

create table welfare_records (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references incidents(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  person_details jsonb not null default '{}'::jsonb,
  casualty_status text,
  medical_notes text,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_welfare_records_updated_at
  before update on welfare_records
  for each row execute function set_updated_at();

create table resources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  type text not null,
  call_sign text,
  status text,
  location text,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_resources_updated_at
  before update on resources
  for each row execute function set_updated_at();

-- One evolving situational-picture row per incident (not versioned like the
-- log — it always reflects the latest known state for emergency services).
create table methane_messages (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null unique references incidents(id) on delete cascade,
  major_incident_declared boolean not null default false,
  exact_location text,
  incident_type text,
  hazards text,
  access text,
  casualty_numbers jsonb not null default '{}'::jsonb,
  emergency_services jsonb not null default '{}'::jsonb,
  updated_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_methane_messages_updated_at
  before update on methane_messages
  for each row execute function set_updated_at();

alter table incidents enable row level security;
alter table incident_number_counters enable row level security;
alter table incident_log_entries enable row level security;
alter table decisions enable row level security;
alter table welfare_records enable row level security;
alter table resources enable row level security;
alter table methane_messages enable row level security;

-- --- incidents ---

create policy "assigned staff can view incidents"
  on incidents for select
  using (is_staff() and has_event_access(event_id));

create policy "assigned staff can report incidents"
  on incidents for insert
  with check (is_staff() and has_event_access(event_id));

create policy "incident managers can update incidents"
  on incidents for update
  using (is_incident_manager() and has_event_access(event_id));

-- --- incident_log_entries (append-only: no update/delete policy) ---

create policy "assigned staff can view incident log"
  on incident_log_entries for select
  using (
    exists (
      select 1 from incidents
      where incidents.id = incident_log_entries.incident_id
        and is_staff() and has_event_access(incidents.event_id)
    )
  );

create policy "assigned staff can add incident log entries"
  on incident_log_entries for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from incidents
      where incidents.id = incident_log_entries.incident_id
        and is_staff() and has_event_access(incidents.event_id)
    )
  );

-- --- decisions ---

create policy "incident managers can view decisions"
  on decisions for select
  using (is_incident_manager() and has_event_access(event_id));

create policy "incident managers can log decisions"
  on decisions for insert
  with check (is_incident_manager() and has_event_access(event_id) and decided_by = auth.uid());

-- --- welfare_records (restricted) ---

create policy "incident managers can view welfare records"
  on welfare_records for select
  using (is_incident_manager() and has_event_access(event_id));

create policy "incident managers can create welfare records"
  on welfare_records for insert
  with check (is_incident_manager() and has_event_access(event_id));

create policy "incident managers can update welfare records"
  on welfare_records for update
  using (is_incident_manager() and has_event_access(event_id));

-- --- resources ---

create policy "assigned staff can view resources"
  on resources for select
  using (is_staff() and has_event_access(event_id));

create policy "incident managers can manage resources"
  on resources for insert
  with check (is_incident_manager() and has_event_access(event_id));

create policy "incident managers can update resources"
  on resources for update
  using (is_incident_manager() and has_event_access(event_id));

-- --- methane_messages ---

create policy "incident managers can view methane messages"
  on methane_messages for select
  using (
    exists (
      select 1 from incidents
      where incidents.id = methane_messages.incident_id
        and is_incident_manager() and has_event_access(incidents.event_id)
    )
  );

create policy "incident managers can create methane messages"
  on methane_messages for insert
  with check (
    exists (
      select 1 from incidents
      where incidents.id = methane_messages.incident_id
        and is_incident_manager() and has_event_access(incidents.event_id)
    )
  );

create policy "incident managers can update methane messages"
  on methane_messages for update
  using (
    exists (
      select 1 from incidents
      where incidents.id = methane_messages.incident_id
        and is_incident_manager() and has_event_access(incidents.event_id)
    )
  );

-- incident_number_counters has no policies — it's only ever touched via the
-- security-definer trigger, same pattern as document_reference_counters.

-- --- Realtime: control-room views subscribe to these for live updates ---

alter publication supabase_realtime add table incidents;
alter publication supabase_realtime add table incident_log_entries;
alter publication supabase_realtime add table decisions;
alter publication supabase_realtime add table resources;
alter publication supabase_realtime add table methane_messages;

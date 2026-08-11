-- Complete event-control and incident-management workspace.

create type incident_action_status as enum ('open', 'in_progress', 'blocked', 'complete', 'cancelled');
create type incident_action_priority as enum ('low', 'normal', 'high', 'critical');
create type radio_message_direction as enum ('inbound', 'outbound', 'internal');
create type control_session_status as enum ('standby', 'active', 'closed');

alter table incidents
  add column description text,
  add column hazard_reference text,
  add column reported_via text,
  add column emergency_services_called boolean not null default false,
  add column emergency_services_call_time timestamptz,
  add column resolution_summary text,
  add column closed_at timestamptz,
  add column last_activity_at timestamptz not null default now();

alter table decisions
  add column outcome text,
  add column implemented_at timestamptz;

alter table resources
  add column incident_id uuid references incidents(id) on delete set null,
  add column quantity integer not null default 1 check (quantity > 0),
  add column assigned_to text,
  add column contact_details text,
  add column notes text,
  add column deployed_at timestamptz,
  add column released_at timestamptz;

alter table welfare_records
  add column casualty_reference text,
  add column triage_category text,
  add column age_band text,
  add column disposition text,
  add column handed_over_to text,
  add column handover_time timestamptz,
  add column next_of_kin_contacted boolean not null default false;

alter table methane_messages
  add column receiving_service text,
  add column sent_at timestamptz,
  add column sent_by uuid references user_profiles(id) on delete set null;

create table event_control_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references events(id) on delete cascade,
  status control_session_status not null default 'standby',
  opened_at timestamptz,
  opened_by uuid references user_profiles(id) on delete set null,
  closed_at timestamptz,
  closed_by uuid references user_profiles(id) on delete set null,
  handover_notes text,
  updated_at timestamptz not null default now()
);

create trigger set_event_control_sessions_updated_at
  before update on event_control_sessions
  for each row execute function set_updated_at();

create table event_control_roles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  role_name text not null,
  user_id uuid references user_profiles(id) on delete set null,
  call_sign text,
  contact_details text,
  active boolean not null default true,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, role_name)
);

create trigger set_event_control_roles_updated_at
  before update on event_control_roles
  for each row execute function set_updated_at();

create table operational_locations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  location_type text not null,
  description text,
  grid_reference text,
  what3words text,
  access_notes text,
  active boolean not null default true,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, name)
);

create trigger set_operational_locations_updated_at
  before update on operational_locations
  for each row execute function set_updated_at();

create table incident_actions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  incident_id uuid references incidents(id) on delete cascade,
  title text not null,
  description text,
  priority incident_action_priority not null default 'normal',
  status incident_action_status not null default 'open',
  assigned_to uuid references user_profiles(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references user_profiles(id) on delete set null,
  completion_note text,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_incident_actions_updated_at
  before update on incident_actions
  for each row execute function set_updated_at();

create table event_control_log_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  incident_id uuid references incidents(id) on delete set null,
  time timestamptz not null default now(),
  entry_type incident_log_entry_type not null default 'update',
  body text not null,
  author_id uuid references user_profiles(id) on delete set null,
  supersedes_entry_id uuid references event_control_log_entries(id),
  created_at timestamptz not null default now()
);

create table radio_channels (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  channel_name text not null,
  purpose text,
  frequency_or_talkgroup text,
  notes text,
  active boolean not null default true,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, channel_name)
);

create trigger set_radio_channels_updated_at
  before update on radio_channels
  for each row execute function set_updated_at();

create table radio_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  incident_id uuid references incidents(id) on delete set null,
  radio_channel_id uuid references radio_channels(id) on delete set null,
  direction radio_message_direction not null default 'internal',
  from_call_sign text,
  to_call_sign text,
  body text not null,
  time timestamptz not null default now(),
  author_id uuid references user_profiles(id) on delete set null,
  supersedes_entry_id uuid references radio_messages(id),
  created_at timestamptz not null default now()
);

create table incident_attachments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  incident_id uuid not null references incidents(id) on delete cascade,
  file_name text not null,
  file_storage_path text not null unique,
  file_size bigint not null check (file_size >= 0),
  mime_type text,
  caption text,
  evidence_type text not null default 'other',
  captured_at timestamptz,
  uploaded_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table methane_message_versions (
  id uuid primary key default gen_random_uuid(),
  methane_message_id uuid not null references methane_messages(id) on delete cascade,
  incident_id uuid not null references incidents(id) on delete cascade,
  revision integer not null,
  snapshot jsonb not null,
  changed_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (methane_message_id, revision)
);

create function snapshot_methane_message()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_revision integer;
begin
  select coalesce(max(revision), 0) + 1 into v_revision
  from methane_message_versions
  where methane_message_id = new.id;

  insert into methane_message_versions (
    methane_message_id, incident_id, revision, snapshot, changed_by
  ) values (
    new.id,
    new.incident_id,
    v_revision,
    to_jsonb(new) - 'created_at' - 'updated_at',
    new.updated_by
  );
  return new;
end;
$$;

revoke execute on function snapshot_methane_message() from public, anon, authenticated;

create trigger snapshot_methane_message_change
  after insert or update on methane_messages
  for each row execute function snapshot_methane_message();

create function touch_incident_activity()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_incident_id uuid;
begin
  v_incident_id := new.incident_id;
  if v_incident_id is not null then
    update incidents set last_activity_at = now() where id = v_incident_id;
  end if;
  return new;
end;
$$;

revoke execute on function touch_incident_activity() from public, anon, authenticated;

create trigger touch_incident_from_log after insert on incident_log_entries
  for each row execute function touch_incident_activity();
create trigger touch_incident_from_action after insert or update on incident_actions
  for each row execute function touch_incident_activity();
create trigger touch_incident_from_decision after insert on decisions
  for each row execute function touch_incident_activity();
create trigger touch_incident_from_radio after insert on radio_messages
  for each row execute function touch_incident_activity();
create trigger touch_incident_from_attachment after insert on incident_attachments
  for each row execute function touch_incident_activity();

alter table event_control_sessions enable row level security;
alter table event_control_roles enable row level security;
alter table operational_locations enable row level security;
alter table incident_actions enable row level security;
alter table event_control_log_entries enable row level security;
alter table radio_channels enable row level security;
alter table radio_messages enable row level security;
alter table incident_attachments enable row level security;
alter table methane_message_versions enable row level security;

create policy "assigned staff can view control sessions" on event_control_sessions
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "incident managers can create control sessions" on event_control_sessions
  for insert to authenticated with check (is_incident_manager() and has_event_access(event_id));
create policy "incident managers can update control sessions" on event_control_sessions
  for update to authenticated using (is_incident_manager() and has_event_access(event_id))
  with check (is_incident_manager() and has_event_access(event_id));

create policy "assigned staff can view control roles" on event_control_roles
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "incident managers can manage control roles" on event_control_roles
  for all to authenticated using (is_incident_manager() and has_event_access(event_id))
  with check (is_incident_manager() and has_event_access(event_id));

create policy "assigned staff can view operational locations" on operational_locations
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "incident managers can manage operational locations" on operational_locations
  for all to authenticated using (is_incident_manager() and has_event_access(event_id))
  with check (is_incident_manager() and has_event_access(event_id));

create policy "assigned staff can view incident actions" on incident_actions
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "incident managers can create incident actions" on incident_actions
  for insert to authenticated with check (is_incident_manager() and has_event_access(event_id));
create policy "incident managers or assignees can update actions" on incident_actions
  for update to authenticated
  using ((is_incident_manager() or assigned_to = (select auth.uid())) and has_event_access(event_id))
  with check ((is_incident_manager() or assigned_to = (select auth.uid())) and has_event_access(event_id));

create policy "assigned staff can view event control log" on event_control_log_entries
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "assigned staff can append event control log" on event_control_log_entries
  for insert to authenticated
  with check (is_staff() and has_event_access(event_id) and author_id = (select auth.uid()));

create policy "assigned staff can view radio channels" on radio_channels
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "incident managers can manage radio channels" on radio_channels
  for all to authenticated using (is_incident_manager() and has_event_access(event_id))
  with check (is_incident_manager() and has_event_access(event_id));

create policy "assigned staff can view radio messages" on radio_messages
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "assigned staff can append radio messages" on radio_messages
  for insert to authenticated
  with check (is_staff() and has_event_access(event_id) and author_id = (select auth.uid()));

create policy "assigned staff can view incident attachments" on incident_attachments
  for select to authenticated using (is_staff() and has_event_access(event_id));
create policy "assigned staff can add incident attachments" on incident_attachments
  for insert to authenticated
  with check (is_staff() and has_event_access(event_id) and uploaded_by = (select auth.uid()));
create policy "admin can delete incident attachments" on incident_attachments
  for delete to authenticated using (is_admin());

create policy "incident managers can view methane history" on methane_message_versions
  for select to authenticated using (
    is_incident_manager() and exists (
      select 1 from incidents i
      where i.id = methane_message_versions.incident_id
        and has_event_access(i.event_id)
    )
  );

create index event_control_roles_event_id_idx on event_control_roles(event_id);
create index operational_locations_event_id_idx on operational_locations(event_id);
create index incident_actions_event_status_idx on incident_actions(event_id, status);
create index incident_actions_incident_id_idx on incident_actions(incident_id);
create index incident_actions_assigned_to_idx on incident_actions(assigned_to);
create index event_control_log_event_time_idx on event_control_log_entries(event_id, time desc);
create index event_control_log_incident_id_idx on event_control_log_entries(incident_id);
create index radio_channels_event_id_idx on radio_channels(event_id);
create index radio_messages_event_time_idx on radio_messages(event_id, time desc);
create index radio_messages_incident_id_idx on radio_messages(incident_id);
create index radio_messages_channel_id_idx on radio_messages(radio_channel_id);
create index incident_attachments_incident_id_idx on incident_attachments(incident_id);
create index incident_attachments_event_id_idx on incident_attachments(event_id);
create index methane_message_versions_incident_id_idx on methane_message_versions(incident_id);
create index resources_incident_id_idx on resources(incident_id);
create index methane_messages_sent_by_idx on methane_messages(sent_by);

alter publication supabase_realtime add table event_control_sessions;
alter publication supabase_realtime add table event_control_roles;
alter publication supabase_realtime add table operational_locations;
alter publication supabase_realtime add table incident_actions;
alter publication supabase_realtime add table event_control_log_entries;
alter publication supabase_realtime add table radio_channels;
alter publication supabase_realtime add table radio_messages;
alter publication supabase_realtime add table incident_attachments;

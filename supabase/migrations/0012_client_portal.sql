-- Phase 4: Client portal.
--
-- has_event_client_access(), documents.client_visible and
-- organisations.portal_access_enabled were all scaffolded in earlier phases
-- but no policy actually used them yet — this migration wires up client
-- read access on the existing tables and adds the two portal-specific
-- tables (client_requests, event_messages). The portal is deliberately
-- read-mostly per the spec: clients raise requests as tickets for staff to
-- fulfil rather than writing directly into event data or uploading files
-- themselves.

create type client_request_type as enum ('information', 'file_upload');
create type client_request_status as enum ('open', 'fulfilled');

create table client_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  type client_request_type not null,
  status client_request_status not null default 'open',
  title text not null,
  description text,
  raised_by uuid references user_profiles(id),
  response_note text,
  fulfilled_by uuid references user_profiles(id),
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_client_requests_updated_at
  before update on client_requests
  for each row execute function set_updated_at();

create table event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  sender_id uuid references user_profiles(id),
  body text not null,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now()
);

alter table client_requests enable row level security;
alter table event_messages enable row level security;

-- --- Client read access on existing event-scoped tables ---

create policy "clients can view their events"
  on events for select
  using (has_event_client_access(id));

create policy "clients can view client-visible documents"
  on documents for select
  using (has_event_client_access(event_id) and client_visible);

create policy "clients can view versions of client-visible documents"
  on document_versions for select
  using (
    exists (
      select 1 from documents
      where documents.id = document_versions.document_id
        and documents.client_visible
        and has_event_client_access(documents.event_id)
    )
  );

create policy "clients can view milestones"
  on milestones for select
  using (has_event_client_access(event_id));

-- --- client_requests ---

create policy "clients can view own requests"
  on client_requests for select
  using (has_event_client_access(event_id));

create policy "clients can raise requests"
  on client_requests for insert
  with check (has_event_client_access(event_id) and raised_by = auth.uid());

create policy "assigned staff can view requests"
  on client_requests for select
  using (is_staff() and has_event_access(event_id));

create policy "assigned staff can fulfil requests"
  on client_requests for update
  using (is_staff() and has_event_access(event_id));

-- --- event_messages ---

create policy "clients can view client-visible messages"
  on event_messages for select
  using (has_event_client_access(event_id) and visible_to_client);

create policy "clients can send messages"
  on event_messages for insert
  with check (has_event_client_access(event_id) and sender_id = auth.uid() and visible_to_client);

create policy "assigned staff can view messages"
  on event_messages for select
  using (is_staff() and has_event_access(event_id));

create policy "assigned staff can send messages"
  on event_messages for insert
  with check (is_staff() and has_event_access(event_id) and sender_id = auth.uid());

-- --- Storage: clients may read files behind client-visible documents ---
-- Path shape is {event_id}/documents/{document_id}/v{n}-{filename}, matching
-- the convention in lib/actions/documents.ts.

create policy "clients can read visible document files"
  on storage.objects for select
  using (
    bucket_id = 'event-files'
    and current_profile_account_type() = 'client'
    and (storage.foldername(name))[2] = 'documents'
    and exists (
      select 1 from documents d
      where d.id = ((storage.foldername(name))[3])::uuid
        and d.client_visible
        and has_event_client_access(d.event_id)
    )
  );

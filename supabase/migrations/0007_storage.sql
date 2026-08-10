-- Private Storage bucket for generated PDFs and event files (section 8.1).
-- Paths are event-prefixed: <event_id>/documents/<document_id>/v<n>.pdf
-- Objects are never public; access is via signed URLs issued server-side
-- after an authorisation check, and via these RLS policies for direct
-- client reads where appropriate.

insert into storage.buckets (id, name, public)
values ('event-files', 'event-files', false)
on conflict (id) do nothing;

create policy "assigned staff can read event files"
  on storage.objects for select
  using (
    bucket_id = 'event-files'
    and has_event_access(((storage.foldername(name))[1])::uuid)
  );

create policy "assigned staff can upload event files"
  on storage.objects for insert
  with check (
    bucket_id = 'event-files'
    and is_staff()
    and has_event_access(((storage.foldername(name))[1])::uuid)
  );

create policy "assigned staff can update event files"
  on storage.objects for update
  using (
    bucket_id = 'event-files'
    and is_staff()
    and has_event_access(((storage.foldername(name))[1])::uuid)
  );

create policy "admin can delete event files"
  on storage.objects for delete
  using (
    bucket_id = 'event-files'
    and is_admin()
  );

-- RLS for the document system, plus a guarded status-transition function.
--
-- Architecture note (spec 3.1/3.2): document approval transitions must be
-- validated server-side, not left to the UI. Rather than routing every
-- transition through a Next.js Route Handler, the validation lives in
-- transition_document_status() below (security definer, explicit role
-- checks) and a trigger blocks any direct UPDATE of documents.status that
-- doesn't go through it. This keeps the data layer as the actual source of
-- truth per the stated architectural principle, and is what the Document
-- Studio / OSSP editor call via supabase.rpc().

alter table document_templates enable row level security;
alter table document_reference_counters enable row level security;
alter table documents enable row level security;
alter table document_versions enable row level security;
alter table knowledge_blocks enable row level security;
alter table document_knowledge_references enable row level security;

-- document_templates ----------------------------------------------------

create policy "staff can view templates" on document_templates
  for select using (is_staff());

create policy "admin manages templates" on document_templates
  for all using (is_admin()) with check (is_admin());

-- document_reference_counters: no direct client access; only the
-- security-definer generate_document_reference() trigger touches this.

-- documents ---------------------------------------------------------------

create policy "assigned staff can view documents" on documents
  for select using (has_event_access(event_id));

create policy "assigned staff can create documents" on documents
  for insert with check (is_staff() and has_event_access(event_id));

create policy "assigned staff can update documents" on documents
  for update using (is_staff() and has_event_access(event_id));

create policy "admin can delete documents" on documents
  for delete using (is_admin());

-- document_versions ---------------------------------------------------------

create policy "assigned staff can view document versions" on document_versions
  for select using (
    has_event_access((select event_id from documents where documents.id = document_versions.document_id))
  );

create policy "assigned staff can create document versions" on document_versions
  for insert with check (
    is_staff()
    and has_event_access((select event_id from documents where documents.id = document_versions.document_id))
  );

create policy "assigned staff can update document versions" on document_versions
  for update using (
    is_staff()
    and has_event_access((select event_id from documents where documents.id = document_versions.document_id))
  );

-- knowledge_blocks ------------------------------------------------------

create policy "staff can view knowledge blocks" on knowledge_blocks
  for select using (is_staff());

create policy "manager or admin manages knowledge blocks" on knowledge_blocks
  for all using (is_manager_or_admin()) with check (is_manager_or_admin());

-- document_knowledge_references -----------------------------------------

create policy "assigned staff can view document knowledge refs" on document_knowledge_references
  for select using (
    has_event_access((select event_id from documents where documents.id = document_knowledge_references.document_id))
  );

create policy "assigned staff can manage document knowledge refs" on document_knowledge_references
  for all using (
    is_staff()
    and has_event_access((select event_id from documents where documents.id = document_knowledge_references.document_id))
  ) with check (
    is_staff()
    and has_event_access((select event_id from documents where documents.id = document_knowledge_references.document_id))
  );

-- Guard against status changes that bypass transition_document_status() ---

create or replace function prevent_direct_document_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('app.bypass_status_guard', true), 'false') <> 'true' then
    raise exception 'Document status changes must go through transition_document_status().';
  end if;
  return new;
end;
$$;

create trigger prevent_direct_document_status_change_trigger
  before update of status on documents
  for each row execute function prevent_direct_document_status_change();

-- Formal state machine (section 6.7): Draft -> In review -> Needs updates
-- -> Approved -> Issued -> Archived. needs_updates loops back to in_review.
create or replace function transition_document_status(
  p_document_id uuid,
  p_new_status document_status,
  p_comment text default null
)
returns documents
language plpgsql
security definer
set search_path = public
as $$
declare
  v_document documents;
  v_valid boolean := false;
begin
  select * into v_document from documents where id = p_document_id;

  if v_document.id is null then
    raise exception 'Document not found';
  end if;

  if not has_event_access(v_document.event_id) then
    raise exception 'Not authorised for this event';
  end if;

  v_valid := case v_document.status
    when 'draft' then p_new_status = 'in_review'
    when 'in_review' then p_new_status in ('needs_updates', 'approved')
    when 'needs_updates' then p_new_status = 'in_review'
    when 'approved' then p_new_status = 'issued'
    when 'issued' then p_new_status = 'archived'
    else false
  end;

  if not v_valid then
    raise exception 'Invalid transition from % to %', v_document.status, p_new_status;
  end if;

  if p_new_status in ('needs_updates', 'approved', 'issued') and not is_manager_or_admin() then
    raise exception 'Only a manager or admin can % a document', p_new_status;
  end if;

  if p_comment is not null and v_document.current_version_id is not null then
    update document_versions
    set review_comments = review_comments || jsonb_build_object(
      'author_id', auth.uid(),
      'body', p_comment,
      'at', now(),
      'resulting_status', p_new_status
    )
    where id = v_document.current_version_id;
  end if;

  if v_document.current_version_id is not null then
    update document_versions
    set
      reviewed_by = case when p_new_status in ('needs_updates', 'approved') then auth.uid() else reviewed_by end,
      approved_by = case when p_new_status = 'approved' then auth.uid() else approved_by end
    where id = v_document.current_version_id;
  end if;

  perform set_config('app.bypass_status_guard', 'true', true);

  update documents set status = p_new_status where id = p_document_id
  returning * into v_document;

  return v_document;
end;
$$;

grant execute on function transition_document_status(uuid, document_status, text) to authenticated;

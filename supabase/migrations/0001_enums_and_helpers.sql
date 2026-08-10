-- Enums and the generic updated_at trigger function.
-- (Access-control helper functions live in 0003_access_helpers.sql —
-- they query user_profiles/event_members, which don't exist yet here.
-- LANGUAGE SQL functions are validated against the catalog at CREATE
-- time, unlike plpgsql, so they can't forward-reference those tables.)

create type account_type as enum ('staff', 'client', 'pending');
create type staff_role as enum ('admin', 'manager', 'control_room', 'field');
create type relationship_status as enum ('prospect', 'active', 'past');
create type event_stage as enum ('enquiry', 'proposal', 'confirmed', 'planning', 'live', 'complete');
create type task_status as enum ('to_do', 'in_progress', 'in_review', 'complete');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type milestone_status as enum ('not_started', 'on_track', 'at_risk', 'complete');
create type document_output_format as enum ('a4', 'a3', 'a2', 'a6', 'presentation', 'web');
create type template_status as enum ('draft', 'published', 'archived');
create type document_status as enum ('draft', 'in_review', 'needs_updates', 'approved', 'issued', 'archived');
create type knowledge_block_approval_status as enum ('draft', 'approved', 'superseded');

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

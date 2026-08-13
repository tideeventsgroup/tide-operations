-- Audit finding (Critical): early-phase tables reference user_profiles with no
-- explicit ON DELETE clause, which defaults to NO ACTION (functionally the
-- same as RESTRICT). Later migrations consistently use ON DELETE SET NULL for
-- the same kind of "who did this" attribution column. The split meant a
-- user_profiles row could never be deleted once referenced by an incident,
-- document, event, task, etc. — silently blocking user offboarding, since
-- user_profiles.id cascades from auth.users but these columns would then
-- block that cascade from completing.
--
-- This migration standardises every such attribution column on
-- ON DELETE SET NULL, matching the pattern already used for
-- incident_actions.assigned_to, event_control_log_entries.author_id, etc.
-- All 27 columns below are already nullable (verified against the live
-- schema before writing this migration), so no data/shape change is needed —
-- only the delete behaviour. Deleting a user now clears attribution on their
-- past records rather than blocking the deletion or deleting the records
-- themselves; the underlying incident/document/decision is untouched.

alter table public.client_requests
  drop constraint client_requests_fulfilled_by_fkey,
  add constraint client_requests_fulfilled_by_fkey
    foreign key (fulfilled_by) references public.user_profiles(id) on delete set null;

alter table public.client_requests
  drop constraint client_requests_raised_by_fkey,
  add constraint client_requests_raised_by_fkey
    foreign key (raised_by) references public.user_profiles(id) on delete set null;

alter table public.contacts
  drop constraint contacts_created_by_fkey,
  add constraint contacts_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.decisions
  drop constraint decisions_decided_by_fkey,
  add constraint decisions_decided_by_fkey
    foreign key (decided_by) references public.user_profiles(id) on delete set null;

alter table public.document_types
  drop constraint document_types_created_by_fkey,
  add constraint document_types_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.document_versions
  drop constraint document_versions_approved_by_fkey,
  add constraint document_versions_approved_by_fkey
    foreign key (approved_by) references public.user_profiles(id) on delete set null;

alter table public.document_versions
  drop constraint document_versions_created_by_fkey,
  add constraint document_versions_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.document_versions
  drop constraint document_versions_reviewed_by_fkey,
  add constraint document_versions_reviewed_by_fkey
    foreign key (reviewed_by) references public.user_profiles(id) on delete set null;

alter table public.document_versions
  drop constraint document_versions_submitted_by_fkey,
  add constraint document_versions_submitted_by_fkey
    foreign key (submitted_by) references public.user_profiles(id) on delete set null;

alter table public.documents
  drop constraint documents_created_by_fkey,
  add constraint documents_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.documents
  drop constraint documents_owner_id_fkey,
  add constraint documents_owner_id_fkey
    foreign key (owner_id) references public.user_profiles(id) on delete set null;

alter table public.event_messages
  drop constraint event_messages_sender_id_fkey,
  add constraint event_messages_sender_id_fkey
    foreign key (sender_id) references public.user_profiles(id) on delete set null;

alter table public.event_stage_history
  drop constraint event_stage_history_changed_by_fkey,
  add constraint event_stage_history_changed_by_fkey
    foreign key (changed_by) references public.user_profiles(id) on delete set null;

alter table public.events
  drop constraint events_created_by_fkey,
  add constraint events_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.events
  drop constraint events_event_manager_id_fkey,
  add constraint events_event_manager_id_fkey
    foreign key (event_manager_id) references public.user_profiles(id) on delete set null;

alter table public.events
  drop constraint events_safety_manager_id_fkey,
  add constraint events_safety_manager_id_fkey
    foreign key (safety_manager_id) references public.user_profiles(id) on delete set null;

alter table public.incident_log_entries
  drop constraint incident_log_entries_author_id_fkey,
  add constraint incident_log_entries_author_id_fkey
    foreign key (author_id) references public.user_profiles(id) on delete set null;

alter table public.incidents
  drop constraint incidents_created_by_fkey,
  add constraint incidents_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.incidents
  drop constraint incidents_incident_commander_id_fkey,
  add constraint incidents_incident_commander_id_fkey
    foreign key (incident_commander_id) references public.user_profiles(id) on delete set null;

alter table public.incidents
  drop constraint incidents_reporter_id_fkey,
  add constraint incidents_reporter_id_fkey
    foreign key (reporter_id) references public.user_profiles(id) on delete set null;

alter table public.knowledge_blocks
  drop constraint knowledge_blocks_created_by_fkey,
  add constraint knowledge_blocks_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.methane_messages
  drop constraint methane_messages_updated_by_fkey,
  add constraint methane_messages_updated_by_fkey
    foreign key (updated_by) references public.user_profiles(id) on delete set null;

alter table public.milestones
  drop constraint milestones_created_by_fkey,
  add constraint milestones_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.organisations
  drop constraint organisations_created_by_fkey,
  add constraint organisations_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.resources
  drop constraint resources_created_by_fkey,
  add constraint resources_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.tasks
  drop constraint tasks_created_by_fkey,
  add constraint tasks_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

alter table public.tasks
  drop constraint tasks_owner_id_fkey,
  add constraint tasks_owner_id_fkey
    foreign key (owner_id) references public.user_profiles(id) on delete set null;

alter table public.welfare_records
  drop constraint welfare_records_created_by_fkey,
  add constraint welfare_records_created_by_fkey
    foreign key (created_by) references public.user_profiles(id) on delete set null;

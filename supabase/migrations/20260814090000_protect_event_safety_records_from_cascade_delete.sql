-- Audit finding (Critical): incidents, welfare_records, decisions, documents and
-- the event-wide operational log all cascade-deleted with `events`, so deleting
-- an event silently destroyed its entire safety/compliance record with no
-- recovery step. There is no delete-event feature in the application today,
-- but the schema should not rely on that — a future feature, a script, or a
-- direct SQL delete could still trigger it.
--
-- This migration switches those tables from ON DELETE CASCADE to
-- ON DELETE RESTRICT, so deleting an event with safety records now fails
-- loudly instead of silently destroying them. An operator who genuinely needs
-- to remove an event first has to consciously deal with its incident/welfare/
-- document history — that decision should never happen as a side effect.
--
-- Lower-stakes, event-scoped configuration/planning tables (tasks, milestones,
-- resources, radio_channels, operational_locations, event_control_sessions,
-- event_control_roles, event_members, event_messages, client_requests,
-- event_stage_history, incident_number_counters) are left as CASCADE — losing
-- those alongside the event they belong to is reasonable and not a
-- compliance-relevant data-loss risk.

alter table public.incidents
  drop constraint incidents_event_id_fkey,
  add constraint incidents_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

alter table public.welfare_records
  drop constraint welfare_records_event_id_fkey,
  add constraint welfare_records_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

alter table public.decisions
  drop constraint decisions_event_id_fkey,
  add constraint decisions_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

alter table public.documents
  drop constraint documents_event_id_fkey,
  add constraint documents_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

alter table public.event_control_log_entries
  drop constraint event_control_log_entries_event_id_fkey,
  add constraint event_control_log_entries_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

alter table public.incident_actions
  drop constraint incident_actions_event_id_fkey,
  add constraint incident_actions_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

alter table public.incident_attachments
  drop constraint incident_attachments_event_id_fkey,
  add constraint incident_attachments_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

alter table public.radio_messages
  drop constraint radio_messages_event_id_fkey,
  add constraint radio_messages_event_id_fkey
    foreign key (event_id) references public.events(id) on delete restrict;

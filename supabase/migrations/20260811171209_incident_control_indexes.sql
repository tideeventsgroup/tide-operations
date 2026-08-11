-- Cover the remaining foreign keys introduced by Event Control. These keep
-- deletes, joins and RLS checks predictable as the operational log grows.
create index event_control_log_author_id_idx on public.event_control_log_entries(author_id);
create index event_control_log_supersedes_idx on public.event_control_log_entries(supersedes_entry_id);
create index event_control_roles_created_by_idx on public.event_control_roles(created_by);
create index event_control_roles_user_id_idx on public.event_control_roles(user_id);
create index event_control_sessions_closed_by_idx on public.event_control_sessions(closed_by);
create index event_control_sessions_opened_by_idx on public.event_control_sessions(opened_by);
create index incident_actions_completed_by_idx on public.incident_actions(completed_by);
create index incident_actions_created_by_idx on public.incident_actions(created_by);
create index incident_attachments_uploaded_by_idx on public.incident_attachments(uploaded_by);
create index methane_message_versions_changed_by_idx on public.methane_message_versions(changed_by);
create index operational_locations_created_by_idx on public.operational_locations(created_by);
create index radio_channels_created_by_idx on public.radio_channels(created_by);
create index radio_messages_author_id_idx on public.radio_messages(author_id);
create index radio_messages_supersedes_idx on public.radio_messages(supersedes_entry_id);

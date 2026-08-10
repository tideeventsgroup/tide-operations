-- Security-advisor cleanup:
-- 1. Pin search_path on the three functions that were missing it.
-- 2. Trigger-only functions (they reference NEW/OLD/TG_OP) should never be
--    directly callable as RPCs — Postgres would error if you tried anyway,
--    but revoking EXECUTE closes the API surface cleanly.
-- 3. The current_profile_*/is_*/has_event_access() helpers are safe for any
--    authenticated user to call (they only ever expose facts about the
--    caller's own session), but have no reason to be callable by anon.

alter function set_updated_at() set search_path = public;
alter function record_document_status_timestamps() set search_path = public;
alter function prevent_direct_document_status_change() set search_path = public;

revoke execute on function add_creator_as_event_member() from public, anon, authenticated;
revoke execute on function log_event_stage_transition() from public, anon, authenticated;
revoke execute on function sync_document_on_new_version() from public, anon, authenticated;
revoke execute on function prevent_profile_privilege_escalation() from public, anon, authenticated;
revoke execute on function generate_document_reference() from public, anon, authenticated;
revoke execute on function handle_new_auth_user() from public, anon, authenticated;
revoke execute on function record_document_status_timestamps() from public, anon, authenticated;
revoke execute on function prevent_direct_document_status_change() from public, anon, authenticated;
revoke execute on function set_updated_at() from public, anon, authenticated;

revoke execute on function current_profile_account_type() from public, anon;
revoke execute on function current_profile_staff_role() from public, anon;
revoke execute on function current_profile_organisation_id() from public, anon;
revoke execute on function is_admin() from public, anon;
revoke execute on function is_staff() from public, anon;
revoke execute on function is_manager_or_admin() from public, anon;
revoke execute on function has_event_access(uuid) from public, anon;
revoke execute on function has_event_client_access(uuid) from public, anon;

grant execute on function current_profile_account_type() to authenticated;
grant execute on function current_profile_staff_role() to authenticated;
grant execute on function current_profile_organisation_id() to authenticated;
grant execute on function is_admin() to authenticated;
grant execute on function is_staff() to authenticated;
grant execute on function is_manager_or_admin() to authenticated;
grant execute on function has_event_access(uuid) to authenticated;
grant execute on function has_event_client_access(uuid) to authenticated;

revoke execute on function transition_document_status(uuid, document_status, text) from public, anon;
revoke execute on function get_dashboard_snapshot() from public, anon;

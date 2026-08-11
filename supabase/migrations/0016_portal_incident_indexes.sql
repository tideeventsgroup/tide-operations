-- Cover foreign keys used by portal and incident filters, joins and cascades.
create index client_requests_event_id_idx on client_requests (event_id);
create index client_requests_raised_by_idx on client_requests (raised_by);
create index client_requests_fulfilled_by_idx on client_requests (fulfilled_by);

create index event_messages_event_id_idx on event_messages (event_id);
create index event_messages_sender_id_idx on event_messages (sender_id);

create index incidents_event_id_idx on incidents (event_id);
create index incidents_reporter_id_idx on incidents (reporter_id);
create index incidents_commander_id_idx on incidents (incident_commander_id);
create index incidents_created_by_idx on incidents (created_by);

create index incident_log_entries_incident_id_idx on incident_log_entries (incident_id);
create index incident_log_entries_author_id_idx on incident_log_entries (author_id);
create index incident_log_entries_supersedes_idx on incident_log_entries (supersedes_entry_id);

create index decisions_incident_id_idx on decisions (incident_id);
create index decisions_event_id_idx on decisions (event_id);
create index decisions_decided_by_idx on decisions (decided_by);

create index welfare_records_incident_id_idx on welfare_records (incident_id);
create index welfare_records_event_id_idx on welfare_records (event_id);
create index welfare_records_created_by_idx on welfare_records (created_by);

create index resources_event_id_idx on resources (event_id);
create index resources_created_by_idx on resources (created_by);

create index methane_messages_updated_by_idx on methane_messages (updated_by);

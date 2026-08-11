-- Keep the broad staff SELECT policy separate from manager mutations. A FOR
-- ALL policy also participates in SELECT and makes Postgres evaluate two
-- permissive policies for every read.
drop policy "incident managers can manage control roles" on public.event_control_roles;
create policy "incident managers can create control roles" on public.event_control_roles
  for insert to authenticated with check (is_incident_manager() and has_event_access(event_id));
create policy "incident managers can update control roles" on public.event_control_roles
  for update to authenticated using (is_incident_manager() and has_event_access(event_id))
  with check (is_incident_manager() and has_event_access(event_id));

drop policy "incident managers can manage operational locations" on public.operational_locations;
create policy "incident managers can create operational locations" on public.operational_locations
  for insert to authenticated with check (is_incident_manager() and has_event_access(event_id));
create policy "incident managers can update operational locations" on public.operational_locations
  for update to authenticated using (is_incident_manager() and has_event_access(event_id))
  with check (is_incident_manager() and has_event_access(event_id));

drop policy "incident managers can manage radio channels" on public.radio_channels;
create policy "incident managers can create radio channels" on public.radio_channels
  for insert to authenticated with check (is_incident_manager() and has_event_access(event_id));
create policy "incident managers can update radio channels" on public.radio_channels
  for update to authenticated using (is_incident_manager() and has_event_access(event_id))
  with check (is_incident_manager() and has_event_access(event_id));

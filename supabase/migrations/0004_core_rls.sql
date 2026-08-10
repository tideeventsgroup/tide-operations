-- Row-Level Security for core tables (section 5.3).
-- Pattern: a row is visible/writable if the requesting user's profile has
-- staff_role IN (admin, manager, ...) AND a matching event_members row
-- exists for that event_id, evaluated via the has_event_access() /
-- is_manager_or_admin() / is_admin() helpers defined in 0001.
-- Client-facing policies land in Phase 4 (client portal).

alter table user_profiles enable row level security;
alter table organisations enable row level security;
alter table contacts enable row level security;
alter table events enable row level security;
alter table event_stage_history enable row level security;
alter table event_members enable row level security;
alter table milestones enable row level security;
alter table tasks enable row level security;

-- user_profiles ---------------------------------------------------------

create policy "select own profile" on user_profiles
  for select using (auth.uid() = id);

create policy "staff can view staff directory" on user_profiles
  for select using (is_staff());

create policy "update own profile or admin" on user_profiles
  for update using (auth.uid() = id or is_admin());

-- organisations -----------------------------------------------------------

create policy "staff can view organisations" on organisations
  for select using (is_staff());

create policy "manager or admin can create organisations" on organisations
  for insert with check (is_manager_or_admin());

create policy "manager or admin can update organisations" on organisations
  for update using (is_manager_or_admin());

create policy "admin can delete organisations" on organisations
  for delete using (is_admin());

-- contacts ------------------------------------------------------------------

create policy "staff can view contacts" on contacts
  for select using (is_staff());

create policy "manager or admin can create contacts" on contacts
  for insert with check (is_manager_or_admin());

create policy "manager or admin can update contacts" on contacts
  for update using (is_manager_or_admin());

create policy "admin can delete contacts" on contacts
  for delete using (is_admin());

-- events ----------------------------------------------------------------

create policy "assigned staff can view events" on events
  for select using (has_event_access(id));

create policy "manager or admin can create events" on events
  for insert with check (is_manager_or_admin());

create policy "assigned manager or admin can update events" on events
  for update using (is_manager_or_admin() and has_event_access(id));

create policy "admin can delete events" on events
  for delete using (is_admin());

-- event_stage_history (written only by the log_event_stage_transition
-- trigger, which runs security definer and so bypasses RLS on insert) ------

create policy "assigned staff can view stage history" on event_stage_history
  for select using (has_event_access(event_id));

-- event_members -----------------------------------------------------------

create policy "assigned staff can view event members" on event_members
  for select using (has_event_access(event_id));

create policy "manager or admin can manage event members" on event_members
  for insert with check (is_manager_or_admin() and has_event_access(event_id));

create policy "manager or admin can update event members" on event_members
  for update using (is_manager_or_admin() and has_event_access(event_id));

create policy "manager or admin can remove event members" on event_members
  for delete using (is_manager_or_admin() and has_event_access(event_id));

-- milestones ----------------------------------------------------------------

create policy "assigned staff can view milestones" on milestones
  for select using (has_event_access(event_id));

create policy "manager or admin can create milestones" on milestones
  for insert with check (is_manager_or_admin() and has_event_access(event_id));

create policy "manager or admin can update milestones" on milestones
  for update using (is_manager_or_admin() and has_event_access(event_id));

create policy "manager or admin can delete milestones" on milestones
  for delete using (is_manager_or_admin() and has_event_access(event_id));

-- tasks -----------------------------------------------------------------
-- event_id is nullable for portfolio-level tasks, visible to any active
-- staff member; event-scoped tasks require event membership.

create policy "staff can view tasks" on tasks
  for select using (
    is_staff() and (event_id is null or has_event_access(event_id))
  );

create policy "staff can create tasks" on tasks
  for insert with check (
    is_staff() and (event_id is null or has_event_access(event_id))
  );

create policy "staff can update accessible tasks" on tasks
  for update using (
    is_staff() and (event_id is null or has_event_access(event_id))
  );

create policy "manager or admin can delete tasks" on tasks
  for delete using (
    is_manager_or_admin() and (event_id is null or has_event_access(event_id))
  );

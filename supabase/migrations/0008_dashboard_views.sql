-- Dashboard views/RPCs (section 6.1): "Built as parameterised Supabase
-- views/RPCs so the dashboard queries stay fast as data volume grows,
-- rather than aggregating client-side."
--
-- No security definer here — these run with the caller's own privileges,
-- so RLS on the underlying tables (events, tasks, documents) naturally
-- scopes every result to what that user is allowed to see.

create or replace view v_upcoming_events
with (security_invoker = true) as
select
  e.id,
  e.name,
  e.venue,
  e.start_date,
  e.end_date,
  e.stage,
  e.organisation_id,
  o.name as organisation_name
from events e
left join organisations o on o.id = e.organisation_id
where e.stage <> 'complete'
order by e.start_date nulls last;

create or replace view v_review_queue
with (security_invoker = true) as
select
  d.id,
  d.reference,
  d.title,
  d.status,
  d.event_id,
  e.name as event_name,
  d.owner_id,
  up.full_name as owner_name,
  d.current_version_id,
  d.updated_at
from documents d
join events e on e.id = d.event_id
left join user_profiles up on up.id = d.owner_id
where d.status in ('in_review', 'needs_updates')
order by d.updated_at desc;

create or replace view v_open_tasks
with (security_invoker = true) as
select
  t.id,
  t.title,
  t.status,
  t.priority,
  t.due_date,
  t.event_id,
  e.name as event_name,
  t.owner_id,
  up.full_name as owner_name,
  t.milestone_id
from tasks t
left join events e on e.id = t.event_id
left join user_profiles up on up.id = t.owner_id
where t.status <> 'complete'
order by t.due_date nulls last;

create or replace function get_dashboard_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'upcoming_events', coalesce((
      select jsonb_agg(row_to_json(x))
      from (select * from v_upcoming_events limit 5) x
    ), '[]'::jsonb),
    'review_queue', coalesce((
      select jsonb_agg(row_to_json(x))
      from (select * from v_review_queue limit 10) x
    ), '[]'::jsonb),
    'review_queue_count', (select count(*) from v_review_queue),
    'my_open_tasks', coalesce((
      select jsonb_agg(row_to_json(x))
      from (select * from v_open_tasks where owner_id = auth.uid() limit 10) x
    ), '[]'::jsonb),
    'open_tasks_count', (select count(*) from v_open_tasks),
    'approval_requests_count', (select count(*) from documents where status = 'approved')
  );
$$;

grant execute on function get_dashboard_snapshot() to authenticated;

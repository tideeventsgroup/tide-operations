-- Stable human-facing references for contracts, email, documents and event
-- control. UUID primary keys remain the internal relational identifiers.
alter table public.organisations add column client_reference text;
alter table public.events add column event_reference text;

create sequence public.client_reference_seq;
create sequence public.event_reference_seq;
grant usage on sequence public.client_reference_seq, public.event_reference_seq to authenticated;

-- Backfill in a deterministic order without coupling references to mutable
-- names or dates.
with numbered as (
  select id, row_number() over (order by created_at, id) as sequence_number
  from public.organisations
)
update public.organisations organisation
set client_reference = 'TEG-CLI-' || lpad(numbered.sequence_number::text, 4, '0')
from numbered
where organisation.id = numbered.id;

with numbered as (
  select
    id,
    extract(year from coalesce(start_date, created_at::date))::integer as reference_year,
    row_number() over (order by created_at, id) as sequence_number
  from public.events
)
update public.events event
set event_reference = 'TEG-EVT-' || numbered.reference_year::text || '-' || lpad(numbered.sequence_number::text, 4, '0')
from numbered
where event.id = numbered.id;

do $$
declare
  client_count bigint;
  event_count bigint;
begin
  select count(*) into client_count from public.organisations;
  select count(*) into event_count from public.events;
  perform setval('public.client_reference_seq', greatest(client_count, 1), client_count > 0);
  perform setval('public.event_reference_seq', greatest(event_count, 1), event_count > 0);
end;
$$;

alter table public.organisations alter column client_reference set not null;
alter table public.events alter column event_reference set not null;
alter table public.organisations add constraint organisations_client_reference_key unique (client_reference);
alter table public.events add constraint events_event_reference_key unique (event_reference);

create or replace function public.assign_client_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.client_reference := 'TEG-CLI-' || lpad(nextval('public.client_reference_seq')::text, 4, '0');
  return new;
end;
$$;

create or replace function public.assign_event_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  reference_year integer;
begin
  reference_year := extract(year from coalesce(new.start_date, current_date))::integer;
  new.event_reference := 'TEG-EVT-' || reference_year::text || '-' || lpad(nextval('public.event_reference_seq')::text, 4, '0');
  return new;
end;
$$;

create or replace function public.protect_entity_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_table_name = 'events' and new.event_reference is distinct from old.event_reference then
    raise exception 'Event ID cannot be changed';
  end if;
  if tg_table_name = 'organisations' and new.client_reference is distinct from old.client_reference then
    raise exception 'Client ID cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function public.assign_client_reference() from public, anon, authenticated;
revoke execute on function public.assign_event_reference() from public, anon, authenticated;
revoke execute on function public.protect_entity_reference() from public, anon, authenticated;

create trigger assign_client_reference_before_insert
before insert on public.organisations
for each row execute function public.assign_client_reference();

create trigger assign_event_reference_before_insert
before insert on public.events
for each row execute function public.assign_event_reference();

create trigger protect_client_reference_before_update
before update on public.organisations
for each row execute function public.protect_entity_reference();

create trigger protect_event_reference_before_update
before update on public.events
for each row execute function public.protect_entity_reference();

-- Append references to the security-invoker portfolio views. Existing column
-- order is preserved so CREATE OR REPLACE remains backwards compatible.
create or replace view public.v_upcoming_events
with (security_invoker = true) as
select
  e.id,
  e.name,
  e.venue,
  e.start_date,
  e.end_date,
  e.stage,
  e.organisation_id,
  o.name as organisation_name,
  e.event_reference,
  o.client_reference
from public.events e
left join public.organisations o on o.id = e.organisation_id
where e.stage <> 'complete'
order by e.start_date nulls last;

create or replace view public.v_review_queue
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
  d.updated_at,
  e.event_reference
from public.documents d
join public.events e on e.id = d.event_id
left join public.user_profiles up on up.id = d.owner_id
where d.status in ('in_review', 'needs_updates')
order by d.updated_at desc;

create or replace view public.v_open_tasks
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
  t.milestone_id,
  e.event_reference
from public.tasks t
left join public.events e on e.id = t.event_id
left join public.user_profiles up on up.id = t.owner_id
where t.status <> 'complete'
order by t.due_date nulls last;

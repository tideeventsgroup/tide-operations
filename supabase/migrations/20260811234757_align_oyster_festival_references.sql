-- Bring the imported Oyster Festival records into the permanent reference
-- format used by records created through the operations system.
alter table public.organisations disable trigger protect_client_reference_before_update;
alter table public.events disable trigger protect_event_reference_before_update;

do $$
declare
  oyster_event_id uuid;
  oyster_organisation_id uuid;
begin
  select id, organisation_id
  into oyster_event_id, oyster_organisation_id
  from public.events
  where name = 'Stranraer Oyster Festival 2026'
    and start_date = date '2026-09-11';

  if oyster_event_id is null or oyster_organisation_id is null then
    raise exception 'Oyster Festival event or linked client could not be found';
  end if;

  if exists (
    select 1
    from public.organisations
    where client_reference = 'TEG-CLI-0001'
      and id <> oyster_organisation_id
  ) then
    raise exception 'Client ID TEG-CLI-0001 is already assigned';
  end if;

  if exists (
    select 1
    from public.events
    where event_reference = 'TEG-EVT-2026-0001'
      and id <> oyster_event_id
  ) then
    raise exception 'Event ID TEG-EVT-2026-0001 is already assigned';
  end if;

  update public.organisations
  set client_reference = 'TEG-CLI-0001'
  where id = oyster_organisation_id;

  update public.events
  set event_reference = 'TEG-EVT-2026-0001'
  where id = oyster_event_id;
end;
$$;

alter table public.organisations enable trigger protect_client_reference_before_update;
alter table public.events enable trigger protect_event_reference_before_update;

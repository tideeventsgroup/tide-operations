-- A trigger record only exposes columns from its own table. The previous shared
-- function referenced both event_reference and client_reference, so PostgreSQL
-- raised an undefined-field error when either table was updated.
drop trigger if exists protect_client_reference_before_update on public.organisations;
drop trigger if exists protect_event_reference_before_update on public.events;

drop function if exists public.protect_entity_reference();

create function public.protect_client_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.client_reference is distinct from old.client_reference then
    raise exception 'Client ID cannot be changed';
  end if;
  return new;
end;
$$;

create function public.protect_event_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.event_reference is distinct from old.event_reference then
    raise exception 'Event ID cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function public.protect_client_reference() from public, anon, authenticated;
revoke execute on function public.protect_event_reference() from public, anon, authenticated;

create trigger protect_client_reference_before_update
before update on public.organisations
for each row execute function public.protect_client_reference();

create trigger protect_event_reference_before_update
before update on public.events
for each row execute function public.protect_event_reference();

create or replace function public.accept_client_quote(p_quote_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare client_name text;
begin
  if not exists (
    select 1 from public.quotes q
    where q.id = p_quote_id
      and q.organisation_id = public.current_profile_organisation_id()
      and public.current_profile_account_type() = 'client'
      and q.client_visible
      and q.status in ('sent', 'accepted')
  ) then
    raise exception 'Quote is not available for acceptance';
  end if;
  select full_name into client_name from public.user_profiles where id = auth.uid();
  update public.quotes set status = 'accepted', accepted_at = now(), accepted_by_name = client_name
  where id = p_quote_id;
end;
$$;

create or replace function public.accept_client_proposal(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare client_name text;
begin
  if not exists (
    select 1 from public.proposals p
    where p.id = p_proposal_id
      and p.organisation_id = public.current_profile_organisation_id()
      and public.current_profile_account_type() = 'client'
      and p.client_visible
      and p.status in ('sent', 'viewed', 'accepted')
  ) then
    raise exception 'Proposal is not available for acceptance';
  end if;
  select full_name into client_name from public.user_profiles where id = auth.uid();
  update public.proposals set status = 'accepted', accepted_at = now(), accepted_by_name = client_name
  where id = p_proposal_id;
end;
$$;

revoke execute on function public.accept_client_quote(uuid) from public, anon;
revoke execute on function public.accept_client_proposal(uuid) from public, anon;
grant execute on function public.accept_client_quote(uuid) to authenticated;
grant execute on function public.accept_client_proposal(uuid) to authenticated;

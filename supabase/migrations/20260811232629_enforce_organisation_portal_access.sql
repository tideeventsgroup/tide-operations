-- Make the organisation portal switch the single access boundary for all
-- client commercial records and acceptance actions.

create or replace function public.has_client_organisation_access(p_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_profile_account_type() = 'client'
    and p_organisation_id = public.current_profile_organisation_id()
    and exists (
      select 1
      from public.organisations organisation
      where organisation.id = p_organisation_id
        and organisation.portal_access_enabled
    );
$$;

revoke execute on function public.has_client_organisation_access(uuid) from public, anon;
grant execute on function public.has_client_organisation_access(uuid) to authenticated;

drop policy "authorised users view proposals" on public.proposals;
create policy "authorised users view proposals" on public.proposals for select to authenticated using (
  public.is_staff() or (
    public.has_client_organisation_access(organisation_id)
    and client_visible and status <> 'draft'
  )
);

drop policy "authorised users view quotes" on public.quotes;
create policy "authorised users view quotes" on public.quotes for select to authenticated using (
  public.is_staff() or (
    public.has_client_organisation_access(organisation_id)
    and client_visible and status <> 'draft'
  )
);

drop policy "authorised users view quote items" on public.quote_items;
create policy "authorised users view quote items" on public.quote_items for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.quotes quote
    where quote.id = quote_items.quote_id
      and public.has_client_organisation_access(quote.organisation_id)
      and quote.client_visible and quote.status <> 'draft'
  )
);

drop policy "authorised users view invoices" on public.invoices;
create policy "authorised users view invoices" on public.invoices for select to authenticated using (
  public.is_staff() or (
    public.has_client_organisation_access(organisation_id)
    and client_visible and status <> 'draft'
  )
);

drop policy "authorised users view invoice items" on public.invoice_items;
create policy "authorised users view invoice items" on public.invoice_items for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.invoices invoice
    where invoice.id = invoice_items.invoice_id
      and public.has_client_organisation_access(invoice.organisation_id)
      and invoice.client_visible and invoice.status <> 'draft'
  )
);

drop policy "authorised users view payments" on public.payments;
create policy "authorised users view payments" on public.payments for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.invoices invoice
    where invoice.id = payments.invoice_id
      and public.has_client_organisation_access(invoice.organisation_id)
      and invoice.client_visible and invoice.status <> 'draft'
  )
);

drop policy "authorised users view proposal services" on public.proposal_services;
create policy "authorised users view proposal services" on public.proposal_services for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.proposals proposal
    where proposal.id = proposal_services.proposal_id
      and public.has_client_organisation_access(proposal.organisation_id)
      and proposal.client_visible and proposal.status <> 'draft'
  )
);

create or replace function public.accept_client_quote(p_quote_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare client_name text;
begin
  if not exists (
    select 1 from public.quotes quote
    where quote.id = p_quote_id
      and public.has_client_organisation_access(quote.organisation_id)
      and quote.client_visible
      and quote.status in ('sent', 'accepted')
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
    select 1 from public.proposals proposal
    where proposal.id = p_proposal_id
      and public.has_client_organisation_access(proposal.organisation_id)
      and proposal.client_visible
      and proposal.status in ('sent', 'viewed', 'accepted')
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

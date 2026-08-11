-- Cover foreign keys used by joins/deletes and avoid overlapping permissive
-- SELECT policies. Client and staff visibility is expressed once per table.
create index business_opportunities_owner_idx on public.business_opportunities(owner_id);
create index business_opportunities_created_by_idx on public.business_opportunities(created_by);
create index quotes_opportunity_idx on public.quotes(opportunity_id);
create index quotes_created_by_idx on public.quotes(created_by);
create index proposals_opportunity_idx on public.proposals(opportunity_id);
create index proposals_quote_idx on public.proposals(quote_id);
create index proposals_document_idx on public.proposals(document_id);
create index proposals_created_by_idx on public.proposals(created_by);
create index invoices_quote_idx on public.invoices(quote_id);
create index invoices_created_by_idx on public.invoices(created_by);
create index payments_recorded_by_idx on public.payments(recorded_by);
create index commercial_activity_actor_idx on public.commercial_activity(actor_id);

drop policy "managers manage opportunities" on public.business_opportunities;
create policy "managers create opportunities" on public.business_opportunities for insert to authenticated with check (is_manager_or_admin());
create policy "managers update opportunities" on public.business_opportunities for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete opportunities" on public.business_opportunities for delete to authenticated using (is_manager_or_admin());

drop policy "staff view proposals" on public.proposals;
drop policy "clients view published proposals" on public.proposals;
drop policy "managers manage proposals" on public.proposals;
create policy "authorised users view proposals" on public.proposals for select to authenticated using (
  is_staff() or (
    current_profile_account_type() = 'client'
    and organisation_id = current_profile_organisation_id()
    and client_visible and status <> 'draft'
  )
);
create policy "managers create proposals" on public.proposals for insert to authenticated with check (is_manager_or_admin());
create policy "managers update proposals" on public.proposals for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete proposals" on public.proposals for delete to authenticated using (is_manager_or_admin());

drop policy "staff view quotes" on public.quotes;
drop policy "clients view published quotes" on public.quotes;
drop policy "managers manage quotes" on public.quotes;
create policy "authorised users view quotes" on public.quotes for select to authenticated using (
  is_staff() or (
    current_profile_account_type() = 'client'
    and organisation_id = current_profile_organisation_id()
    and client_visible and status <> 'draft'
  )
);
create policy "managers create quotes" on public.quotes for insert to authenticated with check (is_manager_or_admin());
create policy "managers update quotes" on public.quotes for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete quotes" on public.quotes for delete to authenticated using (is_manager_or_admin());

drop policy "staff view quote items" on public.quote_items;
drop policy "clients view published quote items" on public.quote_items;
drop policy "managers manage quote items" on public.quote_items;
create policy "authorised users view quote items" on public.quote_items for select to authenticated using (
  is_staff() or exists (
    select 1 from public.quotes q where q.id = quote_items.quote_id
      and q.organisation_id = current_profile_organisation_id()
      and q.client_visible and q.status <> 'draft'
  )
);
create policy "managers create quote items" on public.quote_items for insert to authenticated with check (is_manager_or_admin());
create policy "managers update quote items" on public.quote_items for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete quote items" on public.quote_items for delete to authenticated using (is_manager_or_admin());

drop policy "staff view invoices" on public.invoices;
drop policy "clients view published invoices" on public.invoices;
drop policy "managers manage invoices" on public.invoices;
create policy "authorised users view invoices" on public.invoices for select to authenticated using (
  is_staff() or (
    current_profile_account_type() = 'client'
    and organisation_id = current_profile_organisation_id()
    and client_visible and status <> 'draft'
  )
);
create policy "managers create invoices" on public.invoices for insert to authenticated with check (is_manager_or_admin());
create policy "managers update invoices" on public.invoices for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete invoices" on public.invoices for delete to authenticated using (is_manager_or_admin());

drop policy "staff view invoice items" on public.invoice_items;
drop policy "clients view published invoice items" on public.invoice_items;
drop policy "managers manage invoice items" on public.invoice_items;
create policy "authorised users view invoice items" on public.invoice_items for select to authenticated using (
  is_staff() or exists (
    select 1 from public.invoices i where i.id = invoice_items.invoice_id
      and i.organisation_id = current_profile_organisation_id()
      and i.client_visible and i.status <> 'draft'
  )
);
create policy "managers create invoice items" on public.invoice_items for insert to authenticated with check (is_manager_or_admin());
create policy "managers update invoice items" on public.invoice_items for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete invoice items" on public.invoice_items for delete to authenticated using (is_manager_or_admin());

drop policy "staff view payments" on public.payments;
drop policy "clients view own invoice payments" on public.payments;
drop policy "managers manage payments" on public.payments;
create policy "authorised users view payments" on public.payments for select to authenticated using (
  is_staff() or exists (
    select 1 from public.invoices i where i.id = payments.invoice_id
      and i.organisation_id = current_profile_organisation_id()
      and i.client_visible and i.status <> 'draft'
  )
);
create policy "managers create payments" on public.payments for insert to authenticated with check (is_manager_or_admin());
create policy "managers update payments" on public.payments for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete payments" on public.payments for delete to authenticated using (is_manager_or_admin());

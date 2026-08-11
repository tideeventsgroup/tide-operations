-- Tide commercial operating system: pipeline, proposals, quotations,
-- invoices and payment records. Every client-facing record retains the
-- permanent Client ID through organisation_id and, where relevant, Event ID.

create type public.opportunity_stage as enum
  ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
create type public.proposal_status as enum
  ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');
create type public.quote_status as enum
  ('draft', 'sent', 'accepted', 'declined', 'expired', 'superseded');
create type public.invoice_status as enum
  ('draft', 'sent', 'part_paid', 'paid', 'overdue', 'void');
create type public.payment_method as enum
  ('bank_transfer', 'card', 'cash', 'cheque', 'other');

create sequence public.opportunity_reference_seq;
create sequence public.proposal_reference_seq;
create sequence public.quote_reference_seq;
create sequence public.invoice_reference_seq;
create sequence public.payment_reference_seq;

grant usage on sequence
  public.opportunity_reference_seq,
  public.proposal_reference_seq,
  public.quote_reference_seq,
  public.invoice_reference_seq,
  public.payment_reference_seq
to authenticated;

create table public.business_opportunities (
  id uuid primary key default gen_random_uuid(),
  opportunity_reference text not null unique default '',
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  event_id uuid references public.events(id) on delete set null,
  name text not null,
  stage public.opportunity_stage not null default 'lead',
  source text,
  estimated_value numeric(12,2) not null default 0 check (estimated_value >= 0),
  probability integer not null default 25 check (probability between 0 and 100),
  expected_close_date date,
  owner_id uuid references public.user_profiles(id) on delete set null,
  notes text,
  lost_reason text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_reference text not null unique default '',
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  event_id uuid references public.events(id) on delete set null,
  opportunity_id uuid references public.business_opportunities(id) on delete set null,
  title text not null,
  status public.quote_status not null default 'draft',
  issue_date date not null default current_date,
  valid_until date,
  currency text not null default 'GBP' check (char_length(currency) = 3),
  subtotal numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  terms text,
  client_visible boolean not null default false,
  accepted_at timestamptz,
  accepted_by_name text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  position integer not null default 0,
  description text not null,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 20 check (tax_rate between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  proposal_reference text not null unique default '',
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  event_id uuid references public.events(id) on delete set null,
  opportunity_id uuid references public.business_opportunities(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  title text not null,
  summary text,
  scope text,
  assumptions text,
  status public.proposal_status not null default 'draft',
  valid_until date,
  client_visible boolean not null default false,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  accepted_by_name text,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_reference text not null unique default '',
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  event_id uuid references public.events(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  title text not null,
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'GBP' check (char_length(currency) = 3),
  subtotal numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  notes text,
  payment_terms text,
  client_visible boolean not null default false,
  sent_at timestamptz,
  paid_at timestamptz,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position integer not null default 0,
  description text not null,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  tax_rate numeric(5,2) not null default 20 check (tax_rate between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_reference text not null unique default '',
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  paid_on date not null default current_date,
  method public.payment_method not null default 'bank_transfer',
  external_reference text,
  notes text,
  recorded_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.commercial_activity (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('opportunity', 'proposal', 'quote', 'invoice', 'payment')),
  entity_id uuid not null,
  action text not null,
  from_status text,
  to_status text,
  note text,
  actor_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index business_opportunities_organisation_idx on public.business_opportunities(organisation_id);
create index business_opportunities_event_idx on public.business_opportunities(event_id);
create index business_opportunities_stage_close_idx on public.business_opportunities(stage, expected_close_date);
create index quotes_organisation_idx on public.quotes(organisation_id);
create index quotes_event_idx on public.quotes(event_id);
create index quotes_status_idx on public.quotes(status);
create index quote_items_quote_idx on public.quote_items(quote_id, position);
create index proposals_organisation_idx on public.proposals(organisation_id);
create index proposals_event_idx on public.proposals(event_id);
create index proposals_status_idx on public.proposals(status);
create index invoices_organisation_idx on public.invoices(organisation_id);
create index invoices_event_idx on public.invoices(event_id);
create index invoices_status_due_idx on public.invoices(status, due_date);
create index invoice_items_invoice_idx on public.invoice_items(invoice_id, position);
create index payments_invoice_idx on public.payments(invoice_id, paid_on);
create index commercial_activity_entity_idx on public.commercial_activity(entity_type, entity_id, created_at desc);

create or replace function public.assign_commercial_reference()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_table_name = 'business_opportunities' then
    new.opportunity_reference := 'TEG-OPP-' || extract(year from current_date)::int || '-' || lpad(nextval('public.opportunity_reference_seq')::text, 4, '0');
  elsif tg_table_name = 'proposals' then
    new.proposal_reference := 'TEG-PRP-' || extract(year from current_date)::int || '-' || lpad(nextval('public.proposal_reference_seq')::text, 4, '0');
  elsif tg_table_name = 'quotes' then
    new.quote_reference := 'TEG-QTE-' || extract(year from current_date)::int || '-' || lpad(nextval('public.quote_reference_seq')::text, 4, '0');
  elsif tg_table_name = 'invoices' then
    new.invoice_reference := 'TEG-INV-' || extract(year from current_date)::int || '-' || lpad(nextval('public.invoice_reference_seq')::text, 4, '0');
  elsif tg_table_name = 'payments' then
    new.payment_reference := 'TEG-PAY-' || extract(year from current_date)::int || '-' || lpad(nextval('public.payment_reference_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger assign_opportunity_reference before insert on public.business_opportunities
for each row execute function public.assign_commercial_reference();
create trigger assign_proposal_reference before insert on public.proposals
for each row execute function public.assign_commercial_reference();
create trigger assign_quote_reference before insert on public.quotes
for each row execute function public.assign_commercial_reference();
create trigger assign_invoice_reference before insert on public.invoices
for each row execute function public.assign_commercial_reference();
create trigger assign_payment_reference before insert on public.payments
for each row execute function public.assign_commercial_reference();

create trigger set_business_opportunities_updated_at before update on public.business_opportunities
for each row execute function public.set_updated_at();
create trigger set_proposals_updated_at before update on public.proposals
for each row execute function public.set_updated_at();
create trigger set_quotes_updated_at before update on public.quotes
for each row execute function public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

create or replace function public.recalculate_quote_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  target_id := coalesce(new.quote_id, old.quote_id);
  update public.quotes q set
    subtotal = totals.subtotal,
    tax_total = totals.tax_total,
    total = totals.subtotal + totals.tax_total
  from (
    select
      coalesce(sum(quantity * unit_price), 0)::numeric(12,2) subtotal,
      coalesce(sum(quantity * unit_price * tax_rate / 100), 0)::numeric(12,2) tax_total
    from public.quote_items where quote_id = target_id
  ) totals
  where q.id = target_id;
  return coalesce(new, old);
end;
$$;

create or replace function public.recalculate_invoice_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
begin
  target_id := coalesce(new.invoice_id, old.invoice_id);
  update public.invoices i set
    subtotal = totals.subtotal,
    tax_total = totals.tax_total,
    total = totals.subtotal + totals.tax_total,
    balance_due = greatest(totals.subtotal + totals.tax_total - i.amount_paid, 0)
  from (
    select
      coalesce(sum(quantity * unit_price), 0)::numeric(12,2) subtotal,
      coalesce(sum(quantity * unit_price * tax_rate / 100), 0)::numeric(12,2) tax_total
    from public.invoice_items where invoice_id = target_id
  ) totals
  where i.id = target_id;
  return coalesce(new, old);
end;
$$;

create or replace function public.recalculate_invoice_payments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare target_id uuid;
declare paid numeric(12,2);
begin
  target_id := coalesce(new.invoice_id, old.invoice_id);
  select coalesce(sum(amount), 0)::numeric(12,2) into paid
  from public.payments where invoice_id = target_id;

  update public.invoices set
    amount_paid = paid,
    balance_due = greatest(total - paid, 0),
    status = case
      when status = 'void' then status
      when total > 0 and paid >= total then 'paid'::public.invoice_status
      when paid > 0 then 'part_paid'::public.invoice_status
      else status
    end,
    paid_at = case when total > 0 and paid >= total then now() else null end
  where id = target_id;
  return coalesce(new, old);
end;
$$;

create trigger quote_items_recalculate after insert or update or delete on public.quote_items
for each row execute function public.recalculate_quote_totals();
create trigger invoice_items_recalculate after insert or update or delete on public.invoice_items
for each row execute function public.recalculate_invoice_totals();
create trigger payments_recalculate after insert or update or delete on public.payments
for each row execute function public.recalculate_invoice_payments();

create or replace function public.log_commercial_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare old_status text;
declare new_status text;
declare entity_label text;
begin
  entity_label := case tg_table_name
    when 'business_opportunities' then 'opportunity'
    when 'proposals' then 'proposal'
    when 'quotes' then 'quote'
    when 'invoices' then 'invoice'
  end;
  execute format('select ($1).%I::text', case when tg_table_name = 'business_opportunities' then 'stage' else 'status' end)
    using old into old_status;
  execute format('select ($1).%I::text', case when tg_table_name = 'business_opportunities' then 'stage' else 'status' end)
    using new into new_status;
  if old_status is distinct from new_status then
    insert into public.commercial_activity(entity_type, entity_id, action, from_status, to_status, actor_id)
    values (entity_label, new.id, 'status_changed', old_status, new_status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger opportunity_status_audit after update on public.business_opportunities
for each row execute function public.log_commercial_status_change();
create trigger proposal_status_audit after update on public.proposals
for each row execute function public.log_commercial_status_change();
create trigger quote_status_audit after update on public.quotes
for each row execute function public.log_commercial_status_change();
create trigger invoice_status_audit after update on public.invoices
for each row execute function public.log_commercial_status_change();

revoke execute on function public.assign_commercial_reference() from public, anon, authenticated;
revoke execute on function public.recalculate_quote_totals() from public, anon, authenticated;
revoke execute on function public.recalculate_invoice_totals() from public, anon, authenticated;
revoke execute on function public.recalculate_invoice_payments() from public, anon, authenticated;
revoke execute on function public.log_commercial_status_change() from public, anon, authenticated;

alter table public.business_opportunities enable row level security;
alter table public.proposals enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.commercial_activity enable row level security;

create policy "staff view opportunities" on public.business_opportunities
for select to authenticated using (is_staff());
create policy "managers manage opportunities" on public.business_opportunities
for all to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());

create policy "staff view proposals" on public.proposals
for select to authenticated using (is_staff());
create policy "clients view published proposals" on public.proposals
for select to authenticated using (
  current_profile_account_type() = 'client'
  and organisation_id = current_profile_organisation_id()
  and client_visible
  and status <> 'draft'
);
create policy "managers manage proposals" on public.proposals
for all to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());

create policy "staff view quotes" on public.quotes
for select to authenticated using (is_staff());
create policy "clients view published quotes" on public.quotes
for select to authenticated using (
  current_profile_account_type() = 'client'
  and organisation_id = current_profile_organisation_id()
  and client_visible
  and status <> 'draft'
);
create policy "managers manage quotes" on public.quotes
for all to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());

create policy "staff view quote items" on public.quote_items
for select to authenticated using (is_staff());
create policy "clients view published quote items" on public.quote_items
for select to authenticated using (exists (
  select 1 from public.quotes q
  where q.id = quote_items.quote_id
    and q.organisation_id = current_profile_organisation_id()
    and q.client_visible and q.status <> 'draft'
));
create policy "managers manage quote items" on public.quote_items
for all to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());

create policy "staff view invoices" on public.invoices
for select to authenticated using (is_staff());
create policy "clients view published invoices" on public.invoices
for select to authenticated using (
  current_profile_account_type() = 'client'
  and organisation_id = current_profile_organisation_id()
  and client_visible
  and status <> 'draft'
);
create policy "managers manage invoices" on public.invoices
for all to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());

create policy "staff view invoice items" on public.invoice_items
for select to authenticated using (is_staff());
create policy "clients view published invoice items" on public.invoice_items
for select to authenticated using (exists (
  select 1 from public.invoices i
  where i.id = invoice_items.invoice_id
    and i.organisation_id = current_profile_organisation_id()
    and i.client_visible and i.status <> 'draft'
));
create policy "managers manage invoice items" on public.invoice_items
for all to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());

create policy "staff view payments" on public.payments
for select to authenticated using (is_staff());
create policy "clients view own invoice payments" on public.payments
for select to authenticated using (exists (
  select 1 from public.invoices i
  where i.id = payments.invoice_id
    and i.organisation_id = current_profile_organisation_id()
    and i.client_visible and i.status <> 'draft'
));
create policy "managers manage payments" on public.payments
for all to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());

create policy "staff view commercial activity" on public.commercial_activity
for select to authenticated using (is_staff());

create or replace view public.v_commercial_overview
with (security_invoker = true) as
select
  (select coalesce(sum(estimated_value * probability / 100), 0) from public.business_opportunities where stage not in ('won', 'lost'))::numeric(12,2) as weighted_pipeline,
  (select count(*) from public.quotes where status = 'sent') as quotes_awaiting_decision,
  (select coalesce(sum(balance_due), 0) from public.invoices where status in ('sent', 'part_paid', 'overdue'))::numeric(12,2) as outstanding_invoices,
  (select count(*) from public.invoices where due_date < current_date and balance_due > 0 and status not in ('paid', 'void')) as overdue_invoices;

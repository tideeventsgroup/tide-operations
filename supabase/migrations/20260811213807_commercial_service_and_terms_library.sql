create table public.business_services (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null,
  description text not null,
  unit_label text not null default 'service',
  default_unit_price numeric(12,2) not null default 0 check (default_unit_price >= 0),
  tax_rate numeric(5,2) not null default 20 check (tax_rate between 0 and 100),
  active boolean not null default true,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.commercial_terms_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document_kind text not null default 'all' check (document_kind in ('all', 'proposal', 'quote', 'invoice')),
  body text not null,
  is_default boolean not null default false,
  active boolean not null default true,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposals add column terms text;

create table public.proposal_services (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  service_id uuid references public.business_services(id) on delete set null,
  position integer not null default 0,
  service_name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index business_services_created_by_idx on public.business_services(created_by);
create index commercial_terms_created_by_idx on public.commercial_terms_templates(created_by);
create index proposal_services_proposal_idx on public.proposal_services(proposal_id, position);
create index proposal_services_service_idx on public.proposal_services(service_id);

create trigger set_business_services_updated_at before update on public.business_services
for each row execute function public.set_updated_at();
create trigger set_commercial_terms_updated_at before update on public.commercial_terms_templates
for each row execute function public.set_updated_at();

insert into public.business_services(code, name, category, description, unit_label, default_unit_price, tax_rate) values
  ('ESMP', 'Event Safety Management Plan', 'Planning & Safety', 'Development of a comprehensive event safety management plan covering governance, command, emergency arrangements, site operations and supporting schedules.', 'plan', 3000, 20),
  ('CTRL', 'Event Control Room Operations', 'Live Operations', 'Planning, setup and professional operation of the event control room, including logging, communications, escalation and multi-agency coordination.', 'event', 15000, 20),
  ('ESM', 'Event Safety Management', 'Planning & Safety', 'Event safety leadership from planning through delivery, including stakeholder coordination, readiness assurance and on-site safety management.', 'day', 0, 20),
  ('RA', 'Risk Assessment', 'Planning & Safety', 'Event-specific hazard identification, risk assessment, control measures and review aligned to the operating plan.', 'assessment', 0, 20),
  ('CROWD', 'Crowd Management Planning', 'Planning & Safety', 'Crowd profile, capacity, ingress, circulation, egress, stewarding and contingency planning for public events.', 'plan', 0, 20),
  ('RADIO', 'Radio Communications Plan', 'Communications', 'Radio channel structure, call-sign allocation, communication protocols, message handling and escalation arrangements.', 'plan', 0, 20),
  ('INC', 'Incident Management Provision', 'Live Operations', 'Incident command processes, incident logging, decision records, M/ETHANE messaging and emergency-service liaison.', 'event', 0, 20),
  ('DOC', 'Event Operations Documentation', 'Documentation', 'Production and control of event plans, procedures, briefings, schedules and operational reference documents.', 'document', 0, 20),
  ('OSM', 'On-site Safety Manager', 'Live Operations', 'Competent on-site safety manager for operational checks, team coordination, escalation and live assurance.', 'day', 0, 20),
  ('DEBRIEF', 'Post-event Debrief and Report', 'Assurance', 'Structured post-event debrief, action capture, incident review and written recommendations for future delivery.', 'report', 0, 20);

insert into public.commercial_terms_templates(name, document_kind, body, is_default) values (
  'Tide Events Group - Standard Commercial Terms',
  'all',
  $terms$1. BASIS OF AGREEMENT
These terms apply to the proposal, quotation or invoice to which they are attached. Together, those documents form the agreement between Tide Events Group ("Tide") and the named client. If there is a conflict, the signed proposal or accepted quotation takes priority over these standard terms.

2. SCOPE AND DELIVERABLES
Tide will provide the services and deliverables expressly listed in the accepted proposal or quotation. Any item not listed is outside scope. Advice, plans and operational arrangements are based on the information, dates, venue conditions, attendance assumptions and third-party requirements supplied to Tide at the time.

3. CLIENT RESPONSIBILITIES
The client will provide complete and accurate information, timely decisions, suitable access to venues and systems, a nominated decision-maker, and all permissions, licences, insurance, contractor information and stakeholder cooperation reasonably required for delivery. The client remains responsible for the event, statutory compliance and implementation of agreed controls unless the document expressly states otherwise.

4. CHANGES TO SCOPE
Changes to dates, venue, attendance, programme, site design, risk profile, operating hours or deliverables may require a revised fee and programme. Tide will identify material changes and will not be required to undertake additional work until the variation is agreed in writing. Urgent safety-critical work may be undertaken where delay would create an unreasonable operational risk and will be charged at the applicable rate.

5. FEES, VAT AND EXPENSES
Fees are stated in pounds sterling and exclude VAT unless expressly shown otherwise. Reasonable pre-approved travel, accommodation, subsistence, specialist supplies and third-party costs are chargeable in addition to professional fees. Quotations remain valid until the stated expiry date.

6. INVOICING AND PAYMENT
Invoices are payable by the due date shown. The client must quote the Invoice ID with payment. Tide may charge statutory interest and recovery costs on overdue commercial debts and may pause non-safety-critical work while sums remain overdue. A dispute must be raised promptly with details of the amount and reason; undisputed amounts remain payable.

7. CANCELLATION AND POSTPONEMENT
If the client cancels or postpones, the client will pay for work completed, committed third-party costs and reserved delivery time that Tide cannot reasonably redeploy. Unless a signed proposal states different terms, cancellation charges are: more than 60 days before delivery - costs incurred; 31 to 60 days - 25% of remaining fees; 15 to 30 days - 50%; 8 to 14 days - 75%; 7 days or fewer - 100%. A postponement is treated as a cancellation unless revised dates and fees are agreed.

8. SAFETY AND PROFESSIONAL JUDGEMENT
Tide may stop, suspend or amend an activity where its personnel reasonably believe there is a serious risk to health, safety, welfare, legal compliance or operational control. This does not transfer the event organiser's legal duties to Tide. The client will ensure Tide personnel have a safe working environment and access to welfare, communications and emergency arrangements.

9. THIRD PARTIES AND SUBCONTRACTORS
Tide may use suitably competent employees, associates or subcontractors. Tide is not responsible for the acts, omissions or delays of suppliers, venues, authorities, emergency services or other parties outside Tide's reasonable control, but will coordinate with them where included in scope.

10. INTELLECTUAL PROPERTY AND DOCUMENT USE
Tide retains ownership of its pre-existing methods, templates, systems and know-how. Once all relevant invoices are paid, the client may use final issued deliverables for the named event and agreed purpose. Drafts must not be relied upon or distributed as final. Documents may not be materially altered, reused for another event or represented as Tide-approved without written consent.

11. CONFIDENTIALITY AND DATA PROTECTION
Each party will protect confidential information and use it only for delivery of the agreement. Each party will comply with applicable data-protection law. The client will avoid providing special-category or unnecessary personal data unless a secure and agreed process is in place. Tide may retain business and operational records where reasonably required for legal, insurance, safety and audit purposes.

12. LIABILITY
Nothing excludes liability that cannot lawfully be excluded, including liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation. Subject to that, Tide is not liable for indirect or consequential loss, loss of profit, loss of opportunity or reputational loss. Tide's aggregate liability arising from the agreement is limited to the fees paid or payable for the affected services, except where a higher limit is required by law or expressly agreed in writing. The client is responsible for maintaining appropriate event and public-liability insurance.

13. FORCE MAJEURE
Neither party is liable for delay or failure caused by circumstances beyond reasonable control, including severe weather, civil emergency, government action, epidemic, infrastructure failure, industrial action or withdrawal of essential permissions. The affected party will notify the other and take reasonable steps to reduce disruption. Fees remain payable for work completed and unavoidable commitments.

14. TERMINATION
Either party may terminate for a material breach that is not remedied within a reasonable written notice period. Tide may terminate or suspend immediately for serious safety concerns, unlawful instructions, abusive conduct, insolvency or persistent non-payment. Accrued payment, confidentiality, intellectual-property and liability provisions survive termination.

15. NOTICES, ENTIRE AGREEMENT AND WAIVER
Formal notices must be sent to the notified business contact by email or another agreed written method. The agreement records the entire understanding for the services and replaces earlier discussions relating to them. A delay in enforcing a right is not a waiver. If any provision is unenforceable, the remaining provisions continue.

16. GOVERNING LAW
The agreement is governed by Scots law and the Scottish courts have exclusive jurisdiction, unless the parties agree an alternative dispute-resolution process in writing.$terms$,
  true
);

update public.quotes
set terms = (select body from public.commercial_terms_templates where is_default limit 1)
where terms is null or terms = '' or terms = 'Prices exclude additional services not listed. Changes to scope may require a revised quotation.';

update public.proposals
set terms = (select body from public.commercial_terms_templates where is_default limit 1)
where terms is null;

update public.invoices
set payment_terms = (select body from public.commercial_terms_templates where is_default limit 1)
where payment_terms is null or payment_terms = '' or payment_terms like 'Payment due within 14 days%';

alter table public.business_services enable row level security;
alter table public.commercial_terms_templates enable row level security;
alter table public.proposal_services enable row level security;

create policy "staff view service catalogue" on public.business_services for select to authenticated using (is_staff());
create policy "managers create services" on public.business_services for insert to authenticated with check (is_manager_or_admin());
create policy "managers update services" on public.business_services for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete services" on public.business_services for delete to authenticated using (is_manager_or_admin());

create policy "staff view terms templates" on public.commercial_terms_templates for select to authenticated using (is_staff());
create policy "managers create terms templates" on public.commercial_terms_templates for insert to authenticated with check (is_manager_or_admin());
create policy "managers update terms templates" on public.commercial_terms_templates for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete terms templates" on public.commercial_terms_templates for delete to authenticated using (is_manager_or_admin());

create policy "authorised users view proposal services" on public.proposal_services for select to authenticated using (
  is_staff() or exists (
    select 1 from public.proposals p where p.id = proposal_services.proposal_id
      and p.organisation_id = current_profile_organisation_id()
      and p.client_visible and p.status <> 'draft'
  )
);
create policy "managers create proposal services" on public.proposal_services for insert to authenticated with check (is_manager_or_admin());
create policy "managers update proposal services" on public.proposal_services for update to authenticated using (is_manager_or_admin()) with check (is_manager_or_admin());
create policy "managers delete proposal services" on public.proposal_services for delete to authenticated using (is_manager_or_admin());

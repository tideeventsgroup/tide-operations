-- Simplifies the document system from a structured, schema-driven editor to
-- uploaded files under the same controlled-document workflow: reference
-- numbers, versioning, and the Draft -> In review -> Approved -> Issued
-- state machine all stay; the structured form (document_templates.
-- structure_json / locked_brand_elements) and its content_json goes away.
--
-- This is a dev database with only our own test data in it, so we clear the
-- document tables outright rather than trying to backfill file metadata for
-- rows that never had a file.

delete from document_versions;
delete from documents;
delete from document_reference_counters;

-- 1. New simplified document_types table (replaces document_templates).
create table document_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique, -- short code used in reference numbers, e.g. OSSP
  status template_status not null default 'published',
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_document_types_updated_at before update on document_types
  for each row execute function set_updated_at();

alter table document_types enable row level security;

create policy "staff can view document types" on document_types
  for select using (is_staff());

create policy "admin manages document types" on document_types
  for all using (is_admin()) with check (is_admin());

-- 2. Seed the same document types the old templates covered.
insert into document_types (name, code, status) values
  ('Operational & Safety/Site Plan (OSSP)', 'OSSP', 'published'),
  ('Risk Assessment', 'RA', 'published'),
  ('Radio Channel Plan', 'RADIO', 'published'),
  ('Client Proposal', 'PROP', 'published'),
  ('Standard Operating Procedure', 'SOP', 'published');

-- 3. Repoint documents.template_id -> document_types, renamed for clarity.
alter table documents drop constraint documents_template_id_fkey;
alter table documents rename column template_id to document_type_id;
alter table documents add constraint documents_document_type_id_fkey
  foreign key (document_type_id) references document_types (id);

-- 4. No structured fields left, so there's nothing to compute completion from.
alter table documents drop column completion_pct;

-- 5. document_versions: replace structured content with uploaded-file metadata.
alter table document_versions drop column content_json;
alter table document_versions drop column pdf_storage_path;

alter table document_versions
  add column file_name text not null default '',
  add column file_storage_path text not null default '',
  add column file_size bigint,
  add column mime_type text;

alter table document_versions alter column file_name drop default;
alter table document_versions alter column file_storage_path drop default;

-- 6. document_knowledge_references linked structured fields to knowledge
-- blocks; with no structured fields left to link from, drop it.
drop table if exists document_knowledge_references;

-- 7. document_templates is fully superseded by document_types.
drop table document_templates;

-- 8. Reference-number generator now looks up document_types.
create or replace function generate_document_reference()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_year integer := extract(year from now());
  v_next integer;
begin
  if new.reference is not null then
    return new;
  end if;

  select code into v_code from document_types where id = new.document_type_id;

  insert into document_reference_counters (template_code, year, last_value)
  values (v_code, v_year, 1)
  on conflict (template_code, year)
  do update set last_value = document_reference_counters.last_value + 1
  returning last_value into v_next;

  new.reference := 'TEG-' || v_code || '-' || v_year || '-' || lpad(v_next::text, 3, '0');
  return new;
end;
$$;

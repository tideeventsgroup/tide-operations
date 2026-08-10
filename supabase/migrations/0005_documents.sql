-- Document system: document_templates, documents, document_versions,
-- knowledge_blocks (section 4.2).

create table document_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique, -- short code used in reference numbers, e.g. OSSP
  output_format document_output_format not null default 'a4',
  structure_json jsonb not null default '{"sections": []}'::jsonb,
  version integer not null default 1,
  locked_brand_elements jsonb not null default '{
    "logo_position": "top-left",
    "margins_mm": {"top": 20, "right": 18, "bottom": 20, "left": 18},
    "colours": {"charcoal": "#373536", "teal": "#60B9C5", "white": "#FFFFFF"},
    "typeface": "Arial"
  }'::jsonb,
  status template_status not null default 'draft',
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table document_reference_counters (
  template_code text not null,
  year integer not null,
  last_value integer not null default 0,
  primary key (template_code, year)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  template_id uuid not null references document_templates (id),
  reference text unique,
  title text not null,
  status document_status not null default 'draft',
  owner_id uuid references user_profiles (id),
  current_version_id uuid, -- FK added after document_versions exists
  completion_pct integer not null default 0 check (completion_pct between 0 and 100),
  client_visible boolean not null default false,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  issued_at timestamptz,
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  version_number integer not null,
  content_json jsonb not null default '{}'::jsonb,
  pdf_storage_path text,
  submitted_by uuid references user_profiles (id),
  reviewed_by uuid references user_profiles (id),
  approved_by uuid references user_profiles (id),
  review_comments jsonb not null default '[]'::jsonb,
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, version_number)
);

alter table documents
  add constraint documents_current_version_id_fkey
  foreign key (current_version_id) references document_versions (id) on delete set null;

create table knowledge_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  content text not null,
  version integer not null default 1,
  approval_status knowledge_block_approval_status not null default 'draft',
  review_date date,
  created_by uuid references user_profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Documents can reference knowledge_blocks (section 6.9: "reference ... by id
-- and version rather than copying text").
create table document_knowledge_references (
  document_id uuid not null references documents (id) on delete cascade,
  knowledge_block_id uuid not null references knowledge_blocks (id),
  section_key text not null,
  primary key (document_id, knowledge_block_id, section_key)
);

create index idx_documents_event_id on documents (event_id);
create index idx_documents_template_id on documents (template_id);
create index idx_document_versions_document_id on document_versions (document_id);
create index idx_document_knowledge_references_document_id on document_knowledge_references (document_id);

create trigger set_document_templates_updated_at before update on document_templates
  for each row execute function set_updated_at();
create trigger set_documents_updated_at before update on documents
  for each row execute function set_updated_at();
create trigger set_document_versions_updated_at before update on document_versions
  for each row execute function set_updated_at();
create trigger set_knowledge_blocks_updated_at before update on knowledge_blocks
  for each row execute function set_updated_at();

-- Reference numbering: TEG-<TEMPLATE_CODE>-<YEAR>-<sequence>, e.g.
-- TEG-OSSP-2026-014 (section 4.2). Atomic per template/year via upsert.
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

  select code into v_code from document_templates where id = new.template_id;

  insert into document_reference_counters (template_code, year, last_value)
  values (v_code, v_year, 1)
  on conflict (template_code, year)
  do update set last_value = document_reference_counters.last_value + 1
  returning last_value into v_next;

  new.reference := 'TEG-' || v_code || '-' || v_year || '-' || lpad(v_next::text, 3, '0');
  return new;
end;
$$;

create trigger generate_document_reference_trigger
  before insert on documents
  for each row execute function generate_document_reference();

-- Keep documents.completion_pct / current_version_id in step whenever a new
-- version is created, so list views don't need a join to compute them.
create or replace function sync_document_on_new_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update documents
  set current_version_id = new.id
  where id = new.document_id;
  return new;
end;
$$;

create trigger sync_document_on_new_version_trigger
  after insert on document_versions
  for each row execute function sync_document_on_new_version();

-- Approval-stage timestamps, recorded automatically on status transitions
-- (section 6.7: "Each transition records who acted and when").
create or replace function record_document_status_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    case new.status
      when 'in_review' then new.submitted_at := now();
      when 'needs_updates' then new.reviewed_at := now();
      when 'approved' then new.approved_at := now();
      when 'issued' then new.issued_at := now();
      else null;
    end case;
  end if;
  return new;
end;
$$;

create trigger record_document_status_timestamps_trigger
  before update of status on documents
  for each row execute function record_document_status_timestamps();

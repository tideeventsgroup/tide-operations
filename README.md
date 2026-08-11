# Tide Operations System

Tide Events Group Scotland's event-operations platform — planning, controlled
document management, client collaboration, and live incident control. Built
from the Technical Architecture Specification (v0.1, 10 Aug 2026), with the
document system adapted to a simpler uploaded-file model at the client's
request.

The complete roadmap is implemented: foundation and planning tools, document
control, a client portal, and live incident management. Staff upload a file
against a document type and event; the platform owns the reference number,
version history, client visibility, and Draft → In review → Needs updates →
Approved → Issued → Archived workflow around it.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 + shadcn/ui (Base UI) ·
TanStack Query · Supabase (Postgres, Auth, Storage, RLS).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — from
  the Supabase project this was built against (`tide-operations-system`,
  `eu-west-2`). Already populated in `.env.local` for local dev.
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Dashboard → Project Settings →
  API. Reserved for privileged server-only operations. Never expose it to the
  browser; normal application reads and writes use the signed-in user's
  RLS-scoped client.
- `RESEND_API_KEY` — reserved for transactional invitation and notification
  emails. Sign-up/sign-in works without it.

### Bootstrapping the first admin

Registration is restricted-by-default (spec §5.1): every new account starts
as `account_type = pending` with no `staff_role`, and only an admin can
promote anyone — including the very first user. To bootstrap:

1. Sign up at `/request-access`.
2. In the Supabase SQL editor for the project, run:
   ```sql
   update user_profiles
   set account_type = 'staff', staff_role = 'admin'
   where email = 'you@tideeventsgroup.co.uk';
   ```
3. Sign in — you'll now see the full staff app plus the Admin section
   (Users & Roles, Document Types).

Supabase Auth requires email confirmation before sign-in by default. Locally,
either disable "Confirm email" under Authentication → Providers → Email in
the Supabase dashboard, or confirm manually:
```sql
update auth.users set email_confirmed_at = now() where email = '...';
```
In production, a transactional email provider (Resend) handles this via the
normal confirmation flow.

## Database

All schema, RLS policies, and seed data live in `supabase/migrations/` as
plain numbered SQL files, applied in order. They were run against the live
project via the Supabase MCP tools during this build; if you need to
reproduce them elsewhere, apply them in filename order with the Supabase CLI
or `apply_migration`.

Key architectural decisions baked into the schema (see migration file
comments for detail):

- **RLS is the access-control boundary**, not the UI (spec §3.2). Every
  event-scoped table's policy is built on `has_event_access()` /
  `is_manager_or_admin()` / `is_admin()` helper functions
  (`0003_access_helpers.sql`).
- **Document status transitions are guarded at the database layer.** Direct
  `UPDATE ... SET status = ...` is blocked by a trigger; the only way to
  move a document through Draft → In review → Needs updates → Approved →
  Issued → Archived is the `transition_document_status()` RPC, which
  enforces the valid-transition graph and role checks server-side
  (`0006_document_rls_and_workflow.sql`).
- **Documents are uploaded files, not structured content** (`0011_document_
  types_and_uploads.sql`). Each `document_versions` row is one uploaded file
  (`file_name`/`file_storage_path`/`file_size`/`mime_type`) rather than a
  `content_json` blob — re-uploading creates a new version rather than
  overwriting; an issued version is never overwritten. `document_types`
  (name + reference code) replaced the earlier structured-template system
  (`document_templates` with `structure_json`/`locked_brand_elements`) — it's
  just a label used for organising uploads and driving the reference number,
  not a form definition.
- **Document references are generated atomically** (`TEG-<CODE>-<YEAR>-<seq>`,
  e.g. `TEG-OSSP-2026-014`) via a per-type/year counter table.
- **Files are served via short-lived signed URLs** generated server-side
  after an RLS-backed authorisation check (spec §8.1) — see
  `src/app/api/documents/[id]/file/route.ts`. Objects in the `event-files`
  Storage bucket are never public.
- **New Supabase Auth users always land as `pending`** via an
  `on_auth_user_created` trigger — there's no "first user becomes admin"
  window.
- **The client portal is organisation-scoped.** Client users can only see
  portal-enabled events belonging to their organisation, client-visible
  milestones and documents, their own requests, and messages explicitly
  shared with the client (`0012_client_portal.sql`).
- **Incident management is append-first and realtime.** Incident numbers are
  generated atomically per event, log corrections supersede rather than edit
  earlier entries, and incidents, logs, decisions, resources, and M/ETHANE
  panels update through authenticated Realtime subscriptions
  (`0013_incident_management.sql` onwards).
- **Welfare records are restricted by RLS** to admins, managers, and control
  room users. Field users cannot query those rows even if they call the API
  directly.

Regenerate `src/lib/supabase/types.ts` after any schema change (Supabase MCP
`generate_typescript_types`, or `supabase gen types typescript` once the CLI
is linked).

## What's built

- Restricted registration, sign-in, staff roles, and admin user management.
- Closest-event-first operations dashboard, event lifecycle, clients,
  contacts, milestones, tasks, and knowledge library.
- Uploaded document control with types, references, immutable versions,
  approval workflow, private storage, signed downloads, and client sharing.
- Organisation-scoped client portal with event overview, milestones, shared
  documents, requests, and client/staff messaging.
- Live incident register with severity/status controls, contemporaneous log
  and corrections, decisions, resources, restricted welfare records, and
  M/ETHANE reporting.

Production rollout still requires organisation-specific operational work:
transactional email configuration, accessibility and load testing against the
expected user volume, backup/restore rehearsal, and user acceptance testing.

## Deployment

Frontend on Vercel, backend on Supabase Cloud — both already provisioned in
`eu-west-2` (EU) per the spec's UK GDPR data-residency requirement. Set the
same environment variables as above in the Vercel project.

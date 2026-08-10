# Tide Operations System

Tide Events Group Scotland's internal event-lifecycle platform — event records,
document production, and (in later phases) live incident control and a client
portal. Built from the [Technical Architecture Specification](.) (v0.1, 10 Aug
2026).

This build covers **Phase 1 (Foundation)** and **Phase 2 (Planning tools)** of
the spec's roadmap: auth, dashboard, event/client/task management, and a
schema-driven Document Studio with a working OSSP template end-to-end
(editor → approval workflow → branded PDF export).

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 + shadcn/ui (Base UI) ·
TanStack Query · Supabase (Postgres, Auth, Storage, RLS) · Puppeteer
(server-side PDF rendering).

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
  API. Not currently used by any code path (all writes go through RLS-scoped
  clients), but reserved for privileged server-only operations as the system
  grows. Never expose it to the browser.
- `RESEND_API_KEY` — needed once staff invitation emails are wired up
  (Phase 6). Sign-up/sign-in works without it in the meantime.

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
   (Users & Roles, Template Administration).

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
  (`0006_document_rls_and_workflow.sql`). This satisfies the spec's
  requirement that approval transitions be validated server-side, without
  needing a separate Next.js Route Handler for it.
- **Document references are generated atomically** (`TEG-<CODE>-<YEAR>-<seq>`,
  e.g. `TEG-OSSP-2026-014`) via a per-template/year counter table.
- **New Supabase Auth users always land as `pending`** via an
  `on_auth_user_created` trigger — there's no "first user becomes admin"
  window.

Regenerate `src/lib/supabase/types.ts` after any schema change (Supabase MCP
`generate_typescript_types`, or `supabase gen types typescript` once the CLI
is linked).

## What's built vs. what's next

**Working now:** sign-in / restricted registration / admin role assignment,
staff dashboard, event CRUD with stage tracking and audit trail, client
(organisation/contact) management, portfolio task board, milestones, the
Knowledge Library, Template Administration (read view), and the full OSSP
Document Studio flow — schema-driven editor, draft autosave, the approval
state machine, and branded PDF export to Supabase Storage.

**Deliberately out of scope for this build** (see spec §10, Phases 3–6):
remaining master templates beyond OSSP, the reviews/approvals queue as a
dedicated screen, the client portal (routes exist as a placeholder only),
incident management / M/ETHANE, and production hardening (invitation emails,
full multi-page PDF rendering, load testing, accessibility pass).

### Known follow-ups

- PDF generation currently launches a fresh headless Chromium instance per
  request (~15–20s cold). The spec's NFR target is <10s — worth pooling/
  reusing a browser instance before this goes near production load.
- `document_knowledge_references` (the join table linking a document version
  to the knowledge blocks it cites) is defined and RLS-protected but not yet
  populated by the editor — knowledge block references are currently only
  resolved at PDF-render time from `content_json`, not recorded as a queryable
  link.

## Deployment

Frontend on Vercel, backend on Supabase Cloud — both already provisioned in
`eu-west-2` (EU) per the spec's UK GDPR data-residency requirement. Set the
same environment variables as above in the Vercel project. PDF generation on
Vercel's serverless runtime needs `puppeteer-core` + `@sparticuz/chromium`
(both installed) rather than the full `puppeteer` package used locally —
`src/lib/pdf/launch-browser.ts` already branches on `process.env.VERCEL` to
pick the right one.

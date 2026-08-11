import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CirclePoundSterling,
  Clock3,
  Download,
  FileText,
  Inbox,
  Mail,
  MapPin,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { EntityReference } from "@/components/entity-reference";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { StageBadge } from "@/components/status-badges";
import { formatBusinessDate, formatMoney } from "@/lib/business";
import { formatEventCountdown } from "@/lib/utils";

function portalDate(value: string | null) {
  return value
    ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "To be confirmed";
}

function activityDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function DashboardMetric({ icon: Icon, label, value, detail }: { icon: typeof CalendarDays; label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-white p-4 shadow-[0_1px_2px_rgba(23,23,23,0.025)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">{label}</p>
        <Icon className="size-4 text-tide-teal" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-tide-charcoal tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export default async function PortalHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: events }] = await Promise.all([
    supabase.from("user_profiles").select("full_name, account_type, organisation_id").eq("id", user?.id ?? "").maybeSingle(),
    supabase.from("events").select("id, event_reference, name, venue, start_date, end_date, stage, organisation_id, organisations(name, client_reference, relationship_status, portal_access_enabled)").order("start_date", { ascending: true, nullsFirst: false }),
  ]);

  const firstOrganisation = events?.[0]?.organisations as { name: string; client_reference: string; relationship_status: string; portal_access_enabled: boolean } | null;
  const organisationId = profile?.organisation_id ?? events?.[0]?.organisation_id ?? null;
  const eventIds = events?.map((event) => event.id) ?? [];

  const contactsQuery = organisationId
    ? supabase.from("contacts").select("id, name, role, email, phone, is_primary").eq("organisation_id", organisationId).order("is_primary", { ascending: false })
    : Promise.resolve({ data: [] });
  const documentsQuery = eventIds.length
    ? supabase.from("documents").select("id, title, reference, updated_at, event_id, events(name, event_reference)").in("event_id", eventIds).order("updated_at", { ascending: false }).limit(5)
    : Promise.resolve({ data: [] });
  const requestsQuery = eventIds.length
    ? supabase.from("client_requests").select("id, title, status, updated_at, event_id, events(name)").in("event_id", eventIds).order("updated_at", { ascending: false }).limit(5)
    : Promise.resolve({ data: [] });
  const messagesQuery = eventIds.length
    ? supabase.from("event_messages").select("id, body, created_at, event_id, events(name)").in("event_id", eventIds).order("created_at", { ascending: false }).limit(4)
    : Promise.resolve({ data: [] });
  const quotesQuery = organisationId
    ? supabase.from("quotes").select("id, quote_reference, title, status, total, valid_until, event_id").eq("organisation_id", organisationId).eq("client_visible", true).neq("status", "draft").order("created_at", { ascending: false }).limit(4)
    : Promise.resolve({ data: [] });
  const invoicesQuery = organisationId
    ? supabase.from("invoices").select("id, invoice_reference, title, status, total, balance_due, due_date, event_id").eq("organisation_id", organisationId).eq("client_visible", true).neq("status", "draft").order("created_at", { ascending: false }).limit(4)
    : Promise.resolve({ data: [] });

  const [{ data: contacts }, { data: documents }, { data: requests }, { data: messages }, { data: quotes }, { data: invoices }] = await Promise.all([
    contactsQuery,
    documentsQuery,
    requestsQuery,
    messagesQuery,
    quotesQuery,
    invoicesQuery,
  ]);

  const closestEvent = events?.[0] ?? null;
  const activeEvents = events?.filter((event) => event.stage !== "complete").length ?? 0;
  const openRequests = requests?.filter((request) => request.status === "open").length ?? 0;
  const outstandingBalance = invoices?.reduce((sum, invoice) => sum + Number(invoice.balance_due), 0) ?? 0;
  const recentActivity = [
    ...(documents ?? []).map((item) => ({ id: `document-${item.id}`, eventId: item.event_id, title: item.title, detail: "Document shared", date: item.updated_at, icon: FileText })),
    ...(requests ?? []).map((item) => ({ id: `request-${item.id}`, eventId: item.event_id, title: item.title, detail: `Request ${item.status.replaceAll("_", " ")}`, date: item.updated_at, icon: Inbox })),
    ...(messages ?? []).map((item) => ({ id: `message-${item.id}`, eventId: item.event_id, title: item.body, detail: "Event message", date: item.created_at, icon: MessageSquare })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border bg-white shadow-[0_12px_36px_rgba(55,53,54,0.055)]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="p-5 sm:p-7 lg:p-9">
            <p className="text-[11px] font-bold tracking-[0.13em] text-tide-teal uppercase">Account dashboard</p>
            <h1 className="mt-3 text-[2rem] leading-tight font-semibold tracking-[-0.035em] text-tide-charcoal sm:text-[2.5rem]">
              Welcome, {profile?.full_name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Your Tide account brings events, documents, commercial records, requests and correspondence into one place.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <EntityReference label="Client ID" value={firstOrganisation?.client_reference} />
              <span className="inline-flex min-h-7 items-center rounded-md border bg-[#f8f9f9] px-2.5 text-xs font-semibold text-muted-foreground">
                {firstOrganisation?.name ?? "Tide client account"}
              </span>
            </div>
          </div>
          <div className="border-t bg-tide-charcoal p-5 text-white sm:p-7 lg:border-t-0 lg:border-l lg:border-white/10 lg:p-8">
            <div className="flex items-center gap-2 text-tide-teal">
              <ShieldCheck className="size-5" />
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase">Tide account</p>
            </div>
            <p className="mt-4 text-lg font-semibold">{firstOrganisation?.name ?? "Your organisation"}</p>
            <p className="mt-1 text-sm capitalize text-white/55">{firstOrganisation?.relationship_status?.replaceAll("_", " ") ?? "Active relationship"}</p>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs text-white/45">Signed in as</p>
              <p className="mt-1 truncate text-sm font-semibold text-white/85">{user?.email ?? profile?.full_name}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Account summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardMetric icon={CalendarDays} label="Active events" value={activeEvents} detail={`${events?.length ?? 0} event${events?.length === 1 ? "" : "s"} on your account`} />
        <DashboardMetric icon={FileText} label="Shared files" value={documents?.length ?? 0} detail="Latest client documents" />
        <DashboardMetric icon={Inbox} label="Open requests" value={openRequests} detail={openRequests ? "Awaiting a response" : "Nothing outstanding"} />
        <DashboardMetric icon={CirclePoundSterling} label="Balance due" value={formatMoney(outstandingBalance)} detail={outstandingBalance ? "Across visible invoices" : "Account up to date"} />
      </section>

      {closestEvent ? (
        <section className="relative overflow-hidden rounded-2xl bg-tide-charcoal text-white shadow-[0_18px_45px_rgba(55,53,54,0.11)]">
          <div className="pointer-events-none absolute -top-36 -right-20 size-96 rounded-full border border-tide-teal/15" />
          <div className="relative grid lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="p-5 sm:p-7 lg:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-bold tracking-[0.13em] text-tide-teal uppercase">Your next event</p>
                <StageBadge stage={closestEvent.stage} />
              </div>
              <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{closestEvent.name}</h2>
              <div className="mt-3"><EntityReference label="Event ID" value={closestEvent.event_reference} inverse /></div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
                <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-tide-teal" />{portalDate(closestEvent.start_date)}</span>
                <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-tide-teal" />{closestEvent.venue ?? "Venue to be confirmed"}</span>
              </div>
            </div>
            <div className="flex flex-col justify-between border-t border-white/10 bg-white/[0.035] p-5 sm:p-7 lg:border-t-0 lg:border-l lg:p-8">
              <div>
                <p className="text-[11px] font-bold tracking-[0.12em] text-white/45 uppercase">Event timing</p>
                <p className="mt-3 text-xl font-semibold">{formatEventCountdown(closestEvent.start_date, closestEvent.end_date)}</p>
                <p className="mt-1 text-sm text-white/50">Everything Tide has shared is inside your event workspace.</p>
              </div>
              <Button render={<Link href={`/portal/${closestEvent.id}`} />} nativeButton={false} className="mt-6 w-full justify-between bg-tide-teal text-tide-charcoal hover:bg-[#77c7d1]">
                Open event workspace <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-6">
          <Card className="gap-0 py-0">
            <CardHeader className="flex-row items-center justify-between border-b py-4">
              <div><CardTitle>Your events</CardTitle><p className="mt-1 text-sm text-muted-foreground">The nearest event always appears first.</p></div>
              <CalendarDays className="size-5 text-tide-teal" />
            </CardHeader>
            <CardContent className="p-0">
              {events?.length ? events.map((event) => (
                <Link key={event.id} href={`/portal/${event.id}`} className="grid min-h-24 gap-3 border-b px-5 py-4 transition-colors last:border-0 hover:bg-[#f8f9f9] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-tide-charcoal">{event.name}</p><StageBadge stage={event.stage} /></div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <EntityReference label="Event ID" value={event.event_reference} />
                      <span>{portalDate(event.start_date)}</span><span>{event.venue ?? "Venue TBC"}</span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              )) : <EmptyState icon={CalendarDays} title="No events yet" description="Events Tide is running for your organisation will appear here." className="border-none py-12" />}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="flex-row items-center justify-between border-b py-4">
              <div><CardTitle>Commercial account</CardTitle><p className="mt-1 text-sm text-muted-foreground">Quotes, invoices and payment position across your events.</p></div>
              <CirclePoundSterling className="size-5 text-tide-teal" />
            </CardHeader>
            <CardContent className="p-0">
              {(quotes?.length ?? 0) + (invoices?.length ?? 0) > 0 ? (
                <div className="divide-y">
                  {quotes?.map((quote) => <div key={quote.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                    <div><p className="font-semibold text-tide-charcoal">{quote.title}</p><p className="mt-1 text-xs text-muted-foreground">Quote {quote.quote_reference} · Valid until {formatBusinessDate(quote.valid_until)}</p></div>
                    <div className="flex items-center gap-3 sm:justify-end"><strong>{formatMoney(quote.total)}</strong><CommercialStatusBadge status={quote.status} /></div>
                    <Button render={<a href={`/api/business/quote/${quote.id}/pdf`} />} nativeButton={false} size="icon-sm" variant="outline" aria-label={`Download ${quote.quote_reference}`}><Download className="size-4" /></Button>
                  </div>)}
                  {invoices?.map((invoice) => <div key={invoice.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                    <div><p className="font-semibold text-tide-charcoal">{invoice.title}</p><p className="mt-1 text-xs text-muted-foreground">Invoice {invoice.invoice_reference} · Due {formatBusinessDate(invoice.due_date)}</p></div>
                    <div className="flex items-center gap-3 sm:justify-end"><strong>{formatMoney(invoice.balance_due)} due</strong><CommercialStatusBadge status={invoice.status} /></div>
                    <Button render={<a href={`/api/business/invoice/${invoice.id}/pdf`} />} nativeButton={false} size="icon-sm" variant="outline" aria-label={`Download ${invoice.invoice_reference}`}><Download className="size-4" /></Button>
                  </div>)}
                </div>
              ) : <EmptyState icon={ReceiptText} title="No commercial documents yet" description="Published quotes and invoices will appear here." className="border-none py-12" />}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="flex-row items-center justify-between border-b py-4">
              <div><CardTitle>Recent account activity</CardTitle><p className="mt-1 text-sm text-muted-foreground">The latest shared files, requests and messages.</p></div>
              <Clock3 className="size-5 text-tide-teal" />
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity.length ? recentActivity.map((item) => {
                const Icon = item.icon;
                return <Link key={item.id} href={`/portal/${item.eventId}`} className="flex min-h-16 items-center gap-3 border-b px-5 py-3.5 transition-colors last:border-0 hover:bg-[#f8f9f9]">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tide-teal/10 text-tide-teal"><Icon className="size-4" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-tide-charcoal">{item.title}</p><p className="mt-0.5 text-xs capitalize text-muted-foreground">{item.detail}</p></div>
                  <p className="hidden text-xs text-muted-foreground sm:block">{activityDate(item.date)}</p>
                </Link>;
              }) : <EmptyState icon={MessageSquare} title="No account activity yet" description="New files, messages and request updates will appear here." className="border-none py-12" />}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="size-4 text-tide-teal" />Account details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-xs font-semibold text-muted-foreground">Organisation</p><p className="mt-1 text-sm font-semibold text-tide-charcoal">{firstOrganisation?.name ?? "Not assigned"}</p></div>
              <div><p className="text-xs font-semibold text-muted-foreground">Client ID</p><p className="mt-1 font-mono text-sm font-semibold text-tide-charcoal">{firstOrganisation?.client_reference ?? "Pending"}</p></div>
              <div><p className="text-xs font-semibold text-muted-foreground">Portal access</p><p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-success"><ShieldCheck className="size-4" />Active and secure</p></div>
              <div><p className="text-xs font-semibold text-muted-foreground">Login email</p><p className="mt-1 break-all text-sm text-tide-charcoal">{user?.email ?? "Not available"}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Organisation contacts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {contacts?.length ? contacts.slice(0, 4).map((contact) => <div key={contact.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold text-tide-charcoal">{contact.name}</p>{contact.is_primary && <span className="rounded bg-tide-teal/10 px-1.5 py-0.5 text-[10px] font-bold text-tide-teal uppercase">Primary</span>}</div>
                {contact.role && <p className="mt-1 text-xs text-muted-foreground">{contact.role}</p>}
                {contact.email && <a href={`mailto:${contact.email}`} className="mt-2 flex items-center gap-2 text-xs text-muted-foreground hover:text-tide-teal"><Mail className="size-3.5" />{contact.email}</a>}
              </div>) : <p className="text-sm leading-6 text-muted-foreground">Your organisation contacts will appear here once added to the account.</p>}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-tide-teal/25 bg-tide-teal/[0.07] p-5">
            <p className="text-[11px] font-bold tracking-[0.1em] text-tide-teal uppercase">Your Tide team</p>
            <p className="mt-3 font-semibold text-tide-charcoal">Need help with your account?</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Open your event workspace to send Tide a message or raise a request against the correct Event ID.</p>
            {closestEvent && <Button render={<Link href={`/portal/${closestEvent.id}`} />} nativeButton={false} size="sm" variant="outline" className="mt-4 w-full justify-between bg-white">Contact event team <ArrowRight className="size-4" /></Button>}
          </div>
        </aside>
      </div>
    </div>
  );
}

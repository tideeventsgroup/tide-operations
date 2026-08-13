import Link from "next/link";
import { Activity, ArrowRight, CalendarDays, MapPin, Radio, Siren } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ControlSessionBadge, IncidentSeverityBadge, IncidentStatusBadge } from "@/components/status-badges";
import { EmptyState } from "@/components/empty-state";
import { EntityReference } from "@/components/entity-reference";

const STATUS_PRIORITY: Record<string, number> = { open: 0, monitoring: 1, resolved: 2, closed: 3 };
const SEVERITY_PRIORITY: Record<string, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 };

function eventDistance(startDate: string | null) {
  return startDate ? Math.abs(new Date(startDate).getTime() - Date.now()) : Number.MAX_SAFE_INTEGER;
}

export default async function IncidentsPage() {
  const supabase = await createClient();
  const [{ data: incidentData }, { data: eventData }, { data: sessions }, { data: actions }] = await Promise.all([
    supabase
      .from("incidents")
      .select("id, event_id, incident_number, summary, severity, status, time_reported, events(name, event_reference)")
      .order("time_reported", { ascending: false }),
    supabase
      .from("events")
      .select("id, event_reference, name, venue, start_date, end_date, stage, organisations(name, client_reference)")
      .neq("stage", "complete"),
    supabase.from("event_control_sessions").select("event_id, status, opened_at"),
    supabase.from("incident_actions").select("event_id, status"),
  ]);

  // Open/monitoring incidents surface first, and within each status the most
  // severe incidents lead — a controller scanning this register should see
  // the critical incident before the routine ones, not read every row.
  const incidents = [...(incidentData ?? [])].sort((a, b) => {
    const statusDiff = (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    return (SEVERITY_PRIORITY[a.severity] ?? 9) - (SEVERITY_PRIORITY[b.severity] ?? 9);
  });
  const events = [...(eventData ?? [])].sort((a, b) => eventDistance(a.start_date) - eventDistance(b.start_date));
  const closestEvent = events[0];
  const sessionMap = new Map((sessions ?? []).map((session) => [session.event_id, session]));
  const eventMetrics = new Map(
    events.map((event) => [
      event.id,
      {
        openIncidents: incidents.filter((incident) => incident.event_id === event.id && !["resolved", "closed"].includes(incident.status)).length,
        openActions: (actions ?? []).filter((action) => action.event_id === event.id && action.status !== "complete").length,
      },
    ]),
  );

  const closestMetrics = closestEvent ? eventMetrics.get(closestEvent.id) : null;
  const closestSession = closestEvent ? sessionMap.get(closestEvent.id) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title="Event Control"
        description="Live command, incident response and audit records for every event."
        actions={
          <Button render={<Link href="/incidents/new" />} nativeButton={false} size="sm">
            <Siren className="size-4" /> Report incident
          </Button>
        }
      />

      {closestEvent && (
        <Card className="overflow-hidden border-tide-teal/40 bg-tide-charcoal py-0 text-white shadow-lg shadow-tide-charcoal/10">
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-tide-teal px-2 py-1 text-[11px] font-bold tracking-wider text-tide-charcoal uppercase">
                  Closest event
                </span>
                <ControlSessionBadge status={closestSession?.status ?? "planned"} />
              </div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                <EntityReference label="Event ID" value={closestEvent.event_reference} inverse />
                <EntityReference label="Client ID" value={(closestEvent.organisations as { client_reference: string } | null)?.client_reference} inverse />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">{closestEvent.name}</h2>
              <p className="mt-1 text-sm text-white/60">
                {(closestEvent.organisations as { name: string } | null)?.name ?? "Tide Events Group"}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-tide-teal" />{closestEvent.start_date ? new Date(closestEvent.start_date).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Date to be confirmed"}</span>
                {closestEvent.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-tide-teal" />{closestEvent.venue}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/15">
                <div className="min-w-28 bg-white/[0.07] px-4 py-3"><p className="text-2xl font-semibold tabular-nums">{closestMetrics?.openIncidents ?? 0}</p><p className="text-xs text-white/55">Active incidents</p></div>
                <div className="min-w-28 bg-white/[0.07] px-4 py-3"><p className="text-2xl font-semibold tabular-nums">{closestMetrics?.openActions ?? 0}</p><p className="text-xs text-white/55">Open actions</p></div>
              </div>
              <Button render={<Link href={`/incidents/control/${closestEvent.id}`} />} nativeButton={false} className="h-12 bg-tide-teal px-5 text-tide-charcoal hover:bg-tide-teal/90">
                <Radio className="size-4" /> Open Event Control <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {events.length > 1 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.slice(1, 4).map((event) => {
            const metrics = eventMetrics.get(event.id);
            return (
              <Link key={event.id} href={`/incidents/control/${event.id}`} className="group rounded-lg border bg-card p-4 transition-colors hover:border-tide-teal/60 hover:bg-tide-teal/[0.03]">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-tide-charcoal">{event.name}</p><EntityReference label="Event ID" value={event.event_reference} className="mt-1" /><p className="mt-1 text-xs text-muted-foreground">{event.start_date ? new Date(event.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Date TBC"}{event.venue ? ` · ${event.venue}` : ""}</p></div><ControlSessionBadge status={sessionMap.get(event.id)?.status ?? "planned"} /></div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground"><span><strong className="text-foreground">{metrics?.openIncidents ?? 0}</strong> active incidents</span><span><strong className="text-foreground">{metrics?.openActions ?? 0}</strong> actions</span><ArrowRight className="ml-auto size-4 transition-transform group-hover:translate-x-0.5" /></div>
              </Link>
            );
          })}
        </div>
      )}

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-3"><CardTitle className="flex items-center gap-2 text-sm"><Activity className="size-4 text-tide-teal" />Cross-event incident register</CardTitle></CardHeader>
        <CardContent className="p-0">
          {incidents.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Incident</TableHead><TableHead>Event</TableHead><TableHead>Reported</TableHead><TableHead className="text-right">Severity</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
              <TableBody>{incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium text-tide-charcoal"><Link href={`/incidents/${incident.id}`} className="block">{incident.incident_number}<span className="block text-xs font-normal text-muted-foreground">{incident.summary}</span></Link></TableCell>
                  <TableCell className="text-muted-foreground"><Link href={`/incidents/control/${incident.event_id}`} className="hover:text-tide-teal">{(incident.events as { name: string } | null)?.name}</Link><EntityReference label="Event ID" value={(incident.events as { event_reference: string } | null)?.event_reference} className="mt-1" /></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(incident.time_reported).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell className="text-right"><IncidentSeverityBadge severity={incident.severity} /></TableCell>
                  <TableCell className="text-right"><IncidentStatusBadge status={incident.status} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : <EmptyState icon={Siren} title="No incidents logged" description="Reported incidents across all events will appear here." className="border-none py-10" />}
        </CardContent>
      </Card>
    </div>
  );
}

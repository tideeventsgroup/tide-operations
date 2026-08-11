import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ClipboardCheck,
  Clock3,
  MapPinned,
  Plus,
  Radio,
  Shield,
  Siren,
  Truck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  addEventControlLogEntry,
  createIncidentAction,
  createOperationalLocation,
  createRadioChannel,
  createResource,
  logRadioMessage,
  setControlSession,
  updateIncidentAction,
  updateResourceStatus,
  upsertControlRole,
} from "@/lib/actions/incidents";
import { EventControlLiveStatus } from "@/components/incidents/event-control-live-status";
import {
  ControlSessionBadge,
  IncidentActionStatusBadge,
  IncidentSeverityBadge,
  IncidentStatusBadge,
} from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EntityReference } from "@/components/entity-reference";

const CONTROL_ROLES = [
  "Event Controller",
  "Safety Commander",
  "Incident Commander",
  "Loggist",
  "Radio Controller",
  "Welfare Lead",
  "Liaison Officer",
];

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventControlRoomPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: event }] = await Promise.all([
    supabase.from("user_profiles").select("staff_role").eq("id", user.id).maybeSingle(),
    supabase
      .from("events")
      .select("id, event_reference, name, venue, start_date, end_date, stage, organisations(name, client_reference)")
      .eq("id", eventId)
      .maybeSingle(),
  ]);
  if (!event) notFound();
  const canManage = profile?.staff_role != null && ["admin", "manager", "control_room"].includes(profile.staff_role);

  const [
    { data: session },
    { data: incidents },
    { data: actions },
    { data: controlLog },
    { data: roles },
    { data: locations },
    { data: resources },
    { data: channels },
    { data: radioMessages },
    { data: staffProfiles },
  ] = await Promise.all([
    supabase.from("event_control_sessions").select("*").eq("event_id", eventId).maybeSingle(),
    supabase.from("incidents").select("*").eq("event_id", eventId).order("last_activity_at", { ascending: false }),
    supabase
      .from("incident_actions")
      .select("*, incidents(incident_number), user_profiles!incident_actions_assigned_to_fkey(full_name)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase
      .from("event_control_log_entries")
      .select("*, incidents(incident_number), user_profiles!event_control_log_entries_author_id_fkey(full_name)")
      .eq("event_id", eventId)
      .order("time", { ascending: false })
      .limit(100),
    supabase
      .from("event_control_roles")
      .select("*, user_profiles!event_control_roles_user_id_fkey(full_name, email)")
      .eq("event_id", eventId)
      .eq("active", true)
      .order("role_name"),
    supabase.from("operational_locations").select("*").eq("event_id", eventId).eq("active", true).order("name"),
    supabase.from("resources").select("*, incidents(incident_number)").eq("event_id", eventId).order("call_sign"),
    supabase.from("radio_channels").select("*").eq("event_id", eventId).eq("active", true).order("channel_name"),
    supabase
      .from("radio_messages")
      .select("*, incidents(incident_number), radio_channels(channel_name)")
      .eq("event_id", eventId)
      .order("time", { ascending: false })
      .limit(100),
    supabase.from("user_profiles").select("id, full_name, email").eq("account_type", "staff").order("full_name"),
  ]);

  const openIncidents = (incidents ?? []).filter((item) => item.status === "open" || item.status === "monitoring");
  const openActions = (actions ?? []).filter((item) => item.status === "open" || item.status === "in_progress" || item.status === "blocked");
  const criticalIncidents = openIncidents.filter((item) => item.severity === "critical" || item.severity === "serious");
  const activeResources = (resources ?? []).filter((item) => item.status !== "released" && item.status !== "unavailable");
  const sessionStatus = session?.status ?? "standby";
  const staff = (staffProfiles ?? []).map((item) => ({ id: item.id, name: item.full_name || item.email }));

  return (
    <div className="mx-auto max-w-[1480px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <Link href="/incidents" className="mb-2 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-tide-charcoal">
            <ArrowLeft className="size-4" /> Incident events
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-tide-charcoal">{event.name} — Event Control</h1>
            <ControlSessionBadge status={sessionStatus} />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <EntityReference label="Event ID" value={event.event_reference} />
            <EntityReference label="Client ID" value={(event.organisations as { client_reference: string } | null)?.client_reference} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.venue ?? "Venue TBC"} · {event.start_date ?? "Dates TBC"}
            {event.end_date ? ` – ${event.end_date}` : ""} · {(event.organisations as { name: string } | null)?.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EventControlLiveStatus eventId={eventId} />
          <Button render={<Link href={`/incidents/new?event_id=${eventId}`} />} nativeButton={false} size="sm">
            <Siren className="size-4" /> Report incident
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open incidents", value: openIncidents.length, icon: Siren, tone: criticalIncidents.length ? "text-destructive" : "text-tide-teal" },
          { label: "Serious / critical", value: criticalIncidents.length, icon: Activity, tone: criticalIncidents.length ? "text-destructive" : "text-muted-foreground" },
          { label: "Open actions", value: openActions.length, icon: ClipboardCheck, tone: openActions.some((a) => a.priority === "critical") ? "text-destructive" : "text-tide-teal" },
          { label: "Active resources", value: activeResources.length, icon: Truck, tone: "text-tide-teal" },
        ].map((metric) => (
          <Card key={metric.label} className="py-0">
            <CardContent className="flex items-center gap-3 p-3.5">
              <div className="flex size-9 items-center justify-center rounded-md bg-muted"><metric.icon className={`size-4 ${metric.tone}`} /></div>
              <div><div className="text-xl font-semibold tabular-nums text-tide-charcoal">{metric.value}</div><div className="text-xs text-muted-foreground">{metric.label}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="gap-3">
        <TabsList variant="line" className="h-11 max-w-full justify-start overflow-x-auto border-b">
          <TabsTrigger value="overview" className="min-h-10 px-3">Overview</TabsTrigger>
          <TabsTrigger value="log" className="min-h-10 px-3">Event log</TabsTrigger>
          <TabsTrigger value="actions" className="min-h-10 px-3">Actions</TabsTrigger>
          <TabsTrigger value="command" className="min-h-10 px-3">Command</TabsTrigger>
          <TabsTrigger value="resources" className="min-h-10 px-3">Resources</TabsTrigger>
          <TabsTrigger value="radio" className="min-h-10 px-3">Radio</TabsTrigger>
          <TabsTrigger value="locations" className="min-h-10 px-3">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3"><CardTitle className="text-sm">Live incident register</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Incident</TableHead><TableHead>Location</TableHead><TableHead>Last activity</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(incidents ?? []).map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell><Link href={`/incidents/${incident.id}`} className="font-semibold text-tide-charcoal hover:text-tide-teal">{incident.incident_number}<span className="block max-w-md text-xs font-normal text-muted-foreground">{incident.summary}</span></Link></TableCell>
                      <TableCell>{incident.location ?? "—"}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{formatDateTime(incident.last_activity_at)}</TableCell>
                      <TableCell><IncidentSeverityBadge severity={incident.severity} /></TableCell>
                      <TableCell><IncidentStatusBadge status={incident.status} /></TableCell>
                    </TableRow>
                  ))}
                  {!incidents?.length && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No incidents reported for this event.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Shield className="size-4 text-tide-teal" /> Control session</CardTitle></CardHeader>
              <CardContent>
                {canManage ? (
                  <form action={setControlSession} className="space-y-3">
                    <input type="hidden" name="event_id" value={eventId} />
                    <div className="grid grid-cols-3 gap-2">
                      {(["standby", "active", "closed"] as const).map((status) => <Button key={status} type="submit" name="status" value={status} variant={sessionStatus === status ? "default" : "outline"} size="sm" className="capitalize">{status}</Button>)}
                    </div>
                    <div className="space-y-1.5"><Label htmlFor="handover_notes">Handover notes</Label><Textarea id="handover_notes" name="handover_notes" defaultValue={session?.handover_notes ?? ""} rows={3} /></div>
                  </form>
                ) : <p className="text-sm text-muted-foreground">Control status is managed by Event Control.</p>}
              </CardContent>
            </Card>
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-3"><CardTitle className="text-sm">Priority actions</CardTitle></CardHeader>
              <CardContent className="space-y-0 p-0">
                {openActions.slice(0, 6).map((action) => (
                  <Link key={action.id} href="#actions" className="flex min-h-12 items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0 hover:bg-muted/40">
                    <span className="min-w-0"><span className="block truncate font-medium text-tide-charcoal">{action.title}</span><span className="text-xs text-muted-foreground">{(action.incidents as { incident_number: string } | null)?.incident_number ?? "Event level"}</span></span>
                    <IncidentActionStatusBadge status={action.status} />
                  </Link>
                ))}
                {!openActions.length && <p className="p-4 text-sm text-muted-foreground">No open actions.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="log" className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3"><CardTitle className="flex items-center gap-2 text-sm"><Clock3 className="size-4 text-tide-teal" /> Contemporaneous event log</CardTitle></CardHeader>
            <CardContent className="max-h-[660px] overflow-y-auto p-0">
              {(controlLog ?? []).map((entry) => (
                <div key={entry.id} className="grid grid-cols-[64px_1fr] gap-3 border-b px-4 py-3 last:border-0">
                  <time className="text-xs tabular-nums text-muted-foreground">{new Date(entry.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</time>
                  <div><div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-semibold uppercase tracking-wide text-tide-teal">{entry.entry_type}</span>{entry.incidents && <span>{(entry.incidents as { incident_number: string }).incident_number}</span>}<span className="text-muted-foreground">{(entry.user_profiles as { full_name: string } | null)?.full_name ?? "Control"}</span></div><p className="mt-1 text-sm text-tide-charcoal">{entry.body}</p></div>
                </div>
              ))}
              {!controlLog?.length && <p className="p-8 text-center text-sm text-muted-foreground">No event-control entries yet.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Add log entry</CardTitle></CardHeader>
            <CardContent>
              <form action={addEventControlLogEntry} className="space-y-3">
                <input type="hidden" name="event_id" value={eventId} />
                <div className="space-y-1.5"><Label htmlFor="log_entry_type">Entry type</Label><select id="log_entry_type" name="entry_type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="update">Update</option><option value="action">Action</option><option value="decision">Decision</option><option value="correction">Correction</option></select></div>
                <div className="space-y-1.5"><Label htmlFor="log_incident_id">Related incident</Label><select id="log_incident_id" name="incident_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Event level</option>{incidents?.map((item) => <option key={item.id} value={item.id}>{item.incident_number} — {item.summary}</option>)}</select></div>
                <div className="space-y-1.5"><Label htmlFor="log_body">Log entry</Label><Textarea id="log_body" name="body" required rows={5} /></div>
                <Button type="submit" className="w-full">Add to event log</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card className="gap-0 py-0"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Owner</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead>Update</TableHead></TableRow></TableHeader><TableBody>
            {(actions ?? []).map((action) => (
              <TableRow key={action.id}><TableCell className="font-medium text-tide-charcoal">{action.title}<span className="block text-xs font-normal text-muted-foreground">{(action.incidents as { incident_number: string } | null)?.incident_number ?? "Event level"} · {action.priority}</span></TableCell><TableCell>{(action.user_profiles as { full_name: string } | null)?.full_name ?? "Unassigned"}</TableCell><TableCell>{formatDateTime(action.due_at)}</TableCell><TableCell><IncidentActionStatusBadge status={action.status} /></TableCell><TableCell>{canManage && <form action={updateIncidentAction} className="flex items-center gap-2"><input type="hidden" name="action_id" value={action.id} /><input type="hidden" name="event_id" value={eventId} /><input type="hidden" name="incident_id" value={action.incident_id ?? ""} /><select name="status" defaultValue={action.status} className="h-9 rounded-md border border-input bg-background px-2 text-xs"><option value="open">Open</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="complete">Complete</option><option value="cancelled">Cancelled</option></select><Button type="submit" size="sm" variant="outline">Save</Button></form>}</TableCell></TableRow>
            ))}
            {!actions?.length && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No actions logged.</TableCell></TableRow>}
          </TableBody></Table></CardContent></Card>
          {canManage && <Card><CardHeader><CardTitle className="text-sm">Create action</CardTitle></CardHeader><CardContent><form action={createIncidentAction} className="space-y-3"><input type="hidden" name="event_id" value={eventId} /><div className="space-y-1.5"><Label htmlFor="action_title">Action</Label><Input id="action_title" name="title" required /></div><div className="space-y-1.5"><Label htmlFor="action_incident">Incident</Label><select id="action_incident" name="incident_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Event level</option>{incidents?.map((item) => <option key={item.id} value={item.id}>{item.incident_number}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="action_priority">Priority</Label><select id="action_priority" name="priority" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option><option value="low">Low</option></select></div><div className="space-y-1.5"><Label htmlFor="action_due">Due</Label><Input id="action_due" name="due_at" type="datetime-local" /></div></div><div className="space-y-1.5"><Label htmlFor="action_owner">Assign to</Label><select id="action_owner" name="assigned_to" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Unassigned</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="space-y-1.5"><Label htmlFor="action_description">Instructions</Label><Textarea id="action_description" name="description" rows={3} /></div><Button type="submit" className="w-full"><Plus className="size-4" /> Create action</Button></form></CardContent></Card>}
        </TabsContent>

        <TabsContent value="command" className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card className="gap-0 py-0"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Control role</TableHead><TableHead>Assigned person</TableHead><TableHead>Call sign</TableHead><TableHead>Contact</TableHead></TableRow></TableHeader><TableBody>{CONTROL_ROLES.map((roleName) => { const assignment = roles?.find((item) => item.role_name === roleName); const person = assignment?.user_profiles as { full_name: string; email: string } | null; return <TableRow key={roleName}><TableCell className="font-medium text-tide-charcoal">{roleName}</TableCell><TableCell>{person?.full_name || person?.email || "Unassigned"}</TableCell><TableCell>{assignment?.call_sign ?? "—"}</TableCell><TableCell>{assignment?.contact_details ?? "—"}</TableCell></TableRow>; })}</TableBody></Table></CardContent></Card>
          {canManage && <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="size-4 text-tide-teal" /> Assign control role</CardTitle></CardHeader><CardContent><form action={upsertControlRole} className="space-y-3"><input type="hidden" name="event_id" value={eventId} /><div className="space-y-1.5"><Label htmlFor="role_name">Role</Label><select id="role_name" name="role_name" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{CONTROL_ROLES.map((role) => <option key={role}>{role}</option>)}</select></div><div className="space-y-1.5"><Label htmlFor="role_user">Person</Label><select id="role_user" name="user_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Unassigned</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="space-y-1.5"><Label htmlFor="role_call_sign">Call sign</Label><Input id="role_call_sign" name="call_sign" /></div><div className="space-y-1.5"><Label htmlFor="role_contact">Contact details</Label><Input id="role_contact" name="contact_details" /></div><Button type="submit" className="w-full">Save assignment</Button></form></CardContent></Card>}
        </TabsContent>

        <TabsContent value="resources" className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Card className="gap-0 py-0"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Resource</TableHead><TableHead>Incident</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Assignment</TableHead></TableRow></TableHeader><TableBody>{(resources ?? []).map((resource) => <TableRow key={resource.id}><TableCell className="font-medium text-tide-charcoal">{resource.call_sign ?? resource.type}<span className="block text-xs font-normal text-muted-foreground">{resource.quantity} × {resource.type}</span></TableCell><TableCell>{(resource.incidents as { incident_number: string } | null)?.incident_number ?? "Event pool"}</TableCell><TableCell>{resource.location ?? "—"}</TableCell><TableCell>{resource.status ?? "available"}</TableCell><TableCell>{canManage ? <form action={updateResourceStatus} className="flex gap-2"><input type="hidden" name="resource_id" value={resource.id} /><input type="hidden" name="event_id" value={eventId} /><input type="hidden" name="incident_id" value={resource.incident_id ?? ""} /><Input name="assigned_to" defaultValue={resource.assigned_to ?? ""} className="h-9 w-28" aria-label="Assigned to" /><select name="status" defaultValue={resource.status ?? "available"} className="h-9 rounded-md border border-input bg-background px-2 text-xs"><option value="available">Available</option><option value="deployed">Deployed</option><option value="released">Released</option><option value="unavailable">Unavailable</option></select><Button type="submit" size="sm" variant="outline">Save</Button></form> : resource.assigned_to ?? "—"}</TableCell></TableRow>)}{!resources?.length && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No resources configured.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
          {canManage && <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Truck className="size-4 text-tide-teal" /> Add resource</CardTitle></CardHeader><CardContent><form action={createResource} className="space-y-3"><input type="hidden" name="event_id" value={eventId} /><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="resource_type">Type</Label><Input id="resource_type" name="type" required /></div><div className="space-y-1.5"><Label htmlFor="resource_quantity">Quantity</Label><Input id="resource_quantity" name="quantity" type="number" min={1} defaultValue={1} /></div></div><div className="space-y-1.5"><Label htmlFor="resource_call_sign">Call sign</Label><Input id="resource_call_sign" name="call_sign" /></div><div className="space-y-1.5"><Label htmlFor="resource_incident">Incident</Label><select id="resource_incident" name="incident_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Event pool</option>{incidents?.map((item) => <option key={item.id} value={item.id}>{item.incident_number}</option>)}</select></div><div className="space-y-1.5"><Label htmlFor="resource_location">Location</Label><Input id="resource_location" name="location" /></div><div className="space-y-1.5"><Label htmlFor="resource_contact">Contact</Label><Input id="resource_contact" name="contact_details" /></div><Button type="submit" className="w-full">Add resource</Button></form></CardContent></Card>}
        </TabsContent>

        <TabsContent value="radio" className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="space-y-4"><Card className="gap-0 py-0"><CardHeader className="border-b py-3"><CardTitle className="text-sm">Radio message log</CardTitle></CardHeader><CardContent className="max-h-[520px] overflow-y-auto p-0">{(radioMessages ?? []).map((message) => <div key={message.id} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b px-4 py-3 last:border-0"><time className="text-xs tabular-nums text-muted-foreground">{new Date(message.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</time><div><div className="text-xs font-semibold uppercase tracking-wide text-tide-teal">{message.from_call_sign ?? "Control"} → {message.to_call_sign ?? "All"}</div><p className="mt-1 text-sm text-tide-charcoal">{message.body}</p></div><div className="text-right text-xs text-muted-foreground">{(message.radio_channels as { channel_name: string } | null)?.channel_name ?? "Unspecified"}<span className="block capitalize">{message.direction}</span></div></div>)}{!radioMessages?.length && <p className="p-8 text-center text-sm text-muted-foreground">No radio traffic logged.</p>}</CardContent></Card><Card className="gap-0 py-0"><CardHeader className="border-b py-3"><CardTitle className="text-sm">Channels</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Channel</TableHead><TableHead>Purpose</TableHead><TableHead>Frequency / talkgroup</TableHead></TableRow></TableHeader><TableBody>{channels?.map((channel) => <TableRow key={channel.id}><TableCell className="font-medium">{channel.channel_name}</TableCell><TableCell>{channel.purpose ?? "—"}</TableCell><TableCell>{channel.frequency_or_talkgroup ?? "—"}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>
          <div className="space-y-4"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Radio className="size-4 text-tide-teal" /> Log radio traffic</CardTitle></CardHeader><CardContent><form action={logRadioMessage} className="space-y-3"><input type="hidden" name="event_id" value={eventId} /><div className="space-y-1.5"><Label htmlFor="radio_channel">Channel</Label><select id="radio_channel" name="radio_channel_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Unspecified</option>{channels?.map((channel) => <option key={channel.id} value={channel.id}>{channel.channel_name}</option>)}</select></div><div className="space-y-1.5"><Label htmlFor="radio_incident">Incident</Label><select id="radio_incident" name="incident_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Event level</option>{incidents?.map((item) => <option key={item.id} value={item.id}>{item.incident_number}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="radio_from">From</Label><Input id="radio_from" name="from_call_sign" /></div><div className="space-y-1.5"><Label htmlFor="radio_to">To</Label><Input id="radio_to" name="to_call_sign" /></div></div><div className="space-y-1.5"><Label htmlFor="radio_direction">Direction</Label><select id="radio_direction" name="direction" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="inbound">Inbound</option><option value="outbound">Outbound</option><option value="internal">Internal</option></select></div><div className="space-y-1.5"><Label htmlFor="radio_body">Message</Label><Textarea id="radio_body" name="body" required rows={4} /></div><Button type="submit" className="w-full">Log message</Button></form></CardContent></Card>{canManage && <Card><CardHeader><CardTitle className="text-sm">Add channel</CardTitle></CardHeader><CardContent><form action={createRadioChannel} className="space-y-3"><input type="hidden" name="event_id" value={eventId} /><div className="space-y-1.5"><Label htmlFor="channel_name">Channel name</Label><Input id="channel_name" name="channel_name" required /></div><div className="space-y-1.5"><Label htmlFor="channel_purpose">Purpose</Label><Input id="channel_purpose" name="purpose" /></div><div className="space-y-1.5"><Label htmlFor="channel_frequency">Frequency / talkgroup</Label><Input id="channel_frequency" name="frequency_or_talkgroup" /></div><Button type="submit" variant="outline" className="w-full">Add channel</Button></form></CardContent></Card>}</div>
        </TabsContent>

        <TabsContent value="locations" className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{locations?.map((location) => <Card key={location.id}><CardHeader><CardTitle className="flex items-start gap-2 text-sm"><MapPinned className="mt-0.5 size-4 text-tide-teal" /><span>{location.name}<span className="mt-0.5 block text-xs font-normal capitalize text-muted-foreground">{location.location_type.replaceAll("_", " ")}</span></span></CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>{location.description ?? "No description"}</p>{location.grid_reference && <p><span className="text-muted-foreground">Grid:</span> {location.grid_reference}</p>}{location.what3words && <p><span className="text-muted-foreground">what3words:</span> {location.what3words}</p>}{location.access_notes && <p className="rounded-md bg-warning-bg p-2 text-warning"><strong>Access:</strong> {location.access_notes}</p>}</CardContent></Card>)}{!locations?.length && <Card className="sm:col-span-2 xl:col-span-3"><CardContent className="p-8 text-center text-sm text-muted-foreground">No operational locations configured.</CardContent></Card>}</div>
          {canManage && <Card><CardHeader><CardTitle className="text-sm">Add operational location</CardTitle></CardHeader><CardContent><form action={createOperationalLocation} className="space-y-3"><input type="hidden" name="event_id" value={eventId} /><div className="space-y-1.5"><Label htmlFor="location_name">Name</Label><Input id="location_name" name="name" required /></div><div className="space-y-1.5"><Label htmlFor="location_type">Type</Label><select id="location_type" name="location_type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="control_room">Control room</option><option value="rendezvous_point">Rendezvous point</option><option value="access_gate">Access gate</option><option value="medical">Medical</option><option value="evacuation">Evacuation</option><option value="welfare">Welfare</option><option value="other">Other</option></select></div><div className="space-y-1.5"><Label htmlFor="location_description">Description</Label><Textarea id="location_description" name="description" rows={2} /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="grid_reference">Grid reference</Label><Input id="grid_reference" name="grid_reference" /></div><div className="space-y-1.5"><Label htmlFor="what3words">what3words</Label><Input id="what3words" name="what3words" /></div></div><div className="space-y-1.5"><Label htmlFor="access_notes">Access notes</Label><Textarea id="access_notes" name="access_notes" rows={3} /></div><Button type="submit" className="w-full">Add location</Button></form></CardContent></Card>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  FileText,
  Inbox,
  Mail,
  MapPin,
  Milestone as MilestoneIcon,
  Pencil,
  Radio,
  Siren,
  Trash2,
  UserPlus,
  Users,
  Users2,
  CirclePoundSterling,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  updateEventStage,
  addEventMember,
  removeEventMember,
  createMilestone,
  updateMilestoneStatus,
} from "@/lib/actions/events";
import { createDocument, toggleDocumentVisibility } from "@/lib/actions/documents";
import { fulfilClientRequest } from "@/lib/actions/client-requests";
import { sendEventMessage } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  StageBadge,
  DocumentStatusBadge,
  TaskStatusBadge,
  ClientRequestStatusBadge,
  IncidentSeverityBadge,
  IncidentStatusBadge,
  ControlSessionBadge,
} from "@/components/status-badges";
import { EmptyState } from "@/components/empty-state";
import { initials, cn } from "@/lib/utils";
import { EntityReference } from "@/components/entity-reference";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { formatMoney } from "@/lib/business";

const STAGES = ["enquiry", "proposal", "confirmed", "planning", "live", "complete"] as const;

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, organisations(id, name, client_reference)")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: members },
    { data: staffDirectory },
    { data: milestones },
    { data: tasks },
    { data: documents },
    { data: clientRequests },
    { data: messages },
    { data: incidents },
    { data: proposals },
    { data: quotes },
    { data: invoices },
  ] = await Promise.all([
    supabase
      .from("event_members")
      .select("id, role_on_event, user_profiles(id, full_name, email)")
      .eq("event_id", id),
    supabase.from("user_profiles").select("id, full_name, email").eq("account_type", "staff"),
    supabase.from("milestones").select("*").eq("event_id", id).order("due_date"),
    supabase.from("tasks").select("*").eq("event_id", id).order("due_date"),
    supabase
      .from("documents")
      .select("id, reference, title, status, client_visible, document_types(name)")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("client_requests").select("*").eq("event_id", id).order("created_at", { ascending: false }),
    supabase
      .from("event_messages")
      .select("id, body, sender_id, visible_to_client, created_at, user_profiles(full_name)")
      .eq("event_id", id)
      .order("created_at"),
    supabase
      .from("incidents")
      .select("id, incident_number, summary, severity, status, time_reported")
      .eq("event_id", id)
      .order("created_at"),
    supabase.from("proposals").select("id, proposal_reference, title, status, client_visible").eq("event_id", id).order("created_at", { ascending: false }),
    supabase.from("quotes").select("id, quote_reference, title, status, total, client_visible").eq("event_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, invoice_reference, title, status, total, balance_due, client_visible").eq("event_id", id).order("created_at", { ascending: false }),
  ]);

  // The event workspace previously gave no signal of whether Event Control
  // was even active for this event — a manager had to leave this page to
  // find out. One extra lightweight query surfaces that inline.
  const [{ data: controlSession }, { count: openActionCount }] = await Promise.all([
    supabase.from("event_control_sessions").select("status").eq("event_id", id).maybeSingle(),
    supabase
      .from("incident_actions")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id)
      .not("status", "in", "(complete,cancelled)"),
  ]);
  const openIncidentCount = (incidents ?? []).filter((i) => i.status === "open" || i.status === "monitoring").length;

  const { data: documentTypes } = await supabase
    .from("document_types")
    .select("id, name")
    .eq("status", "published");

  const organisation = event.organisations as { name: string; client_reference: string } | null;
  const orgName = organisation?.name;
  const currentStageIndex = STAGES.indexOf(event.stage);

  return (
    <div className="mx-auto max-w-[1480px]">
      <Link
        href="/events"
        className="mb-5 inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-4" />
        All events
      </Link>

      <section className="relative mb-6 overflow-hidden rounded-2xl bg-tide-charcoal text-white shadow-[0_18px_48px_rgba(55,53,54,0.12)]">
        <div className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full border border-tide-teal/15" />
        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold tracking-[0.12em] text-tide-teal uppercase">Event workspace</span>
                <StageBadge stage={event.stage} />
              </div>
              <h1 className="text-[1.85rem] leading-[1.1] font-semibold tracking-[-0.035em] text-white sm:text-[2.5rem]">{event.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <EntityReference label="Event ID" value={event.event_reference} inverse />
                <EntityReference label="Client ID" value={organisation?.client_reference} inverse />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65">
                <span className="inline-flex items-center gap-1.5"><Users2 className="size-4 text-tide-teal" />{orgName ?? "No client"}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-tide-teal" />{event.venue ?? "Venue TBC"}</span>
                {event.start_date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-tide-teal" />{event.start_date}{event.end_date ? ` – ${event.end_date}` : ""}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href={`/incidents/control/${id}`} />} nativeButton={false} className="bg-tide-teal text-tide-charcoal shadow-none hover:bg-[#77c5cf]">
                <Radio className="size-4" /> Event control
              </Button>
              <Button render={<Link href={`/events/${id}/edit`} />} nativeButton={false} variant="outline" className="border-white/20 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/10 hover:text-white">
                <Pencil className="size-4" /> Edit details
              </Button>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold tracking-[0.12em] text-white/45 uppercase">Event lifecycle</p>
              <p className="text-xs text-white/45">Select a stage to update</p>
            </div>
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-[520px] items-center">
                {STAGES.map((stage, i) => {
                  const done = i < currentStageIndex;
                  const current = i === currentStageIndex;
                  return (
                    <div key={stage} className="flex flex-1 items-center last:flex-initial">
                      <form action={updateEventStage} className="flex flex-col items-center gap-1">
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="stage" value={stage} />
                        <button
                          type="submit"
                          disabled={current}
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-150",
                            current
                              ? "bg-tide-teal text-tide-charcoal ring-4 ring-tide-teal/15"
                              : done
                                ? "bg-tide-teal/15 text-tide-teal hover:bg-tide-teal/25"
                                : "bg-white/[0.08] text-white/45 hover:bg-white/[0.14]",
                          )}
                          title={done ? `Revert to ${stage}` : `Advance to ${stage}`}
                        >
                          {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                        </button>
                        <span
                          className={cn(
                            "text-[11px] font-medium whitespace-nowrap",
                            current ? "text-white" : "text-white/45",
                          )}
                        >
                          {stage[0].toUpperCase() + stage.slice(1)}
                        </span>
                      </form>
                      {i < STAGES.length - 1 && (
                        <div className={cn("mx-2 h-px flex-1", done ? "bg-tide-teal/50" : "bg-white/12")} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview">
        <div className="mb-1 overflow-x-auto border-b border-border">
          <TabsList variant="line" className="min-w-max gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="milestones">Milestones &amp; Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Event details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3.5">
              <Field icon={CalendarDays} label="Event Name" value={event.name} />
              <Field icon={MapPin} label="Venue Name" value={event.venue} />
              <Field
                icon={CalendarDays}
                label="Event Dates"
                value={event.start_date ? `${event.start_date} – ${event.end_date ?? event.start_date}` : null}
              />
              <Field icon={Users2} label="Expected Attendance" value={event.expected_attendance?.toString() ?? null} />
              <Field icon={Radio} label="Event Control" value={event.control_location} />
              <Field icon={Banknote} label="Financial Value" value={event.financial_value ? `£${event.financial_value}` : null} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <UserPlus className="size-3.5 text-tide-teal" />
                Add member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addEventMember} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-muted-foreground">Staff member</label>
                  <select name="user_id" required className="h-8 rounded-md border border-input bg-background px-2.5 text-sm">
                    <option value="">Select…</option>
                    {staffDirectory?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-muted-foreground">Role on event</label>
                  <Input name="role_on_event" placeholder="e.g. Safety Commander" required className="h-8 text-sm" />
                </div>
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="p-0">
              {members?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role on event</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => {
                      const profile = m.user_profiles as { id: string; full_name: string; email: string } | null;
                      const name = profile?.full_name || profile?.email || "Unknown";
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium text-tide-charcoal">
                            <span className="flex items-center gap-2">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[10.5px] font-bold text-tide-teal">
                                {initials(name)}
                              </span>
                              {name}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{m.role_on_event}</TableCell>
                          <TableCell>
                            <form action={removeEventMember}>
                              <input type="hidden" name="event_id" value={id} />
                              <input type="hidden" name="member_id" value={m.id} />
                              <Button type="submit" size="icon-sm" variant="ghost" aria-label="Remove member">
                                <Trash2 className="size-3.5 text-muted-foreground" />
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={Users} title="No members assigned yet" className="border-none py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <MilestoneIcon className="size-3.5 text-tide-teal" />
                Add milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createMilestone} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-muted-foreground">Title</label>
                  <Input name="title" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-muted-foreground">Due date</label>
                  <Input name="due_date" type="date" className="h-8 text-sm" />
                </div>
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-2.5">
              <CardTitle className="text-sm">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {milestones?.length ? (
                <Table>
                  <TableBody>
                    {milestones.map((ms) => (
                      <TableRow key={ms.id}>
                        <TableCell>
                          <span className="flex items-center gap-2 font-medium text-tide-charcoal">
                            <span className={cn("size-1.5 shrink-0 rounded-full", MILESTONE_DOT[ms.status])} />
                            {ms.title}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{ms.due_date ?? "No due date"}</TableCell>
                        <TableCell className="text-right">
                          <form action={updateMilestoneStatus} className="flex items-center justify-end gap-1.5">
                            <input type="hidden" name="event_id" value={id} />
                            <input type="hidden" name="id" value={ms.id} />
                            <select
                              name="status"
                              defaultValue={ms.status}
                              className="h-7 rounded-md border border-input bg-background px-1.5 text-[12.5px]"
                            >
                              <option value="not_started">Not started</option>
                              <option value="on_track">On track</option>
                              <option value="at_risk">At risk</option>
                              <option value="complete">Complete</option>
                            </select>
                            <Button type="submit" size="sm" variant="outline">
                              Update
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={MilestoneIcon} title="No milestones yet" className="border-none py-8" />
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-2.5">
              <CardTitle className="text-sm">Tasks for this event</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tasks?.length ? (
                <Table>
                  <TableBody>
                    {tasks.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-tide-charcoal">{t.title}</TableCell>
                        <TableCell className="text-muted-foreground">{t.due_date ?? "No due date"}</TableCell>
                        <TableCell className="text-right">
                          <TaskStatusBadge status={t.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No tasks yet"
                  description="Add them from the task board."
                  className="border-none py-8"
                  action={
                    <Button render={<Link href="/tasks" />} nativeButton={false} size="sm" variant="outline">
                      Task board
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <FileText className="size-3.5 text-tide-teal" />
                New document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createDocument} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-muted-foreground">Type</label>
                  <select name="document_type_id" required className="h-8 rounded-md border border-input bg-background px-2.5 text-sm">
                    <option value="">Select…</option>
                    {documentTypes?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-muted-foreground">Title</label>
                  <Input name="title" placeholder={`${event.name} — OSSP`} required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-muted-foreground">File</label>
                  <input
                    type="file"
                    name="file"
                    required
                    className="block text-sm text-tide-charcoal file:mr-2.5 file:rounded-md file:border-0 file:bg-tide-teal/12 file:px-2.5 file:py-1 file:text-[13px] file:font-medium file:text-tide-teal hover:file:bg-tide-teal/20"
                  />
                </div>
                <Button type="submit" size="sm">
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="p-0">
              {documents?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium text-tide-charcoal">
                          <Link href={`/documents/${doc.id}`} className="block">
                            {doc.title}
                            <span className="block text-[12px] font-normal text-muted-foreground">
                              {doc.reference ?? "Unreferenced"}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {(doc.document_types as { name: string } | null)?.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <DocumentStatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell>
                          <form action={toggleDocumentVisibility}>
                            <input type="hidden" name="document_id" value={doc.id} />
                            <input type="hidden" name="event_id" value={id} />
                            <input type="hidden" name="next_visible" value={(!doc.client_visible).toString()} />
                            <Button
                              type="submit"
                              size="icon-sm"
                              variant="ghost"
                              aria-label={doc.client_visible ? "Hide from client portal" : "Share to client portal"}
                              title={doc.client_visible ? "Visible to client — click to hide" : "Not shared — click to share"}
                            >
                              {doc.client_visible ? (
                                <Eye className="size-3.5 text-tide-teal" />
                              ) : (
                                <EyeOff className="size-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={FileText} title="No documents yet" className="border-none py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-3">
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="gap-0 py-0"><CardHeader className="flex-row items-center justify-between border-b py-3.5"><CardTitle>Proposals</CardTitle><Button render={<Link href="/business/proposals/new" />} nativeButton={false} size="sm" variant="outline">New</Button></CardHeader><CardContent className="p-0">{proposals?.length ? proposals.map((record) => <Link key={record.id} href={`/business/proposals/${record.id}`} className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"><span><strong className="block text-sm">{record.title}</strong><small className="text-muted-foreground">{record.proposal_reference}{record.client_visible ? " · Portal" : ""}</small></span><CommercialStatusBadge status={record.status} /></Link>) : <EmptyState icon={FileText} title="No proposals" className="border-none py-8" />}</CardContent></Card>
            <Card className="gap-0 py-0"><CardHeader className="flex-row items-center justify-between border-b py-3.5"><CardTitle>Quotes</CardTitle><Button render={<Link href="/business/quotes/new" />} nativeButton={false} size="sm" variant="outline">New</Button></CardHeader><CardContent className="p-0">{quotes?.length ? quotes.map((record) => <Link key={record.id} href={`/business/quotes/${record.id}`} className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"><span><strong className="block text-sm">{record.quote_reference}</strong><small className="text-muted-foreground">{formatMoney(record.total)}{record.client_visible ? " · Portal" : ""}</small></span><CommercialStatusBadge status={record.status} /></Link>) : <EmptyState icon={CirclePoundSterling} title="No quotes" className="border-none py-8" />}</CardContent></Card>
            <Card className="gap-0 py-0"><CardHeader className="flex-row items-center justify-between border-b py-3.5"><CardTitle>Invoices</CardTitle><Button render={<Link href="/business/invoices/new" />} nativeButton={false} size="sm" variant="outline">New</Button></CardHeader><CardContent className="p-0">{invoices?.length ? invoices.map((record) => <Link key={record.id} href={`/business/invoices/${record.id}`} className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"><span><strong className="block text-sm">{record.invoice_reference}</strong><small className="text-muted-foreground">{formatMoney(record.balance_due)} due{record.client_visible ? " · Portal" : ""}</small></span><CommercialStatusBadge status={record.status} /></Link>) : <EmptyState icon={Banknote} title="No invoices" className="border-none py-8" />}</CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
            <span className="font-medium text-muted-foreground">Event Control:</span>
            <ControlSessionBadge status={controlSession?.status ?? "planned"} />
            <span className="text-muted-foreground">
              <strong className="text-tide-charcoal">{openIncidentCount}</strong> active incident{openIncidentCount === 1 ? "" : "s"}
            </span>
            <span className="text-muted-foreground">
              <strong className="text-tide-charcoal">{openActionCount ?? 0}</strong> open action{(openActionCount ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
          <Card className="gap-0 py-0">
            <CardHeader className="flex-row items-center justify-between border-b py-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Siren className="size-3.5 text-tide-teal" />
                Incidents
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button render={<Link href={`/incidents/control/${id}`} />} nativeButton={false} size="sm">
                  Open Event Control
                </Button>
                <Button
                  render={<Link href={`/incidents/new?event_id=${id}`} />}
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                >
                  Report incident
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {incidents?.length ? (
                <Table>
                  <TableBody>
                    {incidents.map((inc) => (
                      <TableRow key={inc.id}>
                        <TableCell className="font-medium text-tide-charcoal">
                          <Link href={`/incidents/${inc.id}`} className="block">
                            {inc.incident_number}
                            <span className="block text-[12px] font-normal text-muted-foreground">{inc.summary}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <IncidentSeverityBadge severity={inc.severity} />
                        </TableCell>
                        <TableCell className="text-right">
                          <IncidentStatusBadge status={inc.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={Siren} title="No incidents logged for this event" className="border-none py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-3">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Inbox className="size-3.5 text-tide-teal" />
                Client requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {clientRequests?.length ? (
                <Table>
                  <TableBody>
                    {clientRequests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-tide-charcoal">
                          {r.title}
                          <span className="block text-[12px] font-normal text-muted-foreground">
                            {r.type === "file_upload" ? "File request" : "Information request"}
                            {r.description ? ` · ${r.description}` : ""}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <ClientRequestStatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === "open" ? (
                            <form action={fulfilClientRequest} className="flex items-center justify-end gap-1.5">
                              <input type="hidden" name="event_id" value={id} />
                              <input type="hidden" name="request_id" value={r.id} />
                              <Input
                                name="response_note"
                                placeholder="Response note (optional)"
                                className="h-7 w-48 text-[12.5px]"
                              />
                              <Button type="submit" size="sm" variant="outline">
                                Mark fulfilled
                              </Button>
                            </form>
                          ) : (
                            <span className="text-[12.5px] text-muted-foreground">{r.response_note}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState icon={Inbox} title="No client requests" className="border-none py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-3">
          <Card className="gap-0 py-0">
            <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/30 px-4 py-2.5">
              <span className="mr-1 text-xs font-semibold text-muted-foreground">Correspondence reference</span>
              <EntityReference label="Event ID" value={event.event_reference} />
              <EntityReference label="Client ID" value={organisation?.client_reference} />
            </div>
            <CardContent className="max-h-[420px] space-y-3 overflow-y-auto p-4">
              {messages?.length ? (
                messages.map((m) => {
                  const sender = m.user_profiles as { full_name: string } | null;
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={cn("flex gap-2.5", mine && "flex-row-reverse text-right")}>
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[10.5px] font-bold text-tide-teal">
                        {initials(sender?.full_name || "?")}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[12px] text-muted-foreground">
                          {sender?.full_name ?? "Unknown"}
                          {!m.visible_to_client && <span className="ml-1.5 text-warning">· internal</span>}
                        </div>
                        <div className="mt-0.5 inline-block max-w-md rounded-lg bg-muted px-3 py-1.5 text-sm text-tide-charcoal">
                          {m.body}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState icon={Mail} title="No messages yet" className="border-none py-8" />
              )}
            </CardContent>
            <div className="border-t p-3">
              <form action={sendEventMessage} className="flex items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <Textarea name="body" required rows={1} placeholder="Message the client…" className="text-sm" />
                <label className="flex items-center gap-1.5 text-[12px] whitespace-nowrap text-muted-foreground">
                  <input type="checkbox" name="visible_to_client" value="true" defaultChecked className="size-3.5" />
                  <input type="hidden" name="visible_to_client" value="false" />
                  Visible to client
                </label>
                <Button type="submit" size="sm">
                  Send
                </Button>
              </form>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const MILESTONE_DOT: Record<string, string> = {
  not_started: "bg-muted-foreground/40",
  on_track: "bg-tide-teal",
  at_risk: "bg-warning",
  complete: "bg-success",
};

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-tide-teal/10 text-tide-teal">
        <Icon className="size-3" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium text-tide-charcoal">{value || "—"}</div>
      </div>
    </div>
  );
}

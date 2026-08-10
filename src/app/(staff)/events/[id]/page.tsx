import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  FileText,
  MapPin,
  Milestone as MilestoneIcon,
  Pencil,
  Radio,
  Trash2,
  UserPlus,
  Users,
  Users2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  updateEventStage,
  addEventMember,
  removeEventMember,
  createMilestone,
  updateMilestoneStatus,
} from "@/lib/actions/events";
import { createDocument } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StageBadge, DocumentStatusBadge, TaskStatusBadge } from "@/components/status-badges";
import { EmptyState } from "@/components/empty-state";
import { initials, cn } from "@/lib/utils";

const STAGES = ["enquiry", "proposal", "confirmed", "planning", "live", "complete"] as const;

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, organisations(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();

  const [{ data: members }, { data: staffDirectory }, { data: milestones }, { data: tasks }, { data: documents }] =
    await Promise.all([
      supabase
        .from("event_members")
        .select("id, role_on_event, user_profiles(id, full_name, email)")
        .eq("event_id", id),
      supabase.from("user_profiles").select("id, full_name, email").eq("account_type", "staff"),
      supabase.from("milestones").select("*").eq("event_id", id).order("due_date"),
      supabase.from("tasks").select("*").eq("event_id", id).order("due_date"),
      supabase
        .from("documents")
        .select("id, reference, title, status, document_types(name)")
        .eq("event_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const { data: documentTypes } = await supabase
    .from("document_types")
    .select("id, name")
    .eq("status", "published");

  const orgName = (event.organisations as { name: string } | null)?.name;
  const currentStageIndex = STAGES.indexOf(event.stage);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/events"
        className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        Events
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[19px] leading-tight font-bold tracking-tight text-tide-charcoal">{event.name}</h1>
            <StageBadge stage={event.stage} />
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {orgName ?? "No client"} · {event.venue ?? "Venue TBC"}
            {event.start_date ? ` · ${event.start_date}${event.end_date ? ` – ${event.end_date}` : ""}` : ""}
          </p>
        </div>
        <Button render={<Link href={`/events/${id}/edit`} />} nativeButton={false} variant="outline" size="sm">
          <Pencil className="size-3.5" />
          Edit details
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center">
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
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-150",
                        current
                          ? "bg-tide-teal text-white ring-3 ring-tide-teal/20"
                          : done
                            ? "bg-tide-teal/15 text-tide-teal hover:bg-tide-teal/25"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/15",
                      )}
                      title={done ? `Revert to ${stage}` : `Advance to ${stage}`}
                    >
                      {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                    </button>
                    <span
                      className={cn(
                        "text-[10px] font-medium whitespace-nowrap",
                        current ? "text-tide-charcoal" : "text-muted-foreground",
                      )}
                    >
                      {stage[0].toUpperCase() + stage.slice(1)}
                    </span>
                  </form>
                  {i < STAGES.length - 1 && (
                    <div className={cn("mx-1 h-0.5 flex-1 rounded-full", done ? "bg-tide-teal/30" : "bg-muted")} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="milestones">Milestones &amp; Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-[13px]">Event variables</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3.5">
              <Field icon={CalendarDays} label="event.name" value={event.name} />
              <Field icon={MapPin} label="venue.name" value={event.venue} />
              <Field
                icon={CalendarDays}
                label="event.dates"
                value={event.start_date ? `${event.start_date} – ${event.end_date ?? event.start_date}` : null}
              />
              <Field icon={Users2} label="event.expected_attendance" value={event.expected_attendance?.toString() ?? null} />
              <Field icon={Radio} label="event.control" value={event.control_location} />
              <Field icon={Banknote} label="event.financial_value" value={event.financial_value ? `£${event.financial_value}` : null} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-[13px]">
                <UserPlus className="size-3.5 text-tide-teal" />
                Add member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addEventMember} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Staff member</label>
                  <select name="user_id" required className="h-8 rounded-md border border-input bg-background px-2.5 text-[13px]">
                    <option value="">Select…</option>
                    {staffDirectory?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Role on event</label>
                  <Input name="role_on_event" placeholder="e.g. Safety Commander" required className="h-8 text-[13px]" />
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
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[9.5px] font-bold text-tide-teal">
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
              <CardTitle className="flex items-center gap-1.5 text-[13px]">
                <MilestoneIcon className="size-3.5 text-tide-teal" />
                Add milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createMilestone} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Title</label>
                  <Input name="title" required className="h-8 text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Due date</label>
                  <Input name="due_date" type="date" className="h-8 text-[13px]" />
                </div>
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-2.5">
              <CardTitle className="text-[13px]">Milestones</CardTitle>
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
                              className="h-7 rounded-md border border-input bg-background px-1.5 text-[11.5px]"
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
              <CardTitle className="text-[13px]">Tasks for this event</CardTitle>
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
              <CardTitle className="flex items-center gap-1.5 text-[13px]">
                <FileText className="size-3.5 text-tide-teal" />
                New document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createDocument} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Type</label>
                  <select name="document_type_id" required className="h-8 rounded-md border border-input bg-background px-2.5 text-[13px]">
                    <option value="">Select…</option>
                    {documentTypes?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Title</label>
                  <Input name="title" placeholder={`${event.name} — OSSP`} required className="h-8 text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">File</label>
                  <input
                    type="file"
                    name="file"
                    required
                    className="block text-[13px] text-tide-charcoal file:mr-2.5 file:rounded-md file:border-0 file:bg-tide-teal/12 file:px-2.5 file:py-1 file:text-[12px] file:font-medium file:text-tide-teal hover:file:bg-tide-teal/20"
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium text-tide-charcoal">
                          <Link href={`/documents/${doc.id}`} className="block">
                            {doc.title}
                            <span className="block text-[11px] font-normal text-muted-foreground">
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
        <div className="font-mono text-[10px] text-tide-teal">{label}</div>
        <div className="truncate text-[12.5px] font-medium text-tide-charcoal">{value || "—"}</div>
      </div>
    </div>
  );
}

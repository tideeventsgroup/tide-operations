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
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        Events
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] leading-tight font-bold tracking-tight text-tide-charcoal">{event.name}</h1>
            <StageBadge stage={event.stage} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {orgName ?? "No client"} · {event.venue ?? "Venue TBC"}
            {event.start_date ? ` · ${event.start_date}${event.end_date ? ` – ${event.end_date}` : ""}` : ""}
          </p>
        </div>
        <Button render={<Link href={`/events/${id}/edit`} />} nativeButton={false} variant="outline" size="sm">
          <Pencil className="size-3.5" />
          Edit details
        </Button>
      </div>

      <Card className="mb-5">
        <CardContent className="py-5">
          <div className="flex items-center">
            {STAGES.map((stage, i) => {
              const done = i < currentStageIndex;
              const current = i === currentStageIndex;
              return (
                <div key={stage} className="flex flex-1 items-center last:flex-initial">
                  <form action={updateEventStage} className="flex flex-col items-center gap-1.5">
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="stage" value={stage} />
                    <button
                      type="submit"
                      disabled={current}
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-150",
                        current
                          ? "bg-tide-teal text-white ring-4 ring-tide-teal/20"
                          : done
                            ? "bg-tide-teal/15 text-tide-teal hover:bg-tide-teal/25"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/15",
                      )}
                      title={done ? `Revert to ${stage}` : `Advance to ${stage}`}
                    >
                      {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </button>
                    <span
                      className={cn(
                        "text-[11px] font-medium whitespace-nowrap",
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

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px]">Event variables</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-5">
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

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <UserPlus className="size-4 text-tide-teal" />
                Add member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addEventMember} className="flex flex-wrap items-end gap-2.5">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Staff member</label>
                  <select name="user_id" required className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select…</option>
                    {staffDirectory?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Role on event</label>
                  <Input name="role_on_event" placeholder="e.g. Safety Commander" required />
                </div>
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="px-0 py-1">
              {members?.length ? (
                <div className="divide-y">
                  {members.map((m) => {
                    const profile = m.user_profiles as { id: string; full_name: string; email: string } | null;
                    const name = profile?.full_name || profile?.email || "Unknown";
                    return (
                      <div key={m.id} className="flex items-center gap-3.5 px-4 py-3.5 text-sm">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[11px] font-bold text-tide-teal">
                          {initials(name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-tide-charcoal">{name}</div>
                          <div className="text-[12.5px] text-muted-foreground">{m.role_on_event}</div>
                        </div>
                        <form action={removeEventMember}>
                          <input type="hidden" name="event_id" value={id} />
                          <input type="hidden" name="member_id" value={m.id} />
                          <Button type="submit" size="icon-sm" variant="ghost" aria-label="Remove member">
                            <Trash2 className="size-3.5 text-muted-foreground" />
                          </Button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={Users} title="No members assigned yet" className="border-none py-10" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <MilestoneIcon className="size-4 text-tide-teal" />
                Add milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createMilestone} className="flex flex-wrap items-end gap-2.5">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input name="title" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Due date</label>
                  <Input name="due_date" type="date" />
                </div>
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-[15px]">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-1">
              {milestones?.length ? (
                <div className="divide-y">
                  {milestones.map((ms) => (
                    <div key={ms.id} className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("size-2 shrink-0 rounded-full", MILESTONE_DOT[ms.status])} />
                        <div>
                          <div className="font-medium text-tide-charcoal">{ms.title}</div>
                          <div className="text-[12.5px] text-muted-foreground">{ms.due_date ?? "No due date"}</div>
                        </div>
                      </div>
                      <form action={updateMilestoneStatus} className="flex items-center gap-2">
                        <input type="hidden" name="event_id" value={id} />
                        <input type="hidden" name="id" value={ms.id} />
                        <select
                          name="status"
                          defaultValue={ms.status}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
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
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={MilestoneIcon} title="No milestones yet" className="border-none py-10" />
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-[15px]">Tasks for this event</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-1">
              {tasks?.length ? (
                <div className="divide-y">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-3.5 text-sm">
                      <div>
                        <div className="font-medium text-tide-charcoal">{t.title}</div>
                        <div className="text-[12.5px] text-muted-foreground">{t.due_date ?? "No due date"}</div>
                      </div>
                      <TaskStatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No tasks yet"
                  description="Add them from the task board."
                  className="border-none py-10"
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

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <FileText className="size-4 text-tide-teal" />
                New document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createDocument} className="flex flex-wrap items-end gap-2.5">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select name="document_type_id" required className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select…</option>
                    {documentTypes?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input name="title" placeholder={`${event.name} — OSSP`} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">File</label>
                  <input
                    type="file"
                    name="file"
                    required
                    className="block text-sm text-tide-charcoal file:mr-3 file:rounded-md file:border-0 file:bg-tide-teal/12 file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-tide-teal hover:file:bg-tide-teal/20"
                  />
                </div>
                <Button type="submit" size="sm">
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="px-0 py-1">
              {documents?.length ? (
                <div className="divide-y">
                  {documents.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="flex items-center gap-3.5 px-4 py-3.5 text-sm transition-colors duration-150 hover:bg-accent/40"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tide-teal/12 text-tide-teal">
                        <FileText className="size-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-tide-charcoal">{doc.title}</div>
                        <div className="truncate text-[12.5px] text-muted-foreground">
                          {doc.reference ?? "Unreferenced"} ·{" "}
                          {(doc.document_types as { name: string } | null)?.name}
                        </div>
                      </div>
                      <DocumentStatusBadge status={doc.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileText} title="No documents yet" className="border-none py-10" />
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
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-tide-teal/10 text-tide-teal">
        <Icon className="size-3.5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[11px] text-tide-teal">{label}</div>
        <div className="truncate text-[13.5px] font-medium text-tide-charcoal">{value || "—"}</div>
      </div>
    </div>
  );
}

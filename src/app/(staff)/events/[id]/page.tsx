import Link from "next/link";
import { notFound } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StageBadge, DocumentStatusBadge, TaskStatusBadge } from "@/components/status-badges";

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
        .select("id, reference, title, status, completion_pct, document_templates(name)")
        .eq("event_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const { data: templates } = await supabase
    .from("document_templates")
    .select("id, name")
    .eq("status", "published");

  const orgName = (event.organisations as { name: string } | null)?.name;
  const currentStageIndex = STAGES.indexOf(event.stage);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-tide-charcoal">{event.name}</h1>
            <StageBadge stage={event.stage} />
          </div>
          <p className="text-sm text-muted-foreground">
            {orgName ?? "No client"} · {event.venue ?? "Venue TBC"}
            {event.start_date ? ` · ${event.start_date}${event.end_date ? ` – ${event.end_date}` : ""}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button render={<Link href={`/events/${id}/edit`} />} nativeButton={false} variant="outline" size="sm">
            Edit details
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 pt-6">
          <span className="text-sm text-muted-foreground">Stage:</span>
          {STAGES.map((stage, i) => (
            <form action={updateEventStage} key={stage}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="stage" value={stage} />
              <Button
                type="submit"
                size="sm"
                variant={stage === event.stage ? "default" : "outline"}
                disabled={stage === event.stage}
                className={i < currentStageIndex ? "opacity-60" : ""}
              >
                {stage[0].toUpperCase() + stage.slice(1)}
              </Button>
            </form>
          ))}
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
              <CardTitle className="text-base">Event variables</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="event.name" value={event.name} />
              <Field label="venue.name" value={event.venue} />
              <Field label="event.dates" value={event.start_date ? `${event.start_date} – ${event.end_date ?? event.start_date}` : null} />
              <Field label="event.expected_attendance" value={event.expected_attendance?.toString() ?? null} />
              <Field label="event.control" value={event.control_location} />
              <Field label="event.financial_value" value={event.financial_value ? `£${event.financial_value}` : null} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add member</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addEventMember} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Staff member</label>
                  <select name="user_id" required className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select…</option>
                    {staffDirectory?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Role on event</label>
                  <Input name="role_on_event" placeholder="e.g. Safety Commander" required />
                </div>
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="divide-y p-0">
              {members?.length ? (
                members.map((m) => {
                  const profile = m.user_profiles as { id: string; full_name: string; email: string } | null;
                  return (
                    <div key={m.id} className="flex items-center justify-between p-4 text-sm">
                      <div>
                        <div className="font-medium text-tide-charcoal">{profile?.full_name || profile?.email}</div>
                        <div className="text-muted-foreground">{m.role_on_event}</div>
                      </div>
                      <form action={removeEventMember}>
                        <input type="hidden" name="event_id" value={id} />
                        <input type="hidden" name="member_id" value={m.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Remove
                        </Button>
                      </form>
                    </div>
                  );
                })
              ) : (
                <p className="p-4 text-sm text-muted-foreground">No members assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add milestone</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createMilestone} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input name="title" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Due date</label>
                  <Input name="due_date" type="date" />
                </div>
                <Button type="submit" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {milestones?.length ? (
                milestones.map((ms) => (
                  <div key={ms.id} className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <div className="font-medium text-tide-charcoal">{ms.title}</div>
                      <div className="text-muted-foreground">{ms.due_date ?? "No due date"}</div>
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
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">No milestones yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks for this event</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {tasks?.length ? (
                tasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <div className="font-medium text-tide-charcoal">{t.title}</div>
                      <div className="text-muted-foreground">{t.due_date ?? "No due date"}</div>
                    </div>
                    <TaskStatusBadge status={t.status} />
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  No tasks yet. Add them from the{" "}
                  <Link href="/tasks" className="text-tide-teal underline">
                    task board
                  </Link>
                  .
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New document</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createDocument} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="event_id" value={id} />
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Template</label>
                  <select name="template_id" required className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select…</option>
                    {templates?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Title</label>
                  <Input name="title" placeholder={`${event.name} — OSSP`} required />
                </div>
                <Button type="submit" size="sm">
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="divide-y p-0">
              {documents?.length ? (
                documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center justify-between gap-4 p-4 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-tide-charcoal">{doc.title}</div>
                      <div className="truncate text-muted-foreground">
                        {doc.reference ?? "Unreferenced"} ·{" "}
                        {(doc.document_templates as { name: string } | null)?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{doc.completion_pct}%</Badge>
                      <DocumentStatusBadge status={doc.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">No documents yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="font-mono text-xs text-tide-teal">{label}</div>
      <div className="text-tide-charcoal">{value || "—"}</div>
    </div>
  );
}

import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, FileCheck2, ListChecks, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { StageBadge, DocumentStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { NextEventCard } from "@/components/next-event-card";

type DashboardEvent = {
  id: string;
  name: string;
  venue: string | null;
  start_date: string | null;
  end_date: string | null;
  stage: string;
  organisation_name: string | null;
};

type ReviewQueueItem = {
  id: string;
  reference: string | null;
  title: string;
  status: string;
  event_id: string | null;
  event_name: string | null;
};

type OpenTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  event_id: string | null;
  event_name: string | null;
};

type DashboardSnapshot = {
  upcoming_events: DashboardEvent[];
  review_queue: ReviewQueueItem[];
  review_queue_count: number;
  my_open_tasks: OpenTask[];
  open_tasks_count: number;
  approval_requests_count: number;
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info-bg text-info",
  high: "bg-warning-bg text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data, error }, { count: activeEventsCount }] = await Promise.all([
    supabase.rpc("get_dashboard_snapshot"),
    supabase.from("events").select("id", { count: "exact", head: true }).neq("stage", "complete"),
  ]);
  const snapshot = (data ?? {
    upcoming_events: [],
    review_queue: [],
    review_queue_count: 0,
    my_open_tasks: [],
    open_tasks_count: 0,
    approval_requests_count: 0,
  }) as DashboardSnapshot;

  const nextEvent = snapshot.upcoming_events[0] ?? null;
  const otherEvents = snapshot.upcoming_events.slice(1);

  let nextEventOpenTasks = 0;
  let nextEventReviewCount = 0;
  if (nextEvent) {
    const [{ count: taskCount }, { count: reviewCount }] = await Promise.all([
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("event_id", nextEvent.id)
        .neq("status", "complete"),
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("event_id", nextEvent.id)
        .in("status", ["in_review", "needs_updates"]),
    ]);
    nextEventOpenTasks = taskCount ?? 0;
    nextEventReviewCount = reviewCount ?? 0;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Dashboard" description="Operational overview across every event you have access to." />

      {error && <p className="mb-4 text-sm text-destructive">Couldn&apos;t load dashboard data: {error.message}</p>}

      {nextEvent ? (
        <div className="mb-5">
          <NextEventCard event={nextEvent} openTaskCount={nextEventOpenTasks} reviewCount={nextEventReviewCount} />
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming events"
          description="Events you're assigned to will appear here as soon as they're scheduled."
          className="mb-5"
        />
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active events" value={activeEventsCount ?? 0} href="/events" icon={Zap} />
        <StatCard
          label="In review / needs updates"
          value={snapshot.review_queue_count}
          href="/events"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard label="Open tasks" value={snapshot.open_tasks_count} href="/tasks" icon={ListChecks} />
        <StatCard
          label="Awaiting issue"
          value={snapshot.approval_requests_count}
          href="/events"
          icon={FileCheck2}
          tone="info"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-2.5">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <CalendarDays className="size-3.5 text-tide-teal" />
              Then coming up
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {otherEvents.length ? (
              <Table>
                <TableBody>
                  {otherEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium text-tide-charcoal">
                        <Link href={`/events/${event.id}`} className="block">
                          {event.name}
                        </Link>
                        <span className="block text-[12.5px] font-normal text-muted-foreground">
                          {event.organisation_name ?? "No client"} · {event.venue ?? "Venue TBC"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <StageBadge stage={event.stage} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="Nothing else on the horizon"
                description="Other upcoming events will appear here once scheduled."
                className="border-none py-8"
              />
            )}
          </CardContent>
          <div className="border-t px-3 py-2">
            <Link href="/events" className="text-sm font-medium text-tide-teal hover:underline">
              View all events →
            </Link>
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-2.5">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <FileCheck2 className="size-3.5 text-tide-teal" />
              Review queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {snapshot.review_queue.length ? (
              <Table>
                <TableBody>
                  {snapshot.review_queue.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium text-tide-charcoal">
                        <Link href={`/documents/${doc.id}`} className="block">
                          {doc.title}
                        </Link>
                        <span className="block text-[12.5px] font-normal text-muted-foreground">
                          {doc.reference ?? "Unreferenced"} · {doc.event_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DocumentStatusBadge status={doc.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Nothing awaiting review"
                description="Documents submitted for review will show up here."
                className="border-none py-8"
              />
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="border-b py-2.5">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <ListChecks className="size-3.5 text-tide-teal" />
              My open tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {snapshot.my_open_tasks.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.my_open_tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium text-tide-charcoal">
                        <Link href="/tasks" className="block">
                          {task.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{task.event_name ?? "Portfolio"}</TableCell>
                      <TableCell className="text-muted-foreground">{task.due_date ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={PRIORITY_STYLES[task.priority]}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={ListChecks} title="No open tasks assigned to you" className="border-none py-8" />
            )}
          </CardContent>
          <div className="border-t px-3 py-2">
            <Link href="/tasks" className="text-sm font-medium text-tide-teal hover:underline">
              View task board →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

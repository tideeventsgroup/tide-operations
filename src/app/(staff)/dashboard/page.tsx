import Link from "next/link";
import { AlertTriangle, CalendarClock, CalendarDays, CheckCircle2, FileCheck2, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { ListRow } from "@/components/list-row";
import { StageBadge, DocumentStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";

type DashboardEvent = {
  id: string;
  name: string;
  venue: string | null;
  start_date: string | null;
  stage: string;
  organisation_name: string | null;
};

type ReviewQueueItem = {
  id: string;
  reference: string | null;
  title: string;
  status: string;
  event_name: string | null;
};

type OpenTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
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
  const { data, error } = await supabase.rpc("get_dashboard_snapshot");
  const snapshot = (data ?? {
    upcoming_events: [],
    review_queue: [],
    review_queue_count: 0,
    my_open_tasks: [],
    open_tasks_count: 0,
    approval_requests_count: 0,
  }) as DashboardSnapshot;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Dashboard"
        description="Operational overview across every event you have access to."
      />

      {error && (
        <p className="mb-4 text-sm text-destructive">Couldn&apos;t load dashboard data: {error.message}</p>
      )}

      <div className="grid gap-3.5 sm:grid-cols-3">
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

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <CalendarDays className="size-4 text-tide-teal" />
              Upcoming events
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-1">
            {snapshot.upcoming_events.length ? (
              <div className="divide-y">
                {snapshot.upcoming_events.map((event) => (
                  <ListRow
                    key={event.id}
                    href={`/events/${event.id}`}
                    icon={CalendarDays}
                    title={event.name}
                    subtitle={`${event.organisation_name ?? "No client"} · ${event.venue ?? "Venue TBC"}`}
                    trailing={<StageBadge stage={event.stage} />}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming events"
                description="Events you're assigned to will appear here."
                className="border-none"
              />
            )}
          </CardContent>
          <div className="border-t px-4 py-2.5">
            <Link href="/events" className="text-[13px] font-medium text-tide-teal hover:underline">
              View all events →
            </Link>
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <FileCheck2 className="size-4 text-tide-teal" />
              Review queue
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-1">
            {snapshot.review_queue.length ? (
              <div className="divide-y">
                {snapshot.review_queue.map((doc) => (
                  <ListRow
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    icon={FileCheck2}
                    title={doc.title}
                    subtitle={`${doc.reference ?? "Unreferenced"} · ${doc.event_name}`}
                    trailing={<DocumentStatusBadge status={doc.status} />}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Nothing awaiting review"
                description="Documents submitted for review will show up here."
                className="border-none"
              />
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <ListChecks className="size-4 text-tide-teal" />
              My open tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-1">
            {snapshot.my_open_tasks.length ? (
              <div className="divide-y">
                {snapshot.my_open_tasks.map((task) => (
                  <ListRow
                    key={task.id}
                    href="/tasks"
                    icon={CalendarClock}
                    title={task.title}
                    subtitle={
                      task.event_name
                        ? `${task.event_name}${task.due_date ? ` · Due ${task.due_date}` : ""}`
                        : `Portfolio-level${task.due_date ? ` · Due ${task.due_date}` : ""}`
                    }
                    trailing={
                      <Badge variant="outline" className={PRIORITY_STYLES[task.priority]}>
                        {task.priority}
                      </Badge>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ListChecks}
                title="No open tasks assigned to you"
                className="border-none"
              />
            )}
          </CardContent>
          <div className="border-t px-4 py-2.5">
            <Link href="/tasks" className="text-[13px] font-medium text-tide-teal hover:underline">
              View task board →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

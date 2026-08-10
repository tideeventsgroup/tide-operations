import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageBadge } from "@/components/status-badges";

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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tide-charcoal">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Operational overview across every event you have access to.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">Couldn&apos;t load dashboard data: {error.message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="In review / needs updates" value={snapshot.review_queue_count} href="/events" />
        <StatCard label="Open tasks" value={snapshot.open_tasks_count} href="/tasks" />
        <StatCard label="Awaiting issue" value={snapshot.approval_requests_count} href="/events" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.upcoming_events.length ? (
              snapshot.upcoming_events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-tide-charcoal">{event.name}</div>
                    <div className="truncate text-muted-foreground">
                      {event.organisation_name ?? "No client"} · {event.venue ?? "Venue TBC"}
                    </div>
                  </div>
                  <StageBadge stage={event.stage} />
                </Link>
              ))
            ) : (
              <EmptyRow label="No upcoming events." />
            )}
            <Link href="/events" className="block pt-1 text-sm text-tide-teal underline underline-offset-4">
              View all events
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.review_queue.length ? (
              snapshot.review_queue.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-tide-charcoal">{doc.title}</div>
                    <div className="truncate text-muted-foreground">
                      {doc.reference ?? "Unreferenced"} · {doc.event_name}
                    </div>
                  </div>
                  <Badge variant="outline">{doc.status.replace("_", " ")}</Badge>
                </Link>
              ))
            ) : (
              <EmptyRow label="Nothing awaiting review." />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">My open tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snapshot.my_open_tasks.length ? (
              snapshot.my_open_tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-tide-charcoal">{task.title}</div>
                    <div className="truncate text-muted-foreground">
                      {task.event_name ?? "Portfolio-level"}
                      {task.due_date ? ` · Due ${task.due_date}` : ""}
                    </div>
                  </div>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              ))
            ) : (
              <EmptyRow label="No open tasks assigned to you." />
            )}
            <Link href="/tasks" className="block pt-1 text-sm text-tide-teal underline underline-offset-4">
              View task board
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-tide-teal">
        <CardContent className="pt-6">
          <div className="text-3xl font-semibold text-tide-charcoal">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{label}</p>;
}

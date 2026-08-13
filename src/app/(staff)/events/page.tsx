import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StageBadge } from "@/components/status-badges";
import { EntityReference } from "@/components/entity-reference";
import { NextEventCard } from "@/components/next-event-card";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, event_reference, name, venue, location, start_date, end_date, stage, expected_attendance, organisations(name, client_reference)")
    .order("start_date", { ascending: true, nullsFirst: false });

  const closestEvent = events?.find((event) => event.stage !== "complete") ?? null;
  const remainingEvents = events?.filter((event) => event.id !== closestEvent?.id) ?? [];
  let closestTaskCount = 0;
  let closestReviewCount = 0;
  if (closestEvent) {
    const [{ count: taskCount }, { count: reviewCount }] = await Promise.all([
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("event_id", closestEvent.id).neq("status", "complete"),
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("event_id", closestEvent.id).in("status", ["in_review", "needs_updates"]),
    ]);
    closestTaskCount = taskCount ?? 0;
    closestReviewCount = reviewCount ?? 0;
  }

  return (
    <div className="mx-auto max-w-[1480px]">
      <PageHeader
        eyebrow="Portfolio"
        title="Events"
        description="The nearest live engagement first, followed by the complete event portfolio."
        actions={
          <Button render={<Link href="/events/new" />} nativeButton={false} size="sm">
            <Plus className="size-4" />
            New event
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}

      {closestEvent && (
        <div className="mb-6">
          <NextEventCard
            event={{
              id: closestEvent.id,
              name: closestEvent.name,
              venue: closestEvent.venue,
              start_date: closestEvent.start_date,
              end_date: closestEvent.end_date,
              stage: closestEvent.stage,
              organisation_name: (closestEvent.organisations as { name: string } | null)?.name ?? null,
              event_reference: closestEvent.event_reference,
              client_reference: (closestEvent.organisations as { client_reference: string } | null)?.client_reference ?? null,
            }}
            openTaskCount={closestTaskCount}
            reviewCount={closestReviewCount}
          />
        </div>
      )}

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="font-semibold text-tide-charcoal">Event portfolio</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Upcoming and completed engagements</p>
          </div>
          <span className="text-sm font-semibold text-muted-foreground tabular-nums">{remainingEvents.length}</span>
        </div>
        <CardContent className="p-0">
          {remainingEvents.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                  <TableHead className="text-right">Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remainingEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-tide-charcoal">
                      <Link href={`/events/${event.id}`} className="block">
                        {event.name}
                      </Link>
                      <EntityReference label="Event ID" value={event.event_reference} className="mt-1" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(event.organisations as { name: string; client_reference: string } | null)?.name ?? "—"}
                      <EntityReference label="Client ID" value={(event.organisations as { client_reference: string } | null)?.client_reference} className="mt-1" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.venue ?? "TBC"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.start_date ? `${event.start_date}${event.end_date && event.end_date !== event.start_date ? ` – ${event.end_date}` : ""}` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {event.expected_attendance?.toLocaleString() ?? "—"}
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
              title={closestEvent ? "No other events" : "No events yet"}
              description={closestEvent ? "This is currently the only event in the portfolio." : "Create the first engagement to get started."}
              className="border-none py-14"
              action={!closestEvent ? (
                <Button render={<Link href="/events/new" />} nativeButton={false} size="sm">
                  <Plus className="size-4" />
                  New event
                </Button>
              ) : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

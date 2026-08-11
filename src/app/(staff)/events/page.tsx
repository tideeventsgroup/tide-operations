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

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, event_reference, name, venue, location, start_date, end_date, stage, expected_attendance, organisations(name, client_reference)")
    .order("start_date", { ascending: true, nullsFirst: false });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Events"
        description="Every engagement Tide is running or has run."
        actions={
          <Button render={<Link href="/events/new" />} nativeButton={false} size="sm">
            <Plus className="size-4" />
            New event
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {events?.length ? (
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
                {events.map((event) => (
                  <TableRow key={event.id} className="cursor-pointer">
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
              title="No events yet"
              description="Create the first engagement to get started."
              className="border-none py-14"
              action={
                <Button render={<Link href="/events/new" />} nativeButton={false} size="sm">
                  <Plus className="size-4" />
                  New event
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

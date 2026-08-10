import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ListRow } from "@/components/list-row";
import { StageBadge } from "@/components/status-badges";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, name, venue, start_date, end_date, stage, organisations(name)")
    .order("start_date", { ascending: true, nullsFirst: false });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Events"
        description="Every engagement Tide is running or has run."
        actions={
          <Button render={<Link href="/events/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New event
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}

      <Card className="gap-0 py-0">
        <CardContent className="px-0 py-1">
          {events?.length ? (
            <div className="divide-y">
              {events.map((event) => (
                <ListRow
                  key={event.id}
                  href={`/events/${event.id}`}
                  icon={CalendarDays}
                  title={event.name}
                  subtitle={`${(event.organisations as { name: string } | null)?.name ?? "No client"} · ${event.venue ?? "Venue TBC"}${event.start_date ? ` · ${event.start_date}` : ""}`}
                  trailing={<StageBadge stage={event.stage} />}
                />
              ))}
            </div>
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

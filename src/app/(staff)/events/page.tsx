import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StageBadge } from "@/components/status-badges";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, name, venue, start_date, end_date, stage, organisations(name)")
    .order("start_date", { ascending: true, nullsFirst: false });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tide-charcoal">Events</h1>
          <p className="text-sm text-muted-foreground">Every engagement Tide is running or has run.</p>
        </div>
        <Button render={<Link href="/events/new" />} nativeButton={false}>New event</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <Card>
        <CardContent className="divide-y p-0">
          {events?.length ? (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center justify-between gap-4 p-4 text-sm transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-tide-charcoal">{event.name}</div>
                  <div className="truncate text-muted-foreground">
                    {(event.organisations as { name: string } | null)?.name ?? "No client"} ·{" "}
                    {event.venue ?? "Venue TBC"}
                    {event.start_date ? ` · ${event.start_date}` : ""}
                  </div>
                </div>
                <StageBadge stage={event.stage} />
              </Link>
            ))
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              No events yet. <Link href="/events/new" className="text-tide-teal underline">Create the first one.</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { StageBadge } from "@/components/status-badges";
import { EntityReference } from "@/components/entity-reference";

export default async function PortalHomePage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, event_reference, name, venue, start_date, end_date, stage")
    .order("start_date", { ascending: false, nullsFirst: false });

  if (events?.length === 1) {
    redirect(`/portal/${events[0].id}`);
  }

  return (
    <div>
      <PageHeader title="Your events" description="Everything Tide is running or has run for you." />

      {events?.length ? (
        <div className="space-y-2.5">
          {events.map((event) => (
            <Card key={event.id} className="transition-colors hover:border-tide-teal/40">
              <CardContent>
                <Link href={`/portal/${event.id}`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-tide-charcoal">{event.name}</div>
                    <EntityReference label="Event ID" value={event.event_reference} className="mt-1" />
                    <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                      {event.venue ?? "Venue TBC"}
                      {event.start_date
                        ? ` · ${event.start_date}${event.end_date ? ` – ${event.end_date}` : ""}`
                        : ""}
                    </div>
                  </div>
                  <StageBadge stage={event.stage} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Events Tide is running for your organisation will appear here."
        />
      )}
    </div>
  );
}

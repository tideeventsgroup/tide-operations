import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
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
    .order("start_date", { ascending: true, nullsFirst: false });

  if (events?.length === 1) {
    redirect(`/portal/${events[0].id}`);
  }

  return (
    <div>
      <PageHeader eyebrow="Client portal" title="Your events" description="The closest event is shown first, with documents, requests and correspondence kept together." />

      {events?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event, index) => (
            <Card key={event.id} className={index === 0 ? "relative overflow-hidden border-tide-teal/40 bg-tide-charcoal text-white md:col-span-2" : "transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-tide-teal/45 hover:shadow-[0_8px_24px_rgba(23,23,23,0.05)]"}>
              <CardContent className={index === 0 ? "p-1" : undefined}>
                <Link href={`/portal/${event.id}`} className={index === 0 ? "flex min-h-48 flex-col justify-between gap-6 p-5 sm:p-7" : "flex min-h-32 items-center justify-between gap-4"}>
                  <div className="min-w-0">
                    {index === 0 && <p className="mb-3 text-[11px] font-bold tracking-[0.12em] text-tide-teal uppercase">Closest event</p>}
                    <div className={index === 0 ? "text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl" : "truncate text-base font-semibold text-tide-charcoal"}>{event.name}</div>
                    <EntityReference label="Event ID" value={event.event_reference} inverse={index === 0} className="mt-2" />
                    <div className={index === 0 ? "mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60" : "mt-2 text-sm text-muted-foreground"}>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{event.venue ?? "Venue TBC"}</span>
                      {event.start_date
                        ? <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{event.start_date}{event.end_date ? ` – ${event.end_date}` : ""}</span>
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StageBadge stage={event.stage} />
                    <ArrowRight className={index === 0 ? "size-5 text-tide-teal" : "size-4 text-muted-foreground"} />
                  </div>
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

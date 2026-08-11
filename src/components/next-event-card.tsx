import Link from "next/link";
import { ArrowRight, Building2, CalendarClock, ListChecks, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntityReference } from "@/components/entity-reference";
import { formatEventCountdown, cn } from "@/lib/utils";

const STAGES = ["enquiry", "proposal", "confirmed", "planning", "live", "complete"] as const;
const STAGE_LABELS: Record<string, string> = {
  enquiry: "Enquiry",
  proposal: "Proposal",
  confirmed: "Confirmed",
  planning: "Planning",
  live: "Live",
  complete: "Complete",
};

export function NextEventCard({
  event,
  openTaskCount,
  reviewCount,
}: {
  event: {
    id: string;
    name: string;
    venue: string | null;
    start_date: string | null;
    end_date: string | null;
    stage: string;
    organisation_name: string | null;
    event_reference: string;
    client_reference: string | null;
  };
  openTaskCount: number;
  reviewCount: number;
}) {
  const currentStageIndex = STAGES.indexOf(event.stage as (typeof STAGES)[number]);
  const countdown = formatEventCountdown(event.start_date, event.end_date);
  const isLive = countdown === "Live now";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-tide-charcoal text-white shadow-[0_18px_48px_rgba(55,53,54,0.14)]">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full border border-tide-teal/15" />
      <div className="pointer-events-none absolute -top-10 -right-8 size-48 rounded-full border border-tide-teal/10" />
      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-tide-teal uppercase">
              <CalendarClock className="size-3.5" /> Closest event
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                isLive ? "bg-tide-teal text-tide-charcoal" : "bg-white/10 text-white/80",
              )}
            >
              {countdown}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <EntityReference label="Event ID" value={event.event_reference} inverse />
            <EntityReference label="Client ID" value={event.client_reference} inverse />
          </div>
          <h2 className="mt-3 max-w-3xl text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.03em] text-white sm:text-[2.25rem]">{event.name}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/68">
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5 shrink-0" />
              {event.organisation_name ?? "No client"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {event.venue ?? "Venue TBC"}
            </span>
            {event.start_date && (
              <span>
                {event.start_date}
                {event.end_date ? ` – ${event.end_date}` : ""}
              </span>
            )}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Button render={<Link href={`/events/${event.id}`} />} nativeButton={false} size="lg" className="bg-tide-teal text-tide-charcoal shadow-none hover:bg-[#77c5cf]">
              Open event workspace
              <ArrowRight className="size-4" />
            </Button>
            <Button render={<Link href={`/incidents/control/${event.id}`} />} nativeButton={false} size="lg" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              Event control
            </Button>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.035] p-5 sm:p-7 lg:border-t-0 lg:border-l lg:p-8">
          <p className="text-[11px] font-bold tracking-[0.12em] text-white/42 uppercase">Operational readiness</p>
          <div className="mt-4 flex items-center gap-1.5">
            {STAGES.map((stage, i) => (
              <span
                key={stage}
                title={STAGE_LABELS[stage]}
                className={cn(
                  "h-1.5 min-w-5 flex-1 rounded-full",
                  i <= currentStageIndex ? "bg-tide-teal" : "bg-white/15",
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-white/58">Stage <span className="font-semibold text-white">{STAGE_LABELS[event.stage] ?? event.stage}</span></p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
              <ListChecks className="size-4 text-tide-teal" />
              <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{openTaskCount}</p>
              <p className="mt-1 text-xs leading-4 text-white/48">Open tasks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
              <ShieldCheck className="size-4 text-tide-teal" />
              <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{reviewCount}</p>
              <p className="mt-1 text-xs leading-4 text-white/48">In review</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

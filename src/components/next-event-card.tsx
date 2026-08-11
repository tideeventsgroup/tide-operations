import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
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
    <div className="overflow-hidden rounded-xl border border-tide-charcoal/10 bg-tide-charcoal text-white shadow-[0_1px_2px_rgba(23,23,23,0.08)]">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-tide-teal uppercase">Next up</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                isLive ? "bg-tide-teal text-tide-charcoal" : "bg-white/10 text-white/80",
              )}
            >
              {countdown}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <EntityReference label="Event ID" value={event.event_reference} inverse />
            <EntityReference label="Client ID" value={event.client_reference} inverse />
          </div>
          <h2 className="mt-1.5 text-2xl leading-tight font-semibold tracking-tight text-white">{event.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/65">
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
          <div className="mt-3 flex items-center gap-4 text-[12.5px] text-white/55">
            <span>
              <span className="font-semibold text-white">{openTaskCount}</span> open task{openTaskCount === 1 ? "" : "s"}
            </span>
            <span>
              <span className="font-semibold text-white">{reviewCount}</span> in review
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
          <div className="flex items-center gap-1">
            {STAGES.map((stage, i) => (
              <span
                key={stage}
                title={STAGE_LABELS[stage]}
                className={cn(
                  "h-1.5 w-6 rounded-full",
                  i <= currentStageIndex ? "bg-tide-teal" : "bg-white/15",
                )}
              />
            ))}
          </div>
          <span className="text-[11.5px] font-medium text-white/60">
            Currently: <span className="text-white">{STAGE_LABELS[event.stage] ?? event.stage}</span>
          </span>
          <Button render={<Link href={`/events/${event.id}`} />} nativeButton={false} size="sm">
            Open event
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

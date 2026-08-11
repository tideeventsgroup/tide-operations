import { Label } from "@/components/ui/label";

type Option = { id: string; label: string };

export function CommercialLinkFields({
  organisations,
  events,
  opportunities,
  includeOpportunity = false,
}: {
  organisations: Option[];
  events: Option[];
  opportunities?: Option[];
  includeOpportunity?: boolean;
}) {
  const selectClass = "h-10 w-full rounded-lg border border-input bg-white px-3 text-sm";
  return <>
    <div className="space-y-1.5"><Label htmlFor="organisation_id">Client</Label><select id="organisation_id" name="organisation_id" required className={selectClass}><option value="">Select Client ID</option>{organisations.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></div>
    <div className="space-y-1.5"><Label htmlFor="event_id">Event</Label><select id="event_id" name="event_id" className={selectClass}><option value="">Not linked to an event yet</option>{events.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></div>
    {includeOpportunity && <div className="space-y-1.5"><Label htmlFor="opportunity_id">Opportunity</Label><select id="opportunity_id" name="opportunity_id" className={selectClass}><option value="">No linked opportunity</option>{opportunities?.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></div>}
  </>;
}

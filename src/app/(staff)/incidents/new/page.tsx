import Link from "next/link";
import { ArrowLeft, PhoneCall, Siren } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createIncident } from "@/lib/actions/incidents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = ["Medical", "Crowd", "Fire", "Security", "Weather", "Infrastructure", "Lost person", "Welfare", "Traffic", "Other"];

export default async function NewIncidentPage({ searchParams }: { searchParams: Promise<{ event_id?: string }> }) {
  const { event_id: preselectedEventId } = await searchParams;
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("id, event_reference, name, start_date").neq("stage", "complete").order("start_date");
  const backHref = preselectedEventId ? `/incidents/control/${preselectedEventId}` : "/incidents";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-tide-charcoal"><ArrowLeft className="size-4" />Back to Event Control</Link>
      <div><div className="flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-md bg-destructive text-white"><Siren className="size-5" /></span><div><h1 className="text-2xl font-semibold tracking-tight text-tide-charcoal">Report incident</h1><p className="text-sm text-muted-foreground">Open a numbered incident and start its contemporaneous audit log.</p></div></div></div>

      <div className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/[0.04] p-4 text-sm"><PhoneCall className="mt-0.5 size-5 shrink-0 text-destructive" /><div><p className="font-semibold text-tide-charcoal">For immediate danger, call 999 first</p><p className="mt-0.5 text-muted-foreground">This system supports event command and emergency-service liaison. It does not replace emergency services.</p></div></div>

      <Card>
        <CardHeader><CardTitle className="text-base">Initial report</CardTitle></CardHeader>
        <CardContent>
          <form action={createIncident} className="space-y-5">
            <div className="space-y-1.5"><Label htmlFor="event_id">Event</Label><select id="event_id" name="event_id" required defaultValue={preselectedEventId ?? ""} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select event…</option>{events?.map((event) => <option key={event.id} value={event.id}>{event.event_reference} · {event.name} · {event.start_date ? new Date(event.start_date).toLocaleDateString("en-GB") : "Date TBC"}</option>)}</select></div>
            <div className="space-y-1.5"><Label htmlFor="summary">Incident summary</Label><Input id="summary" name="summary" required placeholder="Short factual summary" className="h-10" /></div>
            <div className="space-y-1.5"><Label htmlFor="description">Initial situation</Label><Textarea id="description" name="description" rows={4} placeholder="What happened, who is involved, immediate risks and action already taken" /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="severity">Severity</Label><select id="severity" name="severity" defaultValue="minor" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="minor">Minor</option><option value="moderate">Moderate</option><option value="serious">Serious</option><option value="critical">Critical</option></select></div><div className="space-y-1.5"><Label htmlFor="category">Category</Label><select id="category" name="category" defaultValue="" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Select category…</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="location">Exact location</Label><Input id="location" name="location" placeholder="Main stage, west entrance…" className="h-10" /></div><div className="space-y-1.5"><Label htmlFor="reported_via">Reported via</Label><select id="reported_via" name="reported_via" defaultValue="radio" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="radio">Radio</option><option value="phone">Phone</option><option value="in_person">In person</option><option value="cctv">CCTV</option><option value="client">Client</option><option value="other">Other</option></select></div></div>
            <div className="space-y-1.5"><Label htmlFor="hazard_reference">Related hazard / plan reference</Label><Input id="hazard_reference" name="hazard_reference" placeholder="Optional risk assessment or plan reference" className="h-10" /></div>
            <div className="flex items-center justify-end gap-2 border-t pt-4"><Button render={<Link href={backHref} />} nativeButton={false} type="button" variant="outline">Cancel</Button><Button type="submit"><Siren className="size-4" />Open incident</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

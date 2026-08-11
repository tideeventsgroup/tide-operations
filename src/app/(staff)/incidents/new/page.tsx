import { createClient } from "@/lib/supabase/server";
import { createIncident } from "@/lib/actions/incidents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default async function NewIncidentPage({
  searchParams,
}: {
  searchParams: Promise<{ event_id?: string }>;
}) {
  const { event_id: preselectedEventId } = await searchParams;
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, name")
    .neq("stage", "complete")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Report incident" description="Creates the incident and starts its contemporaneous log." />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Incident details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createIncident} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="event_id">Event</Label>
              <select
                id="event_id"
                name="event_id"
                required
                defaultValue={preselectedEventId ?? ""}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              >
                <option value="">Select…</option>
                {events?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" rows={2} required className="text-sm" placeholder="What happened, in one or two sentences" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity"
                  name="severity"
                  defaultValue="minor"
                  className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="serious">Serious</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g. Medical, Crowd, Weather" className="h-8 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g. Main stage, west entrance" className="h-8 text-sm" />
            </div>

            <Button type="submit" size="sm">
              Report incident
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

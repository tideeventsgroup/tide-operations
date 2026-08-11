import { createClient } from "@/lib/supabase/server";
import { createEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: organisations } = await supabase
    .from("organisations")
    .select("id, name, client_reference")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New event"
        description="Creates the event record and generates its permanent Event ID automatically."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Event details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEvent} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Event name</Label>
              <Input id="name" name="name" required className="h-8 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organisation_id">Client</Label>
              <select
                id="organisation_id"
                name="organisation_id"
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              >
                <option value="">No client / internal</option>
                {organisations?.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.client_reference} · {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" className="h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_date">Start date</Label>
                <Input id="start_date" name="start_date" type="date" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_date">End date</Label>
                <Input id="end_date" name="end_date" type="date" className="h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expected_attendance">Expected attendance</Label>
                <Input id="expected_attendance" name="expected_attendance" type="number" min={0} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="control_location">Control location</Label>
                <Input id="control_location" name="control_location" className="h-8 text-sm" />
              </div>
            </div>

            <Button type="submit" size="sm">
              Create event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

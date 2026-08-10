import { createClient } from "@/lib/supabase/server";
import { createEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: organisations } = await supabase
    .from("organisations")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tide-charcoal">New event</h1>
        <p className="text-sm text-muted-foreground">
          Creates the event record everything else in the system will link to.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organisation_id">Client</Label>
              <select
                id="organisation_id"
                name="organisation_id"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">No client / internal</option>
                {organisations?.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input id="start_date" name="start_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date</Label>
                <Input id="end_date" name="end_date" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected_attendance">Expected attendance</Label>
                <Input id="expected_attendance" name="expected_attendance" type="number" min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="control_location">Control location</Label>
                <Input id="control_location" name="control_location" />
              </div>
            </div>

            <Button type="submit">Create event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

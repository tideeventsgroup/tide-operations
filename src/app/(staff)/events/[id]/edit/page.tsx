import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event }, { data: organisations }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("organisations").select("id, name").order("name"),
  ]);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit event" />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Event details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateEvent} className="space-y-3">
            <input type="hidden" name="id" value={event.id} />
            <div className="space-y-1.5">
              <Label htmlFor="name">Event name</Label>
              <Input id="name" name="name" defaultValue={event.name} required className="h-8 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organisation_id">Client</Label>
              <select
                id="organisation_id"
                name="organisation_id"
                defaultValue={event.organisation_id ?? ""}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              >
                <option value="">No client / internal</option>
                {organisations?.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" defaultValue={event.venue ?? ""} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={event.location ?? ""} className="h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_date">Start date</Label>
                <Input id="start_date" name="start_date" type="date" defaultValue={event.start_date ?? ""} className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_date">End date</Label>
                <Input id="end_date" name="end_date" type="date" defaultValue={event.end_date ?? ""} className="h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expected_attendance">Expected attendance</Label>
                <Input
                  id="expected_attendance"
                  name="expected_attendance"
                  type="number"
                  min={0}
                  defaultValue={event.expected_attendance ?? ""}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="control_location">Control location</Label>
                <Input id="control_location" name="control_location" defaultValue={event.control_location ?? ""} className="h-8 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="financial_value">Financial value (£)</Label>
              <Input
                id="financial_value"
                name="financial_value"
                type="number"
                step="0.01"
                defaultValue={event.financial_value ?? ""}
                className="h-8 text-sm"
              />
            </div>

            <Button type="submit" size="sm">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

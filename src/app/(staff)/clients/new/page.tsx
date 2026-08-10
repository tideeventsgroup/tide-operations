import { createOrganisation } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-tide-charcoal">New client</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organisation details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOrganisation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organisation name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship_status">Relationship status</Label>
              <select
                id="relationship_status"
                name="relationship_status"
                defaultValue="prospect"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="past">Past</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={4} />
            </div>
            <Button type="submit">Create client</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

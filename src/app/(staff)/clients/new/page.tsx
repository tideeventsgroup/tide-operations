import { createOrganisation } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New client" />

      <Card>
        <CardHeader>
          <CardTitle className="text-[13px]">Organisation details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOrganisation} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Organisation name</Label>
              <Input id="name" name="name" required className="h-8 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="relationship_status">Relationship status</Label>
              <select
                id="relationship_status"
                name="relationship_status"
                defaultValue="prospect"
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px]"
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="past">Past</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} className="text-[13px]" />
            </div>
            <Button type="submit" size="sm">
              Create client
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

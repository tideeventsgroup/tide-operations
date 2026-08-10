import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrganisation, createContact, deleteContact } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageBadge } from "@/components/status-badges";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: org }, { data: contacts }, { data: events }] = await Promise.all([
    supabase.from("organisations").select("*").eq("id", id).maybeSingle(),
    supabase.from("contacts").select("*").eq("organisation_id", id).order("is_primary", { ascending: false }),
    supabase.from("events").select("id, name, stage, start_date").eq("organisation_id", id).order("start_date", { ascending: false }),
  ]);

  if (!org) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-tide-charcoal">{org.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organisation details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateOrganisation} className="space-y-4">
            <input type="hidden" name="id" value={org.id} />
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={org.name} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship_status">Relationship status</Label>
                <select
                  id="relationship_status"
                  name="relationship_status"
                  defaultValue={org.relationship_status}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input
                  id="portal_access_enabled"
                  name="portal_access_enabled"
                  type="checkbox"
                  defaultChecked={org.portal_access_enabled}
                  className="h-4 w-4"
                />
                <Label htmlFor="portal_access_enabled">Portal access enabled</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={4} defaultValue={org.notes ?? ""} />
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createContact} className="grid grid-cols-2 gap-4">
            <input type="hidden" name="organisation_id" value={org.id} />
            <div className="space-y-2">
              <Label htmlFor="contact_name">Name</Label>
              <Input id="contact_name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_role">Role</Label>
              <Input id="contact_role" name="role" placeholder="e.g. Event Director" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email</Label>
              <Input id="contact_email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" name="phone" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input id="is_primary" name="is_primary" type="checkbox" className="h-4 w-4" />
              <Label htmlFor="is_primary">Primary contact</Label>
            </div>
            <Button type="submit" className="col-span-2 w-fit">
              Add contact
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contacts</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {contacts?.length ? (
            contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <div className="font-medium text-tide-charcoal">
                    {c.name} {c.is_primary && <span className="text-xs text-tide-teal">· Primary</span>}
                  </div>
                  <div className="text-muted-foreground">
                    {c.role ?? "—"} · {c.email ?? "no email"} · {c.phone ?? "no phone"}
                  </div>
                </div>
                <form action={deleteContact}>
                  <input type="hidden" name="organisation_id" value={org.id} />
                  <input type="hidden" name="contact_id" value={c.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    Remove
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No contacts yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Events</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {events?.length ? (
            events.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="flex items-center justify-between p-4 text-sm hover:bg-accent">
                <div>
                  <div className="font-medium text-tide-charcoal">{e.name}</div>
                  <div className="text-muted-foreground">{e.start_date ?? "No date set"}</div>
                </div>
                <StageBadge stage={e.stage} />
              </Link>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No events linked yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

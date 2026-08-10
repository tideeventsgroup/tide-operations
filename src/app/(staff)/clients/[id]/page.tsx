import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Trash2, UserPlus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateOrganisation, createContact, deleteContact } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { StageBadge } from "@/components/status-badges";
import { initials } from "@/lib/utils";

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
    <div className="mx-auto max-w-3xl">
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        Clients
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tide-charcoal/8 text-tide-charcoal">
          <Building2 className="size-5" />
        </div>
        <div>
          <h1 className="text-[26px] leading-tight font-bold tracking-tight text-tide-charcoal">{org.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{org.relationship_status} relationship</p>
        </div>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Organisation details</CardTitle>
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
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <UserPlus className="size-4 text-tide-teal" />
              Add contact
            </CardTitle>
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

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <Users className="size-4 text-tide-teal" />
              Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-1">
            {contacts?.length ? (
              <div className="divide-y">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-3.5 px-4 py-3.5 text-sm">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[11px] font-bold text-tide-teal">
                      {initials(c.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-medium text-tide-charcoal">
                        {c.name}
                        {c.is_primary && (
                          <Badge variant="outline" className="border-tide-teal/30 bg-tide-teal/10 text-[10px] text-tide-teal">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="truncate text-[12.5px] text-muted-foreground">
                        {c.role ?? "—"} · {c.email ?? "no email"} · {c.phone ?? "no phone"}
                      </div>
                    </div>
                    <form action={deleteContact}>
                      <input type="hidden" name="organisation_id" value={org.id} />
                      <input type="hidden" name="contact_id" value={c.id} />
                      <Button type="submit" size="icon-sm" variant="ghost" aria-label="Remove contact">
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Users} title="No contacts yet" className="border-none py-10" />
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <CalendarDays className="size-4 text-tide-teal" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-1">
            {events?.length ? (
              <div className="divide-y">
                {events.map((e) => (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="flex items-center justify-between px-4 py-3.5 text-sm transition-colors hover:bg-accent/40"
                  >
                    <div>
                      <div className="font-medium text-tide-charcoal">{e.name}</div>
                      <div className="text-[12.5px] text-muted-foreground">{e.start_date ?? "No date set"}</div>
                    </div>
                    <StageBadge stage={e.stage} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={CalendarDays} title="No events linked yet" className="border-none py-10" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

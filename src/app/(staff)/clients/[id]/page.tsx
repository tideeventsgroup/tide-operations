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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
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
        className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-tide-charcoal"
      >
        <ArrowLeft className="size-3.5" />
        Clients
      </Link>

      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tide-charcoal/8 text-tide-charcoal">
          <Building2 className="size-4" />
        </div>
        <div>
          <h1 className="text-[19px] leading-tight font-bold tracking-tight text-tide-charcoal">{org.name}</h1>
          <p className="text-[12.5px] text-muted-foreground capitalize">{org.relationship_status} relationship</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-[13px]">Organisation details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateOrganisation} className="space-y-3">
              <input type="hidden" name="id" value={org.id} />
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={org.name} required className="h-8 text-[13px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="relationship_status">Relationship status</Label>
                  <select
                    id="relationship_status"
                    name="relationship_status"
                    defaultValue={org.relationship_status}
                    className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px]"
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
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} defaultValue={org.notes ?? ""} className="text-[13px]" />
              </div>
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-[13px]">
              <UserPlus className="size-3.5 text-tide-teal" />
              Add contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createContact} className="grid grid-cols-2 gap-3">
              <input type="hidden" name="organisation_id" value={org.id} />
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Name</Label>
                <Input id="contact_name" name="name" required className="h-8 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_role">Role</Label>
                <Input id="contact_role" name="role" placeholder="e.g. Event Director" className="h-8 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email">Email</Label>
                <Input id="contact_email" name="email" type="email" className="h-8 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input id="contact_phone" name="phone" className="h-8 text-[13px]" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input id="is_primary" name="is_primary" type="checkbox" className="h-4 w-4" />
                <Label htmlFor="is_primary">Primary contact</Label>
              </div>
              <Button type="submit" size="sm" className="col-span-2 w-fit">
                Add contact
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-2.5">
            <CardTitle className="flex items-center gap-1.5 text-[13px]">
              <Users className="size-3.5 text-tide-teal" />
              Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {contacts?.length ? (
              <Table>
                <TableBody>
                  {contacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-tide-charcoal">
                        <span className="flex items-center gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[9.5px] font-bold text-tide-teal">
                            {initials(c.name)}
                          </span>
                          {c.name}
                          {c.is_primary && (
                            <Badge variant="outline" className="border-tide-teal/30 bg-tide-teal/10 text-[9.5px] text-tide-teal">
                              Primary
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.role ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <form action={deleteContact}>
                          <input type="hidden" name="organisation_id" value={org.id} />
                          <input type="hidden" name="contact_id" value={c.id} />
                          <Button type="submit" size="icon-sm" variant="ghost" aria-label="Remove contact">
                            <Trash2 className="size-3.5 text-muted-foreground" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={Users} title="No contacts yet" className="border-none py-8" />
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-2.5">
            <CardTitle className="flex items-center gap-1.5 text-[13px]">
              <CalendarDays className="size-3.5 text-tide-teal" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {events?.length ? (
              <Table>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium text-tide-charcoal">
                        <Link href={`/events/${e.id}`} className="block">
                          {e.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{e.start_date ?? "No date set"}</TableCell>
                      <TableCell className="text-right">
                        <StageBadge stage={e.stage} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={CalendarDays} title="No events linked yet" className="border-none py-8" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

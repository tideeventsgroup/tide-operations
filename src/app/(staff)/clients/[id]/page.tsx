import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, Building2, CalendarDays, Plus, Trash2, UserPlus, Users } from "lucide-react";
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
import { EntityReference } from "@/components/entity-reference";
import { CommercialStatusBadge } from "@/components/commercial-status-badge";
import { formatMoney } from "@/lib/business";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: org }, { data: contacts }, { data: events }, { data: opportunities }, { data: quotes }, { data: invoices }] = await Promise.all([
    supabase.from("organisations").select("*").eq("id", id).maybeSingle(),
    supabase.from("contacts").select("*").eq("organisation_id", id).order("is_primary", { ascending: false }),
    supabase.from("events").select("id, event_reference, name, stage, start_date").eq("organisation_id", id).order("start_date", { ascending: false }),
    supabase.from("business_opportunities").select("id, opportunity_reference, name, stage, estimated_value").eq("organisation_id", id).order("created_at", { ascending: false }),
    supabase.from("quotes").select("id, quote_reference, title, status, total").eq("organisation_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, invoice_reference, title, status, balance_due").eq("organisation_id", id).order("created_at", { ascending: false }),
  ]);

  if (!org) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/clients"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-tide-charcoal"
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
          <EntityReference label="Client ID" value={org.client_reference} className="mt-1" />
          <p className="text-sm text-muted-foreground capitalize">{org.relationship_status} relationship</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Organisation details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateOrganisation} className="space-y-3">
              <input type="hidden" name="id" value={org.id} />
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={org.name} required className="h-8 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="relationship_status">Relationship status</Label>
                  <select
                    id="relationship_status"
                    name="relationship_status"
                    defaultValue={org.relationship_status}
                    className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
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
                <Textarea id="notes" name="notes" rows={3} defaultValue={org.notes ?? ""} className="text-sm" />
              </div>
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <UserPlus className="size-3.5 text-tide-teal" />
              Add contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createContact} className="grid grid-cols-2 gap-3">
              <input type="hidden" name="organisation_id" value={org.id} />
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Name</Label>
                <Input id="contact_name" name="name" required className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_role">Role</Label>
                <Input id="contact_role" name="role" placeholder="e.g. Event Director" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email">Email</Label>
                <Input id="contact_email" name="email" type="email" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input id="contact_phone" name="phone" className="h-8 text-sm" />
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
            <CardTitle className="flex items-center gap-1.5 text-sm">
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
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-tide-teal/12 text-[10.5px] font-bold text-tide-teal">
                            {initials(c.name)}
                          </span>
                          {c.name}
                          {c.is_primary && (
                            <Badge variant="outline" className="border-tide-teal/30 bg-tide-teal/10 text-[10.5px] text-tide-teal">
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
            <CardTitle className="flex items-center gap-1.5 text-sm">
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
                        <EntityReference label="Event ID" value={e.event_reference} className="mt-1" />
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

        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between border-b py-3.5">
            <CardTitle className="flex items-center gap-1.5 text-sm"><BriefcaseBusiness className="size-3.5 text-tide-teal" />Commercial history</CardTitle>
            <Button render={<Link href="/business/opportunities/new" />} nativeButton={false} size="sm" variant="outline"><Plus />Opportunity</Button>
          </CardHeader>
          <CardContent className="grid gap-px bg-border p-0 md:grid-cols-3">
            <section className="bg-white p-4"><p className="section-label mb-3">Opportunities</p><div className="space-y-3">{opportunities?.length ? opportunities.slice(0, 5).map((record) => <Link key={record.id} href={`/business/opportunities/${record.id}`} className="flex items-center justify-between gap-2"><span><strong className="block text-sm">{record.name}</strong><small className="text-muted-foreground">{formatMoney(record.estimated_value)}</small></span><CommercialStatusBadge status={record.stage} /></Link>) : <p className="text-sm text-muted-foreground">No opportunities</p>}</div></section>
            <section className="bg-white p-4"><p className="section-label mb-3">Quotes</p><div className="space-y-3">{quotes?.length ? quotes.slice(0, 5).map((record) => <Link key={record.id} href={`/business/quotes/${record.id}`} className="flex items-center justify-between gap-2"><span><strong className="block text-sm">{record.quote_reference}</strong><small className="text-muted-foreground">{formatMoney(record.total)}</small></span><CommercialStatusBadge status={record.status} /></Link>) : <p className="text-sm text-muted-foreground">No quotes</p>}</div></section>
            <section className="bg-white p-4"><p className="section-label mb-3">Invoices</p><div className="space-y-3">{invoices?.length ? invoices.slice(0, 5).map((record) => <Link key={record.id} href={`/business/invoices/${record.id}`} className="flex items-center justify-between gap-2"><span><strong className="block text-sm">{record.invoice_reference}</strong><small className="text-muted-foreground">{formatMoney(record.balance_due)} due</small></span><CommercialStatusBadge status={record.status} /></Link>) : <p className="text-sm text-muted-foreground">No invoices</p>}</div></section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

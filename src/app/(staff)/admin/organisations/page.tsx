import Link from "next/link";
import { Building2, ExternalLink, Link2, LockKeyhole, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateOrganisationSettings } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass = "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm";

export default async function AdminOrganisationsPage() {
  const supabase = await createClient();
  const [{ data: organisations }, { data: profiles }, { data: events }] = await Promise.all([
    supabase.from("organisations").select("id, name, client_reference, relationship_status, portal_access_enabled, created_at").order("name"),
    supabase.from("user_profiles").select("id, full_name, email, account_type, organisation_id").order("full_name"),
    supabase.from("events").select("id, organisation_id"),
  ]);

  const clientProfiles = (profiles ?? []).filter((profile) => profile.account_type === "client");
  const unassignedClients = clientProfiles.filter((profile) => !profile.organisation_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-lg font-semibold text-tide-charcoal">Organisations & portal access</h2><p className="mt-1 text-sm text-muted-foreground">The organisation link controls which events, documents, quotes and invoices each client account can access.</p></div>
        <Button render={<Link href="/clients/new" />} nativeButton={false}>Add organisation</Button>
      </div>

      {unassignedClients.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning-bg p-4">
          <div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-5 text-warning" /><div><p className="text-sm font-semibold text-tide-charcoal">{unassignedClients.length} client account{unassignedClients.length === 1 ? " is" : "s are"} not linked</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Unlinked clients cannot see any portal records. Assign them from Users & access.</p><div className="mt-2 flex flex-wrap gap-2">{unassignedClients.map((profile) => <Badge key={profile.id} variant="outline">{profile.full_name || profile.email}</Badge>)}</div></div></div>
        </div>
      )}

      <div className="space-y-3">
        {(organisations ?? []).map((organisation) => {
          const linkedUsers = clientProfiles.filter((profile) => profile.organisation_id === organisation.id);
          const eventCount = (events ?? []).filter((event) => event.organisation_id === organisation.id).length;
          return (
            <Card key={organisation.id} className="gap-0 py-0">
              <CardContent className="p-0">
                <form action={updateOrganisationSettings} className="grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_170px_180px_auto] lg:items-end">
                  <input type="hidden" name="organisation_id" value={organisation.id} />
                  <div><Label htmlFor={`org-name-${organisation.id}`}>Organisation</Label><Input id={`org-name-${organisation.id}`} name="name" defaultValue={organisation.name} required /><p className="mt-1 font-mono text-[11px] font-semibold text-tide-teal">Client ID {organisation.client_reference}</p></div>
                  <div><Label htmlFor={`org-status-${organisation.id}`}>Relationship</Label><select id={`org-status-${organisation.id}`} name="relationship_status" className={selectClass} defaultValue={organisation.relationship_status}><option value="prospect">Prospect</option><option value="active">Active client</option><option value="past">Past client</option></select></div>
                  <label className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold"><input type="checkbox" name="portal_access_enabled" defaultChecked={organisation.portal_access_enabled} />Portal enabled</label>
                  <Button type="submit" size="sm">Save organisation</Button>
                </form>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Users className="size-3.5" />{linkedUsers.length} linked user{linkedUsers.length === 1 ? "" : "s"}</span><span className="flex items-center gap-1.5"><Building2 className="size-3.5" />{eventCount} event{eventCount === 1 ? "" : "s"}</span><span className="flex items-center gap-1.5"><Link2 className="size-3.5" />{organisation.portal_access_enabled ? "Portal available" : "Portal locked"}</span></div>
                  <Link href={`/clients/${organisation.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-tide-charcoal hover:text-tide-teal">Open client record<ExternalLink className="size-3.5" /></Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

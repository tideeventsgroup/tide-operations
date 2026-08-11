import { CheckCircle2, KeyRound, Plus, ShieldCheck, UserRound, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createUserAccount, revokeAccess, updateUserAccess } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "control_room", label: "Control Room" },
  { value: "field", label: "Field" },
];

const selectClass = "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;
  const [{ data: profiles }, { data: organisations }] = await Promise.all([
    supabase.from("user_profiles").select("id, full_name, email, account_type, staff_role, organisation_id, created_at").order("created_at", { ascending: false }),
    supabase.from("organisations").select("id, name, client_reference, portal_access_enabled").order("name"),
  ]);

  const orgById = new Map((organisations ?? []).map((organisation) => [organisation.id, organisation]));

  return (
    <div className="space-y-6">
      {params.created && (
        <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-bg px-4 py-3 text-sm font-semibold text-success">
          <CheckCircle2 className="size-4" />Account created for {params.created}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-tide-charcoal">Users & access</h2>
        <p className="mt-1 text-sm text-muted-foreground">Create accounts, assign staff permissions, and link client users to the organisation that owns their portal records.</p>
      </div>

      <Card>
        <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Plus className="size-4 text-tide-teal" />Add user</CardTitle></CardHeader>
        <CardContent>
          <form action={createUserAccount} className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div><Label htmlFor="new-full-name">Full name</Label><Input id="new-full-name" name="full_name" required autoComplete="off" /></div>
            <div><Label htmlFor="new-email">Email address</Label><Input id="new-email" name="email" type="email" required autoComplete="off" /></div>
            <div><Label htmlFor="new-password">Temporary password</Label><Input id="new-password" name="temporary_password" type="password" minLength={12} required autoComplete="new-password" /><p className="mt-1 text-[11px] text-muted-foreground">At least 12 characters. Share it securely.</p></div>
            <div><Label htmlFor="new-account-type">Account type</Label><select id="new-account-type" name="account_type" className={selectClass} defaultValue="client"><option value="client">Client portal</option><option value="staff">Staff portal</option><option value="pending">Pending / no access</option></select></div>
            <div><Label htmlFor="new-staff-role">Staff role</Label><select id="new-staff-role" name="staff_role" className={selectClass} defaultValue=""><option value="">Not staff</option>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div>
            <div><Label htmlFor="new-organisation">Client organisation</Label><select id="new-organisation" name="organisation_id" className={selectClass} defaultValue=""><option value="">Not linked</option>{(organisations ?? []).map((organisation) => <option key={organisation.id} value={organisation.id}>{organisation.client_reference} — {organisation.name}</option>)}</select></div>
            <div className="flex items-center gap-3 lg:col-span-2 xl:col-span-3"><Button type="submit"><UserRound className="size-4" />Create account</Button><p className="text-xs text-muted-foreground">Client accounts automatically enable portal access for their selected organisation.</p></div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-tide-charcoal">Existing accounts</h3><Badge variant="outline">{profiles?.length ?? 0} users</Badge></div>
        {profiles?.length ? profiles.map((profile) => {
          const linkedOrganisation = profile.organisation_id ? orgById.get(profile.organisation_id) : null;
          return (
            <Card key={profile.id} className="gap-0 py-0">
              <CardContent className="p-0">
                <form action={updateUserAccess} className="grid gap-4 p-4 lg:grid-cols-[minmax(180px,1fr)_190px_190px_minmax(220px,1fr)_auto] lg:items-end">
                  <input type="hidden" name="user_id" value={profile.id} />
                  <div>
                    <Label htmlFor={`name-${profile.id}`}>User</Label>
                    <Input id={`name-${profile.id}`} name="full_name" defaultValue={profile.full_name} required />
                    <p className="mt-1 truncate text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <div><Label htmlFor={`type-${profile.id}`}>Account type</Label><select id={`type-${profile.id}`} name="account_type" className={selectClass} defaultValue={profile.account_type}><option value="staff">Staff portal</option><option value="client">Client portal</option><option value="pending">Pending / no access</option></select></div>
                  <div><Label htmlFor={`role-${profile.id}`}>Staff role</Label><select id={`role-${profile.id}`} name="staff_role" className={selectClass} defaultValue={profile.staff_role ?? ""}><option value="">Not staff</option>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div>
                  <div><Label htmlFor={`org-${profile.id}`}>Client organisation</Label><select id={`org-${profile.id}`} name="organisation_id" className={selectClass} defaultValue={profile.organisation_id ?? ""}><option value="">Not linked</option>{(organisations ?? []).map((organisation) => <option key={organisation.id} value={organisation.id}>{organisation.client_reference} — {organisation.name}</option>)}</select>{profile.account_type === "client" && <p className="mt-1 text-[11px] text-muted-foreground">{linkedOrganisation ? `${linkedOrganisation.name} · portal ${linkedOrganisation.portal_access_enabled ? "enabled" : "disabled"}` : "Organisation required"}</p>}</div>
                  <Button type="submit" size="sm"><ShieldCheck className="size-4" />Save access</Button>
                </form>
                {profile.account_type !== "pending" && (
                  <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5">
                    <span className="flex items-center gap-2 text-xs text-muted-foreground"><KeyRound className="size-3.5" />{profile.account_type === "staff" ? "Staff permissions apply across assigned operational records." : "Portal access follows the selected organisation."}</span>
                    <form action={revokeAccess}><input type="hidden" name="user_id" value={profile.id} /><Button type="submit" size="sm" variant="ghost">Revoke access</Button></form>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }) : (
          <div className="rounded-xl border bg-white py-12 text-center"><Users className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No accounts found.</p></div>
        )}
      </div>
    </div>
  );
}

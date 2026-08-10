import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assignStaffRole, revokeAccess } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLE_OPTIONS = [
  { value: "", label: "No role (pending)" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "control_room", label: "Control Room" },
  { value: "field", label: "Field" },
];

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: viewerProfile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();

  if (viewerProfile?.staff_role !== "admin") {
    redirect("/dashboard");
  }

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, account_type, staff_role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tide-charcoal">Users &amp; Roles</h1>
        <p className="text-sm text-muted-foreground">
          New accounts are created as <span className="font-medium">pending</span> with no
          permissions until you assign a role here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profiles?.length ? (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{profile.full_name || "(no name)"}</span>
                    {profile.account_type === "pending" && (
                      <Badge variant="outline" className="text-amber-600">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{profile.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={assignStaffRole} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={profile.id} />
                    <select
                      name="staff_role"
                      defaultValue={profile.staff_role ?? ""}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                  </form>
                  {profile.staff_role && (
                    <form action={revokeAccess}>
                      <input type="hidden" name="user_id" value={profile.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Revoke
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No accounts yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

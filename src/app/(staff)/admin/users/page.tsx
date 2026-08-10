import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assignStaffRole, revokeAccess } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";

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
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Users & Roles"
        description="New accounts are created as pending with no permissions until you assign a role here."
      />

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {profiles?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium text-tide-charcoal">
                      <span className="flex items-center gap-1.5">
                        {profile.full_name || "(no name)"}
                        {profile.account_type === "pending" && (
                          <Badge variant="outline" className="bg-warning-bg text-[9.5px] text-warning">
                            Pending
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                    <TableCell className="text-right">
                      <form action={assignStaffRole} className="inline-flex items-center gap-1.5">
                        <input type="hidden" name="user_id" value={profile.id} />
                        <select
                          name="staff_role"
                          defaultValue={profile.staff_role ?? ""}
                          className="h-7 rounded-md border border-input bg-background px-1.5 text-[12px]"
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
                    </TableCell>
                    <TableCell>
                      {profile.staff_role && (
                        <form action={revokeAccess}>
                          <input type="hidden" name="user_id" value={profile.id} />
                          <Button type="submit" size="sm" variant="outline">
                            Revoke
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-4 text-[13px] text-muted-foreground">No accounts yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StaffSidebarNav } from "@/components/layout/staff-sidebar";
import { StaffHeader } from "@/components/layout/staff-header";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { staffNavItems, visibleAdminNavItems } from "@/lib/nav";

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  control_room: "Control Room",
  field: "Field",
};

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("account_type, staff_role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.account_type === "pending" || !profile.staff_role) {
    redirect("/account-pending");
  }
  if (profile.account_type === "client") {
    redirect("/portal");
  }

  const adminItems = visibleAdminNavItems(profile.staff_role);
  const roleLabel = roleLabels[profile.staff_role] ?? profile.staff_role;

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-tide-charcoal text-white md:flex">
        <div className="flex h-14 flex-shrink-0 items-center border-b border-white/10 px-4">
          <span className="text-sm font-semibold tracking-wide text-tide-teal uppercase">
            Tide Operations System
          </span>
        </div>
        <StaffSidebarNav navItems={staffNavItems} adminItems={adminItems} />
        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/10 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{profile.full_name || user.email}</div>
            <div className="text-xs text-white/50">{roleLabel}</div>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="text-white/70 hover:bg-white/10 hover:text-white">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <StaffHeader
          navItems={staffNavItems}
          adminItems={adminItems}
          fullName={profile.full_name || user.email || ""}
          roleLabel={roleLabel}
        />
        <main className="flex-1 overflow-x-hidden bg-muted/30 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

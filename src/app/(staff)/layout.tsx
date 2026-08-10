import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StaffSidebarNav } from "@/components/layout/staff-sidebar";
import { StaffHeader } from "@/components/layout/staff-header";
import { BrandMark } from "@/components/brand-mark";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

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

  const roleLabel = roleLabels[profile.staff_role] ?? profile.staff_role;
  const displayName = profile.full_name || user.email || "";

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-tide-charcoal text-white md:flex">
        <div className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-white/[0.08] px-4">
          <BrandMark className="size-8 shrink-0" />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-bold tracking-tight text-white">
              Tide Events Group
            </div>
            <div className="truncate text-[10px] font-semibold tracking-[0.1em] text-tide-teal uppercase">
              Operations System
            </div>
          </div>
        </div>
        <StaffSidebarNav staffRole={profile.staff_role} />
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-white/[0.08] px-3 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tide-teal/20 text-[11px] font-bold text-tide-teal ring-1 ring-tide-teal/30">
              {initials(displayName)}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-medium text-white">{displayName}</div>
              <div className="truncate text-[11px] text-white/45">{roleLabel}</div>
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label="Sign out"
              className="shrink-0 text-white/50 hover:bg-white/[0.08] hover:text-white"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <StaffHeader
          staffRole={profile.staff_role}
          fullName={displayName}
          roleLabel={roleLabel}
        />
        <main className="flex-1 overflow-x-hidden bg-[#fafafa] p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StaffSidebarNav } from "@/components/layout/staff-sidebar";
import { StaffHeader } from "@/components/layout/staff-header";
import { GlobalSearchDialog } from "@/components/global-search";
import { TideLogo } from "@/components/tide-logo";
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
    <div className="flex min-h-screen flex-1 bg-background">
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-white px-4 py-2 font-semibold text-tide-charcoal focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to main content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-tide-charcoal text-white shadow-[8px_0_32px_rgba(23,23,23,0.06)] md:flex">
        <div className="flex h-[100px] flex-shrink-0 flex-col justify-center gap-2.5 border-b border-white/[0.08] px-5">
          <TideLogo variant="dark" height={32} />
          <div className="truncate text-[10px] font-bold tracking-[0.16em] text-tide-teal uppercase">
            Business &amp; Operations
          </div>
        </div>
        <StaffSidebarNav staffRole={profile.staff_role} />
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-white/[0.08] px-4 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tide-teal/15 text-xs font-bold text-tide-teal ring-1 ring-tide-teal/25">
              {initials(displayName)}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-semibold text-white">{displayName}</div>
              <div className="truncate text-xs text-white/45">{roleLabel}</div>
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

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-60">
        <StaffHeader
          staffRole={profile.staff_role}
          fullName={displayName}
          roleLabel={roleLabel}
        />
        <main id="main-content" className="min-w-0 flex-1 overflow-x-hidden bg-background px-4 py-6 md:px-7 md:py-8 xl:px-10 xl:py-9">{children}</main>
      </div>
      <GlobalSearchDialog />
    </div>
  );
}

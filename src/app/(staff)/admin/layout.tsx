import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, FileCog, Landmark, Settings2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const settingsNav = [
  { href: "/admin", label: "Overview", icon: Settings2 },
  { href: "/admin/users", label: "Users & access", icon: Users },
  { href: "/admin/organisations", label: "Organisations", icon: Building2 },
  { href: "/admin/general", label: "Business details", icon: Landmark },
  { href: "/admin/commercial", label: "Services & terms", icon: Settings2 },
  { href: "/admin/document-types", label: "Document types", icon: FileCog },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("staff_role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.staff_role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 border-b">
        <div className="mb-5">
          <p className="section-label text-tide-teal">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-tide-charcoal">System settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Control account access, client organisations, commercial defaults and system libraries.</p>
        </div>
        <nav aria-label="Administration settings" className="flex gap-1 overflow-x-auto pb-px">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-t-lg border border-b-0 bg-white px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-tide-charcoal">
                <Icon className="size-3.5 text-tide-teal" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}

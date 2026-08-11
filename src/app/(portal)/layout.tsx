import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { TideLogo } from "@/components/tide-logo";
import { EntityReference } from "@/components/entity-reference";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("account_type, full_name, organisations(name, client_reference)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/sign-in");
  if (profile.account_type !== "client") redirect("/dashboard");

  const organisation = profile.organisations as { name: string; client_reference: string } | null;
  const orgName = organisation?.name;

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-4 md:px-8">
        <Link href="/portal" className="flex items-center gap-3">
          <TideLogo variant="light" height={22} />
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
            Client portal{orgName ? ` · ${orgName}` : ""}
          </span>
          <EntityReference label="Client ID" value={organisation?.client_reference} className="hidden sm:inline-flex" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{profile.full_name}</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
              <LogOut className="size-4 text-muted-foreground" />
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}

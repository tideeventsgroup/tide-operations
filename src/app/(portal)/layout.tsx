import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { TideLogo } from "@/components/tide-logo";

export const metadata = {
  title: "Client Portal | Tide Events Group",
  description: "Your Tide Events Group event workspace, documents, approvals and correspondence.",
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("user_profiles")
        .select("account_type, full_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  if (profile?.account_type === "pending") redirect("/account-pending");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-[88px] flex-shrink-0 items-center justify-between border-b border-white/10 bg-tide-charcoal px-5 text-white md:px-8">
        <Link href="/portal" className="flex items-center gap-4">
          <TideLogo variant="dark" height={36} />
          <span className="hidden border-l border-white/15 py-1 pl-4 text-sm font-semibold text-white/65 sm:inline">
            Client portal
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white/60 sm:inline">{profile?.full_name ?? "My account"}</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out" className="text-white/60 hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 md:px-8 md:py-10">{children}</main>
    </div>
  );
}

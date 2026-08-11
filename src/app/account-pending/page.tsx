import { Hourglass } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";

export default function AccountPendingPage() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-warning-bg">
          <Hourglass className="size-5 text-warning" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-tide-charcoal">Account pending</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your account has been created but has no permissions yet. An administrator needs to
          assign you a role before you can access the Tide Business &amp; Operations System.
        </p>
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}

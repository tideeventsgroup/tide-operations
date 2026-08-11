import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold tracking-tight text-tide-charcoal">Sign in</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Staff &amp; client access to the Tide Business &amp; Operations System.
      </p>

      {params.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      )}
      <form action={signIn} className="space-y-4">
        <input type="hidden" name="redirect" value={params.redirect ?? "/dashboard"} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/request-access" className="font-medium text-tide-teal underline underline-offset-4">
          Request access
        </Link>
      </p>
    </AuthShell>
  );
}

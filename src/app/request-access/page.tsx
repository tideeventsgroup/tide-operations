import Link from "next/link";
import { requestAccess } from "@/lib/actions/auth";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function RequestAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold tracking-tight text-tide-charcoal">Request access</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Your account is created with no permissions until an administrator assigns a role.
      </p>

      {params.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      )}
      <form action={requestAccess} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full">
          Request access
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-tide-teal underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

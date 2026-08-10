import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm border-tide-charcoal/10">
        <CardHeader className="space-y-1">
          <div className="mb-2 text-sm font-semibold tracking-wide text-tide-teal uppercase">
            Tide Events Group Scotland
          </div>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>Tide Operations System — staff &amp; client access.</CardDescription>
        </CardHeader>
        <CardContent>
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/request-access" className="text-tide-teal underline underline-offset-4">
              Request access
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

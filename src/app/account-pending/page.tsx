import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md border-tide-charcoal/10 text-center">
        <CardHeader>
          <div className="mb-2 text-sm font-semibold tracking-wide text-tide-teal uppercase">
            Tide Events Group Scotland
          </div>
          <CardTitle className="text-xl">Account pending</CardTitle>
          <CardDescription>
            Your account has been created but has no permissions yet. An administrator needs to
            assign you a role before you can access the Tide Operations System.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

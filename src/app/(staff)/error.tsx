"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-group error boundary. Before this existed, an unhandled server
 * action failure anywhere under (staff) — including every incident/Event
 * Control form — fell through to Next.js's default crash screen with no
 * indication of what happened or whether the in-progress entry was saved.
 */
export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "This page hit an unexpected error. Nothing you entered has been lost from the form, but the last action may not have saved."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}

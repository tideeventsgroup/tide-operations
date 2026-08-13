"use client";

import { useTransition, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { toast } from "sonner";

type ServerAction = (formData: FormData) => Promise<void> | void;

type Props = Omit<ComponentPropsWithoutRef<"form">, "action" | "onSubmit"> & {
  action: ServerAction;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  children: ReactNode;
};

function isRedirectOrRevalidateError(err: unknown): boolean {
  const digest = (err as { digest?: string } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

/**
 * Wraps a server action in a plain `<form>` so a submission always shows the
 * user whether it actually saved. Every incident/Event Control form was
 * previously a bare `<form action={...}>` with no success feedback and no
 * error surface — a failed or successful save was indistinguishable from the
 * screen just sitting there. This is the shared fix.
 */
export function FormWithFeedback({
  action,
  successMessage = "Saved.",
  errorMessage,
  onSuccess,
  children,
  ...formProps
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await action(formData);
        toast.success(successMessage);
        onSuccess?.();
      } catch (err) {
        if (isRedirectOrRevalidateError(err)) throw err;
        const message = err instanceof Error ? err.message : undefined;
        toast.error(message || errorMessage || "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form {...formProps} action={handleSubmit} aria-busy={isPending} data-pending={isPending || undefined}>
      {children}
    </form>
  );
}

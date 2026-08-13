"use client";

import { useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  action: (formData: FormData) => Promise<void> | void;
  fields: Record<string, string>;
  title: string;
  description: string;
  trigger: ReactElement;
  successMessage?: string;
};

/**
 * A destructive server action behind a confirmation step, with the same
 * save-confirmation guarantee as FormWithFeedback. Previously several
 * one-click deletes (starting with task deletion) had neither — a stray
 * click removed a record with no confirmation and no undo.
 */
export function ConfirmDeleteButton({ action, fields, title, description, trigger, successMessage = "Deleted." }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const formData = new FormData();
        for (const [key, value] of Object.entries(fields)) formData.set(key, value);
        await action(formData);
        toast.success(successMessage);
      } catch (err) {
        const digest = (err as { digest?: string } | null)?.digest;
        if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw err;
        toast.error(err instanceof Error ? err.message : "Could not complete the action. Please try again.");
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

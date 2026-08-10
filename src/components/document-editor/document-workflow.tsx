"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { transitionDocument } from "@/lib/actions/documents";

const NEXT_STATUS: Record<string, { status: string; label: string; managerOnly?: boolean }[]> = {
  draft: [{ status: "in_review", label: "Submit for review" }],
  in_review: [
    { status: "approved", label: "Approve", managerOnly: true },
    { status: "needs_updates", label: "Request updates", managerOnly: true },
  ],
  needs_updates: [{ status: "in_review", label: "Resubmit for review" }],
  approved: [{ status: "issued", label: "Issue", managerOnly: true }],
  issued: [{ status: "archived", label: "Archive", managerOnly: true }],
  archived: [],
};

export function DocumentWorkflow({
  documentId,
  status,
  canApprove,
}: {
  documentId: string;
  status: string;
  canApprove: boolean;
}) {
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const options = (NEXT_STATUS[status] ?? []).filter((opt) => !opt.managerOnly || canApprove);

  if (options.length === 0) return null;

  function act(newStatus: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("document_id", documentId);
      formData.set("new_status", newStatus);
      formData.set("comment", comment);
      try {
        await transitionDocument(formData);
        setComment("");
        toast.success("Status updated");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update status");
      }
    });
  }

  return (
    <div className="space-y-2 rounded-md border bg-white p-3">
      <Textarea
        placeholder="Optional comment for this transition…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Button key={opt.status} size="sm" disabled={pending} onClick={() => act(opt.status)}>
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

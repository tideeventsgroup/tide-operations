"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock, FileEdit, PackageCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { transitionDocument } from "@/lib/actions/documents";
import { cn } from "@/lib/utils";

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

const BANNER_STYLES: Record<
  string,
  { bg: string; border: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; iconColor: string; message: string }
> = {
  draft: {
    bg: "bg-muted/60",
    border: "border-border",
    icon: FileEdit,
    iconColor: "text-muted-foreground",
    message: "This document is a draft. Submit it for review when ready.",
  },
  in_review: {
    bg: "bg-warning-bg",
    border: "border-warning/25",
    icon: Clock,
    iconColor: "text-warning",
    message: "Awaiting review. Approve, or send back for updates.",
  },
  needs_updates: {
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    icon: AlertCircle,
    iconColor: "text-destructive",
    message: "Changes were requested. Update the content and resubmit.",
  },
  approved: {
    bg: "bg-info-bg",
    border: "border-info/25",
    icon: CheckCircle2,
    iconColor: "text-info",
    message: "Approved and ready to issue as the controlled version.",
  },
  issued: {
    bg: "bg-success-bg",
    border: "border-success/25",
    icon: PackageCheck,
    iconColor: "text-success",
    message: "Issued — this is the current controlled version.",
  },
  archived: {
    bg: "bg-muted/60",
    border: "border-border",
    icon: FileEdit,
    iconColor: "text-muted-foreground",
    message: "Archived. No further action available.",
  },
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
  const banner = BANNER_STYLES[status] ?? BANNER_STYLES.draft;
  const Icon = banner.icon;

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
    <div className={cn("mb-5 rounded-xl border p-4", banner.bg, banner.border)}>
      <div className="flex items-start gap-2.5">
        <Icon className={cn("mt-0.5 size-[18px] shrink-0", banner.iconColor)} strokeWidth={2} />
        <p className="text-[13.5px] leading-relaxed text-tide-charcoal">{banner.message}</p>
      </div>

      {options.length > 0 && (
        <div className="mt-3 space-y-2.5 border-t border-black/[0.06] pt-3">
          <Textarea
            placeholder="Optional comment for this transition…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="border-black/10 bg-white/70"
          />
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <Button key={opt.status} size="sm" disabled={pending} onClick={() => act(opt.status)}>
                <Send className="size-3.5" />
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

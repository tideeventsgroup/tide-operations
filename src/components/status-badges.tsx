import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STAGE_LABELS: Record<string, string> = {
  enquiry: "Enquiry",
  proposal: "Proposal",
  confirmed: "Confirmed",
  planning: "Planning",
  live: "Live",
  complete: "Complete",
};

const STAGE_STYLES: Record<string, string> = {
  enquiry: "bg-muted text-muted-foreground",
  proposal: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  planning: "bg-sky-100 text-sky-800",
  live: "bg-tide-teal/20 text-tide-teal border-tide-teal",
  complete: "bg-emerald-100 text-emerald-800",
};

export function StageBadge({ stage }: { stage: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", STAGE_STYLES[stage])}>
      {STAGE_LABELS[stage] ?? stage}
    </Badge>
  );
}

const DOC_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  needs_updates: "Needs updates",
  approved: "Approved",
  issued: "Issued",
  archived: "Archived",
};

const DOC_STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-amber-100 text-amber-800",
  needs_updates: "bg-red-100 text-red-800",
  approved: "bg-blue-100 text-blue-800",
  issued: "bg-emerald-100 text-emerald-800",
  archived: "bg-muted text-muted-foreground",
};

export function DocumentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", DOC_STATUS_STYLES[status])}>
      {DOC_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const TASK_STATUS_LABELS: Record<string, string> = {
  to_do: "To do",
  in_progress: "In progress",
  in_review: "In review",
  complete: "Complete",
};

export function TaskStatusBadge({ status }: { status: string }) {
  return <Badge variant="outline">{TASK_STATUS_LABELS[status] ?? status}</Badge>;
}

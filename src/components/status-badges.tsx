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

const MILESTONE_STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  on_track: "On track",
  at_risk: "At risk",
  complete: "Complete",
};

const MILESTONE_STATUS_STYLES: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  on_track: "bg-tide-teal/15 text-tide-teal",
  at_risk: "bg-warning-bg text-warning",
  complete: "bg-success-bg text-success",
};

export function MilestoneStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", MILESTONE_STATUS_STYLES[status])}>
      {MILESTONE_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const CLIENT_REQUEST_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  fulfilled: "Fulfilled",
};

const CLIENT_REQUEST_STATUS_STYLES: Record<string, string> = {
  open: "bg-warning-bg text-warning",
  fulfilled: "bg-success-bg text-success",
};

export function ClientRequestStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", CLIENT_REQUEST_STATUS_STYLES[status])}>
      {CLIENT_REQUEST_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  minor: "Minor",
  moderate: "Moderate",
  serious: "Serious",
  critical: "Critical",
};

const INCIDENT_SEVERITY_STYLES: Record<string, string> = {
  minor: "bg-muted text-muted-foreground",
  moderate: "bg-info-bg text-info",
  serious: "bg-warning-bg text-warning",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export function IncidentSeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", INCIDENT_SEVERITY_STYLES[severity])}>
      {INCIDENT_SEVERITY_LABELS[severity] ?? severity}
    </Badge>
  );
}

const INCIDENT_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  monitoring: "Monitoring",
  resolved: "Resolved",
  closed: "Closed",
};

const INCIDENT_STATUS_STYLES: Record<string, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/30",
  monitoring: "bg-warning-bg text-warning",
  resolved: "bg-info-bg text-info",
  closed: "bg-muted text-muted-foreground",
};

export function IncidentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", INCIDENT_STATUS_STYLES[status])}>
      {INCIDENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const INCIDENT_ACTION_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  blocked: "Blocked",
  complete: "Complete",
  cancelled: "Cancelled",
};

const INCIDENT_ACTION_STYLES: Record<string, string> = {
  open: "bg-info-bg text-info",
  in_progress: "bg-warning-bg text-warning",
  blocked: "bg-destructive/10 text-destructive border-destructive/30",
  complete: "bg-success-bg text-success",
  cancelled: "bg-muted text-muted-foreground",
};

export function IncidentActionStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", INCIDENT_ACTION_STYLES[status])}>
      {INCIDENT_ACTION_LABELS[status] ?? status}
    </Badge>
  );
}

const CONTROL_SESSION_STYLES: Record<string, string> = {
  standby: "bg-muted text-muted-foreground",
  active: "bg-success-bg text-success border-success/30",
  closed: "bg-tide-charcoal/10 text-tide-charcoal",
};

export function ControlSessionBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0 capitalize", CONTROL_SESSION_STYLES[status])}>
      <span className={cn("size-1.5 rounded-full", status === "active" ? "bg-success" : "bg-current/50")} />
      {status}
    </Badge>
  );
}

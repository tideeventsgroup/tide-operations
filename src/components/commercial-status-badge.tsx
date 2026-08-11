import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { humanise } from "@/lib/business";

const styles: Record<string, string> = {
  lead: "bg-muted text-muted-foreground",
  qualified: "bg-info-bg text-info",
  proposal: "bg-warning-bg text-warning",
  negotiation: "border-tide-teal/30 bg-tide-teal/10 text-[#277985]",
  won: "bg-success-bg text-success",
  lost: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info-bg text-info",
  viewed: "border-tide-teal/30 bg-tide-teal/10 text-[#277985]",
  accepted: "bg-success-bg text-success",
  declined: "bg-destructive/10 text-destructive",
  expired: "bg-warning-bg text-warning",
  superseded: "bg-muted text-muted-foreground",
  part_paid: "bg-warning-bg text-warning",
  paid: "bg-success-bg text-success",
  overdue: "bg-destructive/10 text-destructive",
  void: "bg-muted text-muted-foreground",
};

export function CommercialStatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={cn("shrink-0", styles[status])}>{humanise(status)}</Badge>;
}

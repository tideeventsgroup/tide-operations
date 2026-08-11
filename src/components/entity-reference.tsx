import { cn } from "@/lib/utils";

export function EntityReference({
  label,
  value,
  inverse = false,
  className,
}: {
  label: string;
  value: string | null | undefined;
  inverse?: boolean;
  className?: string;
}) {
  if (!value) return null;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center overflow-hidden rounded border font-mono text-[10.5px] font-semibold tracking-wide whitespace-nowrap",
        inverse ? "border-white/20 bg-white/[0.08] text-white" : "border-border bg-muted/55 text-tide-charcoal",
        className,
      )}
    >
      <span className={cn("h-full border-r px-1.5 py-1 font-sans text-[9px] tracking-wider uppercase", inverse ? "border-white/20 text-white/55" : "border-border text-muted-foreground")}>
        {label}
      </span>
      <span className="px-1.5">{value}</span>
    </span>
  );
}

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  neutral: { bg: "bg-muted", icon: "text-muted-foreground" },
  teal: { bg: "bg-tide-teal/12", icon: "text-tide-teal" },
  warning: { bg: "bg-warning-bg", icon: "text-warning" },
  info: { bg: "bg-info-bg", icon: "text-info" },
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href: string;
  tone?: keyof typeof TONE_STYLES;
}) {
  const activeTone = value === 0 || value === "0" ? "neutral" : tone === "neutral" ? "teal" : tone;
  const styles = TONE_STYLES[activeTone];

  return (
    <Link
      href={href}
      className="group relative flex min-h-28 flex-col justify-between overflow-hidden rounded-xl border border-border/90 bg-card p-4 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-tide-teal/45 hover:shadow-[0_8px_24px_rgba(23,23,23,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-3xl leading-none font-semibold tracking-[-0.035em] text-tide-charcoal tabular-nums">
          {value}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", styles.bg)}>
          <Icon className={cn("size-[17px]", styles.icon)} strokeWidth={2} />
        </div>
      </div>
      <div className="text-[13px] leading-5 font-medium text-muted-foreground group-hover:text-tide-charcoal">{label}</div>
    </Link>
  );
}

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
  value: number;
  icon: LucideIcon;
  href: string;
  tone?: keyof typeof TONE_STYLES;
}) {
  const activeTone = value === 0 ? "neutral" : tone === "neutral" ? "teal" : tone;
  const styles = TONE_STYLES[activeTone];

  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-lg border border-border/70 bg-card px-3 py-2.5 transition-colors duration-150 hover:border-tide-teal/40"
    >
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", styles.bg)}>
        <Icon className={cn("size-4", styles.icon)} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-xl leading-none font-bold tracking-tight text-tide-charcoal tabular-nums">
          {value}
        </div>
        <div className="mt-0.5 truncate text-[11.5px] leading-tight text-muted-foreground">{label}</div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListRow({
  href,
  icon: Icon,
  iconTone = "teal",
  title,
  subtitle,
  trailing,
  className,
}: {
  href: string;
  icon: LucideIcon;
  iconTone?: "teal" | "charcoal";
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-accent/40",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          iconTone === "teal" ? "bg-tide-teal/12 text-tide-teal" : "bg-tide-charcoal/8 text-tide-charcoal",
        )}
      >
        <Icon className="size-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-tide-charcoal group-hover:text-tide-charcoal">
          {title}
        </div>
        {subtitle && <div className="truncate text-sm text-muted-foreground">{subtitle}</div>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </Link>
  );
}

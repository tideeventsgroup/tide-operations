"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-tide-teal text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white",
      )}
    >
      {item.label}
    </Link>
  );
}

export function StaffSidebarNav({
  navItems,
  adminItems,
  onNavigate,
}: {
  navItems: NavItem[];
  adminItems: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>
      {adminItems.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
            Admin
          </div>
          {adminItems.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </nav>
  );
}

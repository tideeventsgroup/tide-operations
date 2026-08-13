"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { staffNavItems, visibleAdminNavItems, type NavItem } from "@/lib/nav";
import { GlobalSearchTrigger } from "@/components/global-search";
import type { Database } from "@/lib/supabase/types";

type StaffRole = Database["public"]["Enums"]["staff_role"];

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150",
        active
          ? "bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
          : "text-white/58 hover:bg-white/[0.05] hover:text-white/90",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-tide-teal transition-opacity duration-150",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-[17px] shrink-0 transition-colors duration-150",
          active ? "text-tide-teal" : "text-white/40 group-hover:text-white/70",
        )}
        strokeWidth={2}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function StaffSidebarNav({
  staffRole,
  onNavigate,
}: {
  staffRole: StaffRole | null;
  onNavigate?: () => void;
}) {
  const navItems = staffNavItems;
  const adminItems = visibleAdminNavItems(staffRole);

  return (
    <nav aria-label="Primary navigation" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
      <GlobalSearchTrigger />
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>
      {adminItems.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold tracking-[0.13em] text-white/32 uppercase">
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

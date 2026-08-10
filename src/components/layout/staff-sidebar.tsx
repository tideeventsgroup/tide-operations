"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { staffNavItems, visibleAdminNavItems, type NavItem } from "@/lib/nav";
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
        "group relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors duration-150",
        active
          ? "bg-white/[0.08] text-white"
          : "text-white/55 hover:bg-white/[0.05] hover:text-white/90",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-tide-teal transition-opacity duration-150",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-[15px] shrink-0 transition-colors duration-150",
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
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3">
      <div className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>
      {adminItems.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <div className="px-2.5 pb-1 text-[9.5px] font-semibold tracking-[0.08em] text-white/30 uppercase">
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

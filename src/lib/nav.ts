import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  ListChecks,
  BookOpen,
  Siren,
  BriefcaseBusiness,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const staffNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Business", href: "/business", icon: BriefcaseBusiness },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Incidents", href: "/incidents", icon: Siren },
  { label: "Knowledge Library", href: "/knowledge", icon: BookOpen },
];

export const adminNavItems: NavItem[] = [
  { label: "Admin Settings", href: "/admin", icon: Settings },
];

export function visibleAdminNavItems(staffRole: StaffRole | null) {
  return staffRole === "admin" ? adminNavItems : [];
}

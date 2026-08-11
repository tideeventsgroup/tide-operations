import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  ListChecks,
  BookOpen,
  Users,
  FileCog,
  Siren,
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
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Incidents", href: "/incidents", icon: Siren },
  { label: "Knowledge Library", href: "/knowledge", icon: BookOpen },
];

export const adminNavItems: NavItem[] = [
  { label: "Users & Roles", href: "/admin/users", icon: Users },
  { label: "Document Types", href: "/admin/document-types", icon: FileCog },
];

export function visibleAdminNavItems(staffRole: StaffRole | null) {
  return staffRole === "admin" ? adminNavItems : [];
}

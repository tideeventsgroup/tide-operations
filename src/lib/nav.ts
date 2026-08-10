import type { Database } from "@/lib/supabase/types";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
};

export const staffNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Events", href: "/events" },
  { label: "Clients", href: "/clients" },
  { label: "Tasks", href: "/tasks" },
  { label: "Knowledge Library", href: "/knowledge" },
];

export const adminNavItems: NavItem[] = [
  { label: "Users & Roles", href: "/admin/users" },
  { label: "Template Administration", href: "/admin/templates" },
];

export function visibleAdminNavItems(staffRole: StaffRole | null) {
  return staffRole === "admin" ? adminNavItems : [];
}

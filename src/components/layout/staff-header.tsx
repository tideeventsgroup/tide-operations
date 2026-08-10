"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { StaffSidebarNav } from "@/components/layout/staff-sidebar";
import { signOut } from "@/lib/actions/auth";
import type { NavItem } from "@/lib/nav";

export function StaffHeader({
  navItems,
  adminItems,
  fullName,
  roleLabel,
}: {
  navItems: NavItem[];
  adminItems: NavItem[];
  fullName: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-white px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-tide-charcoal p-0 text-white">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center border-b border-white/10 px-4 text-sm font-semibold tracking-wide text-tide-teal uppercase">
            Tide Ops
          </div>
          <StaffSidebarNav navItems={navItems} adminItems={adminItems} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="text-sm font-semibold text-tide-charcoal">Tide Operations System</div>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          Sign out
        </Button>
      </form>
      <span className="sr-only">{fullName} — {roleLabel}</span>
    </header>
  );
}

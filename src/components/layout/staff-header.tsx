"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { StaffSidebarNav } from "@/components/layout/staff-sidebar";
import { TideLogo } from "@/components/tide-logo";
import { signOut } from "@/lib/actions/auth";
import type { Database } from "@/lib/supabase/types";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export function StaffHeader({
  staffRole,
  fullName,
  roleLabel,
}: {
  staffRole: StaffRole | null;
  fullName: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-[72px] flex-shrink-0 items-center justify-between border-b bg-white px-3 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(19rem,88vw)] border-none bg-tide-charcoal p-0 text-white">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-[100px] flex-col justify-center gap-2.5 border-b border-white/[0.08] px-5">
            <TideLogo variant="dark" height={32} />
            <div className="truncate text-[10px] font-bold tracking-[0.16em] text-tide-teal uppercase">
              Business &amp; Operations
            </div>
          </div>
          <StaffSidebarNav staffRole={staffRole} onNavigate={() => setOpen(false)} />
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] px-4 py-4">
            <span className="truncate text-sm font-medium text-white/70">
              {fullName} <span className="text-white/40">· {roleLabel}</span>
            </span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out" className="text-white/50 hover:bg-white/[0.08] hover:text-white">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      <TideLogo variant="light" height={30} />
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
          <LogOut className="size-4 text-muted-foreground" />
        </Button>
      </form>
    </header>
  );
}

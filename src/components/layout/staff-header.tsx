"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { StaffSidebarNav } from "@/components/layout/staff-sidebar";
import { BrandMark } from "@/components/brand-mark";
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
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-white px-3 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-none bg-tide-charcoal p-0 text-white">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.08] px-4">
            <BrandMark className="size-7 shrink-0" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-bold text-white">Tide Events Group</div>
              <div className="truncate text-[10px] font-semibold tracking-[0.1em] text-tide-teal uppercase">
                Operations System
              </div>
            </div>
          </div>
          <StaffSidebarNav staffRole={staffRole} onNavigate={() => setOpen(false)} />
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] px-4 py-3">
            <span className="truncate text-[13px] text-white/70">
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
      <div className="flex items-center gap-2">
        <BrandMark className="size-6 shrink-0" />
        <span className="text-[13px] font-bold text-tide-charcoal">Tide Operations</span>
      </div>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
          <LogOut className="size-4 text-muted-foreground" />
        </Button>
      </form>
    </header>
  );
}

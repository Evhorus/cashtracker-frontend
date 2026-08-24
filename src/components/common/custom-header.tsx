"use client";
import { AccountMenu } from "@/features/account/components/account-menu";

import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";

// Mobile-only now (see the `md:hidden` below) - desktop nav/branding/theme
// /account moved to dashboard-sidebar.tsx, rendered alongside this in
// dashboard/layout.tsx. Mobile keeps its own top bar since MobileNav only
// covers the bottom tab bar, not branding or account access.
export const CustomHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur md:hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo href="/dashboard" />

        <div className="flex items-center gap-4">
          <ModeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
};

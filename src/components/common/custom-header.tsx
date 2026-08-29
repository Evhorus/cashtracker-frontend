"use client";
import { AccountMenu } from "@/features/account/components/account-menu";

import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import { LocaleToggle } from "@/features/locale/components/locale-toggle";

/**
 * The dashboard's top bar, at every breakpoint.
 *
 * The theme and language toggles live here rather than in the sidebar.
 * They were crammed into the sidebar's 248px header row next to the
 * logo, which is both tight and the wrong place: they are app-wide
 * chrome, not navigation.
 *
 * Branding and account access are duplicated in the sidebar on desktop,
 * so this only renders them below `md` - otherwise the same avatar and
 * the same logo would appear twice on one screen. Above `md` this is a
 * thin bar carrying just the two toggles, which also leaves an obvious
 * home for any future app-wide control.
 *
 * Page titles and per-page actions are NOT here - those belong to
 * PageHeader, rendered by each page inside <main>.
 */
export const CustomHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Sidebar owns the logo on desktop. */}
        <div className="md:hidden">
          <Logo href="/dashboard" />
        </div>

        {/* Pushes the toggles to the right once the logo is gone. */}
        <div className="ml-auto flex items-center gap-4">
          <LocaleToggle />
          <ModeToggle />
          {/* Sidebar owns the account menu on desktop. */}
          <div className="md:hidden">
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_ITEMS } from "./nav-items";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountMenu } from "@/features/account/components/account-menu";
import { useAccountUser } from "@/features/account/hooks/use-account-user";

// Desktop-only persistent nav shell (see dashboard/layout.tsx). Replaces
// custom-header.tsx's pill-nav on desktop entirely - that header is now
// md:hidden, mobile-only, since this covers branding/nav/theme/account for
// desktop instead. CustomHeader sits above the content column at every
// breakpoint and carries the theme/language toggles; mobile also keeps
// MobileNav for the bottom tab bar.
export function DashboardSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { isLoaded, user } = useAccountUser();

  return (
    <aside className="hidden h-full w-62 shrink-0 flex-col border-r border-border/60 bg-card/30 p-4 md:flex">
      {/* Logo only. The theme and language toggles moved to
          CustomHeader - they are app-wide chrome, and three controls in
          a 248px row was tight. */}
      <div className="px-2">
        <Logo href="/dashboard" />
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {isLoaded && user && (
        <div className="mt-auto">
          <AccountMenu
            trigger={
              <button className="flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-card/50 p-2.5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
                <Avatar size="sm" className="shrink-0">
                  <AvatarImage src={user.imageUrl} alt={user.fullName} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            }
          />
        </div>
      )}
    </aside>
  );
}

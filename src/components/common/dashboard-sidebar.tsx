"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesColumn,
  ChevronRight,
  Home,
  Tag,
  UserRound,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountMenu } from "@/features/account/components/account-menu";
import { useAccountUser } from "@/features/account/hooks/use-account-user";

const navItems = [
  { name: "Resumen", href: "/dashboard", icon: Home },
  { name: "Sobres", href: "/dashboard/envelopes", icon: Wallet },
  { name: "Categorías", href: "/dashboard/categories", icon: Tag },
  { name: "Estadísticas", href: "/dashboard/statistics", icon: ChartNoAxesColumn },
  { name: "Cuenta", href: "/dashboard/account", icon: UserRound },
];

// Desktop-only persistent nav shell (see dashboard/layout.tsx). Replaces
// custom-header.tsx's pill-nav on desktop entirely - that header is now
// md:hidden, mobile-only, since this covers branding/nav/theme/account for
// desktop instead. Mobile keeps CustomHeader + MobileNav, unchanged.
export function DashboardSidebar() {
  const pathname = usePathname();
  const { isLoaded, user } = useAccountUser();

  return (
    <aside className="hidden h-full w-62 shrink-0 flex-col border-r border-border/60 bg-card/30 p-4 md:flex">
      <div className="flex items-center justify-between px-2">
        <Logo href="/dashboard" />
        <ModeToggle />
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => {
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
              {item.name}
            </Link>
          );
        })}
      </nav>

      {isLoaded && user && (
        <div className="mt-auto">
          <AccountMenu
            trigger={
              <button className="flex w-full items-center gap-2.5 rounded-xl border border-border/60 bg-card/50 p-2.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
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

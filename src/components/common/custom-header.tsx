"use client";
import Link from "next/link";
import { Home, Wallet } from "lucide-react";
import { AccountMenu } from "@/features/account/components/account-menu";

import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";

import { cn } from "@/lib/utils";

// Same icons/active-state language as MobileNav, just rendered as a
// pill-tab bar instead of a bottom bar - plain text links with a color
// swap read as bare/unfinished next to everything else in the header.
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sobres", href: "/dashboard/envelopes", icon: Wallet },
];

// Only ever rendered inside dashboard/layout.tsx, which already runs
// auth.protect() before this mounts - so unlike the old version, there's
// no "loading"/"signed-out" state to account for here.
export const CustomHeader = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center">
          <Logo href="/dashboard" />
        </div>

        {/* Navigation Center */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-card/50 p-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
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

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
};

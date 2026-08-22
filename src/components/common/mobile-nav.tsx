"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Presupuestos",
      href: "/dashboard/envelopes",
      icon: Wallet,
    },
  ];

  return (
    <div className="pb-safe fixed right-0 bottom-0 left-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur md:hidden">
      <nav className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-6 w-6", isActive && "fill-current")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
      href: "/dashboard/budgets",
      icon: Wallet,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/40 md:hidden pb-safe">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
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

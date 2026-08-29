"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_ITEMS } from "./nav-items";

export const MobileNav = () => {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-4 z-50 flex h-16 items-stretch rounded-2xl border border-border/60 bg-background/90 shadow-lg backdrop-blur md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <span
              className={cn(
                "flex h-7.5 w-7.5 items-center justify-center rounded-full",
                isActive && "bg-primary/15",
              )}
            >
              <item.icon
                className={cn(
                  "h-4.5 w-4.5",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={isActive ? 2.25 : 1.9}
              />
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {t(item.key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

"use client";
import Link from "next/link";
import { Home, Loader2, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";

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

export const CustomHeader = () => {
  const { isLoaded, user } = useUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center">
          <Logo href={user ? "/dashboard" : "/"} />
        </div>

        {/* Navigation Center */}
        {isLoaded && user && (
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
        )}

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <ModeToggle />

          {!isLoaded ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : !user ? (
            <Show when="signed-out">
              <SignInButton>
                <span
                  className={buttonVariants({
                    variant: "outline",
                    size: "default",
                    className: "bg-transparent",
                  })}
                >
                  Iniciar sesión
                </span>
              </SignInButton>
            </Show>
          ) : (
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9",
                  },
                }}
              />
            </Show>
          )}
        </div>
      </div>
    </header>
  );
};

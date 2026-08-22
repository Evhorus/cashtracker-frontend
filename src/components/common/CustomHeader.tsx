"use client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/common/button";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";

import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ModeToggle } from "./mode-toggle";

import { cn } from "@/lib/utils";

export const CustomHeader = () => {
  const { isLoaded, user } = useUser();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Presupuestos", href: "/dashboard/budgets" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Navigation Center */}
        {isLoaded && user && (
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
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

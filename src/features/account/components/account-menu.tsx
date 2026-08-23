"use client";

import Link from "next/link";
import { Loader2, LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccountUser } from "../hooks/use-account-user";

// Replaces Clerk's <UserButton> in custom-header.tsx with a dropdown built
// from our own primitives, "consuming" Clerk only through
// use-account-user.ts - see docs/pending-account-management.md for the
// full reasoning. Only ever rendered once dashboard/layout.tsx has already
// confirmed a session via auth.protect(), but isLoaded still gates the
// brief render before Clerk's client-side user data arrives.
export function AccountMenu() {
  const { isLoaded, user, isSigningOut, signOut } = useAccountUser();

  if (!isLoaded || !user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menú de cuenta"
        render={
          <button className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Avatar>
              <AvatarImage src={user.imageUrl} alt={user.fullName} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </button>
        }
      />
      {/* DropdownMenuContent defaults to w-(--anchor-width) - fine for a
          menu anchored to a normal button, but the trigger here is just
          the avatar, so left alone the popup would clamp to that same
          tiny width and truncate the name/email/wrap "Cerrar sesión". An
          explicit width overrides that. */}
      <DropdownMenuContent align="end" className="w-64">
        {/* Base UI's GroupLabel throws outside a Menu.Group, unlike
            Radix's ungrouped Label - see dropdown-menu.tsx (base-vega
            style). Grouping the identity label with "Mi cuenta" reads
            fine anyway: both are about this account. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
            <span className="truncate text-sm font-medium text-foreground">
              {user.fullName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/dashboard/account" />}>
            <Settings />
            Mi cuenta
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={() => signOut()}
        >
          {isSigningOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

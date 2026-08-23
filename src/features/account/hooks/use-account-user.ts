"use client";

import { useMemo, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

import type { AccountUser } from "../types";

// The only file account-menu.tsx (and anything else that just needs to
// display "who's logged in") needs to know about the auth provider
// through - same reasoning as features/auth/hooks/use-sign-in.ts.
// Read-only: use-update-profile.ts / use-update-password.ts /
// use-delete-account.ts own the mutations.
export function useAccountUser() {
  const { isLoaded, user } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const accountUser = useMemo<AccountUser | null>(() => {
    if (!user) return null;

    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const initials =
      [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() ||
      email[0]?.toUpperCase() ||
      "?";

    return {
      firstName,
      lastName,
      fullName,
      email,
      imageUrl: user.imageUrl,
      initials,
    };
  }, [user]);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await clerkSignOut({ redirectUrl: "/" });
    } finally {
      // Only reached if signOut() itself throws - a successful call
      // navigates away before this line would run.
      setIsSigningOut(false);
    }
  }

  return {
    isLoaded,
    user: accountUser,
    isSigningOut,
    signOut,
  };
}

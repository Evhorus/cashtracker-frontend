"use client";

import { Loader2 } from "lucide-react";

import { useAccountUser } from "../hooks/use-account-user";
import { ProfileSection } from "./profile-section";
import { PasswordSection } from "./password-section";
import { DeleteAccountSection } from "./delete-account-section";

// The single useAccountUser() call lives here so every section below
// re-renders off the same Clerk-managed user object - see
// profile-section.tsx for why that matters for the photo/name updates.
export function AccountView() {
  const { isLoaded, user } = useAccountUser();

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <ProfileSection user={user} />
      <PasswordSection />
      <DeleteAccountSection user={user} />
    </div>
  );
}

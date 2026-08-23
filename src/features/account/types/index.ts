// Provider-agnostic account types. Nothing in this file (or in
// features/account/components/) should ever import an auth SDK directly -
// that's confined to features/account/hooks/, same rule as features/auth/
// (see src/features/auth/types/index.ts).

export interface AccountUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  imageUrl: string;
  initials: string;
}

export interface ProfileFieldErrors {
  firstName?: string;
  lastName?: string;
}

export interface PasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
}

export interface AccountActionResult {
  error: string | null;
}

export interface AccountSession {
  id: string;
  isCurrent: boolean;
  lastActiveAt: Date;
  browser: string;
  device: string;
  location: string;
}

export interface ConnectedAccount {
  id: string;
  /** Clerk's own provider id (e.g. "google") - kept as a plain string
   * since Clerk recognizes many more providers than the two this app's
   * sign-up flow offers (see features/auth/types' narrower
   * OAuthProvider). Used to hide a provider from "connect a new one"
   * once it's already linked. */
  providerId: string;
  label: string;
  identifier: string;
  imageUrl: string;
}

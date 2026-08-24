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

/**
 * Mirrors Clerk's SessionVerificationLevel by value, not by import - same
 * reason every other type in this file mirrors a Clerk shape instead of
 * importing it (see the file-level comment above). use-reverification-
 * gate.ts is the only place that converts a real Clerk level into one of
 * these.
 */
export type ReverificationLevel =
  "first_factor" | "second_factor" | "multi_factor";

/**
 * What ReverificationProvider needs to hand ReverificationDialog to drive
 * one reverification attempt - the `complete`/`cancel` callbacks come
 * straight from Clerk's useReverification(fn, { onNeedsReverification })
 * (see use-reverification-gate.ts), but nothing here reveals that; the
 * dialog itself is provider-agnostic.
 */
export interface ReverificationRequest {
  /** Resolves the original sensitive action so it retries automatically. */
  complete: () => void;
  /** Rejects the original action - called on cancel or on closing the dialog. */
  cancel: () => void;
  level: ReverificationLevel;
}

/**
 * Which credential ReverificationDialog should currently collect, decided
 * by use-reverification-flow.ts once it knows what this account supports
 * (password, if the account has one, otherwise a 6-digit email code).
 */
export type ReverificationFactor =
  { kind: "password" } | { kind: "email_code"; safeIdentifier: string };

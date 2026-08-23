// Provider-agnostic auth types. Nothing in this file (or in
// features/auth/components/) should ever import from an auth SDK
// directly - that's confined to features/auth/hooks/ and
// sso-callback-handler.tsx. Swapping providers later means rewriting
// those, not chasing every place a strategy string or error shape leaked
// into the UI.

export type OAuthProvider = "google" | "facebook";

export interface FieldErrors {
  identifier?: string;
  password?: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
}

export interface AuthActionResult {
  error: string | null;
}

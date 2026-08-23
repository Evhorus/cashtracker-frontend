import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Landing point for the OAuth redirect started from signInWithOAuth()/
// signUpWithOAuth() (use-sign-in.ts / use-sign-up.ts). Unlike those
// hooks, this stays a direct Clerk integration on purpose: Clerk's own
// callback handler already covers every edge case here (transferring an
// OAuth sign-up into a sign-in, existing sessions, MFA, etc.), and
// reimplementing that generically for provider-swap purposes isn't worth
// it - a future provider change touches this one component, not
// anything upstream of it.
export function SSOCallbackHandler() {
  return (
    <AuthenticateWithRedirectCallback
      // Without these, a flow this component can't resolve on its own
      // (e.g. needs more info, needs to transfer) falls back to Clerk's
      // hosted Account Portal (*.accounts.dev) instead of this app's own
      // custom sign-in/up pages - confirmed by hitting that fallback
      // directly.
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}

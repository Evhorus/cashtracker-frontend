import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

interface SSOCallbackHandlerProps {
  /**
   * Where to land once the OAuth flow completes (or fails/gets
   * cancelled) against an existing session - i.e. every case here except
   * a brand-new sign-up. Defaults to "/dashboard" for the sign-in/up
   * callback route; the account-linking callback route
   * (dashboard/account/sso-callback/page.tsx) overrides this so
   * connecting - or cancelling - a provider from the account page lands
   * back on it instead of stranding the user on the dashboard with no
   * sign anything happened. See use-connected-accounts.ts.
   */
  signInFallbackRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
}

// Landing point for the OAuth redirect started from signInWithOAuth()/
// signUpWithOAuth() (use-sign-in.ts / use-sign-up.ts) and from linking a
// new provider on the account page (use-connected-accounts.ts). Unlike
// those hooks, this stays a direct Clerk integration on purpose: Clerk's
// own callback handler already covers every edge case here (transferring
// an OAuth sign-up into a sign-in, existing sessions, MFA, etc.), and
// reimplementing that generically for provider-swap purposes isn't worth
// it - a future provider change touches this one component, not
// anything upstream of it.
export function SSOCallbackHandler({
  signInFallbackRedirectUrl = "/dashboard",
  signUpFallbackRedirectUrl = "/dashboard",
}: SSOCallbackHandlerProps = {}) {
  return (
    <AuthenticateWithRedirectCallback
      // Without these, a flow this component can't resolve on its own
      // (e.g. needs more info, needs to transfer) falls back to Clerk's
      // hosted Account Portal (*.accounts.dev) instead of this app's own
      // custom sign-in/up pages - confirmed by hitting that fallback
      // directly.
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
    />
  );
}

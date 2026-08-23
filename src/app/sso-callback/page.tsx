import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Landing route for the Google/Facebook OAuth redirect started from
// signIn.sso() / signUp.sso() in the sign-in and sign-up pages. Clerk's
// own callback handler covers every edge case here (transferring an
// OAuth sign-up into a sign-in, existing sessions, MFA, etc.) - safer
// than reimplementing it by hand.
export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      // Without these, a flow this component can't resolve on its own
      // (e.g. needs more info, needs to transfer) falls back to Clerk's
      // hosted Account Portal (*.accounts.dev) instead of our own custom
      // sign-in/up pages - confirmed by hitting that fallback directly.
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}

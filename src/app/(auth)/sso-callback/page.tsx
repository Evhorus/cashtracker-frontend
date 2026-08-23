import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Landing route for the Google OAuth redirect started from
// signIn.authenticateWithRedirect() / signUp.authenticateWithRedirect()
// in the sign-in and sign-up pages. Clerk's own callback handler covers
// every edge case here (transferring an OAuth sign-up into a sign-in,
// existing sessions, MFA, etc.) - safer than reimplementing it by hand.
export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}

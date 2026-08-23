"use client";

import { useRouter } from "next/navigation";
import { useSignIn as useClerkSignIn } from "@clerk/nextjs";

import { navigateAfterAuth } from "../lib/navigate-after-auth";
import { toClerkStrategy } from "../lib/oauth-strategy";
import type { OAuthProvider } from "../types";

// The only file the sign-in and forgot-password forms need to know
// about the auth provider through. Swapping providers later means
// rewriting this hook (and use-sign-up.ts / use-forgot-password.ts /
// sso-callback-handler.tsx) - the form components themselves only ever
// call the methods returned here, never touch Clerk directly.
export function useSignIn() {
  const { signIn, errors, fetchStatus } = useClerkSignIn();
  const router = useRouter();

  const isSubmitting = fetchStatus === "fetching";

  async function finalize() {
    await signIn.finalize({
      navigate: (params) => navigateAfterAuth(router, params),
    });
  }

  async function signInWithPassword(emailAddress: string, password: string) {
    const { error } = await signIn.password({ emailAddress, password });
    if (!error && signIn.status === "complete") await finalize();
    // needs_second_factor / needs_client_trust aren't handled yet - the
    // request just won't complete; globalErrors below still surfaces
    // whatever Clerk reports for those.
    return { error };
  }

  async function sendEmailCode(emailAddress: string) {
    const { error } = await signIn.create({ identifier: emailAddress });
    if (error) return { error };
    return signIn.emailCode.sendCode();
  }

  function resendEmailCode() {
    return signIn.emailCode.sendCode();
  }

  async function verifyEmailCode(code: string) {
    const { error } = await signIn.emailCode.verifyCode({ code });
    if (!error && signIn.status === "complete") await finalize();
    return { error };
  }

  async function signInWithOAuth(provider: OAuthProvider) {
    const strategy = toClerkStrategy(provider);

    if (signIn.id) {
      // Known rough edge in Clerk's current hooks: signIn.sso() silently
      // no-ops (resolves with no error, no redirect - reset() doesn't
      // fix it either) when the signIn already has a pending
      // password/email-code attempt on it. signIn.id only gets set once
      // create()/password()/emailCode.sendCode() has actually run, so
      // it's a reliable "is there a prior attempt" check. Calling
      // create() with the new strategy first properly transitions that
      // prior attempt, so the follow-up sso() call actually redirects.
      await signIn.create({
        strategy,
        redirectUrl: "/sso-callback",
        actionCompleteRedirectUrl: "/sso-callback",
      });
    }

    // Both params point at /sso-callback (not straight to /dashboard):
    // on Clerk dev instances the session is synced back via a
    // __clerk_db_jwt query param that client-side JS has to process
    // before the server recognizes the session. A short flow (one
    // already-authorized account) completes that fast enough that
    // redirecting straight to a server-protected route mostly gets away
    // with it; a longer one (choosing between multiple accounts,
    // re-confirming consent) takes longer and loses that race more
    // often. sso-callback-handler.tsx finishes that sync client-side
    // first and only then navigates on its own.
    await signIn.sso({
      strategy,
      redirectUrl: "/sso-callback",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  return {
    isSubmitting,
    fieldErrors: {
      identifier: errors.fields.identifier?.message,
      password: errors.fields.password?.message,
      code: errors.fields.code?.message,
    },
    globalErrors: errors.global?.map((err) => err.message) ?? [],
    signInWithPassword,
    sendEmailCode,
    resendEmailCode,
    verifyEmailCode,
    signInWithOAuth,
    // Password and email-code share the same identifier field - without
    // this, an error from one method (e.g. "no account with that email")
    // stays visually attached to the field after switching to the other
    // method, even though nothing has been submitted there yet.
    clearErrors: () => signIn.reset(),
  };
}

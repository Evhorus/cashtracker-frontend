"use client";

import { useRouter } from "next/navigation";
import { useSignIn as useClerkSignIn } from "@clerk/nextjs";

import { navigateAfterAuth } from "../lib/navigate-after-auth";

// The only file the forgot-password form needs to know about the auth
// provider through - see use-sign-in.ts for the full reasoning. Reuses
// Clerk's signIn resource (password reset is a sign-in variant there),
// but that's an implementation detail this hook hides.
export function useForgotPassword() {
  const { signIn, errors, fetchStatus } = useClerkSignIn();
  const router = useRouter();

  const isSubmitting = fetchStatus === "fetching";
  const needsNewPassword = signIn.status === "needs_new_password";

  async function sendResetCode(emailAddress: string) {
    const { error } = await signIn.create({ identifier: emailAddress });
    if (error) return { error };
    return signIn.resetPasswordEmailCode.sendCode();
  }

  function verifyResetCode(code: string) {
    return signIn.resetPasswordEmailCode.verifyCode({ code });
  }

  async function submitNewPassword(password: string) {
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) return { error };

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: (params) => navigateAfterAuth(router, params),
      });
    }
    return { error: null };
  }

  return {
    isSubmitting,
    needsNewPassword,
    fieldErrors: {
      identifier: errors.fields.identifier?.message,
      code: errors.fields.code?.message,
      password: errors.fields.password?.message,
    },
    globalErrors: errors.global?.map((err) => err.message) ?? [],
    sendResetCode,
    verifyResetCode,
    submitNewPassword,
  };
}

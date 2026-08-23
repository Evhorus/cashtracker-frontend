"use client";

import { useRouter } from "next/navigation";
import { useSignUp as useClerkSignUp } from "@clerk/nextjs";

import { navigateAfterAuth } from "../lib/navigate-after-auth";
import { toClerkStrategy } from "../lib/oauth-strategy";
import type { OAuthProvider } from "../types";

interface SignUpWithPasswordInput {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
}

// The only file the sign-up form needs to know about the auth provider
// through - see use-sign-in.ts for the full reasoning.
export function useSignUp() {
  const { signUp, errors, fetchStatus } = useClerkSignUp();
  const router = useRouter();

  const isSubmitting = fetchStatus === "fetching";

  const awaitingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  async function finalize() {
    await signUp.finalize({
      navigate: (params) => navigateAfterAuth(router, params),
    });
  }

  async function signUpWithPassword({
    firstName,
    lastName,
    emailAddress,
    password,
  }: SignUpWithPasswordInput) {
    const { error } = await signUp.password({
      firstName,
      lastName,
      emailAddress,
      password,
    });
    if (error) return { error };

    return signUp.verifications.sendEmailCode();
  }

  function resendEmailCode() {
    return signUp.verifications.sendEmailCode();
  }

  async function verifyEmailCode(code: string) {
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (!error && signUp.status === "complete") await finalize();
    return { error };
  }

  async function signUpWithOAuth(provider: OAuthProvider) {
    const strategy = toClerkStrategy(provider);

    if (signUp.id) {
      // Same rough edge as sign-in's OAuth buttons - see use-sign-in.ts.
      await signUp.create({ strategy });
    }

    await signUp.sso({
      strategy,
      redirectUrl: "/sso-callback",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  return {
    isSubmitting,
    isComplete: signUp.status === "complete",
    awaitingVerification,
    fieldErrors: {
      firstName: errors.fields.firstName?.message,
      lastName: errors.fields.lastName?.message,
      emailAddress: errors.fields.emailAddress?.message,
      password: errors.fields.password?.message,
      code: errors.fields.code?.message,
    },
    globalErrors: errors.global?.map((err) => err.message) ?? [],
    signUpWithPassword,
    resendEmailCode,
    verifyEmailCode,
    signUpWithOAuth,
  };
}

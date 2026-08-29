"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";

import type { ReverificationFactor, ReverificationRequest } from "../types";
import { mapClerkError } from "./map-clerk-error";

// Type-level-only derivation, same trick as use-sessions.ts's RawSession.
type ClerkSession = NonNullable<ReturnType<typeof useSession>["session"]>;
type SupportedFactor = NonNullable<
  Awaited<
    ReturnType<ClerkSession["startVerification"]>
  >["supportedFirstFactors"]
>[number];

interface ReverificationFlowFieldErrors {
  password?: string;
  code?: string;
}

interface ReverificationFlow {
  factor: ReverificationFactor | null;
  isPreparing: boolean;
  isSubmitting: boolean;
  isResending: boolean;
  fieldErrors: ReverificationFlowFieldErrors;
  globalErrors: string[];
  submitPassword: (password: string) => Promise<void>;
  submitCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
}

/**
 * Drives the real Clerk verification handshake behind ReverificationDialog
 * - the dialog only renders whatever this hook says to render, it never
 * touches `session` itself (see the file-level comment in
 * features/account/types/index.ts for why that boundary matters).
 *
 * Steps, per docs/pending-account-reverification-and-sessions-ui.md:
 * 1. `session.startVerification({ level })` to find out what this account
 *    can verify with (`supportedFirstFactors`).
 * 2. Prefer `password` - one field, no round trip to an inbox. Otherwise
 *    fall back to `email_code`, which needs `prepareFirstFactorVerification`
 *    up front to actually send the email.
 * 3. Whatever the dialog collects goes through
 *    `attemptFirstFactorVerification`. Success calls `request.complete()`,
 *    which makes the original useReverification(fn) call retry itself.
 */
export function useReverificationFlow(
  request: ReverificationRequest | null,
  onSuccess: () => void,
): ReverificationFlow {
  const t = useTranslations("account.errors");
  const { session } = useSession();
  const [factor, setFactor] = useState<ReverificationFactor | null>(null);
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReverificationFlowFieldErrors>(
    {},
  );
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  // A new request (or the dialog closing) always starts from a clean
  // slate. Resetting here during render - not as the first thing inside
  // the effect below - follows React's "adjusting state when a prop
  // changes" pattern (see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes),
  // which is also what keeps that effect from tripping
  // react-hooks/set-state-in-effect (same idea as reload() in
  // use-sessions.ts - setState calls the effect makes should come from
  // its async work, not run unconditionally every time it fires).
  const [prevRequest, setPrevRequest] = useState(request);
  if (request !== prevRequest) {
    setPrevRequest(request);
    setFactor(null);
    setEmailAddressId(null);
    setFieldErrors({});
    setGlobalErrors([]);
  }

  // Derived, not its own state: true exactly while there's a request but
  // startVerification hasn't yet resolved into either a factor to render
  // or a global error to show - see the effect below. Deriving it instead
  // of tracking it separately is also what keeps that effect's own
  // setState calls confined to its async callbacks (see the comment
  // above prevRequest).
  const isPreparing =
    request !== null && factor === null && globalErrors.length === 0;

  useEffect(() => {
    if (!request || !session) return;

    let ignore = false;

    session
      .startVerification({ level: request.level })
      .then(async (result) => {
        if (ignore) return;

        // Already fresh enough by the time the dialog opened - nothing
        // to actually ask the user for.
        if (result.status === "complete") {
          request.complete();
          onSuccess();
          return;
        }

        const supported = result.supportedFirstFactors ?? [];

        if (supported.some((f: SupportedFactor) => f.strategy === "password")) {
          setFactor({ kind: "password" });
          return;
        }

        const emailFactor = supported.find(
          (
            f: SupportedFactor,
          ): f is Extract<SupportedFactor, { strategy: "email_code" }> =>
            f.strategy === "email_code",
        );

        if (emailFactor) {
          await session.prepareFirstFactorVerification({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          if (ignore) return;
          setEmailAddressId(emailFactor.emailAddressId);
          setFactor({
            kind: "email_code",
            safeIdentifier: emailFactor.safeIdentifier,
          });
          return;
        }

        // Out of scope for now (e.g. an account that would need a second
        // factor, or only supports passkey/SSO) - see point 1 of the
        // followup doc, this only covers password/email_code.
        setGlobalErrors([t("noMethodAvailable")]);
      })
      .catch(() => {
        if (!ignore) setGlobalErrors([t("startFailed")]);
      });

    return () => {
      ignore = true;
    };
    // session?.id, not session itself - useSession() (unlike useUser())
    // hands back a new session object every render, so listing the
    // object itself here retriggers this effect (and re-calls
    // startVerification) on every one of the setState calls above,
    // looping forever. Same fix use-sessions.ts already applies to
    // currentSession for the same reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, session?.id, onSuccess]);

  async function attempt(
    params:
      | { strategy: "password"; password: string }
      | { strategy: "email_code"; code: string },
  ) {
    if (!session || !request) return;

    setIsSubmitting(true);
    setFieldErrors({});
    setGlobalErrors([]);
    try {
      const result = await session.attemptFirstFactorVerification(params);
      if (result.status === "complete") {
        request.complete();
        onSuccess();
      } else {
        setGlobalErrors([t("completeFailed")]);
      }
    } catch (err) {
      const { fieldErrors: fields, globalErrors: globals } = mapClerkError(
        err,
        { password: ["password"], code: ["code"] },
        t("unexpected"),
      );
      setFieldErrors(fields);
      setGlobalErrors(globals);
    } finally {
      setIsSubmitting(false);
    }
  }

  function submitPassword(password: string) {
    return attempt({ strategy: "password", password });
  }

  function submitCode(code: string) {
    return attempt({ strategy: "email_code", code });
  }

  async function resendCode() {
    if (!session || !emailAddressId) return;

    setIsResending(true);
    setGlobalErrors([]);
    try {
      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId,
      });
    } catch {
      setGlobalErrors([t("resendFailed")]);
    } finally {
      setIsResending(false);
    }
  }

  return {
    factor,
    isPreparing,
    isSubmitting,
    isResending,
    fieldErrors,
    globalErrors,
    submitPassword,
    submitCode,
    resendCode,
  };
}

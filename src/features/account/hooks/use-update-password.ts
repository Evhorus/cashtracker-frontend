"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";

import type { AccountActionResult, PasswordFieldErrors } from "../types";
import { mapClerkError } from "./map-clerk-error";
import { useReverificationGate } from "./use-reverification-gate";

// Password changes are a sensitive action per Clerk's own guidance
// (https://clerk.com/docs/guides/secure/reverification), so the actual
// updatePassword() call is wrapped in useReverification(). Passing
// onNeedsReverification opts out of Clerk's own reverification modal -
// ReverificationDialog (our own UI, rendered by ReverificationProvider)
// asks for it instead. See use-reverification-gate.ts.
export function useUpdatePassword() {
  const t = useTranslations("account.errors");
  const { user } = useUser();
  const onNeedsReverification = useReverificationGate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PasswordFieldErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const updatePasswordWithReverification = useReverification(
    (params: { currentPassword: string; newPassword: string }) =>
      user?.updatePassword({
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
        signOutOfOtherSessions: true,
      }),
    { onNeedsReverification },
  );

  async function updatePassword(values: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AccountActionResult> {
    if (!user) return { error: t("noSession") };

    setIsUpdating(true);
    setFieldErrors({});
    setGlobalErrors([]);
    try {
      await updatePasswordWithReverification(values);
      return { error: null };
    } catch (err) {
      if (isReverificationCancelledError(err)) {
        // User closed Clerk's reverification modal - not a form error,
        // there's nothing to show inline.
        return { error: null };
      }

      const { fieldErrors: fields, globalErrors: globals } = mapClerkError(
        err,
        {
          currentPassword: ["current_password", "currentPassword"],
          newPassword: ["password", "new_password", "newPassword"],
        },
        t("unexpected"),
      );
      setFieldErrors(fields);
      setGlobalErrors(globals);
      return { error: globals[0] ?? t("passwordUpdateFailed") };
    } finally {
      setIsUpdating(false);
    }
  }

  return { isUpdating, fieldErrors, globalErrors, updatePassword };
}

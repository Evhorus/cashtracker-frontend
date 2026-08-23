"use client";

import { useState } from "react";
import { useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";

import type { AccountActionResult, PasswordFieldErrors } from "../types";
import { mapClerkError } from "./map-clerk-error";

// Password changes are a sensitive action per Clerk's own guidance
// (https://clerk.com/docs/guides/secure/reverification), so the actual
// updatePassword() call is wrapped in useReverification() - Clerk shows
// its own modal asking the user to re-enter their password before the
// call goes through, no custom UI needed here.
export function useUpdatePassword() {
  const { user } = useUser();
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
  );

  async function updatePassword(values: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AccountActionResult> {
    if (!user) return { error: "No hay una sesión activa" };

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
      );
      setFieldErrors(fields);
      setGlobalErrors(globals);
      return { error: globals[0] ?? "No se pudo actualizar la contraseña" };
    } finally {
      setIsUpdating(false);
    }
  }

  return { isUpdating, fieldErrors, globalErrors, updatePassword };
}

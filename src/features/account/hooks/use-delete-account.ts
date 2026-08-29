"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";

import type { AccountActionResult } from "../types";
import { mapClerkError } from "./map-clerk-error";
import { useReverificationGate } from "./use-reverification-gate";

// Destructive and irreversible, so - like use-update-password.ts - the
// actual delete() call goes through useReverification() rather than
// trusting a still-fresh session alone. Same onNeedsReverification gate
// as that hook - see use-reverification-gate.ts.
export function useDeleteAccount() {
  const t = useTranslations("account.errors");
  const { user } = useUser();
  const router = useRouter();
  const onNeedsReverification = useReverificationGate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteWithReverification = useReverification(() => user?.delete(), {
    onNeedsReverification,
  });

  async function deleteAccount(): Promise<AccountActionResult> {
    if (!user) return { error: t("noSession") };

    setIsDeleting(true);
    setError(null);
    try {
      await deleteWithReverification();
      router.push("/");
      // Not resetting isDeleting here on purpose - same as
      // use-account-user.ts's signOut(), the navigation above unmounts
      // this component before it would matter.
      return { error: null };
    } catch (err) {
      setIsDeleting(false);

      if (isReverificationCancelledError(err)) {
        // User closed the reverification modal - not a real error.
        return { error: null };
      }

      const { globalErrors } = mapClerkError(err, {}, t("unexpected"));
      const message = globalErrors[0] ?? "No se pudo eliminar la cuenta";
      setError(message);
      return { error: message };
    }
  }

  return { isDeleting, error, deleteAccount };
}

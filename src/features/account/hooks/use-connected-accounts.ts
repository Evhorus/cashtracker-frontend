"use client";

import { useEffect, useState } from "react";
import { useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";

import { toClerkStrategy } from "@/features/auth/lib/oauth-strategy";
import type { OAuthProvider } from "@/features/auth/types";

import type { ConnectedAccount } from "../types";
import { useReverificationGate } from "./use-reverification-gate";

// Reuses features/auth's OAuthProvider type and Clerk-strategy mapping -
// "which OAuth providers this app offers" is one list, not two: the same
// Google/Facebook buttons that start a sign-up (oauth-buttons.tsx) start
// linking a provider to an already-signed-in user here instead.
export function useConnectedAccounts() {
  const { user } = useUser();
  const onNeedsReverification = useReverificationGate();
  const [connectingProvider, setConnectingProvider] =
    useState<OAuthProvider | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // externalAccounts is part of the reactive user object (like
  // emailAddresses) - no separate fetch needed, unlike use-sessions.ts.
  // Denying/cancelling the provider's consent screen doesn't stop Clerk
  // from creating the ExternalAccount record - it just leaves it
  // "unverified" with an error attached (e.g. oauth_access_denied) and
  // no email/identifier ever filled in. Left in, that's a permanent
  // broken entry that reads as "connected" with nothing to show, and
  // blocks reconnecting that same provider since connected-accounts-
  // section.tsx hides providers it already sees as linked. The cleanup
  // effect below destroys these as soon as they show up; filtering them
  // out here too means the broken entry never renders even in the one
  // render before that destroy() resolves.
  const connectedAccounts: ConnectedAccount[] = (user?.externalAccounts ?? [])
    .filter((account) => account.verification?.status !== "unverified")
    .map((account) => ({
      id: account.id,
      providerId: account.provider,
      label: account.providerTitle(),
      identifier: account.accountIdentifier() || account.emailAddress,
      imageUrl: account.imageUrl,
    }));

  useEffect(() => {
    const failed = (user?.externalAccounts ?? []).filter(
      (account) => account.verification?.status === "unverified",
    );
    // Swallow errors - this is best-effort garbage collection, not a
    // user-facing action, so a failed destroy() here shouldn't surface
    // as this hook's `error`. Worst case the broken entry lingers
    // (invisible either way, filtered out above) and this retries next
    // time externalAccounts changes.
    failed.forEach((account) => void account.destroy().catch(() => {}));
  }, [user?.externalAccounts]);

  // Linking a new provider is a sensitive action per Clerk's own
  // guidance, same reasoning (and same onNeedsReverification gate) as
  // use-update-password.ts. redirectUrl points at the account-scoped
  // callback route (dashboard/account/sso-callback/page.tsx), not the
  // sign-in/up one at /sso-callback - that one falls back to the plain
  // dashboard, which left the user stranded there with no sign the
  // linking attempt happened at all if it failed or got cancelled on the
  // provider's own screen.
  const createExternalAccountWithReverification = useReverification(
    (strategy: "oauth_google" | "oauth_facebook") =>
      user?.createExternalAccount({
        strategy,
        redirectUrl: "/dashboard/account/sso-callback",
      }),
    { onNeedsReverification },
  );

  async function connectProvider(provider: OAuthProvider) {
    if (!user) return;

    setConnectingProvider(provider);
    setError(null);
    try {
      const externalAccount = await createExternalAccountWithReverification(
        toClerkStrategy(provider),
      );
      const redirectUrl =
        externalAccount?.verification?.externalVerificationRedirectURL;

      if (!redirectUrl) {
        setError("No se pudo iniciar la conexión con el proveedor");
        setConnectingProvider(null);
        return;
      }

      // Full navigation, not router.push() - this hands off to the
      // provider's own consent screen, same as
      // use-sign-in.ts's signInWithOAuth(). Deliberately not resetting
      // connectingProvider here: the page is about to leave anyway, and
      // sso-callback-handler.tsx brings the user back once linking
      // completes.
      window.location.href = redirectUrl.toString();
    } catch (err) {
      setConnectingProvider(null);
      if (!isReverificationCancelledError(err)) {
        setError("No se pudo conectar la cuenta");
      }
    }
  }

  async function disconnectAccount(id: string) {
    const account = user?.externalAccounts.find((a) => a.id === id);
    if (!account) return;

    setDisconnectingId(id);
    setError(null);
    try {
      await account.destroy();
    } catch {
      setError("No se pudo desconectar la cuenta");
    } finally {
      setDisconnectingId(null);
    }
  }

  return {
    connectedAccounts,
    connectingProvider,
    disconnectingId,
    error,
    connectProvider,
    disconnectAccount,
  };
}

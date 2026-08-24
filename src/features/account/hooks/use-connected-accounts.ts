"use client";

import { useState } from "react";
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
  const connectedAccounts: ConnectedAccount[] = (
    user?.externalAccounts ?? []
  ).map((account) => ({
    id: account.id,
    providerId: account.provider,
    label: account.providerTitle(),
    identifier: account.accountIdentifier() || account.emailAddress,
    imageUrl: account.imageUrl,
  }));

  // Linking a new provider is a sensitive action per Clerk's own
  // guidance, same reasoning (and same onNeedsReverification gate) as
  // use-update-password.ts.
  const createExternalAccountWithReverification = useReverification(
    (strategy: "oauth_google" | "oauth_facebook") =>
      user?.createExternalAccount({ strategy, redirectUrl: "/sso-callback" }),
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

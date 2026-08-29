"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";

import type { AccountSession } from "../types";

// Type-level-only derivation so this file doesn't need an extra import
// just for the shape of one array element - @clerk/nextjs re-exports
// hooks, not every resource type by name.
type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;
type RawSession = Awaited<ReturnType<ClerkUser["getSessions"]>>[number];

function toAccountSession(
  session: RawSession,
  currentSessionId: string | undefined,
): AccountSession {
  const { latestActivity } = session;
  return {
    id: session.id,
    isCurrent: session.id === currentSessionId,
    lastActiveAt: session.lastActiveAt,
    browser:
      [latestActivity.browserName, latestActivity.browserVersion]
        .filter(Boolean)
        .join(" ") || null,
    isMobile: Boolean(latestActivity.isMobile),
    location:
      [latestActivity.city, latestActivity.country]
        .filter(Boolean)
        .join(", ") || null,
  };
}

// Clerk's own "connected devices" panel: user.getSessions() lists every
// active session across every device/browser for this account - not to
// be confused with useSessionList(), which only covers Clerk's
// multi-account-in-one-browser feature. Not part of the reactive user
// object the way externalAccounts is, so this hook owns its own
// fetch/refetch instead of just deriving from useUser().
export function useSessions() {
  const t = useTranslations("account.errors");
  const { user } = useUser();
  const { session: currentSession } = useSession();
  const [sessions, setSessions] = useState<AccountSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  // Bumping this re-runs the effect below - lets reload() live outside
  // the effect (see revokeSession()) instead of the effect calling a
  // function that sets state as its first synchronous statement, which
  // react-hooks/set-state-in-effect flags.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    user
      .getSessions()
      .then((raw) => {
        if (ignore) return;
        setSessions(
          raw
            .map((session) => toAccountSession(session, currentSession?.id))
            // Current device first - it's the one thing the user always
            // wants to confirm is actually "this one".
            .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent)),
        );
      })
      .catch(() => {
        if (!ignore) setError(t("loadFailed"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [user, currentSession?.id, reloadToken, t]);

  function reload() {
    setIsLoading(true);
    setError(null);
    setReloadToken((n) => n + 1);
  }

  async function revokeSession(sessionId: string) {
    if (!user) return;

    setRevokingId(sessionId);
    setError(null);
    try {
      // getSessions() again rather than caching the raw resources from
      // the last load - `revoke()` lives on the resource itself, and
      // AccountSession (the mapped, exported shape) deliberately doesn't
      // carry it.
      const raw = await user.getSessions();
      const target = raw.find((session) => session.id === sessionId);
      await target?.revoke();
      reload();
    } catch {
      setError(t("revokeFailed"));
    } finally {
      setRevokingId(null);
    }
  }

  return { sessions, isLoading, error, revokingId, revokeSession };
}

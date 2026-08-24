"use client";

import { createContext, useContext } from "react";
import { useReverification } from "@clerk/nextjs";

import type { ReverificationRequest } from "../types";

// Type-level-only derivation, same trick as use-sessions.ts's RawSession -
// gets at the shape of useReverification's onNeedsReverification argument
// without needing Clerk to export it under its own name.
type ReverificationOptions = NonNullable<
  Parameters<typeof useReverification>[1]
>;
type OnNeedsReverification = NonNullable<
  ReverificationOptions["onNeedsReverification"]
>;
type NeedsReverificationParameters = Parameters<OnNeedsReverification>[0];

type OpenReverificationDialog = (request: ReverificationRequest) => void;

// Not exported outside features/account/ - reverification-provider.tsx
// (the only Provider) and this file (the only Consumer factory, below)
// are the two things allowed to touch it directly.
export const ReverificationGateContext =
  createContext<OpenReverificationDialog | null>(null);

/**
 * The 3 sensitive-action hooks (use-update-password, use-delete-account,
 * use-connected-accounts) each call this to get the
 * `onNeedsReverification` handler to pass into their own
 * useReverification(fn, { onNeedsReverification }) call - passing that
 * option at all is what opts out of Clerk's own reverification modal, in
 * favor of the shared ReverificationDialog that ReverificationProvider
 * (mounted once in account-view.tsx) renders instead. See
 * docs/pending-account-reverification-and-sessions-ui.md, point 1, for
 * the full reasoning and the Clerk API this is built on.
 */
export function useReverificationGate(): OnNeedsReverification {
  const openReverificationDialog = useContext(ReverificationGateContext);

  if (!openReverificationDialog) {
    throw new Error(
      "useReverificationGate must be used within a ReverificationProvider - is account-view.tsx missing it?",
    );
  }

  return ({ complete, cancel, level }: NeedsReverificationParameters) => {
    openReverificationDialog({
      complete,
      cancel,
      // Clerk types this as possibly undefined; every action this app
      // guards is a first-factor-level one in practice, so that's the
      // sane fallback if it's ever missing.
      level: level ?? "first_factor",
    });
  };
}

"use client";

import { useCallback, useState } from "react";

import { ReverificationGateContext } from "../hooks/use-reverification-gate";
import type { ReverificationRequest } from "../types";
import { ReverificationDialog } from "./reverification-dialog";

interface ReverificationProviderProps {
  children: React.ReactNode;
}

/**
 * Mounted once in account-view.tsx, above every section that can trigger
 * Clerk reverification (password change, account deletion, connecting a
 * new OAuth provider). Owns the one pending request at a time and renders
 * the single shared ReverificationDialog for it, instead of each of those
 * 3 sections owning its own copy - see use-reverification-gate.ts for how
 * they reach this.
 */
export function ReverificationProvider({
  children,
}: ReverificationProviderProps) {
  const [request, setRequest] = useState<ReverificationRequest | null>(null);

  const openReverificationDialog = useCallback(
    (next: ReverificationRequest) => {
      setRequest(next);
    },
    [],
  );

  // Stable identity - it's a dependency of useReverificationFlow's own
  // effect (via ReverificationDialog), so a fresh function every render
  // would re-run that effect (and re-call session.startVerification) any
  // time this provider re-renders for an unrelated reason.
  const handleSuccess = useCallback(() => setRequest(null), []);

  function handleOpenChange(open: boolean) {
    if (open) return;
    // Any close that isn't the success path above is a cancellation - Esc,
    // a backdrop click, or the dialog's own Cancel button all funnel
    // through Base UI's onOpenChange(false).
    request?.cancel();
    setRequest(null);
  }

  return (
    <ReverificationGateContext.Provider value={openReverificationDialog}>
      {children}
      <ReverificationDialog
        request={request}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
      />
    </ReverificationGateContext.Provider>
  );
}

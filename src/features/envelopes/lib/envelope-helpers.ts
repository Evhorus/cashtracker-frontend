import type { Envelope } from "../types";

/**
 * Helper functions to work with Envelope amounts as numbers, and to derive
 * the spending-limit progress status (verde/ámbar/rojo/sin límite).
 *
 * An envelope's `amount` is a soft limit, not a hard cap: going over it is
 * allowed and only surfaces as a visual warning (this is the same pattern
 * YNAB/Goodbudget/Mint use for envelope/category budgets) - nothing here
 * blocks any action, it's purely informational.
 */

export type EnvelopeProgressStatus =
  "unlimited" | "normal" | "warning" | "exceeded";

// Percentage of the limit at which the progress indicator switches from
// "normal" to "warning" (early heads-up before actually going over).
export const ENVELOPE_WARNING_THRESHOLD = 0.8;

/**
 * The "Todos / Activos / Excedidos / Sin límite" tabs on the Sobres list
 * (mockup: MobileEnvelopes/DesktopEnvelopes), plus "En alerta" (not in
 * the mockup - added so the Resumen page's "Sobres en alerta" widget has
 * somewhere real to deep-link its "Ver todos" to). Distinct from
 * EnvelopeProgressStatus:
 * - "active" merges "normal" and "warning" (both "a limited envelope
 *   that isn't over yet"), a courser grouping than the 3-color progress
 *   indicator needs.
 * - "alert" merges "warning" and "exceeded" (both "needs your
 *   attention") - it overlaps "active" and "exceeded" rather than
 *   partitioning the list the way the other four tabs do, same as
 *   Resumen's own "en alerta" count already does.
 */
export type EnvelopeStatusFilter =
  | "all"
  | "active"
  | "alert"
  | "exceeded"
  | "unlimited";

export const ENVELOPE_STATUS_FILTERS: {
  value: EnvelopeStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "alert", label: "En alerta" },
  { value: "exceeded", label: "Excedidos" },
  { value: "unlimited", label: "Sin límite" },
];

export const EnvelopeHelpers = {
  /**
   * Get envelope amount as a number, or null if this envelope has no
   * spending limit (unlimited running counter).
   */
  getAmount: (envelope: Envelope): number | null =>
    envelope.amount === null ? null : Number(envelope.amount),

  /**
   * Get envelope spent as number for calculations
   */
  getSpent: (envelope: Envelope): number => Number(envelope.spent),

  /**
   * Calculate remaining amount. Returns null for unlimited envelopes -
   * there's no "remaining" concept without a limit.
   */
  getRemaining: (envelope: Envelope): number | null => {
    if (envelope.amount === null) return null;
    return Number(envelope.amount) - Number(envelope.spent);
  },

  /**
   * Calculate percentage spent. Returns null for unlimited envelopes.
   */
  getPercentage: (envelope: Envelope): number | null => {
    if (envelope.amount === null) return null;
    return (Number(envelope.spent) / Number(envelope.amount)) * 100;
  },

  /**
   * Derive the progress status used to color the progress bar / badge:
   * - "unlimited": no amount set, no bar shown, just the running total.
   * - "normal": spent below the warning threshold.
   * - "warning": spent at/above the warning threshold but not over yet.
   * - "exceeded": spent past the limit - allowed, just flagged in red.
   */
  getProgressStatus: (envelope: Envelope): EnvelopeProgressStatus => {
    if (envelope.amount === null) return "unlimited";

    const amount = Number(envelope.amount);
    const spent = Number(envelope.spent);
    if (amount <= 0) return spent > 0 ? "exceeded" : "normal";

    const ratio = spent / amount;
    if (ratio > 1) return "exceeded";
    if (ratio >= ENVELOPE_WARNING_THRESHOLD) return "warning";
    return "normal";
  },

  /** Whether an envelope belongs under one of the status filter tabs. */
  matchesStatusFilter: (
    envelope: Envelope,
    filter: EnvelopeStatusFilter,
  ): boolean => {
    if (filter === "all") return true;
    const status = EnvelopeHelpers.getProgressStatus(envelope);
    if (filter === "unlimited") return status === "unlimited";
    if (filter === "exceeded") return status === "exceeded";
    // "alert": same warning-or-exceeded test the Resumen page's own "en
    // alerta" count/widget use (dashboard/page.tsx's alertEnvelopes).
    if (filter === "alert") return status === "warning" || status === "exceeded";
    // "active": has a limit and hasn't gone over it yet.
    return status === "normal" || status === "warning";
  },
};

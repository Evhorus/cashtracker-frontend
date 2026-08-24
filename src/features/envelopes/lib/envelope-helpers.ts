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
 * (mockup: MobileEnvelopes/DesktopEnvelopes). Distinct from
 * EnvelopeProgressStatus - "active" here merges "normal" and "warning"
 * (both are "a limited envelope that isn't over yet"), which is a courser
 * grouping than the 3-color progress indicator needs.
 */
export type EnvelopeStatusFilter = "all" | "active" | "exceeded" | "unlimited";

export const ENVELOPE_STATUS_FILTERS: {
  value: EnvelopeStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
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
    // "active": has a limit and hasn't gone over it yet.
    return status === "normal" || status === "warning";
  },
};

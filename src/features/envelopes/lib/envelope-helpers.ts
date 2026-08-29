import type { Envelope } from "../types";

/**
 * Helper functions to work with Envelope amounts as numbers, and to map
 * a spending status to how it's presented (green/amber/red/no limit).
 *
 * The status itself is NOT derived here any more - the API reports it
 * (`envelope.status`), so the 80% threshold and its edge cases live in
 * one place instead of being reimplemented by every client. See
 * src/envelopes/utils/envelope-status.ts in cashtracker-backend. What
 * stays here is presentation: colour classes. The status *words*
 * aren't here either - they're translations (`envelopes.status.*`),
 * looked up by EnvelopeStatusBadge at the point of render.
 *
 * An envelope's `amount` is a soft limit, not a hard cap: going over it is
 * allowed and only surfaces as a visual warning (this is the same pattern
 * YNAB/Goodbudget/Mint use for envelope/category budgets) - nothing here
 * blocks any action, it's purely informational.
 */

export type EnvelopeProgressStatus =
  "unlimited" | "normal" | "warning" | "exceeded";

/**
 * What `?status=` accepts: "all", any single status, or `alert` - the
 * warning-or-exceeded union the summary page fetches for its
 * needs-attention widget, which is a query rather than something a user
 * picks.
 *
 * `active` (normal + warning) used to be here too and is gone. It was a
 * union nothing consumed, and no word could name it honestly: an
 * envelope is never activated or deactivated, so "Activos" described
 * nothing a user does.
 */
export type EnvelopeStatusFilter = "all" | EnvelopeProgressStatus | "alert";

/**
 * The tab bar, in order: "all", one tab per status, then `alert`.
 *
 * The statuses in the middle are labelled with their own words
 * (`envelopes.status.*`), which is what stopped this screen showing two
 * vocabularies - tabs reading "Activos"/"En alerta" above rows whose
 * badges read "Controlado"/"En riesgo".
 *
 * `alert` is last and deliberately not named after a status: it is the
 * warning-or-exceeded union, and its label says what it is for
 * ("Necesitan atención") rather than claiming to be a state. It earns
 * its place by being the summary page's destination - that page counts
 * these envelopes and lists the worst of them, and without a tab there
 * was nowhere for the reader to go from there. `active` (normal +
 * warning) had no such need and is gone: no destination, and no word
 * described it, since an envelope is never activated or deactivated.
 */
export const ENVELOPE_STATUS_TAB_VALUES = [
  "all",
  "normal",
  "warning",
  "exceeded",
  "unlimited",
  "alert",
] as const satisfies readonly EnvelopeStatusFilter[];

/** A tab, as opposed to any filter the API accepts. */
export type EnvelopeStatusTab = (typeof ENVELOPE_STATUS_TAB_VALUES)[number];

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
   * Text color for a progress status - the envelope detail page's spent
   * figure, the expense detail page's envelope-health color, and
   * envelope-card.tsx's amount all used to hand-roll this same 3-way
   * (4-way counting "unlimited") ternary independently, which is how the
   * expense detail page ended up using a different "healthy" color
   * (emerald-500) than the other two (primary) - same status, different
   * color, purely from copy-paste drift. One function now, so a new
   * status color only ever needs to change here.
   */
  getStatusTextColorClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "text-destructive";
      case "warning":
        return "text-amber-500";
      case "unlimited":
        return "text-muted-foreground";
      case "normal":
        return "text-primary";
    }
  },

  /**
   * Same status -> color mapping as `getStatusTextColorClass`, but
   * targeting Progress's actual filled bar (Progress renders
   * Root > Track > Indicator, so the indicator is a grandchild, not a
   * direct child - a plain `[&>div]` only ever reaches the Track and
   * never recolors the fill itself). A separate function because the
   * output shape genuinely differs per consumer (a selector here vs. a
   * bare text-color class there), not because the underlying 3-way
   * status logic does.
   */
  getStatusProgressBarColorClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "[&_[data-slot=progress-indicator]]:bg-destructive";
      case "warning":
        return "[&_[data-slot=progress-indicator]]:bg-amber-500";
      default:
        return "[&_[data-slot=progress-indicator]]:bg-primary";
    }
  },

  /**
   * Same status -> color mapping again, this time as a bare `bg-*` class
   * for a plain div-based bar (envelopes-table.tsx's desktop row) - no
   * Progress primitive there to target an indicator selector on.
   */
  getStatusBarColorClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "bg-destructive";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-primary";
    }
  },

  /**
   * Tinted pill background+text pair for a status badge (envelopes-table.tsx's
   * desktop status column) - a softer, badge-appropriate tint rather
   * than the bare text color `getStatusTextColorClass` returns for
   * plain colored text elsewhere.
   */
  getStatusBadgeClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "bg-destructive/10 text-destructive";
      case "warning":
        return "bg-amber-500/10 text-amber-500";
      case "unlimited":
        return "bg-muted text-muted-foreground";
      case "normal":
        return "bg-primary/10 text-primary";
    }
  },
};

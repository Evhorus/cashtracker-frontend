import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { Envelope } from "@/features/envelopes/types";
import type { DashboardSummary } from "../schemas/dashboard.schema";

/**
 * Derivations the Resumen page renders but shouldn't be computing
 * inline. Pure functions over already-fetched data - no React, no
 * fetching - so they're independently readable and testable, which the
 * same logic embedded in a 260-line async component was not.
 */

export interface AlertEnvelope {
  envelope: Envelope;
  status: "warning" | "exceeded";
  percentage: number;
}

/**
 * Envelopes that need attention - at/over the warning threshold or
 * already past their limit - worst first. Same warning-or-exceeded test
 * as the "En alerta" tab on the envelopes list
 * (EnvelopeHelpers.matchesStatusFilter with "alert"), so the count here
 * and the list that tab shows can't drift apart.
 */
export function getAlertEnvelopes(envelopes: Envelope[]): AlertEnvelope[] {
  return envelopes
    .map((envelope) => ({
      envelope,
      status: EnvelopeHelpers.getProgressStatus(envelope),
      percentage: EnvelopeHelpers.getPercentage(envelope) ?? 0,
    }))
    .filter(
      (entry): entry is AlertEnvelope =>
        entry.status === "warning" || entry.status === "exceeded",
    )
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Month-over-month change in "disponible", from the last two entries of
 * the summary's own monthly chart. Returns null when there aren't two
 * months yet, or when the earlier month was exactly 0 (any change from
 * zero is an infinite percentage, not a number worth showing) - the
 * caller renders nothing rather than a fabricated figure.
 *
 * Only meaningful for `summary.chartCurrency`: the chart is scoped to a
 * single currency, so this must never be shown against a total in a
 * different one.
 */
export function getMonthOverMonthDelta(
  chart: DashboardSummary["chart"],
): number | null {
  const lastTwoMonths = chart.slice(-2);
  if (lastTwoMonths.length !== 2) return null;

  const [previous, current] = lastTwoMonths;
  if (previous.available === 0) return null;

  return (
    ((current.available - previous.available) / Math.abs(previous.available)) *
    100
  );
}

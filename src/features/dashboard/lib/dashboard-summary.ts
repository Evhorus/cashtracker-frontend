import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { Envelope } from "@/features/envelopes/types";

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
 * (warning or exceeded), so the count here
 * and the list that tab shows can't drift apart.
 */
export function getAlertEnvelopes(envelopes: Envelope[]): AlertEnvelope[] {
  return envelopes
    .map((envelope) => ({
      envelope,
      status: envelope.status,
      percentage: EnvelopeHelpers.getPercentage(envelope) ?? 0,
    }))
    .filter(
      (entry): entry is AlertEnvelope =>
        entry.status === "warning" || entry.status === "exceeded",
    )
    .sort((a, b) => b.percentage - a.percentage);
}

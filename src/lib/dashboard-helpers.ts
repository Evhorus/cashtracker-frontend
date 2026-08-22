import type { Envelope } from "@/features/envelopes/types";

/**
 * Aggregate calculations for dashboard.
 *
 * Envelopes without a spending limit (amount === null) are excluded from
 * the "total budget"/"total remaining" aggregates and from the chart's
 * "Total" bar - there's no limit to add up, and including them as 0 would
 * misrepresent them as having a $0 budget instead of no cap at all. Their
 * spent amount still counts toward totalSpent.
 */
export const DashboardHelpers = {
  /**
   * Sum of spending limits across all capped envelopes (unlimited
   * envelopes don't contribute - they have no limit to add up).
   */
  getTotalAmount: (envelopes: Envelope[]): number => {
    return envelopes.reduce(
      (sum, e) => sum + (e.amount === null ? 0 : Number(e.amount)),
      0,
    );
  },

  /**
   * Calculate total spent across all envelopes (capped and unlimited).
   */
  getTotalSpent: (envelopes: Envelope[]): number => {
    return envelopes.reduce((sum, e) => sum + Number(e.spent), 0);
  },

  /**
   * Calculate total remaining across all capped envelopes.
   */
  getTotalRemaining: (envelopes: Envelope[]): number => {
    const cappedSpent = envelopes.reduce(
      (sum, e) => sum + (e.amount === null ? 0 : Number(e.spent)),
      0,
    );
    return DashboardHelpers.getTotalAmount(envelopes) - cappedSpent;
  },

  /**
   * Prepare chart data from envelopes (top 5), split into Gastado/Disponible
   * so the two segments actually sum to the envelope's total amount - this
   * is what makes it valid to render as a *stacked* bar (stacking Gastado
   * on top of the full Total, instead of the actual remaining portion,
   * would double the bar's height and misrepresent the data). Unlimited
   * envelopes show only their spent amount (Disponible = 0, no limit to
   * split against).
   */
  getChartData: (envelopes: Envelope[], limit = 5) => {
    return envelopes.slice(0, limit).map((e) => {
      const spent = Number(e.spent);
      const amount = e.amount === null ? null : Number(e.amount);
      return {
        name: e.name.length > 15 ? e.name.substring(0, 15) + "..." : e.name,
        Gastado: spent,
        Disponible: amount === null ? 0 : Math.max(0, amount - spent),
      };
    });
  },
};

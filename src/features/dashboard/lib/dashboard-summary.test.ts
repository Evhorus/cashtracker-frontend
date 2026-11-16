import { describe, expect, it } from "vitest";

import type { Envelope } from "@/features/envelopes/types";
import { getAlertEnvelopes } from "./dashboard-summary";

function envelope(
  id: string,
  amount: string | null,
  spent: string,
  status: Envelope["status"],
): Envelope {
  return {
    id,
    name: `Envelope ${id}`,
    amount,
    currency: "COP",
    spent,
    // Reported by the API now, not derived client-side - so the tests
    // state it rather than implying it from amount/spent.
    status,
    category: null,
    expenses: [],
    expenseDateRange: null,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  };
}

describe("getAlertEnvelopes", () => {
  it("keeps only warning and exceeded envelopes", () => {
    const result = getAlertEnvelopes([
      envelope("normal", "1000", "100", "normal"),
      envelope("warning", "1000", "850", "warning"),
      envelope("exceeded", "1000", "1200", "exceeded"),
      envelope("unlimited", null, "9999", "unlimited"),
    ]);

    expect(result.map((entry) => entry.envelope.id)).toEqual([
      "exceeded",
      "warning",
    ]);
  });

  it("sorts worst first", () => {
    const result = getAlertEnvelopes([
      envelope("a", "1000", "850", "warning"),
      envelope("b", "1000", "1500", "exceeded"),
      envelope("c", "1000", "1100", "exceeded"),
    ]);

    expect(result.map((entry) => entry.envelope.id)).toEqual(["b", "c", "a"]);
    expect(result[0].percentage).toBeGreaterThan(result[1].percentage);
  });

  it("narrows the status to the two alert states", () => {
    const [first] = getAlertEnvelopes([
      envelope("x", "1000", "1200", "exceeded"),
    ]);

    expect(first.status).toBe("exceeded");
  });

  it("is empty when nothing needs attention", () => {
    expect(getAlertEnvelopes([envelope("ok", "1000", "10", "normal")])).toEqual(
      [],
    );
    expect(getAlertEnvelopes([])).toEqual([]);
  });
});

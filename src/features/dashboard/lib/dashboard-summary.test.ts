import { describe, expect, it } from "vitest";

import type { Envelope } from "@/features/envelopes/types";
import type { DashboardSummary } from "../schemas/dashboard.schema";
import { getAlertEnvelopes, getMonthOverMonthDelta } from "./dashboard-summary";

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
    expenses: [],
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  };
}

const month = (
  label: string,
  available: number,
): DashboardSummary["chart"][number] => ({
  label,
  spent: 0,
  available,
});

describe("getMonthOverMonthDelta", () => {
  it("is null with fewer than two months", () => {
    expect(getMonthOverMonthDelta([])).toBeNull();
    expect(getMonthOverMonthDelta([month("Ago", 100)])).toBeNull();
  });

  it("computes the change between the last two months", () => {
    const delta = getMonthOverMonthDelta([
      month("Jun", 50),
      month("Jul", 100),
      month("Ago", 150),
    ]);

    expect(delta).toBe(50);
  });

  it("reports a decrease as negative", () => {
    expect(getMonthOverMonthDelta([month("Jul", 200), month("Ago", 150)])).toBe(
      -25,
    );
  });

  it("is null when the earlier month was exactly zero", () => {
    // Any change from zero is an infinite percentage - the UI renders
    // nothing rather than a fabricated figure.
    expect(
      getMonthOverMonthDelta([month("Jul", 0), month("Ago", 500)]),
    ).toBeNull();
  });

  it("uses the magnitude of the earlier month, so a negative baseline still reads correctly", () => {
    // Going from -100 available to -50 is an improvement, so the delta
    // must be positive. Dividing by the signed value would flip it.
    expect(
      getMonthOverMonthDelta([month("Jul", -100), month("Ago", -50)]),
    ).toBe(50);
  });

  it("ignores months before the last two", () => {
    const delta = getMonthOverMonthDelta([
      month("Ene", 99999),
      month("Jul", 100),
      month("Ago", 110),
    ]);

    expect(delta).toBeCloseTo(10);
  });
});

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

import { describe, expect, it } from "vitest";

import type { Envelope } from "../types";
import {
  ENVELOPE_STATUS_FILTERS,
  ENVELOPE_WARNING_THRESHOLD,
  EnvelopeHelpers,
  type EnvelopeProgressStatus,
} from "./envelope-helpers";

// Amounts arrive from the API as decimal strings, which is exactly how
// they reach these helpers - so the fixtures use strings too.
function envelope(amount: string | null, spent: string): Envelope {
  return {
    id: "e1",
    name: "Test",
    amount,
    currency: "COP",
    spent,
    expenses: [],
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  };
}

describe("getProgressStatus", () => {
  it("is unlimited when there is no cap", () => {
    expect(EnvelopeHelpers.getProgressStatus(envelope(null, "500"))).toBe(
      "unlimited",
    );
  });

  it("is normal below the warning threshold", () => {
    expect(EnvelopeHelpers.getProgressStatus(envelope("1000", "790"))).toBe(
      "normal",
    );
  });

  it("is warning exactly at the threshold", () => {
    // Inclusive on purpose - 80% should already warn.
    expect(ENVELOPE_WARNING_THRESHOLD).toBe(0.8);
    expect(EnvelopeHelpers.getProgressStatus(envelope("1000", "800"))).toBe(
      "warning",
    );
  });

  it("is still warning at exactly the limit, not exceeded", () => {
    // Spending your whole budget is not overspending.
    expect(EnvelopeHelpers.getProgressStatus(envelope("1000", "1000"))).toBe(
      "warning",
    );
  });

  it("is exceeded a cent past the limit", () => {
    expect(EnvelopeHelpers.getProgressStatus(envelope("1000", "1000.01"))).toBe(
      "exceeded",
    );
  });

  it("handles a zero limit without dividing by zero", () => {
    expect(EnvelopeHelpers.getProgressStatus(envelope("0", "0"))).toBe(
      "normal",
    );
    expect(EnvelopeHelpers.getProgressStatus(envelope("0", "1"))).toBe(
      "exceeded",
    );
  });
});

describe("amount helpers", () => {
  it("returns null rather than a number for an unlimited envelope", () => {
    const unlimited = envelope(null, "500");

    expect(EnvelopeHelpers.getAmount(unlimited)).toBeNull();
    expect(EnvelopeHelpers.getRemaining(unlimited)).toBeNull();
    expect(EnvelopeHelpers.getPercentage(unlimited)).toBeNull();
  });

  it("computes remaining and percentage for a capped envelope", () => {
    const capped = envelope("250000.50", "220000");

    expect(EnvelopeHelpers.getRemaining(capped)).toBe(30000.5);
    // 220000 / 250000.50 - just under 88%, which is what the UI rounds
    // to one decimal for display ("88.0% del límite").
    expect(EnvelopeHelpers.getPercentage(capped)).toBeCloseTo(87.9998, 3);
    expect((EnvelopeHelpers.getPercentage(capped) ?? 0).toFixed(1)).toBe(
      "88.0",
    );
  });

  it("reports a negative remaining once exceeded", () => {
    expect(EnvelopeHelpers.getRemaining(envelope("100", "140"))).toBe(-40);
  });
});

describe("matchesStatusFilter", () => {
  const cases: {
    filter: (typeof ENVELOPE_STATUS_FILTERS)[number]["value"];
    expected: Record<string, boolean>;
  }[] = [
    {
      filter: "all",
      expected: {
        normal: true,
        warning: true,
        exceeded: true,
        unlimited: true,
      },
    },
    {
      filter: "active",
      expected: {
        normal: true,
        warning: true,
        exceeded: false,
        unlimited: false,
      },
    },
    {
      filter: "alert",
      expected: {
        normal: false,
        warning: true,
        exceeded: true,
        unlimited: false,
      },
    },
    {
      filter: "exceeded",
      expected: {
        normal: false,
        warning: false,
        exceeded: true,
        unlimited: false,
      },
    },
    {
      filter: "unlimited",
      expected: {
        normal: false,
        warning: false,
        exceeded: false,
        unlimited: true,
      },
    },
  ];

  const byStatus: Record<string, Envelope> = {
    normal: envelope("1000", "100"),
    warning: envelope("1000", "850"),
    exceeded: envelope("1000", "1200"),
    unlimited: envelope(null, "100"),
  };

  for (const { filter, expected } of cases) {
    it(`"${filter}" selects the right statuses`, () => {
      for (const [status, shouldMatch] of Object.entries(expected)) {
        expect(
          EnvelopeHelpers.matchesStatusFilter(byStatus[status], filter),
        ).toBe(shouldMatch);
      }
    });
  }

  it("covers every filter the UI offers", () => {
    expect(cases.map((c) => c.filter).sort()).toEqual(
      ENVELOPE_STATUS_FILTERS.map((f) => f.value).sort(),
    );
  });
});

describe("status presentation helpers", () => {
  const statuses: EnvelopeProgressStatus[] = [
    "unlimited",
    "normal",
    "warning",
    "exceeded",
  ];

  it("returns a label and a class for every status", () => {
    // These are exhaustive switches with no default - a new status would
    // silently return undefined and render as blank text or no colour.
    for (const status of statuses) {
      expect(EnvelopeHelpers.getStatusLabel(status)).toBeTruthy();
      expect(EnvelopeHelpers.getStatusTextColorClass(status)).toBeTruthy();
      expect(EnvelopeHelpers.getStatusBadgeClass(status)).toBeTruthy();
      expect(EnvelopeHelpers.getStatusBarColorClass(status)).toBeTruthy();
      expect(
        EnvelopeHelpers.getStatusProgressBarColorClass(status),
      ).toBeTruthy();
    }
  });

  it("uses the canonical vocabulary", () => {
    expect(EnvelopeHelpers.getStatusLabel("unlimited")).toBe("Sin límite");
    expect(EnvelopeHelpers.getStatusLabel("normal")).toBe("Controlado");
    expect(EnvelopeHelpers.getStatusLabel("warning")).toBe("En riesgo");
    expect(EnvelopeHelpers.getStatusLabel("exceeded")).toBe("Excedido");
  });

  it("keeps the bar and text colours consistent per status", () => {
    // The drift this locks in: the expense detail page once used
    // emerald-500 for a healthy envelope while the card used primary.
    expect(EnvelopeHelpers.getStatusBarColorClass("exceeded")).toContain(
      "destructive",
    );
    expect(EnvelopeHelpers.getStatusTextColorClass("exceeded")).toContain(
      "destructive",
    );
    expect(EnvelopeHelpers.getStatusBarColorClass("warning")).toContain(
      "amber-500",
    );
    expect(EnvelopeHelpers.getStatusTextColorClass("warning")).toContain(
      "amber-500",
    );
  });
});

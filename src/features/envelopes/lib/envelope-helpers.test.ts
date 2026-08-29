import { describe, expect, it } from "vitest";

import type { Envelope } from "../types";
import {
  ENVELOPE_STATUS_FILTERS,
  EnvelopeHelpers,
  type EnvelopeProgressStatus,
} from "./envelope-helpers";

/**
 * Status *derivation* is no longer tested here - it isn't done here. The
 * API reports `envelope.status`, and the threshold plus its edge cases
 * are covered by envelope-status.spec.ts in cashtracker-backend, which
 * also checks the SQL filter agrees with it.
 *
 * What remains is this app's own business: turning a status into labels
 * and colour classes, and grouping envelopes already in hand.
 */

// Amounts arrive from the API as decimal strings, which is how they
// reach these helpers - so the fixtures use strings too.
function envelope(
  amount: string | null,
  spent: string,
  status: EnvelopeProgressStatus,
): Envelope {
  return {
    id: "e1",
    name: "Test",
    amount,
    currency: "COP",
    spent,
    status,
    expenses: [],
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  };
}

describe("amount helpers", () => {
  it("returns null rather than a number for an unlimited envelope", () => {
    const unlimited = envelope(null, "500", "unlimited");

    expect(EnvelopeHelpers.getAmount(unlimited)).toBeNull();
    expect(EnvelopeHelpers.getRemaining(unlimited)).toBeNull();
    expect(EnvelopeHelpers.getPercentage(unlimited)).toBeNull();
  });

  it("computes remaining and percentage for a capped envelope", () => {
    const capped = envelope("250000.50", "220000", "warning");

    expect(EnvelopeHelpers.getRemaining(capped)).toBe(30000.5);
    // 220000 / 250000.50 - just under 88%, which is what the UI rounds
    // to one decimal for display ("88.0% del límite").
    expect(EnvelopeHelpers.getPercentage(capped)).toBeCloseTo(87.9998, 3);
    expect((EnvelopeHelpers.getPercentage(capped) ?? 0).toFixed(1)).toBe(
      "88.0",
    );
  });

  it("reports a negative remaining once exceeded", () => {
    expect(
      EnvelopeHelpers.getRemaining(envelope("100", "140", "exceeded")),
    ).toBe(-40);
  });
});

describe("matchesStatusFilter", () => {
  const byStatus: Record<EnvelopeProgressStatus, Envelope> = {
    normal: envelope("1000", "100", "normal"),
    warning: envelope("1000", "850", "warning"),
    exceeded: envelope("1000", "1200", "exceeded"),
    unlimited: envelope(null, "100", "unlimited"),
  };

  const cases: {
    filter: (typeof ENVELOPE_STATUS_FILTERS)[number]["value"];
    expected: Record<EnvelopeProgressStatus, boolean>;
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

  for (const { filter, expected } of cases) {
    it(`"${filter}" selects the right statuses`, () => {
      for (const [status, shouldMatch] of Object.entries(expected)) {
        expect(
          EnvelopeHelpers.matchesStatusFilter(
            byStatus[status as EnvelopeProgressStatus],
            filter,
          ),
        ).toBe(shouldMatch);
      }
    });
  }

  it("covers every filter the UI offers", () => {
    expect(cases.map((c) => c.filter).sort()).toEqual(
      ENVELOPE_STATUS_FILTERS.map((f) => f.value).sort(),
    );
  });

  it("reads the reported status, not the amounts", () => {
    // If this ever went back to deriving from amount/spent, the two
    // clients could disagree again. An envelope whose numbers say one
    // thing and whose reported status says another must follow the API.
    const contradictory = envelope("1000", "50", "exceeded");

    expect(EnvelopeHelpers.matchesStatusFilter(contradictory, "exceeded")).toBe(
      true,
    );
    expect(EnvelopeHelpers.matchesStatusFilter(contradictory, "active")).toBe(
      false,
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

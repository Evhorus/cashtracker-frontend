import { describe, expect, it } from "vitest";

import type { Envelope } from "../types";
import {
  ENVELOPE_STATUS_TAB_VALUES,
  EnvelopeHelpers,
  type EnvelopeProgressStatus,
} from "./envelope-helpers";
import es from "../messages/es.json";
import en from "../messages/en.json";

/**
 * Status *derivation* is no longer tested here - it isn't done here. The
 * API reports `envelope.status`, and the threshold plus its edge cases
 * are covered by envelope-status.spec.ts in cashtracker-backend, which
 * also checks the SQL filter agrees with it. Neither is grouping:
 * `matchesStatusFilter` was deleted, having had no consumer outside
 * this file - the list page asks the API with `?status=` and the summary
 * page's widget filters inline.
 *
 * What remains is this app's own business: turning a status into colour
 * classes, and grouping envelopes already in hand. The status *words*
 * moved to the message catalogues, so the checks that used to assert
 * them here now assert every status and filter actually has one.
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
    category: null,
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

describe("status presentation helpers", () => {
  const statuses: EnvelopeProgressStatus[] = [
    "unlimited",
    "normal",
    "warning",
    "exceeded",
  ];

  it("returns a class for every status", () => {
    // These are exhaustive switches with no default - a new status would
    // silently return undefined and render as blank text or no colour.
    for (const status of statuses) {
      expect(EnvelopeHelpers.getStatusTextColorClass(status)).toBeTruthy();
      expect(EnvelopeHelpers.getStatusBadgeClass(status)).toBeTruthy();
      expect(EnvelopeHelpers.getStatusBarColorClass(status)).toBeTruthy();
      expect(
        EnvelopeHelpers.getStatusProgressBarColorClass(status),
      ).toBeTruthy();
    }
  });

  // Replaces an older assertion that pinned the four Spanish words
  // here. The words live in the catalogues now, so what's worth
  // locking is that adding a status (or a filter tab) can't ship
  // without the word to render it - otherwise the type compiles, the
  // switch statements are exhaustive, and the UI renders a raw key.
  it("has a translated word for every status, in every language", () => {
    for (const catalogue of [es, en]) {
      for (const status of statuses) {
        expect(catalogue.envelopes.status).toHaveProperty(status);
      }
    }
  });

  // Every tab but "all" IS a status, so it borrows that status's word
  // rather than having its own - which is what makes the tab bar and the
  // row badges structurally incapable of disagreeing. This asserts the
  // subset relationship holds, so a tab can never be added without a
  // word to render it.
  it("labels every tab from the status vocabulary, in every language", () => {
    for (const catalogue of [es, en]) {
      expect(catalogue.envelopes.filters).toHaveProperty("all");

      for (const tab of ENVELOPE_STATUS_TAB_VALUES) {
        if (tab === "all") continue;
        expect(statuses).toContain(tab);
        expect(catalogue.envelopes.status).toHaveProperty(tab);
      }
    }
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

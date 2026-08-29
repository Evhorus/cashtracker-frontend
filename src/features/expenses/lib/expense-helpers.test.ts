import { describe, expect, it } from "vitest";

import type { Envelope } from "@/features/envelopes/types";
import type { Expense } from "../types";
import {
  EXPENSES_DEFAULT_PAGE_SIZE,
  EXPENSES_MAX_PAGE_SIZE,
  EXPENSES_PAGE_SIZE_OPTIONS,
  ExpenseHelpers,
} from "./expense-helpers";

function expense(amount: string): Expense {
  return {
    id: "x",
    name: "Gasto",
    amount,
    date: new Date("2026-09-22T00:00:00Z"),
    createdAt: new Date("2026-09-22T00:00:00Z"),
    updatedAt: new Date("2026-09-22T00:00:00Z"),
  };
}

function envelope(amount: string | null): Envelope {
  return {
    id: "e",
    name: "Sobre",
    amount,
    currency: "COP",
    spent: "0",
    status: amount === null ? "unlimited" : "normal",
    expenses: [],
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
  };
}

describe("getTotalAmount", () => {
  it("sums decimal-string amounts", () => {
    expect(
      ExpenseHelpers.getTotalAmount([
        expense("100.50"),
        expense("200.25"),
        expense("0.25"),
      ]),
    ).toBe(301);
  });

  it("is zero for an empty list", () => {
    expect(ExpenseHelpers.getTotalAmount([])).toBe(0);
  });
});

describe("getImpactPercentage", () => {
  it("is the share of the envelope's limit", () => {
    expect(
      ExpenseHelpers.getImpactPercentage(expense("250"), envelope("1000")),
    ).toBe(25);
  });

  it("is null for an unlimited envelope", () => {
    // There is no limit to be a percentage of - the UI shows a
    // "sin límite" block instead of a fabricated 0%.
    expect(
      ExpenseHelpers.getImpactPercentage(expense("250"), envelope(null)),
    ).toBeNull();
  });

  it("can exceed 100 for a single expense past the whole limit", () => {
    expect(
      ExpenseHelpers.getImpactPercentage(expense("1500"), envelope("1000")),
    ).toBe(150);
  });
});

describe("page size options", () => {
  it("offers only sizes the backend accepts", () => {
    for (const option of EXPENSES_PAGE_SIZE_OPTIONS) {
      expect(option.value).toBeLessThanOrEqual(EXPENSES_MAX_PAGE_SIZE);
      expect(option.value).toBeGreaterThan(0);
    }
  });

  it("includes the default, so the URL-validation fallback is reachable", () => {
    // Both the page and ExpensesFilter validate ?limit= against this
    // list; if the default weren't in it, a fresh visit would be treated
    // as an invalid value.
    expect(
      EXPENSES_PAGE_SIZE_OPTIONS.some(
        (option) => option.value === EXPENSES_DEFAULT_PAGE_SIZE,
      ),
    ).toBe(true);
  });
});

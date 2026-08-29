import { describe, expect, it } from "vitest";

import { ExpenseMapper } from "./expense.mapper";
import type { ExpenseApi } from "../schemas/expense.schema";

// Runs under TZ=America/Bogota (UTC-5) - see vitest.config.mts. That is
// what makes the calendar-date assertions below meaningful: a naive
// `new Date(apiExpense.date)` plus local getters shifts the day here.
const apiExpense: ExpenseApi = {
  id: "x1",
  name: "Mercado",
  amount: "192500.00",
  currency: "COP",
  date: "2026-09-22",
  description: null,
  createdAt: "2026-09-22T15:04:05.000Z",
  updatedAt: "2026-09-22T15:04:05.000Z",
};

describe("fromApi", () => {
  it("parses the calendar date without shifting the day", () => {
    const expense = ExpenseMapper.fromApi(apiExpense);

    expect(expense.date.toISOString()).toBe("2026-09-22T00:00:00.000Z");
    expect(expense.date.getUTCDate()).toBe(22);
  });

  it("handles the API echoing a date-only value as a full timestamp", () => {
    const expense = ExpenseMapper.fromApi({
      ...apiExpense,
      date: "2026-09-22T00:00:00.000Z",
    });

    expect(expense.date.toISOString()).toBe("2026-09-22T00:00:00.000Z");
  });

  it("turns createdAt/updatedAt into real instants, not calendar dates", () => {
    const expense = ExpenseMapper.fromApi(apiExpense);

    // An instant keeps its time-of-day - unlike `date`, this one is
    // meant to be localized on display.
    expect(expense.createdAt.toISOString()).toBe("2026-09-22T15:04:05.000Z");
    expect(expense.createdAt).toBeInstanceOf(Date);
  });

  it("normalizes a null description to undefined", () => {
    expect(ExpenseMapper.fromApi(apiExpense).description).toBeUndefined();
    expect(
      ExpenseMapper.fromApi({ ...apiExpense, description: "algo" }).description,
    ).toBe("algo");
  });

  it("keeps the amount as the canonical string", () => {
    // Kept as a string on purpose - the domain type is `amount: string`,
    // and ExpenseHelpers.getAmount does the Number() when arithmetic is
    // actually needed.
    expect(ExpenseMapper.fromApi(apiExpense).amount).toBe("192500.00");
  });
});

describe("toApiRequest", () => {
  it("sends the date as a plain yyyy-MM-dd built from local components", () => {
    const request = ExpenseMapper.toApiRequest({
      name: "Mercado",
      amount: "192500",
      currency: "COP",
      // What the form holds: a browser-local-anchored date.
      date: new Date(2026, 8, 22),
      description: "",
    });

    expect(request.date).toBe("2026-09-22");
    expect(request.amount).toBe(192500);
  });

  it("round trips a date through the API and back unchanged", () => {
    const fromApi = ExpenseMapper.fromApi(apiExpense);
    const asFormValues = ExpenseMapper.toFormValues(fromApi);
    const backToApi = ExpenseMapper.toApiRequest({
      ...asFormValues,
      currency: "COP",
    });

    expect(backToApi.date).toBe("2026-09-22");
  });
});

describe("toFormValues", () => {
  it("hands the calendar widget a locally-anchored date", () => {
    const formValues = ExpenseMapper.toFormValues(
      ExpenseMapper.fromApi(apiExpense),
    );

    expect(formValues.date.getDate()).toBe(22);
    expect(formValues.date.getMonth()).toBe(8);
  });

  it("turns a missing description into an empty string for the input", () => {
    const formValues = ExpenseMapper.toFormValues(
      ExpenseMapper.fromApi(apiExpense),
    );

    expect(formValues.description).toBe("");
  });
});

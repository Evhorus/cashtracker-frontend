import { describe, expect, it } from "vitest";
import {
  EXPENSE_ORDERS,
  parseExpenseOrder,
  writeExpenseOrder,
} from "./expense-order";

describe("expense order", () => {
  it("is newest first with no params", () => {
    expect(parseExpenseOrder(null, null)).toBe("newest");
  });

  it("reads the amount orders", () => {
    expect(parseExpenseOrder("DESC", "amount")).toBe("highest");
    expect(parseExpenseOrder(null, "amount")).toBe("highest");
    expect(parseExpenseOrder("ASC", "amount")).toBe("lowest");
    expect(parseExpenseOrder("ASC", null)).toBe("oldest");
  });

  it("leaves the default out of the URL", () => {
    const params = new URLSearchParams("sort=ASC&sortBy=amount&q=x");
    writeExpenseOrder(params, "newest");
    expect(params.toString()).toBe("q=x");
  });

  it.each(EXPENSE_ORDERS)("round-trips %s through the URL", (order) => {
    const params = new URLSearchParams();
    writeExpenseOrder(params, order);
    expect(parseExpenseOrder(params.get("sort"), params.get("sortBy"))).toBe(
      order,
    );
  });
});

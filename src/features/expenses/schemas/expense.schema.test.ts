import { describe, expect, it } from "vitest";

import { buildExpenseSchema } from "./expense.schema";
import type { ExpenseFormValues } from "./expense.schema";
import { MAX_AMOUNT } from "@/shared/lib/validation";
import type { ValidationTranslator } from "@/shared/lib/validation";

/**
 * The decimal(12, 2) ceiling on an expense amount.
 *
 * Tested here rather than left to the backend because the backend does
 * not enforce it: CreateExpenseDto carries @IsNumber and @IsPositive but
 * no @Max, so an amount above the column's range passes validation,
 * reaches the insert, and comes back as a bare 500 that the UI renders
 * as "Internal server error" - in English, in a Spanish app, for what is
 * really a validation failure.
 *
 * What the backend does assert against a real database - that the amount
 * is positive, that it has at most two decimals, that the currency
 * matches the envelope - is deliberately absent here.
 */

/** Returns the key, so an assertion reads as the key it used. */
const t = ((key: string) => key) as unknown as ValidationTranslator;
const schema = buildExpenseSchema("COP", t);

const form = (over: Partial<ExpenseFormValues> = {}) => ({
  name: "Mercado",
  amount: "192500",
  currency: "COP" as const,
  date: new Date(2026, 8, 22),
  description: "",
  ...over,
});

describe("the amount ceiling", () => {
  it("accepts an amount exactly at the ceiling", () => {
    expect(schema.safeParse(form({ amount: String(MAX_AMOUNT) })).success).toBe(
      true,
    );
  });

  it("rejects an amount over it, on the amount field", () => {
    const result = schema.safeParse(form({ amount: "10000000000" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["amount"]);
    expect(result.error?.issues[0]?.message).toBe("amountTooLarge");
  });

  it("still rejects an empty amount, which reads as zero to Number()", () => {
    // `Number("") === 0`, which is under the ceiling - so the min(1)
    // check is what catches this, and it has to run.
    const result = schema.safeParse(form({ amount: "" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("amountEmpty");
  });
});

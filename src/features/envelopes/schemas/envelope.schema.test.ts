import { describe, expect, it } from "vitest";

import { buildEnvelopeFormSchema } from "./envelope.schema";
import type { ValidationTranslator } from "@/shared/lib/validation";

/** Returns the key, so an assertion reads as the key it used. */
const t = ((key: string) => key) as unknown as ValidationTranslator;
const schema = buildEnvelopeFormSchema(t);

const form = (amount: string, hasLimit = true) => ({
  name: "Mercado",
  hasLimit,
  amount,
  currency: "COP" as const,
  categoryId: "",
});

describe("the envelope limit", () => {
  it("rejects a zero limit on the field", () => {
    const result = schema.safeParse(form("0"));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["amount"]);
    expect(result.error?.issues[0]?.message).toBe("amountMustBePositive");
  });

  it("accepts a positive limit", () => {
    expect(schema.safeParse(form("500000")).success).toBe(true);
  });

  it("ignores the amount entirely when the envelope has no limit", () => {
    // The amount field is hidden then; a leftover "0" must not block.
    expect(schema.safeParse(form("0", false)).success).toBe(true);
  });

  it("reports an empty limit as empty, not as non-positive", () => {
    const result = schema.safeParse(form(""));

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "amountEmpty",
    ]);
  });
});

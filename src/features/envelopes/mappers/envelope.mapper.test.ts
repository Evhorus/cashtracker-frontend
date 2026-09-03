import { describe, expect, it } from "vitest";

import { buildEnvelopeFormSchema } from "../schemas/envelope.schema";
import type { EnvelopeApi } from "../schemas/envelope.schema";
import { EnvelopeMapper } from "./envelope.mapper";
import type { ValidationTranslator } from "@/lib/validation";

/**
 * The spending-limit toggle, end to end on this side of the wire.
 *
 * This is tested here and not left to the backend because the backend
 * has no idea it exists: `grep hasLimit` finds nothing in
 * cashtracker-backend. It's a UI-only control that decides whether
 * `amount` is sent as a number or as null, and the API accepts both
 * happily - its own e2e suite covers "create an envelope with
 * amount: null" precisely because that's a legitimate request.
 *
 * So if this chain breaks, nothing downstream notices: the user asks for
 * a capped envelope, an uncapped one is created, and the API returns
 * 201. That makes it the frontend's job alone, which is the whole
 * criterion for what belongs in this file.
 *
 * Everything the backend already asserts against a real database -
 * decimal precision, ownership, status derivation, what a valid amount
 * is - is deliberately absent here. Re-asserting it against a mock
 * would only prove the mock agrees with itself.
 */

/** Returns the key, so a message assertion reads as the key it used. */
const t = ((key: string) => key) as unknown as ValidationTranslator;
const schema = buildEnvelopeFormSchema(t);

const form = (over: Partial<Record<string, unknown>> = {}) => ({
  name: "Mercado",
  hasLimit: true,
  amount: "500000",
  currency: "COP" as const,
  categoryId: "",
  ...over,
});

describe("the spending-limit toggle", () => {
  it("requires an amount when the envelope is capped", () => {
    const result = schema.safeParse(form({ hasLimit: true, amount: "" }));

    expect(result.success).toBe(false);
    // On the amount field, not as a form-level error - otherwise the
    // message renders nowhere near the input it's about.
    expect(result.error?.issues[0]?.path).toEqual(["amount"]);
    expect(result.error?.issues[0]?.message).toBe("amountEmpty");
  });

  it("treats whitespace as no amount at all", () => {
    const result = schema.safeParse(form({ hasLimit: true, amount: "   " }));

    expect(result.success).toBe(false);
  });

  it("does not require an amount when the envelope is uncapped", () => {
    const result = schema.safeParse(form({ hasLimit: false, amount: "" }));

    expect(result.success).toBe(true);
  });

  it("sends null for an uncapped envelope, not zero", () => {
    // Zero is a real limit that is immediately exceeded; null means
    // "no limit". The status the API derives differs completely.
    const request = EnvelopeMapper.toApiRequest(
      form({ hasLimit: false, amount: "" }) as never,
    );

    expect(request.amount).toBeNull();
  });

  it("ignores a leftover amount once the toggle is switched off", () => {
    // The form keeps the typed value when the switch is flipped, so the
    // mapper - not the form state - has to be what decides.
    const request = EnvelopeMapper.toApiRequest(
      form({ hasLimit: false, amount: "500000" }) as never,
    );

    expect(request.amount).toBeNull();
  });

  it("sends the amount as a number for a capped envelope", () => {
    const request = EnvelopeMapper.toApiRequest(
      form({ hasLimit: true, amount: "500000" }) as never,
    );

    expect(request.amount).toBe(500000);
  });

  it("keeps cents rather than truncating them", () => {
    const request = EnvelopeMapper.toApiRequest(
      form({ hasLimit: true, amount: "9.50" }) as never,
    );

    expect(request.amount).toBe(9.5);
  });
});

describe("the rest of the outbound shape", () => {
  it("trims the name and rejects one that is only spaces", () => {
    expect(schema.safeParse(form({ name: "  Mercado  " })).data?.name).toBe(
      "Mercado",
    );
    expect(schema.safeParse(form({ name: "   " })).success).toBe(false);
  });

  it("sends null for no category, not an empty string", () => {
    // The picker's cleared state is "", which the API rejects as an id.
    const request = EnvelopeMapper.toApiRequest(
      form({ categoryId: "" }) as never,
    );

    expect(request.categoryId).toBeNull();
  });

  it("passes a chosen category through as its id", () => {
    const request = EnvelopeMapper.toApiRequest(
      form({ categoryId: "cat-1" }) as never,
    );

    expect(request.categoryId).toBe("cat-1");
  });
});

describe("fromApi", () => {
  const apiEnvelope: EnvelopeApi = {
    id: "e1",
    name: "mercado y despensa del mes",
    amount: "500000",
    currency: "COP",
    spent: "0",
    status: "normal",
    category: null,
    description: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  };

  it("capitalizes just the first letter of the name the backend stores lowercase", () => {
    // Sentence case, not per-word title case - "Mercado y despensa del
    // mes" is correct Spanish, "Mercado Y Despensa Del Mes" is not.
    expect(EnvelopeMapper.fromApi(apiEnvelope).name).toBe(
      "Mercado y despensa del mes",
    );
  });
});

import { describe, expect, it } from "vitest";

import {
  CURRENCY_MAP,
  formatCurrency,
  formatNumber,
  parseNumericValue,
} from "./format-currency";

const COP = CURRENCY_MAP.COP;
const USD = CURRENCY_MAP.USD;
const EUR = CURRENCY_MAP.EUR;

// Intl inserts a non-breaking (or narrow no-break) space between the
// symbol and the digits, which varies by locale/ICU build. Comparing on
// normalized spaces keeps these assertions about the formatting rules
// rather than about which flavour of space the runtime picked.
const normalize = (value: string) => value.replace(/ | /g, " ");

describe("formatCurrency", () => {
  it("drops the decimals entirely for a whole amount", () => {
    expect(normalize(formatCurrency(440500, COP))).toBe("$ 440.500");
  });

  it("keeps every cent digit once there are cents, trailing zero included", () => {
    // The bug this locks in: minimumFractionDigits pinned to 0 let Intl
    // render 12.50 as "$12.5", which reads as a different amount.
    expect(normalize(formatCurrency(12.5, USD))).toBe("$12.50");
  });

  it("still shows both cent digits for a value with two", () => {
    expect(normalize(formatCurrency(12.34, USD))).toBe("$12.34");
  });

  it("absorbs float noise from upstream arithmetic", () => {
    // e.g. totalAssigned - totalSpent landing on 100.00000000000001
    expect(normalize(formatCurrency(0.1 + 0.2, USD))).toBe("$0.30");
  });

  it("never renders a negative zero", () => {
    // 300 - 199.99 - 100.01 is about -2.8e-14 in float, which rounds to
    // -0, and Intl renders -0 as "-$0". Found by this test.
    expect(normalize(formatCurrency(300 - 199.99 - 100.01, USD))).toBe("$0");
    expect(normalize(formatCurrency(-0, USD))).toBe("$0");
    expect(normalize(formatCurrency(-0.001, USD))).toBe("$0");
  });

  it("still renders a real negative that rounds to a non-zero amount", () => {
    expect(normalize(formatCurrency(-0.01, USD))).toBe("-$0.01");
  });

  it("formats each currency in its own locale", () => {
    expect(normalize(formatCurrency(1234.5, EUR))).toBe("1.234,50 €");
    expect(normalize(formatCurrency(1234.5, USD))).toBe("$1,234.50");
  });

  it("renders negatives (an exceeded envelope's remaining)", () => {
    expect(normalize(formatCurrency(-40000, COP))).toBe("-$ 40.000");
  });

  it("defaults to COP when given no config", () => {
    expect(normalize(formatCurrency(1000))).toBe("$ 1.000");
  });
});

describe("formatNumber", () => {
  it("groups without a currency symbol", () => {
    expect(normalize(formatNumber(1000000, COP))).toBe("1.000.000");
  });

  it("forces trailing zeros when the caller knows a decimal was typed", () => {
    // price-input.tsx passes minimumFractionDigits based on whether the
    // raw string had a decimal point - a number alone can't tell "9.50"
    // from "9.5".
    expect(normalize(formatNumber(9.5, COP, 2))).toBe("9,50");
    expect(normalize(formatNumber(9.5, COP, 0))).toBe("9,5");
  });
});

describe("parseNumericValue", () => {
  it("parses this app's canonical amount string", () => {
    expect(parseNumericValue("1000000.03")).toBe(1000000.03);
  });

  it("treats empty and undefined as zero", () => {
    expect(parseNumericValue("")).toBe(0);
    expect(parseNumericValue(undefined)).toBe(0);
  });

  it("passes a number straight through", () => {
    expect(parseNumericValue(42.5)).toBe(42.5);
  });

  it("falls back to zero rather than NaN on garbage", () => {
    expect(parseNumericValue("not a number")).toBe(0);
  });
});

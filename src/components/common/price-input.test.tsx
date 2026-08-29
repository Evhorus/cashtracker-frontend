/**
 * @vitest-environment jsdom
 */
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";

import { PriceInput } from "./price-input";
import { CURRENCY_MAP, type CurrencyConfig } from "@/lib/format-currency";

afterEach(cleanup);

/**
 * The one piece of genuinely intricate logic that lives inside a
 * component rather than a pure function, and the only reason this suite
 * pays for a DOM.
 *
 * Its whole design rests on one rule: while the user is typing, never
 * insert a thousands separator. Everything below tests a consequence of
 * that rule, or the heuristic that exists because of it - deciding
 * whether a typed "." or "," was a decimal mark or a grouping separator,
 * which cannot be answered from the character alone when a currency uses
 * the same one for both (COP and EUR group with "." and decimalize with
 * ",").
 */

/** Mirrors how react-hook-form drives this: the parent owns the value. */
function Harness({ config }: { config: CurrencyConfig }) {
  const [value, setValue] = useState<string>("");

  return (
    <>
      <PriceInput
        id="amount"
        value={value}
        onChange={(next: unknown) => setValue(next as string)}
        currencyConfig={config}
      />
      {/* The canonical value the form would submit - always "." as the
          decimal point, never locale-grouped. */}
      <output data-testid="canonical">{value}</output>
    </>
  );
}

const canonical = () => screen.getByTestId("canonical").textContent;
const field = () => screen.getByRole("textbox") as HTMLInputElement;

describe("while typing", () => {
  it("never inserts a thousands separator", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.type(field(), "1000000");

    // The rule the whole component is built on: no grouping mid-typing,
    // so there is never a separator on screen that could be confused
    // with the decimal mark the user is about to type.
    expect(field().value).toBe("1000000");
    expect(canonical()).toBe("1000000");
  });

  it("shows the currency's own decimal mark, whichever key was pressed", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    // Most numeric keypads only have "." - requiring "," for COP would
    // make cents unreachable for many people.
    await user.click(field());
    await user.type(field(), "9.5");

    expect(field().value).toBe("9,5");
    // Canonical form is always "." regardless of what was typed.
    expect(canonical()).toBe("9.5");
  });

  it("accepts the currency's own decimal mark too", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.type(field(), "9,5");

    expect(canonical()).toBe("9.5");
  });
});

describe("separator heuristic", () => {
  it('reads "12.000" as twelve thousand, not twelve', async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    // The bug this exists to prevent: a COP user types the amount the
    // way they write it. Treating "." as a decimal point would turn
    // twelve thousand pesos into twelve, silently, with no error.
    await user.click(field());
    await user.type(field(), "12.000");

    expect(canonical()).toBe("12000");
  });

  it("handles more than one grouping separator in one go", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.type(field(), "12.000.000");

    expect(canonical()).toBe("12000000");
  });

  it("still treats two trailing digits as cents", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    // Two digits after the mark is a real fraction for a 2-decimal
    // currency; three or more cannot be.
    await user.click(field());
    await user.type(field(), "12.00");

    expect(canonical()).toBe("12.00");
  });

  it("discards characters that are neither digits nor a decimal mark", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.type(field(), "1a2b3");

    expect(canonical()).toBe("123");
  });
});

describe("on blur", () => {
  it("groups the value for display without changing it", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.type(field(), "1000000");
    await user.tab();

    expect(field().value).toBe("1.000.000");
    // Display changed, stored value did not.
    expect(canonical()).toBe("1000000");
  });

  it("keeps a trailing zero the user actually typed", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.USD} />);

    // "9.50" and "9.5" are the same number, so the component has to
    // remember which was typed - dropping the zero reads as a different
    // amount to someone entering cents.
    await user.click(field());
    await user.type(field(), "9.50");
    await user.tab();

    expect(field().value).toBe("9.50");
    expect(canonical()).toBe("9.50");
  });

  it("shows a whole amount with no decimals at all", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.type(field(), "440500");
    await user.tab();

    expect(field().value).toBe("440.500");
  });

  it("re-opens for editing without the grouping it just added", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.type(field(), "1000000");
    await user.tab();
    expect(field().value).toBe("1.000.000");

    await user.click(field());

    // Back to ungrouped digits, ready to keep typing - otherwise the
    // separators it inserted would become input to parse on the next
    // keystroke, which is the ambiguity the whole design avoids.
    expect(field().value).toBe("1000000");
  });

  it("shows an empty field for an empty value rather than a zero", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.COP} />);

    await user.click(field());
    await user.tab();

    expect(field().value).toBe("");
  });
});

describe("per-currency behaviour", () => {
  it("uses each currency's own grouping and decimal marks", async () => {
    const user = userEvent.setup();
    render(<Harness config={CURRENCY_MAP.USD} />);

    await user.click(field());
    await user.type(field(), "1234.56");
    await user.tab();

    // en-US: comma groups, dot decimalizes - the mirror image of COP.
    expect(field().value).toBe("1,234.56");
    expect(canonical()).toBe("1234.56");
  });

  it("offers a decimal keypad only when the currency has cents", () => {
    render(<Harness config={CURRENCY_MAP.COP} />);

    // "decimal", not "numeric": many mobile browsers omit the "." key
    // for numeric, which would make cents unreachable.
    expect(field()).toHaveProperty("inputMode", "decimal");
  });

  it("rejects a decimal mark for a zero-decimal currency", async () => {
    const user = userEvent.setup();
    // No such currency today, but the component is written to adapt -
    // this is the branch that would otherwise go untested until one is
    // added.
    const zeroDecimal: CurrencyConfig = {
      ...CURRENCY_MAP.COP,
      decimalDigits: 0,
    };
    render(<Harness config={zeroDecimal} />);

    await user.click(field());
    await user.type(field(), "12.50");

    // The mark is discarded like any other invalid character, so the
    // digits run together rather than being read as a fraction.
    expect(canonical()).toBe("1250");
    expect(field()).toHaveProperty("inputMode", "numeric");
  });
});

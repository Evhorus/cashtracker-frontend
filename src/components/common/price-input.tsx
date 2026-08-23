import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  formatNumber,
  parseNumericValue,
  DEFAULT_CURRENCY_CONFIG,
  type CurrencyConfig,
} from "@/lib/format-currency";

export interface PriceInputProps<T extends FieldValues> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "disabled" | "type"
> {
  value: string | undefined;
  onChange: ControllerRenderProps<T>["onChange"];
  disabled?: boolean;
  currencyConfig?: CurrencyConfig;
}

/**
 * Currency-aware amount input, shared by every "enter a price" field in
 * the app (envelope amount, expense amount). Its whole design fits in
 * one rule: while the user is actively typing, never insert a thousands-
 * grouping separator into what's on screen. Grouping only gets applied
 * once on blur, formatted fresh from the clean canonical value.
 *
 * That single rule is what makes decimal entry actually work everywhere:
 * an earlier version tried to live-reformat with grouping on every
 * keystroke (so a big number looked pretty as you typed it), and to
 * support that had to guess, from the raw string alone, which "." or ","
 * the user had just typed as their decimal point versus which one this
 * same input had auto-inserted a keystroke ago as a thousands separator.
 * That guess is fundamentally unreliable once a currency's grouping
 * character and decimal character can be the same one seen at different
 * string positions (exactly the case for every currency this app has
 * today - COP/EUR group with "." and decimalize with ",", so a large EUR
 * amount with cents had no reliable way to tell them apart while typing).
 * Not reformatting until blur removes the ambiguity entirely: there's
 * only ever at most one separator character on screen while editing, so
 * there's nothing to confuse it with.
 *
 * TO ADD A NEW CURRENCY: nothing in this file changes. Add an entry to
 * CURRENCY_MAP (format-currency.ts) with its own locale/symbol/
 * decimalDigits and this component adapts automatically - a 0-decimal
 * currency (e.g. a future JPY) simply never accepts a decimal point at
 * all (see allowsDecimals below), a 3-decimal one (e.g. BHD) accepts
 * three fraction digits instead of two, and the display locale drives
 * both the decimal mark shown and the final grouped/blurred format.
 */
export function PriceInput<T extends FieldValues>({
  value,
  onChange,
  disabled,
  currencyConfig = DEFAULT_CURRENCY_CONFIG,
  onFocus: fieldOnFocus,
  onBlur: fieldOnBlur,
  ...field
}: PriceInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  // The editable text while focused: digits plus at most one decimal
  // mark, deliberately never grouped (see the component doc comment
  // above for why). Only meaningful while isFocused - blurred display
  // is always derived fresh from `value` instead (formattedValue below).
  const [editableText, setEditableText] = useState("");

  const allowsDecimals = currencyConfig.decimalDigits > 0;
  // This currency's own convention for the decimal mark shown to the
  // user (es-CO/de-DE use ",", en-US uses "."). Typing itself accepts
  // either character regardless of this - see handleChange.
  const decimalSeparator = currencyConfig.locale.startsWith("en") ? "." : ",";

  // What shows once the field isn't focused: fully localized, grouped,
  // symbol-free (the $/€ prefix is the span below, not part of the
  // input's own text) - derived straight from the canonical `value`
  // every time, never from local state.
  const formattedValue = (() => {
    if (value === undefined || value === "") return "";
    const num = parseNumericValue(value);
    if (num === 0) return "";
    // A plain number can't tell "9.50" from "9.5" apart - only the
    // original string can, so that's checked here rather than inside
    // formatNumber. A whole number (no "." typed) still shows with no
    // decimals at all; one with an explicit decimal point keeps every
    // digit the user actually entered, trailing zeros included.
    const minimumFractionDigits = value.includes(".")
      ? currencyConfig.decimalDigits
      : 0;
    return formatNumber(num, currencyConfig, minimumFractionDigits);
  })();

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Seed the editable text from the canonical value - same digits,
    // just re-punctuated with this currency's own decimal mark and with
    // no grouping, ready to keep typing into.
    setEditableText(
      value && value !== "" ? value.replace(".", decimalSeparator) : "",
    );
    fieldOnFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    fieldOnBlur?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Accept either "." or "," as the decimal mark the user meant,
    // regardless of which one this currency's own convention expects -
    // most keyboards (and every numeric keypad) only have ".", so
    // rigidly requiring "," for e.g. COP/EUR would make it impossible to
    // enter a fraction with the only decimal key most people actually
    // have. Whichever of the two was typed last is the real one; with
    // nothing ever auto-inserted into this text (see the component doc
    // comment), there's no grouping separator it could be confused with
    // *by this input* - but the user can still type one themselves, out
    // of habit (see below).
    //
    // decimalDigits === 0 (no currency today, but a future one might be)
    // disables this outright: there's no fraction to accept, so a "."
    // or "," typed is just discarded like any other invalid character.
    const decimalIndex = allowsDecimals
      ? Math.max(raw.lastIndexOf("."), raw.lastIndexOf(","))
      : -1;

    let integerDigits: string;
    let fractionalDigits: string | undefined;

    if (decimalIndex === -1) {
      integerDigits = raw.replace(/[^0-9]/g, "");
      fractionalDigits = undefined;
    } else {
      const tailDigits = raw.slice(decimalIndex + 1).replace(/[^0-9]/g, "");

      // A real fraction can never have more digits than this currency's
      // own decimalDigits - so if more than that follow the last "." or
      // ",", that character was never a decimal point to begin with. It's
      // a thousands separator typed the way people actually write money
      // (e.g. a COP user typing "12.000" for twelve thousand pesos, the
      // same habit as writing "12.000.000" for twelve million) - without
      // this, that "." would get read as a decimal point instead, and
      // "12.000" would silently become "12,00" (twelve pesos) with the
      // extra zero dropped, no error, nothing telling the user their
      // amount is now wrong by three orders of magnitude. Once this
      // fires, every separator in the string is treated as grouping and
      // discarded - not just the last one - so "12.000.000" resolves in
      // one shot to 12000000 rather than needing per-group handling.
      if (tailDigits.length > currencyConfig.decimalDigits) {
        integerDigits = raw.replace(/[^0-9]/g, "");
        fractionalDigits = undefined;
      } else {
        integerDigits = raw.slice(0, decimalIndex).replace(/[^0-9]/g, "");
        fractionalDigits = tailDigits;
      }
    }

    if (integerDigits === "" && !fractionalDigits) {
      setEditableText("");
      onChange("");
      return;
    }

    setEditableText(
      fractionalDigits !== undefined
        ? `${integerDigits}${decimalSeparator}${fractionalDigits}`
        : integerDigits,
    );

    // Canonical form for the form/API - always "." regardless of what
    // was typed or this currency's own display convention. See
    // format-currency.ts's parseNumericValue for the other end of this.
    onChange(
      fractionalDigits !== undefined
        ? `${integerDigits || "0"}.${fractionalDigits}`
        : integerDigits,
    );
  };

  return (
    <div className="relative">
      <span className="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-muted-foreground">
        {currencyConfig.symbol}
      </span>
      <Input
        {...field}
        type="text"
        // "decimal" (not "numeric") is what actually gets a decimal
        // point onto mobile numeric keypads - "numeric" is meant for
        // integer-like input (PINs, quantities) and many mobile browsers
        // simply omit the "." key for it. Falls back to "numeric" for a
        // currency with no fraction digits at all.
        inputMode={allowsDecimals ? "decimal" : "numeric"}
        className="pl-8"
        value={isFocused ? editableText : formattedValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="0"
        autoComplete="off"
        disabled={disabled}
      />
    </div>
  );
}

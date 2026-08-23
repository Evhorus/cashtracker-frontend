export const CURRENCY_CODES = ["COP", "USD", "EUR"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export interface CurrencyConfig {
  locale: string;
  currency: string;
  symbol: string;
  label: string;
  /**
   * Minor-unit digits for this currency (ISO 4217's "exponent"), e.g. 2
   * for COP/USD/EUR (they all support cents, even though COP rarely
   * shows them in everyday use) - matches the backend's own
   * `@IsNumber({ maxDecimalPlaces: 2 })` on envelope/expense `amount`
   * (see create-envelope.dto.ts / create-expense.dto.ts in
   * cashtracker-backend). Drives both display formatting below and
   * price-input.tsx's typing rules (how many fraction digits it accepts,
   * and whether it accepts a decimal point at all - 0 means it doesn't).
   *
   * TO ADD A NEW CURRENCY: add one entry to CURRENCY_MAP with its own
   * locale/symbol/label/decimalDigits (e.g. a 0-decimal currency like
   * JPY, or a 3-decimal one like BHD) and add its code to
   * CURRENCY_CODES above - formatCurrency, formatNumber, and
   * PriceInput all read from here, nothing else needs to change. If a
   * future currency actually needs the *interface text itself*
   * translated (not just number formatting), that's a separate concern
   * this file doesn't cover - the app's copy is hardcoded Spanish
   * throughout today, deliberately: real i18n (a translation library,
   * locale-switching UI) is only worth adding once there's an actual
   * non-Spanish-speaking user to support, not speculatively.
   */
  decimalDigits: number;
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  COP: {
    locale: "es-CO",
    currency: "COP",
    symbol: "$",
    label: "Peso Colombiano",
    decimalDigits: 2,
  },
  USD: {
    locale: "en-US",
    currency: "USD",
    symbol: "$",
    label: "Dólar Estadounidense",
    decimalDigits: 2,
  },
  EUR: {
    locale: "de-DE",
    currency: "EUR",
    symbol: "€",
    label: "Euro",
    decimalDigits: 2,
  },
};

export const DEFAULT_CURRENCY_CONFIG = CURRENCY_MAP.COP;

export const formatCurrency = (
  quantity: number,
  config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG,
) => {
  // A whole amount (no cents) shows with no decimals at all (COP reads
  // as "$ 440.500", not "$ 440.500,00") - but the moment there ARE
  // cents, every digit of them has to show, trailing zeros included.
  // minimumFractionDigits pinned to 0 let Intl drop a trailing zero
  // decimal whenever the value "fit" in fewer digits - e.g. 12.50 (USD)
  // rendered as "$12.5", silently reading as a different amount.
  // Rounding to decimalDigits first (rather than checking `quantity`
  // itself) absorbs any float noise from upstream arithmetic (e.g.
  // totalAssigned - totalSpent) before deciding whether it's a whole
  // number.
  const rounded = Number(quantity.toFixed(config.decimalDigits));
  const minimumFractionDigits = Number.isInteger(rounded)
    ? 0
    : config.decimalDigits;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits,
    maximumFractionDigits: config.decimalDigits,
  }).format(quantity);
};

export const formatNumber = (
  value: number,
  config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG,
  /**
   * Force this many fraction digits even when they're trailing zeros
   * (e.g. 2 so 9.5 shows as "9,50") - a number alone can't tell "9.50"
   * from "9.5" apart (Number() drops the difference), so callers that
   * still have the original typed string need to decide this themselves
   * based on whether it actually had a decimal point. See
   * price-input.tsx's formattedValue for the one place that matters:
   * without it, blurring a field where the user typed "9.50" showed
   * "9,5", silently dropping the cent they'd just entered.
   */
  minimumFractionDigits = 0,
): string => {
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits,
    maximumFractionDigits: config.decimalDigits,
  }).format(value);
};

/**
 * Parses this app's own canonical amount string (e.g. "1000000.03",
 * always "." as the decimal point, never locale-grouped) back into a
 * number. This is *not* for parsing raw user keystrokes - that's
 * price-input.tsx's handleChange, which has to deal with whatever
 * decimal mark the user actually typed and does its own thing. The
 * values this function ever sees are either this app's own normalized
 * form state (produced by price-input.tsx) or the plain decimal string
 * the backend returns for envelope.amount/expense.amount - neither is
 * ever locale-formatted with thousands grouping, so there's nothing
 * locale-specific to strip here.
 */
export const parseNumericValue = (
  value: string | number | undefined,
): number => {
  if (value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  return Number(value) || 0;
};

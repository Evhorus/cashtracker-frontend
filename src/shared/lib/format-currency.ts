export interface CurrencyConfig {
  locale: string;
  currency: string;
  symbol: string;
  label: string;
}

export const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  COP: {
    locale: 'es-CO',
    currency: 'COP',
    symbol: '$',
    label: 'Peso Colombiano',
  },
  USD: {
    locale: 'en-US',
    currency: 'USD',
    symbol: '$',
    label: 'Dólar Estadounidense',
  },
  EUR: {
    locale: 'de-DE',
    currency: 'EUR',
    symbol: '€',
    label: 'Euro',
  },
};

export const DEFAULT_CURRENCY_CONFIG = CURRENCY_MAP.COP;

export const formatCurrency = (quantity: number, config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG) => {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
  }).format(quantity);
};

export const formatNumber = (value: number, config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG): string => {
  return new Intl.NumberFormat(config.locale).format(value);
};

/**
 * Parses a string value into a number.
 * This version is designed to handle strings that might have locale-specific thousand separators.
 * It assumes that the input string's decimal separator is the one used by the provided locale.
 */
export const parseNumericValue = (value: string | number | undefined, config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG): number => {
  if (value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  const thousandSeparator = config.locale.startsWith('en') ? ',' : '.';
  const decimalSeparator = config.locale.startsWith('en') ? '.' : ',';

  const cleanedValue = value
    .replace(new RegExp(`\\${thousandSeparator}`, 'g'), '') // Remove thousand separators
    .replace(decimalSeparator, '.'); // Normalize decimal separator to '.'

  return Number(cleanedValue) || 0;
};

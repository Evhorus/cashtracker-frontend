import type { SupportedLocale } from "@/shared/config/i18n/config";
import type { ReportExpense } from "../types";

export interface CsvLabels {
  date: string;
  name: string;
  envelope: string;
  paymentMethod: string;
  amount: string;
  currency: string;
  description: string;
  noPaymentMethod: string;
}

/**
 * Spanish Excel reads `;` as the column separator and `,` as the decimal
 * mark; with plain commas the whole row lands in one cell. English
 * Excel is the other way round.
 */
const FORMAT: Record<SupportedLocale, { separator: string; decimal: string }> =
  {
    es: { separator: ";", decimal: "," },
    en: { separator: ",", decimal: "." },
  };

/** A cell starting with one of these runs as a formula when opened in a
 * spreadsheet (CSV injection); a leading quote keeps it text. */
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string, separator: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  const needsQuotes =
    safe.includes(separator) || /["\r\n]/.test(safe) || safe !== safe.trim();
  return needsQuotes ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/** `YYYY-MM-DD`, read from the UTC-anchored calendar date. */
function calendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The report as CSV, one row per expense. Amounts are the exact decimal
 * strings the API sent, with the locale's decimal mark and no thousands
 * separator, so a spreadsheet reads them as numbers.
 */
export function buildReportCsv(
  expenses: ReportExpense[],
  labels: CsvLabels,
  locale: SupportedLocale,
): string {
  const { separator, decimal } = FORMAT[locale];
  const row = (values: string[]) =>
    values.map((value) => cell(value, separator)).join(separator);

  const header = row([
    labels.date,
    labels.name,
    labels.envelope,
    labels.paymentMethod,
    labels.amount,
    labels.currency,
    labels.description,
  ]);

  const rows = expenses.map((expense) =>
    row([
      calendarDate(expense.date),
      expense.name,
      expense.envelope.name,
      expense.paymentMethod?.name ?? labels.noPaymentMethod,
      expense.amount.replace(".", decimal),
      expense.currency,
      expense.description ?? "",
    ]),
  );

  return [header, ...rows].join("\r\n");
}

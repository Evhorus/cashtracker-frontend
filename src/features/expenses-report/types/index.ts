import type { ExpensePaymentMethod } from "@/features/payment-methods/types";

/** An expense in the report: it carries its envelope, since the report
 * crosses envelopes. */
export interface ReportExpense {
  id: string;
  name: string;
  /** Exact decimal string, as the API sends money. */
  amount: string;
  currency: string;
  /** UTC-anchored calendar date (see parseCalendarDate). */
  date: Date;
  description?: string;
  envelope: { id: string; name: string };
  paymentMethod: ExpensePaymentMethod | null;
}

/** The date range applied to one payment method (null = expenses
 * without one). */
export interface ReportScope {
  paymentMethodId: string | null;
  startDate: string;
  endDate: string;
}

export interface CurrencyTotal {
  currency: string;
  total: number;
}

export interface PaymentMethodTotal extends CurrencyTotal {
  paymentMethodId: string | null;
  count: number;
}

export interface ExpensesReport {
  scopes: ReportScope[];
  expenses: ReportExpense[];
  totalsByCurrency: CurrencyTotal[];
  totalsByPaymentMethod: PaymentMethodTotal[];
}

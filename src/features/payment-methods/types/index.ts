export const PAYMENT_METHOD_TYPES = [
  "credit_card",
  "debit_card",
  "cash",
  "transfer",
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

/** What an expense was paid with. Owned by one user, optional on every
 * expense - independent of how envelopes are organised. */
export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  /** oklch() string from the backend's PRESET_COLORS whitelist. */
  color: string;
  /** Statement cut-off day (credit cards only). */
  cutDay: number | null;
}

/** The slice of a payment method embedded in an expense. */
export type ExpensePaymentMethod = Pick<PaymentMethod, "id" | "name" | "color">;

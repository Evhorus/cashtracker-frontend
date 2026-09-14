/** The expenses feature's cache tags. See dashboard/lib/cache-tags.ts. */
export const EXPENSE_TAGS = {
  /** One envelope's expense list. */
  list: (envelopeId: string) => `expenses-${envelopeId}`,
  /** One expense's detail response - per-id for the reason in ENVELOPE_TAGS. */
  detail: (expenseId: string) => `expense-${expenseId}`,
} as const;

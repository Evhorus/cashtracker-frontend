import { Expense } from "@/features/expenses/types";
import type { CurrencyCode } from "@/lib/format-currency";
import type { PaginationMeta } from "@/lib/pagination";
import type { EnvelopeProgressStatus } from "../lib/envelope-helpers";

export interface EnvelopesResponse {
  data: Envelope[];
  meta: PaginationMeta;
}

export interface Envelope {
  id: string;
  name: string;
  /**
   * Spending limit. `null` means this envelope is an unlimited running
   * counter (no cap, no progress bar) rather than a capped budget.
   */
  amount: string | null;
  /**
   * Fixed at creation time. Every expense in this envelope must use this
   * same currency (enforced by ExpenseForm - never chosen freely).
   */
  currency: CurrencyCode;
  spent: string;
  /**
   * Reported by the API, not derived here. The backend owns the warning
   * threshold and the edge cases so every client - this one, a future
   * mobile app - shows the same status for the same envelope. See
   * src/envelopes/utils/envelope-status.ts in cashtracker-backend.
   */
  status: EnvelopeProgressStatus;
  category?: string;
  description?: string;
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

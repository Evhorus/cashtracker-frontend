import { Expense } from "@/features/expenses/types";
import type { CurrencyCode } from "@/lib/format-currency";
import type { PaginationMeta } from "@/lib/pagination";

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
  category?: string;
  description?: string;
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

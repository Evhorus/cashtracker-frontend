import "server-only";

import {
  ExpensesService,
  type GetExpensesParams,
} from "@/features/expenses/services/expenses.service";

/**
 * Read path for one envelope's expense list - see
 * envelopes/data/get-envelopes.ts for why this is a plain server-only
 * function rather than a Server Action.
 *
 * Errors propagate. This previously caught everything and returned an
 * empty page of results, so a backend outage rendered the expense
 * list's own empty state - "No hay gastos registrados / Comienza
 * agregando tu primer gasto" - telling a user whose data was fine that
 * they had none. A thrown error reaches dashboard/error.tsx instead,
 * which says something went wrong and offers a retry.
 */
export const getExpenses = (envelopeId: string, params: GetExpensesParams) =>
  ExpensesService.getAll(envelopeId, params);

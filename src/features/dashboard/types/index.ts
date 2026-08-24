import type { CurrencyCode } from "@/lib/format-currency";

/**
 * One row of the "Actividad reciente" widget on Resumen - the expense
 * itself plus just enough of its parent envelope (name only) to label
 * which envelope it belongs to. Cross-envelope, unlike
 * `Expense` (expenses/types), which always lives inside one envelope's
 * own list.
 */
export interface DashboardRecentExpense {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  date: Date;
  envelopeId: string;
  envelopeName: string;
}

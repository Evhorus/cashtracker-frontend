import Link from "next/link";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { formatShortDate } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/common/typography";
import type { DashboardRecentExpense } from "../types";

interface RecentActivityProps {
  expenses: DashboardRecentExpense[];
  /** Lets the parent grid span this card across both columns when
   * "Sobres en alerta" isn't rendered alongside it - see dashboard/page.tsx. */
  className?: string;
}

// The "Actividad reciente" widget on Resumen (mockup: Main/DesktopDashboard)
// - the last few expenses across every envelope, not scoped to one. Same
// first-letter avatar as ExpenseCard (expenses feature), reused here as a
// plain span since this compact row has no hover actions to make room for.
// Renders nothing when there are no expenses yet - unlike "Sobres en
// alerta" above it on the page, an empty state here ("no activity yet")
// wouldn't tell the user anything the empty envelopes list doesn't already.
export function RecentActivity({ expenses, className }: RecentActivityProps) {
  if (expenses.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-5",
        className,
      )}
    >
      <Heading size="sm">Actividad reciente</Heading>

      <div className="mt-3 space-y-1">
        {expenses.map((expense) => {
          const config = CURRENCY_MAP[expense.currency];
          return (
            <Link
              key={expense.id}
              href={`/dashboard/envelope/${expense.envelopeId}/expenses/${expense.id}`}
              className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <span className="font-mono text-sm font-semibold">
                  {expense.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {expense.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {expense.envelopeName} · {formatShortDate(expense.date)}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm font-semibold">
                {formatCurrency(expense.amount, config)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

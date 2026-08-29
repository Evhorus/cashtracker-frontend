"use client";

import { Expense } from "@/features/expenses/types";
import { Calendar, ChevronRight, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCalendarDate } from "@/lib/date-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { Card, CardContent } from "@/components/ui/card";
import { CardHoverActions } from "@/components/common/card-hover-actions";
import { CardActionButton } from "@/components/common/card-action-button";
import { useState } from "react";
import { UpdateExpenseDialog } from "./update-expense-dialog";
import { DeleteExpenseAlertDialog } from "./delete-expense-alert-dialog";
import { ExpenseActionsMenu } from "./expense-actions-menu";
import type { CurrencyCode } from "@/lib/format-currency";

interface ExpenseCardProps {
  expense: Expense;
  envelopeId: string;
  currency: CurrencyCode;
}

export const ExpenseCard = ({
  expense,
  envelopeId,
  currency,
}: ExpenseCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      {/* No left-border accent bar - same reasoning as envelope-card.tsx.
          border/60 replaces border-0 as the "this card is its own
          thing" cue instead. size="sm" + a single row (was p-5 and a
          grid-cols-1 md:grid-cols-2 that stacked name/date above
          amount/actions on mobile, doubling the row's height there) -
          a list of expenses is scanned many-at-once, so each row stays
          this compact rather than paying full-card padding per line.

          Not a whole-card click into this expense's own detail page
          anymore (was a Card onClick with exclusions for buttons/menus) -
          that made every bit of text on the row, including the amount,
          unselectable-without-navigating. The chevron below is the one
          real click/nav target instead, same as EnvelopeCard's own
          "Ver detalles" - name/date/amount stay plain, selectable text. */}
      <Card
        size="sm"
        className="relative overflow-hidden border-border/60 bg-card/50 shadow-sm transition-colors duration-200 hover:bg-card"
      >
        <CardContent className="flex flex-row items-center gap-3">
          {/* First-letter avatar instead of a generic receipt icon
              repeated identically on every row - lets a scanned list
              of expense names actually be scannable by more than just
              their text. */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <span className="font-mono text-sm font-semibold">
              {expense.name.trim().charAt(0).toUpperCase() || "?"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold">{expense.name}</h4>
            <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatCalendarDate(expense.date)}
            </div>
          </div>

          <span className="shrink-0 font-mono text-sm font-bold text-primary">
            {formatCurrency(+expense.amount, CURRENCY_MAP[currency])}
          </span>

          <Link
            href={`/dashboard/envelope/${envelopeId}/expenses/${expense.id}`}
            aria-label={`Ver detalle de ${expense.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>

          {/* Desktop Actions */}
          <CardHoverActions alwaysVisible>
            <CardActionButton
              icon={Edit}
              label="Editar gasto"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditDialog(true);
              }}
            />
            <CardActionButton
              icon={Trash2}
              label="Eliminar gasto"
              tone="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            />
          </CardHoverActions>

          {/* Mobile Actions (Drawer) - same ExpenseActionsMenu the
              expense detail page uses for its own mobile action
              trigger (see PageHeader's mobileActions there), just
              with a smaller/muted trigger to fit this tighter row.
              Owns its own edit/delete dialogs independently of the
              desktop ones above - harmless since only one of the
              two triggers is ever visible at a time. */}
          <div className="shrink-0 md:hidden">
            <ExpenseActionsMenu
              envelopeId={envelopeId}
              currency={currency}
              expense={expense}
              triggerClassName="h-8 w-8 text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <UpdateExpenseDialog
        envelopeId={envelopeId}
        currency={currency}
        expense={expense}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteExpenseAlertDialog
        envelopeId={envelopeId}
        expenseId={expense.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};

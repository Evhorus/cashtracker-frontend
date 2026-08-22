"use client";

import { Expense } from "@/features/expenses/types";
import { Calendar, Edit, Receipt, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { Card, CardContent } from "@/components/ui/card";
import { ActionsDrawer, ActionItem } from "@/components/common/actions-drawer";
import { useState } from "react";
import { UpdateExpenseDialog } from "./update-expense-dialog";
import { DeleteExpenseAlertDialog } from "./delete-expense-alert-dialog";
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
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Prevent navigation if click comes from a Portal (like Drawer/Menu overlay)
    // The target is not a DOM descendant of the currentTarget (the card)
    if (!e.currentTarget.contains(target)) return;

    // Check if the click originated from an action element or standard interactables
    if (
      target.closest("[data-no-nav]") ||
      target.closest("button") ||
      target.closest("[role='menuitem']") ||
      target.tagName === "A"
    ) {
      return;
    }

    router.push(`${envelopeId}/expenses/${expense.id}`);
  };

  const actions: ActionItem[] = [
    {
      label: "Editar Gasto",
      icon: Edit,
      onClick: () => setShowEditDialog(true),
    },
    {
      label: "Eliminar Gasto",
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <Card
        className="group relative overflow-hidden border-0 bg-card/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-lg"
        onClick={handleCardClick}
      >
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary/60 transition-colors duration-300 group-hover:bg-primary" />

        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className="shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Receipt className="h-6 w-6" />
              </div>
            </div>

            {/* Main Content */}
            <div className="grid min-w-0 flex-1 grid-cols-1 items-center gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <h4 className="truncate text-lg font-bold transition-colors group-hover:text-primary">
                  {expense.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-2 py-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount and Actions */}
              <div className="flex items-center justify-between gap-6 md:justify-end">
                <span className="text-xl font-bold tracking-tight text-primary md:text-2xl">
                  {formatCurrency(+expense.amount, CURRENCY_MAP[currency])}
                </span>

                {/* Desktop Actions */}
                <div className="hidden translate-x-2 items-center gap-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>

                {/* Mobile Actions (Drawer) */}
                <div className="md:hidden">
                  <div data-no-nav>
                    <ActionsDrawer
                      actions={actions}
                      title="Opciones de Gasto"
                      triggerClassName="h-8 w-8 text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
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

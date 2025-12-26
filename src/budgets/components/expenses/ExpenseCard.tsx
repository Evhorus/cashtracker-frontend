"use client";

import { Expense } from "@/budgets/types";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/shared/lib/format-date";
import { formatCurrency } from "@/shared/lib/format-currency";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ActionsDrawer, ActionItem } from "@/shared/components/ActionsDrawer";
import { useState } from "react";
import { UpdateExpenseDialog } from "./UpdateExpenseDialog";
import { DeleteExpenseAlertDialog } from "./DeleteExpenseAlertDialog";

interface ExpenseCardProps {
  expense: Expense;
  budgetId: string;
}

export const ExpenseCard = ({ expense, budgetId }: ExpenseCardProps) => {
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

    router.push(`${budgetId}/expenses/${expense.id}`);
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
        className="group relative overflow-hidden border-l-4 border-l-primary/60 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-l-primary hover:-translate-y-0.5"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            {/* Left: Name and Date */}
            <div className="flex-1 min-w-0 space-y-1 pr-10 md:pr-0">
              <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                {expense.name}
              </h4>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDate(expense.date)}</span>
              </div>
            </div>

            {/* Right: Amount and Actions */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
              <span className="text-lg md:text-xl font-bold text-primary">
                {formatCurrency(+expense.amount)}
              </span>

              {/* Actions: Absolute top-right on mobile, static on desktop */}
              <div data-no-nav className="absolute top-3.5 right-2 md:static">
                <ActionsDrawer
                  actions={actions}
                  title="Opciones de Gasto"
                  triggerClassName="md:bg-transparent bg-secondary/50 hover:bg-secondary h-8 w-8 md:h-9 md:w-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <UpdateExpenseDialog
        budgetId={budgetId}
        expense={expense}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteExpenseAlertDialog
        budgetId={budgetId}
        expenseId={expense.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};

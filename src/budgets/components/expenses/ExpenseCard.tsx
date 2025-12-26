"use client";

import { Expense } from "@/budgets/types";
import { Calendar, Edit, Receipt, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
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
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm hover:bg-card"
        onClick={handleCardClick}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/60 group-hover:bg-primary transition-colors duration-300" />

        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className="shrink-0">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Receipt className="h-6 w-6" />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                  {expense.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-md">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount and Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-primary">
                  {formatCurrency(+expense.amount)}
                </span>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Expense } from "@/features/expenses/types";
import { UpdateExpenseDialog } from "./update-expense-dialog";
import { DeleteExpenseAlertDialog } from "./delete-expense-alert-dialog";
import { ActionsDrawer, ActionItem } from "@/components/common/actions-drawer";
import type { CurrencyCode } from "@/lib/format-currency";

interface ExpenseActionsMenuProps {
  envelopeId: string;
  currency: CurrencyCode;
  expense: Expense;
  /** expense-card.tsx needs a smaller, muted trigger to fit its tighter
   * row layout; left undefined (ActionsDrawer's own default) everywhere
   * else, e.g. the expense detail page's header. */
  triggerClassName?: string;
}

export const ExpenseActionsMenu = ({
  envelopeId,
  currency,
  expense,
  triggerClassName,
}: ExpenseActionsMenuProps) => {
  const t = useTranslations("expenses");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const actions: ActionItem[] = [
    {
      label: t("editAria"),
      icon: Edit,
      onClick: () => setShowEditDialog(true),
    },
    {
      label: t("deleteAria"),
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
    },
  ];

  return (
    <>
      <ActionsDrawer
        actions={actions}
        title={t("optionsMenu")}
        triggerClassName={triggerClassName}
      />

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

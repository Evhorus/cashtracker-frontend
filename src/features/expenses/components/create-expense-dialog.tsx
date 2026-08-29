"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { Button } from "@/components/ui/button";
import { useActionDialog } from "@/hooks/useActionDialog";
import { ExpenseForm } from "./expense-form";
import { createExpenseAction } from "@/features/expenses/actions/create-expense.action";
import { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import { resolveIcon } from "@/features/categories/lib/icon-registry";
import type { EnvelopeCategory } from "@/features/envelopes/types";
import { withAlpha } from "@/features/categories/lib/with-alpha";
import type { CurrencyCode } from "@/lib/format-currency";

interface CreateExpenseDialogProps {
  envelopeId: string;
  currency: CurrencyCode;
  /** Optional context for the dialog's subtitle - only
   * the one call site that already has the envelope object on hand
   * (envelope/[envelopeId]/page.tsx) passes these; without them the
   * subtitle falls back to the generic copy it always had. */
  envelopeName?: string;
  envelopeCategory?: EnvelopeCategory | null;
}

function ExpenseDialogSubtitle({
  envelopeName,
  envelopeCategory,
}: {
  envelopeName: string;
  /** The envelope's category as the API reports it - no longer a label
   * this component has to resolve against the category list itself. */
  envelopeCategory?: EnvelopeCategory | null;
}) {
  const t = useTranslations("expenses.createDialog");
  // On an object, not a capitalized local - see category-badge.tsx.
  const def = envelopeCategory
    ? { ...envelopeCategory, Icon: resolveIcon(envelopeCategory.icon) }
    : null;
  return (
    <span className="flex items-center gap-1.5">
      {def && (
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md"
          style={{ background: withAlpha(def.color, 0.18), color: def.color }}
        >
          <def.Icon className="h-2.5 w-2.5" />
        </span>
      )}
      {t.rich("forEnvelope", {
        name: () => <b className="font-semibold">{envelopeName}</b>,
      })}
    </span>
  );
}

export const CreateExpenseDialog = ({
  envelopeId,
  currency,
  envelopeName,
  envelopeCategory,
}: CreateExpenseDialogProps) => {
  const t = useTranslations("expenses");
  const [open, setOpen] = useState(false);

  const { dispatch, isPending } = useActionDialog(
    createExpenseAction,
    { errors: [], success: "" },
    { setOpen },
  );

  const handleCreate = async (expenseFormValues: ExpenseFormValues) => {
    dispatch({ ...expenseFormValues, envelopeId });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("createDialog.title")}
      description={
        envelopeName ? (
          <ExpenseDialogSubtitle
            envelopeName={envelopeName}
            envelopeCategory={envelopeCategory}
          />
        ) : (
          t("createDialog.fallbackDescription")
        )
      }
      dialogClassName="sm:max-w-125"
      trigger={
        <Button variant="default" size="lg">
          <Plus />
          <span className="hidden sm:inline-block">{t("add")}</span>
        </Button>
      }
    >
      <ExpenseForm
        currency={currency}
        onSubmit={handleCreate}
        isLoading={isPending}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};

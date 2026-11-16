"use client";

import { useTranslations } from "next-intl";
import { ResponsiveFormSheet } from "@/shared/components/common/responsive-form-sheet";
import { useActionDialog } from "@/shared/hooks/useActionDialog";
import { createPaymentMethodAction } from "../actions/create-payment-method.action";
import { updatePaymentMethodAction } from "../actions/update-payment-method.action";
import type { PaymentMethodFormValues } from "../schemas/payment-method.schema";
import type { PaymentMethod } from "../types";
import { PaymentMethodForm } from "./payment-method-form";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present to edit, absent to create. */
  paymentMethod?: PaymentMethod;
}

/** Create or edit a payment method; opened from the account section or
 * from the expense form's "+ Nuevo". */
export function PaymentMethodDialog({
  open,
  onOpenChange,
  paymentMethod,
}: PaymentMethodDialogProps) {
  const t = useTranslations("paymentMethods");
  const isEdit = Boolean(paymentMethod);
  const create = useActionDialog(
    createPaymentMethodAction,
    { errors: [], success: "" },
    { setOpen: onOpenChange },
  );
  const update = useActionDialog(
    updatePaymentMethodAction,
    { errors: [], success: "" },
    { setOpen: onOpenChange },
  );

  const handleSubmit = (values: PaymentMethodFormValues) => {
    if (paymentMethod) {
      update.dispatch({ ...values, id: paymentMethod.id });
    } else {
      create.dispatch(values);
    }
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t(isEdit ? "updateDialog.title" : "createDialog.title")}
      description={t(
        isEdit ? "updateDialog.description" : "createDialog.description",
      )}
    >
      <PaymentMethodForm
        defaultValues={
          paymentMethod && {
            name: paymentMethod.name,
            type: paymentMethod.type,
            color: paymentMethod.color,
            cutDay: paymentMethod.cutDay?.toString() ?? "",
          }
        }
        isLoading={create.isPending || update.isPending}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveFormSheet>
  );
}

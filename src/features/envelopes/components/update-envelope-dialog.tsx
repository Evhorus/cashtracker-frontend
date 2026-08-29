"use client";
import { CardActionButton } from "@/components/common/card-action-button";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EnvelopeForm } from "./envelope-form";
import { useActionDialog } from "@/hooks/useActionDialog";
import { EnvelopeFormValues } from "@/features/envelopes/schemas/envelope.schema";
import { Envelope } from "@/features/envelopes/types";
import { updateEnvelopeAction } from "@/features/envelopes/actions/update-envelope.action";

interface UpdateEnvelopeDialogProps {
  envelope: Envelope;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override the default trigger's a11y label (envelopes.editAria) -
   * the envelope detail page passes the shorter common.edit since
   * there's only one edit button on that page, no ambiguity to
   * resolve. */
  label?: string;
  /** See CardActionButton - only the envelope detail page's header
   * turns this on. */
  showLabelOnDesktop?: boolean;
}

export const UpdateEnvelopeDialog = ({
  envelope,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  label,
  showLabelOnDesktop,
}: UpdateEnvelopeDialogProps) => {
  const t = useTranslations("envelopes");
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const { dispatch, isPending } = useActionDialog(
    updateEnvelopeAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen,
    },
  );

  const handleUpdate = async (envelopeFormValues: EnvelopeFormValues) => {
    dispatch({ ...envelopeFormValues, id: envelope.id });
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("updateDialog.title")}
      description={t("updateDialog.description")}
      trigger={
        isControlled ? undefined : (
          <CardActionButton
            icon={Edit}
            label={label ?? t("editAria")}
            showLabelOnDesktop={showLabelOnDesktop}
          />
        )
      }
    >
      <EnvelopeForm
        defaultValues={{
          name: envelope.name,
          hasLimit: envelope.amount !== null,
          amount: envelope.amount ?? "",
          // Missing before: EnvelopeForm's own default is "COP", so
          // editing any non-COP envelope silently pre-selected the
          // wrong currency in the dropdown - saving without manually
          // re-picking the right one would have overwritten the
          // envelope's real currency with COP.
          currency: envelope.currency,
          categoryId: envelope.category?.id ?? "",
        }}
        isLoading={isPending}
        onSubmit={handleUpdate}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};

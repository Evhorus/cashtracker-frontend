"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { useActionDialog } from "@/hooks/useActionDialog";
import { EnvelopeForm } from "./envelope-form";
import { EnvelopeFormValues } from "@/features/envelopes/schemas/envelope.schema";

import { createEnvelopeAction } from "@/features/envelopes/actions/create-envelope.action";

export const CreateEnvelopeDialog = () => {
  const t = useTranslations("envelopes");
  const [open, setOpen] = useState(false);

  const { dispatch, isPending } = useActionDialog(
    createEnvelopeAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen,
    },
  );

  const handleCreate = async (envelopeFormValues: EnvelopeFormValues) => {
    dispatch(envelopeFormValues);
  };

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={setOpen}
      title={t("createDialog.title")}
      description={t("createDialog.description")}
      trigger={
        <Button variant="default" size="lg">
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">{t("new")}</span>
        </Button>
      }
    >
      <EnvelopeForm
        isLoading={isPending}
        onSubmit={handleCreate}
        onCloseDialog={() => setOpen(false)}
      />
    </ResponsiveFormSheet>
  );
};

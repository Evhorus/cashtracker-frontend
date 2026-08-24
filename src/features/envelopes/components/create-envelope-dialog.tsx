"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveFormSheet } from "@/components/common/responsive-form-sheet";
import { useActionDialog } from "@/hooks/useActionDialog";
import { EnvelopeForm } from "./envelope-form";
import { EnvelopeFormValues } from "@/features/envelopes/schemas/envelope.schema";

import { createEnvelopeAction } from "@/features/envelopes/actions/create-envelope.action";

export const CreateEnvelopeDialog = () => {
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
      title="Crear"
      description="Aquí puedes crear un sobre"
      trigger={
        <Button variant="default" size="lg">
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">Nuevo Sobre</span>
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

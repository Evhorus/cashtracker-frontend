"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
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
}

export const UpdateEnvelopeDialog = ({
  envelope,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateEnvelopeDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

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
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
            </Button>
          }
        />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar</DialogTitle>
          <DialogDescription>
            Aquí puedes editar el presupuesto
          </DialogDescription>
        </DialogHeader>
        <EnvelopeForm
          defaultValues={{
            name: envelope.name,
            hasLimit: envelope.amount !== null,
            amount: envelope.amount ?? "",
            category: envelope.category || "",
          }}
          isLoading={isPending}
          onSubmit={handleUpdate}
          onCloseDialog={() => setOpen?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

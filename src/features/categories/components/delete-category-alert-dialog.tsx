"use client";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CardActionButton } from "@/components/common/card-action-button";
import { useActionDialog } from "@/hooks/useActionDialog";
import { deleteCategoryAction } from "@/features/categories/actions/delete-category.action";

interface DeleteCategoryAlertDialogProps {
  id: string;
  label: string;
}

// Simpler than DeleteEnvelopeAlertDialog (no "type the name to confirm")
// - deleting a category doesn't cascade-delete anything (envelope.category
// stays free text; existing envelopes just fall back to the "Otros" look,
// same as any unrecognized category text already does).
export const DeleteCategoryAlertDialog = ({
  id,
  label,
}: DeleteCategoryAlertDialogProps) => {
  const [open, setOpen] = useState(false);
  const { dispatch, isPending } = useActionDialog(
    deleteCategoryAction,
    { errors: [], success: "" },
    { setOpen },
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <CardActionButton
            icon={Trash2}
            label="Eliminar categoría"
            tone="destructive"
          />
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará <span className="font-medium text-foreground">{label}</span>.
            Los sobres que ya la usan no se modifican, solo dejan de tenerla
            disponible para elegir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            onClick={(e) => {
              e.preventDefault();
              dispatch(id);
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

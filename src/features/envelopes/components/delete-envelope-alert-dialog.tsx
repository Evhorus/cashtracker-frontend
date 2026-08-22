"use client";
import { deleteEnvelopeAction } from "@/features/envelopes/actions/delete-envelope.action";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionDialog } from "@/hooks/useActionDialog";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface DeleteEnvelopeAlertDialogProps {
  id: string;
  name: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DeleteEnvelopeAlertDialog = ({
  id,
  name,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeleteEnvelopeAlertDialogProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { dispatch, isPending } = useActionDialog(
    deleteEnvelopeAction,
    {
      errors: [],
      success: "",
    },
    {
      setOpen: (open) => {
        if (controlledOpen === undefined) {
          setInternalOpen(open);
        } else {
          setControlledOpen?.(open);
        }
      },
      onSuccess: () => {
        setInputValue("");

        if (pathname.startsWith("/dashboard/envelope/")) {
          router.replace("/dashboard/envelopes");
        } else {
          router.refresh();
        }
      },
    },
  );

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const handleDeleteEnvelope = async () => {
    dispatch(id);
  };

  const Content = (
    <div className="my-2 space-y-2">
      <p className="text-sm text-muted-foreground">
        Escribe <span className="font-bold text-foreground">{name}</span> para
        confirmar:
      </p>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Nombre del presupuesto"
        className="col-span-3"
        autoComplete="off"
      />
    </div>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <AlertDialogTrigger
          render={
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
            </Button>
          }
        />
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminarán todos los gastos
            asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {Content}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteEnvelope();
            }}
            disabled={isPending || inputValue !== name}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

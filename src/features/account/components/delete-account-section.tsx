"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/common/error-message";
import { Input } from "@/components/ui/input";
import { useDeleteAccount } from "../hooks/use-delete-account";
import type { AccountUser } from "../types";

interface DeleteAccountSectionProps {
  user: AccountUser;
}

// Same "type it to confirm" idiom as
// features/envelopes/components/delete-envelope-alert-dialog.tsx, using
// the user's own email as the string to type - there's no shorter name
// to reuse here the way an envelope/expense has one.
export function DeleteAccountSection({ user }: DeleteAccountSectionProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const { isDeleting, error, deleteAccount } = useDeleteAccount();

  const canConfirm = confirmation.trim() === user.email;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setConfirmation("");
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>Eliminar cuenta</CardTitle>
        <CardDescription>
          Elimina tu cuenta y todos tus datos de forma permanente. Esta acción
          no se puede deshacer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
          <AlertDialogTrigger
            render={
              <Button variant="destructive">
                <Trash2 />
                Eliminar cuenta
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará tu cuenta y todos
                tus sobres y gastos.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <div className="my-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                Escribe{" "}
                <span className="font-bold text-foreground">{user.email}</span>{" "}
                para confirmar:
              </p>
              <Input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Tu email"
                autoComplete="off"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
                disabled={!canConfirm || isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  deleteAccount();
                }}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Eliminar cuenta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

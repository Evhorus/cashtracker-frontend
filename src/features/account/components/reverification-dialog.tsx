"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ErrorMessage } from "@/components/common/error-message";
import { FormInput } from "@/components/common/form-input";
import { OtpInput } from "@/components/common/otp-input";
import { SubmitButton } from "@/components/common/submit-button";
import { useReverificationFlow } from "../hooks/use-reverification-flow";
import {
  type ReverificationCodeFormValues,
  reverificationCodeFormSchema,
  type ReverificationPasswordFormValues,
  reverificationPasswordFormSchema,
} from "../schemas/account.schema";
import type { ReverificationRequest } from "../types";

interface ReverificationDialogProps {
  request: ReverificationRequest | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Our own UI for Clerk's reverification flow, instead of the modal
// useReverification() shows by default - see point 1 of
// docs/pending-account-reverification-and-sessions-ui.md. Rendered once by
// ReverificationProvider; all the actual Clerk calls live in
// useReverificationFlow, this component only renders whatever that hook
// says the account needs right now.
export function ReverificationDialog({
  request,
  onOpenChange,
  onSuccess,
}: ReverificationDialogProps) {
  const {
    factor,
    isPreparing,
    isSubmitting,
    isResending,
    fieldErrors,
    globalErrors,
    submitPassword,
    submitCode,
    resendCode,
  } = useReverificationFlow(request, onSuccess);

  const passwordForm = useForm<ReverificationPasswordFormValues>({
    resolver: zodResolver(reverificationPasswordFormSchema),
    defaultValues: { password: "" },
  });
  const codeForm = useForm<ReverificationCodeFormValues>({
    resolver: zodResolver(reverificationCodeFormSchema),
    defaultValues: { code: "" },
  });

  // A fresh request always starts from a clean slate - without this, a
  // second reverification later in the session would reopen showing
  // whatever the previous attempt left behind.
  useEffect(() => {
    passwordForm.reset();
    codeForm.reset();
  }, [request, passwordForm, codeForm]);

  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirma que eres tú</DialogTitle>
          <DialogDescription>
            {factor?.kind === "email_code"
              ? `Enviamos un código a ${factor.safeIdentifier}`
              : "Por seguridad, confirma tu identidad para continuar"}
          </DialogDescription>
        </DialogHeader>

        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        {isPreparing && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isPreparing && factor?.kind === "password" && (
          <form
            onSubmit={passwordForm.handleSubmit((values) =>
              submitPassword(values.password),
            )}
            className="grid gap-y-4"
          >
            <FormInput
              control={passwordForm.control}
              name="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              autoFocus
              disabled={isSubmitting}
              serverError={fieldErrors.password}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <SubmitButton type="submit" isLoading={isSubmitting}>
                Verificar
              </SubmitButton>
            </DialogFooter>
          </form>
        )}

        {!isPreparing && factor?.kind === "email_code" && (
          <form
            onSubmit={codeForm.handleSubmit((values) =>
              submitCode(values.code),
            )}
            className="grid gap-y-4"
          >
            <Controller
              control={codeForm.control}
              name="code"
              render={({ field, fieldState }) => {
                const message = fieldState.error?.message ?? fieldErrors.code;
                return (
                  <Field>
                    <FieldLabel htmlFor="code">Código</FieldLabel>
                    <OtpInput
                      id="code"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                      autoFocus
                      aria-invalid={fieldState.invalid || !!fieldErrors.code}
                    />
                    {message && <FieldError>{message}</FieldError>}
                  </Field>
                );
              }}
            />
            <Button
              type="button"
              variant="link"
              className="h-auto w-fit p-0 text-sm"
              disabled={isResending}
              onClick={resendCode}
            >
              {isResending && <Loader2 className="animate-spin" />}
              Reenviar código
            </Button>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <SubmitButton type="submit" isLoading={isSubmitting}>
                Verificar
              </SubmitButton>
            </DialogFooter>
          </form>
        )}

        {/* No factor and no longer preparing - startVerification came back
            with nothing this dialog knows how to collect (see
            use-reverification-flow.ts). Still needs a way out. */}
        {!isPreparing && !factor && globalErrors.length > 0 && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

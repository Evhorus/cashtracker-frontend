"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/common/error-message";
import { FormInput } from "@/components/common/form-input";
import { SubmitButton } from "@/components/common/submit-button";
import { useUpdatePassword } from "../hooks/use-update-password";
import {
  type PasswordFormValues,
  passwordFormSchema,
} from "../schemas/account.schema";

export function PasswordSection() {
  const { isUpdating, fieldErrors, globalErrors, updatePassword } =
    useUpdatePassword();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordFormValues) {
    const { error } = await updatePassword(values);
    if (!error) {
      form.reset();
      toast.success("Contraseña actualizada");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contraseña</CardTitle>
        <CardDescription>Actualiza la contraseña de tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid max-w-sm gap-y-4"
        >
          <FormInput
            control={form.control}
            name="currentPassword"
            label="Contraseña actual"
            type="password"
            autoComplete="current-password"
            disabled={isUpdating}
            serverError={fieldErrors.currentPassword}
          />
          <FormInput
            control={form.control}
            name="newPassword"
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            disabled={isUpdating}
            serverError={fieldErrors.newPassword}
          />
          <FormInput
            control={form.control}
            name="confirmPassword"
            label="Confirma tu nueva contraseña"
            type="password"
            autoComplete="new-password"
            disabled={isUpdating}
          />
          <SubmitButton type="submit" isLoading={isUpdating} className="w-fit">
            Actualizar contraseña
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

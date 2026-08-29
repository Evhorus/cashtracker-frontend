"use client";

import { useTranslations } from "next-intl";
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
  buildPasswordFormSchema,
} from "../schemas/account.schema";

export function PasswordSection() {
  const t = useTranslations("account.password");
  const tValidation = useTranslations("validation");
  const { isUpdating, fieldErrors, globalErrors, updatePassword } =
    useUpdatePassword();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(buildPasswordFormSchema(tValidation)),
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
      toast.success(t("savedToast"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
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
            label={t("current")}
            type="password"
            autoComplete="current-password"
            disabled={isUpdating}
            serverError={fieldErrors.currentPassword}
          />
          <FormInput
            control={form.control}
            name="newPassword"
            label={t("new")}
            type="password"
            autoComplete="new-password"
            disabled={isUpdating}
            serverError={fieldErrors.newPassword}
          />
          <FormInput
            control={form.control}
            name="confirmPassword"
            label={t("confirm")}
            type="password"
            autoComplete="new-password"
            disabled={isUpdating}
          />
          <SubmitButton type="submit" isLoading={isUpdating} className="w-fit">
            {t("submit")}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/common/submit-button";
import { FormInput } from "@/components/common/form-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  buildEnvelopeFormSchema,
  EnvelopeFormValues,
} from "@/features/envelopes/schemas/envelope.schema";
import { PriceInput } from "@/components/common/price-input";
import { CurrencySelector } from "@/components/common/currency-selector";
import { CategoryPicker } from "@/features/categories/components/category-picker";
import { CURRENCY_MAP, DEFAULT_CURRENCY_CONFIG } from "@/lib/format-currency";

interface EnvelopeFormProps {
  defaultValues?: Partial<EnvelopeFormValues>;
  isLoading: boolean;
  onSubmit: (envelopeFormValues: EnvelopeFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

export const EnvelopeForm = ({
  defaultValues,
  isLoading,
  onSubmit,
  onCloseDialog,
}: EnvelopeFormProps) => {
  const tValidation = useTranslations("validation");
  const t = useTranslations("envelopes.form");
  const tCommon = useTranslations("common");
  const { handleSubmit, control } = useForm<EnvelopeFormValues>({
    resolver: zodResolver(buildEnvelopeFormSchema(tValidation)),
    defaultValues: {
      name: "",
      hasLimit: true,
      amount: "",
      currency: "COP",
      categoryId: "",
      ...defaultValues,
    },
  });

  const selectedCurrency = useWatch({
    control,
    name: "currency",
  });

  const hasLimit = useWatch({
    control,
    name: "hasLimit",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <div className="flex flex-col gap-6">
            <FormInput
              control={control}
              name="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Controller
                control={control}
                name="currency"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="currency">{t("currency")}</FieldLabel>
                    <CurrencySelector
                      {...field}
                      id="currency"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="hasLimit"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="hasLimit"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                    <FieldLabel htmlFor="hasLimit" className="font-normal">
                      {t("hasLimit")}
                    </FieldLabel>
                  </div>
                </Field>
              )}
            />

            {hasLimit && (
              <Controller
                control={control}
                name="amount"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="amount">{t("amount")}</FieldLabel>
                    <PriceInput
                      id="amount"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      currencyConfig={
                        selectedCurrency
                          ? CURRENCY_MAP[selectedCurrency]
                          : DEFAULT_CURRENCY_CONFIG
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}
          </div>
          <Controller
            control={control}
            name="categoryId"
            render={({ field, fieldState }) => (
              <Field className="md:col-span-4">
                <FieldLabel htmlFor="categoryId">{t("category")}</FieldLabel>
                <CategoryPicker
                  {...field}
                  id="categoryId"
                  aria-invalid={fieldState.invalid}
                  disabled={isLoading}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldSet>

        <Field orientation="responsive">
          <SubmitButton isLoading={isLoading} type="submit">
            {tCommon("save")}
          </SubmitButton>
          <Button
            type="button"
            variant="outline"
            onClick={onCloseDialog}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

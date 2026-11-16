"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { SubmitButton } from "@/shared/components/common/submit-button";
import { FormInput } from "@/shared/components/common/form-input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { useCategoryOptions } from "@/features/categories/providers/categories-provider";
import { useIsDesktop } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import {
  buildPaymentMethodFormSchema,
  type PaymentMethodFormValues,
} from "../schemas/payment-method.schema";
import { PAYMENT_METHOD_TYPES } from "../types";

interface PaymentMethodFormProps {
  defaultValues?: Partial<PaymentMethodFormValues>;
  isLoading: boolean;
  onSubmit: (values: PaymentMethodFormValues) => void;
  onCancel: () => void;
}

export function PaymentMethodForm({
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
}: PaymentMethodFormProps) {
  const t = useTranslations("paymentMethods");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const isDesktop = useIsDesktop();
  // Same colour whitelist as categories - the backend validates both
  // against it.
  const { colors } = useCategoryOptions();

  const { control, handleSubmit } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(buildPaymentMethodFormSchema(tValidation)),
    defaultValues: {
      name: "",
      type: "credit_card",
      color: colors[0],
      cutDay: "",
      ...defaultValues,
    },
  });
  const type = useWatch({ control, name: "type" });

  return (
    // stopPropagation: this form can open from inside the expense form's
    // drawer, and a submit must not also submit the expense.
    <form
      onSubmit={(event) => {
        event.stopPropagation();
        void handleSubmit(onSubmit)(event);
      }}
    >
      <FieldGroup>
        <FieldSet>
          <div className="flex flex-col gap-6">
            <FormInput
              control={control}
              name="name"
              label={t("form.name")}
              placeholder={t("form.namePlaceholder")}
              autoComplete="off"
              autoFocus={isDesktop}
              disabled={isLoading}
            />

            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="payment-method-type">
                    {t("form.type")}
                  </FieldLabel>
                  <select
                    id="payment-method-type"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    disabled={isLoading}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base md:text-sm dark:bg-input/30"
                  >
                    {PAYMENT_METHOD_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {t(`types.${value}`)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            />

            {type === "credit_card" && (
              <Controller
                control={control}
                name="cutDay"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="payment-method-cut-day">
                      {t("form.cutDay")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="payment-method-cut-day"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={31}
                      aria-invalid={fieldState.invalid}
                      aria-describedby="payment-method-cut-day-hint"
                      disabled={isLoading}
                    />
                    <FieldDescription id="payment-method-cut-day-hint">
                      {t("form.cutDayHint")}
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}

            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Field>
                  <FieldLabel id="payment-method-color">
                    {t("form.color")}
                  </FieldLabel>
                  <div
                    role="radiogroup"
                    aria-labelledby="payment-method-color"
                    className="flex flex-wrap gap-2"
                  >
                    {colors.map((color, index) => {
                      const selected = field.value === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={`${t("form.color")} ${index + 1}`}
                          disabled={isLoading}
                          onClick={() => field.onChange(color)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform",
                            selected
                              ? "scale-110 border-foreground/80"
                              : "border-transparent",
                          )}
                          style={{ background: color }}
                        >
                          {selected && (
                            <Check className="h-4 w-4 text-white drop-shadow" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
            />
          </div>
        </FieldSet>

        <Field orientation="responsive">
          <SubmitButton isLoading={isLoading} type="submit">
            {tCommon("save")}
          </SubmitButton>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

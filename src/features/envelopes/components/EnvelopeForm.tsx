"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/common/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import {
  envelopeFormSchema,
  EnvelopeFormValues,
} from "@/features/envelopes/schemas/envelope.schema";
import { PriceInput } from "@/components/common/PriceInput";
import { CurrencySelector } from "@/components/common/CurrencySelector";
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
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EnvelopeFormValues>({
    resolver: zodResolver(envelopeFormSchema),
    defaultValues: {
      name: "",
      hasLimit: true,
      amount: "",
      currency: "COP",
      category: "",
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
          <FieldSet>
            <div className="flex flex-col gap-6">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="name">
                      Nombre del presupuesto
                    </FieldLabel>
                    <Input
                      id="name"
                      placeholder="Ej: Gastos del hogar"
                      autoComplete="off"
                      autoFocus
                      {...field}
                      disabled={isLoading}
                    />
                    {errors.name?.message && (
                      <ErrorMessage>{errors.name.message}</ErrorMessage>
                    )}
                  </Field>
                )}
              />

              <div className="flex flex-col gap-4 sm:flex-row">
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="currency">Moneda</FieldLabel>
                      <CurrencySelector
                        {...field}
                        id="currency"
                        disabled={isLoading}
                      />
                      {errors.currency?.message && (
                        <ErrorMessage>{errors.currency.message}</ErrorMessage>
                      )}
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
                        Este presupuesto tiene un límite de gasto
                      </FieldLabel>
                    </div>
                  </Field>
                )}
              />

              {hasLimit && (
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="amount">Monto</FieldLabel>
                      <PriceInput
                        id="amount"
                        {...field}
                        disabled={isLoading}
                        currencyConfig={
                          selectedCurrency
                            ? CURRENCY_MAP[selectedCurrency]
                            : DEFAULT_CURRENCY_CONFIG
                        }
                      />
                      {errors.amount?.message && (
                        <ErrorMessage>{errors.amount.message}</ErrorMessage>
                      )}
                    </Field>
                  )}
                />
              )}
            </div>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Field className="md:col-span-4">
                  <FieldLabel htmlFor="category">
                    Categoría (opcional)
                  </FieldLabel>
                  <Input
                    id="category"
                    placeholder="Ej: Hogar, Entretenimiento"
                    type="text"
                    autoComplete="off"
                    {...field}
                    disabled={isLoading}
                  />
                </Field>
              )}
            />
          </FieldSet>
        </FieldSet>

        <Field orientation="responsive">
          <Button isLoading={isLoading} type="submit">
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCloseDialog}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

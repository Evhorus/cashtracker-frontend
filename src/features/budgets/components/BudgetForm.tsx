"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import {
  budgetFormSchema,
  BudgetFormValues,
} from "@/features/budgets/schemas/budget.schema";
import { PriceInput } from "@/shared/components/PriceInput";
import { CurrencySelector } from "@/shared/components/CurrencySelector";
import { CURRENCY_MAP, DEFAULT_CURRENCY_CONFIG } from "@/shared/lib/format-currency";

interface BudgetFormProps {
  defaultValues?: Partial<BudgetFormValues>;
  isLoading: boolean;
  onSubmit: (budgetFormValues: BudgetFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

export const BudgetForm = ({
  defaultValues,
  isLoading,
  onSubmit,
  onCloseDialog,
}: BudgetFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
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
                    <FieldLabel htmlFor="name">Nombre del presupuesto</FieldLabel>
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

              <div className="flex flex-col sm:flex-row gap-4">
                
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
                            selectedCurrency ? CURRENCY_MAP[selectedCurrency] : DEFAULT_CURRENCY_CONFIG
                          }
                        />
                        {errors.amount?.message && (
                          <ErrorMessage>{errors.amount.message}</ErrorMessage>
                        )}
                      </Field>
                    )}
                  />
                
                
              </div>
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

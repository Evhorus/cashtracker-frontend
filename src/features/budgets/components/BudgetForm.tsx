"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
      category: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit!)}>
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
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

            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="amount">Monto</FieldLabel>
                  <PriceInput id="amount" {...field} disabled={isLoading} />
                  {errors.amount?.message && (
                    <ErrorMessage>{errors.amount.message}</ErrorMessage>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Field>
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
          </FieldGroup>
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

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
import { Expense } from "@/budgets/types";

import {
  ExpenseFormValues,
  expenseSchema,
} from "@/budgets/schemas/expense.schema";
import { Textarea } from "@/shared/components/ui/textarea";
import { PriceInput } from "@/shared/components/PriceInput";

interface BudgetFormProps {
  expense: Expense;
  isLoading: boolean;
  onSubmit: (expenseFormValues: ExpenseFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

export const ExpenseForm = ({
  expense,
  isLoading,
  onSubmit,
  onCloseDialog,
}: BudgetFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      ...expense,
      description: expense.description ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="name">Nombre del gasto</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Ej: Compra supermercado"
                    autoComplete="off"
                    autoFocus
                    disabled={isLoading}
                  />
                  {errors.name?.message && (
                    <ErrorMessage>{errors.name.message}</ErrorMessage>
                  )}
                </Field>
              )}
            />

            <FieldGroup className="flex flex-col sm:flex-row">
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
                name="date"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="expense-date">Fecha</FieldLabel>
                    <Input
                      {...field}
                      value={
                        field.value instanceof Date
                          ? field.value.toISOString().split("T")[0]
                          : field.value
                      }
                      id="expense-date"
                      type="date"
                      disabled={isLoading}
                    />
                    {errors.date?.message && (
                      <ErrorMessage>{errors.date.message}</ErrorMessage>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldGroup>

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="expense-description">
                  Descripción (opcional)
                </FieldLabel>
                <Textarea
                  {...field}
                  id="expense-description"
                  placeholder="Añade detalles del gasto..."
                  rows={3}
                  disabled={isLoading}
                />
                {errors.description?.message && (
                  <ErrorMessage>{errors.description.message}</ErrorMessage>
                )}
              </Field>
            )}
          />
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

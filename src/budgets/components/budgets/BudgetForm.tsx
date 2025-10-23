'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/shared/components/ui/field';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Budget } from '@/budgets/types';
import {
  budgetFormSchema,
  BudgetFormValues,
} from '@/budgets/schemas/budget.schema';
import { PriceInput } from '@/shared/components/PriceInput';

interface BudgetFormProps {
  budget: Budget;
  isLoading: boolean;
  onSubmit: (budgetFormValues: BudgetFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

export const BudgetForm = ({
  budget,
  isLoading,
  onSubmit,
  onCloseDialog,
}: BudgetFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: { ...budget, amount: budget.amount },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit!)}>
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre del presupuesto</FieldLabel>
              <Input
                {...register('name')}
                id="name"
                placeholder="Ej: Gastos del hogar"
                autoComplete="off"
                autoFocus
                disabled={isLoading}
              />
              {errors && errors.name && (
                <ErrorMessage>{errors.name.message}</ErrorMessage>
              )}
            </Field>

            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="amount">Monto</FieldLabel>
                  <PriceInput value={field.value} onChange={field.onChange} disabled={isLoading} />
                  {errors && errors.amount && (
                    <ErrorMessage>{errors.amount.message}</ErrorMessage>
                  )}
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor="category">Categoría (opcional)</FieldLabel>
              <Input
                {...register('category')}
                id="category"
                placeholder="Ej: Hogar, Entretenimiento"
                type="text"
                autoComplete="off"
                disabled={isLoading}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <Field orientation="responsive">
          <Button isLoading={isLoading} type="submit">
            Guardar
          </Button>
          <Button type="button" variant="outline" onClick={onCloseDialog} disabled={isLoading}>
            Cancelar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

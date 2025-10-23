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
import { Expense } from '@/budgets/types';

import {
  ExpenseFormValues,
  expenseSchema,
} from '@/budgets/schemas/expense.schema';
import { Textarea } from '@/shared/components/ui/textarea';
import { PriceInput } from '@/shared/components/PriceInput';

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
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre del gasto</FieldLabel>
              <Input
                {...register('name')}
                id="name"
                placeholder="Ej: Compra supermercado"
                autoComplete="off"
                autoFocus
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors && errors.name && (
                <ErrorMessage>{errors.name.message}</ErrorMessage>
              )}
            </Field>

            <FieldGroup className="flex flex-row">
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="amount">Monto</FieldLabel>
                    <PriceInput value={field.value} onChange={field.onChange} />
                    {errors && errors.amount && (
                      <ErrorMessage>{errors.amount.message}</ErrorMessage>
                    )}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor="expense-date">Fecha</FieldLabel>
                <Input {...register('date')} id="expense-date" type="date" />
                {errors && errors.date && (
                  <ErrorMessage>{errors.date.message}</ErrorMessage>
                )}
              </Field>
            </FieldGroup>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor="expense-description">
              Descripción (opcional)
            </FieldLabel>
            <Textarea
              {...register('description')}
              id="expense-description"
              placeholder="Añade detalles del gasto..."
              rows={3}
            />
            {errors && errors.description && (
              <ErrorMessage>{errors.description.message}</ErrorMessage>
            )}
          </Field>
        </FieldSet>

        <Field orientation="responsive">
          <Button isLoading={isLoading} type="submit">
            Guardar
          </Button>
          <Button type="button" variant="outline" onClick={onCloseDialog}>
            Cancelar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";

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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

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
      date: expense.date ? new Date(expense.date) : undefined,
    },
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id="expense-date"
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                          }}
                          locale={es}
                          captionLayout="dropdown"
                          autoFocus
                        />
                      </PopoverContent>
                      {/* Hidden input to ensure form submission logic works if needed, though onSelect handles it */}
                    </Popover>
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

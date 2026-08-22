"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";
import { useState } from "react";
import { formatDate, getToday } from "@/lib/date-helpers";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";


import { Input } from "@/components/ui/input";
import { Button } from "@/components/common/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { ErrorMessage } from "@/components/common/ErrorMessage";

import {
  ExpenseFormValues,
  expenseSchema,
} from "@/features/expenses/schemas/expense.schema";
import { Textarea } from "@/components/ui/textarea";
import { PriceInput } from "@/components/common/PriceInput";
import { CurrencySelector } from "@/components/common/CurrencySelector";
import { CURRENCY_MAP, DEFAULT_CURRENCY_CONFIG } from "@/lib/format-currency";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>;
  isLoading: boolean;
  onSubmit: (expenseFormValues: ExpenseFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

export const ExpenseForm = ({
  defaultValues,
  isLoading,
  onSubmit,
  onCloseDialog,
}: ExpenseFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      amount: "",
      currency: "COP",
      description: "",
      date: getToday(),
      ...defaultValues,
    },
  });

  const selectedCurrency = useWatch({
    control,
    name: "currency",
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

            <div className="flex flex-col sm:flex-row gap-4">
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Field >
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
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          formatDate(field.value)
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
                  </Popover>
                  {errors.date?.message && (
                    <ErrorMessage>{errors.date.message}</ErrorMessage>
                  )}
                </Field>
              )}
            />
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

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { formatDate, getToday } from "@/lib/date-helpers";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  ExpenseFormValues,
  buildExpenseSchema,
} from "@/features/expenses/schemas/expense.schema";
import { Textarea } from "@/components/ui/textarea";
import { PriceInput } from "@/components/common/price-input";
import { CURRENCY_MAP, type CurrencyCode } from "@/lib/format-currency";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ExpenseFormProps {
  /**
   * Currency the expense is created/edited in. Always the currency of the
   * envelope this expense belongs to - never chosen freely here, so it's
   * structurally impossible to mix currencies within one envelope.
   */
  currency: CurrencyCode;
  defaultValues?: Partial<ExpenseFormValues>;
  isLoading: boolean;
  onSubmit: (expenseFormValues: ExpenseFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

export const ExpenseForm = ({
  currency,
  defaultValues,
  isLoading,
  onSubmit,
  onCloseDialog,
}: ExpenseFormProps) => {
  // No useMemo: the React Compiler (reactCompiler: true in
  // next.config.ts) memoizes this on `currency` the same way.
  const expenseSchema = buildExpenseSchema(currency);
  const currencyConfig = CURRENCY_MAP[currency];

  const { handleSubmit, control } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      amount: "",
      currency,
      description: "",
      date: getToday(),
      ...defaultValues,
    },
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            <FormInput
              control={control}
              name="name"
              label="Nombre del gasto"
              placeholder="Ej: Compra supermercado"
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Controller
                control={control}
                name="amount"
                render={({ field, fieldState }) => (
                  <Field className="flex-1">
                    <FieldLabel htmlFor="amount" className="items-center">
                      Monto
                      <span
                        title="Hereda la moneda del sobre"
                        className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-normal text-secondary-foreground"
                      >
                        {currencyConfig.currency}
                      </span>
                    </FieldLabel>
                    <PriceInput
                      id="amount"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      currencyConfig={currencyConfig}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="date"
                render={({ field, fieldState }) => (
                  <Field className="flex-1">
                    <FieldLabel htmlFor="expense-date">Fecha</FieldLabel>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger
                        render={
                          <Button
                            id="expense-date"
                            variant={"outline"}
                            aria-invalid={fieldState.invalid}
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
                        }
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          defaultMonth={field.value}
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
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="expense-description">
                  Descripción (opcional)
                </FieldLabel>
                <Textarea
                  {...field}
                  id="expense-description"
                  placeholder="Añade detalles del gasto..."
                  rows={3}
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
            Guardar
          </SubmitButton>
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

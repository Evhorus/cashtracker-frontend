import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type FormInputProps<TFieldValues extends FieldValues> = Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "onChange" | "onBlur" | "defaultValue" | "ref"
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  fieldClassName?: string;
  /**
   * An error from outside react-hook-form's own validation - e.g. a
   * server/provider response for a field that passed client-side
   * validation just fine (a correctly-shaped password that Clerk still
   * rejects as wrong). Shown in the same slot, only when there's no
   * client-side error already there (that one means the request was
   * never even sent, so it takes priority), and still flips
   * `aria-invalid` so the red border applies either way.
   */
  serverError?: string;
};

/**
 * Wires up react-hook-form's Controller to Field/FieldLabel/Input in one
 * shot, including `aria-invalid` on the input - which is what actually
 * turns on the red border Input already supports (`aria-invalid:border-
 * destructive` is baked into its className) but that nothing was ever
 * setting. Covers the common case, a plain text/email/password input;
 * fields needing something else (a Switch, PriceInput, CurrencySelector,
 * a date picker, ...) still wire Controller directly and should still
 * pass `aria-invalid={fieldState.invalid}` themselves for the same
 * effect - see envelope-form.tsx/expense-form.tsx.
 */
export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  fieldClassName,
  serverError,
  ...inputProps
}: FormInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const message = fieldState.error?.message ?? serverError;
        return (
          <Field className={fieldClassName}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            <Input
              id={name}
              {...field}
              aria-invalid={fieldState.invalid || !!serverError}
              {...inputProps}
            />
            {message && <FieldError>{message}</FieldError>}
          </Field>
        );
      }}
    />
  );
}

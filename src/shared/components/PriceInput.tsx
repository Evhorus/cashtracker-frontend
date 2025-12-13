import { useState, type ChangeEvent } from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Input } from "./ui/input";
import { formatNumber, parseNumericValue } from "@/shared/lib/format-currency";

export interface PriceInputProps<T extends FieldValues> {
  value: string | undefined;
  onChange: ControllerRenderProps<T>["onChange"];
  disabled?: boolean;
}

export function PriceInput<T extends FieldValues>({
  value,
  onChange,
  disabled,
  ...field
}: PriceInputProps<T>) {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Derive display value from prop value
  const getDisplayValue = () => {
    if (value === undefined || value === "") {
      return "";
    }

    const num = parseNumericValue(value);
    return num > 0 ? formatNumber(num) : "";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/\D/g, ""); // Remover todo excepto dígitos

    if (cleanedValue === "") {
      setDisplayValue("");
      onChange("");
      return;
    }

    const numberValue = Number(cleanedValue);
    setDisplayValue(formatNumber(numberValue));
    onChange(cleanedValue);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
        $
      </span>
      <Input
        {...field}
        type="text"
        inputMode="numeric"
        className="pl-8"
        value={displayValue || getDisplayValue()}
        onChange={handleChange}
        placeholder="0"
        autoComplete="off"
        disabled={disabled}
      />
    </div>
  );
}

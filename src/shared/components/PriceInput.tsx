import { useState, useRef, type ChangeEvent } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive display value from prop value
  const getDisplayValue = () => {
    if (value === undefined || value === "") {
      return "";
    }

    const num = parseNumericValue(value);
    return num > 0 ? formatNumber(num) : "";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPosition = input.selectionStart || 0;

    // Remove all non-digits
    const cleanedValue = rawValue.replace(/\D/g, "");

    if (cleanedValue === "") {
      setDisplayValue("");
      onChange("");
      return;
    }

    const numberValue = Number(cleanedValue);
    const formatted = formatNumber(numberValue);

    // Calculate new cursor position
    // Count how many separators are before the cursor in the old value
    const beforeCursor = rawValue.slice(0, cursorPosition);
    const separatorsBefore = (beforeCursor.match(/\./g) || []).length;

    // Count digits before cursor
    const digitsBefore = beforeCursor.replace(/\D/g, "").length;

    // Find position in formatted string
    let newPosition = 0;
    let digitsCount = 0;

    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] !== ".") {
        digitsCount++;
      }
      if (digitsCount >= digitsBefore) {
        newPosition = i + 1;
        break;
      }
    }

    setDisplayValue(formatted);
    onChange(cleanedValue);

    // Restore cursor position after React updates
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
        $
      </span>
      <Input
        {...field}
        ref={inputRef}
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

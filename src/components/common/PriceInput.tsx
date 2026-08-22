import {
  useState,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Input } from "./ui/input";
import { formatNumber, parseNumericValue, DEFAULT_CURRENCY_CONFIG, type CurrencyConfig } from "@/shared/lib/format-currency";

export interface PriceInputProps<T extends FieldValues>
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "disabled" | "type"
  > {
  value: string | undefined;
  onChange: ControllerRenderProps<T>["onChange"];
  disabled?: boolean;
  currencyConfig?: CurrencyConfig;
}

export function PriceInput<T extends FieldValues>({
  value,
  onChange,
  disabled,
  currencyConfig = DEFAULT_CURRENCY_CONFIG,
  ...field
}: PriceInputProps<T>) {
  const [displayValue, setDisplayValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive display value from prop value
  const getDisplayValue = () => {
    if (value === undefined || value === "") {
      return "";
    }

    const num = parseNumericValue(value, currencyConfig);
    return num !== 0 ? formatNumber(num, currencyConfig) : "";
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPosition = input.selectionStart || 0;

    const config = currencyConfig;
    const decimalSeparator = config.locale.startsWith("en") ? "." : ",";
    const thousandSeparator = config.locale.startsWith("en") ? "," : ".";

    // 1. Clean the input: allow only digits and one decimal separator
    let cleaned = rawValue.replace(new RegExp(`\\${thousandSeparator}`, "g"), "");

    // Handle decimal separator: only allow the first occurrence
    const parts = cleaned.split(decimalSeparator);
    if (parts.length > 2) {
      cleaned = parts[0] + decimalSeparator + parts.slice(1).join("");
    }

    // Remove any other non-digit/non-decimal characters
    cleaned = cleaned.replace(new RegExp(`[^0-9${decimalSeparator}]`, "g"), "");

    if (cleaned === "") {
      setDisplayValue("");
      onChange("");
      return;
    }

    // 2. Normalize to a standard numeric string (e.g., "1234.56") for the API/Form state
    const normalizedValue = cleaned.replace(decimalSeparator, ".");

    // 3. Format for display
    const [integerPart, fractionalPart] = normalizedValue.split(".");
    const formattedInteger = formatNumber(Number(integerPart || 0), config);
    const formatted = fractionalPart !== undefined
      ? `${formattedInteger}${decimalSeparator}${fractionalPart}`
      : formattedInteger;

    // 4. Calculate new cursor position
    // Count how many "significant" characters (digits + decimal) were before the cursor
    const beforeCursor = rawValue.slice(0, cursorPosition);
    const significantCharsBefore = beforeCursor
      .replace(new RegExp(`\\${thousandSeparator}`, "g"), "")
      .replace(new RegExp(`[^0-9${decimalSeparator}]`, "g"), "");

    const sigCount = significantCharsBefore.length;

    let newPosition = 0;
    let currentSigCount = 0;

    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      // Check if char is a digit or the localized decimal separator
      if (/[0-9]/.test(char) || char === decimalSeparator) {
        currentSigCount++;
      }
      if (currentSigCount >= sigCount) {
        newPosition = i + 1;
        break;
      }
    }

    setDisplayValue(formatted);
    onChange(normalizedValue);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
        {currencyConfig.symbol}
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

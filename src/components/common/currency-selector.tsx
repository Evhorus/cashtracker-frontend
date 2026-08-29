import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CURRENCY_MAP, type CurrencyCode } from "@/lib/format-currency";

export interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: CurrencySelectorProps) {
  const t = useTranslations("currencies");
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
    >
      {Object.entries(CURRENCY_MAP).map(([code, config]) => (
        <option key={code} value={code}>
          {t(code as CurrencyCode)} ({config.symbol})
        </option>
      ))}
    </select>
  );
}

import { cn } from "@/shared/lib/utils";
import { CURRENCY_MAP } from "@/shared/lib/format-currency";

export interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function CurrencySelector({
  value,
  onChange,
  disabled,
  className,
  id,
}: CurrencySelectorProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
    >
      {Object.entries(CURRENCY_MAP).map(([code, config]) => (
        <option key={code} value={code}>
          {config.label} ({config.symbol})
        </option>
      ))}
    </select>
  );
}

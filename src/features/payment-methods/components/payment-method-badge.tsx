import { cn } from "@/shared/lib/utils";
import type { ExpensePaymentMethod } from "../types";

interface PaymentMethodBadgeProps {
  method: ExpensePaymentMethod;
  /** `pill` sits on its own (expense detail); `inline` runs within a
   * line of text (list rows). */
  variant?: "inline" | "pill";
  className?: string;
}

/**
 * What an expense was paid with, at a glance: the method's colour dot
 * and its name. The colour is what makes a scanned list readable - one
 * card's expenses share it - and the name keeps it from depending on
 * colour alone.
 */
export function PaymentMethodBadge({
  method,
  variant = "inline",
  className,
}: PaymentMethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5",
        variant === "pill" &&
          "w-fit rounded-full bg-background/50 px-2.5 py-1 text-xs font-medium sm:text-sm",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: method.color }}
      />
      <span className="truncate">{method.name}</span>
    </span>
  );
}

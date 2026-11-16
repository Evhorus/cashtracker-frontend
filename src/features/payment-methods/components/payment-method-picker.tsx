"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { usePaymentMethods } from "../providers/payment-methods-provider";
import { PaymentMethodDialog } from "./payment-method-dialog";

interface PaymentMethodPickerProps {
  /** Selected id, or "" for none. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const chip =
  "flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors disabled:opacity-50";

/**
 * One-tap chips rather than a dropdown: on a phone that is one touch
 * instead of two, and the list is short. "Sin medio de pago" is a real
 * choice, so leaving it untouched keeps expenses as they always were.
 */
export function PaymentMethodPicker({
  value,
  onChange,
  disabled,
}: PaymentMethodPickerProps) {
  const t = useTranslations("paymentMethods.picker");
  const paymentMethods = usePaymentMethods();
  const [isCreating, setIsCreating] = useState(false);

  const option = (id: string, label: string, color?: string) => {
    const selected = value === id;
    return (
      <button
        key={id || "none"}
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={() => onChange(id)}
        className={cn(
          chip,
          selected
            ? "border-primary bg-primary/10 text-foreground"
            : "border-input text-muted-foreground hover:bg-muted",
        )}
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: color ?? "var(--muted-foreground)" }}
        />
        {label}
      </button>
    );
  };

  return (
    <>
      <div
        role="radiogroup"
        aria-labelledby="payment-method-label"
        className="flex flex-wrap gap-2"
      >
        {option("", t("none"))}
        {paymentMethods.map((method) =>
          option(method.id, method.name, method.color),
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsCreating(true)}
          className={cn(
            chip,
            "border-dashed border-primary/60 text-primary hover:bg-primary/10",
          )}
        >
          <Plus className="h-4 w-4" />
          {t("new")}
        </button>
      </div>
      <PaymentMethodDialog open={isCreating} onOpenChange={setIsCreating} />
    </>
  );
}

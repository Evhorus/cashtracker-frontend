"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { FieldLabel } from "@/shared/components/ui/field";
import { Switch } from "@/shared/components/ui/switch";
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
 * The field is optional, so it starts as a single switch and only shows
 * the chips once the user turns it on - most expenses never need them.
 * Turning it off clears the choice. Chips rather than a dropdown: on a
 * phone that is one touch instead of two, and the list is short.
 */
export function PaymentMethodPicker({
  value,
  onChange,
  disabled,
}: PaymentMethodPickerProps) {
  const t = useTranslations("paymentMethods.picker");
  const paymentMethods = usePaymentMethods();
  const [isEnabled, setIsEnabled] = useState(value !== "");
  const [isCreating, setIsCreating] = useState(false);
  const switchId = useId();
  const labelId = useId();

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) onChange("");
  };

  const option = (id: string, label: string, color: string) => {
    const selected = value === id;
    return (
      <button
        key={id}
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
          style={{ background: color }}
        />
        {label}
      </button>
    );
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <Switch
          id={switchId}
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
        <FieldLabel id={labelId} htmlFor={switchId} className="font-normal">
          {t("label")}
        </FieldLabel>
      </div>
      {isEnabled && (
        <div
          role="radiogroup"
          aria-labelledby={labelId}
          className="flex flex-wrap gap-2"
        >
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
      )}
      <PaymentMethodDialog open={isCreating} onOpenChange={setIsCreating} />
    </>
  );
}

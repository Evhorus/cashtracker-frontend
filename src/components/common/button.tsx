import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button as UiButton, buttonVariants } from "@/components/ui/button";

export type ButtonProps = ComponentProps<typeof UiButton> & {
  isLoading?: boolean;
};

/**
 * App-wide Button. Wraps the stock shadcn Button (components/ui/button.tsx)
 * instead of modifying it directly, so `ui/` stays regenerable via
 * `shadcn add button --overwrite`.
 *
 * Adds:
 * - `isLoading`: shows a spinner and forces `disabled` while true.
 * - `cursor-pointer`: not part of stock shadcn's base classes.
 */
function Button({
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // When `asChild` is set, the underlying shadcn Button renders a Radix
  // Slot, which requires exactly one React element child to clone onto.
  // Always rendering `{isLoading && <Loader2 />}{children}` - even when
  // isLoading is false - puts two items in the children array (`false`
  // still counts as an array slot) and breaks Slot for every `asChild`
  // consumer, not just loading ones. Two separate branches keep each
  // one passing through exactly the children it received.
  if (isLoading) {
    return (
      <UiButton className={cn("cursor-pointer", className)} disabled {...props}>
        <Loader2 aria-hidden className="mr-2 size-4 animate-spin" />
        {children}
      </UiButton>
    );
  }

  return (
    <UiButton
      className={cn("cursor-pointer", className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </UiButton>
  );
}

export { Button, buttonVariants };

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
  return (
    <UiButton
      className={cn("cursor-pointer", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 aria-hidden className="mr-2 size-4 animate-spin" />
      )}
      {children}
    </UiButton>
  );
}

export { Button, buttonVariants };

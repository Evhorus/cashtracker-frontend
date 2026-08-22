import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export type SubmitButtonProps = ComponentProps<typeof Button> & {
  isLoading?: boolean;
};

/**
 * Submit button for forms that need a loading spinner while pending
 * (react-hook-form + useActionState submissions). Not a Button
 * replacement - plain buttons should import Button directly from
 * @/components/ui/button. Only use this where the isLoading spinner is
 * actually needed.
 */
function SubmitButton({
  isLoading = false,
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  if (isLoading) {
    return (
      <Button disabled {...props}>
        <Loader2 aria-hidden className="mr-2 size-4 animate-spin" />
        {children}
      </Button>
    );
  }

  return (
    <Button disabled={disabled} {...props}>
      {children}
    </Button>
  );
}

export { SubmitButton };

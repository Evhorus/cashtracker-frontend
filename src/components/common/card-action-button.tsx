import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const toneClass = {
  default: "hover:bg-primary/10 hover:text-primary",
  destructive: "hover:bg-destructive/10 hover:text-destructive",
} as const;

interface CardActionButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size" | "children"> {
  icon: LucideIcon;
  /** Accessible name - the button is icon-only, so this never shows visually. */
  label: string;
  /** Hover tint: "default" for a neutral action (edit), "destructive" for
   * a destructive one (delete). Not to be confused with Button's own
   * `variant` (always "ghost" here) - this only controls the hover color. */
  tone?: keyof typeof toneClass;
}

/**
 * The small ghost icon button used for a card's hover-reveal actions
 * (edit/delete...). Accepts arbitrary extra props (onClick, or nothing at
 * all when passed as a Dialog/AlertDialogTrigger's `render` - the trigger
 * clones this element and merges its own handlers on).
 */
export function CardActionButton({
  icon: Icon,
  label,
  tone = "default",
  className,
  ...props
}: CardActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 text-muted-foreground", toneClass[tone], className)}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

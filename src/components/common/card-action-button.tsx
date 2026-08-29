import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Icon-only mode (the default): hover-only tint on a ghost button - subtle
// on purpose, since these sit densely packed in a card/table row and don't
// need to shout. Labeled mode swaps to a Button variant with a permanent,
// always-visible tint instead (see CardActionButton below) - a button
// sitting alone in a header's actions row needs to read as clickable
// immediately, not only on hover.
const toneClass = {
  default: "hover:bg-primary/10 hover:text-primary",
  destructive: "hover:bg-destructive/10 hover:text-destructive",
} as const;

const toneVariant = {
  default: "secondary",
  destructive: "destructive",
} as const;

interface CardActionButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size" | "children"> {
  icon: LucideIcon;
  /** Accessible name. Visually hidden by default (the button is
   * icon-only) - shown on screen too when `showLabelOnDesktop` is set. */
  label: string;
  /** "default" for a neutral action (edit), "destructive" for a
   * destructive one (delete). Not to be confused with Button's own
   * `variant` - this picks the tint (icon-only: hover-only; labeled:
   * permanent, via `toneVariant`). */
  tone?: keyof typeof toneClass;
  /** Opt-in, defaults to false: show `label` as visible text next to the
   * icon instead of screen-reader-only, and switch from a fixed-size
   * ghost circle to a pill sized for that text, with a permanently
   * visible tint (secondary/destructive) rather than a hover-only one.
   * Every dense list/card/table row usage (the vast majority of this
   * component's callers) leaves this off and stays icon-only - only the
   * envelope and expense detail page headers, which have the room, turn
   * it on. */
  showLabelOnDesktop?: boolean;
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
  showLabelOnDesktop = false,
  className,
  ...props
}: CardActionButtonProps) {
  return (
    <Button
      variant={showLabelOnDesktop ? toneVariant[tone] : "ghost"}
      size={showLabelOnDesktop ? "default" : "icon"}
      className={cn(
        !showLabelOnDesktop && "h-9 w-9 text-muted-foreground",
        !showLabelOnDesktop && toneClass[tone],
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {showLabelOnDesktop ? label : <span className="sr-only">{label}</span>}
    </Button>
  );
}

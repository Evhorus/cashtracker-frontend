import { cn } from "@/lib/utils";

interface CardHoverActionsProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Table rows (EnvelopesTable, CategoriesTable) pass this - a row's
   * edit/delete only being discoverable on hover is a real problem
   * there specifically (trackpads with imprecise hover, touchscreens
   * with no hover at all, or just a user who never happens to rest the
   * pointer on that exact row), so those always show the buttons
   * instead. Cards (EnvelopeCard, ExpenseCard, CategoryCard) keep the
   * hover-reveal default - same actions are still one tap away there
   * via each card's own mobile drawer/menu, so hover is a bonus for
   * desktop's less-cluttered look, not the only way in.
   */
  alwaysVisible?: boolean;
}

/**
 * Wrapper for a card or table row's desktop-only action buttons
 * (edit/delete and friends). Takes any number of children - no fixed
 * action count - each one typically a <CardActionButton>.
 *
 * Mobile doesn't get hover, so every caller pairs this with its own
 * tap-friendly equivalent (a dropdown menu or drawer) shown only below
 * `md`.
 */
export function CardHoverActions({
  children,
  className,
  alwaysVisible = false,
}: CardHoverActionsProps) {
  return (
    <div
      className={cn(
        "hidden items-center gap-1 md:flex",
        alwaysVisible
          ? undefined
          : "translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

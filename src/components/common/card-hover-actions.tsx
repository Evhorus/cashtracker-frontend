import { cn } from "@/lib/utils";

interface CardHoverActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper for a card's desktop-only action buttons (edit/delete and
 * friends): hidden until the parent Card (which must have `group` on it)
 * is hovered, then slides in and fades in. Takes any number of children -
 * no fixed action count - each one typically a <CardActionButton>.
 *
 * Mobile doesn't get hover, so cards pair this with their own tap-friendly
 * equivalent (a dropdown menu or drawer) shown only below `md`.
 */
export function CardHoverActions({ children, className }: CardHoverActionsProps) {
  return (
    <div
      className={cn(
        "hidden translate-x-2 items-center gap-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:flex",
        className,
      )}
    >
      {children}
    </div>
  );
}

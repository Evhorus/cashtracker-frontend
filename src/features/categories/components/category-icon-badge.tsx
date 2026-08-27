import type { LucideIcon } from "lucide-react";
import { withAlpha } from "../lib/with-alpha";
import { cn } from "@/lib/utils";

interface CategoryIconBadgeProps {
  /** Already resolved (via resolveIcon()) by the caller - never resolved
   * in here. Calling resolveIcon() directly inside a named component's
   * own render body trips eslint's react-compiler "static-components"
   * rule ("Cannot create components during render"); resolving it inside
   * the caller's .map() callback instead (categories-table.tsx,
   * categories-section.tsx) doesn't, since that's a plain nested
   * function, not a component. Receiving an already-resolved reference as
   * a prop is exactly what category-badge.tsx's `def.Icon` access does
   * too - never flagged, since nothing is being created here. */
  Icon: LucideIcon;
  color: string;
  /** Sizes the outer tinted square (e.g. "h-9 w-9 rounded-lg"). */
  className?: string;
  /** Sizes the icon itself (e.g. "h-4 w-4"). */
  iconClassName?: string;
}

export function CategoryIconBadge({
  Icon,
  color,
  className,
  iconClassName = "h-4 w-4",
}: CategoryIconBadgeProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        className,
      )}
      style={{ background: withAlpha(color, 0.14), color }}
    >
      <Icon className={iconClassName} />
    </span>
  );
}

import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveCategory } from "../lib/category-palette";
import { withAlpha } from "../lib/with-alpha";

interface CategoryIconProps {
  category?: string | null;
  className?: string;
}

// The icon-in-a-tinted-square badge - same visual language envelope-card.tsx
// already used for its (previously generic Wallet) icon, now colored per
// category instead of always the primary accent. An envelope with no
// category keeps exactly that old look (Wallet, primary tint) rather than
// rendering nothing - this only changes envelopes that DO have a category.
export function CategoryIcon({ category, className }: CategoryIconProps) {
  const def = resolveCategory(category);
  const Icon = def?.Icon ?? Wallet;
  const color = def?.color ?? "var(--color-primary)";

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        !def && "bg-primary/10",
        className,
      )}
      style={def ? { background: withAlpha(def.color, 0.14) } : undefined}
    >
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
  );
}

interface CategoryLabelProps {
  category?: string | null;
  className?: string;
}

// Inline icon + text, for the places category currently renders as plain
// text (envelope-card.tsx's meta line, the envelope detail page's
// subtitle) - same information, now legible at a glance instead of
// competing with the surrounding text for attention.
export function CategoryLabel({ category, className }: CategoryLabelProps) {
  const def = resolveCategory(category);
  if (!def) return null;

  return (
    <span
      className={cn("inline-flex items-center gap-1 font-medium", className)}
      style={{ color: def.color }}
    >
      <def.Icon className="h-3 w-3" />
      {def.label}
    </span>
  );
}

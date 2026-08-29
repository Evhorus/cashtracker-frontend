import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveIcon } from "../lib/icon-registry";
import { withAlpha } from "../lib/with-alpha";
import type { EnvelopeCategory } from "@/features/envelopes/types";

interface CategoryIconProps {
  /** The category as the API reports it, or null when unclassified. */
  category?: EnvelopeCategory | null;
  className?: string;
}

/**
 * The icon-in-a-tinted-square badge - same visual language
 * envelope-card.tsx already used for its (previously generic Wallet)
 * icon, now coloured per category. An envelope with no category keeps
 * exactly that old look (Wallet, primary tint) rather than rendering
 * nothing.
 *
 * Plain synchronous components now. These used to be async Server
 * Components that fetched the user's categories and resolved a free-text
 * label against them - N badges on a page all doing their own lookup.
 * The API reports the category whole, so there is nothing left to
 * resolve but the icon key, and nothing to fetch at all. That also means
 * they work in Client Components, which the async versions could not.
 */
export function CategoryIcon({ category, className }: CategoryIconProps) {
  // Held on an object rather than in a capitalized local: the React
  // Compiler lint rule reads `const Icon = ...` in a render body as
  // creating a component during render. Property access is fine, and it
  // is the shape category-palette.ts's CategoryDef already uses.
  const def = { Icon: category ? resolveIcon(category.icon) : Wallet };
  const color = category?.color ?? "var(--color-primary)";

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        !category && "bg-primary/10",
        className,
      )}
      style={
        category ? { background: withAlpha(category.color, 0.14) } : undefined
      }
    >
      <def.Icon className="h-5 w-5" style={{ color }} />
    </div>
  );
}

interface CategoryLabelProps {
  category?: EnvelopeCategory | null;
  className?: string;
}

/**
 * Inline icon + text, for the places a category renders alongside other
 * text (envelope-card.tsx's meta line, the envelope detail page's
 * subtitle) - legible at a glance instead of competing with the
 * surrounding copy.
 */
export function CategoryLabel({ category, className }: CategoryLabelProps) {
  if (!category) return null;

  const def = { Icon: resolveIcon(category.icon) };

  return (
    <span
      className={cn("inline-flex items-center gap-1 font-medium", className)}
      style={{ color: category.color }}
    >
      <def.Icon className="h-3 w-3" />
      {category.label}
    </span>
  );
}

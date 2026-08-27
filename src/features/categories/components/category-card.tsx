import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "../types";
import { CategoryIconBadge } from "./category-icon-badge";
import { UpdateCategoryDialog } from "./update-category-dialog";
import { DeleteCategoryAlertDialog } from "./delete-category-alert-dialog";

interface CategoryCardProps {
  category: Category;
  count: number;
  /** Already resolved by the caller's .map() (categories-section.tsx) -
   * see category-icon-badge.tsx for why it's never resolved in here. */
  Icon: LucideIcon;
}

// Mobile-only (see categories-section.tsx). Same visual language as
// EnvelopeCard - elevated hover (-translate-y-1, shadow-lg), the
// gradient overlay, the bigger icon that scales on hover, bold tracked
// title - just without a progress bar/amount, since a category has
// neither. The "Predeterminada"/"Personalizada" chip mirrors
// EnvelopeCard's always-shown currency chip.
export function CategoryCard({ category, count, Icon }: CategoryCardProps) {
  return (
    <Card className="group relative h-full overflow-hidden border-border/60 bg-card/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-lg md:hidden">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <CategoryIconBadge
            Icon={Icon}
            color={category.color}
            className="h-10 w-10 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110"
            iconClassName="h-5 w-5"
          />

          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg leading-none font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              <span className="block truncate">{category.label}</span>
            </CardTitle>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              <span>
                {count} {count === 1 ? "sobre" : "sobres"}
              </span>
              <span className="rounded-sm bg-secondary px-1 py-0.5 text-secondary-foreground">
                {category.isDefault ? "Predeterminada" : "Personalizada"}
              </span>
            </p>
          </div>
        </div>

        {/* No hover concept on mobile (this card is md:hidden - the
            desktop rows use CardHoverActions instead) - shown plainly,
            same as EnvelopeActionsMenu's role for EnvelopeCard, just
            without a dropdown since there are only ever two actions.
            Hidden for global (isDefault) categories - see
            categories-table.tsx. */}
        {!category.isDefault && (
          <div className="flex shrink-0 items-center">
            <UpdateCategoryDialog category={category} />
            <DeleteCategoryAlertDialog id={category.id} label={category.label} />
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

import { useTranslations } from "next-intl";
import type { Category } from "../types";
import { resolveIcon } from "../lib/icon-registry";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardHoverActions } from "@/components/common/card-hover-actions";
import { CategoryIconBadge } from "./category-icon-badge";
import { UpdateCategoryDialog } from "./update-category-dialog";
import { DeleteCategoryAlertDialog } from "./delete-category-alert-dialog";

interface CategoriesTableProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
}

// Desktop-only (see categories-section.tsx - the card list still covers
// mobile). Same shape/classes as EnvelopesTable - the dense-table-on-
// desktop, card-grid-on-mobile split is the app's standard for any list
// page, not just Sobres. Built on the shadcn Table primitives
// (components/ui/table.tsx) rather than raw <table> markup, with their
// stock styling overridden to match that same standard (rounded-2xl
// border card, uppercase header, px-5 py-3.5 cells) instead of shadcn's
// defaults.
export function CategoriesTable({
  categories,
  categoryCounts,
}: CategoriesTableProps) {
  const t = useTranslations("categories");
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <Table className="min-w-max text-sm">
        <TableHeader>
          <TableRow className="border-border/60 bg-card/60 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:bg-card/60">
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              {t("table.category")}
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-left font-semibold text-inherit">
              Tipo
            </TableHead>
            <TableHead className="h-auto px-5 py-3 text-right font-semibold text-inherit">
              Sobres
            </TableHead>
            <TableHead className="h-auto px-5 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const count = categoryCounts[category.id] ?? 0;
            const Icon = resolveIcon(category.icon);
            return (
              <TableRow key={category.id} className="group border-border/60">
                <TableCell className="px-5 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIconBadge
                      Icon={Icon}
                      color={category.color}
                      className="h-9 w-9"
                    />
                    <span className="truncate font-medium">
                      {category.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  {category.isDefault ? (
                    <span className="inline-block rounded-full bg-muted px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-muted-foreground">
                      Predeterminada
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-primary">
                      Personalizada
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right font-mono text-muted-foreground">
                  {t("envelopeCount", { count })}
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  {/* Global (isDefault) categories aren't owned by anyone
                      - editing/deleting one would just 404 (see
                      categories-section.tsx's mobile card for the same
                      reasoning), so no actions render for those rows. */}
                  {!category.isDefault && (
                    <CardHoverActions className="justify-end" alwaysVisible>
                      <UpdateCategoryDialog category={category} />
                      <DeleteCategoryAlertDialog
                        id={category.id}
                        label={category.label}
                      />
                    </CardHoverActions>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

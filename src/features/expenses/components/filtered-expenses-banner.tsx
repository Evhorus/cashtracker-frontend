import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface FilterChip {
  key: string;
  label: string;
  /** Null for "no payment method" (dashed dot), undefined for no dot. */
  color?: string | null;
  /** The same page with only this filter removed. */
  removeHref: string;
}

interface FilteredExpensesBannerProps {
  shown: number;
  total: number;
  chips: FilterChip[];
  /** The same page without any filter. */
  clearHref: string;
}

/**
 * Says, right above the list, what is filtered - each filter a chip
 * that removes it - and how many of the envelope's expenses that
 * leaves. The filtered total lives in the summary card beside it, so it
 * is not repeated here.
 */
export function FilteredExpensesBanner({
  shown,
  total,
  chips,
  clearHref,
}: FilteredExpensesBannerProps) {
  const t = useTranslations("expenses.filteredBanner");

  return (
    <section
      aria-label={t("label")}
      className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 sm:items-center sm:p-4"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm font-medium">{t("showing", { shown, total })}</p>
        <ul className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                href={chip.removeHref}
                aria-label={t("remove", { filter: chip.label })}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 py-1 pr-1.5 pl-2.5 text-sm transition-colors hover:border-destructive/50"
              >
                {chip.color !== undefined && (
                  <span
                    aria-hidden
                    className={
                      chip.color
                        ? "h-2 w-2 shrink-0 rounded-full"
                        : "h-2 w-2 shrink-0 rounded-full border border-dashed border-muted-foreground"
                    }
                    style={chip.color ? { background: chip.color } : undefined}
                  />
                )}
                {chip.label}
                <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        nativeButton={false}
        render={<Link href={clearHref} />}
      >
        <X />
        {t("clear")}
      </Button>
    </section>
  );
}

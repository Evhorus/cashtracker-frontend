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
      className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 sm:px-4 sm:py-3"
    >
      {/* The count and the clear-all on one line, the chips beneath
          with the full width. On phones the clear is icon-only and the
          chips scroll sideways on one line - wrapping them took three
          rows for three payment methods. */}
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p className="shrink-0 text-xs font-medium sm:text-sm">
          {t("showing", { shown, total })}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 max-sm:size-7 max-sm:p-0"
          nativeButton={false}
          aria-label={t("clear")}
          render={<Link href={clearHref} />}
        >
          <X />
          <span className="hidden sm:inline">{t("clear")}</span>
        </Button>
      </div>
      <ul className="-mx-3 mt-1.5 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-3 pb-0.5 sm:mx-0 sm:mt-2 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {chips.map((chip) => (
          <li key={chip.key} className="shrink-0">
            <Link
              href={chip.removeHref}
              aria-label={t("remove", { filter: chip.label })}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 py-0.5 pr-1 pl-2 text-xs whitespace-nowrap transition-colors hover:border-destructive/50 sm:py-1 sm:pr-1.5 sm:pl-2.5 sm:text-sm"
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
    </section>
  );
}

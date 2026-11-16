"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { usePaymentMethods } from "@/features/payment-methods/providers/payment-methods-provider";
import { FilterSelect } from "@/shared/components/common/filter-select";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { formatMonthKeyLong } from "@/shared/utils/date-helpers";
import {
  monthBounds,
  REPORT_VIEWS,
  shiftMonth,
  toSearchParams,
  type ReportFilters,
  type ReportPeriod,
} from "../lib/report-filters";

interface ReportFiltersBarProps {
  filters: ReportFilters;
  currentMonth: string;
}

const chip =
  "flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-colors";

function chipState(selected: boolean) {
  return selected
    ? "border-primary bg-primary/10 text-foreground"
    : "border-input text-muted-foreground hover:bg-muted";
}

/**
 * Every filter writes the URL, which the page reads, so a report can be
 * reloaded or bookmarked as it is. Selecting no payment method means
 * all of them, which is why there is no separate "all" chip to keep in
 * sync - the label says so instead.
 */
export function ReportFiltersBar({
  filters,
  currentMonth,
}: ReportFiltersBarProps) {
  const t = useTranslations("expensesReport.filters");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const paymentMethods = usePaymentMethods();
  const [isPending, startTransition] = useTransition();

  const apply = (changes: Partial<ReportFilters>) => {
    const query = toSearchParams({ ...filters, ...changes }, currentMonth);
    const search = query.toString();
    startTransition(() =>
      router.replace(`${pathname}${search ? `?${search}` : ""}`, {
        scroll: false,
      }),
    );
  };

  const toggleMethod = (id: string) =>
    apply({
      methodIds: filters.methodIds.includes(id)
        ? filters.methodIds.filter((selected) => selected !== id)
        : [...filters.methodIds, id],
    });

  const hasCutDays = paymentMethods.some((method) => method.cutDay !== null);
  const periods: ReportPeriod[] = hasCutDays
    ? ["month", "cycle", "custom"]
    : ["month", "custom"];

  const changePeriod = (period: ReportPeriod) =>
    apply(
      period === "custom"
        ? { period, ...monthBounds(filters.month) }
        : { period, startDate: undefined, endDate: undefined },
    );

  const changeRange = (edge: "startDate" | "endDate", value: string) => {
    if (!value) return;
    apply({ [edge]: value });
  };

  const noneSelected =
    filters.methodIds.length === 0 && !filters.includeUnassigned;

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "space-y-4 transition-opacity print:hidden",
        isPending && "opacity-60",
      )}
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          {t("methods")}
          {noneSelected && (
            <span className="ml-2 font-normal text-muted-foreground">
              · {t("allMethods")}
            </span>
          )}
        </legend>
        <div className="flex flex-wrap gap-2">
          {paymentMethods.map((method) => {
            const selected = filters.methodIds.includes(method.id);
            return (
              <button
                key={method.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleMethod(method.id)}
                className={cn(chip, chipState(selected))}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: method.color }}
                />
                {method.name}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={filters.includeUnassigned}
            onClick={() =>
              apply({ includeUnassigned: !filters.includeUnassigned })
            }
            className={cn(chip, chipState(filters.includeUnassigned))}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground"
            />
            {t("noPaymentMethod")}
          </button>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label={t("period")}
          value={filters.period}
          options={periods.map((period) => ({
            value: period,
            label: t(`periods.${period}`),
          }))}
          onValueChange={(value) => changePeriod(value as ReportPeriod)}
        />

        {filters.period === "custom" ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("from")}</span>
              <Input
                type="date"
                className="h-9 w-auto"
                value={filters.startDate}
                max={filters.endDate}
                onChange={(event) =>
                  changeRange("startDate", event.target.value)
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("to")}</span>
              <Input
                type="date"
                className="h-9 w-auto"
                value={filters.endDate}
                min={filters.startDate}
                onChange={(event) => changeRange("endDate", event.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label={t("previousMonth")}
              onClick={() => apply({ month: shiftMonth(filters.month, -1) })}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-36 text-center text-sm font-medium capitalize">
              {formatMonthKeyLong(filters.month, locale)}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("nextMonth")}
              onClick={() => apply({ month: shiftMonth(filters.month, 1) })}
            >
              <ChevronRight />
            </Button>
          </div>
        )}

        <div
          role="radiogroup"
          aria-label={t("view")}
          className="flex rounded-lg border border-input p-0.5 sm:ml-auto"
        >
          {REPORT_VIEWS.map((view) => (
            <button
              key={view}
              type="button"
              role="radio"
              aria-checked={filters.view === view}
              onClick={() => apply({ view })}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                filters.view === view
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`views.${view}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

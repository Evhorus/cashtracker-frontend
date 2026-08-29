import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heading } from "@/components/common/typography";
import { CategoryIcon } from "@/features/categories/components/category-badge";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import type { AlertEnvelope } from "../lib/dashboard-summary";

interface AlertEnvelopesProps {
  /** Already filtered and sorted worst-first - see getAlertEnvelopes. */
  entries: AlertEnvelope[];
  className?: string;
}

/** How many rows fit before "Ver todos" is the better answer. */
const MAX_ROWS = 3;

/**
 * Resumen's "Sobres en alerta" widget. Extracted from dashboard/page.tsx
 * along with RecentActivity's sibling treatment, so the page composes
 * two widgets instead of inlining one of them.
 */
export async function AlertEnvelopes({
  entries,
  className,
}: AlertEnvelopesProps) {
  const t = await getTranslations("dashboard");
  const tEnv = await getTranslations("envelopes");

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Heading size="sm">{t("alertsTitle")}</Heading>
        {/* The unfiltered list, not a status filter. This widget shows
            both kinds that need attention (at-risk and over-limit), and
            the envelopes list has no tab meaning "either" - by design,
            since its tabs are the statuses themselves. Sending the
            reader to `?status=warning` would have shown 3 of the 5 this
            widget counts. From the full list both relevant tabs are one
            click away. */}
        <Link
          href="/dashboard/envelopes"
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("seeAll")}
        </Link>
      </div>
      <div className="mt-3 space-y-3">
        {entries.slice(0, MAX_ROWS).map(({ envelope, status, percentage }) => {
          const config = CURRENCY_MAP[envelope.currency];
          const remaining = EnvelopeHelpers.getRemaining(envelope) ?? 0;
          const barColorClass = EnvelopeHelpers.getStatusBarColorClass(status);

          return (
            <Link
              key={envelope.id}
              href={`/dashboard/envelope/${envelope.id}`}
              className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted"
            >
              <CategoryIcon
                category={envelope.category}
                className="h-8 w-8 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{envelope.name}</span>
                  <span
                    className={cn(
                      "ml-2 shrink-0 font-mono text-xs font-semibold",
                      EnvelopeHelpers.getStatusTextColorClass(status),
                    )}
                  >
                    {formatCurrency(remaining, config)}
                  </span>
                </div>
                {/* A real progressbar, unlike the decorative bars in
                    envelopes-table/category-breakdown: this row shows the
                    remaining *amount* beside it, never the percentage, so
                    the bar is the only thing carrying how far through the
                    limit this envelope is. */}
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(Math.min(percentage, 100))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${envelope.name}: ${tEnv("detail.percentOfLimit", { percent: Math.round(percentage) })}`}
                  className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary/60"
                >
                  <div
                    className={cn("h-full rounded-full", barColorClass)}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

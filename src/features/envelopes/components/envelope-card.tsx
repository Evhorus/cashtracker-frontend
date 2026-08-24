import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { formatMonthYear } from "@/lib/date-helpers";
import { ArrowRight, Infinity as InfinityIcon } from "lucide-react";
import {
  CategoryIcon,
  CategoryLabel,
} from "@/features/categories/components/category-badge";

import Link from "next/link";
import { useMemo } from "react";
import React from "react";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { Envelope } from "@/features/envelopes/types";
import { CardHoverActions } from "@/components/common/card-hover-actions";
import { UpdateEnvelopeDialog } from "./update-envelope-dialog";
import { DeleteEnvelopeAlertDialog } from "./delete-envelope-alert-dialog";
import { EnvelopeActionsMenu } from "./envelope-actions-menu";

interface EnvelopeCardProps {
  envelope: Envelope;
}

export const EnvelopeCard = React.memo(({ envelope }: EnvelopeCardProps) => {
  const envelopeId = envelope.id;
  const currencyConfig = CURRENCY_MAP[envelope.currency];

  const calculations = useMemo(() => {
    const status = EnvelopeHelpers.getProgressStatus(envelope);
    return {
      remaining: EnvelopeHelpers.getRemaining(envelope),
      percentage: EnvelopeHelpers.getPercentage(envelope),
      status,
      isExceeded: status === "exceeded",
      isWarning: status === "warning",
      isUnlimited: status === "unlimited",
    };
  }, [envelope]);

  // Targets the actual filled bar (Progress renders Root > Track > Indicator,
  // so the indicator is a grandchild, not a direct child - a plain
  // `[&>div]` here would only ever reach the Track and never recolor the
  // fill itself, which is why this used to always render green).
  const progressColorClass = calculations.isExceeded
    ? "[&_[data-slot=progress-indicator]]:bg-destructive"
    : calculations.isWarning
      ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
      : "[&_[data-slot=progress-indicator]]:bg-primary";

  const amountTextColorClass = calculations.isExceeded
    ? "text-destructive"
    : calculations.isWarning
      ? "text-amber-500"
      : "text-primary";

  return (
    // No left-border accent bar - a flat color stripe down the side of
    // every card read as generic template chrome, not something specific
    // to this app (see the redesign notes on avoiding that pattern).
    // border/60 (was border-0) does the "this card is its own thing"
    // job instead, as a hairline all the way around.
    <Card className="group relative h-full overflow-hidden border-border/60 bg-card/50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-lg">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <CategoryIcon
            category={envelope.category}
            className="shadow-sm transition-transform duration-300 group-hover:scale-110"
          />

          <div className="min-w-0 space-y-1">
            {/* No fixed max-w here on purpose - min-w-0 on this and the
                two ancestors above is what actually lets `truncate` cut
                the name off against whatever space the actions on the
                right leave, instead of a magic pixel value that either
                truncated names way earlier than it had to or (on a
                wider card) left space unused. */}
            <CardTitle className="text-lg leading-none font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              <span className="block truncate">{envelope.name}</span>
            </CardTitle>
            {/* Always shows the creation month/year, not just when a
                category is set - envelope names are free text and
                commonly reused across years (e.g. a recurring "Agosto
                NUU" every year), so without this there'd be no way to
                tell which year's card is which in the list. */}
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
              <span>{formatMonthYear(envelope.createdAt)}</span>
              {envelope.category && (
                <>
                  <span aria-hidden="true">·</span>
                  <CategoryLabel category={envelope.category} />
                </>
              )}
              {/* Shown for every currency, COP included - treating COP
                  as an unlabeled "default" only reads fine when it's the
                  only currency around. The moment a second one shows up,
                  an unlabeled amount is ambiguous - popular multi-
                  currency apps (Wise, Revolut) always tag the currency
                  on every balance, never just the "other" ones. */}
              <span className="rounded-sm bg-secondary px-1 py-0.5 text-secondary-foreground">
                {envelope.currency}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center">
          <CardHoverActions>
            <UpdateEnvelopeDialog envelope={envelope} />
            <DeleteEnvelopeAlertDialog id={envelope.id} name={envelope.name} />
          </CardHoverActions>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <div data-no-nav>
              <EnvelopeActionsMenu envelope={envelope} />
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Both variants share the exact same two-row shape (status row +
          2-column stats) so capped and unlimited cards come out the same
          height in the grid - only the labels/values inside differ. */}
      <CardContent className="relative z-10 space-y-5">
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              {calculations.isUnlimited && (
                <InfinityIcon className="h-3.5 w-3.5" />
              )}
              {calculations.isUnlimited ? "Sin límite de gasto" : "Progreso"}
            </span>
            {!calculations.isUnlimited && (
              <span className={`text-sm font-bold ${amountTextColorClass}`}>
                {Math.min(calculations.percentage ?? 0, 100).toFixed(0)}%
              </span>
            )}
          </div>
          <Progress
            value={
              calculations.isUnlimited
                ? 100
                : Math.min(calculations.percentage ?? 0, 100)
            }
            className={`h-2.5 rounded-full bg-secondary/50 ${
              calculations.isUnlimited
                ? "[&_[data-slot=progress-indicator]]:bg-muted-foreground/30"
                : progressColorClass
            }`}
          />
        </div>

        {/* The creation date now lives in the header (see above), so
            unlimited envelopes don't need a "Desde" filler here anymore -
            just the one Gastado cell. Still the same row height as the
            capped variant's two cells (both are label+value pairs). */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Gastado</p>
            <p className={`text-sm font-bold ${amountTextColorClass}`}>
              {formatCurrency(+envelope.spent, currencyConfig)}
            </p>
          </div>
          {!calculations.isUnlimited && (
            <div className="space-y-1 text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Disponible
              </p>
              <p
                className={`text-sm font-bold ${
                  (calculations.remaining ?? 0) < 0
                    ? "text-destructive"
                    : "text-success"
                }`}
              >
                {formatCurrency(calculations.remaining ?? 0, currencyConfig)}
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          nativeButton={false}
          className="group/btn h-auto w-full justify-between px-0 py-2 font-medium hover:bg-primary/5 hover:text-primary"
          render={
            <Link href={`/dashboard/envelope/${envelopeId}`}>
              <span className="ml-1">Ver detalles</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover/btn:bg-primary group-hover/btn:text-primary-foreground">
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </div>
            </Link>
          }
        />
      </CardContent>

      {/* Status Badge */}
      {calculations.isExceeded && (
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-destructive/50" />
      )}
    </Card>
  );
});

EnvelopeCard.displayName = "EnvelopeCard";

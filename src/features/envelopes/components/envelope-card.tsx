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
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import { Envelope } from "@/features/envelopes/types";
import { CardHoverActions } from "@/components/common/card-hover-actions";
import { Text } from "@/components/common/typography";
import { UpdateEnvelopeDialog } from "./update-envelope-dialog";
import { DeleteEnvelopeAlertDialog } from "./delete-envelope-alert-dialog";
import { EnvelopeActionsMenu } from "./envelope-actions-menu";

interface EnvelopeCardProps {
  envelope: Envelope;
}

// No React.memo/useMemo here any more: this is a Server Component (it
// has no "use client", and EnvelopesGrid renders it on the server), and
// in the RSC renderer both are inert - memo() never gets a chance to
// skip anything because there is no re-render, and the Flight
// dispatcher's useMemo just calls the factory every time. They read as
// client-side optimizations on a component that never runs on the
// client.
export const EnvelopeCard = ({ envelope }: EnvelopeCardProps) => {
  const envelopeId = envelope.id;
  const currencyConfig = CURRENCY_MAP[envelope.currency];

  const status = envelope.status;
  const calculations = {
    remaining: EnvelopeHelpers.getRemaining(envelope),
    percentage: EnvelopeHelpers.getPercentage(envelope),
    status,
    isExceeded: status === "exceeded",
    isUnlimited: status === "unlimited",
  };

  const progressColorClass = EnvelopeHelpers.getStatusProgressBarColorClass(
    calculations.status,
  );
  const amountTextColorClass = EnvelopeHelpers.getStatusTextColorClass(
    calculations.status,
  );

  return (
    // No left-border accent bar - a flat color stripe down the side of
    // every card read as generic template chrome, not something specific
    // to this app (see the redesign notes on avoiding that pattern).
    // border/60 (was border-0) does the "this card is its own thing"
    // job instead, as a hairline all the way around.
    //
    // Compact single-glance shape (icon+name+percent row / thin bar /
    // one-line totals) instead of a tall label-above-value stat block -
    // matches the density of the mockup's own envelope list, and the
    // grid can fit meaningfully more of a list without scrolling.
    <Card
      size="sm"
      className="group relative h-full overflow-hidden border-border/60 bg-card/50 shadow-sm transition-all duration-300 hover:bg-card hover:shadow-lg"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CategoryIcon
            category={envelope.category}
            className="h-9 w-9 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110"
          />

          <div className="min-w-0 space-y-0.5">
            {/* No fixed max-w here on purpose - min-w-0 on this and the
                two ancestors above is what actually lets `truncate` cut
                the name off against whatever space the actions on the
                right leave, instead of a magic pixel value that either
                truncated names way earlier than it had to or (on a
                wider card) left space unused. */}
            <CardTitle className="text-sm leading-none font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              <span className="block truncate">{envelope.name}</span>
            </CardTitle>
            {/* Always shows the creation month/year, not just when a
                category is set - envelope names are free text and
                commonly reused across years (e.g. a recurring "Agosto
                NUU" every year), so without this there'd be no way to
                tell which year's card is which in the list. */}
            <Text className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
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
              <span className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-[10px] text-secondary-foreground">
                {envelope.currency}
              </span>
            </Text>
          </div>
        </div>

        {/* Percent (or the actions, on hover/desktop) sits where the
            mockup's own trailing "64%" reads - front and center next to
            the name, not buried below in a separate labeled row. */}
        {!calculations.isUnlimited && (
          <span
            className={`shrink-0 font-mono text-sm font-bold ${amountTextColorClass}`}
          >
            {Math.min(calculations.percentage ?? 0, 100).toFixed(0)}%
          </span>
        )}

        {/* Actions */}
        <div className="flex shrink-0 items-center">
          <CardHoverActions>
            <UpdateEnvelopeDialog envelope={envelope} />
            <DeleteEnvelopeAlertDialog id={envelope.id} name={envelope.name} />
          </CardHoverActions>

          {/* Mobile Actions */}
          <div className="md:hidden" data-no-nav>
            <EnvelopeActionsMenu envelope={envelope} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-2.5">
        {!calculations.isUnlimited && (
          <Progress
            value={Math.min(calculations.percentage ?? 0, 100)}
            className={`h-1.5 rounded-full bg-secondary/50 ${progressColorClass}`}
          />
        )}

        {/* One line, ends split - the app's own equivalent of the
            mockup's "$320.000 gastado ... $180.000 disp." footer,
            instead of a label-above-value 2-column block that doubled
            this section's height for the same two numbers. */}
        <div className="flex items-center justify-between font-mono text-xs">
          <span className={calculations.isUnlimited ? "font-bold" : ""}>
            <span
              className={
                calculations.isUnlimited ? amountTextColorClass : undefined
              }
            >
              {formatCurrency(+envelope.spent, currencyConfig)}
            </span>{" "}
            <span className="text-muted-foreground">
              {calculations.isUnlimited ? "sin límite" : "gastado"}
            </span>
          </span>
          {calculations.isUnlimited ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <InfinityIcon className="h-3 w-3" />
            </span>
          ) : (
            <span
              className={
                (calculations.remaining ?? 0) < 0
                  ? "font-semibold text-destructive"
                  : "font-semibold text-success"
              }
            >
              {formatCurrency(calculations.remaining ?? 0, currencyConfig)} disp.
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          nativeButton={false}
          className="group/btn h-auto w-full justify-end gap-1 px-0 py-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-primary"
          render={
            <Link href={`/dashboard/envelope/${envelopeId}`}>
              Ver detalles
              <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
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
};

import { ArrowDown, ArrowUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CURRENCY_MAP, formatCurrency, type CurrencyCode } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface HeroBalanceCardProps {
  currency: CurrencyCode;
  totalAssigned: number;
  /** Every envelope in this currency, capped or not - never used for
   * the Gastado figure or the progress bar below (see totalSpentCapped). */
  totalSpent: number;
  /** Spend within capped envelopes only - what totalAvailable is
   * actually derived from, so this (not totalSpent) is what "Gastado"
   * and the progress bar need to stay consistent with Disponible. */
  totalSpentCapped: number;
  totalAvailable: number;
  /** Real month-over-month change in "disponible", derived from the last
   * two entries of the dashboard summary's monthly chart - only ever
   * passed for the one currency that chart is scoped to (see
   * dashboard/page.tsx). Never fabricated for the others; omitted there
   * instead of showing a made-up number. */
  deltaPercent?: number | null;
  /** Lets the parent grid span this card across both columns when it's
   * the odd one out in its row - see dashboard/page.tsx. */
  className?: string;
}

// The redesign's "hero" treatment for the Resumen page - previously this
// data only ever rendered as one of StatsCards' small grid tiles. Serif
// display numeral + thin progress bar + tabular Gastado figure, same
// visual language the mockup used for the balance.
export function HeroBalanceCard({
  currency,
  totalAssigned,
  totalSpent,
  totalSpentCapped,
  totalAvailable,
  deltaPercent,
  className,
}: HeroBalanceCardProps) {
  const config = CURRENCY_MAP[currency];
  const percentage =
    totalAssigned > 0
      ? Math.min((totalSpentCapped / totalAssigned) * 100, 100)
      : 0;
  // Spent in envelopes with no limit - real money, just not part of any
  // budget, so it can't be folded into Gastado/percentage above without
  // making them inconsistent with Disponible (see totalSpentCapped's
  // doc comment). Surfaced as its own line instead of hidden.
  const unlimitedSpent = totalSpent - totalSpentCapped;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {/* Always shown, even with a single currency in play - money
              amounts read as ambiguous without it (is this pesos or
              dollars?), and a user with one currency today may add a
              second one later without this label suddenly appearing. */}
          Disponible este mes · {currency}
        </span>
        {deltaPercent != null && (
          <span
            className={cn(
              "flex items-center gap-1 font-mono text-xs font-semibold",
              deltaPercent >= 0 ? "text-primary" : "text-destructive",
            )}
          >
            {deltaPercent >= 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(deltaPercent).toFixed(0)}% vs mes anterior
          </span>
        )}
      </div>

      <p
        className={cn(
          "mt-1.5 font-serif text-4xl font-semibold tabular-nums tracking-tight",
          totalAvailable < 0 ? "text-destructive" : "text-foreground",
        )}
      >
        {formatCurrency(totalAvailable, config)}
      </p>

      {totalAssigned > 0 && (
        <>
          <Progress
            value={percentage}
            className="mt-4 h-1.5 rounded-full [&_[data-slot=progress-indicator]]:bg-primary"
          />
          <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Gastado{" "}
              <b className="font-mono font-semibold text-foreground">
                {formatCurrency(totalSpentCapped, config)}
              </b>
            </span>
            <span>{percentage.toFixed(0)}% del presupuesto</span>
          </div>
        </>
      )}

      {unlimitedSpent > 0 && (
        <p
          className={cn(
            "text-xs text-muted-foreground",
            totalAssigned > 0 ? "mt-1.5" : "mt-4",
          )}
        >
          +{" "}
          <b className="font-mono font-semibold text-foreground">
            {formatCurrency(unlimitedSpent, config)}
          </b>{" "}
          en sobres sin límite
        </p>
      )}
    </div>
  );
}

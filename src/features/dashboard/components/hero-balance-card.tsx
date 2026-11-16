import { useTranslations } from "next-intl";
import { Progress } from "@/shared/components/ui/progress";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";
import { cn } from "@/shared/lib/utils";

interface HeroBalanceCardProps {
  currency: CurrencyCode;
  totalAssigned: number;
  /** Every envelope in this currency, capped or not - never used for
   * the Gastado figure or the progress bar below (see totalSpentCapped). */
  totalSpent: number;
  /** Spend within capped envelopes only - what "Gastado" and the
   * progress bar compare against totalAssigned. */
  totalSpentCapped: number;
  /** What is left in envelopes still under their limit - never negative.
   * The envelopes' state today, not filtered by any month: the same
   * number whether someone keeps one envelope per month or one per
   * purpose for good. */
  totalAvailable: number;
  /** How far envelopes over their limit went past it, shown on its own
   * line rather than netted against totalAvailable. */
  totalExceeded: number;
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
  totalExceeded,
  className,
}: HeroBalanceCardProps) {
  const t = useTranslations("dashboard");
  const tStats = useTranslations("statistics");
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
  const isOverBudget = totalSpentCapped > totalAssigned;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm",
        className,
      )}
    >
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {/* Always shown, even with a single currency in play - money
            amounts read as ambiguous without it (is this pesos or
            dollars?). Not "este mes": this is the envelopes' state, and
            envelopes are not necessarily monthly. */}
        {t("available")} · {currency}
      </span>

      <p className="mt-1.5 font-serif text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatCurrency(totalAvailable, config)}
      </p>

      {totalExceeded > 0 && (
        <p className="mt-1 text-sm text-destructive">
          <b className="font-mono font-semibold">
            {formatCurrency(totalExceeded, config)}
          </b>{" "}
          {t("exceededInEnvelopes")}
        </p>
      )}

      {totalAssigned > 0 && (
        <>
          {/* Red once the capped envelopes together are over budget: a
              full green bar there read as "all good". */}
          <Progress
            value={percentage}
            className={cn(
              "mt-4 h-1.5 rounded-full",
              isOverBudget
                ? "[&_[data-slot=progress-indicator]]:bg-destructive"
                : "[&_[data-slot=progress-indicator]]:bg-primary",
            )}
          />
          <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("spent")}{" "}
              <b className="font-mono font-semibold text-foreground">
                {formatCurrency(totalSpentCapped, config)}
              </b>
            </span>
            <span>
              {percentage.toFixed(0)}
              {t("percentOfBudget")}
            </span>
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
          {tStats("inUnlimited")}
        </p>
      )}
    </div>
  );
}

"use client";
import { Cell, Label, Pie, PieChart } from "recharts";
import { useTranslations } from "next-intl";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { EnvelopeProgressStatus } from "@/features/envelopes/lib/envelope-helpers";

interface EnvelopeChartProps {
  spent: number;
  total: number;
  /** From `envelope.status`, reported by the API - the chart colors
   * itself off the same status every other view (the envelopes list's
   * progress bars, envelope-card.tsx, this same page's own spent
   * figure right next to it) uses, instead of a bespoke `spent > total`
   * check of its own. That used to mean the chart could show green at
   * 92% (only "exceeded" flips it, no warning state) while the number
   * beside it was already amber - same envelope, two different verdicts
   * on the same page. Never "unlimited" here - the page only renders
   * this chart for a capped envelope; unlimited ones show a running
   * total instead (see envelope/[envelopeId]/page.tsx).
   */
  status: Exclude<EnvelopeProgressStatus, "unlimited">;
}

// "Donut Chart - Text" pattern from ui.shadcn.com/charts/pie: the stats
// next to this on the envelope detail page already spell out the exact
// spent/limit numbers and percentage, so this chart's only job is to be the
// one *visual* read of that same ratio - the center label carries the
// number so nobody has to eyeball a slice size, and there's no separate
// legend competing with it (the two colors are self-explained by the
// center label plus the surrounding numbers). No Card wrapper here - it's
// embedded inside the envelope detail page's own summary panel.
export const EnvelopeChart = ({ spent, total, status }: EnvelopeChartProps) => {
  const t = useTranslations("envelopes.chart");
  const isExceeded = status === "exceeded";
  const isWarning = status === "warning";
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const remaining = Math.max(0, total - spent);
  const overspent = Math.max(0, spent - total);

  // Which config key colors the "spent" wedge itself - green normally,
  // amber in the warning zone. Exceeded keeps the wedge up to the limit
  // green and adds a second red "overspent" wedge for the overage
  // instead, same idea as everywhere else that shows "how much was
  // within budget" separately from "how much went over."
  const spentKey = isWarning ? "warningSpent" : "spent";

  const data = isExceeded
    ? [
        { name: "spent", value: total, fill: "var(--color-spent)" },
        { name: "overspent", value: overspent, fill: "var(--color-overspent)" },
      ]
    : [
        { name: spentKey, value: spent, fill: `var(--color-${spentKey})` },
        { name: "available", value: remaining, fill: "var(--color-available)" },
      ];

  const chartConfig = {
    spent: {
      label: t("spent"),
      color: "var(--chart-1)",
    },
    warningSpent: {
      label: t("spent"),
      color: "var(--color-amber-500)",
    },
    available: {
      label: t("available"),
      // A neutral "track" tone rather than a data color - --muted matches
      // --card's lightness in dark mode (near-invisible), so this uses
      // --muted-foreground instead, softened via Cell's fillOpacity below.
      color: "var(--muted-foreground)",
    },
    overspent: {
      label: t("exceeded"),
      color: "var(--destructive)",
    },
  } satisfies ChartConfig;

  const spentDotClass = isExceeded
    ? "bg-destructive"
    : isWarning
      ? "bg-amber-500"
      : "bg-chart-1";
  const percentageTextClass = isExceeded
    ? "fill-destructive"
    : isWarning
      ? "fill-amber-500"
      : "fill-foreground";

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-48 max-h-48"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={76}
            strokeWidth={5}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                fillOpacity={entry.name === "available" ? 0.35 : 1}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className={`text-2xl font-bold ${percentageTextClass}`}
                    >
                      {Math.round(percentage)}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      {isExceeded ? t("limitExceeded") : t("used")}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="mt-1 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${spentDotClass}`} />
          {t("spent")}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isExceeded ? "bg-destructive" : "bg-muted-foreground/35"
            }`}
          />
          {isExceeded ? "Excedido" : "Disponible"}
        </span>
      </div>
    </div>
  );
};

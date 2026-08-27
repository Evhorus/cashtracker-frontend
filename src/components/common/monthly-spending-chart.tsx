"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CURRENCY_MAP, type CurrencyCode } from "@/lib/format-currency";

type MonthlySpendingChartData = {
  label: string;
  Gastado: number;
  Disponible: number;
};

interface MonthlySpendingChartProps {
  totalEnvelopes: number;
  chartData: MonthlySpendingChartData[];
  /** Which currency chartData's amounts are in - the backend scopes
   * this chart to the user's most-used currency instead of summing
   * every currency onto the same bars (see dashboard.repository.ts's
   * getMonthlySpending doc comment on the backend). */
  currency: CurrencyCode;
  /** Only worth spelling out in the title when there's real ambiguity
   * to resolve - a single-currency account doesn't need reminding
   * which currency its own chart is in. */
  hasOtherCurrencies: boolean;
}

// Grouped by month (not by envelope) - envelopes in this app are always
// "one account for one month" (e.g. "Marzo Rappi"), so a per-envelope
// chart mixed accounts and months with no meaningful order. Per-month
// is both meaningful on its own and naturally sorts chronologically -
// the backend already returns entries oldest-to-newest.
//
// Two side-by-side bars per month (not stacked) - Gastado and Disponible
// don't sum to a meaningful third quantity, so stacking them into one bar
// implied a relationship ("this is the budget") that isn't actually true
// once an envelope is exceeded (Disponible goes negative, which a stack
// can't render at all). Grouped bars compare the two directly instead.
// Gastado reuses the app's own primary accent (the color spent amounts
// already render in everywhere else - envelope cards, the detail page);
// Disponible is muted-foreground, a status-style "this is the backdrop,
// not a second category" pairing rather than a second competing hue.
export const MonthlySpendingChart = ({
  chartData,
  totalEnvelopes,
  currency,
  hasOtherCurrencies,
}: MonthlySpendingChartProps) => {
  // A single bar can't show a trend - it's the same Gastado/Disponible
  // split the stat cards above already spell out in text, just redrawn
  // as a ~320px-tall chart. That's not "no info", it's negative value
  // (a lot of scroll for nothing new), so this only renders once there's
  // an actual month-over-month comparison to show. Every envelope
  // created the same day (a fresh account, or a bulk import) hits this
  // exact case, since the backend buckets by envelope creation month.
  if (totalEnvelopes === 0 || chartData.length < 2) return null;

  const chartConfig = {
    Gastado: {
      label: "Gastado",
      color: "var(--color-primary)",
    },
    Disponible: {
      label: "Disponible",
      color: "var(--color-muted-foreground)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="animate-fade-in [animation-delay:0.4s]">
      <CardHeader>
        <CardTitle>
          Gastos por Mes
          {hasOtherCurrencies && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({CURRENCY_MAP[currency]?.label ?? currency})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full sm:h-80"
        >
          <BarChart accessibilityLayer data={chartData} barGap={4} barCategoryGap="30%">
            {/*
              Full labels ("Ago 2026") got shown-but-cramped: on narrow
              screens recharts starts skipping ticks to avoid overlap,
              leaving it ambiguous which bar was which month/year. A
              single letter turned out too ambiguous on its own ("O"
              could be almost anything) - the 3-letter month
              abbreviation (labels already start with one, e.g. "Ago")
              is still short enough to avoid skipping, but actually
              reads as a month. Full month/year (plus the year, when
              the range spans more than one) still shows in the
              tooltip on hover (desktop) or tap (touch, recharts
              already treats a touch as a hover for this).

              No CartesianGrid - a busy row of horizontal gridlines behind
              two-bars-per-month reads as chart-template chrome, not this
              app's own visual language elsewhere (thin hairline borders,
              nothing else). The axis line itself (recessive, --border) is
              the only baseline the bars need.
            */}
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="Gastado"
              fill="var(--color-Gastado)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="Disponible"
              fill="var(--color-Disponible)"
              fillOpacity={0.6}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

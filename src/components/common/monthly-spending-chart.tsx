"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

// "Bar Chart - Stacked + Legend" pattern from ui.shadcn.com/charts/bar.
// Grouped by month (not by envelope) - envelopes in this app are always
// "one account for one month" (e.g. "Marzo Rappi"), so a per-envelope
// chart mixed accounts and months with no meaningful order. Per-month
// is both meaningful on its own and naturally sorts chronologically -
// the backend already returns entries oldest-to-newest.
//
// TODO(charts): this and EnvelopeChart (src/features/envelopes/components/
// envelope-chart.tsx) still need a real design pass - colors, tooltip
// content, empty/loading states - once the current pending work is done.
// Revisit both together, not just this one.
export const MonthlySpendingChart = ({
  chartData,
  totalEnvelopes,
  currency,
  hasOtherCurrencies,
}: MonthlySpendingChartProps) => {
  if (totalEnvelopes === 0) return null;

  const chartConfig = {
    Gastado: {
      label: "Gastado",
      color: "var(--chart-1)",
    },
    Disponible: {
      label: "Disponible",
      color: "var(--chart-4)",
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
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
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
            */}
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="Gastado"
              stackId="month"
              fill="var(--color-Gastado)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="Disponible"
              stackId="month"
              fill="var(--color-Disponible)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

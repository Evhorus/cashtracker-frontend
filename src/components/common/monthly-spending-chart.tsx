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

type MonthlySpendingChartData = {
  label: string;
  Gastado: number;
  Disponible: number;
};

interface MonthlySpendingChartProps {
  totalEnvelopes: number;
  chartData: MonthlySpendingChartData[];
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
        <CardTitle>Gastos por Mes</CardTitle>
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
              single-letter initial is short enough to never need
              skipping, so every bar keeps some at-a-glance reference -
              the full month/year still shows in the tooltip on hover
              (desktop) or tap (touch, recharts already treats a touch
              as a hover for this).
            */}
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) => value.charAt(0)}
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

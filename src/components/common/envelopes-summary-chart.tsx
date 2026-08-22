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

type EnvelopesSummaryChartData = {
  name: string;
  Gastado: number;
  Disponible: number;
};

interface EnvelopesSummaryChartProps {
  totalEnvelopes: number;
  chartData: EnvelopesSummaryChartData[];
}

// "Bar Chart - Stacked + Legend" pattern from ui.shadcn.com/charts/bar,
// adapted to our data: Gastado + Disponible are the two parts of the same
// envelope amount, so stacking them is meaningful (the bar's total height
// is the envelope's amount). Two distinct chart colors (not both green)
// per design feedback.
//
// TODO(charts): this and EnvelopeChart (src/features/envelopes/components/
// envelope-chart.tsx) still need a real design pass - colors, tooltip
// content, empty/loading states - once the current pending work is done.
// Revisit both together, not just this one.
export const EnvelopesSummaryChart = ({
  chartData,
  totalEnvelopes,
}: EnvelopesSummaryChartProps) => {
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
        <CardTitle>Resumen de Sobres</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full sm:h-80"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="Gastado"
              stackId="envelope"
              fill="var(--color-Gastado)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="Disponible"
              stackId="envelope"
              fill="var(--color-Disponible)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

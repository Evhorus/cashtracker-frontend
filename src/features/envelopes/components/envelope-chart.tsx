"use client";
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// TODO(charts): needs a real design pass - colors currently reuse
// --primary/--secondary/--destructive instead of the dedicated --chart-*
// palette used by EnvelopesSummaryChart, and it hasn't been checked on
// mobile viewports yet. Revisit together with
// src/components/common/envelopes-summary-chart.tsx once the current
// pending work is done.
interface EnvelopeChartProps {
  spent: number;
  total: number;
}

export const EnvelopeChart = ({ spent, total }: EnvelopeChartProps) => {
  const remaining = Math.max(0, total - spent);
  const overspent = Math.max(0, spent - total);

  // Data configuration
  const data =
    overspent > 0
      ? [
          { name: "spent", value: total, fill: "var(--color-spent)" },
          {
            name: "overspent",
            value: overspent,
            fill: "var(--color-overspent)",
          },
        ]
      : [
          { name: "spent", value: spent, fill: "var(--color-spent)" },
          {
            name: "available",
            value: remaining,
            fill: "var(--color-available)",
          },
        ];

  const chartConfig = {
    spent: {
      label: "Gastado",
      color: "var(--primary)",
    },
    available: {
      label: "Disponible",
      color: "var(--secondary)",
    },
    overspent: {
      label: "Excedido",
      color: "var(--destructive)",
    },
    overspentExtra: {
      label: "Excedido",
      color: "var(--destructive)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col border-0 shadow-sm transition-colors duration-300">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución de Gastos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-75 max-h-75"
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
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {/* Legend Customization */}
            <ChartLegend
              content={<ChartLegendContent payload={[]} />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

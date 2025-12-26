"use client";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

interface BudgetChartProps {
  spent: number;
  total: number;
}

export const BudgetChart = ({ spent, total }: BudgetChartProps) => {
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
      color: "var(--chart-1)",
    },
    available: {
      label: "Disponible",
      color: "var(--chart-2)",
    },
    overspent: {
      label: "Gastado (Límite)",
      color: "var(--chart-3)",
    },
    overspentExtra: {
      label: "Excedido",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto h-64 w-full aspect-square md:aspect-auto"
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
        <ChartLegend
          content={
            <ChartLegendContent
              payload={[]}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          }
          className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
};

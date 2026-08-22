"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type EnvelopesSummaryChartData = {
  name: string;
  Gastado: number;
  Total: number;
};

interface EnvelopesSummaryChartProps {
  totalEnvelopes: number;
  chartData: EnvelopesSummaryChartData[];
}

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
    Total: {
      label: "Total",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="animate-fade-in [animation-delay:0.4s]">
      <CardHeader>
        <CardTitle>Resumen de Presupuestos</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="Gastado" fill="var(--color-Gastado)" radius={4} />
            <Bar dataKey="Total" fill="var(--color-Total)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

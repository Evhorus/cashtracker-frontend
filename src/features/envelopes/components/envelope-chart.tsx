"use client";
import { Cell, Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface EnvelopeChartProps {
  spent: number;
  total: number;
}

// "Donut Chart - Text" pattern from ui.shadcn.com/charts/pie: the two stat
// cards above this on the envelope detail page already spell out the exact
// spent/limit numbers and percentage, so this chart's only job is to be the
// one *visual* read of that same ratio - the center label carries the
// number so nobody has to eyeball a slice size, and there's no separate
// legend competing with it (the two colors are self-explained by the
// center label plus the surrounding cards).
export const EnvelopeChart = ({ spent, total }: EnvelopeChartProps) => {
  const isExceeded = spent > total;
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const remaining = Math.max(0, total - spent);
  const overspent = Math.max(0, spent - total);

  const data = isExceeded
    ? [
        { name: "spent", value: total, fill: "var(--color-spent)" },
        { name: "overspent", value: overspent, fill: "var(--color-overspent)" },
      ]
    : [
        { name: "spent", value: spent, fill: "var(--color-spent)" },
        { name: "available", value: remaining, fill: "var(--color-available)" },
      ];

  const chartConfig = {
    spent: {
      label: "Gastado",
      color: "var(--chart-1)",
    },
    available: {
      label: "Disponible",
      // A neutral "track" tone rather than a data color - --muted matches
      // --card's lightness in dark mode (near-invisible), so this uses
      // --muted-foreground instead, softened via Cell's fillOpacity below.
      color: "var(--muted-foreground)",
    },
    overspent: {
      label: "Excedido",
      color: "var(--destructive)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col border-0 shadow-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución de Gastos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-64 max-h-64"
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
              outerRadius={90}
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
                        className={`text-3xl font-bold ${
                          isExceeded ? "fill-destructive" : "fill-foreground"
                        }`}
                      >
                        {Math.round(percentage)}%
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 22}
                        className="fill-muted-foreground text-xs"
                      >
                        {isExceeded ? "Límite excedido" : "usado"}
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-1" />
            Gastado
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
      </CardContent>
    </Card>
  );
};

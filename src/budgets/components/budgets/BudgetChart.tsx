"use client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/shared/lib/format-currency";
import { useEffect, useState } from "react";

interface BudgetChartProps {
  spent: number;
  total: number;
}

const COLORS = {
  spent: "var(--chart-1)",
  available: "var(--chart-2)",
  overspent: "var(--chart-3)",
  overspentExtra: "var(--chart-4)",
};

export const BudgetChart = ({ spent, total }: BudgetChartProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const remaining = Math.max(0, total - spent);
  const overspent = Math.max(0, spent - total);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const data =
    overspent > 0
      ? [
          { name: "Gastado", value: total, color: COLORS.overspent },
          {
            name: "Excedido",
            value: overspent,
            color: COLORS.overspentExtra,
          },
        ]
      : [
          { name: "Gastado", value: spent, color: COLORS.spent },
          { name: "Disponible", value: remaining, color: COLORS.available },
        ];

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLegend = (props: { payload?: readonly unknown[] }) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <ul className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
        {payload.map((entry, index: number) => {
          const item = entry as {
            value: string;
            color: string;
            payload: { value: number };
          };
          const percentage = ((item.payload.value / totalValue) * 100).toFixed(
            0
          );
          return (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">
                {item.value} {isMobile && `(${percentage}%)`}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={
              !isMobile
                ? ({ name, percent }) => {
                    return `${name} ${(Number(percent) * 100).toFixed(0)}%`;
                  }
                : false
            }
            outerRadius={isMobile ? 60 : 80}
            innerRadius={isMobile ? 35 : 40}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend content={renderCustomLegend as never} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

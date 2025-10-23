'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../lib/format-currency';

type ChartData = {
  name: string;
  Gastado: number;
  Total: number;
};

interface ChartProps {
  totalBudgets: number;
  chartData: ChartData[];
}

const formatCompactNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

export const Chart = ({ chartData, totalBudgets }: ChartProps) => {
  if (totalBudgets === 0) return null;

  return (
    <Card className="animate-fade-in [animation-delay:0.4s]">
      <CardHeader>
        <CardTitle>Resumen de Presupuestos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                className="text-xs text-muted-foreground"
                stroke="currentColor"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                stroke="currentColor"
                tickFormatter={formatCompactNumber}
                width={40}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar
                dataKey="Gastado"
                className="fill-chart-3"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Total"
                className="fill-chart-1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

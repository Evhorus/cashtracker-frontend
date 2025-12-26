import { Wallet, DollarSign, TrendingUp, PieChart } from "lucide-react";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { formatCurrency } from "../lib/format-currency";

interface StatsCardProps {
  totalCount: number;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
}

export const StatsCards = ({
  totalBudget,
  totalCount,
  totalSpent,
  totalRemaining,
}: StatsCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Presupuestos Activos
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in [animation-delay:100ms]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Presupuestado
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalBudget)}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in [animation-delay:200ms]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Gastado
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalBudget > 0
              ? `${((totalSpent / totalBudget) * 100).toFixed(1)}%`
              : "0%"}{" "}
            del total
          </p>
        </CardContent>
      </Card>

      <Card className="animate-fade-in [animation-delay:300ms]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Disponible
          </CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold`}>
            {formatCurrency(totalRemaining)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

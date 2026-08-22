import { Wallet, DollarSign, TrendingUp, PieChart } from "lucide-react";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";

interface StatsCardProps {
  totalCount: number;
  totalAmount: number;
  totalSpent: number;
  totalRemaining: number;
}

export const StatsCards = ({
  totalAmount,
  totalCount,
  totalSpent,
  totalRemaining,
}: StatsCardProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 hover:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Presupuestos Activos
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 [animation-delay:100ms] hover:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Presupuestado
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalAmount)}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 [animation-delay:200ms] hover:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Gastado
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalAmount > 0
              ? `${((totalSpent / totalAmount) * 100).toFixed(1)}%`
              : "0%"}{" "}
            del total
          </p>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-0 bg-card/50 shadow-sm transition-colors duration-300 [animation-delay:300ms] hover:bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Disponible
          </CardTitle>
          <div className="bg-success/10 text-success flex h-8 w-8 items-center justify-center rounded-full">
            <PieChart className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              totalRemaining < 0 ? "text-destructive" : "text-success"
            }`}
          >
            {formatCurrency(totalRemaining)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

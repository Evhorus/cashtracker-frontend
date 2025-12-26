import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { formatCurrency } from "@/shared/lib/format-currency";
import { ArrowRight, Wallet } from "lucide-react";

import Link from "next/link";
import { useMemo } from "react";
import React from "react";
import { BudgetHelpers } from "@/budgets/lib/budget-helpers";
import { Budget } from "@/budgets/types";
import { UpdateBudgetDialog } from "./UpdateBudgetDialog";
import { DeleteBudgetAlertDialog } from "./DeleteBudgetAlertDialog";
import { BudgetActionsMenu } from "./BudgetActionsMenu";

interface BudgetCardProps {
  budget: Budget;
}

export const BudgetCard = React.memo(({ budget }: BudgetCardProps) => {
  const budgetId = budget.id;

  const calculations = useMemo(
    () => ({
      remaining: BudgetHelpers.getRemaining(budget),
      percentage: BudgetHelpers.getPercentage(budget),
      isOverBudget: BudgetHelpers.isOverBudget(budget),
    }),
    [budget]
  );

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm hover:bg-card">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/60 group-hover:bg-primary transition-colors duration-300" />

      <div className="absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardHeader className="pb-3 relative z-10 flex flex-row items-start justify-between space-y-0">
        <div className="flex gap-4 items-center">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Wallet className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg font-bold leading-none tracking-tight group-hover:text-primary transition-colors duration-200">
              <span className="truncate block max-w-[150px] sm:max-w-[200px]">
                {budget.name}
              </span>
            </CardTitle>
            {budget.category && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {budget.category}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
            <UpdateBudgetDialog budget={budget} />
            <DeleteBudgetAlertDialog id={budget.id} name={budget.name} />
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <div data-no-nav>
              <BudgetActionsMenu budget={budget} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium text-muted-foreground">
              Progreso
            </span>
            <span
              className={`text-sm font-bold ${
                calculations.isOverBudget ? "text-destructive" : "text-primary"
              }`}
            >
              {Math.min(calculations.percentage, 100).toFixed(0)}%
            </span>
          </div>
          <Progress
            value={Math.min(calculations.percentage, 100)}
            className={`h-2.5 rounded-full bg-secondary/50 ${
              calculations.isOverBudget
                ? "[&>div]:bg-destructive"
                : "[&>div]:bg-primary"
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Gastado</p>
            <p
              className={`text-sm font-bold ${
                calculations.isOverBudget
                  ? "text-destructive"
                  : "text-foreground"
              }`}
            >
              {formatCurrency(+budget.spent)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground font-medium">
              Disponible
            </p>
            <p
              className={`text-sm font-bold ${
                calculations.remaining < 0 ? "text-destructive" : "text-success"
              }`}
            >
              {formatCurrency(calculations.remaining)}
            </p>
          </div>
        </div>

        <Button
          asChild
          variant="ghost"
          className="w-full group/btn justify-between hover:bg-primary/5 hover:text-primary h-auto py-2 px-0 font-medium"
        >
          <Link href={`/dashboard/budget/${budgetId}`}>
            <span className="ml-1">Ver detalles</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-all duration-300">
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </div>
          </Link>
        </Button>
      </CardContent>

      {/* Status Badge */}
      {calculations.isOverBudget && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive/50" />
      )}
    </Card>
  );
});

BudgetCard.displayName = "BudgetCard";

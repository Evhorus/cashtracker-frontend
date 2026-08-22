import { Button } from "@/components/common/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format-currency";
import { ArrowRight, Wallet } from "lucide-react";

import Link from "next/link";
import { useMemo } from "react";
import React from "react";
import { BudgetHelpers } from "@/features/budgets/lib/budget-helpers";
import { Budget } from "@/features/budgets/types";
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
    [budget],
  );

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-lg">
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary/60 transition-colors duration-300 group-hover:bg-primary" />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-transform duration-300 group-hover:scale-110">
            <Wallet className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg leading-none font-bold tracking-tight transition-colors duration-200 group-hover:text-primary">
              <span className="block max-w-37.5 truncate sm:max-w-50">
                {budget.name}
              </span>
            </CardTitle>
            {budget.category && (
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {budget.category}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          {/* Desktop Actions */}
          <div className="hidden translate-x-2 items-center gap-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:flex">
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

      <CardContent className="relative z-10 space-y-5">
        <div className="space-y-2">
          <div className="flex items-end justify-between">
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
            <p className="text-xs font-medium text-muted-foreground">Gastado</p>
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
            <p className="text-xs font-medium text-muted-foreground">
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
          className="group/btn h-auto w-full justify-between px-0 py-2 font-medium hover:bg-primary/5 hover:text-primary"
        >
          <Link href={`/dashboard/budget/${budgetId}`}>
            <span className="ml-1">Ver detalles</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover/btn:bg-primary group-hover/btn:text-primary-foreground">
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </div>
          </Link>
        </Button>
      </CardContent>

      {/* Status Badge */}
      {calculations.isOverBudget && (
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-destructive/50" />
      )}
    </Card>
  );
});

BudgetCard.displayName = "BudgetCard";

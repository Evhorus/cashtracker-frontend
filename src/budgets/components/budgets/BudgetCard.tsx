import { Budget } from '@/budgets/types';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { formatCurrency } from '@/shared/lib/format-currency';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

import Link from 'next/link';

interface BudgetCardProps {
  budget: Budget;
}

export const BudgetCard = ({ budget }: BudgetCardProps) => {
  const budgetId = budget.id;
  const remaining = +budget.amount - +budget.spent;
  const percentage = (+budget.spent / +budget.amount) * 100;
  const isOverBudget = +budget.spent > +budget.amount;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-custom-md animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="truncate">{budget.name}</span>
          {isOverBudget ? (
            <TrendingDown className="h-5 w-5 text-destructive " />
          ) : (
            <TrendingUp className="h-5 w-5 text-success " />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gastado</span>
            <span
              className={`font-semibold ${
                isOverBudget ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {formatCurrency(+budget.spent)}
            </span>
          </div>
          <Progress
            value={Math.min(percentage, 100)}
            className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">
              {formatCurrency(+budget.amount)}
            </span>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg ${
            isOverBudget
              ? 'bg-destructive/10 border border-destructive/20'
              : remaining < +budget.amount * 0.2
              ? 'bg-warning/10 border border-warning/20'
              : 'bg-success/10 border border-success/20'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Disponible</span>
            <span
              className={`text-lg font-bold ${
                isOverBudget ? 'text-destructive' : 'text-success'
              }`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <Link href={`/dashboard/budget/${budgetId}`}>
          <Button variant="outline" className="w-full group">
            Ver detalles
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

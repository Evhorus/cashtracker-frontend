import React from "react";
import { Budget } from "@/features/budgets/types";
import { Card } from "@/components/common/card";
import { Wallet } from "lucide-react";
import { CreateBudgetDialog } from "./CreateBudgetDialog";
import { BudgetCard } from "./BudgetCard";

interface BudgetsGridProps {
  budgets: Budget[];
}

export const BudgetsGrid = ({ budgets }: BudgetsGridProps) => {
  return (
    <>
      {budgets.length === 0 ? (
        <Card className="animate-fade-in p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="bg-primary-light mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              No tienes presupuestos aún
            </h3>
            <p className="text-muted-foreground">
              Crea tu primer presupuesto para comenzar a controlar tus gastos
            </p>
            <CreateBudgetDialog />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget, index) => (
            <div
              key={budget.id}
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <BudgetCard budget={budget} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

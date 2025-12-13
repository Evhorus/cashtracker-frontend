import React from "react";
import { Budget } from "../../types";
import { Card } from "@/shared/components/ui/card";
import { Wallet } from "lucide-react";
import { CreateBudgetDialog } from "./CreateBudgetDialog";
import { BudgetCard } from "./BudgetCard";

interface BudgetsGridProps {
  budgets: Budget[];
}

export const BudgetsGrid = ({ budgets }: BudgetsGridProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Mis Presupuestos</h2>
      {budgets.length === 0 ? (
        <Card className="p-12 text-center animate-fade-in">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary-light mx-auto flex items-center justify-center">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

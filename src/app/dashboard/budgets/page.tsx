import Link from "next/link";
import { getBudgetsAction } from "@/budgets/actions/budgets/get-budgets.action";
import { BudgetsGrid } from "@/budgets/components/budgets/BudgetsGrid";
import { CreateBudgetDialog } from "@/budgets/components/budgets/CreateBudgetDialog";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const budgets = await getBudgetsAction();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mis Presupuestos</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona todos tus presupuestos
            </p>
          </div>
        </div>
        <CreateBudgetDialog />
      </div>

      <BudgetsGrid budgets={budgets.data} />
    </div>
  );
}

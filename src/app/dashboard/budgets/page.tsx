import { getBudgetsAction } from "@/budgets/actions/budgets/get-budgets.action";
import { BudgetsGrid } from "@/budgets/components/budgets/BudgetsGrid";
import { CreateBudgetDialog } from "@/budgets/components/budgets/CreateBudgetDialog";
import { PageHeader } from "@/shared/components/PageHeader";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const budgets = await getBudgetsAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Presupuestos"
        description="Gestiona todos tus presupuestos"
        backUrl="/dashboard"
        actions={<CreateBudgetDialog />}
        mobileActions={<CreateBudgetDialog />}
      />

      <BudgetsGrid budgets={budgets.data} />
    </div>
  );
}

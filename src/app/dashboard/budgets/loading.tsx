import { PageHeaderSkeleton } from "@/shared/components/PageHeaderSkeleton";
import { BudgetsListSkeleton } from "@/budgets/components/budgets/BudgetsListSkeleton";

export default function BudgetsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      <BudgetsListSkeleton />
    </div>
  );
}

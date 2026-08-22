import { PageHeaderSkeleton } from "@/components/common/PageHeaderSkeleton";
import { BudgetsListSkeleton } from "@/features/budgets/components/BudgetsListSkeleton";

export default function BudgetsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      <BudgetsListSkeleton />
    </div>
  );
}

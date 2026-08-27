import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/common/page-header";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { resolveCategory } from "@/features/categories/lib/category-palette";
import { getCategoriesCached } from "@/features/categories/lib/get-categories-cached";
import { CategoriesSection } from "@/features/categories/components/categories-section";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";

// Force dynamic rendering because this page uses Clerk auth, same as
// account/page.tsx and dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await auth.protect();

  // Per-category envelope counts - fetched here (a Server Component)
  // rather than inside CategoriesSection itself, since that's "use
  // client" and can't fetch async. Same 100-envelope cap the
  // envelopes/statistics/dashboard pages use.
  const envelopesResult = await getEnvelopesAction({ limit: 100 });
  const categories = await getCategoriesCached();
  const categoryCounts = envelopesResult.data.reduce<Record<string, number>>(
    (counts, envelope) => {
      const category = resolveCategory(envelope.category, categories);
      if (category) counts[category.id] = (counts[category.id] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return (
    <div className="space-y-6">
      {/* Same convention as dashboard/envelopes/page.tsx: the create
          action lives in PageHeader, not in the content below - actions
          on desktop, mobileActions (same dialog, icon-only) on mobile. */}
      <PageHeader
        title="Categorías"
        backUrl="/dashboard"
        actions={<CreateCategoryDialog />}
        mobileActions={<CreateCategoryDialog />}
      />

      <CategoriesSection categoryCounts={categoryCounts} />
    </div>
  );
}

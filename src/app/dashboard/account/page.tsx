import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/common/page-header";
import { AccountView } from "@/features/account/components/account-view";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { resolveCategory } from "@/features/categories/lib/category-palette";

// Force dynamic rendering because this page uses Clerk auth, same as
// dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await auth.protect();

  // For CategoriesSection's per-category envelope counts - fetched here
  // (a Server Component) rather than inside CategoriesSection itself,
  // since it's nested under the "use client" AccountView tree and can't
  // be async. Same 100-envelope cap as statistics/dashboard pages.
  const envelopesResult = await getEnvelopesAction({ limit: 100 });
  const categoryCounts = envelopesResult.data.reduce<Record<string, number>>(
    (counts, envelope) => {
      const category = resolveCategory(envelope.category);
      if (category) counts[category.id] = (counts[category.id] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Mi cuenta"
        description="Gestiona tu perfil, seguridad y cuenta"
        backUrl="/dashboard"
      />
      <AccountView categoryCounts={categoryCounts} />
    </div>
  );
}

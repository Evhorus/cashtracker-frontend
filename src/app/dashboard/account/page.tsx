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
    // No mx-auto/max-w-* wrapper - every sibling page (Sobres,
    // Estadísticas, Resumen) just fills the layout's own container at
    // full width. This one used to cap itself narrower and center
    // within that, which both wasted space on wide viewports and made
    // the title visibly jump sideways when navigating here from any of
    // them (their left edge lines up with the container's; this one's
    // didn't, being centered inside it instead).
    <div className="space-y-6">
      <PageHeader
        title="Mi cuenta"
        description="Gestiona tu perfil, seguridad y cuenta"
        backUrl="/dashboard"
      />
      <AccountView categoryCounts={categoryCounts} />
    </div>
  );
}

import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/common/page-header";
import { getEnvelopes } from "@/features/envelopes/data/get-envelopes";
import { CategoriesSection } from "@/features/categories/components/categories-section";
import { CategoriesFilterProvider } from "@/features/categories/components/categories-filter-context";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";

export const metadata: Metadata = { title: "Categorías" };

// Force dynamic rendering because this page uses Clerk auth, same as
// account/page.tsx and dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await auth.protect();

  // Per-category envelope counts - fetched here (a Server Component)
  // rather than inside CategoriesSection itself, since that's "use
  // client" and can't fetch async. Same 100-envelope cap the
  // envelopes/statistics/dashboard pages use.
  const envelopesResult = await getEnvelopes({ limit: 100 });
  // A straight count by id now that envelopes reference categories
  // properly - no resolving a free-text label against the list first.
  const categoryCounts = envelopesResult.data.reduce<Record<string, number>>(
    (counts, envelope) => {
      const id = envelope.category?.id;
      if (id) counts[id] = (counts[id] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return (
    // CategoriesFilterProvider holds the search/type state shared between
    // the search box (rendered inside CategoriesSection, next to the
    // type tabs) and the filtering logic there - see that context file's
    // comment for why a context instead of local state, now that the
    // search box isn't a sibling of CategoriesSection anymore.
    <CategoriesFilterProvider>
      <div className="space-y-6">
        {/* Same convention as dashboard/envelopes/page.tsx: the create
            action lives in PageHeader, not in the content below - actions
            on desktop, mobileActions (just the dialog, icon-only) on
            mobile. The search box lives in CategoriesSection, next to
            the type tabs (Todas/Predeterminadas/Personalizadas), not
            here - it used to render in this actions slot but that left
            it isolated top-right with a lot of empty space around it on
            a wide viewport, far from both the title and the table it
            filters. */}
        <PageHeader
          title="Categorías"
          backUrl="/dashboard"
          actions={<CreateCategoryDialog />}
          mobileActions={<CreateCategoryDialog />}
        />

        <CategoriesSection categoryCounts={categoryCounts} />
      </div>
    </CategoriesFilterProvider>
  );
}

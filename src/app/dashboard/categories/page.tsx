import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/common/page-header";
import { getCategoryUsage } from "@/features/categories/data/get-category-usage";
import { CategoriesSection } from "@/features/categories/components/categories-section";
import { CategoriesFilterProvider } from "@/features/categories/components/categories-filter-context";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return { title: t("title") };
}

// Force dynamic rendering because this page uses Clerk auth, same as
// account/page.tsx and dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await auth.protect();
  const t = await getTranslations("categories");

  // Counted by the backend (GET /categories/usage). This used to fetch
  // every envelope - capped at 100 - and count in memory, so the numbers
  // quietly went wrong for an account past that. It was the last place in
  // the app still doing that.
  //
  // Fetched here rather than inside CategoriesSection because that is a
  // Client Component and can't fetch async.
  const categoryCounts = await getCategoryUsage();

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
          title={t("title")}
          backUrl="/dashboard"
          actions={<CreateCategoryDialog />}
          mobileActions={<CreateCategoryDialog />}
        />

        <CategoriesSection categoryCounts={categoryCounts} />
      </div>
    </CategoriesFilterProvider>
  );
}

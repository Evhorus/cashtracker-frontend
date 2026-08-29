import type { Metadata } from "next";
import { CustomHeader } from "@/components/common/custom-header";
import { MobileNav } from "@/components/common/mobile-nav";
import { DashboardSidebar } from "@/components/common/dashboard-sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { getClerkLocalization } from "@/i18n/clerk-localization";
import { auth } from "@clerk/nextjs/server";
import { CategoriesProvider } from "@/providers/categories-provider";
import { getCategories } from "@/features/categories/data/get-categories";
import { getCategoryOptions } from "@/features/categories/data/get-category-options";

// The dashboard is behind auth and has nothing to offer a crawler, so
// it opts out of indexing explicitly rather than relying on the login
// redirect to keep it out. Pages under here set their own `title` and
// pick up the root layout's "%s | CashTracker" template.
export const metadata: Metadata = {
  // "Dashboard" is the product's own word for this area in both
  // languages, so it stays a constant - unlike the pages underneath,
  // which each set a translated title through generateMetadata.
  title: { default: "Dashboard", template: "%s | CashTracker" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  // Fetched once here (also seeds the per-request cache Server
  // Components reuse via getCategories()/getCategoryOptions(), both
  // wrapped in React's cache()) and handed to client components through
  // context - see providers/categories-provider.tsx.
  const [categories, options, clerkLocalization] = await Promise.all([
    getCategories(),
    getCategoryOptions(),
    getClerkLocalization(),
  ]);

  return (
    <ClerkProvider localization={clerkLocalization}>
      <CategoriesProvider categories={categories} options={options}>
        <div className="fixed inset-0 flex overflow-hidden bg-background">
          <DashboardSidebar />
          {/* min-w-0 so this column can actually shrink below its content's
              intrinsic width next to the sidebar - without it a wide child
              (e.g. the envelopes table) pushes the whole flex row wider than
              the viewport instead of scrolling internally. overflow-y-auto
              makes this column its own scroll container now that the shell
              above is a fixed-height, overflow-hidden viewport. */}
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
            <CustomHeader />
            <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
              {children}
            </main>
            <MobileNav />
          </div>
        </div>
      </CategoriesProvider>
    </ClerkProvider>
  );
}

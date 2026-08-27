import { CustomHeader } from "@/components/common/custom-header";
import { MobileNav } from "@/components/common/mobile-nav";
import { DashboardSidebar } from "@/components/common/dashboard-sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { esMX } from "@clerk/localizations";
import { CategoriesProvider } from "@/providers/categories-provider";
import {
  getCategoriesCached,
  getCategoryOptionsCached,
} from "@/features/categories/lib/get-categories-cached";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();

  // Fetched once here (also seeds the per-request cache Server Components
  // reuse via getCategoriesCached()/getCategoryOptionsCached()) and
  // handed to client components through context - see
  // providers/categories-provider.tsx.
  const [categories, options] = await Promise.all([
    getCategoriesCached(),
    getCategoryOptionsCached(),
  ]);

  return (
    <ClerkProvider localization={esMX}>
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

import { CustomHeader } from "@/components/common/custom-header";
import { MobileNav } from "@/components/common/mobile-nav";
import { DashboardSidebar } from "@/components/common/dashboard-sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { esMX } from "@clerk/localizations";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();
  return (
    <ClerkProvider localization={esMX}>
      <div className="min-h-dvh bg-background md:flex">
        <DashboardSidebar />
        {/* min-w-0 so this column can actually shrink below its content's
            intrinsic width next to the sidebar - without it a wide child
            (e.g. the envelopes table) pushes the whole flex row wider than
            the viewport instead of scrolling internally. */}
        <div className="min-w-0 flex-1">
          <CustomHeader />
          <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </ClerkProvider>
  );
}

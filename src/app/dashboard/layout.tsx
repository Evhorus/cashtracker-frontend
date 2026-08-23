import { CustomHeader } from "@/components/common/custom-header";
import { MobileNav } from "@/components/common/mobile-nav";
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
      <div className="min-h-dvh bg-background">
        <CustomHeader />
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </ClerkProvider>
  );
}

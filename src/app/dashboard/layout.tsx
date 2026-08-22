import { CustomHeader } from "@/components/common/CustomHeader";
import { MobileNav } from "@/components/common/MobileNav";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth.protect();
  return (
    <div className="min-h-screen bg-background">
      <CustomHeader />
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

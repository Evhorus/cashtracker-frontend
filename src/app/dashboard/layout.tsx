import { CustomHeader } from "@/shared/components/CustomHeader";
import { MobileNav } from "@/shared/components/MobileNav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <CustomHeader />
      <main className="container py-6 px-4 mx-auto pb-24 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

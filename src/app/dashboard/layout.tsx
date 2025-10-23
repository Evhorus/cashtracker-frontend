import { CustomHeader } from '@/shared/components/CustomHeader';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <CustomHeader />
      <main className="container py-6 px-4 mx-auto">{children}</main>
    </div>
  );
}

import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/common/page-header";
import { AccountView } from "@/features/account/components/account-view";

// Force dynamic rendering because this page uses Clerk auth, same as
// dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await auth.protect();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi cuenta"
        description="Gestiona tu perfil, contraseña y cuenta"
        backUrl="/dashboard"
      />
      <AccountView />
    </div>
  );
}

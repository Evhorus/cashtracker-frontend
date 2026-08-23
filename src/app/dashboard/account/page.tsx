import { auth } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/common/page-header";
import { AccountView } from "@/features/account/components/account-view";

// Force dynamic rendering because this page uses Clerk auth, same as
// dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await auth.protect();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Mi cuenta"
        description="Gestiona tu perfil, seguridad y cuenta"
        backUrl="/dashboard"
      />
      <AccountView />
    </div>
  );
}

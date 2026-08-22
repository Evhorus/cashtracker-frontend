import { auth } from "@clerk/nextjs/server";
import { getEnvelopesAction } from "@/features/envelopes/actions/get-envelopes.action";
import { EnvelopesGrid } from "@/features/envelopes/components/envelopes-grid";
import { CreateEnvelopeDialog } from "@/features/envelopes/components/create-envelope-dialog";
import { PageHeader } from "@/components/common/page-header";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

export default async function EnvelopesPage() {
  await auth.protect();
  const envelopes = await getEnvelopesAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Sobres"
        description="Gestiona todos tus sobres"
        backUrl="/dashboard"
        actions={<CreateEnvelopeDialog />}
        mobileActions={<CreateEnvelopeDialog />}
      />

      <EnvelopesGrid envelopes={envelopes.data} />
    </div>
  );
}

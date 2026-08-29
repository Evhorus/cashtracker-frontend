import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/common/page-header";
import { AccountView } from "@/features/account/components/account-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

// Force dynamic rendering because this page uses Clerk auth, same as
// dashboard/envelopes/page.tsx.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await auth.protect();
  const t = await getTranslations("account");

  return (
    // No mx-auto/max-w-* wrapper - every sibling page (Sobres,
    // Estadísticas, Resumen) just fills the layout's own container at
    // full width. This one used to cap itself narrower and center
    // within that, which both wasted space on wide viewports and made
    // the title visibly jump sideways when navigating here from any of
    // them (their left edge lines up with the container's; this one's
    // didn't, being centered inside it instead).
    <div className="space-y-6">
      {/* The title is hidden above md - the app header shows it there -
          but the subtitle stays, since the header carries no subtitle. */}
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        backUrl="/dashboard"
        hideTitleOnDesktop
      />
      <AccountView />
    </div>
  );
}

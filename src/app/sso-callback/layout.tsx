import { ClerkProvider } from "@clerk/nextjs";
import { getClerkLocalization } from "@/i18n/clerk-localization";

// Scoped ClerkProvider, same reasoning as (auth)/layout.tsx and
// dashboard/layout.tsx. This route is intentionally its own top-level
// segment (not under (auth)/) so it does NOT inherit that layout's
// "redirect away if already signed in" check - this is exactly the
// page where a session is being created, so it must be reachable
// mid-flow regardless of auth state.
export default async function SSOCallbackLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkLocalization = await getClerkLocalization();

  return (
    <ClerkProvider localization={clerkLocalization}>{children}</ClerkProvider>
  );
}

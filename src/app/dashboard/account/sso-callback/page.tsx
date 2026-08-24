import { auth } from "@clerk/nextjs/server";

import { SSOCallbackHandler } from "@/features/auth/components/sso-callback-handler";

// Dedicated callback route for linking a new OAuth provider from the
// account page (use-connected-accounts.ts) - kept separate from the
// public /sso-callback (sign-in/up) so a linking attempt, whether it
// succeeds or the user cancels/denies on the provider's own screen,
// lands back on Cuentas conectadas instead of the plain dashboard with
// no indication anything happened. This route sits under dashboard/ (and
// so behind dashboard/layout.tsx's auth.protect()) on purpose - linking
// only ever starts from an already-authenticated session, unlike
// sign-in/up's callback which runs before one exists. The explicit
// auth.protect() call below is redundant with the layout's own but
// required by this repo's lint rule (see account/page.tsx for the same).
export default async function AccountSSOCallbackPage() {
  await auth.protect();

  return (
    <SSOCallbackHandler
      signInFallbackRedirectUrl="/dashboard/account?section=connected"
      signUpFallbackRedirectUrl="/dashboard/account?section=connected"
    />
  );
}

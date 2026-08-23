// Shared by every hook in features/auth/hooks/ that finalizes a session
// (sign-in, sign-up, password reset). Structurally typed against Clerk's
// finalize() "navigate" callback shape instead of importing its type, so
// this file doesn't force a Clerk import outside the hooks that already
// need one.
export function navigateAfterAuth(
  router: { push: (url: string) => void },
  {
    session,
    decorateUrl,
  }: {
    session?: { currentTask?: unknown } | null;
    decorateUrl: (url: string) => string;
  },
) {
  // A pending session task (e.g. org selection) means the flow isn't
  // actually done yet - let the caller's own UI handle it instead of
  // navigating away.
  if (session?.currentTask) return;

  const url = decorateUrl("/dashboard");
  // decorateUrl can upgrade this to an absolute, different-origin URL
  // when a cross-domain cookie refresh is needed (Safari ITP) - that
  // case requires a real navigation, not client-side routing.
  if (url.startsWith("http")) {
    window.location.href = url;
  } else {
    router.push(url);
  }
}

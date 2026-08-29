import type { OAuthProvider } from "../types";

// The only place that knows Clerk's "oauth_google" naming - hooks call
// this instead of hardcoding Clerk strategy strings themselves.
const CLERK_STRATEGY: Record<OAuthProvider, "oauth_google" | "oauth_facebook"> =
  {
    google: "oauth_google",
    facebook: "oauth_facebook",
  };

export function toClerkStrategy(provider: OAuthProvider) {
  return CLERK_STRATEGY[provider];
}

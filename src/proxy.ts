import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk now deprecates auth-gating logic inside clerkMiddleware() (e.g.
// createRouteMatcher() + auth.protect() here) - middleware can be
// bypassed, which gives a false sense of security. Each protected
// resource checks auth() itself instead: dashboard/layout.tsx protects
// the app, and (home)/page.tsx + (auth)/layout.tsx redirect an
// already-signed-in visitor away from the public/auth pages.
export default clerkMiddleware();

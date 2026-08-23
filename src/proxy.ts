import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that only make sense for a signed-out visitor. Doing this
// redirect here (auth() reads the already-verified session, no network
// call) instead of inside each page lets "/" render as a fully static
// page, and keeps the sign-in/sign-up/forgot-password pages from ever
// showing a blank flash to an already-authenticated visitor.
const signedOutOnlyRoutes = ["/", "/sign-in", "/sign-up", "/forgot-password"];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const isSignedOutOnlyRoute = signedOutOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isSignedOutOnlyRoute) {
    const { isAuthenticated } = await auth();
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  // Send signed-in users straight to the dashboard from the public
  // landing page. Doing this here (auth() reads the already-verified
  // session, no network call) instead of via currentUser() in the page
  // lets "/" render as a fully static page for the (much more common)
  // signed-out/mobile visitor - no per-request Clerk lookup on the way
  // to first byte.
  if (req.nextUrl.pathname === "/") {
    const { isAuthenticated } = await auth();
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

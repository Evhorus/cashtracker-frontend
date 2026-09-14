import type { MetadataRoute } from "next";

import { env } from "@/shared/config/env.server";

// The public marketing page is the only thing worth crawling; /dashboard
// is behind auth and /sso-callback is a transient OAuth landing strip.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/sso-callback"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

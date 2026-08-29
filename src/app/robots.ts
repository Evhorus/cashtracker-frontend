import type { MetadataRoute } from "next";

// The public marketing page is the only thing worth crawling; /dashboard
// is behind auth and /sso-callback is a transient OAuth landing strip.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3001";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/sso-callback"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

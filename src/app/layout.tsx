import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { manrope, plexMono, sourceSerif } from "./fonts";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { ScrollToTop } from "@/components/common/scroll-to-top";

import "./globals.css";

// ClerkProvider intentionally lives in the (auth) and dashboard layouts
// instead of here - the public marketing routes never render a signed-in
// user, so they don't need Clerk's client bundle on the critical path.
// See: https://clerk.com/docs/reference/nextjs/errors/auth-was-called
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No `[locale]` route segment (see src/i18n/request.ts) - the locale
  // is resolved from a cookie server-side, so `<html lang>` has to ask
  // for it explicitly rather than reading a route param.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${manrope.variable} ${sourceSerif.variable} ${plexMono.variable}`}
    >
      {/* Font variables live on <html>, not <body>: globals.css's :root/.dark
          blocks (which target html) reference them (--font-sans: var(--font-manrope), ...)
          - defined one element lower, on body, they'd be invisible there and
          --font-sans would resolve to nothing. */}
      <body className="antialiased">
        <ScrollToTop />
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

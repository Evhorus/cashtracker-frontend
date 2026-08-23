import { geistMono, geistSans } from "./fonts";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { ScrollToTop } from "@/components/common/scroll-to-top";

import "./globals.css";

// ClerkProvider intentionally lives in the (auth) and dashboard layouts
// instead of here - the public marketing routes never render a signed-in
// user, so they don't need Clerk's client bundle on the critical path.
// See: https://clerk.com/docs/reference/nextjs/errors/auth-was-called
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollToTop />
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
      </body>
    </html>
  );
}

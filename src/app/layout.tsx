import { ClerkProvider } from "@clerk/nextjs";
import { geistMono, geistSans } from "@/shared/fonts/fonts";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/shared/components/ui/sonner";
import { esMX } from "@clerk/localizations";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { ScrollToTop } from "@/shared/components/scroll-to-top";

import "./globals.css";

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
        <ClerkProvider localization={esMX}>
          <ScrollToTop />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import { geistMono, geistSans } from "@/shared/fonts/fonts";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Toaster } from "@/shared/components/ui/sonner";
import { esMX } from "@clerk/localizations";
import { ThemeProvider } from "@/shared/providers/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esMX}>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
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
        </body>
      </html>
    </ClerkProvider>
  );
}

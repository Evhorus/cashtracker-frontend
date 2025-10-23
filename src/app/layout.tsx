import { ClerkProvider } from '@clerk/nextjs';
import { geistMono, geistSans } from '@/shared/fonts/fonts';
import './globals.css';
import { Toaster } from '@/shared/components/ui/sonner';
import { esMX } from '@clerk/localizations';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esMX}>
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

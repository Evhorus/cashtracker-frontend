import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
  title: 'CashTracker',
  description: 'CashTracker es la herramienta perfecta para quienes desean tener el control total de sus finanzas en la palma de su mano',
  openGraph: {
    title: 'CashTracker',
    images: ['/opengraph.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.className} antialiased`}>{children}</body>
    </html>
  );
}

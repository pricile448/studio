
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/dictionaries';
import { ThemeProviders } from './theme-providers';

const siteTitle = 'AmCbunq - Modern Banking';
const siteDescription = 'Votre avenir financier, simplifié et sécurisé.';

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  manifest: '/manifest.json',
  icons: {
    icon: 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1751655892/favicon-32x32_lcz5bt.png',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    url: 'https://mybunq.amccredit.com',
    images: [
      {
        url: 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1750897367/IM_5_xfdv9p.png',
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", process.env.NODE_ENV === 'development' ? 'debug-screens' : undefined)}>
        <ThemeProviders>
          {children}
        </ThemeProviders>
      </body>
    </html>
  );
}

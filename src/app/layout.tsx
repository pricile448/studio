
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/dictionaries';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AmCbunq - Modern Banking',
  description: 'A beautifully designed, modern banking experience with AI-powered financial insights.',
  icons: {
    icon: 'https://res.cloudinary.com/dxvbuhadg/image/upload/v1751655892/favicon-32x32_lcz5bt.png',
  },
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", process.env.NODE_ENV === 'development' ? 'debug-screens' : undefined)}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

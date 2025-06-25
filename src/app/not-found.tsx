
'use client';
import './globals.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This root not-found.js handles unmatched routes at the very top level.
// It will redirect to the default language's 404 page.
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the French 404 page by default if a top-level route is not found.
    router.replace('/fr/not-found');
  }, [router]);

  // Render a minimal loading state while redirecting.
  return (
     <html lang="fr" suppressHydrationWarning>
      <head>
        <title>404 - Page Introuvable</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased")}>
        <div className="flex h-screen w-full items-center justify-center bg-background">
           <p>Redirection...</p>
        </div>
      </body>
    </html>
  );
}

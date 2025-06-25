
import './globals.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// This root not-found.js handles unmatched routes at the very top level.
// It defines its own HTML structure as it replaces the root layout.
export default function NotFound() {
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
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="text-3xl font-bold tracking-tight">Page Introuvable</h2>
            <p className="max-w-md text-muted-foreground">
              La page que vous recherchez a peut-être été supprimée, a changé de nom ou est temporairement indisponible.
            </p>
            <Button asChild className="mt-4">
              <Link href="/fr">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

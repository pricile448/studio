
import './globals.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// This root not-found.js is responsible for rendering the 404 page for any unmatched routes.
// As it replaces the root layout, it needs to define the `<html>` and `<body>` tags.
export default function NotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>404 - Page Not Found</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased")}>
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
            <p className="max-w-md text-muted-foreground">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

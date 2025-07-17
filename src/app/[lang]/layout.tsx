
import type { Locale } from '@/lib/dictionaries';

// This layout now simply defines the dynamic language segments.
// The main HTML structure is in the root layout.tsx file.
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

// Layouts with dynamic params also need to be async and await the params promise.
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  // Although we don't use the lang param here, we must await it to satisfy the type.
  await params;
  
  // The root layout in /app/layout.tsx handles the main structure.
  // This component is now just for segmenting routes by language.
  return <>{children}</>;
}

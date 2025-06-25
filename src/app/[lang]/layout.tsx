
import type { Locale } from '@/lib/dictionaries';

// This layout now simply defines the dynamic language segments.
// The main HTML structure is in the root layout.tsx file.
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }, { lang: 'pt' }];
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  // The root layout in /app/layout.tsx handles the main structure.
  // This component is now just for segmenting routes by language.
  return <>{children}</>;
}
